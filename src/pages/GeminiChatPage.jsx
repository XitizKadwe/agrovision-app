import React, { useState } from 'react';
import { Send, Bot, User, CornerDownLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function GeminiChatPage() {
    const { i18n } = useTranslation();
  const [chatHistory, setChatHistory] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!prompt.trim()) return;

    const userMessage = { role: 'user', text: prompt };
    setChatHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    setPrompt('');

    try {
         const currentLanguage = i18n.language;
      const response = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language: currentLanguage }),
      });
      const data = await response.json();
      const botMessage = { role: 'bot', text: data.response };
      setChatHistory(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching from Gemini backend:", error);
      const errorMessage = { role: 'bot', text: 'माफ़ कीजिए, कुछ गड़बड़ हो गई है। कृपया फिर प्रयास करें।' };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-100">
      <header className="bg-white p-4 shadow-md flex items-center gap-4">
        <Link to="/" className="p-2 rounded-full hover:bg-gray-100">
            <CornerDownLeft size={20} />
        </Link>
        <Bot size={28} className="text-green-600" />
        <div>
          <h1 className="text-lg font-bold text-gray-800">जेमिनी कृषि सलाहकार</h1>
          <p className="text-xs text-green-500 font-semibold">Online</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((message, index) => (
          <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
            {message.role === 'bot' && <Bot className="text-green-600 flex-shrink-0" />}
            <div className={`p-3 rounded-xl max-w-lg ${message.role === 'user' ? 'bg-green-600 text-white' : 'bg-white shadow-sm'}`}>
              <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
            {message.role === 'user' && <User className="text-gray-500 flex-shrink-0" />}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                <Bot className="text-green-600" />
                <div className="p-3 rounded-xl bg-white shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
        )}
      </main>

      <footer className="bg-white p-4 border-t">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="अपना सवाल यहाँ पूछें..."
            className="w-full p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
          <button onClick={sendMessage} disabled={isLoading} className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:bg-gray-400">
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default GeminiChatPage;
