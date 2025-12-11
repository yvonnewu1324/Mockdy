import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel serverless function to proxy Notion API page creation requests.
 * 
 * Security:
 * - Validates Authorization header is present
 * - Forwards user's access token (never uses a global token)
 * - Adds required Notion-Version header
 * - Validates request body structure
 * 
 * This endpoint allows the frontend to create pages in the user's Notion workspace
 * using their own OAuth access token.
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

  // Validate Authorization header (user's access token)
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({
      error: 'Missing Authorization header. Please connect your Notion workspace.',
    });
  }

  // Validate request body
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      error: 'Invalid request body',
    });
  }

  try {
    // Forward request to Notion API with user's token
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
        Authorization: authHeader,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Notion Proxy] Error from Notion API', {
        status: response.status,
        error: data,
      });
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('[Notion Proxy] Unexpected error calling Notion API', err);
    return res.status(500).json({
      error: 'Unexpected error calling Notion API',
    });
  }
}

