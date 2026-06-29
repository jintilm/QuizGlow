import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, File, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/GlassCard';
import { Image } from '@/components/ui/image';
import { MOCK_IMPORT_PAGES } from '@/data/import-page';
import { cn } from '@/lib/utils';

interface UploadSectionProps {
  onFileSelected?: (file: File) => void;
  isParsing?: boolean;
  parseProgress?: number;
  parseStep?: string;
}

export default function UploadSection({
  onFileSelected,
  isParsing = false,
  parseProgress = 0,
  parseStep = '',
}: UploadSectionProps) {
  const pageData = MOCK_IMPORT_PAGES[0];
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = useCallback(
    (file: File) => {
      const validExtensions = ['.doc', '.docx', '.pdf'];
      const name = file.name.toLowerCase();
      const isValid = validExtensions.some((ext) => name.endsWith(ext));
      if (!isValid) {
        toast.error('不支持的文件格式，请上传 Word 或 PDF 文档');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error('文件大小不能超过 50MB');
        return;
      }
      setSelectedFile(file);
      onFileSelected?.(file);
    },
    [onFileSelected],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isParsing) setIsDragging(true);
  }, [isParsing]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (isParsing) return;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        validateAndSetFile(files[0]);
      }
    },
    [validateAndSetFile, isParsing],
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        validateAndSetFile(files[0]);
      }
    },
    [validateAndSetFile],
  );

  const handleClick = useCallback(() => {
    if (!isParsing) {
      fileInputRef.current?.click();
    }
  }, [isParsing]);

  const handleRemoveFile = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isParsing) return;
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [isParsing],
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB';
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB';
  };

  return (
    <GlassCard variant="elevated" size="lg" glow className="h-full">
      <div className="space-y-6">
        {/* 标题区 */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">
            {pageData.uploadTitle}
          </h2>
          <p className="text-sm text-muted-foreground">
              {pageData.uploadSubtitle}
            </p>
          </div>

        {/* 上传区域 */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300',
            'min-h-[240px] flex flex-col items-center justify-center gap-4 px-6 py-8',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border/60 hover:border-primary/40 hover:bg-primary/[0.02]',
            isParsing && 'cursor-not-allowed opacity-80',
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".doc,.docx,.pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={isParsing}
          />

          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div
                key="file-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
                  <div className="relative size-16 rounded-2xl bg-gradient-to-br from-primary/90 to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                    <FileText className="size-8 text-primary-foreground" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                {!isParsing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="mt-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="size-4" />
                    移除文件
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
              key="upload-cta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative size-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                  <Upload className="size-8 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  拖拽文件到此处，或点击选择文件
                </p>
                <p className="text-sm text-muted-foreground">
                  支持 {pageData.supportedFormats.join(' / ')} 格式，最大 50MB</p>
              </div>
              <Button
                variant="default"
                size="sm"
                className="mt-2"
                disabled={isParsing}
              >
                  选择文件
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 解析进度条 */}
          <AnimatePresence>
            {isParsing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/80 to-transparent"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  {parseStep || '正在解析...'}
                </span>
                <span className="font-medium text-primary">{Math.round(parseProgress)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${parseProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* 格式说明 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">格式说明</h3>
            <Badge variant="secondary" className="text-[10px]">
              识别率更高
            </Badge>
          </div>
          <ul className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
            {pageData.formatTips.map((tip, i) => (
              <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-start gap-2"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary/70" />
              <span>{tip}</span>
            </motion.li>
          ))}
          </ul>
        </div>

        {/* 支持格式徽章 */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {pageData.supportedFormats.map((fmt) => (
            <div
              key={fmt}
              className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/50 px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <File className="size-3.5 text-primary/70" />
              {fmt}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
