import { db } from '../db';

export const userRepository = {
    findByUsername: async (username: string): Promise<User | undefined> => {
        return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
    },

    findByEmail: async (email: string): Promise<User | undefined> => {
        return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
    },

    findById: async (id: number): Promise<User | undefined> => {
        return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
    },

    create: async ({ username, password, email }: { username: string; password: string; email: string }): Promise<number> => {
        const stmt = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
        const result = stmt.run(username, password, email);
        return result.lastInsertRowid as number;
    },

    update: async (id: number, { username, password, email }: { username: string; password: string; email: string }): Promise<void> => {
        db.prepare('UPDATE users SET username = ?, password = ?, email = ? WHERE id = ?').run(username, password, email, id);
    },

    delete: async (id: number): Promise<void> => {
        db.prepare('DELETE FROM users WHERE id = ?').run(id);
    }
};
