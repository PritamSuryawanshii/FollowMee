
import React from 'react';
import Navbar from '@/components/Navbar';
import LocationShare from '@/components/LocationShare';

const Share = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 container mx-auto pt-6 px-4">
        <LocationShare />
      </div>
    </div>
  );
};

export default Share;
