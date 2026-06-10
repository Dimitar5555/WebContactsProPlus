import { contactRepository } from '../repositories/contact.repository';
import { contactTagRepository } from '../repositories/contactTag.repository';
import { tagRepository } from '../repositories/tag.repository';
import { ConflictError, NotFoundError, ValidationError } from '../errors';

function normalizeLabel(label: string): string {
    return label.trim();
}

function validateColor(color: string): string {
    const normalized = color.trim();
    if(!/^#[0-9a-fA-F]{6}$/.test(normalized)) {
        throw new ValidationError('api.tags.invalid_color');
    }
    return normalized;
}

async function getOwnedTag(tagId: number, userId: number): Promise<Tag> {
    if(isNaN(tagId)) {
        throw new ValidationError('api.generic.invalid_id');
    }
    const tag = await tagRepository.findByIdAndUserId(tagId, userId);
    if(!tag) {
        throw new NotFoundError('api.tags.not_found');
    }
    return tag;
}

async function validateTagIds(userId: number, tagIds: number[]): Promise<number[]> {
    const uniqueTagIds = [...new Set(tagIds.filter((id) => !isNaN(id)))];
    const tags = await Promise.all(uniqueTagIds.map((id) => tagRepository.findByIdAndUserId(id, userId)));
    if(tags.some((tag) => !tag)) {
        throw new ValidationError('api.tags.invalid_tag');
    }
    return uniqueTagIds;
}

export const tagService = {
    listForUser: async (userId: number): Promise<Tag[]> => {
        return tagRepository.findManyByUserId(userId);
    },

    listForUserWithCounts: async (userId: number): Promise<TagWithCount[]> => {
        return tagRepository.findManyByUserIdWithCounts(userId);
    },

    listForUserWithCounts: async (userId: number): Promise<TagWithCount[]> => {
        return tagRepository.findManyByUserIdWithCounts(userId);
    },

    create: async (userId: number, input: { label?: string; color?: string }): Promise<Tag> => {
        const label = normalizeLabel(input.label ?? '');
        if(!label) {
            throw new ValidationError('api.tags.label_required');
        }
        const color = validateColor(input.color ?? '');
        try {
            const id = await tagRepository.create({ user_id: userId, label, color });
            return { id, user_id: userId, label, color };
        }
        catch (error) {
            if(error instanceof Error && 'code' in error && String((error as any).code).includes('SQLITE_CONSTRAINT')) {
                throw new ConflictError('api.tags.duplicate_label');
            }
            throw error;
        }
    },

    rename: async (tagId: number, userId: number, input: { label?: string; color?: string }): Promise<Tag> => {
        const tag = await getOwnedTag(tagId, userId);
        const label = normalizeLabel(input.label ?? '');
        if(!label) {
            throw new ValidationError('api.tags.label_required');
        }
        const color = validateColor(input.color ?? tag.color);
        try {
            await tagRepository.update(tagId, { label, color });
            return { ...tag, label, color };
        }
        catch (error) {
            if(error instanceof Error && 'code' in error && String((error as any).code).includes('SQLITE_CONSTRAINT')) {
                throw new ConflictError('api.tags.duplicate_label');
            }
            throw error;
        }
    },

    delete: async (tagId: number, userId: number): Promise<void> => {
        await getOwnedTag(tagId, userId);
        await tagRepository.delete(tagId);
    },

    listForContact: async (contactId: number, userId: number): Promise<Tag[]> => {
        const contact = await contactRepository.findById(contactId);
        if(!contact || contact.user_id !== userId) {
            throw new NotFoundError();
        }
        const rows = await tagRepository.findByContactIds([contactId]);
        return rows.map((tag) => ({
            id: tag.id,
            user_id: tag.user_id,
            label: tag.label,
            color: tag.color
        }));
    },

    replaceForContact: async (contactId: number, userId: number, tagIds: number[]): Promise<void> => {
        const contact = await contactRepository.findById(contactId);
        if(!contact || contact.user_id !== userId) {
            throw new NotFoundError();
        }
        const validatedTagIds = await validateTagIds(userId, tagIds);
        await contactTagRepository.replaceTags(contactId, validatedTagIds);
    },

    addToContact: async (contactId: number, userId: number, tagId: number): Promise<void> => {
        const contact = await contactRepository.findById(contactId);
        if(!contact || contact.user_id !== userId) {
            throw new NotFoundError();
        }
        const tag = await getOwnedTag(tagId, userId);
        await contactTagRepository.addTag(contactId, tag.id);
    },

    removeFromContact: async (contactId: number, userId: number, tagId: number): Promise<void> => {
        const contact = await contactRepository.findById(contactId);
        if(!contact || contact.user_id !== userId) {
            throw new NotFoundError();
        }
        await getOwnedTag(tagId, userId);
        await contactTagRepository.removeTag(contactId, tagId);
    }
};
