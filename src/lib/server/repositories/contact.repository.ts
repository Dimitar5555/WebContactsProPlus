import { db } from '../db';

export type ContactQuery = {
    userId: number;
    where?: Partial<Contact>;
    tagId?: number;
};

function mapContact(row: any): Contact {
    return {
        ...row,
        is_favourite: Boolean(row.is_favourite)
    };
}

export const contactRepository = {
    findMany: async ({ where, userId, tagId }: ContactQuery): Promise<Contact[]> => {
        let query = 'SELECT * FROM contacts WHERE user_id = ?';
        const params: any[] = [userId];

        if(where?.is_favourite !== undefined) {
            query += ' AND is_favourite = ?';
            params.push(where.is_favourite ? 1 : 0);
        }

        if(tagId !== 0) {
            query += ' AND id IN (SELECT contact_id FROM contact_tags WHERE tag_id = ?)';
            params.push(tagId);
        }

        const rows = db.prepare(query).all(...params);
        return rows.map(mapContact);
    },

    findById: async (id: number): Promise<Contact | undefined> => {
        const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
        return row ? mapContact(row) : undefined;
    },

    create: async ({ user_id, first_name, last_name, is_favourite = false, notes = null }: {
        user_id: number;
        first_name: string;
        last_name: string;
        is_favourite?: boolean;
        notes?: string | null;
    }): Promise<number> => {
        const stmt = db.prepare('INSERT INTO contacts (user_id, first_name, last_name, is_favourite, notes) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(user_id, first_name, last_name, is_favourite ? 1 : 0, notes);
        return result.lastInsertRowid as number;
    },

    update: async (id: number, { first_name, last_name, is_favourite, notes }: {
        first_name?: string;
        last_name?: string;
        is_favourite?: boolean;
        notes?: string | null;
    }): Promise<void> => {
        const stmt = db.prepare(`
            UPDATE contacts
            SET first_name = ?, last_name = ?, is_favourite = ?, notes = ?
            WHERE id = ?
        `);
        stmt.run(first_name, last_name, is_favourite ? 1 : 0, notes, id);
    },

    delete: async (id: number): Promise<void> => {
        db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
    },

    setFavourite: async (id: number, newState: boolean): Promise<void> => {
        db.prepare('UPDATE contacts SET is_favourite = ? WHERE id = ?').run(newState ? 1 : 0, id);
    },

    setPhotoUrl: async (id: number, photoUrl: string | null): Promise<void> => {
        db.prepare('UPDATE contacts SET photo_url = ? WHERE id = ?').run(photoUrl, id);
    }
};
