'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function submitOnboarding(formData: FormData) {
  const role = formData.get('role') as string
  const inviteCode = formData.get('invite_code') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Determine actual role
  let finalRole = 'student'
  if (role === 'tutor') {
    finalRole = 'teacher'
  } else if (role === 'admin') {
    finalRole = 'admin'
  }

  // Update profile
  const { error } = await supabase
    .from('profiles')
    .update({ 
      role: finalRole, 
      onboarded: true 
    })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to update profile', error)
    throw new Error('Failed to update profile')
  }

  // If role is admin and they chose coaching center, we might need to create an org in the future,
  // but for phase 1 we just update the role.
  
  redirect('/dashboard')
}
