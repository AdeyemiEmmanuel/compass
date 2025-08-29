import { Question } from '@/lib/types'
import { getTimeAgo, getUserInitials } from '@/lib/utils'

interface QuestionCardProps {
  question: Question
  onEdit?: () => void
  onView?: () => void
  onDelete?: () => void
  onCloseRequest?: () => void
}

// No more explicit help type; use tags for categorization. We'll display the first tag as a badge when available.

const statusConfig = {
  'open': { label: 'Open', badge: 'bg-yellow-100 text-yellow-800', icon: '⭐' },
  'in-progress': { label: 'In Progress', badge: 'bg-blue-100 text-blue-800', icon: '🔄' },
  'completed': { label: 'Completed', badge: 'bg-green-100 text-green-800', icon: '✅' },
  'closed': { label: 'Closed', badge: 'bg-gray-100 text-gray-800', icon: '❌' }
}

export default function QuestionCard({ question, onEdit, onDelete, onView, onCloseRequest }: QuestionCardProps) {
  const statusInfo = statusConfig[question.status]
  const firstTag = question.tags && question.tags.length > 0 ? question.tags[0] : 'General'
  const isAnonymous = question.author?.id === 'anon' || question.author?.name === 'Anonymous'

  const truncate = (s: string | undefined, max = 160) => {
    if (!s) return ''
    return s.length > max ? s.slice(0, max).trimEnd() + '...' : s
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow min-w-0">
      {/* top row: tag (left) and status (right) */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
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

      {/* title + excerpt */}
      <h3 className="font-semibold text-slate-900 mb-1 text-sm break-words whitespace-normal overflow-hidden min-w-0">
        {truncate(question.title, 80)}
      </h3>
  <p className="text-gray-600 text-xs mb-3 break-words whitespace-normal overflow-hidden">{truncate(question.content, 160)}</p>

      {/* footer: author + time left, actions right */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
  <div className="flex items-center gap-3 min-w-0">
          {isAnonymous ? (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm text-gray-700">👤</div>
          ) : (
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-semibold text-slate-800">{getUserInitials(question.author.name)}</div>
          )}

          <div className="text-left min-w-0 overflow-hidden">
            <div className="text-sm text-slate-800 leading-none truncate">{isAnonymous ? 'Anonymous' : question.author.name}</div>
            <div className="text-xs text-gray-500 truncate">{getTimeAgo(question.createdAt)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 flex items-center gap-2">💬 <span className="font-medium">{question.responseCount}</span></div>
          <button type="button" onClick={onView} className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">View</button>

          {/* Only show Edit/Close when the request is not closed */}
          {question.status !== 'closed' && (
            <>
              <button type="button" onClick={onEdit} className="text-blue-600 hover:text-blue-700 text-xs font-medium">Edit</button>
              <button type="button" onClick={onCloseRequest} className="text-gray-700 hover:text-gray-900 text-xs font-medium">Close</button>
            </>
          )}

          <button type="button" onClick={onDelete} className="text-red-600 hover:text-red-700 text-xs font-medium">Delete</button>
        </div>
      </div>
    </div>
  )
}
