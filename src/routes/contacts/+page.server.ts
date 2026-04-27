import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // TODO check locas.user for authentication and permissions before fetching contacts    
    // TODO Mocking the database call for now:
    const contacts = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-0101' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-0202' },
    ];

    return {
        contacts
    };
};
