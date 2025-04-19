import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Location } from '../lib/types/location';
import { db } from '../lib/supabase/client';
import { useToast } from '../hooks/useToast';

interface LocationContextType {
  currentLocation: Location | null;
  locations: Location[];
  isLoading: boolean;
  error: string | null;
  setCurrentLocation: (location: Location) => void;
  refreshLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await db.locations.getLocations();
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data) {
        setLocations(data);
        
        // If no current location is set, use the default one
        if (!currentLocation) {
          const defaultLocation = data.find(loc => loc.is_default);
          if (defaultLocation) {
            setCurrentLocation(defaultLocation);
          } else if (data.length > 0) {
            setCurrentLocation(data[0]);
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch locations';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLocations();
  }, []);

  // Save current location to localStorage when it changes
  useEffect(() => {
    if (currentLocation) {
      localStorage.setItem('currentLocationId', currentLocation.id);
    }
  }, [currentLocation]);

  // Load current location from localStorage on initial load
  useEffect(() => {
    const savedLocationId = localStorage.getItem('currentLocationId');
    if (savedLocationId && locations.length > 0) {
      const savedLocation = locations.find(loc => loc.id === savedLocationId);
      if (savedLocation) {
        setCurrentLocation(savedLocation);
      }
    }
  }, [locations]);

  const value = {
    currentLocation,
    locations,
    isLoading,
    error,
    setCurrentLocation,
    refreshLocations: fetchLocations,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
