import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { VibeAnalysis, Mood, FeatureType, MiniGame } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';
const TTS_MODEL_NAME = 'gemini-2.5-flash-preview-tts';

// Schema for Step 1: Mood Analysis ONLY
const moodSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    mood: {
      type: Type.STRING,
      enum: Object.values(Mood),
      description: "The detected emotional state. If just chatting/greeting, use 'Neutral' or 'Happy'."
    },
    confidence: { type: Type.NUMBER },
    empatheticResponse: {
      type: Type.STRING,
      description: "The main text response. MUST be conversational, calm, and specific to the user's input. Do not be robotic."
    },
    themeColor: { type: Type.STRING, description: "Hex color code matching the mood." },
    modalityExplanation: { type: Type.STRING },
    isFarewell: {
      type: Type.BOOLEAN,
      description: "True if the user is saying goodbye or ending the conversation."
    }
  },
  required: ["mood", "confidence", "empatheticResponse", "themeColor"]
};

// Schema for Step 2: Specific Feature Content
const featureSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    musicRecommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          artist: { type: Type.STRING },
          vibe: { type: Type.STRING }
        }
      }
    },
    mindfulExercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          duration: { type: Type.STRING }
        }
      }
    },
    creativeActivity: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Name of the specific AI Tool (e.g., Gamma AI, Canva Magic, Midjourney)" },
        description: { type: Type.STRING, description: "Specific idea of what to create with this tool to match the mood." },
        url: { type: Type.STRING, description: "Website URL of the tool." },
        suggestedPrompt: { type: Type.STRING, description: "A prompt they can use inside that tool." }
      }
    },
    games: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, enum: ["Logical", "Analytical", "Critical Thinking"] },
          title: { type: Type.STRING, description: "Puzzle Title" },
          description: { type: Type.STRING, description: "Short teaser" },
          question: { type: Type.STRING, description: "The puzzle text" },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 4 possible answers" },
          correctAnswer: { type: Type.STRING, description: "The exact correct option text" },
          explanation: { type: Type.STRING, description: "Why it is correct" },
          highScore: { type: Type.NUMBER, description: "Random high score between 2000 and 9000" }
        },
        required: ["category", "title", "question", "options", "correctAnswer", "explanation", "highScore"]
      }
    },
    postures: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Exact name of the Asana" },
          benefit: { type: Type.STRING },
          instructions: { type: Type.STRING, description: "Short instruction on how to sit" }
        }
      }
    }
  }
};

// Schema for Single Game Generation
const singleGameSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, enum: ["Logical", "Analytical", "Critical Thinking"] },
    title: { type: Type.STRING, description: "Puzzle Title" },
    description: { type: Type.STRING, description: "Short context" },
    question: { type: Type.STRING, description: "The puzzle/riddle text" },
    options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 4 possible answers" },
    correctAnswer: { type: Type.STRING, description: "The exact correct option text" },
    explanation: { type: Type.STRING, description: "Why it is correct" },
    highScore: { type: Type.NUMBER, description: "Random high score between 2000 and 9000" }
  },
  required: ["category", "title", "question", "options", "correctAnswer", "explanation", "highScore"]
};

/**
 * Step 1: Analyze Mood Only
 */
export const analyzeMood = async (
  input: string,
  type: 'text' | 'emoji' | 'image' | 'audio',
  mediaData?: string,
  userName: string = 'Friend'
): Promise<VibeAnalysis> => {
  try {
    const parts: any[] = [];

    if (type === 'image' && mediaData) {
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: mediaData } });
      parts.push({ text: `User Name: ${userName}. Analyze the facial expression.` });
    } else if (type === 'audio' && mediaData) {
       parts.push({ inlineData: { mimeType: 'audio/webm', data: mediaData } });
       parts.push({ text: `User Name: ${userName}. Listen to this audio message. The user may be speaking in English, Hindi, or Kannada. Analyze the emotion in their voice and the content of what they are saying.` });
    } else if (type === 'emoji') {
      // Ensure variety every time with a random seed
      const seed = Math.floor(Math.random() * 999999);
      parts.push({ text: `User Name: ${userName}. [User Input Mode: Emoji Picker] Selected Emoji: ${input}
      
      TASK: Generate a "Short Mood-Boosting Story".
      1. Interpret the emotion of this emoji.
      2. Create a unique, creative, and uplifting micro-story (2-4 sentences) or a metaphorical narrative that validates this feeling and gently boosts the mood.
      3. IMPORTANT: This response must be DIFFERENT every time, even if the emoji is the same.
      4. Random Seed for variety: ${seed}.
      
      Put this story in the 'empatheticResponse' field of the JSON.
      ` });
    } else {
      parts.push({ text: `User Name: ${userName}. User Input: "${input}"` });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { role: 'user', parts: parts },
      config: {
        systemInstruction: `You are VibeMate, a calm, steady, and supportive companion.
        
        YOUR GOAL:
        1. Reply in a relaxed, conversational manner.
        2. If the user shares feelings/problems, provide a grounded, practical perspective.
        
        PERSONA GUIDELINES:
        - **Tone**: Calm, composed, mature, and warm.
        - **Language**: Respond in the same language the user speaks.
        
        SPECIFIC SCENARIOS (In output 'empatheticResponse'):
        - **General Chat**: "Hey there. How are things going?"
        - **Emoji Input**: Provide a unique, short, mood-boosting story or metaphor.
        - **Sadness**: "I hear you. That sounds tough. Take a moment for yourself."
        
        Output JSON matching the schema.
        `,
        responseMimeType: 'application/json',
        responseSchema: moodSchema,
        temperature: 1.1, // High temperature for variety in stories
      }
    });

    const jsonString = response.text;
    return JSON.parse(jsonString) as VibeAnalysis;

  } catch (error) {
    console.error("Error analyzing mood:", error);
    return {
      mood: Mood.Unclear,
      confidence: 0,
      empatheticResponse: "I didn't catch that. Could you say it again?",
      themeColor: "#64748b"
    };
  }
};

