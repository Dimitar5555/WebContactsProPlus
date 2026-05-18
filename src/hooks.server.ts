import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit'


import { locale } from 'svelte-i18n'


import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

const first: Handle = async ({ event, resolve }) => {
	const lang = event.cookies.get('lang')
	if(lang) {
		locale.set(lang)
	}
	return resolve(event);
}

const second: Handle = async ({ event, resolve, reject }) => {
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
            const decoded = jwt.verify(token, JWT_SECRET);
            event.locals.user = decoded;
        } 
        catch (err) {
            event.locals.user = null;
            return new Response('Redirecting', {status: 303, headers: { Location: '/login' }});
        }
    }
    return await resolve(event);
}

export const handle = sequence(first, second);
