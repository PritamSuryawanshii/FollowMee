
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Default token - will be replaced by user input if needed
let MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZWRldiIsImEiOiJjbHZpeXE0MDgwYWV5MmtvNnRtdHVhc2diIn0.OMj4t3_TN8HfYUQEkFRqGw';

const Map: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const geofenceMarkers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const geofenceCircles = useRef<{ [key: string]: mapboxgl.GeoJSONSource }>({});
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [customToken, setCustomToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  
  const { 
    currentLocation, 
    watchingLocation, 
    startWatchingLocation, 
    stopWatchingLocation,
    geofenceAreas
  } = useApp();

  const initializeMap = () => {
    if (!mapContainer.current) return;
    
    // Clear previous errors
    setMapError(null);
    
    try {
      // Set access token for mapbox
      mapboxgl.accessToken = customToken || MAPBOX_TOKEN;
      
      // Remove old map if it exists
      if (map.current) {
        map.current.remove();
      }
      
      // Create the map instance
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.5, 40], // Default to NYC area
        zoom: 9,
      });
      
      map.current = mapInstance;
  
      // Add navigation controls
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
      mapInstance.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }));
  
      // Set map as loaded when it's ready
      mapInstance.on('load', () => {
        console.log('Map loaded successfully');
        // Save the token if it worked
        if (customToken) {
          localStorage.setItem('mapbox_token', customToken);
          // Update the global token
          MAPBOX_TOKEN = customToken;
        }
        setMapLoaded(true);
        setShowTokenInput(false);
      });
      
      // Handle map load errors
      mapInstance.on('error', (e) => {
        console.error('Map error:', e);
        if (e.error?.status === 401) {
          setMapError('Invalid Mapbox access token. Please enter a valid token.');
          setShowTokenInput(true);
        } else {
          setMapError(`Error loading map: ${e.error?.message || 'Unknown error'}`);
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please try again.');
      setShowTokenInput(true);
    }
  };

  // Check for saved token on first load
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setCustomToken(savedToken);
      MAPBOX_TOKEN = savedToken;
    }
    
    initializeMap();
    
    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update marker when location changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !currentLocation) return;
    
    console.log('Updating location on map', currentLocation);
    
    const { latitude, longitude } = currentLocation;
    
    if (!marker.current) {
      // Create new marker
      marker.current = new mapboxgl.Marker({
        color: '#ED8936',
        scale: 0.8
      })
        .setLngLat([longitude, latitude])
        .addTo(map.current);
        
      // Fly to current location
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        speed: 1.5
      });
    } else {
      // Update existing marker
      marker.current.setLngLat([longitude, latitude]);
    }
    
    // Create pulse effect at location
    if (!map.current.getSource('location-pulse')) {
      map.current.addSource('location-pulse', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            properties: {}
          }]
        }
      });
      
      map.current.addLayer({
        id: 'location-pulse-circle',
        type: 'circle',
        source: 'location-pulse',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 10,
            18, 40
          ],
          'circle-color': '#ED8936',
          'circle-opacity': 0.3,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ED8936'
        }
      });
    } else {
      // Update pulse location
      const source = map.current.getSource('location-pulse') as mapboxgl.GeoJSONSource;
      source.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          properties: {}
        }]
      });
    }
  }, [currentLocation, mapLoaded]);

  // Handle geofence areas
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    // Remove old markers and circles that aren't in the new list
    Object.keys(geofenceMarkers.current).forEach(id => {
      if (!geofenceAreas.find(area => area.id === id)) {
        geofenceMarkers.current[id].remove();
        delete geofenceMarkers.current[id];
        
        if (map.current?.getLayer(`geofence-circle-${id}`)) {
          map.current.removeLayer(`geofence-circle-${id}`);
        }
        if (map.current?.getSource(`geofence-source-${id}`)) {
          map.current.removeSource(`geofence-source-${id}`);
        }
        delete geofenceCircles.current[id];
      }
    });
    
    // Add or update geofence visualizations
    geofenceAreas.forEach(area => {
      const { id, latitude, longitude, radius, name, isActive } = area;
      
      // Add marker if it doesn't exist
      if (!geofenceMarkers.current[id]) {
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `<h3 class="font-medium">${name}</h3><p>Radius: ${radius}m</p>`;
        
        const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent);
        
        geofenceMarkers.current[id] = new mapboxgl.Marker({
          color: isActive ? '#285E61' : '#718096',
          scale: 0.8
        })
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map.current!);
      } else {
        // Update marker position and color
        geofenceMarkers.current[id]
          .setLngLat([longitude, latitude])
          .getElement().style.color = isActive ? '#285E61' : '#718096';
      }
      
      // Add or update circle
      if (!map.current!.getSource(`geofence-source-${id}`)) {
        map.current!.addSource(`geofence-source-${id}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            properties: {}
          }
        });
        
        map.current!.addLayer({
          id: `geofence-circle-${id}`,
          type: 'circle',
          source: `geofence-source-${id}`,
          paint: {
            'circle-radius': {
              stops: [
                [0, 0],
                [20, radius / 2]
              ],
              base: 2
            },
            'circle-color': isActive ? '#285E61' : '#718096',
            'circle-opacity': 0.2,
            'circle-stroke-width': 2,
            'circle-stroke-color': isActive ? '#285E61' : '#718096',
            'circle-stroke-opacity': 0.5
          }
        });
        
        geofenceCircles.current[id] = map.current!.getSource(`geofence-source-${id}`) as mapboxgl.GeoJSONSource;
      } else {
        // Update circle location and appearance
        geofenceCircles.current[id].setData({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          properties: {}
        });
        
        map.current!.setPaintProperty(
          `geofence-circle-${id}`,
          'circle-color',
          isActive ? '#285E61' : '#718096'
        );
        
        map.current!.setPaintProperty(
          `geofence-circle-${id}`,
          'circle-stroke-color',
          isActive ? '#285E61' : '#718096'
        );
      }
    });
  }, [geofenceAreas, mapLoaded]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customToken.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter a valid Mapbox token",
        variant: "destructive"
      });
      return;
    }
    
    // Initialize map with new token
    initializeMap();
  };

  // Render map or token input form based on state
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-background/80 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center text-destructive mb-4">
              <AlertCircle className="h-5 w-5 mr-2" />
              <h3 className="font-semibold">{mapError}</h3>
            </div>
            
            {showTokenInput && (
              <form onSubmit={handleTokenSubmit} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    To use this map, you need to provide a valid Mapbox access token.
                    Visit <a href="https://account.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a> to create an account and get your token.
                  </p>
                  <Input
                    placeholder="Enter your Mapbox token"
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Apply Token
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
      
      <div ref={mapContainer} className="absolute inset-0" style={{ minHeight: '500px' }} />
      
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
            onClick={startWatchingLocation}
          >
            <Navigation className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Map;
