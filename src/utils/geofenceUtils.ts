
import { Location, GeofenceArea } from '../types/AppTypes';

// Calculate if a location is within a geofence area
export const isInGeofence = (location: Location, geofence: GeofenceArea): boolean => {
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
