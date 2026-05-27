import { $_ } from '$lib/server/i18n';

import { type Cookies } from '@sveltejs/kit';
import { database } from '$lib/database';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';

export async function POST({ request, cookies }: { request: Request, cookies: Cookies }) {
    const data = await request.formData();
    const username = data.get('username')?.toString().trim();
    const password = data.get('password');

    if (!username || !password) {
        return json({ success: false, message: $_('api.login.missing_credentials') });
    }

    const user = await database.users.findByUsername(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return json({ success: false, message: $_('api.login.invalid_credentials') });
    }

    const token = { id: user.id, username: user.username };
    const signed = jwt.sign(token, JWT_SECRET, { expiresIn: '1h' });
    cookies.set('token', signed, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 3600,
        path: '/'
    } as any);

    return json({ success: true, message: $_('api.login.success') });
}
