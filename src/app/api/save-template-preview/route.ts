import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { dataUrl, filename } = await req.json();

        if (!dataUrl || !filename) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        // Remove header (data:image/png;base64,)
        const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // Path to public folder
        const publicDir = path.join(process.cwd(), 'public', 'templates', 'previews');

        // Ensure directory exists
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        const filePath = path.join(publicDir, filename);

        // Write file
        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({ success: true, path: filePath });

    } catch (error) {
        console.error('Error saving image:', error);
        return NextResponse.json({ error: 'Failed to save image' }, { status: 500 });
    }
}
