import { NotionConnection } from '../types';
import { saveNotionConnection } from './storage';

interface NotionTokenResponse {
  access_token: string;
  refresh_token?: string;
  bot_id?: string;
  workspace_id?: string;
  workspace_name?: string;
  workspace_icon?: string | null;
}

/**
 * Ask the backend for a Notion OAuth authorization URL and redirect the user.
 * The backend hides CLIENT_SECRET as recommended in the Notion docs:
 * https://developers.notion.com/docs/authorization#step-1-navigate-the-user-to-the-integrations-authorization-url
 */
export const redirectToNotionAuth = async () => {
  const res = await fetch('/api/notion-oauth/url');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to get Notion authorization URL');
  }
  const data = (await res.json()) as { url: string };
  window.location.href = data.url;
};

/**
 * Called on the redirect_uri page once Notion sends back a temporary ?code=...
 * Exchanges the code for an access_token / refresh_token pair via the backend,
 * then stores a NotionConnection in localStorage scoped to this browser.
 */
export const completeNotionAuth = async (code: string): Promise<NotionConnection> => {
  const res = await fetch('/api/notion-oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  const data = (await res.json()) as NotionTokenResponse & { error?: string };

  if (!res.ok || !data.access_token) {
    throw new Error(data.error || 'Failed to exchange Notion authorization code');
  }

  const connection: NotionConnection = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    workspaceId: data.workspace_id,
    workspaceName: data.workspace_name,
    workspaceIcon: data.workspace_icon ?? null,
    botId: data.bot_id,
  };

  saveNotionConnection(connection);
  return connection;
};


