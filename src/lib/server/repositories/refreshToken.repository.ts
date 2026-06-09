import { db } from '../db';

export const refreshTokenRepository = {
    create: async ({ token, userId, expiresAt }: { token: string; userId: number; expiresAt: number }): Promise<void> => {
        db.prepare('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);
    },

    findByToken: async (token: string): Promise<RefreshToken | undefined> => {
        return db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(token) as RefreshToken | undefined;
    },

    delete: async (token: string): Promise<void> => {
        db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token);
    },

    deleteAllForUser: async (userId: number): Promise<void> => {
        db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(userId);
    },

    deleteExpired: async (): Promise<void> => {
        db.prepare('DELETE FROM refresh_tokens WHERE expires_at < ?').run(Math.floor(Date.now() / 1000));
    }
};
