import { photoService } from '$lib/server/services/photo.service';
import { contactRepository } from '$lib/server/repositories/contact.repository';
import { getAuthenticatedUser } from '$lib/server/auth';
import { NotFoundError, rethrowAsHttp } from '$lib/server/errors';

export async function GET({ locals, params }) {
    const user = getAuthenticatedUser(locals);
    try {
        // photo_url stored on contacts is the main filename (no thumb_ prefix).
        // For thumbnail requests strip the prefix before the ownership lookup.
        const rawFilename = params.filename;
        const lookupFilename = rawFilename.startsWith('thumb_')
            ? rawFilename.slice('thumb_'.length)
            : rawFilename;

        const owner = await contactRepository.findByPhotoUrl(lookupFilename);
        if(!owner || owner.user_id !== user.id) {
            throw new NotFoundError();
        }

        const { buffer, contentType } = photoService.readPhotoFile(rawFilename);
        return new Response(new Uint8Array(buffer), {
            headers: {
                'Content-Type': contentType,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'private, max-age=3600'
            }
        });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}
