import Database from 'better-sqlite3';
const db = new Database('app.db');
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        is_favourite INTEGER DEFAULT 0,
        notes TEXT,
        photo_url TEXT DEFAULT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS phone_numbers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        phone_number TEXT NOT NULL,
        label TEXT,
        FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        CHECK(label IN ('HOME', 'WORK', 'MOBILE') OR label IS NULL)
    );
`);

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

if (userCount.count === 0) {
    const insertUser = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
    insertUser.run('user1', 'password1', 'user1@example.com');
    insertUser.run('user2', 'password2', 'user2@example.com');

    const insertContact = db.prepare('INSERT INTO contacts (user_id, first_name, last_name, is_favourite, notes) VALUES (?, ?, ?, ?, ?)');
    insertContact.run(1, 'Иван', 'Петров', 1, null);
    insertContact.run(1, 'Мария', 'Георгиева', 1, 'Нуждае се от специално внимание при избора на подарък');
    insertContact.run(1, 'Георги', 'Тричков', 1, null);
    insertContact.run(1, 'Анна', 'Димитрова', 0, null);
    insertContact.run(2, 'Петър', 'Иванов', 0, null);

    const insertPhone = db.prepare('INSERT INTO phone_numbers (contact_id, phone_number, label) VALUES (?, ?, ?)');
    insertPhone.run(1, '123-456-7890', null);
    insertPhone.run(1, '234-567-8901', 'WORK');
    insertPhone.run(1, '345-678-9012', 'MOBILE');
    insertPhone.run(1, '456-789-0123', null);
    insertPhone.run(2, '567-890-1234', 'HOME');
    insertPhone.run(3, '678-901-2345', null);
    insertPhone.run(3, '789-012-3456', 'MOBILE');
    insertPhone.run(4, '890-123-4567', null);
    insertPhone.run(5, '901-234-5678', 'WORK');
}

export type QueryParams<T> = {
    where?: Partial<T>;
    userId?: number;
};

const mapContact = (row: any)  => {
    if (!row) return undefined;
    return {
        ...row,
        is_favourite: Boolean(row.is_favourite)
    };
};

export const database = {
    contacts: {
        findMany: async ({ where, userId }: QueryParams<any>) => {
            let query = 'SELECT * FROM contacts WHERE user_id = ?';
            const params: any[] = [userId];

            if (where?.is_favourite !== undefined) {
                query += ' AND is_favourite = ?';
                params.push(where.is_favourite ? 1 : 0);
            }

            const stmt = db.prepare(query);
            const rows = stmt.all(...params);

            return rows.map(mapContact);
        },

        findById: async (id: number, userId: number) => {
            const stmt = db.prepare('SELECT * FROM contacts WHERE id = ? AND user_id = ?');
            const row = stmt.get(id, userId);

            return mapContact(row);
        },

        create: async ({ user_id, first_name, last_name, is_favourite = false, notes = null }: any)  => {
            const stmt = db.prepare('INSERT INTO contacts (user_id, first_name, last_name, is_favourite, notes) VALUES (?, ?, ?, ?, ?)');
            const result = stmt.run(user_id, first_name, last_name, is_favourite ? 1 : 0, notes);
            return result.lastInsertRowid as number;
        },

        update: async (id: number, userId: number, { first_name, last_name, is_favourite, notes }: any) => {
            const stmt = db.prepare(`
                UPDATE contacts 
                SET first_name = ?, last_name = ?, is_favourite = ?, notes = ? 
                WHERE id = ? AND user_id = ?
            `);
            stmt.run(first_name, last_name, is_favourite ? 1 : 0, notes, id, userId);
        },

        delete: async (id: number, userId: number)  => {
            const stmt = db.prepare('DELETE FROM contacts WHERE id = ? AND user_id = ?');
            stmt.run(id, userId);
        }
    },

    contactPhotos: {
        findById: async (contact_id: number) => {
            const stmt = db.prepare('SELECT photo_url FROM contacts WHERE id = ?');
            const row = stmt.get(contact_id);
            return row;
        },
        create: async ({ contact_id, photo_url }: any) => {
            const stmt = db.prepare('UPDATE contacts SET photo_url = ? WHERE id = ?');
            stmt.run(photo_url, contact_id);
        },
        delete: async (contact_id: number) => {
            const stmt = db.prepare('UPDATE contacts SET photo_url = NULL WHERE id = ?');
            stmt.run(contact_id);
        }
    },

    phoneNumbers: {
        findByContactId: async (contact_id: number) => {
            const stmt = db.prepare('SELECT * FROM phone_numbers WHERE contact_id = ?');
            return stmt.all(contact_id);
        },

        create: async ({ contact_id, phone_number, label = null }: any) => {
            const stmt = db.prepare('INSERT INTO phone_numbers (contact_id, phone_number, label) VALUES (?, ?, ?)');
            const result = stmt.run(contact_id, phone_number, label);
            return result.lastInsertRowid as number;
        },

        update: async (id: number, { phone_number, label }: any) => {
            const stmt = db.prepare('UPDATE phone_numbers SET phone_number = ?, label = ? WHERE id = ?');
            stmt.run(phone_number, label, id);
        },

        delete: async (id: number) => {
            const stmt = db.prepare('DELETE FROM phone_numbers WHERE id = ?');
            stmt.run(id);
        }
    },

    users: {
        findByUsername: async (username: string) => {
            const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
            return stmt.get(username);
        },

        findByEmail: async (email: string) => {
            const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
            return stmt.get(email);
        },

        create: async ({ username, password, email }: any) => {
            const stmt = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
            const result = stmt.run(username, password, email);
            return result.lastInsertRowid as number;
        },

        update: async (id: number, { username, password, email }: any) => {
            const stmt = db.prepare('UPDATE users SET username = ?, password = ?, email = ? WHERE id = ?');
            stmt.run(username, password, email, id);
        },

        delete: async (id: number) => {
            const stmt = db.prepare('DELETE FROM users WHERE id = ?');
            stmt.run(id);
        }
    }
};
