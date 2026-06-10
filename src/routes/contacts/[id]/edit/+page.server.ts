import type { PageServerLoad } from './$types';
import { contactService } from '$lib/server/services/contact.service';
import { tagService } from '$lib/server/services/tag.service';
import { DomainError } from '$lib/server/errors';

export const load: PageServerLoad = async ({
    locals,
    params
}: any): Promise<{ contact: ContactWithPhones; tags: Tag[] } | Record<string, never>> => {
    if(!locals.user) {
        return {};
    }
    const contactId = parseInt(params.id);
    if(isNaN(contactId)) {
        return {};
    }
    try {
        const [contact, tags] = await Promise.all([
            contactService.getOwnedWithPhones(contactId, locals.user.id),
            tagService.listForUser(locals.user.id)
        ]);
        return { contact, tags };
    }
    catch (e) {
        if(e instanceof DomainError) {
            return {};
        }
        throw e;
    }
};
