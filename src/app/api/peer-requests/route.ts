import { prisma } from '@/lib/prisma'

function toArray(v: unknown): string[] {
  if (!v) return []
  if (Array.isArray(v)) return v.filter(Boolean)
  return String(v).split(',').map(s => s.trim()).filter(Boolean)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const status = url.searchParams.get('status') // 'open' | 'in-progress' | ...
  const course = url.searchParams.get('course') // exact match or partial
  const search = url.searchParams.get('search')
  const tags = toArray(url.searchParams.getAll('tags'))

  const where: Record<string, unknown> = {}

  if (status) {
    // map UI status → enum
    const map: Record<string,string> = {
      'open':'OPEN','in-progress':'IN_PROGRESS',
      'completed':'COMPLETED','closed':'CLOSED'
    }
    where.status = map[status] ?? 'OPEN'
  }

  if (course) {
    // allow partial match for nicer UX
  where.course = { contains: course }
  }

  if (search) {
    where.OR = [
      { title:   { contains: search } },
      { content: { contains: search } },
      { tags: { some: { tag: { name: { contains: search }}} } }
    ]
  }

  if (tags.length) {
    // any of selected tags
    where.tags = { some: { tag: { name: { in: tags } } } }
  }

  const rows = await prisma.peerRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { tags: { include: { tag: true } } }
  })

  return Response.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  // allow status-only updates (e.g., closing a request)
  if (!body) return new Response('Missing body', { status: 400 })
  if (!body.status) {
    if (!body?.title?.trim() || !body?.content?.trim()) {
      return new Response('Title and content are required', { status: 400 })
    }
  }

  const tagNames: string[] = Array.isArray(body.tags) ? body.tags.slice() : []
  // If request is marked urgent, ensure we include an 'Urgent' tag
  if (body.isUrgent) {
    if (!tagNames.includes('Urgent')) tagNames.push('Urgent')
  }
  // ensure Tag rows exist
  const tagLinks = await Promise.all(tagNames.map(async (name) => {
    const t = await prisma.tag.upsert({ where: { name }, create: { name }, update: {}, select: { id: true } })
    return { tagId: t.id }
  }))

  const created = await prisma.peerRequest.create({
    data: {
      title: body.title,
      content: body.content,
      course: body.course || null,
      isUrgent: !!body.isUrgent,
      anonymous: !!body.anonymous,
      status: 'OPEN',
      tags: { create: tagLinks },
    },
    include: { tags: { include: { tag: true } } }
  })

  return Response.json(created, { status: 201 })
}

export async function DELETE(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })

  try {
    // delete tag links first (cascade not enabled in this schema)
    await prisma.tagOnRequest.deleteMany({ where: { requestId: id } })
    await prisma.peerRequest.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (err: unknown) {
    let msg = String(err)
    if (err && typeof err === 'object' && 'message' in err) {
      const m = (err as { message?: unknown }).message
      msg = typeof m === 'string' ? m : String(m)
    }
    return new Response(msg, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })

  // parse body robustly (req.json() can fail for empty or malformed bodies)
  let parsedBody: unknown = null
  try {
    parsedBody = await req.json()
  } catch {
    try {
      const txt = await req.text()
      parsedBody = txt ? JSON.parse(txt) : null
    } catch {
      parsedBody = null
    }
  }

  if (!parsedBody) return new Response('Missing body', { status: 400 })

  const body = parsedBody as Record<string, unknown>
  // allow status-only updates (e.g., closing a request)
  if (typeof body.status === 'undefined') {
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const content = typeof body.content === 'string' ? body.content.trim() : ''
    if (!title || !content) {
      return new Response('Title and content are required', { status: 400 })
    }
  }

  const tagNames: string[] = Array.isArray(body.tags) ? (body.tags as string[]).slice() : []
  if (body.isUrgent) {
    if (!tagNames.includes('Urgent')) tagNames.push('Urgent')
  }

  try {
    // prepare data object. If tags/title/content not provided (status-only), update only provided fields
    const data: Record<string, unknown> = {}
    if (typeof body.title !== 'undefined') data.title = body.title
    if (typeof body.content !== 'undefined') data.content = body.content
    if (typeof body.course !== 'undefined') data.course = body.course || null
    if (typeof body.isUrgent !== 'undefined') data.isUrgent = !!body.isUrgent
    if (typeof body.anonymous !== 'undefined') data.anonymous = !!body.anonymous
    if (typeof body.status !== 'undefined') data.status = body.status

    // If tags present, upsert and replace tag links
  if (Array.isArray(tagNames) && tagNames.length) {
      const tagLinks = await Promise.all(tagNames.map(async (name) => {
        const t = await prisma.tag.upsert({ where: { name }, create: { name }, update: {}, select: { id: true } })
        return { tagId: t.id }
      }))
      await prisma.tagOnRequest.deleteMany({ where: { requestId: id } })
      data.tags = { create: tagLinks }
    }

    const updated = await prisma.peerRequest.update({
      where: { id },
      data,
      include: { tags: { include: { tag: true } } }
    })

    return Response.json(updated)
  } catch (err: unknown) {
    let msg = String(err)
    if (err && typeof err === 'object' && 'message' in err) {
      const m = (err as { message?: unknown }).message
      msg = typeof m === 'string' ? m : String(m)
    }
    return new Response(msg, { status: 500 })
  }
}
