
import { Location } from '../types';

export const locations: Location[] = [
  {
    id: 'loc-001',
    nomePredio: 'The Urban Hub',
    endereco: '123 Main Street - 94105',
    cidade: 'San Francisco',
    estado: 'CA',
    pontosDeDestaque: ['wifi', 'coffee', 'city-center', 'shopping-nearby'],
    descricao: 'A modern workspace in the heart of downtown, featuring panoramic city views and state-of-the-art facilities.',
    imagens: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ]
  },
  {
    id: 'loc-002',
    nomePredio: 'Creative Commons',
    endereco: '456 Market Street - 94103',
    cidade: 'San Francisco',
    estado: 'CA',
    pontosDeDestaque: ['wifi', 'coffee', 'comfortable', 'park-nearby'],
    descricao: 'A collaborative workspace designed for creatives, with flexible areas and inspiring architecture.',
    imagens: [
      'https://images.unsplash.com/photo-1572025442646-866d16c84a54?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
      'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ]
  },
  {
    id: 'loc-003',
    nomePredio: 'Tech Loft',
    endereco: '789 Howard Street - 94107',
    cidade: 'San Francisco',
    estado: 'CA',
    pontosDeDestaque: ['wifi', 'coffee', 'comfortable', 'city-center', 'central-location'],
    descricao: 'A high-tech workspace catering to startups and tech professionals, with networking events and mentorship opportunities.',
    imagens: [
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
      'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ]
  },
  {
    id: 'loc-004',
    nomePredio: 'Suburban Workspace - 94301',
    endereco: '101 Oak Avenue',
    cidade: 'Palo Alto',
    estado: 'CA',
    pontosDeDestaque: ['wifi', 'coffee', 'comfortable', 'park-nearby', 'shopping-nearby'],
    descricao: 'A peaceful workspace in a suburban setting, perfect for those seeking focus away from city distractions.',
    imagens: [
      'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ]
  }
];

export const getLocation = (id: string): Location | undefined => {
  return locations.find(location => location.id === id);
};
