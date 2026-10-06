# Chirpy

Chirpy is a backend API for a small social media platform where users can create, read, update, and delete short messages called chirps.

The project includes user authentication with password hashing and JWT access tokens, refresh tokens for getting new access tokens, user profile updates, chirp ownership checks, author-based filtering, and Chirpy Red membership through a webhook.

## Why Chirpy?

Chirpy is a practical backend project for learning how a real API works. It covers important backend concepts such as:

- REST API development with Express
- PostgreSQL database management
- Drizzle ORM
- Password hashing with Argon2
- JWT authentication
- Refresh token management
- Authorization and ownership checks
- Database migrations
- Webhooks
- Request validation and error handling

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/SaraA-2003/Chirpy.git
cd Chirpy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the project root:

```env
DB_URL=your_database_url
PORT=8080
PLATFORM=dev
SECRET=your_jwt_secret
POLKA_KEY=your_polka_key
```

- `DB_URL` — PostgreSQL database connection URL
- `PORT` — Port where the server runs
- `PLATFORM` — Application environment, such as `dev`
- `SECRET` — Secret used to sign and validate JWTs
- `POLKA_KEY` — API key used to authenticate Polka webhooks

Do not commit your `.env` file to Git.

### 4. Run database migrations

Generate migrations when the database schema changes:

```bash
npm run generate
```

The project applies the migrations when the development server starts.

### 5. Start the development server

```bash
npm run dev
```

The API will run locally on:

```text
http://localhost:8080
```