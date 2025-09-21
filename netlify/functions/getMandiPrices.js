// netlify/functions/getMandiPrices.js
const API_KEY = process.env.AGMARKNET_API_KEY;

export const handler = async () => {
  const URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&filters[state]=Madhya%20Pradesh&filters[district]=Chhindwara&filters[market]=Chhindwara`;

  try {
    const response = await fetch(URL);
    const data = await response.json();

    const prices = { maize: null, soyabean: null };
    const maizeRecord = data.records.find(r => r.commodity.toLowerCase().includes('maize'));
    const soyabeanRecord = data.records.find(r => r.commodity.toLowerCase().includes('soyabean'));

    if (maizeRecord) { prices.maize = maizeRecord.modal_price; }
    if (soyabeanRecord) { prices.soyabean = soyabeanRecord.modal_price; }

    return {
      statusCode: 200,
      body: JSON.stringify(prices),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch Mandi data' }) };
  }
};
