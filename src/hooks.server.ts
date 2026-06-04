import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';
import { locale } from 'svelte-i18n';
import jwt from 'jsonwebtoken';
import * as env from '$env/static/private';

const first: Handle = async ({ event, resolve }) => {
    const lang = event.cookies.get('lang');
    if(lang) {
        locale.set(lang);
    }
    return await resolve(event);
};

const second: Handle = async ({ event, resolve }: any) => {
    const pathname = event.url.pathname;
    const token = event.cookies.get('token');

    if(token) {
        try {
            event.locals.user = jwt.verify(token, env.JWT_SECRET) as any;
        }
    catch {
            event.locals.user = null;
            event.cookies.delete('token', { path: '/' });
        }
    }

    const isPublic = ['/login', '/register'].includes(pathname);

    if(event.locals.user && isPublic) {
        throw redirect(303, '/contacts');
    }

    if(
        !event.locals.user &&
        ![
            '/login',
            '/register',
            '/',
            '/api/v1/login',
            '/api/v1/register'
        ].includes(pathname)
    ) {
        throw redirect(303, '/login');
    }

    return await resolve(event);
};

export const handle = sequence(first, second);
