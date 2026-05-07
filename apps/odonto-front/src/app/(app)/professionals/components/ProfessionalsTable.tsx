'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ProfessionalInvitation, ProfessionalUser } from '../types';
import { InvitationsTabContent } from './InvitationsTabContent';
import { UsersTabContent } from './UsersTabContent';

interface ProfessionalsTableProps {
  activeUsers: ProfessionalUser[];
  inactiveUsers: ProfessionalUser[];
  invitations: ProfessionalInvitation[];
  isLoadingUsers: boolean;
  isLoadingInvitations: boolean;
  onEdit: (user: ProfessionalUser) => void;
  onDelete: (user: ProfessionalUser) => void;
  onActivate: (user: ProfessionalUser) => void;
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
      <TabsList className="grid w-full grid-cols-3 sm:max-w-150">
        <TabsTrigger value="active">Equipe Ativa</TabsTrigger>
        <TabsTrigger value="inactive">Inativos</TabsTrigger>
        <TabsTrigger value="invitations">Convites</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="mt-4">
        <UsersTabContent
          users={activeUsers}
          isLoading={isLoadingUsers}
          isActiveTab={true}
          onEdit={onEdit}
          onDelete={onDelete}
          onActivate={onActivate}
        />
      </TabsContent>

      <TabsContent value="inactive" className="mt-4">
        <UsersTabContent
          users={inactiveUsers}
          isLoading={isLoadingUsers}
          isActiveTab={false}
          onEdit={onEdit}
          onDelete={onDelete}
          onActivate={onActivate}
        />
      </TabsContent>

      <TabsContent value="invitations" className="mt-4">
        <InvitationsTabContent invitations={invitations} isLoading={isLoadingInvitations} />
      </TabsContent>
    </Tabs>
  );
}
