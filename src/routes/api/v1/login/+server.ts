import { type Cookies } from '@sveltejs/kit';
import { database } from '$lib/database';
import jwt from 'jsonwebtoken';
import * as env from '$env/static/private';
import { json, error } from '@sveltejs/kit';
import bcrypt from 'bcrypt';

export async function POST({
    request,
    cookies
}: {
    request: Request;
    cookies: Cookies;
}) {
    const data = await request.json();
    const username = data.username?.toString().trim();
    const password = data.password?.toString() ?? '';

    if(!username || !password) {
        return error(400, 'api.login.missing_credentials');
    }

    const user = await database.users.findByUsername(username);
    if(!user || !bcrypt.compareSync(password, user.password)) {
        return error(401, 'api.login.invalid_credentials');
    }

    const token = { id: user.id, username: user.username };
    const JWT_SECRET =
        (env as any).JWT_SECRET ?? process.env.JWT_SECRET ?? 'secret';
    const signed = jwt.sign(token, JWT_SECRET as any, { expiresIn: '1h' });
    cookies.set('token', signed, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 3600,
        path: '/'
    } as any);

    return json({ message: 'api.login.success' });
}
