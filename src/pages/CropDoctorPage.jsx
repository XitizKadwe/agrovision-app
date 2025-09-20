import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, UploadCloud, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

function CropDoctorPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState('idle'); // idle, uploading, analyzing, complete, error
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setStatus('idle');
      setResult(null);
    }
  };

  const handleDiagnose = async () => {
    if (!image) return;

    // --- Step 1: Upload to Cloudinary ---
    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const cloudinaryData = await cloudinaryResponse.json();
      const imageUrl = cloudinaryData.secure_url;

      // --- Step 2: Send URL to our backend for analysis ---
      setStatus('analyzing');
      const backendResponse = await fetch('http://localhost:8000/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const diagnosisData = await backendResponse.json();
      setResult(diagnosisData);
      setStatus('complete');

    } catch (error) {
      console.error("Diagnosis failed:", error);
      setStatus('error');
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link to="/" className="p-2 rounded-full hover:bg-gray-200">
          <ChevronLeft />
        </Link>
        <h1 className="text-xl font-bold text-gray-800">AI फसल डॉक्टर</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <p className="text-gray-600 mb-4 text-center">फसल की पत्ती का एक साफ़ फोटो अपलोड करें और तुरंत रोग का पता लगाएं।</p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
          {!preview ? (
            <label htmlFor="crop-image" className="cursor-pointer">
              <UploadCloud className="mx-auto text-gray-400" size={48} />
              <p className="mt-2 font-semibold text-green-600">फोटो चुनें</p>
              <input type="file" id="crop-image" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          ) : (
            <img src={preview} alt="Crop preview" className="max-h-60 mx-auto rounded-md" />
          )}
        </div>
        
        {preview && (
          <button 
            onClick={handleDiagnose} 
            disabled={status === 'uploading' || status === 'analyzing'}
            className="w-full mt-6 p-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {status === 'idle' && 'रोग का पता लगाएं'}
            {(status === 'uploading' || status === 'analyzing') && <Loader2 className="animate-spin" />}
            {status === 'uploading' && 'फोटो अपलोड हो रहा है...'}
            {status === 'analyzing' && 'विश्लेषण हो रहा है...'}
            {status === 'complete' && 'पुनः जांच करें'}
            {status === 'error' && 'फिर प्रयास करें'}
          </button>
        )}
      </div>

      {status === 'complete' && result && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle className="text-green-500" /> विश्लेषण रिपोर्ट
          </h2>
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4">
              <h3 className="font-bold">{result.diseaseName}</h3>
              <p>संभावना: {result.confidence}</p>
          </div>
          <h4 className="font-semibold mt-4">सुझाव:</h4>
          {/* This check for result.remedy prevents the crash */}
          {result.remedy && Array.isArray(result.remedy) && (
            <ul className="list-disc list-inside mt-2 text-gray-600">
              {result.remedy.map((step, i) => <li key={i}>{step}</li>)}
            </ul>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 bg-red-50 p-4 rounded-lg flex items-center gap-3 text-red-700">
            <AlertTriangle />
            <p className="font-semibold">विश्लेषण विफल हुआ। कृपया अपनी इंटरनेट जाँच करें और फिर प्रयास करें।</p>
        </div>
      )}
    </div>
  );
}

export default CropDoctorPage;