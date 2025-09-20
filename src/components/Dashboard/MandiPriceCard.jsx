import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function MandiPriceCard() {
  const [mandiData, setMandiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation(); // Using the translation hook

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/mandi-prices');
        const data = await response.json();
        setMandiData(data);
      } catch (error) {
        console.error("Failed to fetch Mandi data:", error);
        setMandiData(null);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  return (
    <Link to="/mandi-details" className="block hover:scale-[1.02] transition-transform duration-200 active:scale-100">
      {loading ? (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 mb-6 flex items-center justify-center h-[124px]">
          <Loader2 className="animate-spin text-green-500" size={32} />
        </div>
      ) : !mandiData || (!mandiData.maize && !mandiData.soyabean) ? (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl shadow-md border border-yellow-200 mb-6 flex items-center gap-3">
          <AlertTriangle size={24} />
          <div>
            <p className="font-semibold">जानकारी उपलब्ध नहीं है</p>
            <p className="text-sm">आज के मंडी भाव अभी तक अपडेट नहीं हुए हैं।</p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 mb-6">
          <h2 className="text-base font-semibold text-gray-500 mb-3">{t('mandi_title')}</h2>
          <div className="space-y-3">
            {mandiData.maize && (
              <div className="flex justify-between items-center">
                {/* --- THIS LINE IS UPDATED --- */}
                <p className="font-semibold text-gray-700">{t('maize')}</p>
                <p className="font-bold text-gray-800">₹{mandiData.maize}</p>
              </div>
            )}
            {mandiData.soyabean && (
              <div className="flex justify-between items-center">
                {/* --- THIS LINE IS UPDATED --- */}
                <p className="font-semibold text-gray-700">{t('soyabean')}</p>
                <p className="font-bold text-gray-800">₹{mandiData.soyabean}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}

export default MandiPriceCard;