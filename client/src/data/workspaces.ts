import { Workspace } from '../types';

export const workspaces: Workspace[] = [
  {
    id: 'ws-001',
    name: 'Executive Suite',
    description: 'Premium private office with high-end furnishings and city views',
    capacity: 4,
    pricePerHour: 50,
    locationId: 'loc-001',
    images: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ],
    amenities: ['wifi', 'coffee', 'comfortable'],
    available: true
  },
  {
    id: 'ws-002',
    name: 'Open Desk',
    description: 'Hot desk in our open plan area with natural lighting',
    capacity: 1,
    pricePerHour: 15,
    locationId: 'loc-001',
    images: [
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ],
    amenities: ['wifi', 'coffee'],
    available: true
  },
  {
    id: 'ws-003',
    name: 'Meeting Room A',
    description: 'Professional meeting room with video conferencing capabilities',
    capacity: 8,
    pricePerHour: 60,
    locationId: 'loc-001',
    images: [
      'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ],
    amenities: ['wifi', 'comfortable'],
    available: true
  },
  {
    id: 'ws-004',
    name: 'Creative Studio',
    description: 'Bright and open studio space perfect for creative teams',
    capacity: 6,
    pricePerHour: 40,
    locationId: 'loc-002',
    images: [
      'https://images.unsplash.com/photo-1572025442646-866d16c84a54?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ],
    amenities: ['wifi', 'coffee', 'comfortable'],
    available: true
  },
  {
    id: 'ws-005',
    name: 'Tech Pod',
    description: 'Private pod equipped with dual monitors and ergonomic setup',
    capacity: 2,
    pricePerHour: 30,
    locationId: 'loc-003',
    images: [
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ],
    amenities: ['wifi', 'coffee', 'comfortable'],
    available: true
  },
  {
    id: 'ws-006',
    name: 'Quiet Zone Desk',
    description: 'Individual desk in our dedicated silent area',
    capacity: 1,
    pricePerHour: 20,
    locationId: 'loc-003',
    images: [
      'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ],
    amenities: ['wifi', 'comfortable'],
    available: true
  },
  {
    id: 'ws-007',
    name: 'Garden View Office',
    description: 'Private office with views of our landscaped garden',
    capacity: 3,
    pricePerHour: 35,
    locationId: 'loc-004',
    images: [
      'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ],
    amenities: ['wifi', 'coffee', 'comfortable'],
    available: true
  },
  {
    id: 'ws-008',
    name: 'Team Space',
    description: 'Large open area ideal for team collaboration',
    capacity: 12,
    pricePerHour: 80,
    locationId: 'loc-004',
    images: [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ],
    amenities: ['wifi', 'coffee', 'comfortable'],
    available: true
  }
];

export const getWorkspace = (id: string): Workspace | undefined => {
  return workspaces.find(workspace => workspace.id === id);
};

export const getWorkspacesByLocation = (locationId: string): Workspace[] => {
  return workspaces.filter(workspace => workspace.locationId === locationId);
};