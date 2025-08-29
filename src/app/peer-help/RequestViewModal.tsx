import { Question } from '@/lib/types'
import { getTimeAgo, getUserInitials } from '@/lib/utils'

interface RequestViewModalProps {
  question: Question
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const statusConfig: Record<string, { label: string; badge: string; icon: string }> = {
  open: { label: 'Open', badge: 'bg-yellow-100 text-yellow-800', icon: '⭐' },
  'in-progress': { label: 'In Progress', badge: 'bg-blue-100 text-blue-800', icon: '🔄' },
  completed: { label: 'Completed', badge: 'bg-green-100 text-green-800', icon: '✅' },
  closed: { label: 'Closed', badge: 'bg-gray-100 text-gray-800', icon: '❌' },
}

export default function RequestViewModal({ question, onClose, onEdit, onDelete }: RequestViewModalProps) {
  const firstTag = question.tags && question.tags.length > 0 ? question.tags[0] : 'General'
  const isAnonymous = question.author?.id === 'anon' || question.author?.name === 'Anonymous'
  const statusInfo = statusConfig[question.status]

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-50 flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {question.isUrgent && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Urgent</span>
                )}
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{firstTag}</span>
              </div>

              <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${statusInfo.badge}`}>
                <span aria-hidden>{statusInfo.icon}</span>
                <span>{statusInfo.label}</span>
              </div>
            </div>

            <h3 className="font-semibold text-slate-900 mb-2 text-lg break-words whitespace-normal">{question.title}</h3>
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{question.content}</p>

            {question.course && (
              <div className="mb-3 text-sm text-gray-600">Course: <span className="font-medium text-slate-800">{question.course}</span></div>
            )}

            <div className="mb-4">
              <div className="text-sm text-gray-700 mb-2">Tags</div>
              <div className="flex flex-wrap gap-2">
                {question.tags && question.tags.length > 0 ? (
                  question.tags.map(t => (
                    <span key={t} className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">{t}</span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No tags</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                {isAnonymous ? (
                  <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-sm text-gray-700">👤</div>
                ) : (
                  <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-semibold text-slate-800">{getUserInitials(question.author.name)}</div>
                )}

                <div className="text-left">
                  <div className="text-sm text-slate-800 leading-none">{isAnonymous ? 'Anonymous' : question.author.name}</div>
                  <div className="text-xs text-gray-500">{getTimeAgo(question.createdAt)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500 flex items-center gap-2">💬 <span className="font-medium">{question.responseCount}</span></div>
                {onEdit && <button type="button" onClick={onEdit} className="text-blue-600 hover:text-blue-700 text-xs font-medium">Edit</button>}
                {onDelete && <button type="button" onClick={onDelete} className="text-red-600 hover:text-red-700 text-xs font-medium">Delete</button>}
                <button type="button" onClick={onClose} className="px-3 py-1 bg-gray-100 rounded text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
