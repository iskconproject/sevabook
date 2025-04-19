import React from 'react';
import { useLocation } from '@/contexts/LocationContext';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin } from 'lucide-react';

export function LocationSelector() {
  const { t } = useTranslation();
  const { currentLocation, locations, setCurrentLocation, isLoading } = useLocation();

  const handleLocationChange = (locationId: string) => {
    const selectedLocation = locations.find(loc => loc.id === locationId);
    if (selectedLocation) {
      setCurrentLocation(selectedLocation);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  if (!currentLocation || locations.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>{t('locations.noLocations')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentLocation.id}
        onValueChange={handleLocationChange}
      >
        <SelectTrigger className="h-8 w-[180px] border-none bg-transparent">
          <SelectValue placeholder={t('locations.selectLocation')} />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
