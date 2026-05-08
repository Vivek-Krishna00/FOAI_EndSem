import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { calculateSpeed } from '../utils/haversine';

const ISS_URL = '/api/iss-now';
const ASTROS_URL = '/api/astros';
const REVERSE_URL = '/api/reverse';

export function useISS() {
  const [position, setPosition] = useState(null);
  const [speed, setSpeed] = useState(27600);
  const [astronauts, setAstronauts] = useState({ number: 0, people: [] });
  const [positions, setPositions] = useState([]);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [locationName, setLocationName] = useState('Calculating...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const prevPositionRef = useRef(null);
  const prevTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const locationCacheRef = useRef({});

  const fetchLocation = useCallback(async (lat, lon) => {
    const cacheKey = `${lat.toFixed(1)},${lon.toFixed(1)}`;
    if (locationCacheRef.current[cacheKey]) {
      setLocationName(locationCacheRef.current[cacheKey]);
      return;
    }

    try {
      const response = await axios.get(REVERSE_URL, {
        params: { lat, lon, format: 'json' },
      });
      const name = response.data?.display_name;
      const fallback = 'Over the Ocean';
      if (name) {
        const parts = name.split(',');
        const trimmed = parts.slice(-3).join(',').trim();
        locationCacheRef.current[cacheKey] = trimmed;
        setLocationName(trimmed);
      } else {
        locationCacheRef.current[cacheKey] = fallback;
        setLocationName(fallback);
      }
    } catch (err) {
      locationCacheRef.current[cacheKey] = 'Over the Ocean';
      setLocationName('Over the Ocean');
      if (err?.response?.status === 429) {
        setError('Reverse geocoding rate limited. Location will update once allowed.');
      }
    }
  }, []);

  const fetchISS = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get(ISS_URL);
      const { iss_position, timestamp } = response.data;
      const lat = parseFloat(iss_position.latitude);
      const lon = parseFloat(iss_position.longitude);
      const now = timestamp || Math.floor(Date.now() / 1000);

      let calculatedSpeed = 27600;
      if (prevPositionRef.current && prevTimeRef.current) {
        const secondsElapsed = now - prevTimeRef.current;
        calculatedSpeed = calculateSpeed(prevPositionRef.current.lat, prevPositionRef.current.lon, lat, lon, secondsElapsed);
        if (calculatedSpeed > 35000 || calculatedSpeed < 10000) {
          calculatedSpeed = 27600;
        }
      }

      prevPositionRef.current = { lat, lon };
      prevTimeRef.current = now;

      const point = { lat, lon, time: new Date().toLocaleTimeString() };
      setPosition({ lat, lon });
      setSpeed(calculatedSpeed);
      setPositions((prev) => [...prev.slice(-14), point]);
      setSpeedHistory((prev) => [...prev.slice(-29), { speed: calculatedSpeed, time: point.time }]);
      setLoading(false);
      fetchLocation(lat, lon);
    } catch (err) {
      const isRateLimit = err?.response?.status === 429;
      setError(isRateLimit ? 'ISS telemetry rate limited. Please wait and refresh.' : 'Unable to load ISS telemetry.');
      setLoading(false);
    }
  }, [fetchLocation]);

  const fetchAstronauts = useCallback(async () => {
    try {
      const response = await axios.get(ASTROS_URL);
      setAstronauts({ number: response.data.number, people: response.data.people });
    } catch {
      setAstronauts({ number: 0, people: [] });
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchISS();
  }, [fetchISS]);

  useEffect(() => {
    fetchISS();
    fetchAstronauts();
    intervalRef.current = setInterval(fetchISS, 15000);
    return () => clearInterval(intervalRef.current);
  }, [fetchISS, fetchAstronauts]);

  return {
    position,
    speed,
    astronauts,
    positions,
    speedHistory,
    locationName,
    loading,
    error,
    refresh,
  };
}
