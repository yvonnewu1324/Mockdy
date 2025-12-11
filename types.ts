export type InterviewType = 'TECHNICAL' | 'BEHAVIORAL' | 'SYSTEM_DESIGN';

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// Problem info for technical interviews
export interface ProblemInfo {
  id: number;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

export interface InterviewState {
  isActive: boolean;
  type: InterviewType | null;
  messages: Message[];
  codeOrNotes: string; // Used for code editor or design notes
  isLoading: boolean;
  problemInfo?: ProblemInfo; // For technical interviews
}

export interface FeedbackData {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  optimalSolution: string;
}

export interface InterviewConfig {
  title: string;
  description: string;
  icon: string;
  systemInstruction: string;
  initialMessage: string;
}

export interface StoredSession {
  id: string;
  timestamp: number;
  type: InterviewType;
  messages: Message[];
  codeOrNotes: string;
  feedback: FeedbackData;
  problemInfo?: ProblemInfo; // For technical interviews
}

// Per-user Notion connection, stored locally in the browser.
// Tokens are scoped to the user's own workspace via the OAuth flow:
// https://developers.notion.com/docs/authorization
export interface NotionConnection {
  accessToken: string;
  refreshToken?: string;
  workspaceId?: string;
  workspaceName?: string;
  workspaceIcon?: string | null;
  botId?: string;
  // The database where this user wants reports to be stored.
  // They can paste this manually, or you can extend the app to pick from a list.
  databaseId?: string;
}
