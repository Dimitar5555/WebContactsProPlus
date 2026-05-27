import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit'


import { locale } from 'svelte-i18n'


import jwt from 'jsonwebtoken';
import * as env from '$env/static/private';

const first: Handle = async ({ event, resolve }) => {
	const lang = event.cookies.get('lang')
	if(lang) {
		locale.set(lang)
	}
	return resolve(event);
}

const second: Handle = async ({ event, resolve }: any) => {
    const pathname = event.url.pathname;
    const publicPaths = ['/login', '/register', '/about', '/favicon.ico', '/api/v1/login', '/api/v1/register'];
    const isPublic = publicPaths.includes(pathname);
    if(isPublic) {
        console.log('Public path accessed:', pathname);
    }
    else if(!event.locals.user) {
        console.log('Protected path accessed:', pathname);
        const token = event.cookies.get('token');
        if(!token) {
            event.locals.user = null;
            return new Response('Redirecting', {status: 303, headers: { Location: '/login' }});
        }
        try {
            const JWT_SECRET = (env as any).JWT_SECRET ?? process.env.JWT_SECRET ?? 'secret';
            const decoded = jwt.verify(token, JWT_SECRET as any);
            event.locals.user = decoded as any;
        }
        catch (err) {
            event.locals.user = null;
            return new Response('Redirecting', {status: 303, headers: { Location: '/login' }});
        }
    }
    return await resolve(event);
}

export const handle = sequence(first, second);
