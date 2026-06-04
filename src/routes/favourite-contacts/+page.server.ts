import type { PageServerLoad } from './$types';
import { database } from '$lib/database';

export const load: PageServerLoad = async ({ locals }: any) => {
    const contacts = await database.contacts.findMany({
        where: { is_favourite: true },
        userId: (locals.user as any).id
    });

    return {
        contacts
    };
};
