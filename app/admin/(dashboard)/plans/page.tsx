"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit2, Trash2, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchPlans, createPlan, Plan } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    duration: 30,
    duration_unit: "Days",
    price: 0,
    description: "",
    is_active: true,
  })

  const loadPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchPlans()
      setPlans(data)
    } catch (err: any) {
      setError(err.message || "Failed to load plans from server.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const openAddModal = () => {
    setSubmitError(null)
    setFormData({
      name: "",
      duration: 30,
      duration_unit: "Days",
      price: 0,
      description: "",
      is_active: true,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (name === "duration" || name === "price") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    // Validation
    if (!formData.name.trim()) {
      setSubmitError("Plan name is required.")
      return
    }
    if (formData.duration <= 0) {
      setSubmitError("Duration must be a positive number.")
      return
    }
    if (formData.price < 0) {
      setSubmitError("Price cannot be negative.")
      return
    }

    try {
      setSubmitting(true)
      await createPlan({
        name: formData.name,
        duration: formData.duration,
        duration_unit: formData.duration_unit.toUpperCase(),
        price: formData.price,
        description: formData.description,
        is_active: formData.is_active,
      })
      
      toast({
        title: "Success",
        description: "Plan created successfully",
        variant: "default",
      })
      
      closeModal()
      loadPlans()
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create plan.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Membership Plans</h1>
          <p className="text-muted-foreground">Manage your gym's membership plans</p>
        </div>
        <Button onClick={openAddModal} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {loading ? (
        <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading plans...</p>
        </div>
      ) : error ? (
        <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center space-y-4">
          <div className="text-destructive font-medium">{error}</div>
          <Button variant="outline" onClick={loadPlans}>Try Again</Button>
        </div>
      ) : plans.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <p className="text-muted-foreground">No plans found.</p>
          <Button onClick={openAddModal}>Create Your First Plan</Button>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="p-4 font-semibold text-sm">Plan Name</th>
                  <th className="p-4 font-semibold text-sm">Duration</th>
                  <th className="p-4 font-semibold text-sm">Price</th>
                  <th className="p-4 font-semibold text-sm">Status</th>
                  <th className="p-4 font-semibold text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{plan.description}</div>
                    </td>
                    <td className="p-4 text-sm">{plan.duration} {plan.duration_unit}</td>
                    <td className="p-4 text-sm">${plan.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        plan.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      }`}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Create Plan</h2>
              <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {submitError && (
                <div className="mb-6 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                  {submitError}
                </div>
              )}
              
              <form id="plan-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name <span className="text-destructive">*</span></Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    placeholder="e.g. Premium Monthly" 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration <span className="text-destructive">*</span></Label>
                    <Input 
                      id="duration" 
                      name="duration" 
                      type="number"
                      min="1"
                      value={formData.duration} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_unit">Unit</Label>
                    <select
                      id="duration_unit"
                      name="duration_unit"
                      value={formData.duration_unit}
                      onChange={handleInputChange}
                      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="Days">Days</option>
                      <option value="Months">Months</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) <span className="text-destructive">*</span></Label>
                  <Input 
                    id="price" 
                    name="price" 
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price} 
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Plan details..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">Active Plan</Label>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border bg-secondary/30 flex justify-end gap-3 mt-auto">
              <Button type="button" variant="outline" onClick={closeModal} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" form="plan-form" disabled={submitting} className="min-w-[100px]">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Plan"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
