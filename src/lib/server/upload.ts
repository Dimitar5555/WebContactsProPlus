import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const uploadDir = 'photos';

const UPLOADS_LIMIT_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function createUploadsDir() {
    if (fs.existsSync(uploadDir)) {
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

export function validateFile(blob: Blob): { valid: boolean, error?: string } {
    const type = blob.type;

    if (!ALLOWED_MIME_TYPES.includes(type)) {
        return { valid: false, error: 'Only image files are allowed' };
    }
    if (blob.size > UPLOADS_LIMIT_BYTES) {
        return { valid: false, error: 'File size exceeds the 5 MB limit' };
    }

    return { valid: true };
}

export async function saveFile(blob: Blob): Promise<string> {
    const ext  = blob.type.split("/")[1];
    const name = `${uuidv4()}.${ext}`;
    const dest = path.join(uploadDir, name);

    const buffer = Buffer.from(await blob.arrayBuffer());
    fs.writeFileSync(dest, buffer);

    return name;
}
