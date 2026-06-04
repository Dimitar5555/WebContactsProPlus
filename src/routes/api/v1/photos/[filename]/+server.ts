import fs from 'fs';
import path from 'path';
import { uploadDir } from '$lib/server/photos.js';
import { error } from '@sveltejs/kit';

const MIME: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
};

/**
 * GET /api/v1/photos/:filename
 * Streams the requested photo from disk.
 */
export function GET({ params }) {
    const filename = params.filename;
    let decoded;
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
        return error(404, 'api.photos.not_found');
    }

    if(!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
        return error(404, 'api.photos.not_found');
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME[ext] ?? 'application/octet-stream';
    const buffer = fs.readFileSync(resolvedPath);

    return new Response(buffer, {
        headers: {
            'Content-Type': contentType,
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=86400'
        }
    });
}
