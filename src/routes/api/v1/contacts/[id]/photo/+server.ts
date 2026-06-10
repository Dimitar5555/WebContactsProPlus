import { json } from '@sveltejs/kit';
import { photoService } from '$lib/server/services/photo.service';
import { getAuthenticatedUser } from '$lib/server/auth';
import { rethrowAsHttp } from '$lib/server/errors';

photoService.init();

export async function POST({ request, locals, params }: any) {
    const user = getAuthenticatedUser(locals);
    const blob = await request.blob();
    try {
        const url = await photoService.attachToContact(Number(params.id), user.id, blob);
        return json({ url, message: 'api.photo.upload_success' }, { status: 201 });
    }
    catch (e) {
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
