export type UserRole = 'client' | 'business';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string; // Armazenar senhas em texto simples não é recomendado, use hash em produção
  role: UserRole;
  avatar?: string;
  telephone?: string;
  document: string; // CPF or CNPJ
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
  status: 'pendente' | 'confirmado' | 'cancelado';
};