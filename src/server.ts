import { buildApp } from './app'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
    console.log('Starting server...')
    const app = await buildApp()
    console.log('App built, listening...')
    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Server running at http://localhost:3000')
}

main().catch(console.error)