import { photoService } from '$lib/server/services/photo.service';
import { rethrowAsHttp } from '$lib/server/errors';

export function GET({ params }) {
    try {
        const { buffer, contentType } = photoService.readPhotoFile(params.filename);
        return new Response(new Uint8Array(buffer), {
            headers: {
                'Content-Type': contentType,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=86400'
            }
        });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}
