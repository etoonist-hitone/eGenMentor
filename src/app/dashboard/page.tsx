import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile && !profile.onboarded) {
    redirect('/onboarding')
  }

  // Fetch subjects for teacher
  let subjects = null
  if (profile?.role === 'teacher') {
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
    subjects = data
  }

  // Fetch enrollments for student
  let enrollments = null
  if (profile?.role === 'student') {
    const { data } = await supabase
      .from('enrollments')
      .select('*, subjects(*)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
    enrollments = data
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="bg-white px-4 py-2 rounded-full shadow-sm border text-sm">
          <span className="text-gray-500">Role:</span> <span className="font-semibold capitalize text-blue-600">{profile?.role}</span>
        </div>
      </div>

      {profile?.role === 'teacher' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">My Subjects</h2>
            <Link 
              href="/dashboard/subjects/new" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              + Create Subject
            </Link>
          </div>

          {subjects && subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div key={subject.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{subject.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{subject.description}</p>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                      Code: {subject.invite_code}
                    </span>
                    <Link 
                      href={`/dashboard/subjects/${subject.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Manage Syllabus &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first subject.</p>
            </div>
          )}
        </div>
      )}

      {profile?.role === 'student' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">My Enrollments</h2>
            <Link 
              href="/dashboard/enroll" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Enroll with Code
            </Link>
          </div>

          {enrollments && enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{enrollment.subjects?.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{enrollment.subjects?.description}</p>
                  <div className="flex justify-end items-center mt-4 pt-4 border-t border-gray-100">
                    <Link 
                      href={`/dashboard/student/subjects/${enrollment.subjects?.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Syllabus &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Not enrolled in any subjects</h3>
              <p className="text-gray-500 mb-4">Use an invite code from your teacher to join a subject.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
