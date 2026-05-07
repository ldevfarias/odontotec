'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

import { ProfessionalInvitation } from '../types';
import { getInvitationStatus, getRoleLabel } from './professionals-display.utils';

interface InvitationsTabContentProps {
  invitations: ProfessionalInvitation[];
  isLoading: boolean;
}

function InvitationStatusBadge({ invitation }: { invitation: ProfessionalInvitation }) {
  const status = getInvitationStatus(invitation);

  if (status === 'accepted') {
    return (
      <Badge className="border-green-200 bg-green-100 text-green-700 hover:bg-green-100">
        Aceito
      </Badge>
    );
  }

  if (status === 'expired') {
    return <Badge variant="destructive">Expirado</Badge>;
  }

  return (
    <Badge
      variant="secondary"
      className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50"
    >
      Pendente
    </Badge>
  );
}

export function InvitationsTabContent({ invitations, isLoading }: InvitationsTabContentProps) {
  return (
    <>
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
            {isLoading ? (
              <TableRowsSkeleton colCount={4} rowCount={3} />
            ) : invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground h-24 text-center">
                  Nenhum convite pendente.
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>{getRoleLabel(invitation.role)}</TableCell>
                  <TableCell>
                    {format(new Date(invitation.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <InvitationStatusBadge invitation={invitation} />
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
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {invitation.email}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {getRoleLabel(invitation.role)}
                    </Badge>
                    <InvitationStatusBadge invitation={invitation} />
                  </div>
                </div>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {format(new Date(invitation.createdAt), 'dd/MM/yy', { locale: ptBR })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}