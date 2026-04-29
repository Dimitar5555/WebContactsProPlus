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
            message: 'Липсва потребителско име, имейл или парола'
        });
    }

    const existingUserByEmail = await database.users.findByEmail(email);
    const existingUserByUsername = await database.users.findByUsername(username);
    if (existingUserByEmail || existingUserByUsername) {
        return json({
            success: false,
            message: 'Потребител с това потребителско име или имейл вече съществува'
        });
    }

    await database.users.create({ username, password, email });
    return json({
        success: true,
        message: 'Потребителят беше регистриран успешно'
    });
}
