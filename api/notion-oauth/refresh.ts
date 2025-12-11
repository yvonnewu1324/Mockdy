import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel serverless function to refresh Notion OAuth access tokens.
 * 
 * Security:
 * - Validates request body and environment variables
 * - Uses HTTP Basic Auth with base64-encoded credentials
 * - Never exposes CLIENT_SECRET to client
 * 
 * @see https://developers.notion.com/docs/authorization#step-6-refreshing-an-access-token
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Validate environment variables
  const {
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
  } = process.env;

  if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET) {
    console.error('[Notion OAuth] Missing required environment variables');
    return res.status(500).json({
      error: 'Notion OAuth not configured. Missing OAUTH_CLIENT_ID or OAUTH_CLIENT_SECRET',
    });
  }

  // Validate request body
  const { refresh_token } = req.body || {};
  if (!refresh_token || typeof refresh_token !== 'string') {
    return res.status(400).json({
      error: 'Missing or invalid `refresh_token` in request body',
    });
  }

  try {
    // Encode credentials for HTTP Basic Auth
    const encoded = Buffer.from(`${OAUTH_CLIENT_ID}:${OAUTH_CLIENT_SECRET}`).toString('base64');

    // Refresh the access token
    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${encoded}`,
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Notion OAuth] Token refresh failed', {
        status: response.status,
        error: data,
      });
      return res.status(response.status).json({
        error: data.error || 'Failed to refresh access token',
        ...(data.error_description && { error_description: data.error_description }),
      });
    }

    // Return new token response (includes new access_token and refresh_token)
    return res.status(200).json(data);
  } catch (err) {
    console.error('[Notion OAuth] Unexpected error during token refresh', err);
    return res.status(500).json({
      error: 'Unexpected error during Notion token refresh',
    });
  }
}

