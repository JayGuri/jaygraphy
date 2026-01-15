"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Loader2, Copy, Check, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { Photo } from "@/types/photo"

export default function AnalyzePage() {
    const [isDragging, setIsDragging] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<Partial<Photo> | null>(null)
    const [copied, setCopied] = useState(false)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith("image/")) {
            handleImageSelect(file)
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleImageSelect(file)
        }
    }

    const handleImageSelect = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            setSelectedImage(e.target?.result as string)
            setResult(null)
        }
        reader.readAsDataURL(file)
    }

    const analyzeImage = () => {
        setIsAnalyzing(true)

        // Simulate API call / AI processing time based on image
        setTimeout(() => {
            // Mock Response fitting the Mumbai/Sony shooter persona
            const mockAnalysis: Partial<Photo> = {
                id: "auto-generated-" + Date.now(),
                title: "Mumbai Golden Hour",
                category: "street",
                location: "Predicted: Mumbai, Maharashtra",
                description: "A vibrant street scene capturing the chaotic energy of the city during the golden hour. Shadows are long, and the light is warm.",
                exif: {
                    camera: "Sony a6400 (Likely)",
                    lens: "18-135mm F3.5-5.6",
                    aperture: "f/4.5",
                    shutter: "1/200s",
                    iso: "400"
                }
            }
            setResult(mockAnalysis)
            setIsAnalyzing(false)
        }, 2500)
    }

    const copyToClipboard = () => {
        if (result) {
            navigator.clipboard.writeText(JSON.stringify(result, null, 2))
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="container mx-auto px-4 py-16 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">AI Image Analyzer</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Upload a shot to generate metadata, titles, and stories automatically using computer vision.
                        <br />
                        <span className="text-sm opacity-70">(Currently functioning in demo/mock mode without API key)</span>
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-start">
                    {/* Upload Area */}
                    <div className="space-y-6">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all
                ${isDragging ? "border-accent bg-accent/10" : "border-border hover:border-accent/50 hover:bg-secondary/30"}
                ${selectedImage ? "border-solid" : ""}
              `}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileInput}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />

                            {selectedImage ? (
                                <div className="relative w-full h-full rounded-lg overflow-hidden">
                                    <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-medium z-20 pointer-events-none">
                                        Click or Drop to Change
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-4 pointer-events-none">
                                    <div className="p-4 rounded-full bg-secondary inline-flex">
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Upload an image</h3>
                                        <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={analyzeImage}
                            disabled={!selectedImage || isAnalyzing}
                            className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing Scene...
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="w-5 h-5" />
                                    Analyze Photo
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results Area */}
                    <div className="relative min-h-[400px]">
                        <AnimatePresence>
                            {result ? (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6"
                                >
                                    <div className="flex items-center justify-between pb-4 border-b border-border">
                                        <h3 className="font-bold text-lg">Analysis Result</h3>
                                        <button
                                            onClick={copyToClipboard}
                                            className="p-2 hover:bg-secondary rounded-md transition-colors text-muted-foreground hover:text-foreground"
                                            title="Copy JSON"
                                        >
                                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs font-mono uppercase text-muted-foreground">Title Suggestion</span>
                                            <p className="text-xl font-bold">{result.title}</p>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <span className="text-xs font-mono uppercase text-muted-foreground">Category</span>
                                                <div className="mt-1 inline-block px-2 py-1 bg-accent/10 text-accent rounded text-xs font-bold uppercase">
                                                    {result.category}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs font-mono uppercase text-muted-foreground">Location</span>
                                                <p className="font-medium">{result.location}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-xs font-mono uppercase text-muted-foreground">Story / Caption</span>
                                            <p className="text-muted-foreground italic">&quot;{result.description}&quot;</p>
                                        </div>

                                        <div className="bg-secondary/30 p-4 rounded-lg">
                                            <span className="text-xs font-mono uppercase text-muted-foreground block mb-2">Estimated EXIF</span>
                                            <div className="grid grid-cols-2 gap-y-2 text-sm font-mono">
                                                <div>
                                                    <span className="text-muted-foreground">Cam: </span>
                                                    {result.exif?.camera}
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Lens: </span>
                                                    {result.exif?.lens}
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">ƒ: </span>
                                                    {result.exif?.aperture}
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">ISO: </span>
                                                    {result.exif?.iso}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <pre className="text-[10px] text-muted-foreground bg-black/5 p-4 rounded overflow-auto max-h-32">
                                            {JSON.stringify(result, null, 2)}
                                        </pre>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-border/50 rounded-2xl bg-secondary/5 text-muted-foreground/50 text-center p-8">
                                    <div>
                                        <p className="mb-2">No analysis yet.</p>
                                        <p className="text-sm">Upload an image and hit analyze to see the magic.</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
