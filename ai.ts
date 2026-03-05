
import { GoogleGenAI, Type } from "@google/genai";

export class AIService {
  async screenApplicant(whyJoin: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Review this student application for a college club. Provide a score (1-10) and a brief technical/management recommendation based on their intent: "${whyJoin}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            recommendation: { type: Type.STRING },
            suggestedDomain: { type: Type.STRING }
          },
          required: ["score", "recommendation", "suggestedDomain"]
        }
      }
    });

    return JSON.parse(response.text);
  }

  async reviewEventProposal(title: string, description: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze this event proposal for MITS Gwalior. Title: ${title}. Description: ${description}. Is it aligned with institutional goals? Give a short verdict.`,
    });
    return response.text;
  }

  async generateClubContent(clubName: string, category: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a high-end web brand strategist. Generate a comprehensive website identity for a student club named "${clubName}" in the "${category}" wing at Madhav Institute of Technology & Science (MITS), Gwalior. 
      Include a mission statement, a catchy hero tagline, and 4 specialized custom sections (e.g., 'Tech Stack', 'Alumni Network', 'Core Values', 'Annual Marathon'). Each section needs a title, detailed professional content, and a Lucide-React icon name suggestion.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mission: { type: Type.STRING },
            tagline: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  iconName: { type: Type.STRING, description: "Lucide icon name like 'Zap', 'Target', 'Users', 'Code', etc." }
                },
                required: ["title", "content", "iconName"]
              }
            }
          },
          required: ["mission", "tagline", "sections"]
        }
      }
    });
    return JSON.parse(response.text);
  }
}

export const aiService = new AIService();