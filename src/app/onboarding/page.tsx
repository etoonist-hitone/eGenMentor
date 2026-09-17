'use client'

import { useState } from 'react'
import { submitOnboarding } from './actions'

export default function OnboardingPage() {
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await submitOnboarding(formData)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="z-10 max-w-xl w-full flex flex-col bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome to eGenMentor!</h1>
        <p className="mb-8 text-gray-600">Please tell us how you will be using the platform.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input 
                type="radio" 
                name="role" 
                value="student" 
                checked={role === 'student'}
                onChange={() => setRole('student')}
                className="w-5 h-5 text-blue-600"
              />
              <div>
                <span className="block font-semibold text-gray-800">I'm a student</span>
                <span className="block text-sm text-gray-500">I want to track my progress and view my syllabus.</span>
              </div>
            </label>

            <label className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input 
                type="radio" 
                name="role" 
                value="tutor" 
                checked={role === 'tutor'}
                onChange={() => setRole('tutor')}
                className="w-5 h-5 text-blue-600"
              />
              <div>
                <span className="block font-semibold text-gray-800">I'm an individual tutor</span>
                <span className="block text-sm text-gray-500">I want to manage my classes and students.</span>
              </div>
            </label>

            <label className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input 
                type="radio" 
                name="role" 
                value="admin" 
                checked={role === 'admin'}
                onChange={() => setRole('admin')}
                className="w-5 h-5 text-blue-600"
              />
              <div>
                <span className="block font-semibold text-gray-800">I run a coaching center/school</span>
                <span className="block text-sm text-gray-500">I want to manage multiple teachers and batches.</span>
              </div>
            </label>
          </div>

          {role === 'student' && (
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invite Code (Optional)
              </label>
              <input 
                type="text" 
                name="invite_code" 
                placeholder="Enter code to join a batch..." 
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors disabled:opacity-50 mt-6"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
