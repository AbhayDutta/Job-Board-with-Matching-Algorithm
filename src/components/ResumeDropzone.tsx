"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { useRouter } from "next/navigation";
import { uploadResumeAction } from "@/app/actions/candidate";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ResumeDropzoneProps {
  onSuccess?: (profile: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  currentResumeUrl?: string | null;
}

export default function ResumeDropzone({ onSuccess, currentResumeUrl }: ResumeDropzoneProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setUploading(true);
    setUploadProgress(25);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 200);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await uploadResumeAction(formData);
      clearInterval(interval);
      setUploadProgress(100);

      if (res.success) {
        const msg = res.fallback
          ? "Resume uploaded! Some fields could not be auto-parsed — please verify below."
          : "Resume uploaded and parsed successfully!";
        toast.success(msg);
        if (onSuccess && res.profile) {
          onSuccess(res.profile);
        }
        router.refresh();
      } else {
        toast.error(res.error || "Failed to parse resume.");
      }
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      toast.error("An unexpected error occurred during file upload.");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setSelectedFile(null);
        setUploadProgress(0);
      }, 800);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === "file-too-large") {
        toast.error("File size exceeds 4.5MB Vercel serverless limit.");
      } else if (rejection.errors[0]?.code === "file-invalid-type") {
        toast.error("Invalid file format. Please upload PDF or DOCX files.");
      } else {
        toast.error(rejection.errors[0]?.message || "File upload rejected.");
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
    },
    maxSize: Math.floor(4.5 * 1024 * 1024), // 4.5MB Vercel limit
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative min-h-[160px] rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 cursor-pointer select-none flex flex-col items-center justify-center ${
          isDragActive
            ? "border-foreground bg-secondary/40 shadow-match-glow scale-[1.01]"
            : "border-border/80 bg-background hover:bg-secondary/15 hover:border-foreground/40"
        }`}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {uploading && selectedFile ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full space-y-3 max-w-xs mx-auto"
            >
              <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-xl border border-border">
                <FileText className="h-8 w-8 text-foreground shrink-0" />
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-semibold text-foreground truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono font-semibold text-muted-foreground">
                  <span>Parsing with Gemini AI...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-foreground rounded-full"
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-3"
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-foreground border border-border shadow-xs">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground font-sans">
                  {isDragActive ? "Drop resume file here..." : "Drag & drop your resume, or browse"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                  Supports PDF or DOCX files up to 10MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {currentResumeUrl && (
        <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 text-xs">
          <div className="flex items-center gap-2 font-mono text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate max-w-[240px]">
              Synced: {currentResumeUrl.split("/").pop() || "resume.pdf"}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
            Vector Active
          </span>
        </div>
      )}
    </div>
  );
}
