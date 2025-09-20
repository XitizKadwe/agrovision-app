import { useState, useEffect } from 'react';

// This gets the speech recognition functionality from the browser
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// We want the recognition to be in Hindi
recognition.lang = 'hi-IN';
recognition.interimResults = false;

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    // This handles the result of the speech
    recognition.onresult = (event) => {
      const newTranscript = event.results[0][0].transcript;
      setTranscript(newTranscript);
      setIsListening(false); // Stop listening after getting a result
    };

    // Handle the end of listening
    recognition.onend = () => {
      setIsListening(false);
    };

    // Handle errors
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
  }, []);

  const startListening = () => {
    setTranscript(''); // Clear previous transcript
    setIsListening(true);
    recognition.start();
  };

  return {
    isListening,
    transcript,
    startListening,
  };
};