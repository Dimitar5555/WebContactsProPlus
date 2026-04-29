import fs from 'fs';
import path from 'path';
import { uploadDir } from '$lib/server/upload.js';

const MIME: Record<string, string> = {
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png':  'image/png',
    '.gif':  'image/gif',
    '.webp': 'image/webp'
};

/**
 * GET /api/v1/photos/:filename
 * Streams the requested photo from disk.
 */
export function GET({ params }) {
    const filename = params.filename;
    const filePath = path.join(uploadDir, params.filename);

    if (filename.includes('..') || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        return new Response('Not Found', { status: 404 });
    }

    const ext = path.extname(params.filename).toLowerCase();
    const contentType = MIME[ext] ?? 'application/octet-stream';
    const buffer = fs.readFileSync(filePath);

    return new Response(buffer, {
        headers: {
            'Content-Type': contentType,
            'Content-Length': buffer.length.toString()
        }
    });
}
