import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

export async function handle({ event, resolve }) {
    const token = event.cookies.get('token');

    if (token) {
        try {
            const user = jwt.verify(token, JWT_SECRET);
            
            event.locals.user = {
                id: user.id,
                role: user.role
            };
        } 
        catch (err) {
            event.locals.user = null;
        }
    } 
    else {
        event.locals.user = null;
    }

    return await resolve(event);
}
