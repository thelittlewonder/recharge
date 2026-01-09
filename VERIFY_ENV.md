# Environment Variables Verification Checklist

## Quick Verification Steps

### 1. Check .env File Location
✅ Your `.env` file should be in the project root (same directory as `package.json`)
- Current location: `/Users/abhishk/Downloads/recharge/.env` ✅

### 2. Check .env File Format

Your `.env` file should look exactly like this (no quotes, no spaces around `=`):

```
PUBLIC_AIRTABLE_API_KEY=patYourActualTokenHere
PUBLIC_AIRTABLE_BASE_ID=appYourActualBaseIdHere
PUBLIC_AIRTABLE_TABLE_NAME=Submissions
```

**Common mistakes to avoid:**
- ❌ `PUBLIC_AIRTABLE_API_KEY = "pat..."` (spaces around =, quotes)
- ❌ `PUBLIC_AIRTABLE_API_KEY=your_personal_access_token_here` (placeholder not replaced)
- ❌ `AIRTABLE_API_KEY=pat...` (missing `PUBLIC_` prefix)
- ✅ `PUBLIC_AIRTABLE_API_KEY=pat...` (correct format)

### 3. Verify Variable Names

Make sure these exact names are used (case-sensitive):
- `PUBLIC_AIRTABLE_API_KEY` (not `PUBLIC_AIRTABLE_TOKEN` or `AIRTABLE_API_KEY`)
- `PUBLIC_AIRTABLE_BASE_ID` (not `PUBLIC_AIRTABLE_BASE` or `BASE_ID`)
- `PUBLIC_AIRTABLE_TABLE_NAME` (optional, defaults to "Submissions")

### 4. Check Values

- **API Key**: Should start with `pat` (Personal Access Token)
- **Base ID**: Should start with `app` (Airtable base identifier)
- **Table Name**: Should match your Airtable table name exactly (case-sensitive)

### 5. Restart Dev Server

**CRITICAL**: After creating or modifying `.env`, you MUST restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

Environment variables are only loaded when the server starts!

### 6. Test the Error Message

The improved error message will now tell you exactly which variable is missing. Try submitting the form again and check the error message - it should say something like:

- "Missing: PUBLIC_AIRTABLE_API_KEY" (if API key is missing)
- "Missing: PUBLIC_AIRTABLE_BASE_ID" (if Base ID is missing)
- "Missing: PUBLIC_AIRTABLE_API_KEY, PUBLIC_AIRTABLE_BASE_ID" (if both are missing)

## Manual Verification

You can manually check your `.env` file by running:

```bash
cat .env
```

Look for:
1. All three variables present
2. No placeholder text (`your_personal_access_token_here`, `your_base_id_here`)
3. Values start with correct prefixes (`pat...` and `app...`)
4. No extra spaces or quotes

## Still Having Issues?

If you've verified all the above and still get the error:

1. **Double-check the file is saved** - Make sure you saved the `.env` file after editing
2. **Check for hidden characters** - Sometimes copy-paste can add invisible characters
3. **Verify you're running `npm run dev`** - Not opening `build/index.html` directly
4. **Check terminal output** - Look for any warnings about environment variables when starting the dev server

