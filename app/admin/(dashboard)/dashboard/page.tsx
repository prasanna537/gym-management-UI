"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Users, UserCheck, UserX, DollarSign, TrendingUp, TrendingDown, Bell, Calendar, ArrowUpRight } from "lucide-react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { Button } from "@/components/ui/button"
import { fetchDashboard, fetchRevenue, fetchReports, DashboardData, DBMember } from "@/lib/api"
import Link from "next/link"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [revenue, setRevenue] = useState<number | null>(null)
  const [revenueChange, setRevenueChange] = useState<number | null>(null)
  const [revenueChartData, setRevenueChartData] = useState<{ month: string; revenue: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        const [dashRes, revRes, reportsRes] = await Promise.all([
          fetchDashboard(),
          fetchRevenue().catch((err) => {
            console.error("Revenue fetch failed, using fallback:", err)
            return { totalRevenue: 0, totalMembersCount: 0 }
          }),
          fetchReports().catch((err) => {
            console.error("Reports fetch failed, using fallback:", err)
            return null
          })
        ])
        setData(dashRes)
        setRevenue(reportsRes?.cards?.revenueThisMonth ?? revRes.totalRevenue)
        if (reportsRes && reportsRes.revenueData) {
          setRevenueChartData(reportsRes.revenueData)
          const rd = reportsRes.revenueData
          const prev = rd.length > 1 ? rd[rd.length - 2].revenue : 0
          const curr = rd.length > 0 ? rd[rd.length - 1].revenue : 0
          setRevenueChange(prev > 0 ? Math.round(((curr - prev) / prev) * 1000) / 10 : null)
        }
      } catch (err: any) {
        console.error("Dashboard page load failed:", err)
        setError(err.message || "Failed to load dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Skeleton Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-secondary rounded-lg"></div>
            <div className="h-4 w-64 bg-secondary rounded-lg"></div>
          </div>
          <div className="h-10 w-36 bg-secondary rounded-lg"></div>
        </div>
        
        {/* Skeleton Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-6 h-32 space-y-4">
              <div className="flex justify-between">
                <div className="w-12 h-12 rounded-xl bg-secondary"></div>
                <div className="w-16 h-4 bg-secondary rounded"></div>
              </div>
              <div className="h-6 w-24 bg-secondary rounded"></div>
            </div>
          ))}
        </div>

        {/* Skeleton Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-xl p-6 h-[380px] bg-secondary/20"></div>
          <div className="glass-card rounded-xl p-6 h-[380px] bg-secondary/20"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass-card rounded-xl p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <UserX className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Failed to Load Dashboard</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Try Again
        </Button>
      </div>
    )
  }

  const stats = [
    { 
      label: "Total Members", 
      value: data.totalMembers.toLocaleString(), 
      icon: Users,
      color: "text-primary"
    },
    { 
      label: "Active Members", 
      value: data.activeMembers.toLocaleString(), 
      icon: UserCheck,
      color: "text-chart-2"
    },
    { 
      label: "Expired", 
      value: data.expiredMembers.toLocaleString(), 
      icon: UserX,
      color: "text-chart-5"
    },
    { 
      label: "Revenue This Month", 
      value: `$${(revenue ?? 0).toLocaleString()}`,
      change: revenueChange !== null ? `${revenueChange > 0 ? "+" : ""}${revenueChange}%` : undefined,
      trend: (revenueChange ?? 0) >= 0 ? "up" : "down",
      icon: DollarSign,
      color: "text-chart-4"
    },
  ]

  const membershipData = [
    { name: "Active", value: data.memberStatus.active, color: "oklch(0.85 0.25 142)" },
    { name: "Expired", value: data.memberStatus.expired, color: "oklch(0.65 0.2 30)" },
  ]

  // Fallback if recentMembers/upcomingRenewals are empty
  const defaultRecentMembers = data.recentMembers.length > 0 ? data.recentMembers : [];
  const defaultUpcomingRenewals = data.upcomingRenewals.length > 0 ? data.upcomingRenewals : [];

  const notifications = [
    { message: `${data.upcomingRenewals.length} memberships expiring soon`, type: "warning" },
    { message: data.recentMembers.length > 0 ? `New member registration: ${data.recentMembers[0].name}` : "Ready to accept new members", type: "info" },
    { message: "Monthly report ready for download", type: "success" },
  ]

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  const formatLongDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your gym overview.</p>
        </div>
        <Link href="/admin/reports">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            View Analytics Reports
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              {stat.change && (
                <div className={`flex items-center gap-1 text-sm ${stat.trend === "up" ? "text-primary" : "text-chart-5"}`}>
                  {stat.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {stat.change}
                </div>
              )}
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-2 glass-card rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Revenue Analytics</h3>
            <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded font-semibold animate-pulse">Live Database Sync</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 250)" />
                <XAxis dataKey="month" stroke="oklch(0.65 0 0)" fontSize={12} />
                <YAxis stroke="oklch(0.65 0 0)" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "oklch(0.12 0.005 250)", 
                    border: "1px solid oklch(0.25 0.01 250)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)"
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="oklch(0.85 0.25 142)" 
                  strokeWidth={3}
                  dot={{ fill: "oklch(0.85 0.25 142)", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "oklch(0.85 0.25 142)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Membership Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-6">Membership Status</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={membershipData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {membershipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "oklch(0.12 0.005 250)", 
                    border: "1px solid oklch(0.25 0.01 250)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {membershipData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Members Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="lg:col-span-2 glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Members</h3>
            <Link href="/admin/members">
              <Button variant="ghost" size="sm" className="text-primary hover:bg-secondary/40">
                View All <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            {defaultRecentMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No recent members found in database.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Join Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Expiry</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {defaultRecentMembers.map((member, idx) => {
                    const statusLower = member.status ? member.status.toLowerCase() : "";
                    const normalizedStatus = statusLower === "active" ? "Active" : statusLower === "expired" ? "Expired" : "Expiring";
                    
                    return (
                      <tr key={member.id || idx} className="border-b border-border last:border-0 hover:bg-secondary/10 transition-colors">
                        <td className="py-3 px-4 font-medium">{member.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            member.plan === "VIP" ? "bg-chart-4/20 text-chart-4" :
                            member.plan === "Elite" ? "bg-primary/20 text-primary" :
                            "bg-secondary text-secondary-foreground"
                          }`}>
                            {member.plan}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                          {formatLongDate(member.join_date)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                          {formatLongDate(member.expiry_date)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            normalizedStatus === "Active" ? "bg-primary/20 text-primary" :
                            normalizedStatus === "Expiring" ? "bg-chart-5/20 text-chart-5" :
                            "bg-destructive/20 text-destructive"
                          }`}>
                            {normalizedStatus}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Right Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="space-y-6"
        >
          {/* Notifications */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="space-y-3">
              {notifications.map((notif, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    notif.type === "warning" ? "bg-chart-5" :
                    notif.type === "success" ? "bg-primary" : "bg-chart-2"
                  }`} />
                  <span className="text-muted-foreground">{notif.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Renewals */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Upcoming Renewals (7 Days)</h3>
            </div>
            <div className="space-y-3">
              {defaultUpcomingRenewals.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No upcoming renewals expiring in next 7 days.
                </p>
              ) : (
                defaultUpcomingRenewals.map((renewal, idx) => (
                  <div key={renewal.id || idx} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">{renewal.name}</p>
                      <p className="text-xs text-muted-foreground">{renewal.plan} Plan</p>
                    </div>
                    <span className="text-xs text-chart-5 font-semibold bg-chart-5/10 px-2 py-1 rounded">
                      {formatShortDate(renewal.expiry_date)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
