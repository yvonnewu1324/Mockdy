import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { FeedbackData, Message, InterviewType } from "../types";

// Initialize the client
// NOTE: We assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createChatSession = (systemInstruction: string): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7, // Balance between creativity and strictness
    },
  });
};

export const generateInterviewFeedback = async (
  messages: Message[], 
  codeOrNotes: string,
  interviewType: InterviewType,
): Promise<FeedbackData> => {
  
  // Construct the transcript for the grading model
  const transcript = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
  const context = `
    INTERVIEW TYPE: ${interviewType}
    
    TRANSCRIPT:
    ${transcript}

    USER NOTES/CODE:
    ${codeOrNotes}
  `;

  let evaluationStrategy = "";
  if (interviewType === 'TECHNICAL') {
    evaluationStrategy = `
    Strictly evaluate using the **UMPIRE** strategy:
    1. **Understand**: Did the candidate clarify inputs/outputs/constraints?
    2. **Match**: Did they identify the correct pattern/data structure?
    3. **Plan**: Did they explain their approach/pseudocode BEFORE coding?
    4. **Implement**: Is the code correct, readable, and functional?
    5. **Review**: Did they dry-run/debug their code with examples?
    6. **Evaluate**: Did they correctly analyze Time/Space complexity?
    
    Mention missed UMPIRE steps in "Weaknesses".
    `;
  } else if (interviewType === "BEHAVIORAL") {
    evaluationStrategy = `
      Evaluate adherence to the **STAR** method (Situation, Task, Action, Result).
      Comment on clarity, impact, and ownership.
    `;
  } else if (interviewType === "SYSTEM_DESIGN") {
    evaluationStrategy = `
      Evaluate the solution along these axes:
      - Requirements: functional + non-functional clarity
      - High-level architecture and component decomposition
      - Data modeling and choice of storage
      - API & contracts
      - Scalability, reliability, and failure handling
      - Tradeoffs and alternative designs
  
      Highlight missing or weak sections in "Weaknesses".
    `;
  }

  const prompt = `
    You are an expert Interview Bar Raiser. Analyze the transcript and user's work above.
    ${evaluationStrategy}
    Provide a structured evaluation in JSON format.
    
    1. Score: 0-100 based on accuracy, communication, efficiency, and adherence to the interview strategy (UMPIRE/STAR).
    2. Summary: A 2-3 sentence overview of performance.
    3. Strengths: 3 key bullet points.
    4. Weaknesses: 3 key bullet points.
    5. OptimalSolution: The standard answer (code for technical, architectural summary for system design, or STAR example for behavioral).
  `;

  // Define schema for structured JSON output
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.INTEGER },
      summary: { type: Type.STRING },
      strengths: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
      weaknesses: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
      optimalSolution: { type: Type.STRING }
    },
    required: ["score", "summary", "strengths", "weaknesses", "optimalSolution"]
  };

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${context}\n\n${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (result.text) {
        return JSON.parse(result.text) as FeedbackData;
    }
    throw new Error("No JSON returned");
  } catch (error) {
    console.error("Feedback generation failed:", error);
    // Fallback in case of parsing error or API failure
    return {
      score: 0,
      summary: "Failed to generate detailed feedback. Please try again.",
      strengths: [],
      weaknesses: [],
      optimalSolution: "N/A"
    };
  }
};