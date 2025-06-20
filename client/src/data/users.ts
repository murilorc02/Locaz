import { User } from '../types';

export const users: User[] = [
  {
    id: 'user-001',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'client',
    avatar: 'https://i.pravatar.cc/150?u=john@example.com'
  },
  {
    id: 'user-002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'client',
    avatar: 'https://i.pravatar.cc/150?u=jane@example.com'
  },
  {
    id: 'biz-001',
    name: 'Urban Spaces Inc.',
    email: 'contact@urbanspaces.com',
    role: 'business',
    avatar: 'https://i.pravatar.cc/150?u=contact@urbanspaces.com'
  },
  {
    id: 'biz-002',
    name: 'Creative Solutions LLC',
    email: 'info@creativesolns.com',
    role: 'business',
    avatar: 'https://i.pravatar.cc/150?u=info@creativesolns.com'
  },
  {
    id: 'biz-003',
    name: 'Tech Innovators Co.',
    email: 'hello@techinnovators.com',
    role: 'business',
    avatar: 'https://i.pravatar.cc/150?u=hello@techinnovators.com'
  },
  {
    id: 'biz-004',
    name: 'Suburban Workspaces',
    email: 'contact@suburbanworkspaces.com',
    role: 'business',
    avatar: 'https://i.pravatar.cc/150?u=contact@suburbanworkspaces.com'
  }
];
