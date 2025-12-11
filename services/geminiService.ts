import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSmartFilename = async (filenames: string[]): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      I have a list of PDF filenames that I am merging into a single document.
      Based on these filenames, suggest a concise, professional, and descriptive filename for the merged file.
      
      Filenames:
      ${filenames.map(f => `- ${f}`).join('\n')}

      Rules:
      1. Return ONLY the filename.
      2. Ensure it ends with ".pdf".
      3. Use Korean if the input filenames are mostly Korean, otherwise use English.
      4. Do not include any explanations or markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    if (!text) return 'merged_document.pdf';
    
    // Clean up any potential whitespace or markdown backticks
    return text.trim().replace(/`/g, '').replace(/^pdf\n/, '');
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if AI fails
    return `merged_${new Date().toISOString().slice(0, 10)}.pdf`;
  }
};