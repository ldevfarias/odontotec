import { File, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    <div className="group bg-background relative overflow-hidden rounded-lg border">
      <div className="bg-muted flex aspect-square items-center justify-center">
        {isImage && previewUrl ? (
          <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
        ) : (
          <File className="text-muted-foreground h-8 w-8" />
        )}
      </div>
      <div className="bg-muted/20 truncate border-t p-2 text-xs">{file.name}</div>
      <button
        type="button"
        onClick={onRemove}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
