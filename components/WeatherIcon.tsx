
import React from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, CloudLightning, Moon, CloudMoon } from 'lucide-react';

const WeatherIcon = ({ condition, className, isNight }: { condition: string, className?: string, isNight?: boolean }) => {
  const cond = condition.toLowerCase();
  
  if (cond.includes('snow')) return <CloudSnow className={className} />;
  if (cond.includes('storm') || cond.includes('thunder')) return <CloudLightning className={className} />;
  if (cond.includes('rain')) return <CloudRain className={className} />;
  if (cond.includes('drizzle')) return <CloudDrizzle className={className} />;
  
  if (isNight) {
    if (cond.includes('clear') || cond.includes('sun')) return <Moon className={className} />;
    if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('fog')) return <CloudMoon className={className} />;
  }
  
  if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('fog')) return <Cloud className={className} />;
  if (cond.includes('clear') || cond.includes('sun')) return <Sun className={className} />;
  
  return <Cloud className={className} />;
};

export default WeatherIcon;
