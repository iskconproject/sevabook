import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusIcon, SearchIcon, EditIcon, TrashIcon } from 'lucide-react';
import { InventoryForm } from '@/components/inventory/InventoryForm';

// Mock inventory data
const mockInventory = [
  { id: '1', name: 'Bhagavad Gita As It Is', category: 'books', language: 'english', price: '₹250', stock: 45 },
  { id: '2', name: 'Bhagavad Gita As It Is', category: 'books', language: 'bengali', price: '₹220', stock: 32 },
  { id: '3', name: 'Bhagavad Gita As It Is', category: 'books', language: 'hindi', price: '₹230', stock: 28 },
  { id: '4', name: 'Sri Chaitanya Charitamrita', category: 'books', language: 'english', price: '₹450', stock: 15 },
  { id: '5', name: 'Incense Sticks (Sandalwood)', category: 'incense', language: 'none', price: '₹50', stock: 120 },
  { id: '6', name: 'Deity Dress (Small)', category: 'clothing', language: 'none', price: '₹350', stock: 8 },
  { id: '7', name: 'Japa Mala', category: 'puja', language: 'none', price: '₹180', stock: 25 },
  { id: '8', name: 'Krishna Murti (Brass, 8")', category: 'deities', language: 'none', price: '₹1200', stock: 5 },
];

export function InventoryPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<typeof mockInventory[0] | null>(null);

  // Filter inventory based on search query
  const filteredInventory = mockInventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = (values: any) => {
    // In a real app, this would call an API to add the item
    toast.success(t('inventory.itemAdded'), {
      description: values.name,
    });
    setIsAddDialogOpen(false);
  };

  const handleEditItem = (values: any) => {
    // In a real app, this would call an API to update the item
    toast.success(t('inventory.itemUpdated'), {
      description: values.name,
    });
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    // In a real app, this would call an API to delete the item
    toast.success(t('inventory.itemDeleted'), {
      description: mockInventory.find(item => item.id === itemId)?.name,
    });
  };

  const openEditDialog = (item: typeof mockInventory[0]) => {
    setEditingItem(item);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('inventory.title')}</h1>
          <p className="text-muted-foreground">
            {t('inventory.title')} - {filteredInventory.length} {t('dashboard.totalItems')}
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
              initialData={editingItem}
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
            <Button variant="outline">
              {t('common.filter')}
            </Button>
          </div>

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
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {t('common.noResults')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{t(`inventory.categories.${item.category}`)}</TableCell>
                      <TableCell>
                        {item.language && item.language !== 'none' ? t(`inventory.languages.${item.language}`) : '-'}
                      </TableCell>
                      <TableCell>{item.price}</TableCell>
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
                          onClick={() => handleDeleteItem(item.id)}
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
            {t('dashboard.totalItems')}: {filteredInventory.length}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
