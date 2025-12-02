import { ApiResponse } from '@/types';

const WEATHER_API_BASE_URL = 'http://api.weatherapi.com/v1';
const WEATHER_API_KEY = process.env.EXPO_WEATHER_API_KEY;

export interface CurrentWeather {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
  };
}

export interface WeatherForecast {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    humidity: number;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      date_epoch: number;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        maxwind_mph: number;
        maxwind_kph: number;
        totalprecip_mm: number;
        totalprecip_in: number;
        avgvis_km: number;
        avgvis_miles: number;
        avghumidity: number;
        daily_will_it_rain: number;
        daily_chance_of_rain: number;
        daily_will_it_snow: number;
        daily_chance_of_snow: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        uv: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
        moonrise: string;
        moonset: string;
        moon_phase: string;
        moon_illumination: string;
      };
      hour: Array<{
        time: string;
        time_epoch: number;
        temp_c: number;
        temp_f: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        wind_mph: number;
        wind_kph: number;
        humidity: number;
        feelslike_c: number;
        feelslike_f: number;
        chance_of_rain: number;
        chance_of_snow: number;
        uv: number;
      }>;
    }>;
  };
}

export const weatherService = {
  /**
   * Get current weather for a location
   */
  async getCurrentWeather(
    lat: number,
    long: number
  ): Promise<ApiResponse<CurrentWeather>> {
    try {
      const query = `${lat},${long}`;
      const url = `${WEATHER_API_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${query}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get weather forecast for a location
   */
  async getForecast(
    lat: number,
    long: number,
    days: number = 3
  ): Promise<ApiResponse<WeatherForecast>> {
    try {
      const query = `${lat},${long}`;
      const url = `${WEATHER_API_BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${query}&days=${days}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return { data: null, error: error as Error };
    }
  },
};
