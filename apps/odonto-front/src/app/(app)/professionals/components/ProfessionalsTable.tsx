/* eslint-disable max-lines -- dense UI table component extracted from professionals/page.tsx */
'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, MoreHorizontal, Trash2, UserPlus } from 'lucide-react';

import { TableRowsSkeleton } from '@/components/skeletons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfessionalsTableProps {
  activeUsers: unknown[];
  inactiveUsers: unknown[];
  invitations: unknown[];
  isLoadingUsers: boolean;
  isLoadingInvitations: boolean;
  onEdit: (user: unknown) => void;
  onDelete: (user: unknown) => void;
  onActivate: (user: unknown) => void;
}

function getRoleLabel(role: string) {
  const roles: Record<string, string> = {
    ADMIN: 'Administrador',
    DENTIST: 'Dentista',
    SIMPLE: 'Recepcionista',
  };
  return roles[role] || role;
}

function getInvitationStatus(invitation: unknown) {
  if (invitation.acceptedAt)
    return (
      <Badge className="border-green-200 bg-green-100 text-green-700 hover:bg-green-100">
        Aceito
      </Badge>
    );
  const now = new Date();
  const expiresAt = new Date(invitation.expiresAt);
  if (expiresAt < now) return <Badge variant="destructive">Expirado</Badge>;
  return (
    <Badge
      variant="secondary"
      className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50"
    >
      Pendente
    </Badge>
  );
}

function UserActionMenu({
  user,
  isActive,
  onEdit,
  onDelete,
  onActivate,
}: {
  user: unknown;
  isActive: boolean;
  onEdit: (u: unknown) => void;
  onDelete: (u: unknown) => void;
  onActivate: (u: unknown) => void;
}) {
  return (
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
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            {user.role !== 'ADMIN' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(user)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Desativar
                </DropdownMenuItem>
              </>
            )}
          </>
        ) : (
          <DropdownMenuItem onClick={() => onActivate(user)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Reativar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ProfessionalsTable({
  activeUsers,
  inactiveUsers,
  invitations,
  isLoadingUsers,
  isLoadingInvitations,
  onEdit,
  onDelete,
  onActivate,
}: ProfessionalsTableProps) {
  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid w-full grid-cols-3 sm:max-w-[600px]">
        <TabsTrigger value="active">Equipe Ativa</TabsTrigger>
        <TabsTrigger value="inactive">Inativos</TabsTrigger>
        <TabsTrigger value="invitations">Convites</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="mt-4">
        <div className="hidden rounded-md border bg-white sm:block">
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
                  <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                    Nenhum profissional ativo encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                activeUsers.map((user: unknown) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleLabel(user.role)}</TableCell>
                    <TableCell>
                      <Badge className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
                        Ativo
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <UserActionMenu
                        user={user}
                        isActive={true}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onActivate={onActivate}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Card className="sm:hidden">
          {isLoadingUsers ? (
            <div className="divide-y">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-muted/30 mx-4 my-2 h-16 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : activeUsers.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center text-sm">
              Nenhum profissional ativo encontrado.
            </div>
          ) : (
            <div className="divide-border divide-y">
              {activeUsers.map((user: unknown) => (
                <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-semibold">{user.name}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {getRoleLabel(user.role)}
                      </Badge>
                      <Badge className="border-green-200 bg-green-50 text-[10px] text-green-700">
                        Ativo
                      </Badge>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <UserActionMenu
                      user={user}
                      isActive={true}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onActivate={onActivate}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="inactive" className="mt-4">
        <div className="hidden rounded-md border bg-white sm:block">
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
                  <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                    Nenhum profissional inativo encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                inactiveUsers.map((user: unknown) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-muted-foreground font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {getRoleLabel(user.role)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Inativo</Badge>
                    </TableCell>
                    <TableCell>
                      <UserActionMenu
                        user={user}
                        isActive={false}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onActivate={onActivate}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Card className="sm:hidden">
          {isLoadingUsers ? (
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-muted/30 mx-4 my-2 h-16 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : inactiveUsers.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center text-sm">
              Nenhum profissional inativo encontrado.
            </div>
          ) : (
            <div className="divide-border divide-y">
              {inactiveUsers.map((user: unknown) => (
                <div key={user.id} className="flex items-center gap-3 px-4 py-3 opacity-70">
                  <div className="bg-muted text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground truncate text-sm font-semibold">
                      {user.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {getRoleLabel(user.role)}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        Inativo
                      </Badge>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <UserActionMenu
                      user={user}
                      isActive={false}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onActivate={onActivate}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="invitations" className="mt-4">
        <div className="hidden rounded-md border bg-white sm:block">
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
                  <TableCell colSpan={4} className="text-muted-foreground h-24 text-center">
                    Nenhum convite pendente.
                  </TableCell>
                </TableRow>
              ) : (
                invitations.map((inv: unknown) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.email}</TableCell>
                    <TableCell>{getRoleLabel(inv.role)}</TableCell>
                    <TableCell>
                      {format(new Date(inv.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{getInvitationStatus(inv)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Card className="sm:hidden">
          {isLoadingInvitations ? (
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-muted/30 mx-4 my-2 h-14 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center text-sm">
              Nenhum convite pendente.
            </div>
          ) : (
            <div className="divide-border divide-y">
              {invitations.map((inv: unknown) => (
                <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-semibold">{inv.email}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {getRoleLabel(inv.role)}
                      </Badge>
                      {getInvitationStatus(inv)}
                    </div>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {format(new Date(inv.createdAt), 'dd/MM/yy', { locale: ptBR })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
}
