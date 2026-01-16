
import { GoogleGenAI, Type } from "@google/genai";

// Always initialize with the exact pattern requested
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * FETCH PUBLIC CARD INTELLIGENCE
 * This only sends the Bank Name and Card Variant (e.g., "HDFC Infinia").
 * NO personal transaction data, balances, or card numbers are sent here.
 */
export interface CardIntelligenceResponse {
  benefits: string[];
  milestones: { label: string; target: number; reward: string }[];
  sources: { title: string; uri: string }[];
}

export const fetchCardIntelligence = async (bank: string, variant: string): Promise<CardIntelligenceResponse> => {
  const searchPrompt = `
    Find the official benefits, rewards, and milestone targets for the "${bank} ${variant}" credit card in India.
    Specifically look for:
    - Lounge access rules (Domestic/International)
    - Reward points per ₹150 or ₹100 spent
    - Milestone rewards (Annual fee waiver, vouchers)
    - Milestone values must be in INR (₹).
  `;

  try {
    // Phase 1: Search the web for PUBLIC card details
    const searchResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const rawText = searchResponse.text;
    const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    // Phase 2: Format public data into JSON
    const formatResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Extract card details into JSON from this public text: ${rawText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            benefits: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Public features"
            },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  target: { type: Type.NUMBER },
                  reward: { type: Type.STRING }
                },
                required: ["label", "target", "reward"]
              }
            }
          },
          required: ["benefits", "milestones"]
        }
      }
    });

    const data = JSON.parse(formatResponse.text || '{}');
    return {
      benefits: data.benefits || [],
      milestones: data.milestones || [],
      sources: sources
    };
  } catch (error) {
    console.error("Public Card Fetch Failed:", error);
    throw error;
  }
};

/**
 * SMS EXTRACTION (Local context only)
 * This extracts details from a single string to save manual typing.
 * This is used on-demand when user pastes a message.
 */
export const parseTransactionSms = async (text: string): Promise<any> => {
  const prompt = `Extract transaction details from this single message: "${text}". Return JSON with amount, description, date, category, and cardLastFour. Use Indian context.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            description: { type: Type.STRING },
            date: { type: Type.STRING },
            category: { type: Type.STRING },
            cardLastFour: { type: Type.STRING }
          },
          required: ["amount", "description", "date", "category", "cardLastFour"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    throw new Error("SMS parsing failed.");
  }
};
