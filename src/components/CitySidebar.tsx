import { X, MapPin, Users, Cloud, Wind, Droplets, CloudDownload, Snowflake, Rainbow, CloudRain, Thermometer, Sun } from 'lucide-react';
import { Button } from './ui/button';

const hot_percent = 66
const cold_percent = 46
const wind_percent = 33
const wet_percent = 25
const uncomfortable_percent = 25

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
      className={`fixed left-0 top-0 h-full bg-black/95 border-r border-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ width: 'var(--sidebar-width)', minWidth: '60vw', maxWidth: '90vw' }}
    >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{city.name}</h2>
                <p className="text-sm text-white">{city.country}</p>
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
          <div
          className="flex-1 overflow-y-auto p-6 space-y-6 relative"
          style={{
            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/330px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg')`,
            backgroundSize: 'cover',       // image covers the div
            backgroundPosition: 'center',  // centered nicely
            backgroundRepeat: 'no-repeat', 
          // no tiling
          }}
        >
            {/* Quick Stats */}

            {/* Weather Data Placeholder */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="bg-black rounded-lg p-4 w-11/12 sm:w-64 md:w-72 lg:w-80 h-15">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Very Hot
                  </span>
                  <div className="h-6 w-16 bg-gray-700 rounded flex items-center justify-center text-white font-bold">{hot_percent}%</div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div
                      className="h-2 rounded-full"
                      style={{width: `${hot_percent}%`,background: 'linear-gradient(90deg, rgb(255,0,0), rgb(255,69,0), rgb(255,140,0))'}} // <-- fill according to percentage
                    ></div>
                  </div>
                </div>
              </div>
                
               <div className="bg-black rounded-lg p-4 w-11/12 sm:w-64 md:w-72 lg:w-80 h-15">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white flex items-center gap-2">
                    <Snowflake className="w-4 h-4" />
                    Very Cold
                  </span>
                  <div className="h-6 w-16 bg-gray-700 rounded flex items-center justify-center text-white font-bold">{cold_percent}%</div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div
                      className="h-2 rounded-full"
                      style={{width: `${cold_percent}%`,background: 'linear-gradient(90deg, rgb(0,191,255), rgb(135,206,250), rgb(224,255,255))'}} // <-- fill according to percentage
                    ></div>
                  </div>
                </div>
              </div>
                
                 <div className="bg-black rounded-lg p-4 w-11/12 sm:w-64 md:w-72 lg:w-80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white flex items-center gap-2">
                      <Wind className="w-4 h-4" />
                      Very Windy
                    </span>
                    <div className="h-6 w-16 bg-gray-700 rounded flex items-center justify-center text-white font-bold">{wind_percent}%</div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div
                      className="h-2 rounded-full"
                      style={{width: `${wind_percent}%`,background: 'linear-gradient(90deg, rgb(135,206,250), rgb(175,238,238), rgb(224,255,255))'}} // <-- fill according to percentage
                    ></div>
                  </div>
                </div>
              </div>

                 <div className="bg-black rounded-lg p-4 w-11/12 sm:w-64 md:w-72 lg:w-80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white flex items-center gap-2">
                      <CloudRain className="w-4 h-4" />
                        Very Wet
                    </span>
                    <div className="h-6 w-16 bg-gray-700 rounded flex items-center justify-center text-white font-bold">{wet_percent}%</div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div
                      className="h-2 rounded-full"
                      style={{width: `${wet_percent}%`,background: 'linear-gradient(90deg, rgb(0,105,148), rgb(0,168,232), rgb(173,216,230))'}} // <-- fill according to percentage
                    ></div>
                  </div>
                </div>
              </div>

          
              </div>

              
            </div>

            {/* Future Features Placeholder */}
          </div>
        </div>
      </div>
    </>
  );
};

export default CitySidebar;
