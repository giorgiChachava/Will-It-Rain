import { X, MapPin, Users, Cloud, Wind, Droplets, CloudDownload, Snowflake, Rainbow, CloudRain, Thermometer, Sun, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';

const very_hot_percent = 66
const very_cold_percent = 46
const wind_percent = 33
const wet_percent = 25
const uncomfortable_percent = 25

//const [tempProbs, setTempProbs] = useState<{[key: string]: number}>({});

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
  const [tempProbs, setTempProbs] = useState<{[key: string]: number}>({});
  const [wind_percent, setWindPercent] = useState('..');
  const [wet_percent, setWetPercent] = useState('..');

   // Add state for backend probabilities
  const [very_hot_percent, setVeryHotPercent] = useState('..');
  const [very_cold_percent, setVeryColdPercent] = useState('..');
  const [cold_percent, setColdPercent] = useState('..');
  const [mild_percent, setMildPercent] = useState('..');
  const [warm_percent, setWarmPercent] = useState('..');
  
    useEffect(() => {
    if (isOpen && city) {

      setVeryHotPercent('..');
      setVeryColdPercent('..');
      setWindPercent('..');
      setWetPercent('..');
      setColdPercent('..');
      setMildPercent('..');
      setWarmPercent('..');

      const year = 2026;
      const month = String(selectedMonth + 1).padStart(2, '0');
      const day = String(selectedDay).padStart(2, '0');
      const date_str = `${year}${month}${day}`;
      const [lon, lat] = city.coordinates;

      fetch('http://127.0.0.1:5000/predict_all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon, date_str }),
    
      })
        .then(res => res.json())
        .then(data => {
          setTempProbs(data.temperature || {});
          // Get probabilities from backend
          const hot = data.temperature?.["Very Hot"] ?? 0;
          const cold = data.temperature?.["Very Cold"] ?? 0;
          setVeryHotPercent(hot === 0 ? 0.1 : hot);
          setVeryColdPercent(cold === 0 ? 0.1 : cold);
          setColdPercent(data.temperature?.["Cold"] ?? 0.1);
          setMildPercent(data.temperature?.["Mild"] ?? 0.1);
          setWarmPercent(data.temperature?.["Warm / Hot"] ?? 0.1);
          // Wind
        const wind = data.wind?.["Windy"] ?? 0;
        setWindPercent(wind === 0 ? 0.1 : wind);

        // Precipitation (Very Wet: use "Heavy" or "Final Rain")
        const wet = data.precipitation?.["Heavy"] ?? 0;
        setWetPercent(wet === 0 ? 0.1 : wet);
          console.log(data);
        })
        .catch(err => {
          console.error('Backend error:', err);
          setVeryHotPercent('..');
          setVeryColdPercent('..');
          setColdPercent('..');
          setMildPercent('..');
          setWarmPercent('..');
        }),[lat, lon, date_str];
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
           backgroundImage: `
            radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7) 100%),
            url('${city.imag}')
          `,
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
                  {isNaN(Number(very_hot_percent)) ? very_hot_percent : Number(very_hot_percent).toFixed(1)}%
                </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{width: isNaN(Number(very_hot_percent)) ? '0%' : `${very_hot_percent}%`,background: 'linear-gradient(90deg, rgb(255,0,0), rgb(255,69,0), rgb(255,140,0))'}}
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
                    {isNaN(Number(very_cold_percent)) ? very_cold_percent : Number(very_cold_percent).toFixed(1)}%
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{width: isNaN(Number(very_cold_percent)) ? '0%' : `${very_cold_percent}%`,background: 'linear-gradient(90deg, rgb(0,191,255), rgb(135,206,250), rgb(224,255,255))'}}
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
                  <div className="h-6 w-14 bg-gray-700 rounded flex items-center justify-center text-white font-semibold">
                    {isNaN(Number(wind_percent)) ? wind_percent : Number(wind_percent).toFixed(1)}%
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{width: isNaN(Number(wind_percent)) ? '0%' : `${wind_percent}%`,background: 'linear-gradient(90deg, rgb(135,206,250), rgb(175,238,238), rgb(224,255,255))'}}
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
                  <div className="h-6 w-14 bg-gray-700 rounded flex items-center justify-center text-white font-semibold">
                    {isNaN(Number(wet_percent)) ? wet_percent : Number(wet_percent).toFixed(1)}%
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{width: isNaN(Number(wet_percent)) ? '0%' : `${wet_percent}%`,background: 'linear-gradient(90deg, rgb(0,105,148), rgb(0,168,232), rgb(173,216,230))'}}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-black rounded-lg p-4 space-y-4 w-[94%] ml-0 h-56">
                    {/* Vertical histogram for temperature categories */}
                  <div className="relative flex flex-row items-end h-48 w-full">
            {/* "Temperature" label on top right */}
            <span className="absolute top-0 right-2 text-white text-sm font-semibold z-20">
              Expected Temperature °C
            </span>
            {/* Probability axis */}
            <div className="flex flex-col items-center mr-2" style={{ height: '100%' }}>
              <span className="text-xs text-white z-10 mt-2">100%</span>
              <div className="relative flex-1 w-full flex justify-center">
                <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white opacity-70"></div>
              </div>
              <span className="text-xs text-white z-10">0%</span>
            </div>
            {/* Bars */}
            <div className="flex flex-row items-end h-full w-full justify-between">
              {[
                { label: "Very Cold", color: "bg-blue-400", value: Number(very_cold_percent), range: "<0°" },
                { label: "Cold", color: "bg-blue-200", value: Number(cold_percent), range: "0-10°" },
                { label: "Mild", color: "bg-green-300", value: Number(mild_percent), range: "10-20°" },
                { label: "Warm", color: "bg-yellow-300", value: Number(warm_percent), range: "20-30°" },
                { label: "Very Hot", color: "bg-red-500", value: Number(very_hot_percent), range: ">30°" },
              ].map((cat) => (
                <div key={cat.label} className="flex flex-col items-center flex-1">
                  {/* Percent on top */}
                  <span className="mb-1 text-xs text-white font-semibold">
                    {isNaN(cat.value) ? '..' : cat.value.toFixed(1)}%
                  </span>
                  {/* Bar */}
                  <div
                    className={`w-8 ${cat.color} rounded-t`}
                    style={{
                      height: `${isNaN(cat.value) ? 0 : cat.value * 1.15}px`,
                      minHeight: '2px',
                      transition: 'height 0.5s'
                    }}
                  ></div>
                  {/* Label */}
                  <span className="mt-2 text-xs text-white">{cat.label}</span>
                  {/* Temperature range below */}
                  <span className="text-xs text-gray-300">{cat.range}</span>
                </div>
              ))}
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