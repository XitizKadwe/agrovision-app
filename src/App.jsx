import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GeminiChatPage from './pages/GeminiChatPage';
import MandiDetailsPage from './pages/MandiDetailsPage'; // <-- ADD THIS MISSING LINE
import CropDoctorPage from './pages/CropDoctorPage';
import WeatherDetailsPage from './pages/WeatherDetailsPage';
import KrishiLogPage from './pages/KrishiLogPage';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from "./pages/NotificationsPage"; 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/mandi-details" element={<MandiDetailsPage />} />
            <Route path="/crop-doctor" element={<CropDoctorPage />} />
            <Route path="/weather-details" element={<WeatherDetailsPage />} />
            <Route path="/krishi-log" element={<KrishiLogPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
          <Route path="/chat" element={<GeminiChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;