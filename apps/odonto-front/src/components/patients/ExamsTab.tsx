'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/config';
import { useExamsControllerFindAllByPatient } from '@/generated/hooks/useExamsControllerFindAllByPatient';
import { useExamsControllerUpload } from '@/generated/hooks/useExamsControllerUpload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { FileUp, File, Image as ImageIcon, Trash2, Loader2, Download, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { notificationService } from '@/services/notification.service';
import { ExamsTabSkeleton } from '@/components/skeletons';

export function ExamsTab({ patientId }: { patientId: number }) {
    const { data: exams, isLoading, refetch } = useExamsControllerFindAllByPatient(patientId);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { mutate: uploadExam, isPending } = useExamsControllerUpload({
        client: {
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
                setUploadProgress(percentCompleted);
            }
        }
    });
    const [isUploading, setIsUploading] = useState(false);

    const [title, setTitle] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    const handleUpload = () => {
        if (!title || files.length === 0) {
            notificationService.error('Título e pelo menos um arquivo são obrigatórios');
            return;
        }

        uploadExam({
            data: {
                title,
                patientId,
                files: files as unknown as Blob[],
            }
        }, {
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
            }
        });
    };

    const getFileUrl = (fileUrl: string) => {
        const baseUrl = API_URL;
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
        } catch (error) {
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
                    <div className="space-y-4 border p-4 rounded-lg bg-muted/30">
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
                                    setFiles(prev => [...prev, ...selectedFiles]);
                                }}
                            />
                            {files.length > 0 && (
                                <div className="mt-3 space-y-1">
                                    {files.map((f, i) => {
                                        const isImage = f.type.startsWith('image/');
                                        const sizeKB = (f.size / 1024).toFixed(0);
                                        return (
                                            <div key={`${f.name}-${i}`} className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/40 border border-border/50 group hover:bg-muted/60 transition-colors">
                                                <div className="flex-shrink-0">
                                                    {isImage ? (
                                                        <ImageIcon className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <File className="h-4 w-4 text-blue-500" />
                                                    )}
                                                </div>
                                                <span className="flex-1 text-sm truncate">{f.name}</span>
                                                <span className="text-[10px] text-muted-foreground flex-shrink-0">{sizeKB} KB</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setFiles(prev => prev.filter((_, index) => index !== i))}
                                                    className="flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>Enviando...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-1" />
                            </div>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={() => setIsUploading(false)}>Cancelar</Button>
                            <Button size="sm" onClick={handleUpload} disabled={isPending}>
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileUp className="h-4 w-4 mr-2" />}
                                Upload
                            </Button>
                        </div>
                    </div>
                ) : exams && exams.length > 0 ? (
                    <div className="space-y-2">
                        {(exams as any[]).map((exam: any) => {
                            const isImage = exam.fileType?.includes('image');
                            return (
                                <div
                                    key={exam.id}
                                    className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-colors group"
                                >
                                    <div className="flex-shrink-0 h-9 w-9 rounded-md bg-muted flex items-center justify-center">
                                        {isImage ? (
                                            <ImageIcon className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <File className="h-4 w-4 text-blue-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">{exam.title}</div>
                                        <div className="text-[11px] text-muted-foreground">
                                            {exam.createdAt ? format(new Date(exam.createdAt), "dd/MM/yyyy", { locale: ptBR }) : 'Data desconhecida'}
                                            {isImage ? ' · Imagem' : ' · Documento'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <div className="py-12 text-center text-muted-foreground italic flex flex-col items-center gap-2">
                        <File className="h-10 w-10 opacity-20" />
                        Nenhum exame anexado a este prontuário.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
