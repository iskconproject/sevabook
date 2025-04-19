import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from '@/contexts/LocationContext';
import { db } from '@/lib/supabase/client';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Location } from '@/lib/types/location';
import { MapPin, Edit, Trash2, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function LocationsPage() {
  const { t } = useTranslation();
  const { locations, refreshLocations, currentLocation, setCurrentLocation } = useLocation();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    is_active: true,
    is_default: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      is_active: true,
      is_default: false,
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (location: Location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      description: location.description || '',
      address: location.address || '',
      is_active: location.is_active,
      is_default: location.is_default,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (location: Location) => {
    setSelectedLocation(location);
    setIsDeleteDialogOpen(true);
  };

  const handleAddLocation = async () => {
    try {
      const { error } = await db.locations.addLocation(formData);

      if (error) {
        throw new Error(error.message);
      }

      await refreshLocations();
      setIsAddDialogOpen(false);
      resetForm();

      toast({
        title: t('locations.addSuccess'),
        description: t('locations.locationAdded'),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add location';
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleEditLocation = async () => {
    if (!selectedLocation) return;

    try {
      // If setting this location as default, unset default for all other locations
      if (formData.is_default && !selectedLocation.is_default) {
        const defaultLocation = locations.find(loc => loc.is_default);
        if (defaultLocation) {
          await db.locations.updateLocation(defaultLocation.id, { is_default: false });
        }
      }

      const { error } = await db.locations.updateLocation(selectedLocation.id, formData);

      if (error) {
        throw new Error(error.message);
      }

      await refreshLocations();
      setIsEditDialogOpen(false);

      // If we edited the current location, update it
      if (currentLocation && currentLocation.id === selectedLocation.id) {
        const updatedLocation = {
          ...currentLocation,
          ...formData,
        };
        setCurrentLocation(updatedLocation as Location);
      }

      toast({
        title: t('locations.editSuccess'),
        description: t('locations.locationUpdated'),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update location';
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return;

    try {
      // Check if this is the default location
      if (selectedLocation.is_default) {
        toast({
          title: t('common.error'),
          description: t('locations.cannotDeleteDefault'),
          variant: 'destructive',
        });
        setIsDeleteDialogOpen(false);
        return;
      }

      // Check if this is the current location
      if (currentLocation && currentLocation.id === selectedLocation.id) {
        // Switch to default location
        const defaultLocation = locations.find(loc => loc.is_default);
        if (defaultLocation) {
          setCurrentLocation(defaultLocation);
        } else if (locations.length > 1) {
          // Find another location that's not the one being deleted
          const anotherLocation = locations.find(loc => loc.id !== selectedLocation.id);
          if (anotherLocation) {
            setCurrentLocation(anotherLocation);
          }
        }
      }

      const { error } = await db.locations.deleteLocation(selectedLocation.id);

      if (error) {
        throw new Error(error.message);
      }

      await refreshLocations();
      setIsDeleteDialogOpen(false);

      toast({
        title: t('locations.deleteSuccess'),
        description: t('locations.locationDeleted'),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete location';
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('locations.title')}</h1>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t('locations.addLocation')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Card key={location.id} className={`${location.is_default ? 'border-primary' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    {location.name}
                    {location.is_default && (
                      <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        {t('locations.default')}
                      </span>
                    )}
                  </CardTitle>
                  {!location.is_active && (
                    <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full">
                      {t('locations.inactive')}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(location)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(location)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {location.description && (
                <CardDescription className="mb-2">{location.description}</CardDescription>
              )}
              {location.address && (
                <p className="text-sm text-muted-foreground">{location.address}</p>
              )}
            </CardContent>
            <CardFooter>
              {currentLocation?.id === location.id ? (
                <span className="text-sm text-primary">{t('locations.currentlySelected')}</span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentLocation(location)}
                >
                  {t('locations.switchTo')}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add Location Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('locations.addLocation')}</DialogTitle>
            <DialogDescription>
              {t('locations.addLocationDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('locations.name')}</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('locations.namePlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t('locations.description')}</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('locations.descriptionPlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">{t('locations.address')}</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder={t('locations.addressPlaceholder')}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
              />
              <Label htmlFor="is_active">{t('locations.active')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) => handleSwitchChange('is_default', checked)}
              />
              <Label htmlFor="is_default">{t('locations.setAsDefault')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddLocation}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('locations.editLocation')}</DialogTitle>
            <DialogDescription>
              {t('locations.editLocationDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{t('locations.name')}</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('locations.namePlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">{t('locations.description')}</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('locations.descriptionPlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">{t('locations.address')}</Label>
              <Input
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder={t('locations.addressPlaceholder')}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
              />
              <Label htmlFor="edit-is_active">{t('locations.active')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) => handleSwitchChange('is_default', checked)}
              />
              <Label htmlFor="edit-is_default">{t('locations.setAsDefault')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleEditLocation}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('locations.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('locations.deleteConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLocation} className="bg-destructive text-destructive-foreground">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
