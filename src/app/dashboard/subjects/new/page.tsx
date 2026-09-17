'use client'

import { useState } from 'react'
import { createSubject } from './actions'
import Link from 'next/link'

export default function NewSubjectPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createSubject(formData)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-800">
          &larr; Back
        </Link>
        <h1 className="text-3xl font-bold">Create New Subject</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Title
            </label>
            <input 
              type="text" 
              name="title"
              required
              placeholder="e.g., Higher Math - Batch 2024" 
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea 
              name="description"
              rows={4}
              placeholder="Briefly describe what this subject covers..." 
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Subject'}
          </button>
        </form>
      </div>
    </div>
  )
}
