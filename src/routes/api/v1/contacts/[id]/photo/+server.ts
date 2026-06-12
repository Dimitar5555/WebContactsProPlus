import { json } from '@sveltejs/kit';
import { photoService } from '$lib/server/services/photo.service';
import { getAuthenticatedUser } from '$lib/server/auth';
import { rethrowAsHttp, ValidationError } from '$lib/server/errors';

photoService.init();

export async function POST({ request, locals, params }: any) {
    const user = getAuthenticatedUser(locals);
    const body = await request.formData();
    const blob = body.get('contact_photo') as Blob | null;

    if (!blob) {
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
