# Keep-Alive Service for Supabase Projects

This project provides a simple solution to prevent free-tier Supabase databases from pausing due to inactivity. It utilizes the Supabase Management API to list all your projects and executes a lightweight SQL query on each project's database to keep them active.

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Deploy the Supabase Function](#4-deploy-the-supabase-function)
- [Scheduling the Keep-Alive Function](#scheduling-the-keep-alive-function)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Supabase pauses databases on free-tier projects after 7 days of inactivity to conserve resources. For personal projects, this can mean that demo apps frequently pause themselves, breaking the app. This keep-alive example repo demonstrates how to keep your supabase projects alive by periodically pinging all your Supabase projects to prevent them from pausing.

## Prerequisites

- **Supabase Account** with access to the [Management API](https://supabase.com/docs/reference/api/management-api)
- **Supabase CLI** installed globally (`npm install -g supabase`)

## Project Structure

```
keep-supabase-alive/
├── supabase/
│   └── functions/
│       └── keep-supabase-alive/
│           └── index.ts
│   └── config.toml
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
```

- `supabase/functions/keep-supabase-alive/index.ts`: The Edge Function that performs the keep-supabase-alive operation.
- `.env`: Environment variables file (contains sensitive information).
- `.gitignore`: Specifies intentionally untracked files to ignore.
- `package.json`: Lists dependencies and project scripts.
- `tsconfig.json`: TypeScript configuration file.
- `config.toml`: Configuration file for Supabase functions.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/keep-supabase-alive.git
cd keep-supabase-alive
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add your Supabase Management API access token:

```bash
MANAGEMENT_SUPABASE_ACCESS_TOKEN=your_supabase_access_token
```

### 4. Deploy the Supabase Function

Log in to the Supabase CLI:

```bash
supabase login
```

Initialize the Supabase project if you haven't already:

```bash
supabase init
```

Link your project to the Supabase CLI:

```bash
supabase projects list
supabase link --project-ref <project-ref>
```

Deploy the Edge Function:

```bash
supabase functions deploy keep-supabase-alive --no-verify-jwt
```

> **Note:** The `--no-verify-jwt` flag allows public access to the function without requiring authentication. Use it carefully.

## Scheduling the Keep-Alive Function

Since Supabase Edge Functions don't support scheduled triggers internally, you can either use (Supabase to schedule the edge function)[https://supabase.com/docs/guides/functions/schedule-functions] or use an external service to call the function periodically. I use cron-job.org because of its simplicity and I have a few other projects that use it.

### Using cron-job.org

1. **Sign Up**: Create a free account at [cron-job.org](https://cron-job.org/).

2. **Create a New Cron Job**:

   - **URL**: Use the URL of your deployed function:
     ```
     https://your-project-ref.supabase.co/functions/v1/keep-supabase-alive
     ```
     Replace `your-project-ref` with your Supabase project reference ID.
   - **Scheduling**: Set the interval to run daily or as preferred.
   - **HTTP Method**: Ensure it's set to `GET`.

3. **Save and Test**: Save the cron job and use the "Run Now" feature to test it.

### Alternative Services

- **UptimeRobot**: Monitor the function URL with a scheduled ping.
- **GitHub Actions**: Use scheduled workflows to trigger the function.
