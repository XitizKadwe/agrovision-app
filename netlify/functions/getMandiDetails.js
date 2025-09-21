// netlify/functions/getMandiDetails.js
const API_KEY = process.env.AGMARKNET_API_KEY;

export const handler = async (event) => {
  // Get district and market from the URL's query string
  const { district = 'Chhindwara', market = 'Chhindwara' } = event.queryStringParameters;

  const URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&filters[state]=Madhya%20Pradesh&filters[district]=${district}&filters[market]=${market}&limit=50`;

  try {
    const response = await fetch(URL);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data.records), // Send back all found records
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch detailed Mandi data' }) };
  }
};
