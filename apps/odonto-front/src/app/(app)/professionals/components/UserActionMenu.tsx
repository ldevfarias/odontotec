'use client';

import { Edit, MoreHorizontal, Trash2, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ProfessionalUser } from '../types';
import { isAdminRole } from './professionals-display.utils';

interface UserActionMenuProps {
  user: ProfessionalUser;
  isActive: boolean;
  onEdit: (user: ProfessionalUser) => void;
  onDelete: (user: ProfessionalUser) => void;
  onActivate: (user: ProfessionalUser) => void;
}

export function UserActionMenu({
  user,
  isActive,
  onEdit,
  onDelete,
  onActivate,
}: UserActionMenuProps) {
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
            {!isAdminRole(user.role) && (
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