import type { PageServerLoad } from './$types';
import { database } from '$lib/database';

export const load: PageServerLoad = async ({ locals }) => {
    const contacts = await database.contacts.findMany({ where: { is_favourite: true }, userId: locals.user.id });

    return {
        contacts
    };
};
