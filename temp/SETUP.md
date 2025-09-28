# Smart Assistant Setup Guide

## Phase 1: Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be fully provisioned

### 2. Get Your Credentials

1. Go to Project Settings → API
2. Copy the following values:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key (be careful with this one!)

### 3. Update Environment Variables

Update the `.env.local` file with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Set Up Database Schema

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the contents of `supabase-schema.sql`
4. Run the contents of `supabase-rls.sql`

### 5. Configure Google OAuth

1. In Supabase dashboard, go to Authentication → Providers
2. Enable Google provider
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://your-domain.com/auth/callback` (for production)

### 6. Test the Setup

1. Run `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to the login page
4. Try logging in with Google

## What's Been Created

### Database Tables
- **profiles**: User profile information
- **threads**: Chat conversation threads
- **messages**: Individual chat messages

### Authentication Flow
- Google OAuth integration
- Automatic profile creation on signup
- Protected routes via middleware

### File Structure
```
src/
├── lib/supabase/
│   ├── client.ts          # Client-side Supabase client
│   └── server.ts          # Server-side Supabase client
├── types/
│   └── supabase.ts        # TypeScript types for database
├── app/auth/
│   ├── callback/route.ts  # OAuth callback handler
│   ├── login/page.tsx     # Login page
│   └── auth-code-error/page.tsx # Error page
├── components/auth/
│   └── LoginForm.tsx      # Google login component
└── middleware.ts          # Route protection
```

## Next Steps

Once Supabase is set up and working:
1. Build the chat interface components
2. Add OpenAI integration for AI responses
3. Implement real-time message updates
4. Add thread management features