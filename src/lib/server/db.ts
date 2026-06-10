import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';

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

    CREATE TABLE IF NOT EXISTS refresh_tokens (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        label TEXT NOT NULL,
        color TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, label)
    );

    CREATE TABLE IF NOT EXISTS contact_tags (
        contact_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY(contact_id, tag_id),
        FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
`);

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if(userCount.count === 0) {
    const hashedPassword1 = bcrypt.hashSync('password1', 10);
    const hashedPassword2 = bcrypt.hashSync('password2', 10);
    const insertUser = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
    insertUser.run('user1', hashedPassword1, 'user1@example.com');
    insertUser.run('user2', hashedPassword2, 'user2@example.com');

    const insertContact = db.prepare('INSERT INTO contacts (user_id, first_name, last_name, is_favourite, notes) VALUES (?, ?, ?, ?, ?)');
    insertContact.run(1, 'Иван', 'Петров', 1, 'Нуждае се от специално внимание при избора на подарък');
    insertContact.run(1, 'Мария', 'Георгиева', 0, null);
    insertContact.run(1, 'Георги', 'Тричков', 0, null);
    insertContact.run(2, 'Петър', 'Иванов', 1, null);

    const insertPhone = db.prepare('INSERT INTO phone_numbers (contact_id, phone_number, label) VALUES (?, ?, ?)');
    insertPhone.run(1, '+35923456789', 'HOME');
    insertPhone.run(1, '+359878787878', 'WORK');
    insertPhone.run(1, '+13456789032', 'MOBILE');
    insertPhone.run(1, '+34952563211', null);
    insertPhone.run(1, '+36542522365', 'HOME');
    insertPhone.run(2, '+359678901234', null);
    insertPhone.run(3, '+359789012345', 'MOBILE');
    insertPhone.run(4, '+359890123456', null);
    insertPhone.run(4, '+359901234567', 'WORK');
}
