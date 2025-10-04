import { X, MapPin, Users, Cloud, Wind, Droplets } from 'lucide-react';
import { Button } from './ui/button';

interface City {
  name: string;
  country: string;
  coordinates: [number, number];
  population?: string;
}

interface CitySidebarProps {
  city: City | null;
  isOpen: boolean;
  onClose: () => void;
}

const CitySidebar = ({ city, isOpen, onClose }: CitySidebarProps) => {
  if (!city) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-card border-r border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 'var(--sidebar-width)', maxWidth: '90vw' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{city.name}</h2>
                <p className="text-sm text-muted-foreground">{city.country}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-primary/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg">
                <Users className="w-5 h-5 text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Population</p>
                <p className="text-lg font-semibold text-foreground">{city.population || 'N/A'}</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 p-4 rounded-lg">
                <MapPin className="w-5 h-5 text-accent mb-2" />
                <p className="text-xs text-muted-foreground">Coordinates</p>
                <p className="text-xs font-mono text-foreground">
                  {city.coordinates[1].toFixed(2)}°, {city.coordinates[0].toFixed(2)}°
                </p>
              </div>
            </div>

            {/* Weather Data Placeholder */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Cloud className="w-5 h-5 text-primary" />
                Weather Data
              </h3>
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Temperature</span>
                    <div className="h-6 w-16 bg-muted rounded"></div>
                  </div>
                  <div className="h-2 bg-muted rounded-full"></div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Wind className="w-4 h-4" />
                      Wind Speed
                    </span>
                    <div className="h-6 w-16 bg-muted rounded"></div>
                  </div>
                  <div className="h-2 bg-muted rounded-full"></div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      Humidity
                    </span>
                    <div className="h-6 w-16 bg-muted rounded"></div>
                  </div>
                  <div className="h-2 bg-muted rounded-full"></div>
                </div>
              </div>
              
              <p className="text-xs text-center text-muted-foreground mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
                Weather data integration coming soon
              </p>
            </div>

            {/* Future Features Placeholder */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Forecast</h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3 animate-pulse">
                    <div className="h-4 w-12 bg-muted rounded mb-2"></div>
                    <div className="h-8 w-8 bg-muted rounded-full mx-auto mb-2"></div>
                    <div className="h-3 w-full bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CitySidebar;
