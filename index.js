import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import express from 'express';
import multer from 'multer';

const app = express();
const upload = multer();
const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY });
const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const PORT = process.env.PORT || 3000;

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
        console.error('Error extracting text:', error);
        return JSON.stringify(resp, null, 2);
        
    }
}

// 1. Text Generation
app.post('/generate-text', async (req, res) => {
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
app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    try {
        const { prompt } = req.body;
        const imageBase64 = req.file.buffer.toString('base64');
        const resp = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt },
                { inlineData: { mimeType: req.file.mimetype, data: imageBase64 } }
            ]
        });
        res.json({ result: extractText(resp) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//3. Generate from Document
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    try {
        const { prompt } = req.body;
        const docBase64 = req.file.buffer.toString('base64');
        const resp = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt || "Ringkas dokumen berikut: " },
                { inlineData: { mimeType: req.file.mimetype, data: docBase64 } }
            ]
        });
        res.json({ result: extractText(resp) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//4. Generate from audio
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    try {
        const { prompt } = req.body;
        const audioBase64 = req.file.buffer.toString('base64');
        const resp = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt || "Buatkan transkrip dari audio berikut: " },
                { inlineData: { mimeType: req.file.mimetype, data: audioBase64 } }
            ]
        });
        res.json({ result: extractText(resp) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
