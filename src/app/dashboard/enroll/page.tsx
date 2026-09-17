import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export default async function EnrollPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  async function handleEnroll(formData: FormData) {
    'use server'
    const code = formData.get('invite_code') as string
    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Find subject by code
    const { data: subject } = await sb
      .from('subjects')
      .select('id')
      .eq('invite_code', code)
      .single()

    if (!subject) {
      // In a real app, we'd return an error state to the UI.
      // For now, we'll throw to be caught by an error boundary or just fail.
      throw new Error('Invalid invite code')
    }

    // Insert enrollment
    const { error } = await sb
      .from('enrollments')
      .insert({
        student_id: user.id,
        subject_id: subject.id
      })

    if (error) {
      console.error(error)
      throw new Error('Failed to enroll or already enrolled')
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-800">
          &larr; Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold mb-4">Enroll in a Subject</h1>
        <p className="text-gray-600 mb-6">Enter the 6-character invite code provided by your teacher.</p>
        
        <form action={handleEnroll} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invite Code
            </label>
            <input 
              type="text" 
              name="invite_code"
              required
              maxLength={6}
              placeholder="e.g. a1b2c3" 
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none uppercase font-mono text-center tracking-widest text-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
          >
            Join Subject
          </button>
        </form>
      </div>
    </div>
  )
}
