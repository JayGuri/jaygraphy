"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void;
    isUploading?: boolean;
}

export function FileUpload({ onFilesSelected, isUploading = false }: FileUploadProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onFilesSelected(acceptedFiles);
            }
        },
        [onFilesSelected]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".webp", ".heic"],
        },
        disabled: isUploading,
        multiple: true,
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "relative group cursor-pointer border-2 border-dashed rounded-xl p-12 transition-all duration-300",
                isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                isUploading && "pointer-events-none opacity-50"
            )}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-center gap-4">
                <div className={cn(
                    "p-4 rounded-full bg-muted transition-colors",
                    isDragActive ? "bg-primary/20 text-primary" : "text-muted-foreground group-hover:text-primary"
                )}>
                    <Upload className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-medium">
                        {isDragActive ? "Drop photos here" : "Drag & drop photos"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        or click to browse from your device
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/75">
                    <span className="bg-muted px-2 py-1 rounded">JPG</span>
                    <span className="bg-muted px-2 py-1 rounded">PNG</span>
                    <span className="bg-muted px-2 py-1 rounded">WebP</span>
                </div>
            </div>
        </div>
    );
}
