
import React, { createContext, useContext, useState, useEffect } from 'react';
import { GeofenceArea, SharedLocation, Location } from '../types/AppTypes';
import { isInGeofence } from '../utils/geofenceUtils';
import { useLocation } from './LocationContext';

type GeofenceContextType = {
  geofenceAreas: GeofenceArea[];
  sharedLocations: SharedLocation[];
  addGeofenceArea: (area: Omit<GeofenceArea, 'id'>) => void;
  removeGeofenceArea: (id: string) => void;
  toggleGeofenceArea: (id: string) => void;
  shareLocation: (recipientEmail: string, duration: number) => void;
  removeSharedLocation: (id: string) => void;
};

const GeofenceContext = createContext<GeofenceContextType | undefined>(undefined);

export const GeofenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentLocation } = useLocation();
  const [geofenceAreas, setGeofenceAreas] = useState<GeofenceArea[]>([]);
  const [sharedLocations, setSharedLocations] = useState<SharedLocation[]>([]);
  
  // Load geofence areas from localStorage on initialization
  useEffect(() => {
    const storedGeofences = localStorage.getItem('geofenceAreas');
    if (storedGeofences) {
      setGeofenceAreas(JSON.parse(storedGeofences));
    }
    
    const storedSharedLocations = localStorage.getItem('sharedLocations');
    if (storedSharedLocations) {
      setSharedLocations(JSON.parse(storedSharedLocations));
    }
  }, []);
  
  // Save geofence areas to localStorage whenever they change
  useEffect(() => {
    if (geofenceAreas.length > 0) {
      localStorage.setItem('geofenceAreas', JSON.stringify(geofenceAreas));
    }
  }, [geofenceAreas]);
  
  // Save shared locations to localStorage whenever they change
  useEffect(() => {
    if (sharedLocations.length > 0) {
      localStorage.setItem('sharedLocations', JSON.stringify(sharedLocations));
    }
  }, [sharedLocations]);

  // Geofence checking effect
  useEffect(() => {
    if (currentLocation && geofenceAreas.length > 0) {
      geofenceAreas.forEach(area => {
        if (area.isActive) {
          const inGeofence = isInGeofence(currentLocation, area);
          // This is where we would trigger notifications in a real app
          console.log(`User is ${inGeofence ? 'inside' : 'outside'} geofence: ${area.name}`);
        }
      });
    }
  }, [currentLocation, geofenceAreas]);

  const addGeofenceArea = (area: Omit<GeofenceArea, 'id'>) => {
    const newArea: GeofenceArea = {
      ...area,
      id: 'geofence-' + Date.now()
    };
    setGeofenceAreas(prev => [...prev, newArea]);
  };

  const removeGeofenceArea = (id: string) => {
    setGeofenceAreas(prev => prev.filter(area => area.id !== id));
  };

  const toggleGeofenceArea = (id: string) => {
    setGeofenceAreas(prev => prev.map(area => 
      area.id === id ? { ...area, isActive: !area.isActive } : area
    ));
  };

  const shareLocation = (recipientEmail: string, duration: number) => {
    const expiresAt = Date.now() + duration * 60 * 1000; // Convert minutes to milliseconds
    const newShare: SharedLocation = {
      id: 'share-' + Date.now(),
      recipientEmail,
      expiresAt
    };
    setSharedLocations(prev => [...prev, newShare]);
  };

  const removeSharedLocation = (id: string) => {
    setSharedLocations(prev => prev.filter(share => share.id !== id));
  };

  const value = {
    geofenceAreas,
    sharedLocations,
    addGeofenceArea,
    removeGeofenceArea,
    toggleGeofenceArea,
    shareLocation,
    removeSharedLocation
  };

  return <GeofenceContext.Provider value={value}>{children}</GeofenceContext.Provider>;
};

export const useGeofence = (): GeofenceContextType => {
  const context = useContext(GeofenceContext);
  if (context === undefined) {
    throw new Error('useGeofence must be used within a GeofenceProvider');
  }
  return context;
};
