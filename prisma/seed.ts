import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const tags = [
  'Assignment Help','Study Group','Topic Explanation','Career Advice',
  'Resume Review','Labs','Exam Prep','General'
]

async function main() {
  for (const name of tags) {
    await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {},
    })
  }
}
main().finally(()=>prisma.$disconnect())
