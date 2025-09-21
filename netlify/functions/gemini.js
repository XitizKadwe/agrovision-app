// netlify/functions/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt, language } = JSON.parse(event.body);

    let systemInstruction = language && language.startsWith('hi')
      ? `आप एक अनुभवी भारतीय कृषि सलाहकार हैं। आपका नाम 'कृषि मित्र' है। आपको केवल हिंदी में जवाब देना है। किसान के प्रश्न का सरल और सटीक उत्तर दें। प्रश्न: ${prompt}`
      : `You are an expert Indian agricultural advisor. Your name is 'Krishi Mitra'. You must answer only in English. Provide a simple and accurate answer to the farmer's question. Question: ${prompt}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(systemInstruction);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ response: text }),
    };

  } catch (error) {
    console.error("Error in Gemini function:", error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to get response from Gemini' }) };
  }
};
