import { GoogleGenAI, Modality } from "@google/genai";
import { ThumbnailConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateThumbnailImage = async (config: ThumbnailConfig): Promise<string> => {
  try {
    // Chaos levels now map to comic/cartoon intensity
    const chaosDescription = config.chaosLevel > 80 
      ? "complete visual overload, comic-style explosion lines, flying debris, intense motion blur, electric arcs, screaming faces"
      : config.chaosLevel > 50
      ? "dynamic action lines, sweat drops, shaking effect, sparks, heavy impact frames"
      : "dramatic posing, bold outlines, expressive faces, focused lighting";

    let themeSpecificPrompt = "";
    
    switch (config.theme) {
      case 'victory':
        themeSpecificPrompt = `
          SCENARIO: "Epic Win - Three Crown Glory".
          CENTERPIECE: A glowing, golden iPad showing a "Victory" banner. It is pristine and radiating holy light.
          CHARACTERS: Cartoon King laughing hysterically, Mega Knight flexing muscles, Goblins throwing confetti.
          COLORS: Gold, bright blue, cyan, and white. Heavenly, saturated lighting.
        `;
        break;
      case 'funny':
        themeSpecificPrompt = `
          SCENARIO: "Confused Gamer Moment".
          CENTERPIECE: A smoking iPad that looks melted.
          CHARACTERS: King scratching his head confused, Hog Rider looking shocked, a Skeleton shrugging.
          COLORS: Bright yellow, orange, and purple. Wacky, tilted angles.
        `;
        break;
      case 'glitch':
        themeSpecificPrompt = `
          SCENARIO: "System Crash - Glitch World".
          CENTERPIECE: An iPad dissolving into digital pixels and matrix code.
          CHARACTERS: Troops glitching out, half-loaded textures, missing eyes, T-posing models.
          COLORS: Neon purple, matrix green, hot pink. CRT monitor scanlines.
        `;
        break;
      case 'defeat':
      default:
        // This is the core "Epic Fail" concept requested
        themeSpecificPrompt = `
          SCENARIO: "Epic Fail – Clash Royale Chaos".
          CENTERPIECE: A Broken iPad in the middle with cracks forming a cartoon-style explosion. 
          CHARACTERS: Cartoon/comic-style Clash Royale troops with EXAGGERATED expressions interacting with the device.
             - Mega Knight crying dramatically (waterfalls of tears).
             - Goblin panicking and poking the cracked screen.
             - Baby Dragon flying away in fear.
             - King sweating bullets with bulging eyes.
          COLORS: Neon reds, oranges, and yellows for explosions contrasting with blue/green troops.
        `;
        break;
    }

    const prompt = `
      Create a high-quality, "Scroll-stopping" ${config.aspectRatio === '9:16' ? 'TikTok' : 'YouTube'} thumbnail.
      
      STYLE GUIDE: 
      - CARTOON + COMIC BOOK + CHAOTIC HUMOR. 
      - Thick bold outlines.
      - Bright, vibrant, saturated colors. 
      - Exaggerated facial expressions (anime/comic style).
      - NOT realistic. Think stylized promotional art.

      ${themeSpecificPrompt}

      BACKGROUND:
      - Cartoon battlefield with debris flying, cards in mid-air (Arrows, Fireball).
      - Dynamic "impact" lines radiating from the center.
      
      ATMOSPHERE: ${chaosDescription}
      
      OVERLAY TEXT (Must be integrated into the art, Big Comic Book Font):
      - Primary Text: "${config.text}"
      ${config.subText ? `- Secondary Text: "${config.subText}"` : ''}
      
      COMPOSITION:
      - Subject centered.
      - Elements popping out towards the viewer (3D pop-out effect).
      - Floating emojis in 3D style: 💀, 🔥, 🤣, 📱.
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

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("Image generation failed. The prompt might have triggered safety filters. Try lowering the Chaos Level.");
    }

    const candidate = response.candidates[0];
    
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

    throw new Error("No image data found. The model might have returned only text.");

  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};

export const generateGamerAudio = async (config: ThumbnailConfig): Promise<string> => {
  try {
    let scriptPrompt = "";
    if (config.theme === 'defeat') {
      scriptPrompt = `Act as a raging cartoon gamer character. Scream dramatically and exaggerate: "NOOOO! MY SCREEN! THE MEGA KNIGHT JUMPED ON MY IPAD! ${config.text}!"`;
    } else if (config.theme === 'victory') {
      scriptPrompt = `Act as a triumphant cartoon King. Laugh heartily and shout: "HEE HEE HEE HAW! EASY WIN! ${config.text}!"`;
    } else {
      scriptPrompt = `Act as a confused goblin. Squeaky voice: "Uh oh. I think I broke it. ${config.text}?"`;
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