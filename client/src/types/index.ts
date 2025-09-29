export type UserRole = 'locatario' | 'locador';

export type User = {
  id: number;
  nome: string;
  email: string;
  senha: string;
  tipo: UserRole;
  avatar?: string;
  telefone?: string;
  cpf: string;
  predios?: Location[];
};

export type Amenity = {
  id: string;
  name: string;
  icon: string;
  description?: string;
};

export type Location = {
  id: string;
  nomePredio: string;
  endereco: string;
  cidade: string;
  estado: string;
  pontosDeDestaque: string[]; // Array of amenity IDs
  descricao?: string;
  usuario?: User;
  salas?: Workspace[];
  imagens?: string[]; // Array of image URLs
};

export type Workspace = {
  id: number;
  nomeSala: string;
  descricao: string;
  capacidade: number;
  precoHora: number;
  predioId: string;
  imagens: string[];
  destaques: string[]; // Array of amenity IDs
  disponibilidade: boolean;
  categoria: 'workstation' | 'meeting-room' | 'training-room' | 'auditorium';
};

export type Booking = {
  id: number;
  workspaceId: number;
  userId: number;
  date: string;
  schedules: string[];
  totalPrice: number;
  status: 'pendente' | 'confirmado' | 'cancelado';
};

// export type Proprietario = {
//   id: number;
//   nome: string;
//   foto?: string;
//   predios?: Location[];
// };

export type CreatePredioPayload = {
  nomePredio: string;
  endereco: string;
  pontosDeDestaque: string[];
  descricao: string;
  usuarioId: number;
}