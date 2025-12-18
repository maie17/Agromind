
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "./constants";
import { MeetingAnalysis } from "./types";

export const analyzeMeetingAudio = async (base64Audio: string, mimeType: string): Promise<MeetingAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Audio,
              mimeType: mimeType
            }
          },
          {
            text: "Analiza esta reunión comercial de fyo. Identifica oportunidades de negocio, resume la charla y sugiere acciones concretas siguiendo las reglas de negocio de fyo explicadas en las instrucciones del sistema."
          }
        ]
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json"
    }
  });

  const text = response.text;
  if (!text) throw new Error("No se pudo obtener respuesta del modelo.");
  
  try {
    return JSON.parse(text) as MeetingAnalysis;
  } catch (e) {
    console.error("Error parsing JSON:", text);
    throw new Error("Error al procesar los datos estructurados de la reunión.");
  }
};

export const analyzeMeetingText = async (transcription: string): Promise<MeetingAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        parts: [
          {
            text: `Transcripción de la reunión:\n${transcription}\n\nAnaliza esta reunión según tus instrucciones de sistema.`
          }
        ]
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json"
    }
  });

  const text = response.text;
  if (!text) throw new Error("No se pudo obtener respuesta del modelo.");
  
  return JSON.parse(text) as MeetingAnalysis;
};
