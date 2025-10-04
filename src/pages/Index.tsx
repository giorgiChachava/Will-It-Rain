import { useState } from 'react';
import WeatherMap from '@/components/WeatherMap';
import CitySidebar from '@/components/CitySidebar';
import ApiKeyInput from '@/components/ApiKeyInput';

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
    </div>
  );
};

export default Index;
