import path from 'path'
import fs from 'fs'
import { pipeline } from 'stream/promises'
import { MultipartFile } from '@fastify/multipart'

// tujuan penyimpanan file — harus konsisten dengan path di app.ts
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// tipe file gambar
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function saveImage(file: MultipartFile) {
    // validasi tipe mime
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new Error(`Invalid file type. Only images are allowed:${file.mimetype}. use JPG, PNG, or WebP`)
    }

    // buat folder uploads jika belum adad
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }

    // generate nama file unik dan sanitize (hapus spasi agar tidak error URL)
    const sanitizedFilename = file.filename.replace(/\s+/g, '_')
    const filename = `${Date.now()}-${sanitizedFilename}`
    const filePath = path.join(UPLOAD_DIR, filename)

    // simpan file
    await pipeline(
        file.file,
        fs.createWriteStream(filePath)
    )

    // return path file
    return `/uploads/${filename}`
}

