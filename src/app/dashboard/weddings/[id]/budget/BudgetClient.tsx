'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { BudgetItem, WeddingEvent } from '@/lib/types/database'
import AddBudgetItemForm from './AddBudgetItemForm'
import { PlusCircle, TrendingUp } from 'lucide-react'

interface BudgetClientProps {
  weddingId: string
  totalBudgetPence: number
  items: BudgetItem[]
  events: WeddingEvent[]
}

export default function BudgetClient({
  weddingId,
  totalBudgetPence,
  items,
  events,
}: BudgetClientProps) {
  const [showForm, setShowForm] = useState(false)

  const estimatedTotal = items.reduce((s, i) => s + i.estimated_gbp, 0)
  const actualTotal = items.reduce((s, i) => s + i.actual_gbp, 0)
  const depositTotal = items.reduce((s, i) => s + i.deposit_paid_gbp, 0)
  const remaining = totalBudgetPence - actualTotal

  const budgetPct =
    totalBudgetPence > 0 ? Math.min(100, (actualTotal / totalBudgetPence) * 100) : 0
  const estimatedPct =
    totalBudgetPence > 0 ? Math.min(100, (estimatedTotal / totalBudgetPence) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-gray-900">Budget Tracker</h2>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          <PlusCircle size={14} />
          {showForm ? 'Cancel' : 'Add Item'}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="Total Budget"
          value={totalBudgetPence > 0 ? formatCurrency(totalBudgetPence) : '—'}
          color="text-gray-900"
        />
        <SummaryCard
          label="Estimated Spend"
          value={formatCurrency(estimatedTotal)}
          color="text-[#8B1D4F]"
        />
        <SummaryCard
          label="Actual Spend"
          value={formatCurrency(actualTotal)}
          color="text-emerald-700"
        />
        <SummaryCard
          label="Remaining"
          value={totalBudgetPence > 0 ? formatCurrency(remaining) : '—'}
          color={remaining < 0 ? 'text-red-600' : 'text-[#C9973F]'}
        />
      </div>

      {/* Progress bar */}
      {totalBudgetPence > 0 && (
        <div className="mb-6 bg-white rounded-xl border border-[#8B1D4F]/10 p-5">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="flex items-center gap-1">
              <TrendingUp size={13} />
              Budget used
            </span>
            <span>{Math.round(budgetPct)}%</span>
          </div>
          <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
            {/* Estimated layer */}
            <div
              className="h-full rounded-full bg-[#8B1D4F]/20 absolute"
              style={{ width: `${estimatedPct}%` }}
            />
            {/* Actual layer */}
            <div
              className="h-full rounded-full bg-[#8B1D4F] relative"
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B1D4F] inline-block" />
              Actual: {formatCurrency(actualTotal)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B1D4F]/25 inline-block" />
              Estimated: {formatCurrency(estimatedTotal)}
            </span>
          </div>
        </div>
      )}

      {/* Add item form */}
      {showForm && (
        <AddBudgetItemForm
          weddingId={weddingId}
          events={events}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Items table */}
      {items.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border-2 border-dashed border-[#8B1D4F]/15 mt-4">
          <p className="text-gray-500 text-sm">No budget items yet. Add your first item to start tracking.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#8B1D4F]/10">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF7F5] border-b border-[#8B1D4F]/10">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Description
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Category
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Estimated
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Actual
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Deposit Paid
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF7F5] transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.description}</td>
                  <td className="px-4 py-3 text-gray-500">{item.category ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(item.estimated_gbp)}</td>
                  <td className="px-4 py-3 text-right font-medium text-[#8B1D4F]">{formatCurrency(item.actual_gbp)}</td>
                  <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(item.deposit_paid_gbp)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-[#8B1D4F]/15 bg-[#FAF7F5]">
              <tr>
                <td colSpan={2} className="px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                  Total
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-700">
                  {formatCurrency(estimatedTotal)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-[#8B1D4F]">
                  {formatCurrency(actualTotal)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                  {formatCurrency(depositTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-[#8B1D4F]/10 p-4 text-center shadow-sm">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
