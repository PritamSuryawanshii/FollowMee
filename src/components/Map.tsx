
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

// Temporary access token - in production, this should be in environment variables
// This is a public token so it's ok for demonstration purposes
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZWRldiIsImEiOiJjbHZpeXE0MDgwYWV5MmtvNnRtdHVhc2diIn0.OMj4t3_TN8HfYUQEkFRqGw';

const Map: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const geofenceMarkers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const geofenceCircles = useRef<{ [key: string]: mapboxgl.GeoJSONSource }>({});
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const { 
    currentLocation, 
    watchingLocation, 
    startWatchingLocation, 
    stopWatchingLocation,
    geofenceAreas
  } = useApp();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Set access token for mapbox
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
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
      setMapLoaded(true);
    });

    // Cleanup function
    return () => {
      map.current?.remove();
      map.current = null;
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

  // Ensure the map container is rendered correctly
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
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
