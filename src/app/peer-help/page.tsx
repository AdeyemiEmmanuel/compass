 'use client'

import { useEffect, useMemo, useState } from 'react'
import QuestionCard from './QuestionCard'
import FilterBar from './FilterBar'
import RequestHelpForm, { RequestHelpFormData } from './RequestHelpForm'
import RequestViewModal from './RequestViewModal'
import { fetchPeerRequests, createPeerRequest, deletePeerRequest, updatePeerRequest, closePeerRequest } from '@/lib/api'
import { Question, User } from '@/lib/types'
type ApiRow = {
  id: string
  title: string
  content: string
  status: string
  course?: string | null
  isUrgent?: boolean
  anonymous?: boolean
  createdAt: string | Date
  updatedAt: string | Date
  tags?: { tag: { name: string } }[]
}

interface Filters {
  status?: 'open' | 'in-progress' | 'completed' | 'closed'
  course?: string
  tags?: string[]
  search?: string
  myRequests?: boolean
}

export default function PeerHelpPage() {
  const [filters, setFilters] = useState<Filters>({})
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false)
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null)
  const [requests, setRequests] = useState<Question[]>([])
  const [viewRequest, setViewRequest] = useState<Question | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load from API whenever filters change
  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    fetchPeerRequests(filters)
      .then((rows) => {
        if (!mounted) return
        setRequests(rows.map(mapApiRowToQuestion))
      })
      .catch((e) => mounted && setError(String(e)))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [JSON.stringify(filters)]) // stringify to avoid stale deps

  const handleFormSubmit = async (data: RequestHelpFormData) => {
    if (editingRequestId) {
      await updatePeerRequest(editingRequestId, {
        title: data.title,
        content: data.content,
        course: data.course || undefined,
        tags: data.tags || [],
        isUrgent: data.isUrgent,
        anonymous: !!data.anonymous,
      })
      setEditingRequestId(null)
    } else {
      await createPeerRequest({
        title: data.title,
        content: data.content,
        course: data.course || undefined,
        tags: data.tags || [],
        isUrgent: data.isUrgent,
        anonymous: !!data.anonymous,
      })
    }
    setIsRequestFormOpen(false)
    // refresh list with current filters
    const rows = await fetchPeerRequests(filters)
    setRequests(rows.map(mapApiRowToQuestion))
  }

  // NOTE: auth isn't hooked up yet. Replace this with real current user id when available.
  const CURRENT_USER_ID = 'n/a'

  // Apply client-side 'myRequests' filter if requested. This is best-effort until server-side filtering is implemented.
  const filteredRequests = useMemo(() => {
    const f = filters as unknown as { myRequests?: boolean }
    if (f.myRequests) return requests.filter(r => r.author?.id === CURRENT_USER_ID)
    return requests
  }, [requests, JSON.stringify(filters)])

  const openRequests  = useMemo(() => filteredRequests.filter(r => r.status === 'open'), [filteredRequests])
  const closedRequests = useMemo(() => filteredRequests.filter(r => r.status !== 'open'), [filteredRequests])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... header ... */}

      <FilterBar
        onFilterChange={(patch) => {
          if (Object.keys(patch).length === 0) setFilters({})
          else setFilters(prev => ({ ...prev, ...patch }))
        }}
  onRequestHelp={() => { setEditingRequestId(null); setIsRequestFormOpen(true) }}
      />

      <RequestHelpForm
        isOpen={isRequestFormOpen}
  onClose={() => { setIsRequestFormOpen(false); setEditingRequestId(null) }}
  onSubmit={handleFormSubmit}
        initialData={
          editingRequestId
            ? (() => {
                const rq = requests.find(r => r.id === editingRequestId)
                if (!rq) return undefined
                return {
                  title: rq.title,
                  content: rq.content,
                  course: rq.course || '',
                  tags: rq.tags || [],
                  isUrgent: rq.isUrgent,
                  anonymous: rq.author?.id === 'anon' || rq.author?.name === 'Anonymous'
                }
              })()
            : undefined
        }
      />

      <div className="px-8 py-6">
  {error && <p className="text-red-600">{error}</p>}

        {/* Open */}
        {/* ... keep your existing section markup that renders QuestionCard ... */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Open</h2>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">{openRequests.length}</span>
          </div>

          {openRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {openRequests.map((request) => (
                <QuestionCard
                  key={request.id}
                  question={request}
                  onView={() => setViewRequest(request)}
                  onEdit={() => {
                    setEditingRequestId(request.id)
                    setIsRequestFormOpen(true)
                  }}
                  onCloseRequest={async () => {
                    try {
                      // optimistic: mark closed locally
                      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'closed' } : r))
                      await closePeerRequest(request.id)
                    } catch (e) {
                      console.error('Failed to close request', e)
                      const rows = await fetchPeerRequests(filters)
                      setRequests(rows.map(mapApiRowToQuestion))
                    }
                  }}
                  onDelete={async () => {
                    try {
                      // optimistic UI
                      setRequests(prev => prev.filter(r => r.id !== request.id))
                      await deletePeerRequest(request.id)
                    } catch (e) {
                      // revert on error (silent) and log
                      console.error('Failed to delete request', e)
                      const rows = await fetchPeerRequests(filters)
                      setRequests(rows.map(mapApiRowToQuestion))
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500 mb-2">No open requests found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters or be the first to ask!</p>
            </div>
          )}
        </div>

        {/* Closed */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Closed</h2>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">{closedRequests.length}</span>
          </div>

          {closedRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {closedRequests.map((request) => (
                <QuestionCard
                  key={request.id}
                  question={request}
                  onView={() => setViewRequest(request)}
                  onEdit={() => {
                    setEditingRequestId(request.id)
                    setIsRequestFormOpen(true)
                  }}
                  onCloseRequest={async () => {
                    try {
                      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'closed' } : r))
                      await closePeerRequest(request.id)
                    } catch (e) {
                      console.error('Failed to close request', e)
                      const rows = await fetchPeerRequests(filters)
                      setRequests(rows.map(mapApiRowToQuestion))
                    }
                  }}
                  onDelete={async () => {
                    try {
                      setRequests(prev => prev.filter(r => r.id !== request.id))
                      await deletePeerRequest(request.id)
                    } catch (e) {
                      console.error('Failed to delete request', e)
                      const rows = await fetchPeerRequests(filters)
                      setRequests(rows.map(mapApiRowToQuestion))
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No closed requests found</p>
            </div>
          )}
        </div>
      </div>
      {viewRequest && (
        <RequestViewModal
          question={viewRequest}
          onClose={() => setViewRequest(null)}
          onDelete={async () => {
            try {
              setRequests(prev => prev.filter(r => r.id !== viewRequest.id))
              await deletePeerRequest(viewRequest.id)
              setViewRequest(null)
            } catch (e) {
              console.error('Failed to delete request', e)
              const rows = await fetchPeerRequests(filters)
              setRequests(rows.map(mapApiRowToQuestion))
            }
          }}
        />
      )}
    </div>
  )
}

/** Map API → your UI type expected by QuestionCard */
function mapApiRowToQuestion(row: ApiRow): Question {
  const statusMap: Record<string,'open'|'in-progress'|'completed'|'closed'> = {
    OPEN: 'open', IN_PROGRESS: 'in-progress', COMPLETED: 'completed', CLOSED: 'closed'
  }
  const author: User = row.anonymous
    ? { id: 'anon', name: 'Anonymous', email: '' }
    : { id: 'n/a', name: 'Peer', email: '' } // replace with real user when you add auth

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    status: statusMap[row.status] ?? 'open',
    course: row.course ?? undefined,
    isUrgent: !!row.isUrgent,
    author,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    responseCount: 0,
  tags: (row.tags ?? []).map((tr) => tr.tag.name),
  }
}