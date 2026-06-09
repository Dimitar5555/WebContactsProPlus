import type { PageServerLoad } from './$types';
import { contactService } from '$lib/server/services/contact.service';

export const load: PageServerLoad = async ({ locals }: any): Promise<{ contacts: Contact[] }> => {
    const contacts = await contactService.listForUser(locals.user.id);
    return { contacts };
};
