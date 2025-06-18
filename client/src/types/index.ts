export type UserRole = 'client' | 'business';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
};

export type Amenity = {
  id: string;
  name: string;
  icon: string;
  description?: string;
};

export type Location = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  amenities: string[]; // Array of amenity IDs
  businessId: string;
  description: string;
  images: string[];
};

export type Workspace = {
  id: string;
  name: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  locationId: string;
  images: string[];
  amenities: string[]; // Array of amenity IDs
  available: boolean;
};

export type Booking = {
  id: string;
  workspaceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
};