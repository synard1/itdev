import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const upload = multer();
const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY });
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function extractText(resp) {
  try {
    const text =
      resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.response?.candidates?.[0]?.content?.text;

    return text ?? JSON.stringify(resp, null, 2);
  } catch (error) {
    console.error("Error extracting text:", error);
    return JSON.stringify(resp, null, 2);
  }
}

// 1. Text Generation
app.post("/generate-text", async (req, res) => {
  try {
    const { prompt } = req.body;
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    res.json({ result: extractText(resp) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//2. Generate from Image
app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  try {
    const { prompt } = req.body;
    const imageBase64 = req.file.buffer.toString("base64");
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt },
        { inlineData: { mimeType: req.file.mimetype, data: imageBase64 } },
      ],
    });
    res.json({ result: extractText(resp) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//3. Generate from Document
app.post(
  "/generate-from-document",
  upload.single("document"),
  async (req, res) => {
    try {
      const { prompt } = req.body;
      const docBase64 = req.file.buffer.toString("base64");
      const resp = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          { text: prompt || "Ringkas dokumen berikut: " },
          { inlineData: { mimeType: req.file.mimetype, data: docBase64 } },
        ],
      });
      res.json({ result: extractText(resp) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

//4. Generate from audio
app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
  try {
    const { prompt } = req.body;
    const audioBase64 = req.file.buffer.toString("base64");
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt || "Buatkan transkrip dari audio berikut: " },
        { inlineData: { mimeType: req.file.mimetype, data: audioBase64 } },
      ],
    });
    res.json({ result: extractText(resp) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//5. Chatbot
app.post("/chat", async (req, res) => {
    console.log("New request to /chat endpoint received at " + new Date().toISOString());
    const { conversation, apiKey } = req.body;

    // Use user-provided API key or fallback to environment variable
    const effectiveApiKey = apiKey || process.env.GENAI_API_KEY;

    if (!effectiveApiKey) {
      return res
        .status(400)
        .json({ success: false, message: "API key is required." });
    }

    // guard clause -- satpam
    if (!conversation || !Array.isArray(conversation)) {
      res.status(400).json({
        message: "Percakapan harus valid!",
        data: null,
        success: false,
      });
      return;
    }

    // Message validation loop
    for (const message of conversation) {
      if (!message || typeof message !== 'object' || Array.isArray(message)) {
        return res.status(400).json({ success: false, message: 'Invalid message format in conversation.' });
      }

      const keys = Object.keys(message);
      if (keys.length !== 2 || !keys.includes('role') || !keys.includes('text')) {
        return res.status(400).json({ success: false, message: 'Each message must have exactly "role" and "text" properties.' });
      }

      const { role, text } = message;
      if (!['user', 'model'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role specified in message.' });
      }

      if (typeof text !== 'string') {
        return res.status(400).json({ success: false, message: 'Message text must be a string.' });
      }

      if (role === 'user') {
        try {
          const parsed = JSON.parse(text);
          if (typeof parsed === 'object' && parsed !== null) {
            console.log("Validation failed: User input is a JSON object.");
            return res.status(400).json({ success: false, message: 'GEMINI_CLI_VALIDATION: User input cannot be a JSON object or array.' });
          }
        } catch (e) {
          // Not a JSON string, which is what we want.
        }
      }
    }

    // Create a new GoogleGenAI instance with the effective API key
    const genAI = new GoogleGenAI({ apiKey: effectiveApiKey });

    const contents = conversation.map(({ role, text }) => ({
    role,
    parts: [{ text }],
    }));

    try {
        const resp = await genAI.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
            systemInstruction:
            "You are a chatbot named Gemini. Answer as concisely as possible and use html styling for better display.",
        },
        });

        let responseText = extractText(resp);

        // Remove markdown code block delimiters
        responseText = responseText.replace(/^```(html)?\s*/, '').replace(/\s*```$/, '');

        res.status(200).json({
        success: true,
        data: responseText,
        message: "Berhasil ditanggapi oleh Google Gemini Flash!",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
