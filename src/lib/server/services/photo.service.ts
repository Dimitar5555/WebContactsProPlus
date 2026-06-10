import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { contactRepository } from '../repositories/contact.repository';
import { NotFoundError, ValidationError } from '../errors';

const uploadDir = path.join(process.cwd(), 'photos');

const UPLOADS_LIMIT_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];
const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
};
const EXT_TO_MIME: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
};

function ensureUploadDir(): void {
    if(fs.existsSync(uploadDir)) {
        return;
    }
    try {
        fs.mkdirSync(uploadDir);
    }
    catch (err) {
        console.error('Error creating upload directory:', err);
        throw err;
    }
}

async function persistFile(blob: Blob): Promise<string> {
    ensureUploadDir();
    const ext = MIME_TO_EXT[blob.type];
    
    // Fallback protection if MIME type mapping fails
    if (!ext) {
        throw new ValidationError('api.photo.unsupported_format');
    }
    
    const id = uuidv4();
    const name = `${id}.${ext}`;
    const dest = path.join(uploadDir, name);
    const thumbDest = path.join(uploadDir, `thumb_${name}`);

    let buffer: Buffer;
    try {
        buffer = Buffer.from(await blob.arrayBuffer());
    } catch (err) {
        console.error('Failed to read blob arrayBuffer:', err);
        throw new ValidationError('api.photo.corrupt_file');
    }

    // Wrap image processing in a try/catch block
    try {
        // 1. Process Main Image
        await sharp(buffer)
            .rotate() // Handles auto-rotation from EXIF orientation
            .resize({ width: 1024, height: 1024, fit: 'inside' })
            .toFile(dest);

        // 2. Process Thumbnail
        await sharp(buffer)
            .rotate()
            .resize(200, 200, { fit: 'cover' })
            .toFile(thumbDest);
            
    } catch (sharpError: any) {
        console.error('Sharp processing failed:', sharpError);
        
        // Clean up files if one succeeded but the other failed
        await removePhotoFiles(name);
        
        // Throw a 400 validation error instead of crashing with a 500
        throw new ValidationError('api.photo.processing_failed' + JSON.stringify(sharpError));
    }

    return name;
}

async function removePhotoFiles(filename: string): Promise<void> {
    const filePath = path.join(uploadDir, filename);
    const thumbPath = path.join(uploadDir, `thumb_${filename}`);

    await Promise.allSettled([
        fs.promises.unlink(filePath),
        fs.promises.unlink(thumbPath)
    ]);
}

async function fetchOwnedContact(contactId: number, userId: number): Promise<Contact> {
    const contact = await contactRepository.findById(contactId);
    if(!contact || contact.user_id !== userId) {
        throw new NotFoundError();
    }
    return contact;
}

export const photoService = {
    init: ensureUploadDir,

    // Used by contact.service for cascade-delete; ownership is the caller's
    // responsibility.
    deletePhotoFiles: removePhotoFiles,

    attachToContact: async (contactId: number, userId: number, blob: Blob): Promise<string> => {
        if(!blob) {
            throw new ValidationError('api.photo.no_file_uploaded');
        }
        if(!ALLOWED_MIME_TYPES.includes(blob.type)) {
            throw new ValidationError('api.photo.invalid_file_type');
        }
        if(blob.size > UPLOADS_LIMIT_BYTES) {
            throw new ValidationError('api.photo.file_too_large');
        }

        const contact = await fetchOwnedContact(contactId, userId);
        const fileName = await persistFile(blob);

        if(contact.photo_url) {
            await removePhotoFiles(contact.photo_url);
        }

        await contactRepository.setPhotoUrl(contactId, fileName);
        return fileName;
    },

    removeFromContact: async (contactId: number, userId: number): Promise<void> => {
        const contact = await fetchOwnedContact(contactId, userId);
        if(!contact.photo_url) {
            throw new NotFoundError();
        }
        await removePhotoFiles(contact.photo_url);
        await contactRepository.setPhotoUrl(contactId, null);
    },

    readPhotoFile: (filename: string): { buffer: Buffer; contentType: string } => {
        let decoded: string;
        try {
            decoded = decodeURIComponent(filename);
        }
        catch {
            decoded = filename;
        }

        const uploadRoot = path.resolve(uploadDir);
        const resolvedPath = path.resolve(uploadRoot, decoded);
        if(
            !resolvedPath.startsWith(uploadRoot + path.sep) &&
            resolvedPath !== uploadRoot
        ) {
            throw new NotFoundError();
        }
        if(!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
            throw new NotFoundError();
        }

        const ext = path.extname(resolvedPath).toLowerCase();
        const contentType = EXT_TO_MIME[ext] ?? 'application/octet-stream';
        const buffer = fs.readFileSync(resolvedPath);
        return { buffer, contentType };
    }
};
