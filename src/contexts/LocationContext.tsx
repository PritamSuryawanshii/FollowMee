import React, { createContext, useContext, useState, useEffect } from 'react';
import { Location } from '../types/AppTypes';

type LocationContextType = {
  currentLocation: Location | null;
  locationHistory: Location[];
  watchingLocation: boolean;
  startWatchingLocation: () => void;
  stopWatchingLocation: () => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);
  const [watchingLocation, setWatchingLocation] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  
  // Load location history from localStorage on initialization
  useEffect(() => {
    const storedHistory = localStorage.getItem('locationHistory');
    if (storedHistory) {
      setLocationHistory(JSON.parse(storedHistory));
    }
  }, []);
  
  // Save location history to localStorage whenever it changes
  useEffect(() => {
    if (locationHistory.length > 0) {
      // Only keep the last 100 locations to avoid localStorage size limits
      const limitedHistory = locationHistory.slice(-100);
      localStorage.setItem('locationHistory', JSON.stringify(limitedHistory));
    }
  }, [locationHistory]);

  const startWatchingLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }

    setWatchingLocation(true);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed
        };
        
        setCurrentLocation(newLocation);
        setLocationHistory(prev => [...prev, newLocation]);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    setWatchId(id);
  };

  const stopWatchingLocation = () => {
    if (watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
    setWatchingLocation(false);
    setWatchId(null);
  };

  const value = {
    currentLocation,
    locationHistory,
    watchingLocation,
    startWatchingLocation,
    stopWatchingLocation
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
