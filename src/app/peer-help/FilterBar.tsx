'use client'

import { useState, useEffect, useRef } from 'react'
import { QuestionStatus } from '@/lib/types'

interface FilterBarProps {
  onFilterChange: (filters: {
    status?: QuestionStatus
    course?: string
  tags?: string[]
  search?: string
  myRequests?: boolean
  }) => void
  onRequestHelp: () => void  // Add this line
}

const courses = [
  'All Courses',
  'CS 101 - Intro Programming',
  'CS 201 - Data Structures',
  'MATH 201 - Calculus II',
  'ENG 102 - Composition',
  'CHEM 150 - General Chemistry',
  'STAT 300 - Statistics',
  'PHYS 201 - Physics I'
]


const tagOptions = [
  'Assignment Help',
  'Study Group',
  'Topic Explanation',
  'Career Advice',
  'Resume Review',
  'Labs',
  'Exam Prep',
  'General'
]

export default function FilterBar({ onFilterChange, onRequestHelp }: FilterBarProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'my-requests'>('all')
  const [selectedCourse, setSelectedCourse] = useState('All Courses')
  const [showCourseDropdown, setShowCourseDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const courseRef = useRef<HTMLDivElement | null>(null)
  const searchDebounceRef = useRef<number | null>(null)

  // Close the course dropdown on Escape or click outside
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCourseDropdown(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close dropdown and reset to All Courses when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!showCourseDropdown) return
      if (courseRef.current && !courseRef.current.contains(e.target as Node)) {
        setShowCourseDropdown(false)
        // reset selection to All Courses
        handleCourseChange('All Courses')
      }
    }

    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showCourseDropdown])

  const handleTabChange = (tab: 'all' | 'my-requests') => {
  setActiveTab(tab)
  // Emit a client-side hint so parent can filter. This is best-effort until server-side owner filtering is added.
  if (tab === 'my-requests') onFilterChange({ myRequests: true })
  else onFilterChange({ myRequests: undefined })
  }

  const handleCourseChange = (course: string) => {
    setSelectedCourse(course)
    onFilterChange({ 
      course: course === 'All Courses' ? undefined : course 
    })
  }

  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const toggleTag = (tag: string) => {
  const next = selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag]
  setSelectedTags(next)
  onFilterChange({ tags: next })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // debounce parent updates for smoother UX
    if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = window.setTimeout(() => {
      const payload = { search: query ? query : undefined, status: undefined }
      onFilterChange(payload)
    }, 220)
  }

  // cleanup debounce timer when the component unmounts
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current)
    }
  }, [])

  return (
    <div className="bg-white border-b border-gray-200 p-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Dropdowns */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          {/* Tabs */}
          <div className="flex gap-1">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-gray-600 hover:text-slate-800 hover:bg-gray-100'
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => handleTabChange('my-requests')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'my-requests'
                  ? 'bg-slate-800 text-white'
                  : 'text-gray-600 hover:text-slate-800 hover:bg-gray-100'
              }`}
            >
              👤 My Requests
            </button>
          </div>

          {/* Course Filter: searchable input with suggestions */}
          <div className="relative" ref={courseRef}>
            <input
              type="text"
              placeholder=""
              value={selectedCourse}
              onChange={(e) => {
                const q = e.target.value
                // allow the input to be empty without immediately resetting to All Courses
                setSelectedCourse(q)
                // only apply the course filter while the user types non-empty text
                if (q) onFilterChange({ course: q })
                setShowCourseDropdown(true)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const q = selectedCourse.trim()
                  // if the input is empty and the user presses Enter, reset to All Courses
                  if (!q) {
                    setSelectedCourse('All Courses')
                    setShowCourseDropdown(false)
                    handleCourseChange('All Courses')
                    return
                  }

                  const matches = courses.filter(c => c.toLowerCase().includes(q.toLowerCase()))
                  if (matches.length === 1) {
                    setSelectedCourse(matches[0])
                    setShowCourseDropdown(false)
                    handleCourseChange(matches[0])
                  } else {
                    const exact = courses.find(c => c.toLowerCase() === q.toLowerCase())
                    if (exact) {
                      setSelectedCourse(exact)
                      setShowCourseDropdown(false)
                      handleCourseChange(exact)
                    }
                  }
                }
              }}
              onFocus={() => {
                setShowCourseDropdown(true)
                if (selectedCourse === 'All Courses') setSelectedCourse('')
              }}
              className={`px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-60 pr-10 ${
                selectedCourse === 'All Courses' ? 'text-slate-800 font-medium' : 'text-gray-700'
              }`}
            />

            {/* Dropdown arrow */}
            <button
              type="button"
              onClick={() => setShowCourseDropdown(s => {
                const next = !s
                if (next && selectedCourse === 'All Courses') setSelectedCourse('')
                return next
              })}
              aria-label="Toggle course dropdown"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
              </svg>
            </button>

            {showCourseDropdown && (
              <ul className="absolute z-20 mt-1 w-60 max-h-48 overflow-auto bg-white border border-gray-200 rounded-md shadow-sm">
                {courses
                  .filter(c => c.toLowerCase().includes((selectedCourse || '').toLowerCase()))
                  .map((course) => (
                    <li
                      key={course}
                      onMouseDown={(e) => {
                        // prevent blur before click
                        e.preventDefault()
                        setSelectedCourse(course)
                        // close dropdown after selection
                        setShowCourseDropdown(false)
                        handleCourseChange(course)
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm"
                    >
                      {course}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

          {/* Request Help Button */}
        <button 
        onClick={onRequestHelp}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
        + Request Help
        </button>
      </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {tagOptions.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${selectedTags.includes(tag) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
            >
              {tag}
            </button>
          ))}
        </div>

  {/* Quick Type Filters removed per request */}
    </div>
  )
}
