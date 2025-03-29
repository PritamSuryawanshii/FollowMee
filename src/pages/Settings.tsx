
import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BellRing, MapPin, Bell, Shield, Key } from 'lucide-react';

const Settings = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 container mx-auto pt-6 px-4 pb-12">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Bell className="h-5 w-5 mr-2 text-roamly-orange" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how you'd like to be notified about location events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Geofence Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when entering or leaving geofence areas
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Location Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone starts or stops sharing location with you
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Battery Warnings</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when battery is low while tracking
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-roamly-orange" />
                Location Settings
              </CardTitle>
              <CardDescription>
                Configure how location tracking works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">High Accuracy Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Uses GPS, WiFi, and cellular for precise tracking (uses more battery)
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Background Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Continue tracking when app is in background
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-base">Location History</Label>
                <Button variant="outline" className="w-full">
                  Clear Location History
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2 text-roamly-orange" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control who can see your location and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Default Share Duration</Label>
                  <p className="text-sm text-muted-foreground">
                    How long to share location by default (in hours)
                  </p>
                </div>
                <Input
                  type="number"
                  defaultValue="1"
                  min="0.25"
                  max="24"
                  step="0.25"
                  className="w-24"
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Precise Location</Label>
                  <p className="text-sm text-muted-foreground">
                    When disabled, shows approximate location to others
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Key className="h-5 w-5 mr-2 text-roamly-orange" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="demouser" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="demo@example.com" />
              </div>
              
              <Button className="w-full">
                Update Account
              </Button>
              
              <Separator />
              
              <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive/10">
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
