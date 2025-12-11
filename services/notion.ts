/// <reference types="../vite-env" />
import { NotionConnection, StoredSession } from '../types';
import { getNotionConnection, clearNotionConnection } from './storage';
import { refreshNotionToken } from './notionAuth';

// API base URL - routes to Vercel serverless function
// In production: automatically handled by Vercel
// In dev: use `vercel dev` to run serverless functions locally
const NOTION_API_BASE = '/api/notion';

interface NotionResponse {
  success: boolean;
  error?: string;
  pageId?: string;
}

/**
 * Saves a mock interview session to a Notion database.
 * 
 * Expected Notion Database Schema:
 * - Title (title): Session title
 * - Type (select): Interview type (TECHNICAL, BEHAVIORAL, SYSTEM_DESIGN)
 * - Score (number): Overall score out of 10
 * - Date (date): When the session occurred
 * 
 * Page Content Sections:
 * - Summary (section with text)
 * - Strengths (section with bullet points)
 * - Weaknesses (section with bullet points)
 * - Interview Transcript (section)
 * - Code/Notes (code block)
 * - Optimal Solution (code block)
 * Saves a mock interview session to a Notion database owned by the user.
 * Uses a per-user NotionConnection obtained via OAuth instead of a single
 * global integration token, following:
 * https://developers.notion.com/docs/authorization
 */
