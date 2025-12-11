const {
  OAUTH_CLIENT_ID,
  OAUTH_REDIRECT_URI,
  NOTION_AUTH_URL = 'https://api.notion.com/v1/oauth/authorize',
} = process.env as {
  OAUTH_CLIENT_ID?: string;
  OAUTH_REDIRECT_URI?: string;
  NOTION_AUTH_URL?: string;
};

console.log('[env check]', {
  hasClientId: !!OAUTH_CLIENT_ID,
  hasRedirect: !!OAUTH_REDIRECT_URI,
});
export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!OAUTH_CLIENT_ID || !OAUTH_REDIRECT_URI) {
    return res
      .status(500)
      .json({ error: 'Notion OAuth not configured on server (missing OAUTH_CLIENT_ID or OAUTH_REDIRECT_URI)' });
  }

  try {
    const baseUrl = new URL(NOTION_AUTH_URL!);
    baseUrl.searchParams.set('client_id', OAUTH_CLIENT_ID);
    baseUrl.searchParams.set('response_type', 'code');
    baseUrl.searchParams.set('redirect_uri', OAUTH_REDIRECT_URI);
    // Workspace-level token by default, consistent with Notion public integration docs:
    // https://developers.notion.com/docs/authorization#what-is-a-public-integration
    baseUrl.searchParams.set('owner', 'workspace');

    res.status(200).json({ url: baseUrl.toString() });
  } catch (err) {
    console.error('[Notion OAuth] Failed to build authorization URL', err);
    res.status(500).json({ error: 'Failed to build Notion authorization URL' });
  }
}


