"use client";

import { useState } from "react";
import { FileUpload } from "@/components/upload/dropzone";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Navbar } from "@/components/layout/navbar";
import { Photo } from "@/types/photo";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, MapPin, Camera, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
    const [uploads, setUploads] = useState<{ file: File; status: "pending" | "uploading" | "success" | "error"; photo?: Photo }[]>([]);

    const handleFilesSelected = async (files: File[]) => {
        const newUploads = files.map(file => ({ file, status: "pending" as const }));
        setUploads(prev => [...prev, ...newUploads]);

        // Process immediately
        for (let i = 0; i < newUploads.length; i++) {
            await uploadFile(newUploads[i].file);
        }
    };

    const uploadFile = async (file: File) => {
        setUploads(prev => prev.map(u => u.file === file ? { ...u, status: "uploading" } : u));

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            setUploads(prev => prev.map(u => u.file === file ? { ...u, status: "success", photo: data.photo } : u));
        } catch (e) {
            setUploads(prev => prev.map(u => u.file === file ? { ...u, status: "error" } : u));
        }
    };

    return (
        <div className="min-h-screen pb-20">
            <AnimatedBackground />
            <Navbar />

            <main className="container mx-auto px-4 pt-28">
                <GlassCard className="max-w-3xl mx-auto mb-10">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Upload Photos</h1>
                        <p className="text-muted-foreground">
                            Add photos to your portfolio. EXIF data will be automatically extracted.
                        </p>
                    </div>

                    <FileUpload onFilesSelected={handleFilesSelected} />
                </GlassCard>

                <div className="max-w-3xl mx-auto space-y-4">
                    <AnimatePresence>
                        {uploads.map((upload, idx) => (
                            <motion.div
                                key={idx} // Using index as simple key for local state
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <GlassCard className="flex items-start gap-4 p-4">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                                        {upload.status === "uploading" && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                <Loader2 className="w-6 h-6 animate-spin text-white" />
                                            </div>
                                        )}
                                        <img src={URL.createObjectURL(upload.file)} alt="preview" className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-medium truncate">{upload.file.name}</h3>
                                            {upload.status === "success" && <span className="text-green-400 flex items-center gap-1 text-sm"><Check className="w-3 h-3" /> Uploaded</span>}
                                            {upload.status === "error" && <span className="text-red-400 flex items-center gap-1 text-sm"><AlertCircle className="w-3 h-3" /> Failed</span>}
                                        </div>

                                        {upload.photo && (
                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                                                {upload.photo.exif.model && (
                                                    <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                                                        <Camera className="w-3 h-3" />
                                                        {upload.photo.exif.model}
                                                    </span>
                                                )}
                                                {upload.photo.location && upload.photo.location !== "Unknown Location" && (
                                                    <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                                                        <MapPin className="w-3 h-3" />
                                                        {upload.photo.location}
                                                    </span>
                                                )}
                                                {upload.photo.exif.lens && (
                                                    <span className="px-2 py-1 rounded bg-white/5">
                                                        {upload.photo.exif.lens}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
