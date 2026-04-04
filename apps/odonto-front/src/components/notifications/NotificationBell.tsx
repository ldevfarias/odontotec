'use client';

import { useState } from 'react';
import { Bell, BellRing, Check, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotificationsControllerFindAll } from '@/generated/hooks/useNotificationsControllerFindAll';
import { useNotificationsControllerMarkAsRead } from '@/generated/hooks/useNotificationsControllerMarkAsRead';
import { useNotificationsControllerMarkAllAsRead } from '@/generated/hooks/useNotificationsControllerMarkAllAsRead';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function NotificationBell() {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const { data: notificationsResponse } = useNotificationsControllerFindAll();
    const notifications = (notificationsResponse?.data ?? []) as unknown[];
    const { mutate: markAsRead } = useNotificationsControllerMarkAsRead();
    const { mutate: markAllAsRead } = useNotificationsControllerMarkAllAsRead();

    const unreadCount = notifications.filter((n: any) => !n.read).length;

    const handleMarkAsRead = (id: number) => {
        markAsRead({ id }, {
            onSuccess: () => queryClient.invalidateQueries({ queryKey: [{ url: '/notifications' }] })
        });
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead(undefined, {
            onSuccess: () => queryClient.invalidateQueries({ queryKey: [{ url: '/notifications' }] })
        });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case 'SUCCESS': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'ERROR': return <XCircle className="h-4 w-4 text-rose-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                    {unreadCount > 0 ? (
                        <>
                            <BellRing className="h-5 w-5 text-primary animate-pulse" />
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-rose-500">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Badge>
                        </>
                    ) : (
                        <Bell className="h-5 w-5 text-muted-foreground" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 pb-2">
                    <h4 className="font-semibold text-sm">Notificações</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] h-7 px-2"
                            onClick={handleMarkAllAsRead}
                        >
                            Marcar todas como lidas
                        </Button>
                    )}
                </div>
                <Separator />
                <ScrollArea className="h-72">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-8 text-center px-4">
                            <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                            <p className="text-xs text-muted-foreground">Nenhuma notificação por aqui.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n: any) => (
                                <button
                                    key={n.id}
                                    className={cn(
                                        "flex flex-col gap-1 p-4 text-left hover:bg-muted/50 transition-colors border-b last:border-0",
                                        !n.read && "bg-primary/5"
                                    )}
                                    onClick={() => !n.read && handleMarkAsRead(n.id)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {getIcon(n.type)}
                                            <span className={cn("text-xs font-medium", !n.read ? "text-foreground" : "text-muted-foreground")}>
                                                {n.message}
                                            </span>
                                        </div>
                                        {!n.read && <div className="h-2 w-2 rounded-full bg-primary mt-1 flex-shrink-0" />}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground ml-6">
                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <Separator />
                <div className="p-2 text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs h-8 text-muted-foreground">
                        Ver histórico completo
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
