# HabitFlow

HabitFlow is a Vue and Express habit tracker built around one reliable rule: **streaks are based on local calendar dates, not elapsed hours.** It includes habit CRUD, local-day check-ins, backfill, history, analytics, activity heatmaps, dynamic achievements, and server-generated insights.

## Setup

1. Create the MySQL database using `database/schema.sql`.
2. Configure the root `.env` with the server values:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=habit_tracker
DB_USER=habit_app
DB_PASSWORD=
JWT_SECRET=replace-with-a-long-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

3. Start the API:

```bash
cd server
npm install
npm start
```

4. Start the Vue client in another terminal:

```bash
cd client
npm install
npm run dev
```

The client uses `VITE_API_URL` when provided and otherwise connects to `http://localhost:5000/api`.

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET|POST /api/habits`
- `GET|PUT|DELETE /api/habits/:id`
- `POST /api/habits/:habitId/check-ins`
- `GET /api/habits/:habitId/check-ins`
- `GET /api/analytics`
- `GET /api/analytics/activity?days=90`
- `GET /api/achievements`
- `GET /api/insights`

Habit and check-in endpoints require `Authorization: Bearer <token>`.

## Date and Streak Model

Users store an IANA timezone such as `Asia/Kolkata`, `America/New_York`, `Europe/London`, `Australia/Sydney`, or `UTC`. Offsets and abbreviations such as `+05:30` and `IST` are rejected.

A check-in stores both the actual UTC instant in `checked_in_at_utc` and the user-local calendar date in `local_date`. The unique database constraint on `(habit_id, local_date)` permits only one check-in per habit per local day. Future dates and dates before `created_local_date` are rejected. Omitting the check-in date means today in the authenticated user's timezone.

Current and longest streaks are calculated by the server from `YYYY-MM-DD` dates. DST and 23:59/midnight boundaries do not change the calendar-day model. Backfilling recalculates both streak values rather than incrementing them.

Analytics aggregates only the authenticated user's habits and check-ins. Activity data is returned as local calendar dates for the requested range. Achievements and daily insights are calculated dynamically from the same existing data; no achievements or analytics tables are required. The frontend only displays these server responses and never calculates streak state.

When a timezone changes, historical `local_date` values remain immutable. New habits and check-ins use the new timezone; existing check-ins are never silently moved.

## Testing

Run backend tests with:

```bash
cd server
npm test
```

Build the frontend with:

```bash
cd client
npm run build
```

Database credentials and `JWT_SECRET` must remain in the server environment and must never be exposed through client code or `VITE_` variables.
