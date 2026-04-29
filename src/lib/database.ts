// import { DB_URL } from '$env/static/private';

const users: User[] = [
    { id: 1, username: 'user1', password: 'password1', email: 'user1@example.com' },
    { id: 2, username: 'user2', password: 'password2', email: 'user2@example.com' },
];

const contacts: Contact[] = [
    { id: 1, user_id: 1, first_name: 'Иван', last_name: 'Петров', is_favourite: true },
    { id: 2, user_id: 1, first_name: 'Мария', last_name: 'Георгиева', is_favourite: true, notes: 'Нуждае се от специално внимание при избора на подарък' },
    { id: 3, user_id: 1, first_name: 'Георги', last_name: 'Тричков', is_favourite: true },
    { id: 4, user_id: 1, first_name: 'Анна', last_name: 'Димитрова', is_favourite: false },
    { id: 5, user_id: 2, first_name: 'Петър', last_name: 'Иванов', is_favourite: false },
];

const phonesNumbers: PhoneNumber[] = [
    { id: 1, contact_id: 1, phone_number: '123-456-7890' },
    { id: 2, contact_id: 1, phone_number: '234-567-8901', label: 'WORK' },
    { id: 3, contact_id: 1, phone_number: '345-678-9012', label: 'MOBILE' },
    { id: 4, contact_id: 1, phone_number: '456-789-0123' },
    { id: 5, contact_id: 2, phone_number: '567-890-1234', label: 'HOME' },
    { id: 6, contact_id: 3, phone_number: '678-901-2345' },
    { id: 7, contact_id: 3, phone_number: '789-012-3456', label: 'MOBILE' },
    { id: 8, contact_id: 4, phone_number: '890-123-4567' },
    { id: 9, contact_id: 5, phone_number: '901-234-5678', label: 'WORK' },
];

type QueryParams<T> = {
    where: Partial<T>;
    userId?: number; // Optional for public tables like 'users'
};

export const database = {
    contacts: {
        findMany: async ({ where, userId }: QueryParams<Contact>): Promise<Contact[]> => {
            if(where?.is_favourite) {
                return contacts.filter(contact => contact.is_favourite && contact.user_id === userId);
            }
            return contacts.filter(contact => contact.user_id === userId);
        },
        findById: async (id: number, userId: number): Promise<Contact | undefined> => {
            const contact = contacts.find(contact => contact.id === id && contact.user_id === userId);
            return contact;
        }
    },
    phoneNumbers: {
        findByContactId: async (contact_id: number): Promise<PhoneNumber[]> => {
            return phonesNumbers.filter(phone => phone.contact_id === contact_id);
        }
    },
    users: {
        findByUsername: async (username: string): Promise<User | undefined> => {
            return users.find(user => user.username === username);
        },
        findByEmail: async (email: string): Promise<User | undefined> => {
            return users.find(user => user.email === email);
        },
        create: async ({ username, password, email }: { username: string; password: string; email: string }): Promise<void> => {
            const newUser: User = {
                id: users.length + 1,
                username,
                password,
                email
            };
            users.push(newUser);
        }
    }
};
