import { Amenity } from '../types';

export const amenities: Amenity[] = [
  {
    id: 'wifi',
    name: 'Free Wi-Fi',
    icon: 'wifi',
    description: 'High-speed internet access available throughout the space'
  },
  {
    id: 'coffee',
    name: 'Coffee Included',
    icon: 'coffee',
    description: 'Complimentary coffee and tea for all workspace users'
  },
  {
    id: 'comfortable',
    name: 'Ergonomic Chairs',
    icon: 'chair',
    description: 'Comfortable ergonomic seating for productive work sessions'
  },
  {
    id: 'park-nearby',
    name: 'Park Nearby',
    icon: 'park',
    description: 'Located within walking distance to public parks and green spaces'
  },
  {
    id: 'shopping-nearby',
    name: 'Shopping Nearby',
    icon: 'store',
    description: 'Close to shops, restaurants, and convenience stores'
  },
  {
    id: 'city-center',
    name: 'City Center',
    icon: 'city',
    description: 'Located in or near the city center with easy access to transportation'
  },
  {
    id: 'central-location',
    name: 'Central Location',
    icon: 'map-pin',
    description: 'Strategically located for easy access from most parts of the city'
  }
];

export const getAmenity = (id: string): Amenity | undefined => {
  return amenities.find(amenity => amenity.id === id);
};
