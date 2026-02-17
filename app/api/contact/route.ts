import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const MESSAGES_FILE = path.join(process.cwd(), 'data', 'messages.json')

function ensureMessagesFile() {
    const dir = path.dirname(MESSAGES_FILE)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(MESSAGES_FILE)) {
        fs.writeFileSync(MESSAGES_FILE, '[]', 'utf-8')
    }
}

export async function POST(req: NextRequest) {
    try {
        const { name, email, message } = await req.json()

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        ensureMessagesFile()
        const fileContent = fs.readFileSync(MESSAGES_FILE, 'utf-8')
        let existing = []
        try {
            existing = JSON.parse(fileContent)
        } catch (e) {
            // If file is corrupted or empty, start fresh
            existing = []
        }

        if (!Array.isArray(existing)) {
            existing = []
        }

        existing.push({ id: Date.now(), name, email, message, receivedAt: new Date().toISOString() })
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(existing, null, 2))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving message:', error)
        return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }
}
