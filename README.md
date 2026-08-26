# HabitFlow

### Build better habits. One local day at a time. 🔥

HabitFlow is a modern, timezone-aware habit tracking application designed to help users build consistent habits through daily check-ins, streak tracking, history, analytics, and progress visualization.

The core idea behind HabitFlow is simple:

> **A streak belongs to a user's local calendar days — not elapsed hours.**

That means a habit remains consistent according to the user's own timezone, even when check-ins are made across different UTC times.

---

## ✨ Live Experience

📦 **Repository:** [View Source Code](https://github.com/umangkumar612/habit_tracker)

---
<img width="951" height="512" alt="{DA8E5BB6-E54F-46FD-A51F-4D37880EB9CF}" src="https://github.com/user-attachments/assets/098e5c60-2476-4052-8486-25f19da846e2" />

## 📸 Preview

### Dashboard

![HabitFlow Dashboard](screenshots/dashboard.png)

### Habits

![HabitFlow Habits](screenshots/habits.png)

### Analytics

![HabitFlow Analytics](screenshots/analytics.png)

### History

![HabitFlow History](screenshots/history.png)

> Replace the screenshot paths above with your actual screenshots.

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

```text
Asia/Kolkata
America/New_York
Europe/London
