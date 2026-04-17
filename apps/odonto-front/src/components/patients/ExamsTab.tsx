'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, File, FileUp, Image as ImageIcon, Loader2, Search, X } from 'lucide-react';
import { useState } from 'react';

import { ExamsTabSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useExamsControllerFindAllByPatient } from '@/generated/hooks/useExamsControllerFindAllByPatient';
import { useExamsControllerUpload } from '@/generated/hooks/useExamsControllerUpload';
import { notificationService } from '@/services/notification.service';

interface ExamItem {
  id: number;
  title: string;
  createdAt?: string;
  fileType?: string;
  fileUrl: string;
}

export function ExamsTab({ patientId }: { patientId: number }) {
  const { data: exams, isLoading, refetch } = useExamsControllerFindAllByPatient(patientId);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { mutate: uploadExam, isPending } = useExamsControllerUpload({
    client: {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
        setUploadProgress(percentCompleted);
      },
    },
  });
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleUpload = () => {
    if (!title || files.length === 0) {
      notificationService.error('Título e pelo menos um arquivo são obrigatórios');
      return;
    }

    uploadExam(
      {
        data: {
          title,
          patientId,
          files,
        },
      },
      {
        onSuccess: () => {
          notificationService.success('Exames enviados com sucesso!');
          setIsUploading(false);
          setTitle('');
          setFiles([]);
          setUploadProgress(0);
          refetch();
        },
        onError: (error) => {
          notificationService.apiError(error, 'Erro ao enviar exames');
          setUploadProgress(0);
        },
      },
    );
  };

  const getFileUrl = (fileUrl: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return `${baseUrl}/${fileUrl}`;
  };

  const handleView = (fileUrl: string) => {
    window.open(getFileUrl(fileUrl), '_blank');
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(getFileUrl(fileUrl));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      notificationService.error('Erro ao baixar arquivo');
    }
  };

  if (isLoading) {
    return <ExamsTabSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Galeria de Exames</CardTitle>
          <CardDescription>Radiografias, fotos e laudos em PDF.</CardDescription>
        </div>
        {!isUploading && (
          <Button size="sm" className="gap-2" onClick={() => setIsUploading(true)}>
            <FileUp className="h-4 w-4" />
            Subir Exame
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {isUploading ? (
          <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título do Exame/Documento</label>
              <Input
                placeholder="Ex: Panorâmica Inicial, Laudo de Biópsia"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Arquivos (JPG, PNG ou PDF)</label>
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                multiple
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files || []);
                  setFiles((prev) => [...prev, ...selectedFiles]);
                }}
              />
              {files.length > 0 && (
                <div className="mt-3 space-y-1">
                  {files.map((f, i) => {
                    const isImage = f.type.startsWith('image/');
                    const sizeKB = (f.size / 1024).toFixed(0);
                    return (
                      <div
                        key={`${f.name}-${i}`}
                        className="bg-muted/40 border-border/50 group hover:bg-muted/60 flex items-center gap-3 rounded-md border px-3 py-2 transition-colors"
                      >
                        <div className="shrink-0">
                          {isImage ? (
                            <ImageIcon className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <File className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <span className="flex-1 truncate text-sm">{f.name}</span>
                        <span className="text-muted-foreground shrink-0 text-[10px]">
                          {sizeKB} KB
                        </span>
                        <button
                          type="button"
                          onClick={() => setFiles((prev) => prev.filter((_, index) => index !== i))}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {isPending && uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="text-muted-foreground flex justify-between text-[10px]">
                  <span>Enviando...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1" />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsUploading(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleUpload} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileUp className="mr-2 h-4 w-4" />
                )}
                Upload
              </Button>
            </div>
          </div>
        ) : exams && exams.length > 0 ? (
          <div className="space-y-2">
            {(exams as ExamItem[]).map((exam) => {
              const isImage = exam.fileType?.includes('image');
              return (
                <div
                  key={exam.id}
                  className="border-border/60 bg-card hover:bg-muted/30 group flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors"
                >
                  <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                    {isImage ? (
                      <ImageIcon className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <File className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{exam.title}</div>
                    <div className="text-muted-foreground text-[11px]">
                      {exam.createdAt
                        ? format(new Date(exam.createdAt), 'dd/MM/yyyy', { locale: ptBR })
                        : 'Data desconhecida'}
                      {isImage ? ' · Imagem' : ' · Documento'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleView(exam.fileUrl)}
                      title="Visualizar"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(exam.fileUrl, exam.title)}
                      title="Baixar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center italic">
            <File className="h-10 w-10 opacity-20" />
            Nenhum exame anexado a este prontuário.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
