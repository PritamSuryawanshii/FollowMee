
export type User = {
  id: string;
  username: string;
  email: string;
} | null;

export type Location = {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  speed?: number | null;
};

export type GeofenceArea = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  isActive: boolean;
};

export type SharedLocation = {
  id: string;
  recipientEmail: string;
  expiresAt: number; // timestamp
};
