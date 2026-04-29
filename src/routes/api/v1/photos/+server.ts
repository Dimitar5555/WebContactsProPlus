import { json } from '@sveltejs/kit';
import { createUploadsDir, validateFile, saveFile } from '$lib/server/upload.js';

createUploadsDir();

// TODO: 
// Add photo to contact (if the contact is owned by the current user)
// If the contact already has a photo, delete the old one from disk to save space

/**
 * POST /api/v1/photos
 * Expects a photo file in the request body and saves it to disk, returning its URL.
 */
export async function POST({ request }) {
    const blob = await request.blob();
    
    if (!blob) {
        return json(errorBody('No file uploaded'), { status: 400 });
    }

    try {
        validateFile(blob);

        const fileUrl = await saveFile(blob);

        return json({ url: fileUrl }, { status: 201 });
    } 
    catch (err: any) {
        return json(errorBody(err.message), { status: 400 });
    }
}

function errorBody(err: string) {
    return {
        error:     err ?? 'An error occurred during file upload',
        timestamp: new Date().toISOString()
    };
}
