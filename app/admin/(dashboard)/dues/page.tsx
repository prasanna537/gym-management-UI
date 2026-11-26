"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, X, Loader2, RefreshCw, Search, Save, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchOutstandingDues, updateMemberPayment, Member, PaymentStatus } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`

// Same rules as the backend: 0 → PENDING, 0 < paid < plan → PARTIAL, paid >= plan → PAID
function paymentOf(planAmount: number, paid: number) {
  const remaining = Math.max(planAmount - paid, 0)
  const status: PaymentStatus = remaining === 0 ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING"
  return { remaining, status }
}

const STATUS_STYLE: Record<PaymentStatus, string> = {
  PENDING: "bg-destructive/20 text-destructive border border-destructive/30",
  PARTIAL: "bg-orange-500/20 text-orange-500 border border-orange-500/30",
  PAID: "bg-primary/20 text-primary border border-primary/30",
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[status]}`}>{status}</span>
}

export default function OutstandingDuesPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const [selected, setSelected] = useState<Member | null>(null)
  const [paidInput, setPaidInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const { toast } = useToast()

  const load = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true)
      setError(null)
      setMembers(await fetchOutstandingDues())
    } catch (err: any) {
      setError(err.message || "Failed to load outstanding dues.")
    } finally {
      if (showSpinner) setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openDetails = (member: Member) => {
    setSelected(member)
    setPaidInput(String(member.amountPaid ?? 0))
    setSaveError(null)
  }

  const filtered = members.filter((m) => {
    const q = search.toLowerCase()
    return m.name.toLowerCase().includes(q) || m.phone.includes(q)
  })

  const totalOutstanding = members.reduce((sum, m) => sum + (m.remainingAmount ?? 0), 0)

  const handleSave = async () => {
    if (!selected || saving) return
    const paid = Number(paidInput)
    if (paidInput.trim() === "" || !Number.isInteger(paid) || paid < 0) {
      setSaveError("Enter a valid whole amount (0 or more).")
      return
    }
    try {
      setSaving(true)
      setSaveError(null)
      const updated = await updateMemberPayment(selected.id, paid)
      const { status } = paymentOf(updated.plan_price, updated.amountPaid ?? 0)
      toast({
        title: status === "PAID" ? "✓ Fully paid — removed from Outstanding Dues" : "✓ Payment updated",
        duration: 2500,
      })
      setSelected(null)
      await load(false)
    } catch (err: any) {
      setSaveError(err.message || "Failed to update payment.")
    } finally {
      setSaving(false)
    }
  }

  // Live preview inside the details panel
  const preview = selected ? paymentOf(selected.plan_price, Number(paidInput) || 0) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Outstanding Dues</h1>
          <p className="text-muted-foreground">Members with an unpaid or partially paid membership</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => load(true)} className="h-10 w-10 text-muted-foreground hover:text-foreground">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Summary + search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-border"
            />
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">Members with dues</p>
              <p className="text-lg font-bold">{members.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total outstanding</p>
              <p className="text-lg font-bold text-destructive">{rupees(totalOutstanding)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-7 w-7 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading outstanding dues...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={() => load(true)}>Retry</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {members.length === 0 ? "No outstanding dues. Everyone is paid up!" : "No members match your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-sm">
                  <th className="p-3 font-semibold">Member</th>
                  <th className="p-3 font-semibold">Plan</th>
                  <th className="p-3 font-semibold text-right">Plan Amount</th>
                  <th className="p-3 font-semibold text-right">Paid</th>
                  <th className="p-3 font-semibold text-right">Remaining</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => openDetails(m)}
                    className="border-b border-border last:border-0 hover:bg-secondary/20 cursor-pointer transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.phone}</div>
                    </td>
                    <td className="p-3 text-sm">{m.plan}</td>
                    <td className="p-3 text-sm text-right">{rupees(m.plan_price)}</td>
                    <td className="p-3 text-sm text-right">{rupees(m.amountPaid ?? 0)}</td>
                    <td className="p-3 text-sm text-right font-semibold text-destructive">{rupees(m.remainingAmount ?? 0)}</td>
                    <td className="p-3">{m.paymentStatus && <StatusBadge status={m.paymentStatus} />}</td>
                    <td className="p-3 text-sm text-muted-foreground">{m.expiryDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Payment details panel */}
      <AnimatePresence>
        {selected && preview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!saving) setSelected(null) }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full glass-card rounded-2xl p-6 z-50 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Payment Details</h2>
                </div>
                <button
                  onClick={() => { if (!saving) setSelected(null) }}
                  disabled={saving}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {saveError && (
                <div className="mb-4 bg-destructive/10 text-destructive text-sm rounded-lg p-3 border border-destructive/20 font-medium">
                  {saveError}
                </div>
              )}

              <dl className="space-y-3 text-sm">
                {[
                  ["Member", selected.name],
                  ["Phone", selected.phone],
                  ["Membership Plan", selected.plan],
                  ["Plan Amount", rupees(selected.plan_price)],
                  ["Join Date", selected.joinDate],
                  ["Expiry Date", selected.expiryDate],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-border pb-2">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">Remaining Amount</dt>
                  <dd className={`font-semibold ${preview.remaining > 0 ? "text-destructive" : "text-primary"}`}>{rupees(preview.remaining)}</dd>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <dt className="text-muted-foreground">Payment Status</dt>
                  <dd><StatusBadge status={preview.status} /></dd>
                </div>
              </dl>

              <div className="space-y-2 mt-5">
                <Label htmlFor="amount-paid">Amount Paid (₹)</Label>
                <Input
                  id="amount-paid"
                  type="number"
                  min={0}
                  step={1}
                  value={paidInput}
                  onChange={(e) => setPaidInput(e.target.value)}
                  disabled={saving}
                  className="bg-secondary border-border"
                />
                {preview.status === "PAID" && (
                  <p className="text-xs text-primary">Fully paid — this member will be removed from Outstanding Dues.</p>
                )}
              </div>

              <div className="flex gap-3 pt-5">
                <Button type="button" variant="outline" onClick={() => setSelected(null)} disabled={saving} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save Payment"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Need to change other details? Use{" "}
                <Link href="/admin/members" className="underline underline-offset-2 hover:text-foreground">Members → Edit</Link>.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
