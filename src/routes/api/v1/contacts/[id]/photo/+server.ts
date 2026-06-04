import { json, error } from '@sveltejs/kit';
import { createUploadsDir, validateFile, saveFile, uploadDir } from '$lib/server/upload.js';
import path from 'path';
import { database } from '$lib/database';
import fs from 'fs';
import { getAuthenticatedUser } from '$lib/server/auth';
import { deletePhoto } from '$lib/server/photos';


createUploadsDir();

/**
 * POST /api/v1/contacts/:id/photo
 * Expects a photo file in the request body and saves it to disk, returning its URL.
 */
export async function POST({ request, locals, params }: any) {
    const user = getAuthenticatedUser(locals);
    const blob = await request.blob();
    const contactId = Number(params.id);
    
    if (!blob) {
        return error(400, 'api.generic.no_file_uploaded');
    }

    try {
        const validation = validateFile(blob);
        if (!validation.valid) {
            return error(400, validation.error ?? 'Invalid file');
        }

        const fileUrl = await saveFile(blob);

        const contact: Contact = await database.contactPhotos.findById(contactId);
        if(contact.user_id !== user.id) {
            return error(404, 'api.generic.not_found');
        }
        if (contact && contact.photo_url) {
            const oldPath = path.join(uploadDir, contact.photo_url);
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
        return error(400, err.message);
    }
}

export async function DELETE({ locals, params }: any) {
    const user = getAuthenticatedUser(locals);
    const contactId = Number(params.id);
    
    try {
        const contact: Contact = await database.contactPhotos.findById(contactId);
        if (!contact || !contact.photo_url || contact.user_id !== user.id) {
            return error(404, 'api.generic.not_found');
        }

        await deletePhoto(contact.photo_url);

        await database.contactPhotos.delete(contactId);

        return json({ message: 'api.generic.success' }, { status: 200 });
    }
    catch (err: any) {
        return error(500, 'api.generic.server_error');
    }
}
