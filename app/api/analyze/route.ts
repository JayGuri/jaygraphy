import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, unlinkSync } from 'fs'
import path from 'path'
import { classifyImage } from '@/lib/image-classifier'

export async function POST(req: NextRequest) {
    let tempPath: string | null = null
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

        const buffer = Buffer.from(await file.arrayBuffer())
        tempPath = path.join(process.cwd(), 'public', 'temp-analyze.jpg')
        writeFileSync(tempPath, buffer)

        const result = await classifyImage(tempPath)

        return NextResponse.json({
            category: result.category,
            tags: result.tags,
            confidence: result.confidence ?? null
        })
    } catch (error) {
        console.error('Analysis failed:', error)
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    } finally {
        if (tempPath) { try { unlinkSync(tempPath) } catch { } }
    }
}
