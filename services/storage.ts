import { StoredSession, NotionConnection } from '../types';

const STORAGE_KEY = 'mockdy_history_v1';
const NOTION_CONNECTION_KEY = 'mockdy_notion_connection_v1';

export const getSessions = (): StoredSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveSession = (session: StoredSession) => {
  try {
    const sessions = getSessions();
    const newSessions = [session, ...sessions];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
  } catch (e) {
    console.error("Failed to save session", e);
  }
};

export const deleteSession = (id: string) => {
  try {
    const sessions = getSessions();
    const newSessions = sessions.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
  } catch (e) {
    console.error("Failed to delete session", e);
  }
};

export const getNotionConnection = (): NotionConnection | null => {
  try {
    const raw = localStorage.getItem(NOTION_CONNECTION_KEY);
    return raw ? (JSON.parse(raw) as NotionConnection) : null;
  } catch (e) {
    console.error('Failed to load Notion connection', e);
    return null;
  }
};

export const saveNotionConnection = (connection: NotionConnection) => {
  try {
    localStorage.setItem(NOTION_CONNECTION_KEY, JSON.stringify(connection));
  } catch (e) {
    console.error('Failed to save Notion connection', e);
  }
};

export const clearNotionConnection = () => {
  try {
    localStorage.removeItem(NOTION_CONNECTION_KEY);
  } catch (e) {
    console.error('Failed to clear Notion connection', e);
  }
};