type phoneNumberLabel = 'HOME' | 'WORK' | 'MOBILE' | null;

type User = {
    id: number;
    email: string;
    username: string;
    password: string;
};

type Contact = {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    photo_url?: string;
    is_favourite: boolean;
    notes?: string;
    tags?: Tag[];
};

type Tag = {
    id: number;
    user_id: number;
    label: string;
    color: string;
};

type TagWithCount = Tag & {
    contact_count: number;
};

type TagWithCount = Tag & {
    contact_count: number;
};

type PhoneNumber = {
    id: number;
    contact_id: number;
    phone_number: string;
    label?: phoneNumberLabel;
};

type RefreshToken = {
    token: string;
    user_id: number;
    expires_at: number;
};

type ContactWithPhones = {
    contact: Contact;
    phones: PhoneNumber[];
};

type ContactWithPhones = Contact & {
    phone_numbers: PhoneNumber[];
};

type CreateContactPayload = Omit<ContactWithPhones, 'id' | 'user_id' | 'is_favourite'> & {
    phone_numbers: Omit<PhoneNumber, 'id' | 'contact_id'>[];
    tags?: Tag[];
};

type Message = {
    message: string;
    type: 'success' | 'warning' | 'error';
};

type Toast = {
    id: number;
    message: string;
    type: 'success' | 'warning' | 'error';
    timeoutId: number;
};
