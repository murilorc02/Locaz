import { OpeningHours } from "@/types";

export const openingHours: OpeningHours[] = [
  // Horários para o Prédio 1
  {
    id: 1,
    diaSemana: "Segunda a Sexta",
    horarioAbertura: "08:00:00",
    horarioFechamento: "20:00:00",
    ativo: true,
    predio: { id: 1 },
  },
  {
    id: 2,
    diaSemana: "Sábado",
    horarioAbertura: "09:00:00",
    horarioFechamento: "14:00:00",
    ativo: true,
    predio: { id: 1 },
  },
  // Horários para o Prédio 2
  {
    id: 3,
    diaSemana: "Segunda a Sábado",
    horarioAbertura: "09:00:00",
    horarioFechamento: "19:00:00",
    ativo: true,
    predio: { id: 2 },
  },
];