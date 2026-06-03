import { deleteContact, toggleFavourite } from "$lib/api/contacts";

export class ContactStore {
    contacts = $state<Contact[]>([]);

    constructor(initialContacts: Contact[]) {
        this.contacts = initialContacts;
    }

    async delete(id: number) {
        const message = await deleteContact(id);
        if (message.type === 'success') {
            this.contacts = this.contacts.filter(c => c.id !== id);
        }
        return message;
    }

    async toggleFav(id: number) {
        const message = await toggleFavourite(id);
        if (message.type === 'success') {
            const contact = this.contacts.find(c => c.id === id);
            if (contact) {
                contact.is_favourite = !contact.is_favourite;
            }
        }
        return message;
    }
}
