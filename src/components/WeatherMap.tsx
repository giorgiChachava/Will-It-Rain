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
  // Americas
  { name: 'New York', country: 'United States', coordinates: [-74.0060, 40.7128], population: '8.3M' },
  { name: 'Los Angeles', country: 'United States', coordinates: [-118.2437, 34.0522], population: '4M' },
  { name: 'Chicago', country: 'United States', coordinates: [-87.6298, 41.8781], population: '2.7M' },
  { name: 'Houston', country: 'United States', coordinates: [-95.3698, 29.7604], population: '2.3M' },
  { name: 'Miami', country: 'United States', coordinates: [-80.1918, 25.7617], population: '470K' },
  { name: 'San Francisco', country: 'United States', coordinates: [-122.4194, 37.7749], population: '870K' },
  { name: 'Seattle', country: 'United States', coordinates: [-122.3321, 47.6062], population: '750K' },
  { name: 'Toronto', country: 'Canada', coordinates: [-79.3832, 43.6532], population: '2.9M' },
  { name: 'Vancouver', country: 'Canada', coordinates: [-123.1207, 49.2827], population: '675K' },
  { name: 'Mexico City', country: 'Mexico', coordinates: [-99.1332, 19.4326], population: '9.2M' },
  { name: 'São Paulo', country: 'Brazil', coordinates: [-46.6333, -23.5505], population: '12M' },
  { name: 'Rio de Janeiro', country: 'Brazil', coordinates: [-43.1729, -22.9068], population: '6.7M' },
  { name: 'Buenos Aires', country: 'Argentina', coordinates: [-58.3816, -34.6037], population: '3M' },
  { name: 'Lima', country: 'Peru', coordinates: [-77.0428, -12.0464], population: '9M' },
  { name: 'Bogotá', country: 'Colombia', coordinates: [-74.0721, 4.7110], population: '7.4M' },
  
  // Europe
  { name: 'London', country: 'United Kingdom', coordinates: [-0.1276, 51.5074], population: '9M' },
  { name: 'Paris', country: 'France', coordinates: [2.3522, 48.8566], population: '2.2M' },
  { name: 'Berlin', country: 'Germany', coordinates: [13.4050, 52.5200], population: '3.7M' },
  { name: 'Madrid', country: 'Spain', coordinates: [-3.7038, 40.4168], population: '3.2M' },
  { name: 'Barcelona', country: 'Spain', coordinates: [2.1734, 41.3851], population: '1.6M' },
  { name: 'Rome', country: 'Italy', coordinates: [12.4964, 41.9028], population: '2.8M' },
  { name: 'Milan', country: 'Italy', coordinates: [9.1900, 45.4642], population: '1.4M' },
  { name: 'Amsterdam', country: 'Netherlands', coordinates: [4.9041, 52.3676], population: '870K' },
  { name: 'Brussels', country: 'Belgium', coordinates: [4.3517, 50.8503], population: '1.2M' },
  { name: 'Vienna', country: 'Austria', coordinates: [16.3738, 48.2082], population: '1.9M' },
  { name: 'Stockholm', country: 'Sweden', coordinates: [18.0686, 59.3293], population: '975K' },
  { name: 'Copenhagen', country: 'Denmark', coordinates: [12.5683, 55.6761], population: '640K' },
  { name: 'Oslo', country: 'Norway', coordinates: [10.7522, 59.9139], population: '700K' },
  { name: 'Helsinki', country: 'Finland', coordinates: [24.9384, 60.1695], population: '655K' },
  { name: 'Warsaw', country: 'Poland', coordinates: [21.0122, 52.2297], population: '1.8M' },
  { name: 'Prague', country: 'Czech Republic', coordinates: [14.4378, 50.0755], population: '1.3M' },
  { name: 'Budapest', country: 'Hungary', coordinates: [19.0402, 47.4979], population: '1.7M' },
  { name: 'Athens', country: 'Greece', coordinates: [23.7275, 37.9838], population: '660K' },
  { name: 'Lisbon', country: 'Portugal', coordinates: [-9.1393, 38.7223], population: '505K' },
  { name: 'Dublin', country: 'Ireland', coordinates: [-6.2603, 53.3498], population: '555K' },
  { name: 'Moscow', country: 'Russia', coordinates: [37.6173, 55.7558], population: '12M' },
  { name: 'Istanbul', country: 'Turkey', coordinates: [28.9784, 41.0082], population: '15M' },
  
  // Asia
  { name: 'Tokyo', country: 'Japan', coordinates: [139.6917, 35.6762], population: '14M' },
  { name: 'Osaka', country: 'Japan', coordinates: [135.5023, 34.6937], population: '2.7M' },
  { name: 'Beijing', country: 'China', coordinates: [116.4074, 39.9042], population: '21M' },
  { name: 'Shanghai', country: 'China', coordinates: [121.4737, 31.2304], population: '27M' },
  { name: 'Hong Kong', country: 'China', coordinates: [114.1694, 22.3193], population: '7.5M' },
  { name: 'Seoul', country: 'South Korea', coordinates: [126.9780, 37.5665], population: '9.7M' },
  { name: 'Singapore', country: 'Singapore', coordinates: [103.8198, 1.3521], population: '5.7M' },
  { name: 'Bangkok', country: 'Thailand', coordinates: [100.5018, 13.7563], population: '10M' },
  { name: 'Mumbai', country: 'India', coordinates: [72.8777, 19.0760], population: '20M' },
  { name: 'Delhi', country: 'India', coordinates: [77.1025, 28.7041], population: '30M' },
  { name: 'Bangalore', country: 'India', coordinates: [77.5946, 12.9716], population: '12M' },
  { name: 'Kolkata', country: 'India', coordinates: [88.3639, 22.5726], population: '14M' },
  { name: 'Dubai', country: 'UAE', coordinates: [55.2708, 25.2048], population: '3.4M' },
  { name: 'Abu Dhabi', country: 'UAE', coordinates: [54.3773, 24.4539], population: '1.5M' },
  { name: 'Riyadh', country: 'Saudi Arabia', coordinates: [46.6753, 24.7136], population: '7M' },
  { name: 'Tel Aviv', country: 'Israel', coordinates: [34.7818, 32.0853], population: '460K' },
  { name: 'Jakarta', country: 'Indonesia', coordinates: [106.8456, -6.2088], population: '10M' },
  { name: 'Manila', country: 'Philippines', coordinates: [120.9842, 14.5995], population: '1.8M' },
  { name: 'Kuala Lumpur', country: 'Malaysia', coordinates: [101.6869, 3.1390], population: '1.8M' },
  { name: 'Taipei', country: 'Taiwan', coordinates: [121.5654, 25.0330], population: '2.6M' },
  
  // Africa
  { name: 'Cairo', country: 'Egypt', coordinates: [31.2357, 30.0444], population: '20M' },
  { name: 'Lagos', country: 'Nigeria', coordinates: [3.3792, 6.5244], population: '15M' },
  { name: 'Johannesburg', country: 'South Africa', coordinates: [28.0473, -26.2041], population: '5.6M' },
  { name: 'Cape Town', country: 'South Africa', coordinates: [18.4241, -33.9249], population: '4.6M' },
  { name: 'Nairobi', country: 'Kenya', coordinates: [36.8219, -1.2921], population: '4.4M' },
  { name: 'Casablanca', country: 'Morocco', coordinates: [-7.6164, 33.5731], population: '3.7M' },
  
  // Oceania
  { name: 'Sydney', country: 'Australia', coordinates: [151.2093, -33.8688], population: '5.3M' },
  { name: 'Melbourne', country: 'Australia', coordinates: [144.9631, -37.8136], population: '5M' },
  { name: 'Brisbane', country: 'Australia', coordinates: [153.0251, -27.4698], population: '2.5M' },
  { name: 'Perth', country: 'Australia', coordinates: [115.8605, -31.9505], population: '2.1M' },
  { name: 'Auckland', country: 'New Zealand', coordinates: [174.7633, -36.8485], population: '1.7M' },
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
      style: 'mapbox://styles/mapbox/outdoors-v12',
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

    const ZOOM_THRESHOLD = 5;

    map.current.on('load', () => {
    cities.forEach((city) => {
        const el = document.createElement('div');
        el.className = 'city-marker';
        el.style.display = 'none'; // Hidden by default
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

      // Update marker visibility based on zoom level
      const updateMarkerVisibility = () => {
        const zoom = map.current?.getZoom() || 0;
        markersRef.current.forEach(marker => {
          const el = marker.getElement();
          if (zoom >= ZOOM_THRESHOLD) {
            el.style.display = 'block';
          } else {
            el.style.display = 'none';
          }
        });
      };

      // Listen to zoom changes
      map.current?.on('zoom', updateMarkerVisibility);
      
      // Initial check
      updateMarkerVisibility();
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