export const saveToNotion = async (
  session: StoredSession,
  connection?: NotionConnection | null
): Promise<NotionResponse> => {
  const notionConnection = connection ?? getNotionConnection();

  if (!notionConnection?.accessToken) {
    console.warn('Notion workspace not connected. User must complete OAuth flow.');
    return { success: false, error: 'Notion workspace not connected. Please connect your workspace first.' };
  }

  if (!notionConnection?.databaseId) {
    console.warn('Notion database ID not configured. User must provide a database ID.');
    return { success: false, error: 'Notion database ID not configured. Please paste your database ID in settings.' };
  }

  try {
    // Format the transcript for Notion (limit to 2000 chars per rich_text block)
    const transcript = session.messages
      .map(m => `${m.role === 'user' ? '👤 You' : '🤖 Interviewer'}: ${m.text}`)
      .join('\n\n');
    
    const truncatedTranscript = transcript.length > 2000 
      ? transcript.substring(0, 1997) + '...' 
      : transcript;

    const truncatedCode = session.codeOrNotes.length > 2000
      ? session.codeOrNotes.substring(0, 1997) + '...'
      : session.codeOrNotes;

    const truncatedSummary = session.feedback.summary.length > 2000
      ? session.feedback.summary.substring(0, 1997) + '...'
      : session.feedback.summary;

    const truncatedOptimal = session.feedback.optimalSolution.length > 2000
      ? session.feedback.optimalSolution.substring(0, 1997) + '...'
      : session.feedback.optimalSolution;

    // handle optimal solution heading for technical and non-technical sessions
    const solutionHeading =
      session.type === "TECHNICAL"
        ? "✨ Optimal Solution"
        : "🧭 Recommended Approach / Standard Answer";
    
    // Generate title based on interview type
    const generateTitle = (): string => {
      if (session.type === 'TECHNICAL') {
        // Use stored problemInfo if available
        if (session.problemInfo) {
          return `Mock Leetcode ${session.problemInfo.id}. ${session.problemInfo.name}`;
        }
        // Fallback: Try to extract from first message
        const firstMessage = session.messages.find(m => m.role === 'model')?.text || '';
        const leetcodeMatch = firstMessage.match(/(?:LeetCode|Leetcode|LC)\s*#?\s*(\d+)/i);
        if (leetcodeMatch) {
          return `Mock Leetcode ${leetcodeMatch[1]}`;
        }
        return 'Mock Leetcode';
      } else if (session.type === 'SYSTEM_DESIGN') {
        // Try to extract system name after "design" keyword
        const firstMessage = session.messages.find(m => m.role === 'model')?.text || '';
        const designMatch = firstMessage.match(/(?:design|Design|build|Build)\s+(?:a\s+)?(?:system\s+for\s+)?["']?([^"'\n]{1,50})["']?/i)
          || firstMessage.match(/["']([^"'\n]{1,50})["']/);
        if (designMatch && designMatch[1].length > 3) {
          const systemName = designMatch[1].trim().charAt(0).toUpperCase() + designMatch[1].trim().slice(1);
          return `Design ${systemName}`;
        }
        return 'Design System';
      } else {
        // BEHAVIORAL
        return 'Mock BQ';
      }
    };
    
    const pageTitle = generateTitle();
    
    // Prepare request body (reused for retry after refresh)
    const requestBody = {
      parent: {
        database_id: notionConnection.databaseId,
      },
      properties: {
        // Title property (required for every Notion database)
        'Title': {
          title: [
            {
              text: {
                content: pageTitle,
              },
            },
          ],
        },
        // Select property for interview type
        'Type': {
          select: {
            name: session.type,
          },
        },
        // Number property for score
        'Score': {
          number: session.feedback.score,
        },
        // Date property
        'Date': {
          date: {
            start: new Date(session.timestamp).toISOString(),
          },
        },
      },
      // Add page content sections
      children: [
          //
          // === SUMMARY ===
          //
          {
            object: "block",
            type: "heading_1",
            heading_1: {
              rich_text: [{ type: "text", text: { content: "📊 Summary" } }],
            },
          },
          {
            object: "block",
            type: "callout",
            callout: {
              icon: { emoji: "💡" },
              color: "yellow_background",
              rich_text: [
                {
                  type: "text",
                  text: { content: truncatedSummary || "No summary available." },
                  annotations: {
                    bold: true,
                  },
                },
              ],
            },
          },
        
          { object: "block", type: "divider", divider: {} },
        
          //
          // === PERFORMANCE REVIEW (2 COLUMNS) ===
          //
          {
            object: "block",
            type: "heading_2",
            heading_2: {
              rich_text: [{ type: "text", text: { content: "Performance Review" } }],
            },
          },
        
          {
            object: "block",
            type: "column_list",
            column_list: {
              children: [
                //
                // Column 1 — Strengths
                //
                {
                  object: "block",
                  type: "column",
                  column: {
                    children: [
                      {
                        object: "block",
                        type: "heading_3",
                        heading_3: {
                          rich_text: [
                            { type: "text", text: { content: "✅ Strengths" } },
                          ],
                        },
                      },
                      ...session.feedback.strengths.map((s) => ({
                        object: "block",
                        type: "bulleted_list_item",
                        bulleted_list_item: {
                          rich_text: [{ type: "text", text: { content: s } }],
                        },
                      })),
                    ],
                  },
                },
        
                //
                // Column 2 — Weaknesses
                //
                {
                  object: "block",
                  type: "column",
                  column: {
                    children: [
                      {
                        object: "block",
                        type: "heading_3",
                        heading_3: {
                          rich_text: [
                            {
                              type: "text",
                              text: { content: "⚠️ Areas for Improvement" },
                            },
                          ],
                        },
                      },
                      ...session.feedback.weaknesses.map((w) => ({
                        object: "block",
                        type: "bulleted_list_item",
                        bulleted_list_item: {
                          rich_text: [{ type: "text", text: { content: w }, annotations: { color: "red", bold: true } }],
                        },
                      })),
                    ],
                  },
                },
              ],
            },
          },
        
          { object: "block", type: "divider", divider: {} },
        
          //
          // === INTERVIEW TRANSCRIPT (H2 + toggle) ===
          //
          {
            object: "block",
            type: "heading_2",
            heading_2: {
              rich_text: [
                { type: "text", text: { content: "📝 Interview Transcript" } }
              ]
            }
          },
          {
            object: "block",
            type: "toggle",
            toggle: {
              rich_text: [
                { type: "text", text: { content: "View Transcript" } }
              ],
              children: [
                {
                  object: "block",
                  type: "paragraph",
                  paragraph: {
                    rich_text: [
                      {
                        type: "text",
                        text: {
                          content: truncatedTranscript || "No transcript recorded."
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },

        
          { object: "block", type: "divider", divider: {} },
        
          //
          // === CODE / NOTES SECTION (Only for TECHNICAL + SYSTEM_DESIGN) ===
          //
          ...(session.type === "BEHAVIORAL"
            ? [] // hide entire section for behavioral questions
            : [
                // Section Header
                {
                  object: "block",
                  type: "heading_2",
                  heading_2: {
                    rich_text: [
                      { type: "text", text: { content: "💻 Code / Notes" } },
                    ],
                  },
                },

                // Code block for TECHNICAL, Markdown block for SYSTEM DESIGN
                session.type === "TECHNICAL"
                  ? {
                      object: "block",
                      type: "code",
                      code: {
                        language: "python",
                        rich_text: [
                          {
                            type: "text",
                            text: { content: truncatedCode || "// No code recorded" },
                          },
                        ],
                      },
                    }
                  : {
                      // SYSTEM DESIGN → Paragraph markdown instead of code block
                      object: "block",
                      type: "paragraph",
                      paragraph: {
                        rich_text: [
                          {
                            type: "text",
                            text: {
                              content:
                                truncatedCode ||
                                "No design notes / high-level description provided.",
                            },
                          },
                        ],
                      },
                    },
              ]),

        
          //
          // === OPTIMAL SOLUTION (NORMAL CODE BLOCK) ===
          //
          {
            object: "block",
            type: "heading_2",
            heading_2: {
              rich_text: [{ type: "text", text: { content: solutionHeading } }],
            },
          },
          // TECHNICAL → code block
          ...(session.type === "TECHNICAL"
            ? [
                {
                  object: "block",
                  type: "code",
                  code: {
                    language: "python",
                    rich_text: [
                      {
                        type: "text",
                        text: {
                          content:
                            truncatedOptimal || "// No optimal solution provided.",
                        },
                      },
                    ],
                  },
                },
              ]
            : [
                // BEHAVIORAL / SYSTEM_DESIGN → paragraph
                {
                  object: "block",
                  type: "paragraph",
                  paragraph: {
                    rich_text: [
                      {
                        type: "text",
                        text: {
                          content:
                            truncatedOptimal ||
                            "No recommended approach / standard answer provided.",
                        },
                      },
                    ],
                  },
                },
              ]),
      ],
    };

    // Helper function to make API request with a given access token
    const makeRequest = async (accessToken: string): Promise<Response> => {
      return fetch(`${NOTION_API_BASE}/pages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify(requestBody),
      });
    };

    // Try initial request
    let response = await makeRequest(notionConnection.accessToken);

    // If 401 Unauthorized, try to refresh token and retry
    if (response.status === 401) {
      console.log('Access token expired, attempting to refresh...');
      
      if (!notionConnection.refreshToken) {
        // No refresh token available, user needs to reconnect
        clearNotionConnection();
        return { 
          success: false, 
          error: 'Session expired. Please reconnect your Notion workspace.' 
        };
      }

      try {
        // Attempt to refresh the token
        const refreshedConnection = await refreshNotionToken(notionConnection.refreshToken);
        
        // Retry the request with new access token
        response = await makeRequest(refreshedConnection.accessToken);
      } catch (refreshError) {
        // Refresh token expired or invalid - log out user
        console.error('Token refresh failed, logging out user:', refreshError);
        clearNotionConnection();
        return { 
          success: false, 
          error: 'Session expired. Please reconnect your Notion workspace.' 
        };
      }
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Notion API error:', errorData);
      return { success: false, error: errorData.message || 'Failed to save to Notion' };
    }

    const data = await response.json();
    console.log('✅ Session saved to Notion:', data.id);
    return { success: true, pageId: data.id };

  } catch (error) {
    console.error('Error saving to Notion:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Check if Notion integration is properly configured for the current browser
 * (i.e. the user has completed OAuth and configured a database id).
 */
export const isNotionConfigured = (): boolean => {
  const connection = getNotionConnection();
  return Boolean(connection?.accessToken && connection?.databaseId);
};

