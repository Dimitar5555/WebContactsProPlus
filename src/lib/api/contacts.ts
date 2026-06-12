import { _ } from 'svelte-i18n';
import { get } from 'svelte/store';

const $_ = get(_);

export async function toggleFavourite(contactId: number): Promise<Message> {
    try {
        const response = await fetch(
            `/api/v1/contacts/${contactId}/favourite`,
            {
                method: 'PATCH'
            }
        );
        const data = await response.json();
        if(response.ok) {
            return {
                message: data.message,
                type: 'success'
            };
        }
        else {
            return {
                message: data.message,
                type: 'error'
            };
        }
    }
    catch (error) {
        return {
            message: 'api.generic.server_error',
            type: 'error'
        };
    }
}

export async function deleteContact(contactId: number): Promise<Message> {
    if(!confirm($_('contacts.confirm_delete'))) {
        return {
            message: 'contacts.delete_cancelled',
            type: 'error'
        };
    }
    try {
        const [photoRes, contactRes] = await Promise.all([
            fetch(`/api/v1/contacts/${contactId}/photo`, { method: 'DELETE' }),
            fetch(`/api/v1/contacts/${contactId}`, { method: 'DELETE' })
        ]);

        if(contactRes.ok && photoRes.ok) {
            return {
                message: 'api.contacts.delete.success',
                type: 'success'
            };
        }
        throw new Error('Failed to delete contact');
    }
    catch (error) {
        return {
            message: 'api.contacts.delete.failed',
            type: 'error'
        };
    }
}

export async function validateContactForm(data: FormData): Promise<Message> {
    const first_name = data.get('first_name') as string | null;
    const last_name = data.get('last_name') as string | null;
    const phone_numbers = JSON.parse(data.get('phone_numbers') as string || '[]') as { phone_number: string }[];
    if(first_name?.trim() === '' || last_name?.trim() === '') {
        return {
            message: 'contacts.errors.name_required',
            type: 'error'
        };
    }
    if(phone_numbers.some((pn) => pn.phone_number.trim() === '')) {
        return {
            message: 'contacts.errors.phone_number_required',
            type: 'error'
        };
    }
    const phoneRegex = /^\+\d{3,15}$/;
    if(phone_numbers.some((pn) => !phoneRegex.test(pn.phone_number.trim()))) {
        return {
            message: 'contacts.errors.phone_number_invalid',
            type: 'error'
        };
    }
    return {
        message: '',
        type: 'success'
    };
}

export async function uploadContactPhoto(contactId: number, file: File): Promise<Message> {
    const formData = new FormData();
    formData.append('contact_photo', file);
    const photoRes = await fetch(`/api/v1/contacts/${contactId}/photo`, {
        method: 'POST',
        body: formData
    });
    const data = await photoRes.json();
    return {
        message: data.message,
        type: photoRes.ok ? 'success' : 'error'
    };
}

export async function updateContact(contact: FormData): Promise<Message> {
    const response = await fetch(`/api/v1/contacts/${contact.get('id')}`, {
        method: 'PUT',
        body: contact
    });
    const resData = await response.json();
    return {
        message: resData.message,
        type: response.ok ? 'success' : 'error'
    };
}

export async function createContact(data: FormData): Promise<{message: Message, contactId?: number}> {
    const response = await fetch('/api/v1/contacts', {
        method: 'POST',
        body: data
    });
    const resData = await response.json();
    if(response.ok) {
        return {
            message: {
                message: resData.message,
                type: 'success'
            },
            contactId: resData.contactId
        };
    }
    else {
        return {
            message: {
                message: resData.message,
                type: 'error'
            }
        }
    }
}

export async function removeContactPhoto(contactId: number): Promise<Message> {
    const response = await fetch(`/api/v1/contacts/${contactId}/photo`, {
        method: 'DELETE'
    });
    const resData = await response.json();
    return {
        message: resData.message,
        type: response.ok ? 'success' : 'error'
    };
}