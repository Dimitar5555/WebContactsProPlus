import { contactRepository } from '../repositories/contact.repository';
import { phoneNumberRepository } from '../repositories/phoneNumber.repository';
import { photoService } from './photo.service';
import { NotFoundError, ValidationError } from '../errors';

type PhoneNumberInput = {
    id?: number | null;
    phone_number: string;
    label?: phoneNumberLabel | null;
};

type ContactInput = {
    first_name?: string;
    last_name?: string;
    notes?: string | null;
    phone_numbers?: PhoneNumberInput[];
};

async function getOwnedContact(contactId: number, userId: number): Promise<Contact> {
    if(isNaN(contactId)) {
        throw new ValidationError('api.generic.invalid_id');
    }
    const contact = await contactRepository.findById(contactId);
    if(!contact || contact.user_id !== userId) {
        throw new NotFoundError();
    }
    return contact;
}

async function syncPhoneNumbers(contactId: number, incoming: PhoneNumberInput[]): Promise<void> {
    const existing = await phoneNumberRepository.findByContactId(contactId);
    const existingIds = existing.map(pn => pn.id);
    const incomingIds = incoming
        .map(pn => pn.id)
        .filter((id): id is number => id != null);

    for(const item of incoming) {
        if(!item.phone_number) {
            continue;
        }
        if(item.id && existingIds.includes(item.id)) {
            await phoneNumberRepository.update(item.id, {
                phone_number: item.phone_number,
                label: item.label ?? null
            });
        }
        else {
            await phoneNumberRepository.create({
                contact_id: contactId,
                phone_number: item.phone_number,
                label: item.label ?? null
            });
        }
    }

    for(const id of existingIds) {
        if(!incomingIds.includes(id)) {
            await phoneNumberRepository.delete(id);
        }
    }
}

export const contactService = {
    listForUser: async (userId: number, opts: { favouritesOnly?: boolean } = {}): Promise<Contact[]> => {
        return contactRepository.findMany({
            userId,
            where: opts.favouritesOnly ? { is_favourite: true } : undefined
        });
    },

    getOwned: async (contactId: number, userId: number): Promise<Contact> => {
        return getOwnedContact(contactId, userId);
    },

    getOwnedWithPhones: async (contactId: number, userId: number): Promise<{ contact: Contact; phone_numbers: PhoneNumber[] }> => {
        const contact = await getOwnedContact(contactId, userId);
        const phone_numbers = await phoneNumberRepository.findByContactId(contactId);
        return { contact, phone_numbers };
    },

    create: async (userId: number, input: ContactInput): Promise<number> => {
        const { first_name, last_name, notes, phone_numbers = [] } = input;
        if(!first_name || !last_name) {
            throw new ValidationError('api.contacts.missing_fields');
        }

        const newId = await contactRepository.create({
            user_id: userId,
            first_name,
            last_name,
            notes: notes ?? null
        });

        for(const item of phone_numbers) {
            if(item.phone_number) {
                await phoneNumberRepository.create({
                    contact_id: newId,
                    phone_number: item.phone_number,
                    label: item.label ?? null
                });
            }
        }

        return newId;
    },

    update: async (contactId: number, userId: number, input: ContactInput): Promise<void> => {
        const { first_name, last_name, notes, phone_numbers = [] } = input;
        if(isNaN(contactId) || !first_name || !last_name) {
            throw new ValidationError('api.contacts.missing_fields');
        }

        const existing = await getOwnedContact(contactId, userId);

        await contactRepository.update(contactId, {
            first_name,
            last_name,
            is_favourite: existing.is_favourite,
            notes: notes ?? null
        });

        await syncPhoneNumbers(contactId, phone_numbers);
    },

    delete: async (contactId: number, userId: number): Promise<void> => {
        const contact = await getOwnedContact(contactId, userId);
        if(contact.photo_url) {
            await photoService.deletePhotoFiles(contact.photo_url);
        }
        await contactRepository.delete(contactId);
    },

    toggleFavourite: async (contactId: number, userId: number): Promise<{ oldState: boolean; newState: boolean; messageKey: string }> => {
        const contact = await getOwnedContact(contactId, userId);
        const oldState = Boolean(contact.is_favourite);
        const newState = !oldState;
        await contactRepository.setFavourite(contactId, newState);
        return {
            oldState,
            newState,
            messageKey: newState ? 'api.contacts.favourite.added' : 'api.contacts.favourite.removed'
        };
    }
};
