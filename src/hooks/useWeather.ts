import { useState, useEffect } from 'react';

// Open-Meteo API for Manali, India
// Lat: 32.2396, Long: 77.1887
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast?latitude=32.2396&longitude=77.1887&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto';

export interface WeatherData {
    temp: number;
    condition: string;
    windSpeed: number;
    humidity: number;
    code: number;
}

export function useWeather() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWeather() {
            try {
                const res = await fetch(WEATHER_API);
                const data = await res.json();

                if (data.current) {
                    setWeather({
                        temp: Math.round(data.current.temperature_2m),
                        condition: getWeatherCondition(data.current.weather_code),
                        windSpeed: data.current.wind_speed_10m,
                        humidity: data.current.relative_humidity_2m,
                        code: data.current.weather_code
                    });
                }
            } catch (error) {
                console.error("Failed to fetch weather:", error);
                // Fallback to "Winter" default if API fails
                setWeather({
                    temp: -2,
                    condition: "Snow",
                    windSpeed: 12,
                    humidity: 65,
                    code: 71
                });
            } finally {
                setLoading(false);
            }
        }

        fetchWeather();

        // Refresh every 30 mins
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return { weather, loading };
}

// WMO Weather Codes to readable string
function getWeatherCondition(code: number): string {
    if (code === 0) return "Sunny";
    if (code >= 1 && code <= 3) return "Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Showers";
    if (code >= 95) return "Thunderstorm";
    return "Clear";
}
