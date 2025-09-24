import Tesseract from "tesseract.js";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

//Upload receipt, parse with OCR + AI
export const parseReceiptController = async (req, res) => {
    console.log("HIII")
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }


        const { data: { text } } = await Tesseract.recognize(req.file.buffer, "eng");

        //Parse with Gemini AI
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Extract product names and costs from this receipt text:\n${text}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            cost: { type: Type.NUMBER },
                        },
                        propertyOrdering: ["name", "cost"],
                    },
                },
            },
        });

        const items = JSON.parse(response.text);

        //Return structured items + raw OCR text
        return res.json({ items, rawText: text });

    } catch (err) {
        console.error("Receipt parsing error:", err);
        res.status(500).json({ error: "Failed to parse receipt" });
    }
};
