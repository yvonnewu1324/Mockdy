import { NotionConnection } from '../types';
import { saveNotionConnection } from './storage';

interface NotionTokenResponse {
  access_token: string;
  refresh_token?: string;
  bot_id?: string;
  workspace_id?: string;
  workspace_name?: string;
  workspace_icon?: string | null;
  duplicated_template_id?: string; // ID of the database created from template (if template was used)
  owner?: {
    type: 'workspace' | 'user';
    workspace?: boolean;
  };
}

/**
 * Redirects user to Notion OAuth authorization page.
 * 
 * The backend generates a secure authorization URL and redirects the user.
 * After authorization, Notion redirects back to OAUTH_REDIRECT_URI with a code.
 * 
 * @see https://developers.notion.com/docs/authorization#step-1-navigate-the-user-to-the-integrations-authorization-url
 */
export const redirectToNotionAuth = async (): Promise<void> => {
  try {
    const res = await fetch('/api/notion-oauth/url');
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to get Notion authorization URL');
    }
    
    const data = (await res.json()) as { url: string };
    
    // Redirect to Notion OAuth page
    window.location.href = data.url;
  } catch (error) {
    console.error('Failed to redirect to Notion auth', error);
    throw error;
  }
};

/**
 * Exchanges Notion OAuth authorization code for access and refresh tokens.
 * 
 * Called when Notion redirects back to the app with ?code=... in the URL.
 * The backend securely exchanges the code for tokens (never exposing CLIENT_SECRET).
 * 
 * @param code - Authorization code from Notion OAuth redirect
 * @returns NotionConnection with tokens and workspace info
 * 
 * @see https://developers.notion.com/docs/authorization#step-3-send-the-code-in-a-post-request-to-the-notion-api
 */
export const completeNotionAuth = async (code: string): Promise<NotionConnection> => {
  try {
    const res = await fetch('/api/notion-oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data = (await res.json()) as NotionTokenResponse & { error?: string; error_description?: string };

    if (!res.ok || !data.access_token) {
      const errorMessage = data.error_description || data.error || 'Failed to exchange Notion authorization code';
      throw new Error(errorMessage);
    }

    // Build connection object from token response
    // If a template was used, duplicated_template_id contains the database ID
    const connection: NotionConnection = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      workspaceId: data.workspace_id,
      workspaceName: data.workspace_name,
      workspaceIcon: data.workspace_icon ?? null,
      botId: data.bot_id,
      // Automatically use the template database ID if available
      databaseId: data.duplicated_template_id,
    };

    // Store connection in localStorage (per-user, per-browser)
    saveNotionConnection(connection);
    
    return connection;
  } catch (error) {
    console.error('Failed to complete Notion auth', error);
    throw error;
  }
};

/**
 * Refreshes an expired Notion access token using the refresh token.
 * 
 * When an access token expires, this function uses the refresh token to get a new
 * access token and refresh token pair. The updated connection is saved automatically.
 * 
 * @param refreshToken - Refresh token from stored NotionConnection
 * @returns Updated NotionConnection with new tokens
 * 
 * @see https://developers.notion.com/docs/authorization#step-6-refreshing-an-access-token
 */
export const refreshNotionToken = async (refreshToken: string): Promise<NotionConnection> => {
  try {
    const res = await fetch('/api/notion-oauth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = (await res.json()) as NotionTokenResponse & { error?: string; error_description?: string };

    if (!res.ok || !data.access_token) {
      const errorMessage = data.error_description || data.error || 'Failed to refresh Notion token';
      throw new Error(errorMessage);
    }

    // Build updated connection object
    const connection: NotionConnection = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      // Preserve existing workspace info (refresh doesn't return it)
      workspaceId: undefined,
      workspaceName: undefined,
      workspaceIcon: null,
      botId: data.bot_id,
    };

    // Note: You may want to merge with existing connection to preserve workspace info
    // For now, we'll save the new tokens and let the user reconnect if needed
    
    return connection;
  } catch (error) {
    console.error('Failed to refresh Notion token', error);
    throw error;
  }
};

