
import { Amenity } from '../types';

// Location-specific amenities (inherited by workspaces)
export const locationAmenities: Amenity[] = [
  {
    id: 'park-nearby',
    name: 'Próximo ao Parque',
    icon: 'park',
    description: 'Localizado a poucos minutos de caminhada de parques e espaços verdes'
  },
  {
    id: 'shopping-nearby',
    name: 'Shopping Próximo',
    icon: 'store',
    description: 'Próximo a lojas, restaurantes e estabelecimentos comerciais'
  },
  {
    id: 'city-center',
    name: 'Centro da Cidade',
    icon: 'city',
    description: 'Localizado no centro da cidade com fácil acesso ao transporte'
  },
  {
    id: 'central-location',
    name: 'Localização Central',
    icon: 'map-pin',
    description: 'Posição estratégica para fácil acesso de qualquer parte da cidade'
  }
];

// Workspace-specific amenities  
export const workspaceAmenities: Amenity[] = [
  {
    id: 'wifi-gratis',
    name: 'WiFi Grátis',
    icon: 'wifi',
    description: 'Internet de alta velocidade gratuita'
  },
  {
    id: 'cafe-gratis',
    name: 'Café Grátis',
    icon: 'coffee',
    description: 'Café ou chá cortesia para todos os usuários'
  },
  {
    id: 'cadeiras-ergonomicas',
    name: 'Cadeiras Ergonômicas',
    icon: 'chair',
    description: 'Assentos confortáveis e ergonômicos para sessões produtivas'
  },
  {
    id: 'espaco-kids',
    name: 'Espaço Kids',
    icon: 'baby',
    description: 'Área dedicada para crianças com atividades e supervisão'
  },
  {
    id: 'espaco-descompressao',
    name: 'Espaço de Descompressão',
    icon: 'sofa',
    description: 'Área de relaxamento com poltronas e ambiente tranquilo'
  },
  {
    id: 'ar-condicionado',
    name: 'Ar Condicionado',
    icon: 'snowflake',
    description: 'Sistema de climatização para maior conforto'
  },
  {
    id: 'projetor',
    name: 'Projetor',
    icon: 'projector',
    description: 'Equipamento de projeção para apresentações'
  },
  {
    id: 'quadro-branco',
    name: 'Quadro Branco',
    icon: 'square',
    description: 'Quadro para anotações e diagramas'
  },
  {
    id: 'estacionamento',
    name: 'Estacionamento',
    icon: 'car',
    description: 'Vagas de estacionamento disponíveis'
  },
  {
    id: 'copa',
    name: 'Copa/Cozinha',
    icon: 'utensils',
    description: 'Área com geladeira, micro-ondas e utensílios básicos'
  }
];

// All amenities combined
export const amenities: Amenity[] = [...locationAmenities, ...workspaceAmenities];

export const getAmenity = (id: string): Amenity | undefined => {
  return amenities.find(amenity => amenity.id === id);
};
