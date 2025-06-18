import { Location } from '../types';

export const locations: Location[] = [
  {
    id: 'loc-001',
    name: 'The Urban Hub',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    latitude: 37.7749,
    longitude: -122.4194,
    amenities: ['wifi', 'coffee', 'city-center', 'shopping-nearby'],
    businessId: 'biz-001',
    description: 'A modern workspace in the heart of downtown, featuring panoramic city views and state-of-the-art facilities.',
    images: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ]
  },
  {
    id: 'loc-002',
    name: 'Creative Commons',
    address: '456 Market Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    latitude: 37.7812,
    longitude: -122.4121,
    amenities: ['wifi', 'coffee', 'comfortable', 'park-nearby'],
    businessId: 'biz-002',
    description: 'A collaborative workspace designed for creatives, with flexible areas and inspiring architecture.',
    images: [
      'https://images.unsplash.com/photo-1572025442646-866d16c84a54?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
      'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ]
  },
  {
    id: 'loc-003',
    name: 'Tech Loft',
    address: '789 Howard Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94107',
    latitude: 37.7830,
    longitude: -122.4011,
    amenities: ['wifi', 'coffee', 'comfortable', 'city-center', 'central-location'],
    businessId: 'biz-003',
    description: 'A high-tech workspace catering to startups and tech professionals, with networking events and mentorship opportunities.',
    images: [
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
      'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ]
  },
  {
    id: 'loc-004',
    name: 'Suburban Workspace',
    address: '101 Oak Avenue',
    city: 'Palo Alto',
    state: 'CA',
    zipCode: '94301',
    latitude: 37.4419,
    longitude: -122.1430,
    amenities: ['wifi', 'coffee', 'comfortable', 'park-nearby', 'shopping-nearby'],
    businessId: 'biz-004',
    description: 'A peaceful workspace in a suburban setting, perfect for those seeking focus away from city distractions.',
    images: [
      'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ]
  }
];

export const getLocation = (id: string): Location | undefined => {
  return locations.find(location => location.id === id);
};