'use client'

import { useTransition } from 'react'
import { toggleTopicProgress } from './actions'

interface TopicCheckboxProps {
  topicId: string
  subjectId: string
  initialCompleted: boolean
}

export default function TopicCheckbox({ topicId, subjectId, initialCompleted }: TopicCheckboxProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <input
      type="checkbox"
      checked={initialCompleted}
      disabled={isPending}
      onChange={(e) => {
        const checked = e.target.checked
        startTransition(() => {
          toggleTopicProgress(topicId, subjectId, checked)
        })
      }}
      className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:opacity-50 mt-1"
    />
  )
}
