import { execSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

async function run() {
  try {
    console.log('> Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })

    console.log('> Running prisma/seed.ts')
    const seedPath = pathToFileURL(new URL('../prisma/seed.ts', import.meta.url).pathname)
    await import(seedPath.href)
    console.log('> Seed finished')
    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

run()
