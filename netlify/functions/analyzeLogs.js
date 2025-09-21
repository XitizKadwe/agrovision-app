// netlify/functions/analyzeLogs.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { logs } = JSON.parse(event.body);
    if (!logs || logs.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "No log data provided." }) };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `You are an expert farm finance advisor named 'कृषि-विश्लेषक'... (rest of your detailed prompt here)... Here is the farmer's log data: ${JSON.stringify(logs)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ analysis: analysisText }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to get analysis from Gemini' }) };
  }
};
