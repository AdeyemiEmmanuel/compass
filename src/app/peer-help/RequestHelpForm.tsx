 'use client'

import { useEffect, useState, useRef } from 'react'

interface RequestHelpFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RequestHelpFormData) => void
  // optional initial data when editing an existing request
  initialData?: Partial<RequestHelpFormData>
  readOnly?: boolean
}

export interface RequestHelpFormData {
  title: string
  content: string
  course?: string
  tags: string[]
  isUrgent: boolean
  anonymous?: boolean
}

// Predefined tags users can select (multi-select)
const predefinedTags = [
  'Assignment Help',
  'Study Group',
  'Topic Explanation',
  'Career Advice',
  'Resume Review',
  'Labs',
  'Exam Prep',
  'General'
]

const courses = [
  'CS 101 - Intro Programming',
  'CS 201 - Data Structures',
  'MATH 201 - Calculus II',
  'ENG 102 - Composition',
  'CHEM 150 - General Chemistry',
  'STAT 300 - Statistics',
  'PHYS 201 - Physics I',
  'Other'
]

export default function RequestHelpForm({ isOpen, onClose, onSubmit, initialData, readOnly = false }: RequestHelpFormProps) {
  const [formData, setFormData] = useState<RequestHelpFormData>({
    title: '',
    content: '',
    course: '',
    tags: [],
    isUrgent: false,
    anonymous: false
  })

  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showCourseDropdown, setShowCourseDropdown] = useState(false)
  const [selectedCourseInput, setSelectedCourseInput] = useState(formData.course || '')
  const courseRef = useRef<HTMLDivElement | null>(null)

  // If initialData is provided (edit mode), populate form when the modal opens
  useEffect(() => {
    if (!isOpen) return

    if (initialData) {
      // edit mode: populate fields
      setFormData({
        title: initialData.title ?? '',
        content: initialData.content ?? '',
        course: initialData.course ?? '',
        tags: initialData.tags ?? [],
        isUrgent: initialData.isUrgent ?? false,
        anonymous: initialData.anonymous ?? false,
      })
      setSelectedCourseInput(initialData.course ?? '')
    } else {
      // new request: ensure form is empty each time modal opens
      setFormData({ title: '', content: '', course: '', tags: [], isUrgent: false, anonymous: false })
      setSelectedCourseInput('')
      setTagInput('')
      setErrors({})
      setShowCourseDropdown(false)
    }
  }, [isOpen, initialData])

  // Defensive sync: if initialData specifies anonymous, ensure the checkbox state reflects it.
  useEffect(() => {
    if (!isOpen) return
    if (initialData && typeof initialData.anonymous !== 'undefined') {
      setFormData(prev => ({ ...prev, anonymous: !!initialData.anonymous }))
    }
  }, [isOpen, initialData?.anonymous])

  // Helper to toggle predefined tags
  const toggleTag = (tag: string) => {
    setFormData(prev => {
      if (prev.tags.includes(tag)) return { ...prev, tags: prev.tags.filter(t => t !== tag) }
      return { ...prev, tags: [...prev.tags, tag] }
    })
  }

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.classList.add('overflow-hidden')
    return () => document.body.classList.remove('overflow-hidden')
  }, [isOpen])

  // Close the course dropdown on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCourseDropdown(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close dropdown and reset to empty when clicking outside
  useEffect(() => {
    // Use pointerdown on capture so we detect clicks before other handlers (e.g. backdrop)
    const onDocPointer = (e: PointerEvent) => {
      if (!showCourseDropdown) return
      if (courseRef.current && !courseRef.current.contains(e.target as Node)) {
        // close the dropdown
        setShowCourseDropdown(false)
        // if the user didn't type anything, clear the saved course value
        if (!selectedCourseInput) setFormData(prev => ({ ...prev, course: '' }))
      }
    }

    document.addEventListener('pointerdown', onDocPointer, true)
    return () => document.removeEventListener('pointerdown', onDocPointer, true)
  }, [showCourseDropdown, selectedCourseInput])

  if (!isOpen) return null

  const isEditing = Boolean(initialData && (initialData.title || initialData.content || (initialData.tags && initialData.tags.length)))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation (run but don't submit)
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.content.trim()) newErrors.content = 'Description is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

  // Validation passed — call parent onSubmit with collected form data
  setErrors({})
  onSubmit(formData)
  }

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      course: '',
      tags: [],
      isUrgent: false,
      anonymous: false
    })
    setTagInput('')
    setErrors({})
    onClose()
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !formData.tags.includes(t)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, t] }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Use onKeyDown (onKeyPress is deprecated)
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    // Wrapper has NO background color—lets the page show through
    <div className="fixed inset-0 z-50">
      {/* Backdrop behind the dialog; semi-transparent so page is visible */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal container above the backdrop */}
      <div className="relative z-50 flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-help-title"
          className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 id="request-help-title" className="text-2xl font-semibold text-slate-800">
              Request Help 🙋‍♂️
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => !readOnly && setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Need help with binary tree traversal algorithms"
                readOnly={readOnly}
                disabled={readOnly}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => !readOnly && setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Describe what you need help with. Be as specific as possible..."
                rows={4}
                readOnly={readOnly}
                disabled={readOnly}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>

            {/* Course - searchable input + dropdown (mirrors FilterBar behavior) */}
            <div className="mb-6" ref={courseRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course (optional)
              </label>
              <div className="relative w-full max-w-lg">
                <input
                  type="text"
                  placeholder="Select or search a course"
                  value={selectedCourseInput}
                  onChange={(e) => {
                    const q = e.target.value
                    setSelectedCourseInput(q)
                    // apply to formData while typing
                    if (!readOnly) setFormData(prev => ({ ...prev, course: q }))
                    if (!readOnly) setShowCourseDropdown(true)
                  }}
                  onFocus={() => {
                    if (!readOnly) setShowCourseDropdown(true)
                    // clear input when focusing so user can type immediately
                    if (!selectedCourseInput) setSelectedCourseInput('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const q = selectedCourseInput.trim()
                      if (!q) {
                        if (!readOnly) setFormData(prev => ({ ...prev, course: '' }))
                        setShowCourseDropdown(false)
                        return
                      }

                      const matches = courses.filter(c => c.toLowerCase().includes(q.toLowerCase()))
                      if (matches.length === 1) {
                        setSelectedCourseInput(matches[0])
                        if (!readOnly) setFormData(prev => ({ ...prev, course: matches[0] }))
                        setShowCourseDropdown(false)
                      } else {
                        const exact = courses.find(c => c.toLowerCase() === q.toLowerCase())
                        if (exact) {
                          setSelectedCourseInput(exact)
                          if (!readOnly) setFormData(prev => ({ ...prev, course: exact }))
                          setShowCourseDropdown(false)
                        }
                      }
                    }
                  }}
                  readOnly={readOnly}
                  disabled={readOnly}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300`}
                />

                  {/* Dropdown toggle */}
                <button
                  type="button"
                  onClick={() => !readOnly && setShowCourseDropdown(s => !s)}
                  aria-label="Toggle course dropdown"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={readOnly}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>

                {showCourseDropdown && !readOnly && (
                  <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-white border border-gray-200 rounded-md shadow-sm">
                    {courses
                      .filter(c => c.toLowerCase().includes((selectedCourseInput || '').toLowerCase()))
                      .map((course) => (
                        <li
                          key={course}
                          onMouseDown={(e) => {
                            // prevent blur before click
                            e.preventDefault()
                            setSelectedCourseInput(course)
                            setFormData(prev => ({ ...prev, course }))
                            setShowCourseDropdown(false)
                          }}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm"
                        >
                          {course}
                        </li>
                      ))}
                  </ul>
                )}

              </div>
              {/* Course is optional */}
            </div>

            {/* ...existing code... */}

            {/* Tags (multi-select from predefined list) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>

              <div className="flex flex-wrap gap-2">
                {predefinedTags.map((tag) => {
                  const active = formData.tags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => !readOnly && toggleTag(tag)}
                      disabled={readOnly}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Urgent Checkbox */}
            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isUrgent}
                  onChange={(e) => !readOnly && setFormData(prev => ({ ...prev, isUrgent: e.target.checked }))}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  disabled={readOnly}
                />
                  <span className="text-sm text-gray-700">
                    Mark request as urgent
                  </span>
              </label>
            </div>

            {/* Anonymous Checkbox */}
            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!formData.anonymous}
                  onChange={(e) => !readOnly && setFormData(prev => ({ ...prev, anonymous: e.target.checked }))}
                  className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                  disabled={readOnly}
                />
                <span className="text-sm text-gray-700">Post anonymously (show as &quot;Anonymous&quot;)</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {!readOnly && (
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  {isEditing ? 'Update Request' : 'Post Request'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
