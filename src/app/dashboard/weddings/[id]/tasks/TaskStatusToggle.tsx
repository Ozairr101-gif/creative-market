'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { TaskStatus } from '@/lib/types/database'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
  blocked: 'todo',
}

export default function TaskStatusToggle({
  taskId,
  status,
}: {
  taskId: string
  status: TaskStatus
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const next = STATUS_CYCLE[status]
    const supabase = createClient()
    await supabase
      .from('tasks')
      .update({
        status: next,
        completed_at: next === 'done' ? new Date().toISOString() : null,
      })
      .eq('id', taskId)
    setLoading(false)
    router.refresh()
  }

  if (loading) return <Loader2 size={18} className="animate-spin text-gray-400" />

  if (status === 'done') {
    return (
      <button onClick={toggle} aria-label="Mark as todo" className="text-emerald-500 hover:text-gray-400 transition-colors">
        <CheckCircle2 size={18} />
      </button>
    )
  }

  return (
    <button onClick={toggle} aria-label="Mark as in progress" className="text-gray-300 hover:text-[#8B1D4F] transition-colors">
      <Circle size={18} />
    </button>
  )
}
