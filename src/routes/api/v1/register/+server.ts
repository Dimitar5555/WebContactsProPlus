import { $_ } from '$lib/server/i18n';
import { database } from '$lib/database';
import { json } from '@sveltejs/kit';

export async function POST({ request }: { request: Request }) {
    const data = await request.formData();
    const username = data.get('username')?.toString().trim();
    const password = data.get('password')?.toString();
    const email = data.get('email')?.toString().trim();
    
    if (!username || !password || !email) {
        return json({
            success: false,
            message: $_('api.register.missing_credentials')
        });
    }

    const existingUserByEmail = await database.users.findByEmail(email);
    const existingUserByUsername = await database.users.findByUsername(username);
    if (existingUserByEmail || existingUserByUsername) {
        return json({
            success: false,
            message: $_('api.register.exists')
        });
    }

    await database.users.create({ username, password, email });
    return json({
        success: true,
        message: $_('api.register.success_registration')
    });
}
