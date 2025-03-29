
import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { MapPin, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const GeofenceList: React.FC = () => {
  const { geofenceAreas, toggleGeofenceArea, removeGeofenceArea } = useApp();
  
  if (geofenceAreas.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-roamly-orange" />
            Your Geofence Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No geofence areas added yet. Add your first one above!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-roamly-orange" />
          Your Geofence Areas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-4">
            {geofenceAreas.map((area) => (
              <div 
                key={area.id} 
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex-1 mr-4">
                  <h3 className="font-medium">{area.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Radius: {area.radius}m
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={area.isActive}
                      onCheckedChange={() => toggleGeofenceArea(area.id)}
                      aria-label={`Toggle ${area.name} geofence`}
                    />
                    <span className="text-sm">{area.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGeofenceArea(area.id)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default GeofenceList;
