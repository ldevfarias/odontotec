'use client';

import { useState } from 'react';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notificationService } from '@/services/notification.service';
import { UserPlus, Loader2, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TableRowsSkeleton } from '@/components/skeletons';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useUsersControllerInvite } from '@/generated/hooks/useUsersControllerInvite';
import { useUsersControllerFindAll } from '@/generated/hooks/useUsersControllerFindAll';
import { useUsersControllerFindAllInvitations } from '@/generated/hooks/useUsersControllerFindAllInvitations';

import { api } from '@/lib/api';
import { EditUserDialog } from './components/edit-user-dialog';
import { DeleteUserDialog } from './components/delete-user-dialog';
import { cpfMask } from '@/utils/masks';
import { commonValidations } from '@/utils/validations';

const localInviteSchema = z.object({
    email: commonValidations.email.min(1, 'Obrigatório'),
    cpf: commonValidations.cpf,
    role: z.enum(['ADMIN', 'DENTIST', 'SIMPLE']),
});

type InviteFormValues = z.infer<typeof localInviteSchema>;

export default function ProfessionalsPage() {
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const [userToEdit, setUserToEdit] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const { data: users = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useUsersControllerFindAll();
    const { data: invitations = [], isLoading: isLoadingInvitations, refetch: refetchInvitations } = useUsersControllerFindAllInvitations();
    const { mutate: inviteUser, isPending: isInviting } = useUsersControllerInvite();

    const form = useForm<InviteFormValues>({
        resolver: zodResolver(localInviteSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            cpf: '',
            role: 'DENTIST',
        },
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
                    notificationService.error('Erro ao enviar convite. Verifique os dados ou se o e-mail já está em uso.');
                },
            }
        );
    }

    const handleEdit = (user: any) => {
        setUserToEdit(user);
        setIsEditOpen(true);
    };

    const handleDelete = (user: any) => {
        setUserToDelete(user);
        setIsDeleteOpen(true);
    };

    const handleSuccess = () => {
        refetchUsers();
    };

    const getRoleLabel = (role: string) => {
        const roles: Record<string, string> = {
            'ADMIN': 'Administrador',
            'DENTIST': 'Dentista',
            'SIMPLE': 'Recepcionista'
        };
        return roles[role] || role;
    };

    const getInvitationStatus = (invitation: any) => {
        if (invitation.acceptedAt) return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Aceito</Badge>;
        const now = new Date();
        const expiresAt = new Date(invitation.expiresAt);
        if (expiresAt < now) return <Badge variant="destructive">Expirado</Badge>;
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">Pendente</Badge>;
    };

    const activeUsers = users.filter((u: any) => u.isActive);
    const inactiveUsers = users.filter((u: any) => !u.isActive);

    const handleActivate = async (user: any) => {
        try {
            await api.patch(`/users/${user.id}`, { isActive: true });
            notificationService.success('Usuário reativado com sucesso!');
            refetchUsers();
        } catch (error) {
            console.error('Error activating user:', error);
            notificationService.apiError(error, 'Erro ao reativar usuário.');
        }
    };

    const userActionMenu = (user: any, isActive: boolean) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                {isActive ? (
                    <>
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        {user.role !== 'ADMIN' && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => handleDelete(user)}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Desativar
                                </DropdownMenuItem>
                            </>
                        )}
                    </>
                ) : (
                    <DropdownMenuItem onClick={() => handleActivate(user)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Reativar
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Profissionais</h1>
                    <p className="hidden sm:block text-muted-foreground">
                        Gerencie os dentistas e a equipe da sua clínica.
                    </p>
                </div>

                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2 shrink-0">
                            <UserPlus className="h-4 w-4" />
                            <span className="hidden sm:inline">Convidar Profissional</span>
                            <span className="sm:hidden">Convidar</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Convidar Profissional</DialogTitle>
                            <DialogDescription>
                                Envie um convite para um novo membro da equipe. Eles receberão um link para completar o cadastro.
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

            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-3 sm:max-w-[600px]">
                    <TabsTrigger value="active">Equipe Ativa</TabsTrigger>
                    <TabsTrigger value="inactive">Inativos</TabsTrigger>
                    <TabsTrigger value="invitations">Convites</TabsTrigger>
                </TabsList>

                {/* TAB: Equipe Ativa */}
                <TabsContent value="active" className="mt-4">
                    {/* Desktop table */}
                    <div className="hidden sm:block rounded-md border bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[70px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingUsers ? (
                                    <TableRowsSkeleton colCount={5} rowCount={5} />
                                ) : activeUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            Nenhum profissional ativo encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    activeUsers.map((user: any) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{getRoleLabel(user.role)}</TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Ativo</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {userActionMenu(user, true)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile card list */}
                    <Card className="sm:hidden">
                        {isLoadingUsers ? (
                            <div className="divide-y">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-16 bg-muted/30 animate-pulse mx-4 my-2 rounded-lg" />
                                ))}
                            </div>
                        ) : activeUsers.length === 0 ? (
                            <div className="py-10 text-center text-sm text-muted-foreground">
                                Nenhum profissional ativo encontrado.
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {activeUsers.map((user: any) => (
                                    <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="secondary" className="text-[10px]">{getRoleLabel(user.role)}</Badge>
                                                <Badge className="text-[10px] bg-green-50 text-green-700 border-green-200">Ativo</Badge>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            {userActionMenu(user, true)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* TAB: Inativos */}
                <TabsContent value="inactive" className="mt-4">
                    {/* Desktop table */}
                    <div className="hidden sm:block rounded-md border bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[70px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingUsers ? (
                                    <TableRowsSkeleton colCount={5} rowCount={5} />
                                ) : inactiveUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            Nenhum profissional inativo encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    inactiveUsers.map((user: any) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium text-muted-foreground">{user.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                            <TableCell className="text-muted-foreground">{getRoleLabel(user.role)}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">Inativo</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {userActionMenu(user, false)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile card list */}
                    <Card className="sm:hidden">
                        {isLoadingUsers ? (
                            <div className="divide-y">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-16 bg-muted/30 animate-pulse mx-4 my-2 rounded-lg" />
                                ))}
                            </div>
                        ) : inactiveUsers.length === 0 ? (
                            <div className="py-10 text-center text-sm text-muted-foreground">
                                Nenhum profissional inativo encontrado.
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {inactiveUsers.map((user: any) => (
                                    <div key={user.id} className="flex items-center gap-3 px-4 py-3 opacity-70">
                                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-semibold shrink-0">
                                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-muted-foreground truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="secondary" className="text-[10px]">{getRoleLabel(user.role)}</Badge>
                                                <Badge variant="secondary" className="text-[10px]">Inativo</Badge>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            {userActionMenu(user, false)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* TAB: Convites */}
                <TabsContent value="invitations" className="mt-4">
                    {/* Desktop table */}
                    <div className="hidden sm:block rounded-md border bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead>Enviado em</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingInvitations ? (
                                    <TableRowsSkeleton colCount={4} rowCount={3} />
                                ) : invitations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            Nenhum convite pendente.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    invitations.map((inv: any) => (
                                        <TableRow key={inv.id}>
                                            <TableCell>{inv.email}</TableCell>
                                            <TableCell>{getRoleLabel(inv.role)}</TableCell>
                                            <TableCell>{format(new Date(inv.createdAt), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                                            <TableCell>{getInvitationStatus(inv)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile card list */}
                    <Card className="sm:hidden">
                        {isLoadingInvitations ? (
                            <div className="divide-y">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-14 bg-muted/30 animate-pulse mx-4 my-2 rounded-lg" />
                                ))}
                            </div>
                        ) : invitations.length === 0 ? (
                            <div className="py-10 text-center text-sm text-muted-foreground">
                                Nenhum convite pendente.
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {invitations.map((inv: any) => (
                                    <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">{inv.email}</p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <Badge variant="secondary" className="text-[10px]">{getRoleLabel(inv.role)}</Badge>
                                                {getInvitationStatus(inv)}
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {format(new Date(inv.createdAt), "dd/MM/yy", { locale: ptBR })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>

            <EditUserDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                user={userToEdit}
                onSuccess={handleSuccess}
            />

            <DeleteUserDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                user={userToDelete}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
