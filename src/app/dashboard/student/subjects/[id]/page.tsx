import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function StudentSubjectView({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*, subjects(*)')
    .eq('student_id', user.id)
    .eq('subject_id', params.id)
    .single()

  if (!enrollment) {
    redirect('/dashboard')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-800">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h1 className="text-3xl font-bold mb-2">{enrollment.subjects?.title}</h1>
        <p className="text-gray-600 mb-4">{enrollment.subjects?.description}</p>
        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded inline-block">
          Student View (Topics & Progress tracking coming in Phase 3)
        </div>
      </div>
    </div>
  )
}