/**
 * Generate Speech (TTS) from Text using Gemini
 */
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    // 'Kore' is good for a warm female/motherly persona
    const response = await ai.models.generateContent({
      model: TTS_MODEL_NAME,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    // The API returns base64 encoded raw PCM data in the inlineData
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;

  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

/**
 * Step 2: Get Specific Feature Content
 */
export const getFeatureContent = async (
  mood: Mood,
  feature: FeatureType,
  language?: string,
  userContext?: string
): Promise<Partial<VibeAnalysis>> => {
  try {
    // Random seed string to encourage variety in prompt
    const randomSeed = Math.floor(Math.random() * 10000);
    
    const prompt = `User Mood: ${mood}. 
    User Original Input/Context: "${userContext || 'None'}".
    User Request: Give me recommendations for ${feature}.
    ${feature === FeatureType.Music ? `Language Preference: ${language}` : ''}
    Random Seed: ${randomSeed}
    
    INSTRUCTIONS:
    - If Music:
      1. FIRST CHECK "User Original Input/Context". If the user specifically named an artist, movie, or song (e.g., "Play Taylor Swift", "Songs from DDLJ"), provide songs strictly matching that request.
      2. OTHERWISE, strictly provide 3 **Trending** and highly popular songs in ${language} that match the ${mood} mood. 
    
    - If Exercise: Provide 3 short exercises (Zumba for Lazy/Happy, Yoga for Sad/Stressed).
    
    - If Pinterest (AI Creative Tools): 
      **CRITICAL**: Recommend a SPECIFIC, high-utility AI tool for creating unique, interactive, or artistic works.
      **PRIORITY TOOLS**: Gamma AI (Presentations/Webs), Canva Magic Studio, Midjourney, RunwayML (Video), Spline (3D), Dora (3D Web), Suno (Music), Kaiber, Luma Dream Machine.
      **REQUIREMENT**: 
      1. Suggest ONE unique tool.
      2. Explain what *specific* project the user can create with it (e.g. "Create a cinematic trailer about your mood" or "Build a 3D website").
      3. **Must be different every time**. Do NOT repeat the same tool if possible.
    
    - If Game: Generate 3 distinct mini-games (Logical, Analytical, Critical). (This acts as a fallback/preview).
    
    - If Posture: Provide 3-4 sitting Aasanas.
    
    Return ONLY the JSON object for the requested field.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { role: 'user', parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: featureSchema,
        temperature: 1.0, // Max temperature for variety
      }
    });

    return JSON.parse(response.text) as Partial<VibeAnalysis>;
  } catch (error) {
    console.error("Error fetching feature:", error);
    return {};
  }
};

/**
 * Step 3: Generate Single Game Question (Continuous Play)
 */
export const generateSingleGame = async (category: string): Promise<MiniGame | null> => {
  try {
    const prompt = `Generate a unique, challenging ${category} puzzle/question for a Mind Game.
    Category: ${category}.
    
    Rules:
    1. If Logical: Math sequence, pattern matching, or logic grid.
    2. If Analytical: Data interpretation, graph deduction, or syllogism.
    3. If Critical Thinking: Lateral thinking riddle, situational judgment, or paradox.
    
    Ensure the question is distinct from common ones. 
    Provide 4 options.
    Generate a 'highScore' number representing the global community best for this specific puzzle.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { role: 'user', parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: singleGameSchema,
        temperature: 0.9, // Higher temperature for variety
      }
    });

    return JSON.parse(response.text) as MiniGame;
  } catch (error) {
    console.error("Error generating game:", error);
    return null;
  }
};