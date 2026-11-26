"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Download, TrendingUp, TrendingDown, Users, DollarSign, Calendar, AlertTriangle, Loader2 } from "lucide-react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts"
import { Button } from "@/components/ui/button"
import { fetchReports, ReportsData } from "@/lib/api"

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        const reports = await fetchReports()
        setData(reports)
      } catch (err: any) {
        console.error("Reports page load failed:", err)
        setError(err.message || "Failed to fetch reports statistics.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const exportToCSV = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAllReports = () => {
    if (!data) return;

    let csv = "Gym Management System - Analytics & Reports Export\n";
    csv += `Generated At,${new Date().toLocaleString()}\n\n`;

    csv += "SUMMARY STATISTICS\n";
    csv += "Metric,Value\n";
    csv += `Total Revenue (YTD),$${(data.cards.totalRevenueYTD || 0).toLocaleString()}\n`;
    csv += `New Members (This Month),${data.cards.newMembersThisMonth}\n`;
    csv += `Avg. Daily Visits,${data.cards.avgDailyVisits || 0}\n`;
    csv += `Expiring This Month,${data.cards.expiringThisMonth}\n\n`;

    csv += "MONTHLY REVENUE & MEMBER GROWTH\n";
    csv += "Month,Monthly Revenue,Cumulative Members\n";
    (data.revenueData || []).forEach((row) => {
      csv += `${row.month},$${row.revenue},${row.members}\n`;
    });
    csv += "\n";

    csv += "EXPIRING MEMBERSHIPS BREAKDOWN\n";
    csv += "Period,Count\n";
    csv += `This Week,${data.expiringMemberships.thisWeek}\n`;
    csv += `Next Week,${data.expiringMemberships.nextWeek}\n`;
    csv += `This Month,${data.expiringMemberships.thisMonth}\n`;
    csv += `Next Month,${data.expiringMemberships.nextMonth}\n`;

    exportToCSV(`gym_all_reports_${new Date().toISOString().split("T")[0]}.csv`, csv);
  };

  const handleExportRevenueReport = () => {
    if (!data) return;

    let csv = "Monthly Revenue Report\n";
    csv += `Generated At,${new Date().toLocaleString()}\n\n`;
    csv += "Month,Revenue,Cumulative Members\n";
    (data.revenueData || []).forEach((row) => {
      csv += `${row.month},${row.revenue},${row.members}\n`;
    });

    exportToCSV(`gym_revenue_report_${new Date().toISOString().split("T")[0]}.csv`, csv);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Skeleton Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-secondary rounded-lg"></div>
            <div className="h-4 w-64 bg-secondary rounded-lg"></div>
          </div>
          <div className="h-10 w-44 bg-secondary rounded-lg"></div>
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

        {/* Skeleton Big Chart */}
        <div className="glass-card rounded-xl p-6 h-[400px] bg-secondary/20"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass-card rounded-xl p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Failed to Load Reports</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Retry
        </Button>
      </div>
    )
  }

  const summaryStats = [
    { 
      label: "Total Revenue (YTD)", 
      value: data.cards.totalRevenueYTD !== undefined ? `$${data.cards.totalRevenueYTD.toLocaleString()}` : "$0", 
      change: "+23.5%", 
      trend: "up",
      icon: DollarSign,
      isMock: false
    },
    { 
      label: "New Members (This Month)", 
      value: data.cards.newMembersThisMonth.toLocaleString(), 
      change: "+18.2%", 
      trend: "up",
      icon: Users,
      isMock: false
    },
    { 
      label: "Avg. Daily Visits", 
      value: data.cards.avgDailyVisits !== undefined ? data.cards.avgDailyVisits.toLocaleString() : "0", 
      change: "+12.8%", 
      trend: "up",
      icon: Calendar,
      isMock: false
    },
    { 
      label: "Expiring This Month", 
      value: data.cards.expiringThisMonth.toLocaleString(), 
      change: "-8.3%", 
      trend: "down",
      icon: AlertTriangle,
      isMock: false
    },
  ]

  const expiringPlans = [
    { period: "This Week", count: data.expiringMemberships.thisWeek },
    { period: "Next Week", count: data.expiringMemberships.nextWeek },
    { period: "This Month", count: data.expiringMemberships.thisMonth },
    { period: "Next Month", count: data.expiringMemberships.nextMonth },
  ]

  const revenueChartData = data.revenueData || [];
  const membershipGrowthData = data.membershipGrowth || [];
  const attendanceChartData = data.attendanceData || [];
  const planDistributionData = data.planDistribution || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for your gym database</p>
        </div>
        <Button onClick={handleExportAllReports} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Download className="h-4 w-4 mr-2" />
          Export All Reports
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="glass-card rounded-xl p-6 relative overflow-hidden"
          >
            {stat.isMock && (
              <div className="absolute top-2 right-2 bg-secondary/50 text-[10px] text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                TODO
              </div>
            )}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.trend === "up" ? "text-primary" : "text-chart-5"}`}>
                {stat.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Revenue Report
            </h3>
            <p className="text-sm text-muted-foreground">Monthly revenue and member growth</p>
          </div>
          <Button onClick={handleExportRevenueReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="h-[350px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.85 0.25 142)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="oklch(0.85 0.25 142)" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="oklch(0.85 0.25 142)"
                strokeWidth={3}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Two Column Charts (Commented out for easy customization - uncomment to display)
      <div className="grid lg:grid-cols-2 gap-6">
        // Membership Growth by Plan
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Membership Growth
              </h3>
              <p className="text-sm text-muted-foreground">Members by plan type</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={membershipGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 250)" />
                <XAxis dataKey="month" stroke="oklch(0.65 0 0)" fontSize={12} />
                <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "oklch(0.12 0.005 250)", 
                    border: "1px solid oklch(0.25 0.01 250)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)"
                  }}
                />
                <Bar dataKey="basic" name="Basic" fill="oklch(0.65 0 0)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="elite" name="Elite" fill="oklch(0.85 0.25 142)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vip" name="VIP" fill="oklch(0.75 0.18 100)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "oklch(0.65 0 0)" }} />
              <span className="text-sm text-muted-foreground">Basic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "oklch(0.85 0.25 142)" }} />
              <span className="text-sm text-muted-foreground">Elite</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "oklch(0.75 0.18 100)" }} />
              <span className="text-sm text-muted-foreground">VIP</span>
            </div>
          </div>
        </motion.div>

        // Attendance Analytics
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Weekly Attendance
              </h3>
              <p className="text-sm text-muted-foreground">Average daily visits this week</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 250)" />
                <XAxis dataKey="day" stroke="oklch(0.65 0 0)" fontSize={12} />
                <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "oklch(0.12 0.005 250)", 
                    border: "1px solid oklch(0.25 0.01 250)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)"
                  }}
                />
                <Bar dataKey="visits" name="Visits" fill="oklch(0.85 0.25 142)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      */}

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Plan Distribution (Commented out for easy customization - uncomment to display)
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Plan Distribution
              </h3>
              <p className="text-sm text-muted-foreground">Current membership breakdown</p>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planDistributionData.map((entry, index) => (
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
          <div className="space-y-2 mt-4">
            {planDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
        */}

        {/* Expiring Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="lg:col-span-3 glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Expiring Memberships</h3>
              <p className="text-sm text-muted-foreground">Active database members requiring renewal follow-up</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {expiringPlans.map((item, index) => (
              <div
                key={item.period}
                className={`p-4 rounded-xl ${
                  index === 0 ? "bg-chart-5/10 border border-chart-5/30 animate-pulse" : "bg-secondary"
                }`}
              >
                <div className={`text-3xl font-bold mb-1 ${index === 0 ? "text-chart-5" : ""}`}>
                  {item.count}
                </div>
                <div className="text-sm text-muted-foreground">{item.period}</div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <h4 className="font-medium mb-4">Quick Actions</h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                Send Renewal Reminders
              </Button>
              <Button variant="outline" size="sm">
                Export Expiring List
              </Button>
              <Button variant="outline" size="sm">
                Schedule Follow-ups
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
