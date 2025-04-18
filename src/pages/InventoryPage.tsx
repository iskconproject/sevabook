import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, SearchIcon, EditIcon, TrashIcon, FilterIcon, XIcon, Loader2Icon } from 'lucide-react';
import { InventoryForm } from '@/components/inventory/InventoryForm';
import { useInventory } from '@/hooks/useInventory';
import { InventoryItem } from '@/lib/types/inventory';



export function InventoryPage() {
  const { t } = useTranslation();
  const { inventory, loading, error, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    languages: [] as string[],
    stockLevel: 'all' as 'all' | 'low' | 'out'
  });

  // Filter inventory based on search query and filters
  const filteredInventory = inventory.filter(item => {
    // Search query filter
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.language && item.language.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter
    const matchesCategory = filters.categories.length === 0 ||
      filters.categories.includes(item.category);

    // Language filter
    const matchesLanguage = filters.languages.length === 0 ||
      (item.language && filters.languages.includes(item.language));

    // Stock level filter
    const matchesStockLevel =
      filters.stockLevel === 'all' ||
      (filters.stockLevel === 'low' && item.stock > 0 && item.stock < 10) ||
      (filters.stockLevel === 'out' && item.stock === 0);

    return matchesSearch && matchesCategory && matchesLanguage && matchesStockLevel;
  });

  const handleAddItem = async (values: any) => {
    // Convert form values to inventory item format
    const newItem = {
      name: values.name,
      category: values.category,
      language: values.language || 'none',
      price: parseFloat(values.price),
      stock: parseInt(values.stock),
      description: values.description || ''
    };

    const result = await addInventoryItem(newItem);

    if (result.success) {
      toast.success(t('inventory.itemAdded'), {
        description: values.name,
      });
      setIsAddDialogOpen(false);
    } else {
      toast.error(t('errors.addItemFailed'), {
        description: result.error,
      });
    }
  };

  const handleEditItem = async (values: any) => {
    if (!editingItem) return;

    // Convert form values to inventory item format
    const updates = {
      name: values.name,
      category: values.category,
      language: values.language || 'none',
      price: parseFloat(values.price),
      stock: parseInt(values.stock),
      description: values.description || ''
    };

    const result = await updateInventoryItem(editingItem.id, updates);

    if (result.success) {
      toast.success(t('inventory.itemUpdated'), {
        description: values.name,
      });
      setEditingItem(null);
    } else {
      toast.error(t('errors.updateItemFailed'), {
        description: result.error,
      });
    }
  };

  const openDeleteDialog = (itemId: string) => {
    setDeletingItemId(itemId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteItem = async () => {
    if (deletingItemId) {
      const itemName = inventory.find(item => item.id === deletingItemId)?.name;

      const result = await deleteInventoryItem(deletingItemId);

      if (result.success) {
        toast.success(t('inventory.itemDeleted'), {
          description: itemName,
        });
      } else {
        toast.error(t('errors.deleteItemFailed'), {
          description: result.error,
        });
      }

      setIsDeleteDialogOpen(false);
      setDeletingItemId(null);
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
  };

  const handleCategoryFilterChange = (category: string) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories };
    });
  };

  const handleLanguageFilterChange = (language: string) => {
    setFilters(prev => {
      const newLanguages = prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language];
      return { ...prev, languages: newLanguages };
    });
  };

  const handleStockLevelFilterChange = (level: 'all' | 'low' | 'out') => {
    setFilters(prev => ({ ...prev, stockLevel: level }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      languages: [],
      stockLevel: 'all'
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.categories.length > 0 ||
    filters.languages.length > 0 ||
    filters.stockLevel !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('inventory.title')}</h1>
          <p className="text-muted-foreground">
            {t('inventory.title')} - {loading ? '...' : filteredInventory.length} {t('dashboard.totalItems')}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              {t('inventory.addItem')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t('inventory.addItem')}</DialogTitle>
              <DialogDescription>
                {t('inventory.addItemDescription')}
              </DialogDescription>
            </DialogHeader>
            <InventoryForm
              onSubmit={handleAddItem}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('inventory.editItem')}</DialogTitle>
            <DialogDescription>
              {t('inventory.editItemDescription')}
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <InventoryForm
              initialData={{
                id: editingItem.id,
                name: editingItem.name,
                category: editingItem.category,
                language: editingItem.language,
                price: editingItem.price.toString(),
                stock: editingItem.stock,
                description: editingItem.description
              }}
              onSubmit={handleEditItem}
              onCancel={() => setEditingItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>{t('inventory.title')}</CardTitle>
          <CardDescription>
            {t('inventory.title')} - {t('app.name')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  {t('common.filter')}
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{t('common.filter')}</h4>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-muted-foreground">
                        {t('common.clear')}
                      </Button>
                    )}
                  </div>

                  {/* Category filters */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">{t('inventory.category')}</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {['books', 'incense', 'deities', 'puja', 'clothing', 'media', 'other'].map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={filters.categories.includes(category)}
                            onCheckedChange={() => handleCategoryFilterChange(category)}
                          />
                          <Label htmlFor={`category-${category}`} className="text-sm">
                            {t(`inventory.categories.${category}`)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Language filters */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">{t('inventory.language')}</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {['english', 'bengali', 'hindi', 'sanskrit', 'other', 'none'].map(language => (
                        <div key={language} className="flex items-center space-x-2">
                          <Checkbox
                            id={`language-${language}`}
                            checked={filters.languages.includes(language)}
                            onCheckedChange={() => handleLanguageFilterChange(language)}
                          />
                          <Label htmlFor={`language-${language}`} className="text-sm">
                            {language === 'none' ? t('common.none') : t(`inventory.languages.${language}`)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stock level filters */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">{t('inventory.stock')}</h5>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="stock-all"
                          checked={filters.stockLevel === 'all'}
                          onCheckedChange={() => handleStockLevelFilterChange('all')}
                        />
                        <Label htmlFor="stock-all" className="text-sm">{t('common.all')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="stock-low"
                          checked={filters.stockLevel === 'low'}
                          onCheckedChange={() => handleStockLevelFilterChange('low')}
                        />
                        <Label htmlFor="stock-low" className="text-sm">{t('inventory.lowStockAlert')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="stock-out"
                          checked={filters.stockLevel === 'out'}
                          onCheckedChange={() => handleStockLevelFilterChange('out')}
                        />
                        <Label htmlFor="stock-out" className="text-sm">{t('inventory.outOfStock')}</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.categories.map(category => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {t(`inventory.categories.${category}`)}
                  <XIcon
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleCategoryFilterChange(category)}
                  />
                </Badge>
              ))}
              {filters.languages.map(language => (
                <Badge key={language} variant="secondary" className="flex items-center gap-1">
                  {language === 'none' ? t('common.none') : t(`inventory.languages.${language}`)}
                  <XIcon
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleLanguageFilterChange(language)}
                  />
                </Badge>
              ))}
              {filters.stockLevel !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.stockLevel === 'low' ? t('inventory.lowStockAlert') : t('inventory.outOfStock')}
                  <XIcon
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleStockLevelFilterChange('all')}
                  />
                </Badge>
              )}
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('inventory.name')}</TableHead>
                  <TableHead>{t('inventory.category')}</TableHead>
                  <TableHead>{t('inventory.language')}</TableHead>
                  <TableHead>{t('inventory.price')}</TableHead>
                  <TableHead>{t('inventory.stock')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2Icon className="h-6 w-6 animate-spin mr-2" />
                        {t('common.loading')}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-destructive">
                      {t('errors.loadingFailed')}: {error.message}
                    </TableCell>
                  </TableRow>
                ) : filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {t('common.noResults')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-[200px]">
                        <div className="truncate">{item.name}</div>
                      </TableCell>
                      <TableCell>{t(`inventory.categories.${item.category}`)}</TableCell>
                      <TableCell>
                        {item.language && item.language !== 'none' ? t(`inventory.languages.${item.language}`) : '-'}
                      </TableCell>
                      <TableCell>₹{item.price}</TableCell>
                      <TableCell>
                        <span className={item.stock < 10 ? 'text-destructive' : ''}>
                          {item.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(item.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {t('dashboard.totalItems')}: {loading ? '...' : filteredInventory.length}
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('inventory.deleteConfirmation')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('inventory.deleteConfirmationDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
