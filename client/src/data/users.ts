import { User } from "@/types";

export const users: User[] = [
  {
    id: 101,
    nome: "Ana Pereira (Locadora)",
    email: "ana.locadora@email.com",
    senha: "senha_super_segura",
    tipo: "locador",
    cpf: "111.222.333-44",
    avatar: "https://i.pravatar.cc/150?u=ana",
  },
  {
    id: 102,
    nome: "Carlos Souza (Locador)",
    email: "carlos.locador@email.com",
    senha: "outra_senha_forte",
    tipo: "locador",
    cpf: "555.666.777-88",
    avatar: "https://i.pravatar.cc/150?u=carlos",
  },
];
