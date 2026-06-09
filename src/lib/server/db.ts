import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { dev } from '$app/environment';

export const db = new Database('app.db');
db.pragma('foreign_keys = ON');

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
if(dev && userCount.count === 0) {
    const hashedPassword1 = bcrypt.hashSync('password1', 10);
    const hashedPassword2 = bcrypt.hashSync('password2', 10);
    const insertUser = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
    insertUser.run('user1', hashedPassword1, 'user1@example.com');
    insertUser.run('user2', hashedPassword2, 'user2@example.com');

    const insertContact = db.prepare('INSERT INTO contacts (user_id, first_name, last_name, is_favourite, notes) VALUES (?, ?, ?, ?, ?)');
    insertContact.run(1, 'Иван', 'Петров', 1, null);
    insertContact.run(1, 'Мария', 'Георгиева', 1, 'Нуждае се от специално внимание при избора на подарък');
    insertContact.run(1, 'Георги', 'Тричков', 1, null);
    insertContact.run(1, 'Анна', 'Димитрова', 0, null);
    insertContact.run(1, 'Петър', 'Иванов', 0, null);
    insertContact.run(1, 'Петрана', 'Петрова', 0, null);
    insertContact.run(2, 'Петър', 'Иванов', 0, null);

    const insertPhone = db.prepare('INSERT INTO phone_numbers (contact_id, phone_number, label) VALUES (?, ?, ?)');
    insertPhone.run(1, '123-456-7890', null);
    insertPhone.run(1, '234-567-8901', 'WORK');
    insertPhone.run(1, '345-678-9012', 'MOBILE');
    insertPhone.run(2, '456-789-0123', null);
    insertPhone.run(3, '567-890-1234', 'HOME');
    insertPhone.run(4, '678-901-2345', null);
    insertPhone.run(5, '789-012-3456', 'MOBILE');
    insertPhone.run(6, '890-123-4567', null);
    insertPhone.run(7, '901-234-5678', 'WORK');
}
