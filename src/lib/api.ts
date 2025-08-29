export type CreatePeerRequestInput = {
  title: string
  content: string
  course?: string
  tags: string[]
  isUrgent: boolean
  anonymous?: boolean
}

export async function createPeerRequest(input: CreatePeerRequestInput) {
  const res = await fetch('/api/peer-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchPeerRequests(params: {
  status?: string
  course?: string
  tags?: string[]
  search?: string
}) {
  const q = new URLSearchParams()
  if (params.status) q.set('status', params.status)
  if (params.course) q.set('course', params.course)
  if (params.search) q.set('search', params.search)
  if (params.tags?.length) params.tags.forEach(t => q.append('tags', t))

  const res = await fetch(`/api/peer-requests?${q.toString()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deletePeerRequest(id: string) {
  const res = await fetch(`/api/peer-requests?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(await res.text())
  return res
}

export async function updatePeerRequest(id: string, input: CreatePeerRequestInput) {
  const res = await fetch(`/api/peer-requests?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function closePeerRequest(id: string) {
  const res = await fetch(`/api/peer-requests?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'CLOSED' }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
