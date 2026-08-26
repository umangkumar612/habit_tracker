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

```text
Asia/Kolkata
America/New_York
Europe/London
