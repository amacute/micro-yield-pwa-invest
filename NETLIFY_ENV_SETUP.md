# Setting up Environment Variables in Netlify

## Database Connection Setup

1. Go to your Supabase dashboard
2. Navigate to Project Settings > Database
3. Under "Connection Info", select "Connection Pooling" (recommended for web applications)
4. Copy the Connection URI and credentials

## Netlify Environment Variables Setup

1. Go to your Netlify dashboard
2. Navigate to Site settings > Build & deploy > Environment variables
3. Add the following environment variables:

```bash
# Supabase Connection (from Project Settings > API)
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Database Connection (from Project Settings > Database)
DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres
```

4. Replace `[YOUR-PASSWORD]` and `[YOUR-PROJECT-REF]` with your actual values
5. Make sure to use port 6543 for connection pooling (PgBouncer)
6. After adding the environment variables, trigger a new deploy

## Important Notes

- Use Connection Pooling (PgBouncer) for better performance and scalability
- The pooler is configured to handle up to 95 concurrent connections
- Sessions are automatically managed with token refresh
- Database schema is set to 'public' by default
- Custom application headers are added for monitoring 