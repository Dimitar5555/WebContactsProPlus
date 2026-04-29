import type { PageServerLoad } from './$types';
import { database } from '$lib/database';

export const load: PageServerLoad = async ({ locals }): Promise<{ contacts: Contact[] }> => {
    const contacts = await database.contacts.findMany({userId: locals.user.id});
    
    return { contacts };
};
