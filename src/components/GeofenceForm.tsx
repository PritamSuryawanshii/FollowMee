
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { MapPin } from 'lucide-react';

const GeofenceForm: React.FC = () => {
  const { currentLocation, addGeofenceArea } = useApp();
  const [name, setName] = useState('');
  const [radius, setRadius] = useState(100); // Default radius 100m
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentLocation) {
      alert('Current location is not available. Please enable location tracking.');
      return;
    }
    
    if (!name.trim()) {
      alert('Please enter a name for this geofence');
      return;
    }
    
    addGeofenceArea({
      name: name.trim(),
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      radius,
      isActive: true
    });
    
    // Reset form
    setName('');
    setRadius(100);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-roamly-orange" />
          Add Geofence
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="geofence-name">Location Name</Label>
            <Input
              id="geofence-name"
              placeholder="Home, Work, School, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="radius">Radius (meters)</Label>
              <span className="text-sm text-muted-foreground">{radius}m</span>
            </div>
            <Slider
              id="radius"
              min={50}
              max={1000}
              step={10}
              value={[radius]}
              onValueChange={(value) => setRadius(value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50m</span>
              <span>1000m</span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {currentLocation ? (
              <p>Using your current location as the center point</p>
            ) : (
              <p className="text-destructive">Please enable location tracking</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit"
            className="w-full bg-roamly-teal hover:bg-roamly-teal-light"
            disabled={!currentLocation}
          >
            Add Geofence Area
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default GeofenceForm;
