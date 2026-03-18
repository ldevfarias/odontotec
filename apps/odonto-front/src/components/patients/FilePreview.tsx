import { useState, useEffect } from 'react';
import { File, X } from 'lucide-react';

interface FilePreviewProps {
    file: File;
    onRemove: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const isImage = file.type.startsWith('image/');

    useEffect(() => {
        if (!isImage) return;

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file, isImage]);

    return (
        <div className="relative group border rounded-lg overflow-hidden bg-background">
            <div className="aspect-square bg-muted flex items-center justify-center">
                {isImage && previewUrl ? (
                    <img
                        src={previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <File className="h-8 w-8 text-muted-foreground" />
                )}
            </div>
            <div className="p-2 text-xs truncate border-t bg-muted/20">
                {file.name}
            </div>
            <button
                type="button"
                onClick={onRemove}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-destructive/90"
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    );
}
