import { useEffect } from 'react';

interface ApiKeyInputProps {
  onSubmit: (apiKey: string) => void;
}

// ✅ Replace with your actual Mapbox API key below:
const MAPBOX_API_KEY = "pk.eyJ1IjoiZ3ZhbmNhLWtoMSIsImEiOiJjbWdjODR6bW8xM3p0MmpzN2JoNmM3M2puIn0.SODyQvGBBnXCtNNb5wraow";

const ApiKeyInput = ({ onSubmit }: ApiKeyInputProps) => {
  useEffect(() => {
    onSubmit(MAPBOX_API_KEY);
  }, []);

  return null; // No input shown anymore
};

export default ApiKeyInput;