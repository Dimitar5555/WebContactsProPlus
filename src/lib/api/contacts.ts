import { _ } from "svelte-i18n";
import { get } from 'svelte/store'

const $_ = get(_);

export async function toggleFavourite(contactId: number): Promise<Message> {
    try {
        const response = await fetch(`/api/v1/contacts/${contactId}/favourite`, { method: 'PATCH' });
        const data = await response.json();
        if(data.success) {
            return {
                text: data.newState ? $_('contacts.marked_favourite') : $_('contacts.unmarked_favourite'),
                type: 'success'
            };
        }
        else {                
            return {
                text: $_(data.error),
                type: 'error'
            };
        }
    }
    catch (error) {
        return {
            text: error.message,
            type: 'error'
        };
    }
}

export async function deleteContact(contactId: number): Promise<Message> {
    if(!confirm($_('contacts.confirm_delete'))) {
        return {
            text: $_('contacts.delete_cancelled'),
            type: 'error'
        };
    }
    try {
        const [photoRes, contactRes] = await Promise.all([
            fetch(`/api/v1/contacts/${contactId}/photo`, { method: 'DELETE' }),
            fetch(`/api/v1/contacts/${contactId}`, { method: 'DELETE' })
        ]);

        if(contactRes.ok) {
            return {
                text: $_('contacts.delete_success'),
                type: 'success'
            };
        }
        throw new Error('Failed to delete contact');
    }
    catch (error) {
        return {
            text: $_('contacts.delete_error1'),
            type: 'error'
        };
    }
}
