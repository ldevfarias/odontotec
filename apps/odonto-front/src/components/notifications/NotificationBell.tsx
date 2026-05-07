'use client';

import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, Bell, BellRing, CheckCircle2, Info, XCircle } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotificationsControllerFindAll } from '@/generated/hooks/useNotificationsControllerFindAll';
import { useNotificationsControllerMarkAllAsRead } from '@/generated/hooks/useNotificationsControllerMarkAllAsRead';
import { useNotificationsControllerMarkAsRead } from '@/generated/hooks/useNotificationsControllerMarkAsRead';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notificationsResponse } = useNotificationsControllerFindAll();
  type NotificationItem = {
    id: number;
    read: boolean;
    type: string;
    message: string;
    createdAt: string;
  };
  const notifications = (notificationsResponse?.data ?? []) as NotificationItem[];
  const { mutate: markAsRead } = useNotificationsControllerMarkAsRead();
  const { mutate: markAllAsRead } = useNotificationsControllerMarkAllAsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    markAsRead(
      { id },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [{ url: '/notifications' }] }),
      },
    );
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [{ url: '/notifications' }] }),
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'SUCCESS':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-rose-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
          {unreadCount > 0 ? (
            <>
              <BellRing className="text-primary h-5 w-5 animate-pulse" />
              <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-rose-500 p-0 text-[10px]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            </>
          ) : (
            <Bell className="text-muted-foreground h-5 w-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <h4 className="text-sm font-semibold">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px]"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
              <Bell className="text-muted-foreground/30 mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-xs">Nenhuma notificação por aqui.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className={cn(
                    'hover:bg-muted/50 flex flex-col gap-1 border-b p-4 text-left transition-colors last:border-0',
                    !n.read && 'bg-primary/5',
                  )}
                  onClick={() => !n.read && handleMarkAsRead(n.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getIcon(n.type)}
                      <span
                        className={cn(
                          'text-xs font-medium',
                          !n.read ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        {n.message}
                      </span>
                    </div>
                    {!n.read && (
                      <div className="bg-primary mt-1 h-2 w-2 flex-shrink-0 rounded-full" />
                    )}
                  </div>
                  <span className="text-muted-foreground ml-6 text-[10px]">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2 text-center">
          <Button variant="ghost" size="sm" className="text-muted-foreground h-8 w-full text-xs">
            Ver histórico completo
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
