
import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  username: string;
  email: string;
} | null;

type Location = {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  speed?: number | null;
};

type GeofenceArea = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  isActive: boolean;
};

type SharedLocation = {
  id: string;
  recipientEmail: string;
  expiresAt: number; // timestamp
};

type AppContextType = {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentLocation: Location | null;
  locationHistory: Location[];
  geofenceAreas: GeofenceArea[];
  sharedLocations: SharedLocation[];
  watchingLocation: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  startWatchingLocation: () => void;
  stopWatchingLocation: () => void;
  addGeofenceArea: (area: Omit<GeofenceArea, 'id'>) => void;
  removeGeofenceArea: (id: string) => void;
  toggleGeofenceArea: (id: string) => void;
  shareLocation: (recipientEmail: string, duration: number) => void;
  removeSharedLocation: (id: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Sample user data for demonstration
const SAMPLE_USER = {
  id: 'user-1',
  username: 'demouser',
  email: 'demo@example.com'
};

// Mock function to simulate geofence check
const isInGeofence = (location: Location, geofence: GeofenceArea): boolean => {
  // Calculate distance between two points using Haversine formula
  const toRadians = (degree: number) => degree * (Math.PI / 180);
  const R = 6371e3; // Earth's radius in meters
  
  const lat1 = toRadians(location.latitude);
  const lat2 = toRadians(geofence.latitude);
  const deltaLat = toRadians(geofence.latitude - location.latitude);
  const deltaLon = toRadians(geofence.longitude - location.longitude);
  
  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
           Math.cos(lat1) * Math.cos(lat2) *
           Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance <= geofence.radius;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);
  const [geofenceAreas, setGeofenceAreas] = useState<GeofenceArea[]>([]);
  const [sharedLocations, setSharedLocations] = useState<SharedLocation[]>([]);
  const [watchingLocation, setWatchingLocation] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Simulate loading user from storage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would verify credentials with a backend
      // For demo, we'll just log the user in
      setUser(SAMPLE_USER);
      localStorage.setItem('user', JSON.stringify(SAMPLE_USER));
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would create a user with a backend
      // For demo, we'll just create a mock user
      const newUser = {
        id: 'user-' + Date.now(),
        username,
        email
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Signup failed:', error);
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    if (watchingLocation) {
      stopWatchingLocation();
    }
  };

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
    user,
    isAuthenticated: !!user,
    isLoading,
    currentLocation,
    locationHistory,
    geofenceAreas,
    sharedLocations,
    watchingLocation,
    login,
    signup,
    logout,
    startWatchingLocation,
    stopWatchingLocation,
    addGeofenceArea,
    removeGeofenceArea,
    toggleGeofenceArea,
    shareLocation,
    removeSharedLocation
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
