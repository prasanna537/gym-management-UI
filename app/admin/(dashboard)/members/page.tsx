"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchMembers, createMember, updateMember, deleteMember, Member, fetchPlans, Plan } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPlan, setFilterPlan] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    plan: string;
    joinDate: string;
    expiryDate: string;
    status: Member["status"];
    planId?: number;
    amountPaid?: number;
  }>({
    name: "",
    email: "",
    phone: "",
    plan: "",
    planId: undefined,
    joinDate: "",
    expiryDate: "",
    status: "Active",
  })

  const itemsPerPage = 5

  // Load members from API
  const loadMembers = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) setLoading(true)
      setError(null)
      const data = await fetchMembers()
      setMembers(data)
    } catch (err: any) {
      console.error("Failed to load members:", err)
      setError(err.message || "Failed to load members from server.")
    } finally {
      if (showLoadingIndicator) setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoadingPlans(true)
      const data = await fetchPlans()
      setPlans(data)
    } catch (err: any) {
      console.error("Failed to load plans:", err)
    } finally {
      setLoadingPlans(false)
    }
  }

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (member.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || member.status === filterStatus
    const matchesPlan = filterPlan === "all" || member.plan === filterPlan
    return matchesSearch && matchesStatus && matchesPlan
  })

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const openAddModal = () => {
    setEditingMember(null)
    setSubmitError(null)
    
    // Set standard default dates (join date as today, expiry date as 1 year from now)
    const today = new Date()
    const joinDateStr = today.toISOString().split("T")[0]
    
    const oneYearLater = new Date()
    oneYearLater.setFullYear(today.getFullYear() + 1)
    const expiryDateStr = oneYearLater.toISOString().split("T")[0]

    setFormData({
      name: "",
      email: "",
      phone: "",
      plan: "",
      planId: undefined,
      joinDate: joinDateStr,
      expiryDate: expiryDateStr,
      status: "Active",
    })
    setIsModalOpen(true)
  }

  const openEditModal = (member: Member) => {
    setEditingMember(member)
    setSubmitError(null)
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      plan: member.plan,
      planId: member.planId,
      joinDate: member.joinDate,
      expiryDate: member.expiryDate,
      status: member.status,
      amountPaid: member.amountPaid,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)

    try {
      if (editingMember) {
        // PUT request to backend database
        await updateMember(editingMember.id, formData)
        
        toast({
          title: "Member Updated",
          description: `${formData.name} was successfully updated in the PostgreSQL database.`,
        })
        setIsModalOpen(false)
        await loadMembers(false)
      } else {
        // POST to backend api
        await createMember(formData)
        
        toast({
          title: "Member Created Successfully",
          description: `${formData.name} has been saved to the PostgreSQL database.`,
        })
        
        setIsModalOpen(false)
        // Re-fetch database contents to sync and refresh table
        await loadMembers(false)
      }
    } catch (err: any) {
      console.error("Failed to submit member:", err)
      setSubmitError(err.message || "Failed to submit member record. Please verify fields.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setLoading(true)
      await deleteMember(id)
      toast({
        title: "Member Removed Successfully",
        description: "Member has been deleted from the PostgreSQL database.",
        variant: "destructive"
      })
      await loadMembers(false)
    } catch (err: any) {
      console.error("Failed to delete member:", err)
      toast({
        title: "Deletion Failed",
        description: err.message || "Failed to delete member from the database.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage your gym members with real-time PostgreSQL database sync</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => loadMembers(true)} className="h-10 w-10 text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openAddModal} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 bg-secondary border-border"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Expiring">Expiring</option>
            </select>
          </div>

          {/* Plan Filter */}
          <select
            value={filterPlan}
            onChange={(e) => {
              setFilterPlan(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Members Table */}
      {loading ? (
        <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Querying database records...</p>
        </div>
      ) : error ? (
        <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <X className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-foreground">Error Connecting to Database</h3>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button onClick={() => loadMembers(true)} size="sm">
            Try Reconnecting
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-4 px-6 text-sm font-semibold">Name</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold hidden md:table-cell">Email</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold hidden lg:table-cell">Phone</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold">Plan</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold hidden sm:table-cell">Price</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold hidden sm:table-cell">Join Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold hidden sm:table-cell">Expiry</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold">Status</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                      No matching member records found.
                    </td>
                  </tr>
                ) : (
                  paginatedMembers.map((member) => (
                    <tr key={member.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="py-4 px-6 font-medium">{member.name}</td>
                      <td className="py-4 px-6 text-muted-foreground hidden md:table-cell">{member.email || "—"}</td>
                      <td className="py-4 px-6 text-muted-foreground hidden lg:table-cell">{member.phone}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          member.plan === "VIP" ? "bg-chart-4/20 text-chart-4" :
                          member.plan === "Elite" ? "bg-primary/20 text-primary" :
                          "bg-secondary text-secondary-foreground"
                        }`}>
                          {member.plan}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground hidden sm:table-cell font-semibold text-primary">
                        ${member.plan_price}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground hidden sm:table-cell">{member.joinDate}</td>
                      <td className="py-4 px-6 text-muted-foreground hidden sm:table-cell">{member.expiryDate}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          member.status === "Active" ? "bg-primary/20 text-primary" :
                          member.status === "Expiring" ? "bg-chart-5/20 text-chart-5" :
                          "bg-destructive/20 text-destructive"
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(member)}
                            className="h-8 w-8 hover:bg-secondary"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(member.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!submitting) setIsModalOpen(false)
              }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full glass-card rounded-2xl p-6 z-50 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingMember ? "Edit Member" : "Add New Member"}
                </h2>
                <button
                  onClick={() => {
                    if (!submitting) setIsModalOpen(false)
                  }}
                  disabled={submitting}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {submitError && (
                <div className="mb-4 bg-destructive/10 text-destructive text-sm rounded-lg p-3 border border-destructive/20 font-medium">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={submitting}
                    placeholder="e.g. Sarah Johnson"
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={submitting}
                      placeholder="name@email.com (optional)"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      disabled={submitting}
                      placeholder="+1 234 567 890"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="plan">Membership Plan</Label>
                    {loadingPlans && <span className="text-xs text-muted-foreground">Loading plans...</span>}
                  </div>
                  <select
                    id="plan"
                    value={formData.planId || ""}
                    onChange={(e) => {
                      const selectedId = Number(e.target.value)
                      const selectedPlan = plans.find(p => p.id === selectedId)
                      setFormData({ 
                        ...formData, 
                        planId: selectedId, 
                        plan: selectedPlan ? selectedPlan.name : "" 
                      })
                    }}
                    disabled={submitting || loadingPlans}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="" disabled>Select Plan</option>
                    {plans.length === 0 && !loadingPlans && (
                      <option value="" disabled>No active plans available</option>
                    )}
                    {plans.filter(p => p.is_active || (editingMember && editingMember.planId === p.id)).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.price}/{p.duration_unit === 'MONTHS' ? 'mo' : p.duration_unit === 'DAYS' ? 'day' : 'mo'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Join Date</Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                      required
                      disabled={submitting}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      required
                      disabled={submitting}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>

                {(() => {
                  const planPrice = plans.find(p => p.id === formData.planId)?.price ?? editingMember?.plan_price ?? 0
                  const paid = formData.amountPaid ?? planPrice
                  const remaining = Math.max(planPrice - paid, 0)
                  const payStatus = remaining === 0 ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING"
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="amountPaid">Amount Paid (₹)</Label>
                      <Input
                        id="amountPaid"
                        type="number"
                        min={0}
                        step={1}
                        value={formData.amountPaid ?? ""}
                        onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value === "" ? undefined : Math.max(0, Math.floor(Number(e.target.value))) })}
                        disabled={submitting}
                        placeholder={`Plan amount ₹${planPrice.toLocaleString("en-IN")} (leave blank = paid in full)`}
                        className="bg-secondary border-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        Plan ₹{planPrice.toLocaleString("en-IN")} · Remaining ₹{remaining.toLocaleString("en-IN")} · {payStatus}
                      </p>
                    </div>
                  )
                })()}

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Member["status"] })}
                    disabled={submitting}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring">Expiring</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitting ? "Saving..." : editingMember ? "Update" : "Add"} Member
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
