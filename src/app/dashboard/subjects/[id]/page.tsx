import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export default async function SubjectDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!subject || subject.teacher_id !== user.id) {
    redirect('/dashboard')
  }

  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', params.id)
    .order('created_at', { ascending: true })

  async function addTopic(formData: FormData) {
    'use server'
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    const sb = await createClient()
    await sb.from('topics').insert({
      subject_id: params.id,
      title,
      description
    })
    
    revalidatePath(`/dashboard/subjects/${params.id}`)
  }

  async function deleteTopic(formData: FormData) {
    'use server'
    const topicId = formData.get('topic_id') as string

    const sb = await createClient()
    await sb.from('topics').delete().eq('id', topicId)
    
    revalidatePath(`/dashboard/subjects/${params.id}`)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-800">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h1 className="text-3xl font-bold mb-2">{subject.title}</h1>
        <p className="text-gray-600 mb-4">{subject.description}</p>
        <div className="inline-block bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-md text-sm font-mono">
          Invite Code: <span className="font-bold select-all">{subject.invite_code}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Syllabus / Topics</h2>
      </div>

      <div className="space-y-4 mb-8">
        {topics && topics.length > 0 ? (
          topics.map((topic, index) => (
            <div key={topic.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  <span className="text-gray-400 mr-2">{index + 1}.</span>
                  {topic.title}
                </h3>
                {topic.description && (
                  <p className="text-gray-600 mt-1 text-sm ml-6">{topic.description}</p>
                )}
              </div>
              <form action={deleteTopic}>
                <input type="hidden" name="topic_id" value={topic.id} />
                <button 
                  type="submit" 
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </form>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No topics added yet.</p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-bold mb-4">Add New Topic</h3>
        <form action={addTopic} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic Title
            </label>
            <input 
              type="text" 
              name="title"
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea 
              name="description"
              rows={2}
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
            ></textarea>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
          >
            Add Topic
          </button>
        </form>
      </div>
    </div>
  )
}
