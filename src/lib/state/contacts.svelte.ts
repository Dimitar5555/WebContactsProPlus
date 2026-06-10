import { deleteContact, toggleFavourite } from '$lib/api/contacts';
import { addTagToContact, removeTagFromContact } from '$lib/api/tags';
import type { ToastStore } from './toasts.svelte.ts';

export class ContactStore {
    contacts = $state<Contact[]>([]);
    tags = $state<Tag[]>([]);
    private toastStore: ToastStore;

    constructor(initialContacts: Contact[], initialTags: Tag[], toastStore: ToastStore) {
        this.contacts = initialContacts;
        this.tags = initialTags;
        this.toastStore = toastStore;
    }

    async delete(id: number) {
        const message = await deleteContact(id);
        if(message.type === 'success') {
            this.contacts = this.contacts.filter(c => c.id !== id);
            this.toastStore.add('contacts.deleteSuccess', 'success');
        }
        else {
            this.toastStore.add('contacts.deleteFailed', 'error');
        }
        return message;
    }

    async toggleFav(id: number) {
        const message = await toggleFavourite(id);
        if(message.type === 'success') {
            const contact = this.contacts.find(c => c.id === id);
            if(contact) {
                contact.is_favourite = !contact.is_favourite;
            }
        }
        this.toastStore.add(message.message, message.type);
    }

    async toggleTag(contactId: number, tagId: number) {
        const contact = this.contacts.find((item) => item.id === contactId);
        if(!contact) {
            return;
        }
        const hasTag = (contact.tags || []).some((tag) => tag.id === tagId);
        const message = hasTag
            ? await removeTagFromContact(contactId, tagId)
            : await addTagToContact(contactId, tagId);
        if(message.type === 'success') {
            const tag = this.tags.find((item) => item.id === tagId);
            if(tag) {
                contact.tags = contact.tags || [];
                if(hasTag) {
                    contact.tags = contact.tags.filter((item) => item.id !== tagId);
                }
                else {
                    contact.tags = [...contact.tags.filter((item) => item.id !== tagId), tag];
                }
            }
        }
        this.toastStore.add(message.message, message.type);
    }
}
