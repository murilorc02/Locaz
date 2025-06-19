import { createContext, useContext, useState, ReactNode } from 'react';
import { Location, User } from '../types';
import { locations as initialLocations } from '../data/locations';

// Define o tipo para o valor do contexto
interface LocationsContextType {
  locations: Location[];
  addLocation: (location: Omit<Location, 'id' | 'businessId'>, user: User) => void;
}

// Cria o contexto
const LocationsContext = createContext<LocationsContextType | undefined>(undefined);

// Define o provedor do contexto
export const LocationsProvider = ({ children }: { children: ReactNode }) => {

  const [locations, setLocations] = useState<Location[]>(initialLocations);
  
  const addLocation = (newLocationData: Omit<Location, 'id' | 'businessId'>, user: User) => {
    const newLocation: Location = {
      ...newLocationData,
      id: `loc-${Date.now()}`, // Gera um ID único simples
      businessId: user.id, // Associa ao usuário/empresa logada
    };
    
    setLocations(prevLocations => [...prevLocations, newLocation]);
  };

  return (
    <LocationsContext.Provider value={{ locations, addLocation }}>
      {children}
    </LocationsContext.Provider>
  );
};

// Hook customizado para usar o contexto facilmente
export const useLocations = () => {
  const context = useContext(LocationsContext);
  if (context === undefined) {
    throw new Error('useLocations must be used within a LocationsProvider');
  }
  return context;
};