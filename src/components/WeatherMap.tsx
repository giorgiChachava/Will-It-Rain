import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface City {
  name: string;
  country: string;
  coordinates: [number, number];
  population?: string;
}

const cities: City[] = [
  { name: 'London', country: 'United Kingdom', coordinates: [-0.1276, 51.5074], population: '9M' },
  { name: 'Paris', country: 'France', coordinates: [2.3522, 48.8566], population: '2.2M' },
  { name: 'New York', country: 'United States', coordinates: [-74.0060, 40.7128], population: '8.3M' },
  { name: 'Tokyo', country: 'Japan', coordinates: [139.6917, 35.6762], population: '14M' },
  { name: 'Sydney', country: 'Australia', coordinates: [151.2093, -33.8688], population: '5.3M' },
  { name: 'Dubai', country: 'UAE', coordinates: [55.2708, 25.2048], population: '3.4M' },
  { name: 'Singapore', country: 'Singapore', coordinates: [103.8198, 1.3521], population: '5.7M' },
  { name: 'Mumbai', country: 'India', coordinates: [72.8777, 19.0760], population: '20M' },
  { name: 'São Paulo', country: 'Brazil', coordinates: [-46.6333, -23.5505], population: '12M' },
  { name: 'Los Angeles', country: 'United States', coordinates: [-118.2437, 34.0522], population: '4M' },
];

interface WeatherMapProps {
  onCitySelect: (city: City) => void;
  apiKey: string;
}

const WeatherMap = ({ onCitySelect, apiKey }: WeatherMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || !apiKey) return;

    mapboxgl.accessToken = apiKey;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      zoom: 2,
      center: [15, 30],
      pitch: 0,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      cities.forEach((city) => {
        const el = document.createElement('div');
        el.className = 'city-marker';
        el.innerHTML = `
          <div class="flex flex-col items-center cursor-pointer group">
            <div class="bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <span class="text-xs font-medium mt-1 bg-card px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              ${city.name}
            </span>
          </div>
        `;

        el.addEventListener('click', () => {
          onCitySelect(city);
          map.current?.flyTo({
            center: city.coordinates,
            zoom: 10,
            duration: 1500,
          });
          toast.success(`Viewing ${city.name}, ${city.country}`);
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat(city.coordinates)
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [apiKey, onCitySelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      {!apiKey && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="text-center space-y-4 p-6">
            <MapPin className="w-16 h-16 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherMap;
