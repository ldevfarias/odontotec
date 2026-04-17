'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsersControllerFindAll } from '@/generated/hooks/useUsersControllerFindAll';
import { useUsersControllerFindAllInvitations } from '@/generated/hooks/useUsersControllerFindAllInvitations';
import { useUsersControllerInvite } from '@/generated/hooks/useUsersControllerInvite';
import { api } from '@/lib/api';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { notificationService } from '@/services/notification.service';
import { cpfMask } from '@/utils/masks';
import { commonValidations } from '@/utils/validations';

import { DeleteUserDialog } from './components/delete-user-dialog';
import { EditUserDialog } from './components/edit-user-dialog';
import { ProfessionalsTable } from './components/ProfessionalsTable';

const localInviteSchema = z.object({
  email: commonValidations.email.min(1, 'Obrigatório'),
  cpf: commonValidations.cpf,
  role: z.enum(['ADMIN', 'DENTIST', 'SIMPLE']),
});

type InviteFormValues = z.infer<typeof localInviteSchema>;

export default function ProfessionalsPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<unknown>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<unknown>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
  } = useUsersControllerFindAll();
  const users = usersResponse?.data ?? [];

  const {
    data: invitationsResponse,
    isLoading: isLoadingInvitations,
    refetch: refetchInvitations,
  } = useUsersControllerFindAllInvitations();
  const invitations = invitationsResponse?.data ?? [];

  const { mutate: inviteUser, isPending: isInviting } = useUsersControllerInvite();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(localInviteSchema),
    mode: 'onChange',
    defaultValues: { email: '', cpf: '', role: 'DENTIST' },
  });

  function onInvite(values: InviteFormValues) {
    inviteUser(
      { data: values },
      {
        onSuccess: () => {
          notificationService.success('Convite enviado com sucesso!');
          analytics.capture(EVENT_NAMES.PROFESSIONAL_INVITED, {
            email: values.email,
            role: values.role,
          });
          form.reset();
          setIsInviteOpen(false);
          refetchInvitations();
        },
        onError: () => {
          notificationService.error(
            'Erro ao enviar convite. Verifique os dados ou se o e-mail já está em uso.',
          );
        },
      },
    );
  }

  const handleActivate = async (user: unknown) => {
    try {
      await api.patch(`/users/${user.id}`, { isActive: true });
      notificationService.success('Usuário reativado com sucesso!');
      refetchUsers();
    } catch (error) {
      console.error('Error activating user:', error);
      notificationService.apiError(error, 'Erro ao reativar usuário.');
    }
  };

  const activeUsers = users.filter((u: unknown) => u.isActive);
  const inactiveUsers = users.filter((u: unknown) => !u.isActive);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">Profissionais</h1>
          <p className="text-muted-foreground hidden sm:block">
            Gerencie os dentistas e a equipe da sua clínica.
          </p>
        </div>

        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0 gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Convidar Profissional</span>
              <span className="sm:hidden">Convidar</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Convidar Profissional</DialogTitle>
              <DialogDescription>
                Envie um convite para um novo membro da equipe. Eles receberão um link para
                completar o cadastro.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" maxLength={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          maxLength={14}
                          {...field}
                          onChange={(e) => field.onChange(cpfMask(e.target.value))}
                        />
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
                      <FormLabel>Cargo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cargo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DENTIST">Dentista</SelectItem>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                          <SelectItem value="SIMPLE">Recepcionista</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isInviting || !form.formState.isValid}>
                    {isInviting ? 'Enviando...' : 'Enviar Convite'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <ProfessionalsTable
        activeUsers={activeUsers}
        inactiveUsers={inactiveUsers}
        invitations={invitations}
        isLoadingUsers={isLoadingUsers}
        isLoadingInvitations={isLoadingInvitations}
        onEdit={(user) => {
          setUserToEdit(user);
          setIsEditOpen(true);
        }}
        onDelete={(user) => {
          setUserToDelete(user);
          setIsDeleteOpen(true);
        }}
        onActivate={handleActivate}
      />

      <EditUserDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={userToEdit}
        onSuccess={refetchUsers}
      />

      <DeleteUserDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        user={userToDelete}
        onSuccess={refetchUsers}
      />
    </div>
  );
}
