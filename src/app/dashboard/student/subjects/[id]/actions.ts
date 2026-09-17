'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleTopicProgress(topicId: string, subjectId: string, completed: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Upsert progress
  const { error } = await supabase
    .from('topic_progress')
    .upsert(
      { 
        student_id: user.id, 
        topic_id: topicId, 
        completed,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'student_id,topic_id' }
    )

  if (error) {
    console.error('Error toggling progress', error)
    throw new Error('Failed to update progress')
  }

  revalidatePath(`/dashboard/student/subjects/${subjectId}`)
}
