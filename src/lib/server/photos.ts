import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export const uploadDir = path.join(process.cwd(), 'photos');

const UPLOADS_LIMIT_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];

export function createUploadsDir() {
    if(fs.existsSync(uploadDir)) {
        return;
    }
    try {
        fs.mkdirSync(uploadDir);
    }
    catch (err) {
        console.error('Error creating upload directory:', err);
        process.exit(1);
    }
}

export function validateFile(blob: Blob): { valid: boolean; error?: string } {
    const type = blob.type;

    if(!ALLOWED_MIME_TYPES.includes(type)) {
        return { valid: false, error: 'Only image files are allowed' };
    }
    if(blob.size > UPLOADS_LIMIT_BYTES) {
        return { valid: false, error: 'File size exceeds the 5 MB limit' };
    }

    return { valid: true };
}

export async function saveFile(blob: Blob): Promise<string> {
    const mime = blob.type;
    const mapping: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp'
    };
    const ext = mapping[mime] ?? 'bin';
    const id = uuidv4();
    const name = `${id}.${ext}`;
    const dest = path.join(uploadDir, name);
    const thumbName = `thumb_${id}.${ext}`;
    const thumbDest = path.join(uploadDir, thumbName);

    const buffer = Buffer.from(await blob.arrayBuffer());

    // Resize main image to max 1024px (preserve aspect), strip metadata (EXIF)
    await sharp(buffer)
        .rotate()
        .resize({ width: 1024, height: 1024, fit: 'inside' })
        .toFile(dest);

    // Create thumbnail (cover crop)
    await sharp(buffer)
        .rotate()
        .resize(200, 200, { fit: 'cover' })
        .toFile(thumbDest);

    return name;
}

export async function deletePhoto(filename: string) {
    const filePath = path.join(uploadDir, filename);
    const thumbPath = path.join(uploadDir, `thumb_${filename}`);
    let success = true;

    await fs.unlink(filePath, err => {
        if(err) {
            console.error('Failed to delete file:', err);
            success = false;
        }
    });
    await fs.unlink(thumbPath, err => {
        if(err) {
            console.error('Failed to delete thumbnail:', err);
            success = false;
        }
    });
    return success;
}
