import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TopicCheckbox from './TopicCheckbox'

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

  // Fetch topics
  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', params.id)
    .order('created_at', { ascending: true })

  // Fetch progress
  const { data: progressList } = await supabase
    .from('topic_progress')
    .select('*')
    .eq('student_id', user.id)
    
  const progressMap = new Map(progressList?.map(p => [p.topic_id, p.completed]))

  const totalTopics = topics?.length || 0
  const completedTopics = topics?.filter(t => progressMap.get(t.id)).length || 0
  const progressPercent = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-800">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h1 className="text-3xl font-bold mb-2">{enrollment.subjects?.title}</h1>
        <p className="text-gray-600 mb-6">{enrollment.subjects?.description}</p>
        
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-gray-700">Course Progress</span>
            <span className="text-sm font-bold text-blue-600">{progressPercent}% ({completedTopics}/{totalTopics})</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Syllabus</h2>

      <div className="space-y-4 mb-8">
        {topics && topics.length > 0 ? (
          topics.map((topic, index) => {
            const isCompleted = progressMap.get(topic.id) || false
            
            return (
              <div 
                key={topic.id} 
                className={`p-4 rounded-lg shadow-sm border flex items-start gap-4 transition-colors ${
                  isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'
                }`}
              >
                <TopicCheckbox 
                  topicId={topic.id} 
                  subjectId={params.id}
                  initialCompleted={isCompleted} 
                />
                
                <div className={isCompleted ? 'opacity-70' : ''}>
                  <h3 className={`font-bold text-lg ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    <span className="text-gray-400 mr-2">{index + 1}.</span>
                    {topic.title}
                  </h3>
                  {topic.description && (
                    <p className={`mt-1 text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                      {topic.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">Your teacher hasn't added any topics yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
