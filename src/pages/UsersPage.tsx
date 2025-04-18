import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { PlusIcon, SearchIcon, EditIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ClockIcon, AlertCircleIcon, LoaderIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile, UserRole, SUPER_ADMIN_EMAIL } from '@/lib/types/user';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { db } from '@/lib/supabase/client';



const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(['superAdmin', 'admin', 'seller', 'manager'] as const),
  status: z.enum(['active', 'inactive', 'pending'] as const),
});

type FormValues = z.infer<typeof formSchema>;

export function UsersPage() {
  const { t } = useTranslation();
  const { isSuperAdmin, userRole, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await db.users.getUsers();
        if (error) {
          toast.error(t('errors.fetchFailed'), {
            description: error.message || t('users.fetchError'),
          });
          return;
        }
        if (data) {
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error(t('errors.fetchFailed'), {
          description: t('users.fetchError'),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [t]);

  // Filter users based on search query and user role
  const filteredUsers = users.filter(user => {
    // Only super admin can see other super admins
    if (user.role === 'superAdmin' && !isSuperAdmin) return false;

    // Admin can only see users with roles below them
    if (userRole === 'admin' && user.role === 'admin' && user.email !== userProfile?.email) return false;

    // Filter by search query
    return user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(`users.roles.${user.role}`).toLowerCase().includes(searchQuery.toLowerCase());
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'seller',
      status: 'active',
    },
  });

  // Check if user can edit a specific user
  const canEditUser = (user: UserProfile) => {
    // Super admin can edit anyone except other super admins
    if (isSuperAdmin) {
      return user.email !== SUPER_ADMIN_EMAIL || user.email === SUPER_ADMIN_EMAIL;
    }

    // Admin can edit only users with roles below them
    if (userRole === 'admin') {
      return user.role !== 'superAdmin' && user.role !== 'admin';
    }

    return false;
  };

  // Check if user can delete a specific user
  const canDeleteUser = (user: UserProfile) => {
    // No one can delete the super admin
    if (user.email === SUPER_ADMIN_EMAIL) return false;

    // Super admin can delete anyone except themselves
    if (isSuperAdmin) {
      return true;
    }

    // Admin can delete only users with roles below them
    if (userRole === 'admin') {
      return user.role !== 'superAdmin' && user.role !== 'admin';
    }

    return false;
  };

  const onSubmit = async (values: FormValues) => {
    // Check if trying to create/edit a super admin
    if (values.role === 'superAdmin' && !isSuperAdmin) {
      toast.error(t('errors.unauthorized'), {
        description: t('users.cannotCreateSuperAdmin'),
      });
      return;
    }

    // Check if trying to edit a user they don't have permission for
    if (editingUser && !canEditUser(editingUser)) {
      toast.error(t('errors.unauthorized'), {
        description: t('users.cannotEditUser'),
      });
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const { error } = await db.users.updateUser(editingUser.id, {
          name: values.name,
          email: values.email,
          role: values.role,
          status: values.status
        });

        if (error) {
          toast.error(t('errors.updateFailed'), {
            description: error.message || t('users.updateError'),
          });
          return;
        }

        toast.success(t('users.userUpdated'), {
          description: `${values.name} (${values.email})`,
        });
      } else {
        // In a real implementation, you would need to create a user in auth system first
        // This is just a placeholder for the UI
        toast.error(t('users.addNotImplemented'), {
          description: t('users.addUserThroughAuth'),
        });
        return;
      }

      // Refresh the users list
      const { data, error } = await db.users.getUsers();
      if (error) {
        toast.error(t('errors.fetchFailed'), {
          description: error.message || t('users.fetchError'),
        });
      } else if (data) {
        setUsers(data);
      }

      setIsAddUserOpen(false);
      setEditingUser(null);
      form.reset();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(t('errors.updateFailed'), {
        description: t('users.updateError'),
      });
    }
  };

  const handleEditUser = (user: UserProfile) => {
    if (!canEditUser(user)) {
      toast.error(t('errors.unauthorized'), {
        description: t('users.cannotEditUser'),
      });
      return;
    }

    setEditingUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      role: user.role as any,
      status: user.status as any,
    });
    setIsAddUserOpen(true);
  };

  const handleDeleteClick = (user: UserProfile) => {
    if (!canDeleteUser(user)) {
      toast.error(t('errors.unauthorized'), {
        description: t('users.cannotDeleteUser'),
      });
      return;
    }

    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      // In a real implementation, you would need to handle auth user deletion as well
      // This is just updating the user status to inactive instead of deleting
      const { error } = await db.users.updateUser(userToDelete.id, {
        status: 'inactive'
      });

      if (error) {
        toast.error(t('errors.deleteFailed'), {
          description: error.message || t('users.deleteError'),
        });
        return;
      }

      toast.success(t('users.userDeactivated'), {
        description: userToDelete.name,
      });

      // Refresh the users list
      const { data, error: fetchError } = await db.users.getUsers();
      if (fetchError) {
        toast.error(t('errors.fetchFailed'), {
          description: fetchError.message || t('users.fetchError'),
        });
      } else if (data) {
        setUsers(data);
      }

      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error(t('errors.deleteFailed'), {
        description: t('users.deleteError'),
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('users.title')}</h1>
          <p className="text-muted-foreground">
            {t('users.title')} - {filteredUsers.length} {t('users.title')}
          </p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              {t('users.addUser')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? t('users.editUser') : t('users.addUser')}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? t('users.editUserDescription')
                  : t('users.addUserDescription')}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('users.name')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.email')}</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.role')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('users.selectRole')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isSuperAdmin && (
                            <SelectItem value="superAdmin">
                              {t('users.roles.superAdmin')}
                              <span className="ml-2 text-xs text-muted-foreground">{t('users.roleDescriptions.superAdmin')}</span>
                            </SelectItem>
                          )}
                          <SelectItem value="admin">
                            {t('users.roles.admin')}
                            <span className="ml-2 text-xs text-muted-foreground">{t('users.roleDescriptions.admin')}</span>
                          </SelectItem>
                          <SelectItem value="seller">
                            {t('users.roles.seller')}
                            <span className="ml-2 text-xs text-muted-foreground">{t('users.roleDescriptions.seller')}</span>
                          </SelectItem>
                          <SelectItem value="manager">
                            {t('users.roles.manager')}
                            <span className="ml-2 text-xs text-muted-foreground">{t('users.roleDescriptions.manager')}</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.status')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('users.selectStatus')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">{t('users.statusOptions.active')}</SelectItem>
                          <SelectItem value="inactive">{t('users.statusOptions.inactive')}</SelectItem>
                          <SelectItem value="pending">{t('users.statusOptions.pending')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">
                    {editingUser ? t('common.save') : t('common.add')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('users.title')}</CardTitle>
          <CardDescription>
            {t('users.title')} - {t('app.name')}
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
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.name')}</TableHead>
                  <TableHead>{t('users.email')}</TableHead>
                  <TableHead>{t('users.role')}</TableHead>
                  <TableHead>{t('users.status')}</TableHead>
                  <TableHead>{t('users.lastLogin')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <LoaderIcon className="h-6 w-6 animate-spin mr-2" />
                        {t('common.loading')}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {t('common.noResults')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{t(`users.roles.${user.role}`)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.status)}
                          <span>{t(`users.statusOptions.${user.status}`)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <span className="text-muted-foreground">
                            {new Date(user.lastLogin).toLocaleString()}
                          </span>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-amber-500 font-medium">
                                  <ClockIcon className="h-3.5 w-3.5" />
                                  <span>{t('users.never')}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('users.neverLoggedIn')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditUser(user)}
                                disabled={!canEditUser(user)}
                              >
                                <EditIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {canEditUser(user) ? t('users.editUser') : t('users.cannotEditUser')}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(user)}
                                disabled={!canDeleteUser(user)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {canDeleteUser(user) ? t('users.deleteUser') : t('users.cannotDeleteUser')}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {user.role === 'superAdmin' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center justify-center w-8 h-8">
                                  <AlertCircleIcon className="h-4 w-4 text-primary" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t('users.superAdminInfo')}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
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
            {filteredUsers.length} {t('users.title')}
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('users.deleteConfirmation')}</DialogTitle>
            <DialogDescription>
              {t('users.deleteConfirmationDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 p-4 border rounded-md bg-muted/50">
            <div className="flex-shrink-0">
              <AlertCircleIcon className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h4 className="font-medium">{userToDelete?.name}</h4>
              <p className="text-sm text-muted-foreground">{userToDelete?.email}</p>
              <p className="text-sm text-muted-foreground">{t(`users.roles.${userToDelete?.role}`)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
