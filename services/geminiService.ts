import { GoogleGenAI } from "@google/genai";

// Note: In a real app, do not expose API keys on the client side. 
// This is for demonstration purposes within the constraints of the request.
// The user should provide their key via environment variable or input.

export const suggestHSN = async (productName: string): Promise<string> => {
    if(!process.env.API_KEY) return "Set API_KEY";

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Suggest a valid 4-6 digit Indian GST HSN code for the product: "${productName}". Return ONLY the number, nothing else.`,
        });
        return response.text.trim();
    } catch (e) {
        console.error("Gemini Error", e);
        return "Error";
    }
}

export const analyzeInvoiceText = async (rawText: string): Promise<string> => {
     if(!process.env.API_KEY) return "Set API_KEY";
     
     try {
         const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
         const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: `Summarize this invoice data into a clean text format suitable for a summary note: ${rawText}`,
         });
         return response.text;
     } catch (e) {
         return "Analysis Failed";
     }
}