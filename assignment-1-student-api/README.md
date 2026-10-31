# Student CRUD API with Hono and Drizzle

A deployable REST API for managing student records using Hono, PostgreSQL, Drizzle ORM, Zod v4, and Vercel Functions.

## Student Information

- **Name:** ภาสกร เติมทองดี (Passakorn Termthongdee)
- **Student ID:** 67070134

## Data model

```text
students
├── id (PK, identity)
├── student_id (unique, text)
├── first_name (text)
├── last_name (text)
├── birth_date (date)
└── gender (text)
```

Every student has a unique student_id. birth_date is formatted as YYYY-MM-DD.

## Local setup

Start a local PostgreSQL database:

```sh
docker run --name iot-lab-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=iot_lab \
  -p 5432:5432 \
  -d postgres:17-alpine
```

Install and prepare the project:

```sh
nvm install 24.14.1
nvm use 24.14.1
npm install
copy .env.example .env
npm run db:migrate
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

Run the direct Node.js entrypoint:

```sh
npm run dev
```

Or run the Vercel Function entrypoint and `vercel.json` routing locally:

```sh
npm run vercel:dev
```

Use one development command at a time. Both expose the API at <http://localhost:3000/api>.

## Environment variables

```env
SECRET_PASSWORD=iot-lab-2026
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/iot_lab
```

- `SECRET_PASSWORD` protects every `/api/v1/*` route.
- `DATABASE_URL` must be a PostgreSQL connection string.
- Hosted PostgreSQL providers commonly require `sslmode=require` in the URL.
- Never commit `.env` or database credentials.

Every request requires:

```text
Authorization: Bearer iot-lab-2026
Content-Type: application/json
```

## Routes

### Students

| Method | Route | Result |
| --- | --- | --- |
| `GET` | `/api/v1/students` | List all students |
| `GET` | `/api/v1/students/:id` | Get one student |
| `POST` | `/api/v1/students` | Create a student |
| `PATCH` | `/api/v1/students/:id` | Update supplied student fields |
| `DELETE` | `/api/v1/students/:id` | Delete a student |

```json
{
  "studentId": "67070134",
  "firstName": "Passakorn",
  "lastName": "Termthongdee",
  "birthDate": "2006-11-17",
  "gender": "Male"
}
```

## Example request

```sh
curl -X POST http://localhost:3000/api/v1/students \
  -H "Authorization: Bearer iot-lab-2026" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"67070134","firstName":"Passakorn","lastName":"Termthongdee","birthDate":"2006-11-17","gender":"Male"}'
```

## Database commands

```sh
npm run db:generate  # Generate SQL after changing src/db/schema.ts
npm run db:migrate   # Apply pending migrations
npm run db:studio    # Open Drizzle Studio
```

Generated migrations are committed in `drizzle/`. Run migrations against the target database before deploying new application code.

## Deploy to Vercel

1. Create a PostgreSQL database. A PostgreSQL integration from the Vercel Marketplace is suitable.
2. Add `DATABASE_URL` and `SECRET_PASSWORD` to the Vercel project for Production, Preview, and Development as needed.
3. Apply migrations using the production `DATABASE_URL`.
4. Deploy the project.

Using the Vercel CLI:

```sh
npx --yes vercel@latest link
npx --yes vercel@latest env add DATABASE_URL
npx --yes vercel@latest env add SECRET_PASSWORD
npx --yes vercel@latest env pull .env
npm run db:migrate
npx --yes vercel@latest deploy
npx --yes vercel@latest deploy --prod
```

`api/index.ts` is the production Vercel Function entrypoint. `npm run vercel:dev` starts that entrypoint locally through Vercel CLI. `vercel.json` rewrites nested `/api/*` requests to the function while preserving Hono routing. The same `src/app.ts` application is used by the direct Node.js and Vercel entrypoints.

## HTTP behavior

- `200 OK`: successful read or update
- `201 Created`: successful creation with a `Location` header
- `204 No Content`: successful deletion
- `400 Bad Request`: Zod rejected the request
- `401 Unauthorized`: missing or incorrect bearer token
- `404 Not Found`: resource or route does not exist
- `409 Conflict`: author still has books
- `422 Unprocessable Entity`: `authorId` does not reference an author

## Project structure

```text
api/
└── index.ts                 # Vercel Function entrypoint
src/
├── local.ts                 # Direct local Node.js entrypoint
├── app.ts                   # Shared Hono application
├── controllers/             # Routes, auth, and status codes
│   ├── api.ts
│   └── students.ts
├── schemas/                 # Zod v4 request schemas
│   ├── common.ts
│   └── students.ts
├── services/                # Asynchronous PostgreSQL operations
│   └── students.ts
└── db/
    ├── index.ts             # Shared node-postgres connection pool
    └── schema.ts            # PostgreSQL Drizzle schema

drizzle/                     # Versioned PostgreSQL migrations
drizzle.config.ts            # Drizzle Kit configuration
vercel.json                  # Vercel request rewrites
```
