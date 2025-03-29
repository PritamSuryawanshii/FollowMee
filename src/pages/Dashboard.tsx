
import React from 'react';
import Navbar from '@/components/Navbar';
import Map from '@/components/Map';
import GeofenceForm from '@/components/GeofenceForm';
import GeofenceList from '@/components/GeofenceList';

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 container mx-auto pt-6 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-card rounded-lg shadow-sm border overflow-hidden flex-grow" style={{ height: '600px' }}>
            <Map />
          </div>
        </div>
        <div className="space-y-6">
          <GeofenceForm />
          <GeofenceList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
