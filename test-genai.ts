import { GoogleGenAI } from "@google/genai";
try {
  const ai = new GoogleGenAI({});
  console.log("Initialize worked");
} catch(e: any) {
  console.log("Init Error:", e.message);
}
