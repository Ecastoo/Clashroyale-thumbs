import { GoogleGenAI, Modality } from "@google/genai";
import { ThumbnailConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateThumbnailImage = async (config: ThumbnailConfig): Promise<string> => {
  try {
    // Toned down "realistic destruction" to "digital/fantasy chaos" to avoid safety filters
    const chaosDescription = config.chaosLevel > 80 
      ? "intense magical overload, electric sparks flying, digital glitch artifacts, neon smoke, dramatic action blur, high contrast"
      : config.chaosLevel > 50
      ? "battle damage, energy sparks, glowing cracks, intense dynamic lighting"
      : "moderate battle wear, dynamic shadows, cinematic lighting";

    const prompt = `
      Create a high-quality, 3D rendered style digital art image suitable for a ${config.aspectRatio === '9:16' ? 'TikTok' : 'YouTube'} thumbnail.
      
      CORE CONCEPT: A "Gamer's Tablet after a defeat".
      
      VISUAL ELEMENTS:
      1. Main Subject: A stylized gaming tablet in the center with a DRAMATIC SPIDERWEB CRACK EFFECT on the screen. The screen is glowing with a "Defeat" icon or a crying cartoon King.
      2. Background: A blurred fantasy battle arena. Magical particles and colorful smoke.
      3. Lighting: ${config.theme === 'victory' ? 'Golden, heavenly, god-rays.' : 'Neon red, orange, and yellow emergency lighting. Electric sparks.'}
      4. Atmosphere: ${chaosDescription}.
      
      OVERLAY TEXT (Must be legible, 3D, and punchy like a gaming thumbnail):
      - Primary Text (Big, Impact font): "${config.text}"
      ${config.subText ? `- Secondary Text (Smaller, glowing): "${config.subText}"` : ''}
      
      STYLE DETAILS:
      - 3D render, vibrant saturated colors.
      - Floating 3D emojis: 🔥, 💀, 💔.
      - "Scroll-stopping" YouTube/TikTok thumbnail aesthetic.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
        }
      }
    });

    // Check for safety filtering or empty candidates
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("Image generation failed. The prompt might have triggered safety filters. Try lowering the Chaos Level.");
    }

    const candidate = response.candidates[0];
    
    // Check if the model refused to generate due to safety
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      console.warn("Generation finished with reason:", candidate.finishReason);
      if (candidate.finishReason === 'SAFETY') {
         throw new Error("Safety filters triggered. Please reduce chaos level or remove aggressive text.");
      }
    }

    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    console.log("Full Response:", JSON.stringify(response, null, 2));
    throw new Error("No image data found. The model might have returned only text.");

  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};

export const generateGamerAudio = async (config: ThumbnailConfig): Promise<string> => {
  try {
    // Determine the script based on the text/theme
    let scriptPrompt = "";
    if (config.theme === 'defeat') {
      scriptPrompt = `Act as a raging Clash Royale gamer who just broke their iPad. Scream and cry dramatically: "No! My internet! I lost the match and now my screen is cracked! ${config.text}!"`;
    } else if (config.theme === 'victory') {
      scriptPrompt = `Act as a hyped Clash Royale gamer. Scream with joy: "Let's go! Three crown victory! easy clap! ${config.text}!"`;
    } else {
      scriptPrompt = `Act as a funny, confused gamer. Say: "Wait, what just happened? Did my iPad just explode? ${config.text}?"`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: scriptPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { 
              voiceName: config.theme === 'defeat' ? 'Fenrir' : 'Puck' 
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data generated");
    }

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });
    
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Gemini Audio Gen Error:", error);
    throw error;
  }
}