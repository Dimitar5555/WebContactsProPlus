import { json } from '@sveltejs/kit';
import { createUploadsDir, validateFile, saveFile, uploadDir } from '$lib/server/upload.js';
import path from 'path';
import { database } from '$lib/database';
import fs from 'fs';


createUploadsDir();

/**
 * POST /api/v1/contacts/:id/photo
 * Expects a photo file in the request body and saves it to disk, returning its URL.
 */
export async function POST({ request, locals, params }: any) {
    if(!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const blob = await request.blob();
    const contactId = Number(params.id);
    
    if (!blob) {
        return json(errorBody('No file uploaded'), { status: 400 });
    }

    try {
        const validation = validateFile(blob);
        if (!validation.valid) {
            return json(errorBody(validation.error ?? 'Invalid file'), { status: 400 });
        }

        const fileUrl = await saveFile(blob);

        const existingPhoto: any = await database.contactPhotos.findById(contactId);
        if (existingPhoto && existingPhoto.photo_url) {
            const oldPath = path.join(uploadDir, existingPhoto.photo_url);
            fs.unlink(oldPath, (err) => {
                if (err) {
                    console.error('Failed to delete old photo:', err);
                }
            });
        }

        await database.contactPhotos.create({ contact_id: contactId, photo_url: fileUrl });

        return json({ url: fileUrl }, { status: 201 });
    }
    catch (err: any) {
        return json(errorBody(err.message), { status: 400 });
    }
}

export async function DELETE({ locals, params }: any) {
    if(!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const contactId = Number(params.id);
    
    try {
        const existingPhoto: any = await database.contactPhotos.findById(contactId);
        if (!existingPhoto || !existingPhoto.photo_url) {
            return json(errorBody('No photo found for this contact'), { status: 404 });
        }

        const filePath = path.join(uploadDir, existingPhoto.photo_url);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Failed to delete photo:', err);
            }
        });

        await database.contactPhotos.delete(contactId);

        return json({ message: 'Photo deleted successfully' }, { status: 200 });
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
