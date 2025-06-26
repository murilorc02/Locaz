export type UserRole = 'client' | 'business';

export type User = {
  id: number;
  name: string;
  email: string;
  password: string; // Armazenar senhas em texto simples não é recomendado, use hash em produção
  role: UserRole;
  avatar?: string;
  telephone?: string;
  document: string; // CPF or CNPJ
};

export type Amenity = {
  id: number;
  name: string;
  icon: string;
  description?: string;
};

export type Location = {
  id: number;
  nomePredio: string;
  endereco: string;
  pontosDeDestaque: string[]; // Array of amenity IDs
  descricao?: string;
  proprietario?: Proprietario;
  salas?: Workspace[];
  images?: string[]; // Array of image URLs
};

export type Workspace = {
  id: number;
  name: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  locationId: number;
  images: string[];
  amenities: string[]; // Array of amenity IDs
  available: boolean;
};

export type Booking = {
  id: number;
  workspaceId: number;
  userId: number;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  status: 'pendente' | 'confirmado' | 'cancelado';
};

export type Proprietario = {
  id: number;
  nome: string;
  foto?: string; // ou string se for uma URL da imagem
  predios?: Location[];
};

export type CreatePredioPayload = {
  nomePredio: string;
  endereco: string;
  pontosDeDestaque: boolean;
}