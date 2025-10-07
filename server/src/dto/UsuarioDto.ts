import { TipoUsuario } from "../entity/Usuario";

export interface UsuarioResponseDto {
  id: number;
  nome: string;
  email: string;
  cpfcnpj: string;
  tipo: TipoUsuario; 
  telefone: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUsuarioDto {
  nome: string;
  email: string;
  senha: string;
  cpfcnpj: string;
  telefone: string;
  tipo: TipoUsuario; 
}