import { db } from '../db';

type TagRow = Tag;
type TagWithContact = Tag & { contact_id: number };
type TagWithCountRow = Tag & { contact_count: number };

function mapTag(row: any): TagRow {
    return row as TagRow;
}

function mapTagWithContact(row: any): TagWithContact {
    return row as TagWithContact;
}

export const tagRepository = {
    findManyByUserId: async (userId: number): Promise<TagRow[]> => {
        return db.prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY label COLLATE NOCASE').all(userId).map(mapTag);
    },

    findManyByUserIdWithCounts: async (userId: number): Promise<TagWithCountRow[]> => {
        const rows = db.prepare(`
            SELECT t.*, COUNT(DISTINCT ct.contact_id) AS contact_count
            FROM tags t
            LEFT JOIN contact_tags ct ON ct.tag_id = t.id
            LEFT JOIN contacts c ON c.id = ct.contact_id AND c.user_id = t.user_id
            WHERE t.user_id = ?
            GROUP BY t.id
            ORDER BY t.label COLLATE NOCASE
        `).all(userId);
        return rows.map((row: any) => ({
            ...mapTag(row),
            contact_count: Number(row.contact_count || 0)
        }));
    },

    findManyByUserIdWithCounts: async (userId: number): Promise<TagWithCount[]> => {
        const rows = db.prepare(`
            SELECT t.*, COUNT(ct.contact_id) AS contact_count
            FROM tags t
            LEFT JOIN contact_tags ct ON ct.tag_id = t.id
            WHERE t.user_id = ?
            GROUP BY t.id
            ORDER BY t.label COLLATE NOCASE
        `).all(userId);
        return rows.map((row: any) => ({
            id: row.id,
            user_id: row.user_id,
            label: row.label,
            color: row.color,
            contact_count: Number(row.contact_count || 0)
        }));
    },

    findById: async (id: number): Promise<TagRow | undefined> => {
        const row = db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
        return row ? mapTag(row) : undefined;
    },

    findByIdAndUserId: async (id: number, userId: number): Promise<TagRow | undefined> => {
        const row = db.prepare('SELECT * FROM tags WHERE id = ? AND user_id = ?').get(id, userId);
        return row ? mapTag(row) : undefined;
    },

    findByContactIds: async (contactIds: number[]): Promise<TagWithContact[]> => {
        if(contactIds.length === 0) {
            return [];
        }
        const placeholders = contactIds.map(() => '?').join(',');
        const rows = db.prepare(`
            SELECT t.*, ct.contact_id
            FROM tags t
            INNER JOIN contact_tags ct ON ct.tag_id = t.id
            WHERE ct.contact_id IN (${placeholders})
            ORDER BY t.label COLLATE NOCASE
        `).all(...contactIds);
        return rows.map(mapTagWithContact);
    },

    create: async ({ user_id, label, color }: { user_id: number; label: string; color: string }): Promise<number> => {
        const stmt = db.prepare('INSERT INTO tags (user_id, label, color) VALUES (?, ?, ?)');
        const result = stmt.run(user_id, label, color);
        return result.lastInsertRowid as number;
    },

    update: async (id: number, { label, color }: { label: string; color: string }): Promise<void> => {
        db.prepare('UPDATE tags SET label = ?, color = ? WHERE id = ?').run(label, color, id);
    },

    delete: async (id: number): Promise<void> => {
        db.prepare('DELETE FROM tags WHERE id = ?').run(id);
    }
};
