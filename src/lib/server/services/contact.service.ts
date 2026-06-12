import { contactRepository } from '../repositories/contact.repository';
import { contactTagRepository } from '../repositories/contactTag.repository';
import { phoneNumberRepository } from '../repositories/phoneNumber.repository';
import { tagRepository } from '../repositories/tag.repository';
import { persistFile, photoService, validatePhotoBlob } from './photo.service';
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
    tags?: Tag[];
};

function isValidPhoneNumber(phone: string): boolean {
    return /^\+\d{3,15}$/.test((phone || '').trim());
}

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
        if(!isValidPhoneNumber(item.phone_number)) {
            throw new ValidationError('api.contacts.invalid_phone_number');
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

async function syncContactTags(contactId: number, userId: number, incoming: Tag[] = []): Promise<void> {
    const incomingIds = [...new Set(incoming.map((tag) => tag.id).filter((id) => !isNaN(id)))];
    const tags = await Promise.all(incomingIds.map((id) => tagRepository.findByIdAndUserId(id, userId)));
    if(tags.some((tag) => !tag)) {
        throw new ValidationError('api.tags.invalid_tag');
    }
    await contactTagRepository.replaceTags(contactId, incomingIds);
}

async function loadTagsForContacts(contacts: Contact[]): Promise<Contact[]> {
    if(contacts.length === 0) {
        return contacts;
    }

    const rows = await tagRepository.findByContactIds(contacts.map((contact) => contact.id));
    const tagsByContactId = new Map<number, Tag[]>();

    for(const row of rows) {
        const current = tagsByContactId.get(row.contact_id) || [];
        current.push({
            id: row.id,
            user_id: row.user_id,
            label: row.label,
            color: row.color
        });
        tagsByContactId.set(row.contact_id, current);
    }

    return contacts.map((contact) => ({
        ...contact,
        tags: tagsByContactId.get(contact.id) || []
    }));
}

export const contactService = {
    listForUser: async (userId: number, opts: { favouritesOnly?: boolean; tagId?: number } = {}): Promise<Contact[]> => {
        const contacts = await contactRepository.findMany({
            userId,
            where: opts.favouritesOnly ? { is_favourite: true } : undefined,
            tagId: opts.tagId
        });
        return loadTagsForContacts(contacts);
    },

    getOwned: async (contactId: number, userId: number): Promise<Contact> => {
        return getOwnedContact(contactId, userId);
    },

    getOwnedWithPhones: async (contactId: number, userId: number): Promise<ContactWithPhones> => {
        const contact = await getOwnedContact(contactId, userId);
        const [phone_numbers, tags] = await Promise.all([
            phoneNumberRepository.findByContactId(contactId),
            tagRepository.findByContactIds([contactId])
        ]);
        return {
            ...contact,
            phone_numbers,
            tags: tags.map((tag) => ({
                id: tag.id,
                user_id: tag.user_id,
                label: tag.label,
                color: tag.color
            }))
        };
    },

    create: async (userId: number, input: CreateContactPayload): Promise<number> => {
        const { first_name, last_name, notes, phone_numbers = [], tags = [] } = input;
        if(!first_name || !last_name) {
            throw new ValidationError('api.contacts.missing_fields');
        }

        for(const item of phone_numbers) {
            if(item.phone_number && !isValidPhoneNumber(item.phone_number)) {
                throw new ValidationError('api.contacts.invalid_phone_number');
            }
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

        if(tags.length > 0) {
            await syncContactTags(newId, userId, tags);
        }

        return newId;
    },

    update: async (contactId: number, userId: number, input: FormData): Promise<void> => {
        const first_name = input.get('first_name') as string | null;
        const last_name = input.get('last_name') as string | null;
        const notes = input.get('notes') as string | null;
        const phone_numbers = JSON.parse(input.get('phone_numbers') as string || '[]') as PhoneNumberInput[];
        const tags = JSON.parse(input.get('tags') as string || '[]') as Tag[];
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
        await syncContactTags(contactId, userId, tags);
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
    },

    createWithPhoto: async (userId: number, payload: FormData, fileBlob: Blob | null): Promise<number> => {
        const first_name = payload.get('first_name') as string | null;
        const last_name = payload.get('last_name') as string | null;
        const notes = payload.get('notes') as string | null;
        const phone_numbers = JSON.parse(payload.get('phone_numbers') as string || '[]') as PhoneNumberInput[];
        const tags = JSON.parse(payload.get('tags') as string || '[]') as Tag[];
        
        if(!first_name || !last_name) {
            throw new ValidationError('api.contacts.missing_fields');
        }

        for(const item of phone_numbers) {
            if(item.phone_number && !isValidPhoneNumber(item.phone_number)) {
                throw new ValidationError('api.contacts.invalid_phone_number');
            }
        }

        if (fileBlob) {
            validatePhotoBlob(fileBlob);
        }

        const newId = await contactRepository.create({
            user_id: userId,
            first_name,
            last_name,
            notes: notes
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

        if(tags.length > 0) {
            await syncContactTags(newId, userId, tags);
        }

        if (fileBlob) {
            try {
                const fileName = await persistFile(fileBlob);
                await contactRepository.setPhotoUrl(newId, fileName);
            } catch (err) {
                await contactRepository.delete(newId);
                throw err;
            }
        }

        return newId;
    }
};
