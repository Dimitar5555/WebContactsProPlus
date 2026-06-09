import { db } from '../db';

export const phoneNumberRepository = {
    findByContactId: async (contact_id: number): Promise<PhoneNumber[]> => {
        return db.prepare('SELECT * FROM phone_numbers WHERE contact_id = ?').all(contact_id) as PhoneNumber[];
    },

    create: async ({ contact_id, phone_number, label = null }: { contact_id: number; phone_number: string; label?: phoneNumberLabel | null }): Promise<number> => {
        const stmt = db.prepare('INSERT INTO phone_numbers (contact_id, phone_number, label) VALUES (?, ?, ?)');
        const result = stmt.run(contact_id, phone_number, label);
        return result.lastInsertRowid as number;
    },

    update: async (id: number, { phone_number, label }: { phone_number: string; label?: phoneNumberLabel | null }): Promise<void> => {
        db.prepare('UPDATE phone_numbers SET phone_number = ?, label = ? WHERE id = ?').run(phone_number, label, id);
    },

    delete: async (id: number): Promise<void> => {
        db.prepare('DELETE FROM phone_numbers WHERE id = ?').run(id);
    }
};
