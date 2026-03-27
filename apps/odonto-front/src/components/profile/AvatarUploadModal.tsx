'use client';

import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notification.service';
import { useUsersControllerUploadAvatar } from '@/generated/hooks/useUsersControllerUploadAvatar';
import { useUsersControllerRemoveAvatar } from '@/generated/hooks/useUsersControllerRemoveAvatar';
import { authControllerGetMeQueryKey } from '@/generated/hooks/useAuthControllerGetMe';
import { usersControllerFindAllQueryKey } from '@/generated/hooks/useUsersControllerFindAll';
import { ClinicUserDto } from '@/generated/ts/ClinicUserDto';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface AvatarUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AvatarUploadModal({ open, onOpenChange }: AvatarUploadModalProps) {
    const { activeClinic, user, setActiveClinic } = useAuth();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const uploadMutation = useUsersControllerUploadAvatar();
    const removeMutation = useUsersControllerRemoveAvatar();

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    const updateAvatarCache = (avatarUrl: string | null) => {
        if (!user?.id) return;
        queryClient.setQueryData(usersControllerFindAllQueryKey(), (oldData: ClinicUserDto[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map(u => u.id === user.id ? { ...u, avatarUrl } : u);
        });
    };

    const initials = user?.name
        ? user.name.split(' ').slice(0, 2).map((n) => n[0].toUpperCase()).join('')
        : '?';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ACCEPTED_TYPES.includes(file.type)) {
            notificationService.error('Formato inválido. Use JPG, PNG ou WebP.');
            return;
        }
        if (file.size > MAX_SIZE_BYTES) {
            notificationService.error('Imagem muito grande. Máximo 5MB.');
            return;
        }

        // Revoke previous preview URL to avoid memory leaks
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        if (!selectedFile) return;
        try {
            const result = await uploadMutation.mutateAsync({ data: { file: selectedFile } });
            // Update AuthContext directly so the header avatar updates immediately
            if (activeClinic && result?.avatarUrl) {
                setActiveClinic({ ...activeClinic, avatarUrl: result.avatarUrl });
            }
            updateAvatarCache(result.avatarUrl ?? null);
            await queryClient.invalidateQueries({ queryKey: authControllerGetMeQueryKey() });
            notificationService.success('Foto atualizada com sucesso!');
            handleClose();
        } catch {
            notificationService.error('Erro ao salvar foto. Tente novamente.');
        }
    };

    const handleRemove = async () => {
        try {
            await removeMutation.mutateAsync();
            // Update AuthContext directly so the header avatar updates immediately
            if (activeClinic) {
                setActiveClinic({ ...activeClinic, avatarUrl: null });
            }
            updateAvatarCache(null);
            await queryClient.invalidateQueries({ queryKey: authControllerGetMeQueryKey() });
            notificationService.success('Foto removida.');
            handleClose();
        } catch {
            notificationService.error('Erro ao remover foto. Tente novamente.');
        }
    };

    const handleClose = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onOpenChange(false);
    };

    const currentAvatarUrl = previewUrl ?? activeClinic?.avatarUrl ?? null;
    const isLoading = uploadMutation.isPending || removeMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Foto de perfil</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-4">
                    {/* Avatar preview */}
                    <div className="h-24 w-24 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-2xl font-bold text-primary border-2 border-primary/20">
                        {currentAvatarUrl
                            ? <img src={currentAvatarUrl} alt="preview" className="w-full h-full object-cover" />
                            : initials
                        }
                    </div>

                    {/* File input (hidden, triggered by button) */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                    >
                        Escolher imagem
                    </Button>

                    {selectedFile && (
                        <p className="text-sm text-muted-foreground text-center truncate max-w-full px-4">
                            {selectedFile.name}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={!selectedFile || isLoading}
                        className="w-full"
                    >
                        {uploadMutation.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>

                    {activeClinic?.avatarUrl && !previewUrl && (
                        <Button
                            variant="ghost"
                            onClick={handleRemove}
                            disabled={isLoading}
                            className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                            {removeMutation.isPending ? 'Removendo...' : 'Remover foto'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
