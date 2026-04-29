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

type ContactWithVisibility = Contact & {
	is_visible: boolean;
};

type PhoneNumber = {
	id: number;
	contact_id: number;
	phone_number: string;
	label?: phoneNumberLabel;
};

type ContactWithPhones = {
	contact: Contact;
	phones: PhoneNumber[];
};
