async function parsePayload(response: Response): Promise<any> {
    const data = await response.json();
    return data;
}

export async function listTags(): Promise<{ tags: Tag[] }> {
    const response = await fetch('/api/v1/tags');
    return response.json();
}

export async function createTag(payload: { label: string; color: string }): Promise<{ message: Message; tag?: Tag }> {
    try {
        const response = await fetch('/api/v1/tags', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await parsePayload(response);
        return {
            message: { message: data.message, type: response.ok ? 'success' : 'error' },
            tag: data.tag
        };
    }
    catch {
        return { message: { message: 'api.generic.server_error', type: 'error' } };
    }
}

export async function renameTag(tagId: number, payload: { label: string; color: string }): Promise<{ message: Message; tag?: Tag }> {
    try {
        const response = await fetch(`/api/v1/tags/${tagId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        const data = await parsePayload(response);
        return {
            message: { message: data.message, type: response.ok ? 'success' : 'error' },
            tag: data.tag
        };
    }
    catch {
        return { message: { message: 'api.generic.server_error', type: 'error' } };
    }
}

export async function deleteTag(tagId: number): Promise<Message> {
    try {
        const response = await fetch(`/api/v1/tags/${tagId}`, {
            method: 'DELETE'
        });
        const data = await parsePayload(response);
        return { message: data.message, type: response.ok ? 'success' : 'error' };
    }
    catch {
        return { message: 'api.generic.server_error', type: 'error' };
    }
}

export async function addTagToContact(contactId: number, tagId: number): Promise<Message> {
    try {
        const response = await fetch(`/api/v1/contacts/${contactId}/tags/${tagId}`, {
            method: 'POST'
        });
        const data = await parsePayload(response);
        return { message: data.message, type: response.ok ? 'success' : 'error' };
    }
    catch {
        return { message: 'api.generic.server_error', type: 'error' };
    }
}

export async function removeTagFromContact(contactId: number, tagId: number): Promise<Message> {
    try {
        const response = await fetch(`/api/v1/contacts/${contactId}/tags/${tagId}`, {
            method: 'DELETE'
        });
        const data = await parsePayload(response);
        return { message: data.message, type: response.ok ? 'success' : 'error' };
    }
    catch {
        return { message: 'api.generic.server_error', type: 'error' };
    }
}

export async function setContactTags(contactId: number, tagIds: number[]): Promise<Message> {
    try {
        const response = await fetch(`/api/v1/contacts/${contactId}/tags`, {
            method: 'PUT',
            body: JSON.stringify({ tagIds })
        });
        const data = await parsePayload(response);
        return { message: data.message, type: response.ok ? 'success' : 'error' };
    }
    catch {
        return { message: 'api.generic.server_error', type: 'error' };
    }
}
