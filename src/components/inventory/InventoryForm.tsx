import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CameraIcon, SaveIcon } from 'lucide-react';
import { AIImageRecognition } from './AIImageRecognition';
import { RecognizedItem } from '@/lib/ai/imageRecognition';
import { useLocation } from '@/contexts/LocationContext';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category: z.string(),
  language: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)), { message: "Price must be a number." }),
  stock: z.string().refine((val) => !isNaN(Number(val)), { message: "Stock must be a number." }),
  description: z.string().optional(),
  location_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface InventoryFormProps {
  initialData?: {
    id?: string;
    name: string;
    category: string;
    language?: string;
    price: string;
    stock: number;
    description?: string;
    location_id?: string;
  };
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
}

export function InventoryForm({ initialData, onSubmit, onCancel }: InventoryFormProps) {
  const { t } = useTranslation();
  const { currentLocation, locations } = useLocation();
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      category: initialData?.category || 'books',
      language: initialData?.language || 'none',
      price: initialData?.price?.replace('₹', '') || '',
      stock: initialData?.stock?.toString() || '0',
      description: initialData?.description || '',
      location_id: initialData?.location_id || currentLocation?.id || '',
    },
  });

  const handleAIDetection = () => {
    setIsAIDialogOpen(true);
  };

  const handleRecognizedItem = (item: RecognizedItem) => {
    form.setValue('name', item.name);
    form.setValue('category', item.category);
    if (item.language) form.setValue('language', item.language);
    if (item.price) form.setValue('price', item.price.toString());
    if (item.description) form.setValue('description', item.description);

    setIsAIDialogOpen(false);

    toast.success(t('inventory.aiDetectionComplete'), {
      description: t('inventory.aiDetectionSuccess'),
    });
  };

  return (
    <>
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('inventory.addWithAI')}</DialogTitle>
            <DialogDescription>
              {t('inventory.aiDetectionDescription')}
            </DialogDescription>
          </DialogHeader>
          <AIImageRecognition
            onRecognized={handleRecognizedItem}
            onCancel={() => setIsAIDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleAIDetection}
            >
              <CameraIcon className="mr-2 h-4 w-4" />
              {t('inventory.addWithAI')}
            </Button>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('inventory.name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('inventory.name')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inventory.category')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('inventory.selectCategory')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="books">{t('inventory.categories.books')}</SelectItem>
                      <SelectItem value="incense">{t('inventory.categories.incense')}</SelectItem>
                      <SelectItem value="deities">{t('inventory.categories.deities')}</SelectItem>
                      <SelectItem value="puja">{t('inventory.categories.puja')}</SelectItem>
                      <SelectItem value="clothing">{t('inventory.categories.clothing')}</SelectItem>
                      <SelectItem value="media">{t('inventory.categories.media')}</SelectItem>
                      <SelectItem value="other">{t('inventory.categories.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inventory.language')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('inventory.selectLanguage')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">{t('common.none')}</SelectItem>
                      <SelectItem value="english">{t('inventory.languages.english')}</SelectItem>
                      <SelectItem value="bengali">{t('inventory.languages.bengali')}</SelectItem>
                      <SelectItem value="hindi">{t('inventory.languages.hindi')}</SelectItem>
                      <SelectItem value="sanskrit">{t('inventory.languages.sanskrit')}</SelectItem>
                      <SelectItem value="other">{t('inventory.languages.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inventory.price')} (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inventory.stock')}</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('inventory.location')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('inventory.selectLocation')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('inventory.description')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('inventory.description')}
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              <SaveIcon className="mr-2 h-4 w-4" />
              {initialData?.id ? t('common.save') : t('common.add')}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
