import { X, MapPin, Users, Cloud, Wind, Droplets, CloudDownload, Snowflake, Rainbow, CloudRain, Thermometer, Sun, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';

const hot_percent = 66
const cold_percent = 46
const wind_percent = 33
const wet_percent = 25
const uncomfortable_percent = 25

const months = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' },
];


interface City {
  name: string;
  country: string;
  coordinates: [number, number];
  imag?: string;
}

interface CitySidebarProps {
  city: City | null;
  isOpen: boolean;
  onClose: () => void;
}

const CitySidebar = ({ city, isOpen, onClose }: CitySidebarProps) => {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedDay, setSelectedDay] = useState(1);

   // Add state for backend probabilities
  const [hot_percent, setHotPercent] = useState('..');
  const [cold_percent, setColdPercent] = useState('..');
  
    useEffect(() => {
    if (isOpen && city) {

      setHotPercent('..');
      setColdPercent('..');

      const year = 2026;
      const month = String(selectedMonth + 1).padStart(2, '0');
      const day = String(selectedDay).padStart(2, '0');
      const date_str = `${year}${month}${day}`;
      const [lon, lat] = city.coordinates;

      fetch('http://127.0.0.1:5000/predict_temperature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon, date_str }),
      })
        .then(res => res.json())
        .then(data => {
          // Get probabilities from backend
          const hot = data.probabilities?.["Very Hot"] ?? 0;
          const cold = data.probabilities?.["Very Cold"] ?? 0;
          setHotPercent(hot === 0 ? 0.1 : hot);
          setColdPercent(cold === 0 ? 0.1 : cold);
          console.log(data);
        })
        .catch(err => {
          console.error('Backend error:', err);
          setHotPercent('..');
          setColdPercent('..');
        });
    }
  }, [isOpen, city, selectedMonth, selectedDay]);

  if (!city) return null;

  const getDaysInMonth = (month: number) => {
    const daysInMonth = new Date(2026, month + 1, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        value: day,
        label: `${day}`
      });
    }
    return days;
  };

  const days = getDaysInMonth(selectedMonth);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 "
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
      className={`fixed left-0 top-0 h-full bg-black/95 border-r border-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ width: 'var(--sidebar-width)', minWidth: '60vw', maxWidth: '90vw',
      }}
    >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{city.name}</h2>
                <p className="text-sm text-white">{city.country}</p>
              </div>
            </div>
            
             <div className="flex items-center gap-3">

              {/* Day Selection Dropdown */}
               <div className="relative">
                <select
                  className="appearance-none bg-gray-800/80 border border-gray-600 rounded-lg px-4 py-2 pr-8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
                  value={selectedDay}
                  onChange={e => setSelectedDay(Number(e.target.value))}
                >
                  {days.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

               {/* Month Selection Dropdown */}
              <div className="relative">
                <select 
                  className="appearance-none bg-gray-800/80 border border-gray-600 rounded-lg px-4 py-2 pr-8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-gray-800/80 border border-gray-600 rounded-lg px-4 py-2 text-white font-bold text-sm backdrop-blur-sm">
                2026
              </div>
              {/* Close Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={onClose}
                className="hover:bg-primary/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div
          className="flex-1 overflow-y-auto p-6 space-y-6 relative"
          style={{
           backgroundImage: `url('${city.imag}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
            {/* Weather Data in One Box - Full Width */}
            <div className="bg-black rounded-lg p-4 space-y-4 w-[80%] ml-0">
              {/* Very Hot */}
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Very Hot
                  </span>
                  <div className="h-6 w-14 bg-gray-700 rounded flex items-center justify-center text-white font-semibold">
                  {isNaN(Number(hot_percent)) ? hot_percent : Number(hot_percent).toFixed(1)}%
                </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{width: isNaN(Number(hot_percent)) ? '0%' : `${hot_percent}%`,background: 'linear-gradient(90deg, rgb(255,0,0), rgb(255,69,0), rgb(255,140,0))'}}
                  ></div>
                </div>
              </div>
              
              {/* Very Cold */}
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white flex items-center gap-2">
                    <Snowflake className="w-4 h-4" />
                    Very Cold
                  </span>
                  <div className="h-6 w-14 bg-gray-700 rounded flex items-center justify-center text-white font-semibold">
                    {isNaN(Number(cold_percent)) ? cold_percent : Number(cold_percent).toFixed(1)}%
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{width: isNaN(Number(cold_percent)) ? '0%' : `${cold_percent}%`,background: 'linear-gradient(90deg, rgb(0,191,255), rgb(135,206,250), rgb(224,255,255))'}}
                  ></div>
                </div>
              </div>
              
              {/* Very Windy */}
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    Very Windy
                  </span>
                  <div className="h-6 w-14 bg-gray-700 rounded flex items-center justify-center text-white font-semibold">{wind_percent}%</div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{width: `${wind_percent}%`,background: 'linear-gradient(90deg, rgb(135,206,250), rgb(175,238,238), rgb(224,255,255))'}}
                  ></div>
                </div>
              </div>

              {/* Very Wet */}
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white flex items-center gap-2">
                    <CloudRain className="w-4 h-4" />
                    Very Wet
                  </span>
                  <div className="h-6 w-14 bg-gray-700 rounded flex items-center justify-center text-white font-semibold">{wet_percent}%</div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{width: `${wet_percent}%`,background: 'linear-gradient(90deg, rgb(0,105,148), rgb(0,168,232), rgb(173,216,230))'}}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-black rounded-lg p-4 space-y-4 w-[94%] ml-0 h-56">
              {/* Very Hot */}
              
              
              {/* Very Cold */}
             
             
              
              {/* Very Windy */}
             

              {/* Very Wet */}
              
            </div>
            
            {/* Future Features Placeholder */}
          </div>

          
          
        </div>

        
      </div>


      
    </>
  );
};

export default CitySidebar;