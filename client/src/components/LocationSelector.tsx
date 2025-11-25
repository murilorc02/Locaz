import { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from './ui/skeleton'; // Usado para feedback de loading
import { Label } from './ui/label';

// --- Tipos para a API do IBGE ---
interface IBGEUF {
  id: number;
  sigla: string;
  nome: string;
}

interface IBGECidade {
  id: number;
  nome: string;
}

// --- Props do nosso componente ---
interface LocationSelectorProps {
  // Callback para enviar os valores para o componente pai
  onLocationChange: (location: { state: string; city: string }) => void;
  // Valores iniciais (úteis para formulários de edição)
  initialState?: string;
  initialCity?: string;
  showLabels?: boolean;
  height?: string;
}

const LocationSelector = ({ onLocationChange, initialState = '', initialCity = '', showLabels = false, height = '' }: LocationSelectorProps) => {
  const [states, setStates] = useState<IBGEUF[]>([]);
  const [cities, setCities] = useState<IBGECidade[]>([]);
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // 1. Buscar Estados (UFs) do IBGE na montagem do componente
  useEffect(() => {
    setIsLoadingStates(true);
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then((data: IBGEUF[]) => {
        setStates(data);
      })
      .catch(err => console.error("Erro ao buscar estados:", err))
      .finally(() => setIsLoadingStates(false));
  }, []);

  // 2. Buscar Cidades sempre que o 'selectedState' mudar
  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      setSelectedCity('');
      return;
    }

    setIsLoadingCities(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`)
      .then(res => res.json())
      .then((data: IBGECidade[]) => {
        setCities(data);
      })
      .catch(err => console.error("Erro ao buscar cidades:", err))
      .finally(() => setIsLoadingCities(false));
  }, [selectedState]);

  // 3. Propagar mudanças para o componente pai
  // Usamos useCallback para garantir que a função de prop onLocationChange não cause re-renders desnecessários
  const handleLocationChange = useCallback(() => {
    onLocationChange({ state: selectedState, city: selectedCity });
  }, [selectedState, selectedCity, onLocationChange]);

  // Dispara a propagação sempre que os valores selecionados mudarem
  useEffect(() => {
    handleLocationChange();
  }, [handleLocationChange]);

  useEffect(() => {
    if (initialState && initialState !== selectedState) {
      setSelectedState(initialState);
    }
    if (initialCity && initialCity !== selectedCity) {
      setSelectedCity(initialCity);
    }
  }, [initialCity, initialState, selectedState, selectedCity]);

  // --- Handlers para os Selects ---

  const handleStateChange = (ufSigla: string) => {
    setSelectedState(ufSigla);
    // Limpa a cidade selecionada ao trocar de estado
    setSelectedCity('');
  };

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
  };

  return (
    <div className="flex flex-col sm:flex-row w-full gap-2">
      {/* --- Seletor de Estado --- */}
      <div className="flex-1">
        {isLoadingStates ? (
          <Skeleton className={`${height ? height : 'h-12'} w-full`} />
        ) : (
          <div className='space-y-2'>
            {showLabels &&
              <Label htmlFor='state-select'> Estado </Label>
            }
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger id='state-select' className={`${height ? height : 'h-12'} w-full`}>
                <SelectValue placeholder="Estado (UF)" />
              </SelectTrigger>
              <SelectContent>
                {states.map((uf) => (
                  <SelectItem key={uf.id} value={uf.sigla}>
                    {uf.sigla} - {uf.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* --- Seletor de Cidade --- */}
      <div className="flex-1">
        {isLoadingCities ? (
          <Skeleton className={`${height ? height : 'h-12'} w-full`} />
        ) : (
          <div className='space-y-2'>
            {showLabels &&
              <Label htmlFor='state-select'> Cidade </Label>
            }
            <Select value={selectedCity} onValueChange={handleCityChange} disabled={!selectedState || cities.length === 0}>
              <SelectTrigger id='city-select' className={`${height ? height : 'h-12'} w-full`}>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.nome}>
                    {city.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;