# Notion OAuth Setup Guide

This project uses **Vercel serverless functions** to implement a secure Notion OAuth 2.0 flow, allowing each user to connect their own Notion workspace and store interview reports in their own database.

## Architecture

- **Frontend**: React app that calls `/api/*` endpoints
- **Backend**: Vercel serverless functions in `/api/` directory
- **OAuth Flow**: Public Notion integration following [Notion's OAuth documentation](https://developers.notion.com/docs/authorization)

## Security Features

✅ **Server-side token exchange** - CLIENT_SECRET never exposed to client  
✅ **Per-user tokens** - Each user connects their own workspace  
✅ **HTTP Basic Auth** - Properly encoded credentials for Notion API  
✅ **Token refresh** - Automatic token renewal support  
✅ **Input validation** - All endpoints validate requests  

## Setup Instructions

### 1. Create Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click **"New integration"**
3. Select **"Public"** integration type
4. Fill in:
   - **Name**: Mockdy (or your app name)
   - **Company website**: Your website URL
   - **Redirect URI**: 
     - Dev: `http://localhost:3000`
     - Production: `https://yourdomain.com`
5. Copy the **OAuth client ID** and **OAuth client secret**

### 2. Configure Environment Variables

#### Local Development

Create a `.env` file in the project root:

```bash
OAUTH_CLIENT_ID=your-client-id-here
OAUTH_CLIENT_SECRET=your-client-secret-here
OAUTH_REDIRECT_URI=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key
```

#### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - `OAUTH_CLIENT_ID` = your Notion OAuth client ID
   - `OAUTH_CLIENT_SECRET` = your Notion OAuth client secret
   - `OAUTH_REDIRECT_URI` = your production URL (e.g., `https://yourdomain.com`)
   - `GEMINI_API_KEY` = your Gemini API key

**Important**: Make sure `OAUTH_REDIRECT_URI` in Vercel matches exactly what you configured in Notion integration settings.

### 3. Local Development

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Run dev server with serverless functions
npm run vercel-dev
```

This runs both the frontend and API routes locally.

#### Option B: Using Vite Dev Server

```bash
# Terminal 1: Run Vite dev server
npm run dev

# Terminal 2: Run Vercel dev for API routes
npm run vercel-dev
```

### 4. Production Deployment

```bash
# Deploy to Vercel
vercel

# Or connect your GitHub repo to Vercel for automatic deployments
```

## API Endpoints

### `GET /api/notion-oauth/url`

Generates Notion OAuth authorization URL.

**Response:**
```json
{
  "url": "https://api.notion.com/v1/oauth/authorize?client_id=...&..."
}
```

### `POST /api/notion-oauth/token`

Exchanges authorization code for access/refresh tokens.

**Request:**
```json
{
  "code": "authorization-code-from-notion"
}
```

**Response:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "bot_id": "...",
  "workspace_id": "...",
  "workspace_name": "..."
}
```

### `POST /api/notion-oauth/refresh`

Refreshes an expired access token.

**Request:**
```json
{
  "refresh_token": "refresh-token-from-storage"
}
```

**Response:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "bot_id": "..."
}
```

### `POST /api/notion/pages`

Proxies Notion API page creation requests.

**Headers:**
```
Authorization: Bearer <user-access-token>
Content-Type: application/json
```

**Request:** Standard Notion API page creation payload.

## User Flow

1. User clicks **"Connect Notion"** button
2. App calls `/api/notion-oauth/url` to get authorization URL
3. User is redirected to Notion OAuth page
4. User authorizes and selects workspace pages
5. Notion redirects back to `OAUTH_REDIRECT_URI` with `?code=...`
6. App calls `/api/notion-oauth/token` to exchange code for tokens
7. Tokens are stored in browser localStorage (per-user, per-browser)
8. User pastes their Notion database ID
9. Future interview reports are saved to user's database using their access token

## Database Schema

Your Notion database should have these properties:

- **Title** (title) - Required
- **Type** (select) - Options: `TECHNICAL`, `BEHAVIORAL`, `SYSTEM_DESIGN`
- **Score** (number) - Overall score out of 10
- **Date** (date) - When the session occurred

## Troubleshooting

### "Failed to get Notion authorization URL"

- Check that `OAUTH_CLIENT_ID` and `OAUTH_REDIRECT_URI` are set
- Verify environment variables are loaded correctly

### "Failed to exchange authorization code"

- Check that `OAUTH_CLIENT_SECRET` is set
- Verify `OAUTH_REDIRECT_URI` matches exactly what's in Notion settings
- Ensure the authorization code hasn't expired (codes expire quickly)

### "Missing Authorization header" when saving pages

- User needs to complete OAuth flow first
- Check that tokens are stored in localStorage
- Verify the access token hasn't expired (use refresh endpoint)

### CORS errors in development

- Use `vercel dev` to run API routes locally
- Or configure Vite proxy correctly (see `vite.config.ts`)

## Security Best Practices

1. **Never commit `.env` files** - They contain secrets
2. **Use environment variables** - Never hardcode credentials
3. **Validate redirect URIs** - Always match exactly
4. **Use HTTPS in production** - Required for OAuth
5. **Store tokens securely** - Currently using localStorage (consider more secure options for production)

## References

- [Notion OAuth Documentation](https://developers.notion.com/docs/authorization)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [OAuth 2.0 Specification](https://oauth.net/2/)

