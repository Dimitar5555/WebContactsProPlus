import type { PageServerLoad } from './$types';
import { contactService } from '$lib/server/services/contact.service';
import { DomainError } from '$lib/server/errors';

export const load: PageServerLoad = async ({
    locals,
    params
}: any): Promise<{ contact: Contact; phone_numbers: PhoneNumber[] } | Record<string, never>> => {
    if(!locals.user) {
        return {};
    }
    const contactId = parseInt(params.id);
    if(isNaN(contactId)) {
        return {};
    }
    try {
        return await contactService.getOwnedWithPhones(contactId, locals.user.id);
    }
    catch (e) {
        if(e instanceof DomainError) {
            return {};
        }
        throw e;
    }
};
