
import React from 'react';
import Navbar from '@/components/Navbar';
import RouteHistory from '@/components/RouteHistory';

const History = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 container mx-auto pt-6 px-4">
        <RouteHistory />
      </div>
    </div>
  );
};

export default History;
