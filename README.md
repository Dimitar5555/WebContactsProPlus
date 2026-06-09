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
- Backend: SvelteKit API routes
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

## Deploy with Docker Compose

Production deployment behind nginx with Let's Encrypt TLS (HTTP-01 challenge).

### Prerequisites

- A host with Docker + Docker Compose v2 installed.
- Ports **80** and **443** open to the public internet.
- A domain whose **A** (and optionally **AAAA**) DNS record points to the host's public IP. The record must be propagated before running the bootstrap, otherwise the ACME HTTP-01 challenge will fail.

### Steps

1. Copy the env template and fill in your values:

   ```sh
   cp .env.example .env
   # edit .env: set JWT_SECRET (long random string), DOMAIN, LETSENCRYPT_EMAIL
   ```

2. Bring the stack up:

   ```sh
   docker compose up -d
   ```

3. Wait ~30 seconds. nginx starts immediately with a self-signed placeholder cert, then certbot issues the real Let's Encrypt cert and nginx reloads automatically.

4. Open `https://<your-domain>` and use the **Register** page to create the first account — the seed users (`user1`/`user2`) are gated to dev only and are not created in the production image.

> If DNS isn't yet pointing at the host when you run `up`, the certbot container will fail and restart in a loop — it'll succeed automatically once DNS resolves. While waiting, nginx serves the self-signed placeholder (browsers will warn about the untrusted cert; this is expected).

### What's running

| Service | Image | Purpose |
| --- | --- | --- |
| `app` | local build | SvelteKit (`adapter-node`) on internal port 3000. SQLite + uploaded photos persist in the `app-data` volume. |
| `nginx` | `nginx:1.27-alpine` | Terminates TLS on 443, redirects 80 → 443, proxies to `app`. |
| `certbot` | `certbot/certbot` | Renews the Let's Encrypt cert every 12h. |

### Data persistence

Three named volumes survive `docker compose down`:

- `app-data` — `app.db` and `photos/`
- `letsencrypt-certs` — `/etc/letsencrypt`
- `letsencrypt-www` — webroot for the ACME challenge

`docker compose down -v` wipes them — including users and certs.

