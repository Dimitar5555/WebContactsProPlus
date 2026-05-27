import type { PageServerLoad } from './$types';
import { database } from '$lib/database';

export const load: PageServerLoad = async ({ locals, params }: any): Promise<{ contact: Contact, phone_numbers: PhoneNumber[] }> => {
    const contact_id = parseInt(params.id);
    const contact = await database.contacts.findById(contact_id, (locals.user as any).id);
    if(!contact) {
        return {} as any;
    }
    
    const phone_numbers: PhoneNumber[] = (await database.phoneNumbers.findByContactId(contact_id)) as any;

    return { contact, phone_numbers };
}
