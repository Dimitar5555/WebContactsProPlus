# WebContactsProPlus

This is a group project for the Web Technologies course at Faculty of Mathematics and Informatics, Sofia University. The project is a contact management application built on top of SvelteKit, with a SQLite database for storing user data, contacts, and tags. The application allows users to create an account, log in, manage their contacts.

## Requirements

- Node.js (version 22 or later)
- NPM

## Installation

1. Clone the repository:

```sh
git clone https://github.com/Dimitar5555/WebContactsProPlus.git
cd WebContactsProPlus
```

2. Install dependencies:

```sh
npm ci
```

3. Create a .env file in the root directory with the following content:

```env
JWT_SECRET=your_secret_key_here
```

4. Run the application:

```sh
npm run dev
```

