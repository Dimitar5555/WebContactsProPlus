import { json, error } from '@sveltejs/kit';
import {
    createUploadsDir,
    validateFile,
    saveFile
} from '$lib/server/photos.js';
import { database } from '$lib/database';
import { getAuthenticatedUser } from '$lib/server/auth';
import { deletePhoto } from '$lib/server/photos';

createUploadsDir();

export async function POST({ request, locals, params }: any) {
    const user = getAuthenticatedUser(locals);
    const blob = await request.blob();
    const contactId = Number(params.id);

    if(!blob) {
        return error(400, 'api.photo.no_file_uploaded');
    }
    const contact = await database.contacts.findById(contactId);
    if(!contact || contact.user_id !== user.id) {
        return error(404, 'api.generic.not_found');
    }

    const validation = validateFile(blob);
    if(!validation.valid) {
        return error(400, validation.error);
    }

    const fileUrl = await saveFile(blob);
    if(contact.photo_url) {
        await deletePhoto(contact.photo_url);
    }

    await database.contactPhotos.create({
        contact_id: contactId,
        photo_url: fileUrl
    });

    return json({ url: fileUrl, message: 'api.photo.upload_success' }, { status: 201 });
}

export async function DELETE({ locals, params }: any) {
    const user = getAuthenticatedUser(locals);
    const contactId = Number(params.id);
    
    const contact = await database.contacts.findById(contactId);
    if(!contact || !contact.photo_url || contact.user_id !== user.id) {
        return error(404, 'api.generic.not_found');
    }

    await deletePhoto(contact.photo_url);

    await database.contactPhotos.delete(contactId);

    return json({ message: 'api.photo.delete_success' }, { status: 200 });
}
