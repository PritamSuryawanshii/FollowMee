
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { LocationProvider, useLocation } from './LocationContext';
import { GeofenceProvider, useGeofence } from './GeofenceContext';

// Combined provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <LocationProvider>
        <GeofenceProvider>
          {children}
        </GeofenceProvider>
      </LocationProvider>
    </AuthProvider>
  );
};

// Combined hook for accessing all contexts
export const useApp = () => {
  const auth = useAuth();
  const location = useLocation();
  const geofence = useGeofence();
  
  // We stop tracking location when user logs out
  const logout = () => {
    if (location.watchingLocation) {
      location.stopWatchingLocation();
    }
    auth.logout();
  };

  return {
    // Auth context
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    login: auth.login,
    signup: auth.signup,
    logout,
    
    // Location context
    currentLocation: location.currentLocation,
    locationHistory: location.locationHistory,
    watchingLocation: location.watchingLocation,
    startWatchingLocation: location.startWatchingLocation,
    stopWatchingLocation: location.stopWatchingLocation,
    
    // Geofence context
    geofenceAreas: geofence.geofenceAreas,
    sharedLocations: geofence.sharedLocations,
    addGeofenceArea: geofence.addGeofenceArea,
    removeGeofenceArea: geofence.removeGeofenceArea,
    toggleGeofenceArea: geofence.toggleGeofenceArea,
    shareLocation: geofence.shareLocation,
    removeSharedLocation: geofence.removeSharedLocation
  };
};
