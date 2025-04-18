# Authentication Setup Guide

This document explains how to set up authentication for the SevaBook application.

## Overview

SevaBook uses Supabase for authentication with Google Sign-In as the only authentication method. The application has role-based access control with the following roles:

- **Super Admin**: Full access to all features (arindamdawn3@gmail.com)
- **Admin**: Access to dashboard, inventory, POS, barcode management, reports, and settings (arindam.dawn@monet.work)
- **Seller**: Access to POS only (projectiskcon@gmail.com)
- **Manager**: Access to inventory and barcode management (arindam@appexert.com)

## Supabase Setup

1. **Enable Google OAuth Provider**:
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Providers
   - Enable Google provider
   - Set up OAuth credentials in Google Cloud Console
   - Add the Client ID and Client Secret to Supabase

2. **Configure Redirect URLs**:
   - Add the following redirect URL to your Google OAuth configuration:
     ```
     https://your-app-url.com/auth/callback
     ```
   - Also add the same URL to the Supabase Redirect URLs configuration

3. **Run Database Migrations**:
   - The migration script in `supabase/migrations/20240101000000_create_users_table.sql` will:
     - Create the users table
     - Set up Row Level Security policies
     - Create triggers for new user signup and login
     - Restrict signup to only allowed email addresses

## Local Development

For local development, make sure you have the following environment variables set in your `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Authentication Flow

1. User clicks "Sign in with Google" on the login page
2. User is redirected to Google's authentication page
3. After successful authentication, Google redirects back to `/auth/callback`
4. The callback page processes the authentication and redirects to the home page
5. The home page checks the user's role and redirects to the appropriate dashboard

## Allowed Users

Only the following email addresses are allowed to sign in:

- arindamdawn3@gmail.com (Super Admin)
- arindam.dawn@monet.work (Admin)
- projectiskcon@gmail.com (Seller)
- arindam@appexert.com (Manager)

Any other email address will not be able to create an account or sign in.

## Troubleshooting

If you encounter authentication issues:

1. Check the browser console for errors
2. Verify that the Supabase URL and Anon Key are correct
3. Make sure the Google OAuth credentials are properly configured
4. Check that the redirect URLs are correctly set up
5. Verify that the user's email is in the allowed list
