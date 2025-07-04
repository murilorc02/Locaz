import { Workspace } from '../types';

export const workspaces: Workspace[] = [
  {
    id: 1,
    name: 'Executive Suite',
    description: 'Premium private office with high-end furnishings and city views',
    capacity: 4,
    pricePerHour: 50,
    locationId: 1,
    images: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ],
    amenities: ['wifi', 'coffee', 'comfortable'],
    available: true
  }
];

export const getWorkspace = (id: number): Workspace | undefined => {
  return workspaces.find(workspace => workspace.id === id);
};

export const getWorkspacesByLocation = (locationId: number): Workspace[] => {
  return workspaces.filter(workspace => workspace.locationId === locationId);
};