import type { PageServerLoad } from './$types';
import { database } from '$lib/database';

export const load: PageServerLoad = async ({
    locals,
    params
}): Promise<{ contact: Contact; phone_numbers: PhoneNumber[] }> => {
    if(!locals.user) {
        return {} as any;
    }
    const contact_id = parseInt(params.id);
    if(isNaN(contact_id)) {
        return {} as any;
    }
    const contact = await database.contacts.findById(
        contact_id,
        locals.user.id
    );
    if(!contact) {
        return {} as any;
    }

    const phone_numbers =
        await database.phoneNumbers.findByContactId(contact_id);

    return { contact, phone_numbers };
};
