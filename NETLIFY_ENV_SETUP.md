# Setting up Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Navigate to your site settings
3. Go to "Environment variables" under "Build & deploy"
4. Add the following environment variables:

```
VITE_SUPABASE_URL=https://tkrcepveidejmaxkdhtb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcmNlcHZlaWRlam1heGtkaHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjYzODcsImV4cCI6MjA2NDEwMjM4N30.ti7qMftHxhZ7niDT1f3ShZ7tHc6kA5YqXsdbFQ9uek8
```

5. After adding the environment variables, trigger a new deploy 