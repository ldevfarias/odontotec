'use client';

import { TableRowsSkeleton } from '@/components/skeletons';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { ProfessionalUser } from '../types';
import { getRoleLabel } from './professionals-display.utils';
import { UserActionMenu } from './UserActionMenu';

interface UsersTabContentProps {
  users: ProfessionalUser[];
  isLoading: boolean;
  isActiveTab: boolean;
  onEdit: (user: ProfessionalUser) => void;
  onDelete: (user: ProfessionalUser) => void;
  onActivate: (user: ProfessionalUser) => void;
}

function getEmptyMessage(isActiveTab: boolean) {
  return isActiveTab
    ? 'Nenhum profissional ativo encontrado.'
    : 'Nenhum profissional inativo encontrado.';
}

function getSkeletonRows(isActiveTab: boolean) {
  return isActiveTab ? 4 : 3;
}

export function UsersTabContent({
  users,
  isLoading,
  isActiveTab,
  onEdit,
  onDelete,
  onActivate,
}: UsersTabContentProps) {
  const emptyMessage = getEmptyMessage(isActiveTab);

  return (
    <>
      <div className="hidden rounded-md border bg-white sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-17.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowsSkeleton colCount={5} rowCount={5} />
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell
                    className={isActiveTab ? 'font-medium' : 'text-muted-foreground font-medium'}
                  >
                    {user.name}
                  </TableCell>
                  <TableCell className={isActiveTab ? '' : 'text-muted-foreground'}>
                    {user.email}
                  </TableCell>
                  <TableCell className={isActiveTab ? '' : 'text-muted-foreground'}>
                    {getRoleLabel(user.role)}
                  </TableCell>
                  <TableCell>
                    {isActiveTab ? (
                      <Badge className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <UserActionMenu
                      user={user}
                      isActive={isActiveTab}
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
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: getSkeletonRows(isActiveTab) }).map((_, i) => (
              <div key={i} className="bg-muted/30 mx-4 my-2 h-16 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-muted-foreground py-10 text-center text-sm">{emptyMessage}</div>
        ) : (
          <div className="divide-border divide-y">
            {users.map((user) => (
              <div
                key={user.id}
                className={isActiveTab ? 'flex items-center gap-3 px-4 py-3' : 'flex items-center gap-3 px-4 py-3 opacity-70'}
              >
                <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      isActiveTab
                        ? 'text-foreground truncate text-sm font-semibold'
                        : 'text-muted-foreground truncate text-sm font-semibold'
                    }
                  >
                    {user.name}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {getRoleLabel(user.role)}
                    </Badge>
                    {isActiveTab ? (
                      <Badge className="border-green-200 bg-green-50 text-[10px] text-green-700">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Inativo
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <UserActionMenu
                    user={user}
                    isActive={isActiveTab}
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
    </>
  );
}