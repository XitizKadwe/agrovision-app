import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. IMPORT: Added useTranslation for language support
import { ChevronLeft, Search, Loader2, Wheat, Carrot, Leaf } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { madhyaPradeshMarkets, districts } from '../data/locations';
import { commodityTranslations } from '../data/translations';

const getCommodityIcon = (commodityName) => {
    const name = commodityName.toLowerCase();
    if (name.includes('wheat') || name.includes('maize') || name.includes('gram') || name.includes('soyabean')) {
        return <Wheat className="text-orange-500" />;
    }
    if (name.includes('potato') || name.includes('onion') || name.includes('tomato') || name.includes('garlic')) {
        return <Carrot className="text-red-500" />; 
    }
    return <Leaf className="text-green-500" />;
};

function MandiDetailsPage() {
    const { i18n } = useTranslation(); // 2. SETUP: Initialize the hook
    const [prices, setPrices] = useState([]);
    const [filteredPrices, setFilteredPrices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDistrict, setSelectedDistrict] = useState('Chhindwara');
    const [selectedMarket, setSelectedMarket] = useState('Chhindwara');
    
    // 3. FIX: Correctly initialize state from the new, nested data structure
    const [availableMarkets, setAvailableMarkets] = useState(madhyaPradeshMarkets['Chhindwara'].markets);
    
    const [priceUnit, setPriceUnit] = useState('quintal');

    useEffect(() => {
        const fetchDetails = async () => {
            if (!selectedMarket) return;
            try {
                setIsLoading(true);
                const response = await fetch(`/.netlify/functions/getMandiDetails?district=${selectedDistrict}&market=${selectedMarket}`);
                const data = await response.json();
                const sortedData = data.sort((a, b) => a.commodity.localeCompare(b.commodity));
                setPrices(sortedData);
                setFilteredPrices(sortedData);
            } catch (error) {
                console.error("Failed to fetch mandi details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [selectedMarket]);

    useEffect(() => {
        const results = prices.filter(price => {
            const englishName = price.commodity.toLowerCase();
            const hindiName = commodityTranslations[price.commodity] || '';
            return englishName.includes(searchTerm.toLowerCase()) || hindiName.includes(searchTerm);
        });
        setFilteredPrices(results);
    }, [searchTerm, prices]);

    // 4. FIX: This function now correctly handles the new object structure
    const handleDistrictChange = (e) => {
        const newDistrict = e.target.value;
        setSelectedDistrict(newDistrict);
        const newMarkets = madhyaPradeshMarkets[newDistrict].markets; // Get the 'markets' array
        setAvailableMarkets(newMarkets);
        setSelectedMarket(newMarkets[0].name_en); // Set the English name for the API call
        setSearchTerm(''); 
    };
    
    // Helper to get the translated name for the title
    const getMarketDisplayName = () => {
        if (!madhyaPradeshMarkets[selectedDistrict]) return selectedMarket;
        const marketData = madhyaPradeshMarkets[selectedDistrict].markets.find(m => m.name_en === selectedMarket);
        if (!marketData) return selectedMarket;
        return i18n.language.startsWith('hi') ? marketData.name_hi : marketData.name_en;
    };

    return (
        <div className="p-4">
            <div className="sticky top-0 bg-gray-50 z-10 pt-4">
                <div className="flex items-center gap-2 mb-4">
                    <Link to="/" className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></Link>
                    <h1 className="text-xl font-bold text-gray-800">{getMarketDisplayName()} मंडी भाव</h1>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">जिला (District)</label>
                        <select onChange={handleDistrictChange} value={selectedDistrict} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                            {districts.map(dist => (
                                <option key={dist} value={dist}>
                                    {i18n.language.startsWith('hi') ? madhyaPradeshMarkets[dist].name_hi : dist}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">बाजार (Market)</label>
                        <select onChange={(e) => setSelectedMarket(e.target.value)} value={selectedMarket} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                            {availableMarkets.map(market => (
                                <option key={market.name_en} value={market.name_en}>
                                    {i18n.language.startsWith('hi') ? market.name_hi : market.name_en}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-4 mb-4 items-center">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="फसल का नाम खोजें..."
                            className="w-full p-3 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="bg-gray-200 p-1 rounded-full flex text-sm">
                        <button onClick={() => setPriceUnit('quintal')} className={`px-3 py-1 rounded-full transition-colors ${priceUnit === 'quintal' ? 'bg-green-600 text-white shadow' : 'text-gray-600'}`}>
                            प्रति क्विंटल
                        </button>
                        <button onClick={() => setPriceUnit('kilo')} className={`px-3 py-1 rounded-full transition-colors ${priceUnit === 'kilo' ? 'bg-green-600 text-white shadow' : 'text-gray-600'}`}>
                            प्रति किलो
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-4">
              {isLoading ? (
                  <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-green-500" size={48} /></div>
              ) : (
                  <motion.div layout className="space-y-3">
                      <AnimatePresence>
                          {filteredPrices.length > 0 ? filteredPrices.map((item, index) => {
                              const hindiName = commodityTranslations[item.commodity] || item.commodity;
                              const getPrice = (price) => {
                                  if (priceUnit === 'kilo') {
                                      return (price / 100).toFixed(2);
                                  }
                                  return price;
                              };
                              return (
                                  <motion.div
                                      layout
                                      key={`${item.commodity}-${index}`}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                      className="bg-white p-4 rounded-xl shadow-md border border-gray-100 overflow-hidden"
                                  >
                                      <div className="flex gap-4 items-center">
                                          <div className="p-3 bg-gray-100 rounded-lg">{getCommodityIcon(item.commodity)}</div>
                                          <div className="flex-grow">
                                              <h3 className="font-bold text-gray-800">{hindiName}</h3>
                                              <p className="text-sm text-gray-500">{item.commodity}</p>
                                          </div>
                                          <div className="text-right flex-shrink-0">
                                              <p className="text-xs text-green-700 font-semibold">मुख्य भाव</p>
                                              <p className="font-bold text-2xl text-green-600">₹{getPrice(item.modal_price)}</p>
                                              <p className="text-xs text-gray-500">प्रति {priceUnit === 'kilo' ? 'किलो' : 'क्विंटल'}</p>
                                          </div>
                                      </div>
                                  </motion.div>
                              );
                          }) : (
                              <div className="text-center py-10">
                                  <p className="font-semibold">इस बाजार के लिए कोई डेटा नहीं मिला।</p>
                              </div>
                          )}
                      </AnimatePresence>
                  </motion.div>
              )}
            </div>
        </div>
    );
}

export default MandiDetailsPage;
