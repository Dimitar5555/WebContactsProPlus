import { json } from '@sveltejs/kit';
import { photoService } from '$lib/server/services/photo.service';
import { getAuthenticatedUser } from '$lib/server/auth';
import { rethrowAsHttp, ValidationError } from '$lib/server/errors';

photoService.init();

export async function POST({ request, locals, params }: any) {
    const user = getAuthenticatedUser(locals);
    let blob: Blob | null = null;
    // Try extracting a file from multipart FormData first (common browser uploads)
    try {
        if (typeof request.formData === 'function') {
            const formData = await request.formData();
            const possible = formData.get('photo') ?? formData.get('file') ?? formData.get('image');
            if (possible && typeof (possible as any).arrayBuffer === 'function') {
                blob = possible as Blob;
            }
        }
    }
    catch (err) {
        console.error('Failed to parse formData for photo upload, will fallback to blob():', err);
    }

    if (!blob) {
        try {
            blob = await request.blob();
        }
        catch (err) {
            console.error('Failed to read request.blob() for photo upload:', err);
            throw err;
        }
    }

    if (!blob) {
        console.error('No file provided in upload request');
        throw new ValidationError('api.photo.no_file_uploaded');
    }

    try {
        const url = await photoService.attachToContact(Number(params.id), user.id, blob);
        return json({ url, message: 'api.photo.upload_success' }, { status: 201 });
    }
    catch (e) {
        console.error('Photo upload failed for contact %s by user %s:', params.id, user?.id, e);
        rethrowAsHttp(e);
    }
}

export async function DELETE({ locals, params }: any) {
    const user = getAuthenticatedUser(locals);
    try {
        await photoService.removeFromContact(Number(params.id), user.id);
        return json({ message: 'api.photo.delete_success' }, { status: 200 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}
