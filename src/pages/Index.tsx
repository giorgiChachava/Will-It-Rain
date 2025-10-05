import { useState } from 'react';
import WeatherMap from '@/components/WeatherMap';
import CitySidebar from '@/components/CitySidebar';
import ApiKeyInput from '@/components/ApiKeyInput';
import { useNavigate } from "react-router-dom";

interface City {
  name: string;
  country: string;
  coordinates: [number, number];
  population?: string;
}

const Index = () => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const navigate = useNavigate();

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
  };

  if (!apiKey) {
    return <ApiKeyInput onSubmit={handleApiKeySubmit} />;
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <WeatherMap onCitySelect={handleCitySelect} apiKey={apiKey} />
      <CitySidebar 
        city={selectedCity} 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      <button
        className="fixed top-4 right-4 w-10 h-10 rounded-full bg-gray-800 text-white text-2xl flex items-center justify-center shadow-lg hover:bg-gray-700 transition"
        onClick={() => navigate("/question")}
        aria-label="Help"
      >
        ?
      </button>
    </div>
  );
};

export default Index;
