import { Location } from "../types";
import { openingHours } from "./mockOpeningHours";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const locations: Location[] = [
  {
    id: 1,
    nome: "The Urban Hub",
    endereco: "123 Main Street",
    cidade: "San Francisco",
    estado: "CA",
    cep: "94105-000",
    descricao:
      "A modern workspace in the heart of downtown, featuring panoramic city views and state-of-the-art facilities.",
    salas: workspaces.filter((w) => w.predioId === 1),
    imagens: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop",
    ],
    // Corrigido: `horarioPredio` agora usa o mock de OpeningHours
    horarioPredio: openingHours.filter((h) => h.predio.id === 1),
    // Corrigido: `usuario` agora usa o mock de User
    usuario: users.find((u) => u.id === 101)!,
    createdAt: "2023-10-26T10:00:00Z",
    updatedAt: "2023-10-26T10:00:00Z",
  },
  {
    id: 2,
    nome: "Creative Commons",
    endereco: "456 Market Street",
    cidade: "San Francisco",
    estado: "CA",
    cep: "94103-000",
    descricao:
      "A collaborative workspace designed for creatives, with flexible areas and inspiring architecture.",
    salas: workspaces.filter((w) => w.predioId === 2),
    imagens: [
      "https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop",
    ],
    horarioPredio: openingHours.filter((h) => h.predio.id === 2),
    usuario: users.find((u) => u.id === 102)!,
    createdAt: "2023-09-15T11:00:00Z",
    updatedAt: "2023-10-20T15:30:00Z",
  },
];

export const getLocation = (id: number): Location | undefined => {
  return locations.find((location) => location.id === id);
};
