# HabitFlow

### Build better habits. One local day at a time. 🔥

HabitFlow is a modern, timezone-aware habit tracking application designed to help users build consistent habits through daily check-ins, streak tracking, history, analytics, and progress visualization.

The core idea behind HabitFlow is simple:

> **A streak belongs to a user's local calendar days — not elapsed hours.

That means a habit remains consistent according to the user's own timezone, even when check-ins are made across different UTC times.

---

## ✨ Live Experience

📦 **Repository:** [View Source Code](https://github.com/umangkumar612/habit_tracker)

---
## 📸 Preview

### Login/Register
<img width="951" height="512" alt="{DA8E5BB6-E54F-46FD-A51F-4D37880EB9CF}" src="https://github.com/user-attachments/assets/098e5c60-2476-4052-8486-25f19da846e2" />
<img width="960" height="511" alt="{348E637F-00C4-4ABA-9ABF-5444413AA48A}" src="https://github.com/user-attachments/assets/982fc02e-075d-4ea6-8f20-33e6c9e608ec" />



### Dashboard
<img width="958" height="502" alt="{3E578109-7C80-43B8-9A5E-876874148833}" src="https://github.com/user-attachments/assets/3103ad9c-659b-4099-ba05-b35a46225b69" />
<img width="960" height="509" alt="{FFF1AF59-B9DD-420E-9837-1D3D35BFD1D8}" src="https://github.com/user-attachments/assets/f4762015-bcaf-49b3-b5c8-298367cc7b75" />



### Habits

<img width="957" height="516" alt="{F49D0685-D63B-4D3F-B0BB-F4AA476F22F7}" src="https://github.com/user-attachments/assets/83f1c76a-fea5-4a07-8df7-78aae5ea7a46" />
<img width="940" height="504" alt="{A0AB8B2C-743E-480C-A857-B793AAB27B66}" src="https://github.com/user-attachments/assets/ef8a3bcd-8981-4df0-9d89-0d585627f602" />
<img width="794" height="470" alt="{58E4ABE6-9B25-4B42-910F-001AF6BC39EB}" src="https://github.com/user-attachments/assets/bd09fe86-ea7d-4505-b009-26a655446406" />

### History

<img width="958" height="503" alt="{5FA0B456-2EFF-4BF5-AA49-F75C9C2E0A1D}" src="https://github.com/user-attachments/assets/49fd1d6a-1c91-45d5-988f-0485bef83319" />
<img width="958" height="508" alt="{64FF8F14-9F3E-42B2-9972-743A3EDE1E7C}" src="https://github.com/user-attachments/assets/077cd2ad-de9a-465b-b973-b4c8b906a39d" />

### Settings
<img width="953" height="513" alt="{B8CD4A38-30D4-45A9-BDAB-6D4B320757F4}" src="https://github.com/user-attachments/assets/bb028796-db51-480f-be78-f922938aec84" />

---

# 🌟 Why HabitFlow?

Most habit trackers treat a streak as a simple difference between timestamps.

HabitFlow takes a different approach.

A user's day depends on their timezone.

For example, two check-ins can be only a few hours apart in UTC but belong to two different local calendar days.

HabitFlow therefore stores both:

- the exact check-in instant in UTC
- the local calendar date the check-in belongs to

This makes streak calculations predictable, timezone-aware, and reliable.

---

# 🚀 Features

## 🔐 Authentication

- User registration
- Secure login
- JWT-based authentication
- Protected API routes
- Persistent user sessions
- User-specific data isolation

---

## 🌍 Timezone-Aware Habits

Every user has an IANA timezone such as:

HabitFlow uses the user's timezone as the source of truth for:

Today's date
Check-ins
Streaks
Backfilled dates
History
Activity analytics
🔥 Smart Streaks

HabitFlow calculates streaks on the server.

Each habit provides:

Current Streak
Longest Streak

A streak can end on:

today, if today is completed
yesterday, if today has not been completed yet

The frontend never determines whether a streak is alive.

✅ Daily Check-ins

Users can check in a habit for the current local day with one click.

Once completed:

✓ Completed today

Only one check-in is allowed for a habit on a particular local date.

⏪ Backfill Support

Forgot to record yesterday's habit?

HabitFlow allows users to backfill previous local dates.

Backfilled dates are validated against:

user's local timezone
today's local date
habit creation date
existing check-ins
📅 Habit History

Each habit has a detailed history showing:

Current streak
Longest streak
Total check-ins
Completed dates
Calendar activity
Historical progress
📊 Analytics

HabitFlow provides a high-level view of progress including:

Total habits
Active habits
Total check-ins
Today's progress
Consistency
Best streak
Habit performance
Activity over time
🗓️ Activity Visualization

Track consistency through a calendar/heatmap-style activity visualization.

The activity is based on actual local check-in dates rather than UTC timestamps.

This makes long-term patterns easy to understand at a glance.

🏆 Achievements

HabitFlow can recognize meaningful milestones such as:

First Step
Building Momentum
One Week Strong
Two Weeks Strong
Consistency
Dedicated

Achievements are based on actual user activity rather than fake or static data.

💡 Daily Insights

HabitFlow can surface small data-driven insights such as:

You're one day away from a 7-day reading streak.

or:

4 of 6 habits are complete today.

The goal is to turn raw activity into useful feedback without overwhelming the user.

🧠 The Interesting Part — Local-Day Streak Logic

This is the core technical challenge of HabitFlow.

Consider a user in:

Asia/Kolkata (UTC+05:30)
Check-in A
UTC:
2026-03-10T14:30Z

Local:
2026-03-10 20:00
Check-in B
UTC:
2026-03-11T10:30Z

Local:
2026-03-11 16:00

These check-ins are only 20 hours apart.

But they belong to:

March 10
March 11

Therefore:

Streak = 2

Now consider:

Check-in C
UTC:
2026-03-11T21:30Z

Local:
2026-03-12 03:00

This is only 11 hours after the previous check-in.

But it belongs to a new local day:

March 12

Therefore:

Streak = 3

If another check-in occurs later on March 12:

UTC:
2026-03-12T17:30Z

Local:
2026-03-12 23:00

it belongs to the same local day and is rejected as a duplicate.

This is why HabitFlow stores:

checked_in_at_utc
local_date

instead of relying only on timestamps.

🏗️ Architecture
                     ┌─────────────────────┐
                     │      HabitFlow      │
                     │      Frontend       │
                     │      Vue.js         │
                     └──────────┬──────────┘
                                │
                                │ REST API
                                ▼
                     ┌─────────────────────┐
                     │       Express       │
                     │       Backend       │
                     └──────────┬──────────┘
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
             ▼                  ▼                  ▼
       Authentication      Habit Services     Streak Engine
             │                  │                  │
             └──────────────────┼──────────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │    MySQL     │
                         └──────────────┘
🛠️ Tech Stack
Frontend
Vue.js
JavaScript
HTML
CSS
Vite
Axios
Vue Router
Backend
Node.js
Express.js
JWT
Luxon
MySQL
Database
MySQL
Foreign keys
Unique constraints
Local-date based check-in storage
Testing
Jest
📁 Project Structure
habit_tracker/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── router/
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── style.css
│   │   └── sidebar.css
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── utils/
│   └── server.js
│
├── database/
│   └── schema.sql
│
├── .gitignore
├── package.json
└── README.md
🔌 API Overview
Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
Habits
GET    /api/habits
POST   /api/habits
GET    /api/habits/:id
PUT    /api/habits/:id
DELETE /api/habits/:id
Check-ins
POST /api/habits/:habitId/check-ins
GET  /api/habits/:habitId/check-ins
Analytics
GET /api/analytics
GET /api/analytics/activity
🔒 Data Integrity

HabitFlow protects the local-day rule at multiple levels.

Application level

The backend validates:

Future dates
Dates before habit creation
Duplicate local dates
Habit ownership
User ownership
Database level

A unique constraint prevents duplicate check-ins:

UNIQUE(habit_id, local_date)

This means even concurrent requests cannot create two check-ins for the same habit and local day.

🧪 Testing

Run backend tests:

cd server
npm test

The test suite covers areas such as:

Timezone validation
Local date conversion
DST behavior
Streak calculation
Duplicate check-ins
Backfilled dates
Current streak
Longest streak
Analytics
⚙️ Local Development
1. Clone
git clone https://github.com/umangkumar612/habit_tracker.git
cd habit_tracker
2. Install dependencies

Backend:

cd server
npm install

Frontend:

cd ../client
npm install
🔑 Environment Variables

Create a .env file according to the environment configuration.

Example:

PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=habit_tracker
DB_USER=your_database_user
DB_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

Never commit .env files or production credentials to GitHub.

▶️ Run the Application

Start backend:

cd server
npm start

Start frontend:

cd client
npm run dev

Frontend:

http://localhost:5173

Backend:

http://localhost:5000
🎯 Design Philosophy

HabitFlow is intentionally designed around three ideas:

01 — Consistency over perfection

Missing a day shouldn't make the entire experience feel punishing.

02 — Data should reflect reality

A day belongs to the user's timezone, not the server's timezone.

03 — Progress should feel visible

Streaks, history, analytics, and activity visualization turn small daily actions into visible progress.

🚧 Future Improvements

Potential future enhancements:

Push/email reminders
Progressive Web App support
Offline check-ins with synchronization
More advanced habit analytics
Weekly/monthly reports
Habit categories
Custom habit frequencies
Social accountability
Cloud deployment
CI/CD pipeline
👨‍💻 Developer

Built by Umang Kumar

Computer Science & Engineering

```text
Asia/Kolkata
America/New_York
Europe/London
