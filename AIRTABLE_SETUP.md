# Airtable Setup Guide

This guide will walk you through setting up Airtable to collect form submissions from your sabbatical itinerary website.

> **⚠️ Important Update**: Airtable API keys are deprecated as of January 2024. This guide uses **Personal Access Tokens** instead, which are more secure and provide better access control.

## Step 1: Create an Airtable Account

1. Go to [airtable.com](https://airtable.com)
2. Sign up for a free account (if you don't have one)
3. Log in to your account

## Step 2: Create a New Base

1. Click the **"Add a base"** button (or **"+"** icon) in your workspace
2. Choose **"Start from scratch"**
3. Name your base (e.g., "Sabbatical Submissions" or "Recharge Itinerary")
4. Click **"Create base"**

## Step 3: Set Up the Table Structure

Your base will have a default table called "Table 1". We'll rename it and add the required fields.

### Rename the Table

1. Double-click on "Table 1" at the top
2. Rename it to **"Submissions"** (or any name you prefer - just remember to use it in your `.env` file)

### Add Fields

You need to create the following fields in your table:

#### Field 1: Name
1. Click the **"+"** button in the field header (right side of the table)
2. Field type: **"Single line text"**
3. Field name: **"Name"** (exactly as shown, case-sensitive)
4. Click **"Create field"**

#### Field 2: Destinations
1. Click the **"+"** button again
2. Field type: **"Long text"** (or "Multiple select" if you prefer - see note below)
3. Field name: **"Destinations"** (exactly as shown, case-sensitive)
4. Click **"Create field"**

**Note on Destinations field:**
- **Long text** (recommended): Stores destinations as comma-separated text (e.g., "Taiwan, Bali, Komodo")
- **Multiple select**: Allows you to create select options, but requires more setup. For simplicity, use "Long text".

#### Field 3: Created (Optional - Auto-generated)
Airtable automatically creates a "Created time" field, but if you want to explicitly add it:
1. Click the **"+"** button
2. Field type: **"Created time"**
3. Field name: **"Created"**
4. Click **"Create field"**

Your table should now look like this:

| Name | Destinations | Created |
|------|--------------|---------|
| (empty) | (empty) | (auto) |

## Step 4: Get Your Personal Access Token

⚠️ **Important**: Airtable API keys are deprecated as of January 2024. You must use Personal Access Tokens instead.

1. Go to [airtable.com/account](https://airtable.com/account)
2. Scroll down to the **"Personal access tokens"** section
3. Click **"Create new token"**
4. Give your token a name (e.g., "Recharge Website")
5. Set the scopes/permissions:
   - **Data**: `data.records:write` (to create records)
   - **Schema**: `schema.bases:read` (to read base structure)
6. Select the base(s) you want to grant access to
7. Click **"Create token"**
8. Copy the token immediately (it starts with `pat...` and won't be shown again)
9. **Important**: Keep this token secure and never commit it to version control

**Note**: Personal Access Tokens are more secure than API keys because you can:
- Set specific scopes (permissions)
- Restrict access to specific bases
- Revoke tokens individually
- See when tokens were last used

## Step 5: Get Your Base ID

1. Go back to your base in Airtable
2. Click on **"Help"** in the top menu
3. Select **"API documentation"** (or go directly to [airtable.com/api](https://airtable.com/api))
4. Select your base from the list
5. You'll see the Base ID in the URL or at the top of the API documentation page
   - It looks like: `appXXXXXXXXXXXXXX`
   - Example: `appAbc123Def456`
6. Copy this Base ID

Alternatively, you can find it in the base URL:
- Your base URL will be: `https://airtable.com/appXXXXXXXXXXXXXX/...`
- The part after `/app` is your Base ID

## Step 6: Configure Environment Variables

1. In your project root, create a `.env` file (if it doesn't exist):
   ```bash
   touch .env
   ```

2. Open `.env` in a text editor and add:
   ```
   PUBLIC_AIRTABLE_API_KEY=your_personal_access_token_here
   PUBLIC_AIRTABLE_BASE_ID=your_base_id_here
   PUBLIC_AIRTABLE_TABLE_NAME=Submissions
   ```

3. Replace the placeholders:
   - `your_personal_access_token_here` → Your Personal Access Token from Step 4 (starts with `pat...`)
   - `your_base_id_here` → Your Base ID from Step 5
   - `Submissions` → Your table name (if you used a different name)

**Example `.env` file:**
```
PUBLIC_AIRTABLE_API_KEY=patAbc123Def456Ghi789Jkl012Mno345
PUBLIC_AIRTABLE_BASE_ID=appXyZ123AbC456
PUBLIC_AIRTABLE_TABLE_NAME=Submissions
```

**Note**: The environment variable is still named `PUBLIC_AIRTABLE_API_KEY` for backward compatibility, but it should contain your Personal Access Token, not an API key.

## Step 7: Test the Integration

1. Make sure your `.env` file is in the project root
2. Start your development server:
   ```bash
   npm install
   npm run dev
   ```
3. Open your website in the browser
4. Click "Join Abhishek!" button
5. Fill out the form and submit
6. Go back to your Airtable base and check if a new record was created

## Troubleshooting

### Issue: "Airtable configuration is missing"
- **Solution**: Make sure your `.env` file exists and has all three variables set
- Restart your dev server after creating/updating `.env`

### Issue: "Failed to submit: 401 Unauthorized"
- **Solution**: 
  - Check that your Personal Access Token is correct and hasn't been revoked
  - Verify the token has the correct scopes (`data.records:write` and `schema.bases:read`)
  - Ensure the token has access to the base you're trying to write to
  - Create a new Personal Access Token if needed

### Issue: "Failed to submit: 404 Not Found"
- **Solution**: 
  - Verify your Base ID is correct
  - Check that your table name matches exactly (case-sensitive)
  - Make sure the field names match: "Name" and "Destinations"

### Issue: "Failed to submit: 422 Unprocessable Entity"
- **Solution**: Check that your field names in Airtable match exactly:
  - "Name" (not "name" or "NAME")
  - "Destinations" (not "destinations" or "DESTINATIONS")

## Security Notes

⚠️ **Important**: 
- The `.env` file is already in `.gitignore` and won't be committed
- For GitHub Pages deployment, you'll need to set these as environment variables in your build process
- Never share your Personal Access Token publicly
- Personal Access Tokens are more secure than API keys because you can:
  - Set specific scopes (permissions) - only grant `data.records:write` and `schema.bases:read`
  - Restrict access to specific bases
  - Revoke tokens individually if compromised
  - Monitor token usage

## Next Steps

Once set up, your form submissions will automatically appear in your Airtable base. You can:
- View all submissions in the table
- Export data to CSV/Excel
- Set up notifications for new submissions
- Create views to filter/organize submissions
- Integrate with other tools (Zapier, Make, etc.)

