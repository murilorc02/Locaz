export type UserRole = "locatario" | "locador";

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

export type WorkspaceCategory = "workstation" | "meeting-room" | "training-room" | "auditorium";

export type Workspace = {
  id: number;
  nome: string;
  descricao: string;
  capacidade: number;
  categoria: WorkspaceCategory;
  precoHora: number;
  reservaGratuita: boolean;
  comodidades: string[];
  imagens?: string[];
  horariosFuncionamento: AvailableHours[];
  predio: {
    id: number;
  };
};

export type WorkspaceApiResponse = {
  data: Workspace;
};

export type WorkspacesApiResponse = {
  data: Workspace[];
};

export type Location = {
  id: number;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  descricao: string;
  salas: Workspace[];
  horariosFuncionamento: OpeningHours[];
  usuario: User;
  imagens?: string[];
  createdAt: string;
  updatedAt: string;
};

export type LocationApiResponse = {
  data: Location;
};

export type LocationsApiResponse = {
  data: Location[];
};

export type OpeningHours = {
  id: number;
  diaSemana: string;
  horarioAbertura: string;
  horarioFechamento: string;
  ativo: boolean;
  predio?: {
    id: number;
  };
};

export type AvailableHours = {
  diaSemana: string;
  horarioAbertura: string;
  horarioFechamento: string;
  ativo: boolean;
};

export type Booking = {
  id: number;
  workspaceId: number;
  userId: number;
  date: string;
  schedules: string[];
  totalPrice: number;
  status: "pendente" | "confirmado" | "cancelado";
};

// export type Proprietario = {
//   id: number;
//   nome: string;
//   foto?: string;
//   predios?: Location[];
// };

export type HorarioPayload = {
  diaSemana: string;
  horarioAbertura: string;
  horarioFechamento: string;
  ativo: boolean;
}

export type CreatePredioPayload = {
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  comodidades?: string[];
  descricao: string;
  horariosFuncionamento: HorarioPayload[];
  usuarioId: number;
};

export type CreateSalaPayload = {
  nome: string;
  descricao: string;
  capacidade: number;
  categoria: WorkspaceCategory;
  precoHora: number;
  reservaGratuita: boolean;
  horariosFuncionamento?: HorarioPayload[];
  comodidades: string[];
  imagens?: string[];
  predioId: number;
}
