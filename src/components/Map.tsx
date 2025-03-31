import React, { useCallback, useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Updated default center to Mumbai, India
const defaultCenter = {
  lat: 19.0760,  // Latitude of Mumbai
  lng: 72.8777   // Longitude of Mumbai
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem'
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

const Map: React.FC = () => {
  const { 
    currentLocation, 
    watchingLocation, 
    startWatchingLocation, 
    stopWatchingLocation,
    geofenceAreas
  } = useApp();

  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: '', // Google Maps provides a development API key that works with restrictions
    libraries: ['places', 'geometry'],
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapLoaded(true);
  }, []);

  React.useEffect(() => {
    if (mapLoaded && mapRef.current && currentLocation) {
      const center = {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      };
      
      mapRef.current.panTo(center);
      mapRef.current.setZoom(15);
    }
  }, [currentLocation, mapLoaded]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-card">
        <div className="text-center p-6">
          <p className="text-destructive font-medium mb-2">Error loading map</p>
          <p className="text-muted-foreground">
            There was a problem loading Google Maps. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-card">
        <div className="animate-pulse text-center">
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={currentLocation ? 
          { lat: currentLocation.latitude, lng: currentLocation.longitude } : 
          defaultCenter
        }
        zoom={13}
        options={options}
        onLoad={onMapLoad}
      >
        {currentLocation && (
          <Marker
            position={{
              lat: currentLocation.latitude,
              lng: currentLocation.longitude
            }}
            icon={{
              url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ED8936' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2a10 10 0 1 0 10 10H12V2Z'/%3E%3Cpath d='M12 2v10h10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Z'/%3E%3C/svg%3E",
              scaledSize: new google.maps.Size(36, 36),
              anchor: new google.maps.Point(18, 18)
            }}
          />
        )}

        {geofenceAreas.map((area) => (
          <React.Fragment key={area.id}>
            <Marker
              position={{
                lat: area.latitude,
                lng: area.longitude
              }}
              title={area.name}
              icon={{
                url: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${area.isActive ? '%23285E61' : '%23718096'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E`,
                scaledSize: new google.maps.Size(28, 28),
                anchor: new google.maps.Point(14, 28)
              }}
            />
            <Circle
              center={{
                lat: area.latitude,
                lng: area.longitude
              }}
              radius={area.radius}
              options={{
                strokeColor: area.isActive ? '#285E61' : '#718096',
                strokeOpacity: 0.5,
                strokeWeight: 2,
                fillColor: area.isActive ? '#285E61' : '#718096',
                fillOpacity: 0.2,
              }}
            />
          </React.Fragment>
        ))}
      </GoogleMap>
      
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        {watchingLocation ? (
          <Button 
            variant="destructive" 
            size="sm" 
            className="rounded-full h-12 w-12 p-0"
            onClick={stopWatchingLocation}
          >
            <MapPin className="h-5 w-5" />
          </Button>
        ) : (
          <Button 
            variant="default"
            size="sm"
            className="rounded-full h-12 w-12 p-0 bg-roamly-orange hover:bg-roamly-orange/90"
            onClick={() => {
              startWatchingLocation();
              toast({
                title: "Location Tracking Enabled",
                description: "Your location is now being tracked on the map.",
                duration: 3000,
              });
            }}
          >
            <Navigation className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Map;
