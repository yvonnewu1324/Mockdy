const {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URI,
} = process.env as {
  OAUTH_CLIENT_ID?: string;
  OAUTH_CLIENT_SECRET?: string;
  OAUTH_REDIRECT_URI?: string;
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET || !OAUTH_REDIRECT_URI) {
    return res.status(500).json({
      error: 'Notion OAuth not configured on server (missing OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, or OAUTH_REDIRECT_URI)',
    });
  }

  const { code } = req.body || {};
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing `code` in request body' });
  }

  try {
    const encoded = Buffer.from(`${OAUTH_CLIENT_ID}:${OAUTH_CLIENT_SECRET}`).toString('base64');

    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${encoded}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: OAUTH_REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Notion OAuth] Token exchange failed', data);
      return res.status(response.status).json(data);
    }

    // Forward Notion's token response (access_token, refresh_token, workspace info, etc.)
    return res.status(200).json(data);
  } catch (err) {
    console.error('[Notion OAuth] Unexpected error during token exchange', err);
    return res.status(500).json({ error: 'Unexpected error during Notion token exchange' });
  }
}


