'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createSubject(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('subjects')
    .insert({
      title,
      description,
      teacher_id: user.id
    })

  if (error) {
    console.error('Error creating subject', error)
    throw new Error('Failed to create subject')
  }

  redirect('/dashboard')
}
