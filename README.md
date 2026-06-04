# WebContactsProPlus

This is a group project for the Web Technologies course at Faculty of Mathematics and Informatics, Sofia University. The project is a contact management application built on top of SvelteKit, with a SQLite database for storing user data, contacts, and tags. The application allows users to create an account, log in, manage their contacts.

## Features

- User authentication (registration and login)
- CRUD operations for contacts
- Tagging system for contacts
- Search functionality for contacts
- Favoriting contacts
- Responsive design for mobile and desktop

## Architecture

- Frontend: SvelteKit + Bootstrap
- Backend: Node.js with Express
- Database: SQLite
- Authentication: JWT (JSON Web Tokens)
- Testing: Vitest
- Internationalization: [svelte-i18n](https://npmjs.com/package/svelte-i18n)

## Requirements

- Node.js (version 22 or later)
- NPM

## Installation

1. Clone the repository

```sh
git clone https://github.com/Dimitar5555/WebContactsProPlus.git
cd WebContactsProPlus
```

2. Install dependencies

```sh
npm ci
```

3. Create a .env file in the root directory with the following content

```env
JWT_SECRET=your_secret_key_here
```

4. Run the tests

```sh
npm run test
```

5. Run the application

```sh
npm run dev
```
