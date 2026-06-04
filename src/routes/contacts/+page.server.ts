import type { PageServerLoad } from './$types';
import { database } from '$lib/database';

export const load: PageServerLoad = async ({
    locals
}: any): Promise<{ contacts: Contact[] }> => {
    const contacts = await database.contacts.findMany({
        userId: (locals.user as any).id
    });

    return { contacts };
};
