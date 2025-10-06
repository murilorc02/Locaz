import { Workspace } from "../types";

export const workspaces: Workspace[] = [
  {
    id: 1,
    nome: "Executive Suite",
    descricao:
      "Premium private office with high-end furnishings and city views",
    capacidade: 4,
    precoHora: 50,
    predioId: 1,
    imagens: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    ],
    comodidades: [
      "wifi-gratis",
      "cafe-gratis",
      "cadeiras-ergonomicas",
      "projetor",
      "espaco-descompressao",
      "espaco-kids",
    ],
    reservaGratuita: false,
    categoria: "meeting-room",
  },
  {
    id: 2,
    nome: "Open Desk",
    descricao: "Hot desk in our open plan area with natural lighting",
    capacidade: 1,
    precoHora: 15,
    predioId: 1,
    imagens: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    ],
    comodidades: ["wifi-gratis", "cafe-gratis"],
    reservaGratuita: false,
    categoria: "workstation",
  },
  {
    id: 3,
    nome: "Meeting Room A",
    descricao: "Professional meeting room with video conferencing capabilities",
    capacidade: 8,
    precoHora: 60,
    predioId: 1,
    imagens: [
      "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    ],
    comodidades: ["wifi-gratis", "cadeiras-ergonomicas"],
    reservaGratuita: false,
    categoria: "meeting-room",
  },
  {
    id: 4,
    nome: "Creative Studio",
    descricao: "Bright and open studio space perfect for creative teams",
    capacidade: 6,
    precoHora: 40,
    predioId: 1,
    imagens: [
      "https://images.unsplash.com/photo-1572025442646-866d16c84a54?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    ],
    comodidades: ["wifi-gratis", "cafe-gratis", "cadeiras-ergonomicas"],
    reservaGratuita: false,
    categoria: "training-room",
  },
  {
    id: 5,
    nome: "Tech Pod",
    descricao: "Private pod equipped with dual monitors and ergonomic setup",
    capacidade: 2,
    precoHora: 30,
    predioId: 1,
    imagens: [
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    ],
    comodidades: ["wifi-gratis", "cafe-gratis", "cadeiras-ergonomicas"],
    reservaGratuita: false,
    categoria: "workstation",
  },
  {
    id: 6,
    nome: "Quiet Zone Desk",
    descricao: "Individual desk in our dedicated silent area",
    capacidade: 1,
    precoHora: 20,
    predioId: 1,
    imagens: [
      "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    ],
    comodidades: ["wifi-gratis", "cadeiras-ergonomicas"],
    reservaGratuita: false,
    categoria: "workstation",
  },
  {
    id: 7,
    nome: "Garden View Office",
    descricao: "Private office with views of our landscaped garden",
    capacidade: 3,
    precoHora: 35,
    predioId: 1,
    imagens: [
      "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    ],
    comodidades: ["wifi-gratis", "cafe-gratis", "cadeiras-ergonomicas"],
    reservaGratuita: false,
    categoria: "meeting-room",
  },
  {
    id: 8,
    nome: "Team Space",
    descricao: "Large open area ideal for team collaboration",
    capacidade: 12,
    precoHora: 80,
    predioId: 1,
    imagens: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    ],
    comodidades: ["wifi-gratis", "cafe-gratis", "cadeiras-ergonomicas"],
    reservaGratuita: false,
    categoria: "training-room",
  },
];

export const getWorkspace = (id: number): Workspace | undefined => {
  return workspaces.find((workspace) => workspace.id === id);
};

export const getWorkspacesByLocation = (predioId: number): Workspace[] => {
  return workspaces.filter((workspace) => workspace.predioId === predioId);
};
