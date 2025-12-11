export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Forward Authorization header from the client (per-user token from OAuth).
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
        ...(authHeader ? { Authorization: String(authHeader) } : {}),
      },
      body: JSON.stringify(req.body || {}),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Notion Proxy] Error from Notion API', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('[Notion Proxy] Unexpected error calling Notion API', err);
    return res.status(500).json({ error: 'Unexpected error calling Notion API' });
  }
}


