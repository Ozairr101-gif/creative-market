'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { QuoteLineItem } from '@/lib/types/database'

interface QuoteBuilderProps {
  inquiryId: string
  vendorId: string
  weddingId: string
  coupleName: string
  weddingTitle: string
  eventType: string
  eventDate: string | null
  estimatedGuests: number | null
}

interface LineItemRow extends QuoteLineItem {
  _key: string
}

const PLATFORM_FEE_RATE = 0.02

function generateKey() {
  return Math.random().toString(36).slice(2, 9)
}

function emptyRow(): LineItemRow {
  return {
    _key: generateKey(),
    description: '',
    quantity: 1,
    unit_price_gbp: 0,
    total_gbp: 0,
  }
}

export default function QuoteBuilder({
  inquiryId,
  vendorId,
  weddingId,
  coupleName,
  weddingTitle,
  eventType,
  eventDate,
  estimatedGuests,
}: QuoteBuilderProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [rows, setRows] = useState<LineItemRow[]>([emptyRow()])
  const [depositAmount, setDepositAmount] = useState('')
  const [depositDueDate, setDepositDueDate] = useState('')
  const [balanceDueDate, setBalanceDueDate] = useState('')
  const [validityDate, setValidityDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')

  const updateRow = useCallback(
    (key: string, field: keyof Omit<LineItemRow, '_key'>, value: string | number) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row._key !== key) return row
          const updated = { ...row, [field]: value }
          if (field === 'quantity' || field === 'unit_price_gbp') {
            updated.total_gbp =
              Number(field === 'quantity' ? value : row.quantity) *
              Number(field === 'unit_price_gbp' ? value : row.unit_price_gbp)
          }
          return updated
        }),
      )
    },
    [],
  )

  function addRow() {
    setRows((prev) => [...prev, emptyRow()])
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r._key !== key) : prev))
  }

  const subtotal = rows.reduce((sum, r) => sum + (r.total_gbp || 0), 0)
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE * 100) / 100
  const total = subtotal + platformFee
  const deposit = parseFloat(depositAmount) || 0
  const balance = total - deposit

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const validRows = rows.filter((r) => r.description.trim() && r.unit_price_gbp > 0)
    if (validRows.length === 0) {
      setError('Please add at least one line item with a description and price.')
      return
    }
    if (deposit <= 0) {
      setError('Please enter a deposit amount.')
      return
    }
    if (deposit > total) {
      setError('Deposit cannot exceed the total amount.')
      return
    }

    startTransition(async () => {
      try {
        const supabase = createClient()

        const lineItems: QuoteLineItem[] = validRows.map((r) => ({
          description: r.description.trim(),
          quantity: r.quantity,
          unit_price_gbp: r.unit_price_gbp,
          total_gbp: r.total_gbp,
        }))

        const { data: quote, error: quoteError } = await supabase
          .from('quotes')
          .insert({
            inquiry_id: inquiryId,
            vendor_id: vendorId,
            wedding_id: weddingId,
            line_items: lineItems,
            subtotal_gbp: subtotal,
            platform_fee_gbp: platformFee,
            total_gbp: total,
            deposit_gbp: deposit,
            deposit_due_date: depositDueDate || null,
            balance_due_date: balanceDueDate || null,
            validity_date: validityDate || null,
            notes: notes.trim() || null,
            terms: terms.trim() || null,
            status: 'sent',
          })
          .select('id')
          .single()

        if (quoteError) throw quoteError

        // Update inquiry status to 'responded'
        await supabase
          .from('inquiries')
          .update({ status: 'responded', updated_at: new Date().toISOString() })
          .eq('id', inquiryId)

        router.push(`/vendor-hub/quotes/${quote.id}`)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to send quote. Please try again.'
        setError(msg)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left: builder */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Context summary */}
          <div className="rounded-lg bg-[#8B1D4F]/5 border border-[#8B1D4F]/15 px-4 py-3 text-sm">
            <p className="font-medium text-[#8B1D4F] mb-0.5">Quote for {coupleName}</p>
            <p className="text-gray-600">
              {weddingTitle} · {eventType}
              {eventDate && ` · ${new Date(eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              {estimatedGuests && ` · ~${estimatedGuests} guests`}
            </p>
          </div>

          {/* Line items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 mb-2 px-1">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Description</p>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 text-right w-16">Qty</p>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 text-right w-24">Unit price</p>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 text-right w-24">Total</p>
                <p className="w-8" />
              </div>

              <div className="space-y-2">
                {rows.map((row) => (
                  <div
                    key={row._key}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center rounded-md border border-gray-100 p-2 sm:p-1 sm:border-none"
                  >
                    <input
                      type="text"
                      placeholder="e.g. Full-day photography coverage"
                      value={row.description}
                      onChange={(e) => updateRow(row._key, 'description', e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-[#FAF7F5] px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1D4F] focus:border-transparent"
                      aria-label="Item description"
                    />
                    <div className="flex sm:block gap-2 items-center">
                      <label className="sm:hidden text-xs text-gray-400 w-16">Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => updateRow(row._key, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16 rounded-md border border-gray-300 bg-[#FAF7F5] px-2 py-1.5 text-sm text-right text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1D4F] focus:border-transparent"
                        aria-label="Quantity"
                      />
                    </div>
                    <div className="flex sm:block gap-2 items-center">
                      <label className="sm:hidden text-xs text-gray-400 w-16">Price £</label>
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={row.unit_price_gbp || ''}
                          onChange={(e) =>
                            updateRow(row._key, 'unit_price_gbp', parseFloat(e.target.value) || 0)
                          }
                          placeholder="0.00"
                          className="w-full rounded-md border border-gray-300 bg-[#FAF7F5] pl-6 pr-2 py-1.5 text-sm text-right text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1D4F] focus:border-transparent"
                          aria-label="Unit price"
                        />
                      </div>
                    </div>
                    <div className="flex sm:block gap-2 items-center justify-between">
                      <label className="sm:hidden text-xs text-gray-400 w-16">Total</label>
                      <p className="w-24 text-right text-sm font-medium text-gray-900 pr-1">
                        {formatCurrency(row.total_gbp * 100)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(row._key)}
                      disabled={rows.length === 1}
                      className="hidden sm:flex h-7 w-7 items-center justify-center rounded text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Remove row"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addRow}
                className="mt-3 flex items-center gap-2 text-sm font-medium text-[#8B1D4F] hover:text-[#7a1944] transition-colors"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#8B1D4F]/40 text-lg leading-none">
                  +
                </span>
                Add line item
              </button>
            </CardContent>
          </Card>

          {/* Payment schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Deposit amount (£) *"
                  type="number"
                  min={0}
                  step={0.01}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 300"
                  helperText="Typically 20–30% of the total"
                  required
                />
                <Input
                  label="Deposit due date"
                  type="date"
                  value={depositDueDate}
                  onChange={(e) => setDepositDueDate(e.target.value)}
                />
                <Input
                  label="Balance due date"
                  type="date"
                  value={balanceDueDate}
                  onChange={(e) => setBalanceDueDate(e.target.value)}
                  helperText="Usually 4–8 weeks before the event"
                />
                <Input
                  label="Quote valid until"
                  type="date"
                  value={validityDate}
                  onChange={(e) => setValidityDate(e.target.value)}
                  helperText="Default: 14 days from today"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes & terms */}
          <Card>
            <CardHeader>
              <CardTitle>Notes &amp; Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  label="Notes to couple"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Package includes pre-wedding consultation, full editing, and digital album delivery within 8 weeks…"
                  rows={4}
                  helperText="Personalised message visible to the couple alongside this quote"
                />
                <Textarea
                  label="Terms &amp; conditions (optional)"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="e.g. The deposit is non-refundable. Cancellation within 30 days of the event forfeits 50% of the balance…"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: live summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-8 space-y-4">
            <Card className="border-[#8B1D4F]/15">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quote Summary</CardTitle>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                    Live preview
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Line items summary */}
                <div className="space-y-1.5 mb-4">
                  {rows
                    .filter((r) => r.description.trim())
                    .map((row) => (
                      <div key={row._key} className="flex justify-between gap-2 text-sm">
                        <span className="text-gray-600 truncate max-w-[180px]" title={row.description}>
                          {row.description}
                          {row.quantity > 1 && ` ×${row.quantity}`}
                        </span>
                        <span className="text-gray-900 font-medium shrink-0">
                          {formatCurrency(row.total_gbp * 100)}
                        </span>
                      </div>
                    ))}
                  {rows.filter((r) => r.description.trim()).length === 0 && (
                    <p className="text-sm text-gray-400 italic">Add line items to see totals</p>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(subtotal * 100)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      Platform fee
                      <span className="text-xs text-gray-400">(2%)</span>
                    </span>
                    <span className="text-gray-600">{formatCurrency(platformFee * 100)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-[#8B1D4F]">{formatCurrency(total * 100)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deposit</span>
                    <span className="font-semibold text-[#C9973F]">
                      {deposit > 0 ? formatCurrency(deposit * 100) : '—'}
                    </span>
                  </div>
                  {depositDueDate && (
                    <p className="text-xs text-gray-400">
                      Due: {new Date(depositDueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Balance due</span>
                    <span className="font-semibold text-gray-900">
                      {deposit > 0 ? formatCurrency(balance * 100) : '—'}
                    </span>
                  </div>
                  {balanceDueDate && (
                    <p className="text-xs text-gray-400">
                      Due: {new Date(balanceDueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {validityDate && (
                  <p className="mt-4 text-xs text-gray-400 text-center">
                    Quote valid until{' '}
                    {new Date(validityDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </CardContent>
            </Card>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isPending}
              className="w-full"
            >
              {isPending ? 'Sending…' : 'Send quote to couple'}
            </Button>
            <p className="text-xs text-center text-gray-400">
              The couple will be notified and can accept or request changes.
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}
