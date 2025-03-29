
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Map, History, Settings, Users, Menu, LogOut, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Map', icon: Map, path: '/dashboard' },
    { name: 'History', icon: History, path: '/history' },
    { name: 'Share', icon: Users, path: '/share' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="flex items-center mr-4">
          <div className="relative z-20 flex items-center text-lg font-medium">
            <div className="hidden md:flex items-center space-x-2">
              <div className="rounded-full bg-roamly-blue p-1">
                <Navigation className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-roamly-blue">Roamly</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuLink
                    className={cn(navigationMenuTriggerStyle(), "flex items-center space-x-1")}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Logout Button (Desktop) */}
        <div className="hidden md:flex justify-end ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex flex-1 justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-roamly-blue p-1">
              <Navigation className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-roamly-blue">Roamly</span>
          </div>
          
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Roamly Navigator</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-4">
                {menuItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate(item.path);
                      setOpen(false);
                    }}
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    <span>{item.name}</span>
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Logout</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
