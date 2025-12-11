import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel serverless function to generate Notion OAuth authorization URL.
 * 
 * Security:
 * - Validates required environment variables
 * - Returns authorization URL without exposing secrets
 * - Follows Notion OAuth 2.0 specification
 * 
 * @see https://developers.notion.com/docs/authorization
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Validate environment variables
  const {
    OAUTH_CLIENT_ID,
    OAUTH_REDIRECT_URI,
    NOTION_AUTH_URL = 'https://api.notion.com/v1/oauth/authorize',
  } = process.env;

  if (!OAUTH_CLIENT_ID || !OAUTH_REDIRECT_URI) {
    console.error('[Notion OAuth] Missing required environment variables');
    return res.status(500).json({
      error: 'Notion OAuth not configured. Missing OAUTH_CLIENT_ID or OAUTH_REDIRECT_URI',
    });
  }

  try {
    // Build authorization URL per Notion OAuth spec
    const baseUrl = new URL(NOTION_AUTH_URL);
    baseUrl.searchParams.set('client_id', OAUTH_CLIENT_ID);
    baseUrl.searchParams.set('response_type', 'code');
    baseUrl.searchParams.set('redirect_uri', OAUTH_REDIRECT_URI);
    // Workspace-level token (recommended for most integrations)
    baseUrl.searchParams.set('owner', 'workspace');

    return res.status(200).json({ url: baseUrl.toString() });
  } catch (err) {
    console.error('[Notion OAuth] Failed to build authorization URL', err);
    return res.status(500).json({
      error: 'Failed to build Notion authorization URL',
    });
  }
}

