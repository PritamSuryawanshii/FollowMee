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
  
  // Load user data from localStorage on initialization
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    const storedGeofences = localStorage.getItem('geofenceAreas');
    if (storedGeofences) {
      setGeofenceAreas(JSON.parse(storedGeofences));
    }
    
    const storedHistory = localStorage.getItem('locationHistory');
    if (storedHistory) {
      setLocationHistory(JSON.parse(storedHistory));
    }
    
    const storedSharedLocations = localStorage.getItem('sharedLocations');
    if (storedSharedLocations) {
      setSharedLocations(JSON.parse(storedSharedLocations));
    }
    
    setIsLoading(false);
  }, []);
  
  // Save geofence areas to localStorage whenever they change
  useEffect(() => {
    if (geofenceAreas.length > 0) {
      localStorage.setItem('geofenceAreas', JSON.stringify(geofenceAreas));
    }
  }, [geofenceAreas]);
  
  // Save location history to localStorage whenever it changes
  useEffect(() => {
    if (locationHistory.length > 0) {
      // Only keep the last 100 locations to avoid localStorage size limits
      const limitedHistory = locationHistory.slice(-100);
      localStorage.setItem('locationHistory', JSON.stringify(limitedHistory));
    }
  }, [locationHistory]);
  
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check if the user exists in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: any) => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      // Remove password from user object before storing in state
      const { password: _, ...userWithoutPassword } = foundUser;
      
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return;
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
      // Get existing users or initialize empty array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if email already exists
      const emailExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        throw new Error('Email already registered');
      }
      
      // Create new user
      const newUser = {
        id: 'user-' + Date.now(),
        username,
        email,
        password // In a real app, this would be hashed
      };
      
      // Add to users array
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Log the user in (remove password from user object)
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
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
