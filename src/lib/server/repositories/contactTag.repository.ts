import { db } from '../db';

export const contactTagRepository = {
    findTagIdsByContactId: async (contactId: number): Promise<number[]> => {
        return db.prepare('SELECT tag_id FROM contact_tags WHERE contact_id = ? ORDER BY tag_id').all(contactId).map((row: any) => row.tag_id as number);
    },

    replaceTags: async (contactId: number, tagIds: number[]): Promise<void> => {
        const tx = db.transaction((currentContactId: number, currentTagIds: number[]) => {
            db.prepare('DELETE FROM contact_tags WHERE contact_id = ?').run(currentContactId);
            const insert = db.prepare('INSERT INTO contact_tags (contact_id, tag_id) VALUES (?, ?)');
            for(const tagId of currentTagIds) {
                insert.run(currentContactId, tagId);
            }
        });
        tx(contactId, tagIds);
    },

    addTag: async (contactId: number, tagId: number): Promise<void> => {
        db.prepare('INSERT OR IGNORE INTO contact_tags (contact_id, tag_id) VALUES (?, ?)').run(contactId, tagId);
    },

    removeTag: async (contactId: number, tagId: number): Promise<void> => {
        db.prepare('DELETE FROM contact_tags WHERE contact_id = ? AND tag_id = ?').run(contactId, tagId);
    }
};