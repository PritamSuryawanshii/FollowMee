
import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Clock, MapPin } from 'lucide-react';

const RouteHistory: React.FC = () => {
  const { locationHistory } = useApp();
  
  // Format timestamp to readable time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Group location history by date
  const groupedHistory = locationHistory.reduce((groups, location) => {
    const date = formatDate(location.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(location);
    return groups;
  }, {} as Record<string, typeof locationHistory>);
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedHistory).sort((a, b) => {
    const dateA = new Date(groupedHistory[a][0].timestamp);
    const dateB = new Date(groupedHistory[b][0].timestamp);
    return dateB.getTime() - dateA.getTime();
  });
  
  if (locationHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <History className="h-5 w-5 mr-2 text-roamly-orange" />
            Location History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No location history yet. Start tracking to see your routes!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <History className="h-5 w-5 mr-2 text-roamly-orange" />
          Location History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date} className="space-y-2">
                <h3 className="font-semibold text-sm bg-muted px-2 py-1 rounded">
                  {date}
                </h3>
                <div className="pl-4 border-l-2 border-muted space-y-4">
                  {groupedHistory[date]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((location, index) => (
                      <div key={location.timestamp} className="relative">
                        <div className="absolute w-2 h-2 bg-roamly-blue rounded-full -left-[13px] mt-2"></div>
                        <div className="flex space-x-2 items-start pl-2">
                          <div className="flex-shrink-0 pt-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {formatTime(location.timestamp)}
                            </p>
                            <div className="text-xs text-muted-foreground flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>
                                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                              </span>
                            </div>
                            {location.speed !== null && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Speed: {location.speed ? `${(location.speed * 3.6).toFixed(1)} km/h` : 'Stationary'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RouteHistory;
