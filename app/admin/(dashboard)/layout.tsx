"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Menu, 
  X, 
  Bell, 
  Search,
  Dumbbell,
  LogOut,
  Settings,
  ChevronDown,
  MessageCircle,
  Wallet
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/plans", label: "Plans", icon: Dumbbell },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/reminders", label: "Reminders", icon: MessageCircle },
  { href: "/admin/dues", label: "Outstanding Dues", icon: Wallet },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-sidebar fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Dumbbell className="h-7 w-7 text-sidebar-primary" />
            <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
              APEX<span className="text-sidebar-primary">ADMIN</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <link.icon className={`h-5 w-5 ${isActive ? "text-sidebar-primary" : ""}`} />
                <span className="font-medium">{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent/50">
            <div className="w-10 h-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
              <span className="text-sidebar-primary font-semibold">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">admin@apexfitness.com</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" className="w-full mt-2 justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-50 lg:hidden"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                  <Dumbbell className="h-7 w-7 text-sidebar-primary" />
                  <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
                    APEX<span className="text-sidebar-primary">ADMIN</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-sidebar-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                      }`}
                    >
                      <link.icon className={`h-5 w-5 ${isActive ? "text-sidebar-primary" : ""}`} />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-20">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search */}
            <div className="hidden sm:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members, reports..."
                  className="pl-9 bg-secondary border-border"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Settings className="h-5 w-5" />
              </Button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-sm font-semibold">AD</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-xl py-2 z-50"
                    >
                      <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
