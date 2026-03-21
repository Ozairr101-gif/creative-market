'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatShortDate } from '@/lib/utils'
import type { Task, WeddingEvent } from '@/lib/types/database'
import TaskStatusToggle from './TaskStatusToggle'
import AddTaskForm from './AddTaskForm'
import { ListChecks } from 'lucide-react'

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-400',
  low: 'bg-gray-300',
}

const PRIORITY_LABEL: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

interface TasksClientProps {
  weddingId: string
  tasks: Task[]
  events: WeddingEvent[]
}

const STATUS_GROUPS: { key: Task['status']; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
  { key: 'blocked', label: 'Blocked' },
]

export default function TasksClient({ weddingId, tasks, events }: TasksClientProps) {
  const [showForm, setShowForm] = useState(false)

  const grouped = STATUS_GROUPS.map((group) => ({
    ...group,
    tasks: tasks.filter((t) => t.status === group.key),
  })).filter((g) => g.tasks.length > 0 || g.key === 'todo')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {tasks.filter((t) => t.status === 'done').length} completed
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          <ListChecks size={14} />
          {showForm ? 'Cancel' : 'Add Task'}
        </Button>
      </div>

      {showForm && (
        <AddTaskForm
          weddingId={weddingId}
          events={events}
          onClose={() => setShowForm(false)}
        />
      )}

      <div className="mt-6 space-y-8">
        {grouped.map((group) => (
          <div key={group.key}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{group.label}</h3>
              <span className="text-xs text-gray-400 font-medium bg-gray-100 rounded-full px-2 py-0.5">
                {group.tasks.length}
              </span>
            </div>

            {group.tasks.length === 0 ? (
              <p className="text-sm text-gray-400 italic px-2">Nothing here yet.</p>
            ) : (
              <div className="space-y-2">
                {group.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-xl border border-[#8B1D4F]/10 px-4 py-3 shadow-sm">
      {/* Status toggle */}
      <div className="mt-0.5 shrink-0">
        <TaskStatusToggle taskId={task.id} status={task.status} />
      </div>

      {/* Priority dot */}
      <div className="mt-1.5 shrink-0">
        <div
          className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[task.priority]}`}
          title={`${PRIORITY_LABEL[task.priority]} priority`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {task.category && (
            <Badge className="bg-[#8B1D4F]/8 text-[#8B1D4F]">{task.category}</Badge>
          )}
          {task.due_date && (
            <span className="text-xs text-[#C9973F]">Due {formatShortDate(task.due_date)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
