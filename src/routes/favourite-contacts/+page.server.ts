import type { PageServerLoad } from './$types';
import { contactService } from '$lib/server/services/contact.service';

export const load: PageServerLoad = async ({ locals }: any) => {
    const contacts = await contactService.listForUser(locals.user.id, { favouritesOnly: true });
    return { contacts };
};
