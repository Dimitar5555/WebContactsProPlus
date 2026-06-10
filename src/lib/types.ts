type phoneNumberLabel = 'HOME' | 'WORK' | 'MOBILE';

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
};

type PhoneNumber = {
    id: number;
    contact_id: number;
    phone_number: string;
    label?: phoneNumberLabel;
};

type ContactWithPhones = Contact & {
    phone_numbers: PhoneNumber[];
};

type CreateContactPayload = Omit<ContactWithPhones, 'id' | 'user_id' | 'is_favourite'> & {
    phone_numbers: Omit<PhoneNumber, 'id' | 'contact_id'>[];
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

type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};
