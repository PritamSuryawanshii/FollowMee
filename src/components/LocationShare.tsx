
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Share2, Users, Trash2, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const LocationShare: React.FC = () => {
  const { currentLocation, sharedLocations, shareLocation, removeSharedLocation } = useApp();
  const [email, setEmail] = useState('');
  const [duration, setDuration] = useState(60); // 60 minutes by default
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentLocation) {
      alert('Current location is not available. Please enable location tracking.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    shareLocation(email, duration);
    
    // Reset form
    setEmail('');
    setDuration(60);
  };
  
  const formatExpirationTime = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff <= 0) {
      return 'Expired';
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m remaining`;
    }
    
    return `${minutes}m remaining`;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Share2 className="h-5 w-5 mr-2 text-roamly-orange" />
            Share Your Location
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient-email">Recipient Email</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="share-duration">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Share Duration
                  </div>
                </Label>
                <span className="text-sm text-muted-foreground">
                  {duration >= 60 
                    ? `${Math.floor(duration / 60)}h ${duration % 60}m` 
                    : `${duration}m`}
                </span>
              </div>
              <Slider
                id="share-duration"
                min={15}
                max={1440} // 24 hours
                step={15}
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>15m</span>
                <span>24h</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {currentLocation ? (
                <p>You are sharing your real-time location</p>
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
              Share Location
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {sharedLocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-roamly-orange" />
              Active Shares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-4">
                {sharedLocations.map((share) => (
                  <div 
                    key={share.id} 
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex-1 mr-4">
                      <h3 className="font-medium">{share.recipientEmail}</h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatExpirationTime(share.expiresAt)}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSharedLocation(share.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationShare;
