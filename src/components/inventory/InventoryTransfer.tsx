import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from '@/contexts/LocationContext';
import { db } from '@/lib/supabase/client';
import { useToast } from '@/hooks/useToast';
import { InventoryItem } from '@/lib/types/inventory';
import { Location } from '@/lib/types/location';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft } from 'lucide-react';

interface InventoryTransferProps {
  onTransferComplete?: () => void;
}

export function InventoryTransfer({ onTransferComplete }: InventoryTransferProps) {
  const { t } = useTranslation();
  const { locations, currentLocation } = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [targetLocation, setTargetLocation] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch inventory for current location
  useEffect(() => {
    const fetchInventory = async () => {
      if (currentLocation) {
        const { data } = await db.inventory.getItems(currentLocation.id);
        if (data) {
          setInventory(data);
        }
      }
    };

    fetchInventory();
  }, [currentLocation]);

  const handleTransfer = async () => {
    if (!selectedItem || !targetLocation || !quantity || !currentLocation) {
      toast({
        title: t('common.error'),
        description: t('inventory.transferMissingFields'),
        variant: 'destructive',
      });
      return;
    }

    const quantityNum = parseInt(quantity, 10);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast({
        title: t('common.error'),
        description: t('inventory.invalidQuantity'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error, success } = await db.inventory.transferItems(
        selectedItem,
        currentLocation.id,
        targetLocation,
        quantityNum
      );

      if (error) {
        throw new Error(error.message);
      }

      if (success) {
        toast({
          title: t('inventory.transferSuccess'),
          description: t('inventory.itemsTransferred'),
        });

        setIsDialogOpen(false);
        setSelectedItem('');
        setTargetLocation('');
        setQuantity('1');

        if (onTransferComplete) {
          onTransferComplete();
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transfer items';
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out current location from target locations
  const targetLocations = locations.filter(
    loc => loc.id !== currentLocation?.id && loc.is_active
  );

  // Get max quantity for selected item
  const getMaxQuantity = (): number => {
    if (!selectedItem) return 0;
    const item = inventory.find(item => item.id === selectedItem);
    return item ? item.stock : 0;
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        disabled={!currentLocation || targetLocations.length === 0}
      >
        <ArrowRightLeft className="mr-2 h-4 w-4" />
        {t('inventory.transferItems')}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('inventory.transferItems')}</DialogTitle>
            <DialogDescription>
              {t('inventory.transferDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="source-location">{t('inventory.sourceLocation')}</Label>
              <Input
                id="source-location"
                value={currentLocation?.name || ''}
                disabled
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="item">{t('inventory.selectItem')}</Label>
              <Select
                value={selectedItem}
                onValueChange={setSelectedItem}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('inventory.selectItemPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {inventory
                    .filter(item => item.stock > 0)
                    .map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.language}) - {t('inventory.inStock', { count: item.stock })}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">{t('inventory.quantity')}</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={getMaxQuantity()}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              {selectedItem && (
                <p className="text-xs text-muted-foreground">
                  {t('inventory.maxQuantity', { max: getMaxQuantity() })}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="target-location">{t('inventory.targetLocation')}</Label>
              <Select
                value={targetLocation}
                onValueChange={setTargetLocation}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('inventory.selectTargetLocation')} />
                </SelectTrigger>
                <SelectContent>
                  {targetLocations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!selectedItem || !targetLocation || !quantity || isLoading}
            >
              {isLoading ? t('common.loading') : t('inventory.transfer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
