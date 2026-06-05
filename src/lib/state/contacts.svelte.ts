import { deleteContact, toggleFavourite } from '$lib/api/contacts';
import type { ToastStore } from './toasts.svelte.ts';

export class ContactStore {
    contacts = $state<Contact[]>([]);
    private toastStore: ToastStore;

    constructor(initialContacts: Contact[], toastStore: ToastStore) {
        this.contacts = initialContacts;
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
        this.toastStore.add(message.text, message.type);
    }
}
