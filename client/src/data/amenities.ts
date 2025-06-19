import { Amenity } from '../types';

export const amenities: Amenity[] = [
  {
    id: 'wifi',
    name: 'Wi-Fi Gratuito',
    icon: 'wifi',
    description: 'Acesso a internet disponível em todo o espaço'
  },
  {
    id: 'coffee',
    name: 'Café Incluso',
    icon: 'coffee',
    description: 'Café ou chá para todos os usuários do espaço de trabalho'
  },
  {
    id: 'chair',
    name: 'Cadeiras Ergonômicas',
    icon: 'chair',
    description: 'Assentos ergonômicos e confortáveis para sessões de trabalho produtivas'
  },
  {
    id: 'park',
    name: 'Parque Próximo',
    icon: 'park',
    description: 'Local com vista ou proximidade à um ambiente florestal'
  },
  {
    id: 'shopping',
    name: 'Shopping Próximo',
    icon: 'store',
    description: 'Local vizinho ou próximo à shopping, restaurantes e lojas'
  },
  {
    id: 'city-center',
    name: 'Centro da Cidade',
    icon: 'city',
    description: 'Localizado no centro da cidade'
  },
  {
    id: 'central-location',
    name: 'Localização Central',
    icon: 'map-pin',
    description: 'Localização estratégica para fácil acesso à maioria das partes da cidade'
  },
  {
    id: 'comfort',
    name: 'Espaço de Descompressão',
    icon: 'flower2',
    description: 'Ambiente com local dedicado à descanso e descontração'
  },
  {
    id: 'air-conditioning',
    name: 'Ar Condicionado',
    icon: 'air-vent',
    description: 'Cobertura de ar condicionado para todo o espaço'
  }
];

export const getAmenity = (id: string): Amenity | undefined => {
  return amenities.find(amenity => amenity.id === id);
};
