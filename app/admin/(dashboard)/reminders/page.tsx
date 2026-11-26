"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageCircle,
  Send,
  Users,
  AlertTriangle,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Link as LinkIcon,
  Zap,
  Info,
  Save,
  History,
} from "lucide-react"
import { AutomationPanel } from "./AutomationPanel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  fetchExpiredMembers,
  fetchPastExpiredMembers,
  getAutomationTemplates,
  saveAutomationTemplate,
  AutomationTemplates,
  fetchNewMembers,
  fetchExpiringMembers,
  sendWhatsAppMessage,
  sendBulkWhatsAppMessages,
  Member,
  WhatsAppBulkResult,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "expired" | "past_expired" | "welcome" | "renewal" | "automation"

// Tab → template key stored in the backend (used by the daily automation)
const TEMPLATE_KEY: Partial<Record<TabKey, keyof AutomationTemplates>> = {
  expired: "expired",
  past_expired: "past_expired",
  welcome: "welcome",
  renewal: "expiring_soon",
}

interface TabConfig {
  key: TabKey
  label: string
  icon: React.ReactNode
  color: string
  badgeColor: string
  defaultMessage: string
  description: string
  emptyLabel: string
}

interface SendStatus {
  [memberId: number]: "idle" | "sending" | "sent" | "failed"
}

// ─── Default Message Templates ────────────────────────────────────────────────

const DEFAULT_MESSAGES: Record<TabKey, string> = {
  expired:
    "Hi {name}! 👋 Your *{plan}* membership at *Apex Fitness* expired on *{expiry_date}*.\n\nRenew now to get back on track! 💪 Visit us or reply to this message to renew your plan.",
  welcome:
    "Welcome to *Apex Fitness*, {name}! 🎉\n\nYour *{plan}* membership is now active from *{join_date}*. We're thrilled to have you with us!\n\n💪 Let's crush those fitness goals together!",
  renewal:
    "Hi {name}! ⏰ Just a reminder — your *{plan}* membership at *Apex Fitness* expires on *{expiry_date}*.\n\nRenew before it expires to avoid any interruption to your fitness journey! 🏋️\n\nReply to this message or visit us to renew.",
  past_expired:
    "Hi {name}! 💪 We miss you at *Apex Fitness*. Your *{plan}* membership expired on *{expiry_date}*.\n\nRenew today and pick up where you left off! Reply to this message or visit us to renew.",
  automation: "",
}

// ─── Tab Configs ──────────────────────────────────────────────────────────────

const TABS: TabConfig[] = [
  {
    key: "expired",
    label: "Expired Members",
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "text-destructive",
    badgeColor: "bg-destructive/20 text-destructive border border-destructive/30",
    defaultMessage: DEFAULT_MESSAGES.expired,
    description: "Members whose membership just expired and haven't received the expired message yet.",
    emptyLabel: "No expired members found.",
  },
  {
    key: "past_expired",
    label: "Past Expired",
    icon: <History className="h-4 w-4" />,
    color: "text-orange-500",
    badgeColor: "bg-orange-500/20 text-orange-500 border border-orange-500/30",
    defaultMessage: DEFAULT_MESSAGES.past_expired,
    description: "Expired members who already got the expired message and haven't renewed. Followed up every 14 days.",
    emptyLabel: "No past expired members.",
  },
  {
    key: "welcome",
    label: "New Members",
    icon: <UserPlus className="h-4 w-4" />,
    color: "text-primary",
    badgeColor: "bg-primary/20 text-primary border border-primary/30",
    defaultMessage: DEFAULT_MESSAGES.welcome,
    description: "Members who joined in the last 7 days. Send them a warm welcome message.",
    emptyLabel: "No new members in the last 7 days.",
  },
  {
    key: "renewal",
    label: "Renewal Reminders",
    icon: <RefreshCw className="h-4 w-4" />,
    color: "text-chart-5",
    badgeColor: "bg-chart-5/20 text-chart-5 border border-chart-5/30",
    defaultMessage: DEFAULT_MESSAGES.renewal,
    description: "Members whose membership is expiring soon. Send them a timely reminder.",
    emptyLabel: "No members expiring soon.",
  },
  {
    key: "automation",
    label: "Automation",
    icon: <Zap className="h-4 w-4" />,
    color: "text-purple-500",
    badgeColor: "bg-purple-500/20 text-purple-500 border border-purple-500/30",
    defaultMessage: "",
    description: "Manage daily automated WhatsApp messages.",
    emptyLabel: "",
  },
]

// ─── Variable Hints ───────────────────────────────────────────────────────────

const VARIABLE_HINTS = ["{name}", "{plan}", "{expiry_date}", "{join_date}", "{phone}", "{plan_price}"]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function interpolate(template: string, member: Member): string {
  const fmt = (dateStr: string) => {
    if (!dateStr) return "N/A"
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }
  return template
    .replace(/{name}/g, member.name)
    .replace(/{plan}/g, member.plan)
    .replace(/{expiry_date}/g, fmt(member.expiryDate))
    .replace(/{join_date}/g, fmt(member.joinDate))
    .replace(/{phone}/g, member.phone)
    .replace(/{plan_price}/g, String(member.plan_price ?? "N/A"))
}

// ─── BulkResultModal ─────────────────────────────────────────────────────────

function BulkResultModal({
  result,
  onClose,
}: {
  result: WhatsAppBulkResult
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Bulk Send Complete</h3>
            <p className="text-sm text-muted-foreground">
              {result.sent} sent · {result.failed} failed · {result.total} total
            </p>
          </div>
        </div>

        {/* Summary bar */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-primary/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{result.sent}</p>
            <p className="text-xs text-muted-foreground">Sent</p>
          </div>
          <div className="flex-1 bg-destructive/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-destructive">{result.failed}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
        </div>

        {/* Results list */}
        <div className="space-y-2">
          {result.results.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50"
            >
              {r.status === "sent" ? (
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {r.status === "failed" ? r.error : r.phone}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  r.status === "sent"
                    ? "bg-primary/20 text-primary"
                    : "bg-destructive/20 text-destructive"
                }`}
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>

        <Button onClick={onClose} className="w-full mt-4">
          Close
        </Button>
      </motion.div>
    </motion.div>
  )
}

// ─── Tab Panel ────────────────────────────────────────────────────────────────

function TabPanel({
  tab,
  wahaUrl,
  wahaSession = "default",
  wahaApiKey = "",
}: {
  tab: TabConfig
  wahaUrl: string
  wahaSession?: string
  wahaApiKey?: string
}) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [messageTemplate, setMessageTemplate] = useState(tab.defaultMessage)
  const [sendStatus, setSendStatus] = useState<SendStatus>({})
  const [bulkSending, setBulkSending] = useState(false)
  const [bulkResult, setBulkResult] = useState<WhatsAppBulkResult | null>(null)
  const [expandedPreview, setExpandedPreview] = useState<number | null>(null)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const { toast } = useToast()
  const templateKey = TEMPLATE_KEY[tab.key]

  // Load the template saved in the backend (what the daily automation actually sends)
  useEffect(() => {
    if (!templateKey) return
    getAutomationTemplates()
      .then((t) => setMessageTemplate(t[templateKey]))
      .catch(() => {})
  }, [templateKey])

  const handleSaveTemplate = async () => {
    if (!templateKey || savingTemplate) return
    try {
      setSavingTemplate(true)
      await saveAutomationTemplate(templateKey, messageTemplate)
      toast({ title: "✓ Template saved for daily automation", duration: 2500 })
    } catch {
      toast({ title: "Failed to save template", variant: "destructive", duration: 2500 })
    } finally {
      setSavingTemplate(false)
    }
  }

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      let data: Member[] = []
      if (tab.key === "expired") data = await fetchExpiredMembers()
      else if (tab.key === "past_expired") data = await fetchPastExpiredMembers()
      else if (tab.key === "welcome") data = await fetchNewMembers()
      else data = await fetchExpiringMembers()
      setMembers(data)
    } catch (err: any) {
      toast({
        title: "Failed to load members",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [tab.key])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const handleSendSingle = async (member: Member) => {
    if (!wahaUrl.trim()) {
      toast({ title: "WAHA URL missing", description: "Please enter your WAHA API URL above.", variant: "destructive" })
      return
    }
    const msg = interpolate(messageTemplate, member)
    setSendStatus((s) => ({ ...s, [member.id]: "sending" }))
    try {
      await sendWhatsAppMessage(wahaUrl.trim(), member.phone, msg, wahaSession, wahaApiKey)
      setSendStatus((s) => ({ ...s, [member.id]: "sent" }))
      toast({ title: "Message Sent!", description: `WhatsApp sent to ${member.name}` })
    } catch (err: any) {
      setSendStatus((s) => ({ ...s, [member.id]: "failed" }))
      toast({ title: "Send Failed", description: err.message, variant: "destructive" })
    }
  }

  const handleSendAll = async () => {
    if (!wahaUrl.trim()) {
      toast({ title: "WAHA URL missing", description: "Please enter your WAHA API URL above.", variant: "destructive" })
      return
    }
    if (members.length === 0) {
      toast({ title: "No members", description: "No members to send messages to.", variant: "destructive" })
      return
    }
    setBulkSending(true)
    try {
      const result = await sendBulkWhatsAppMessages(wahaUrl.trim(), messageTemplate, tab.key as "expired" | "past_expired" | "welcome" | "renewal", wahaSession, wahaApiKey)
      setBulkResult(result)
      // Update send statuses
      const newStatus: SendStatus = {}
      result.results.forEach((r) => {
        newStatus[r.id] = r.status === "sent" ? "sent" : "failed"
      })
      setSendStatus((s) => ({ ...s, ...newStatus }))
    } catch (err: any) {
      toast({ title: "Bulk Send Failed", description: err.message, variant: "destructive" })
    } finally {
      setBulkSending(false)
    }
  }

  const insertVariable = (variable: string) => {
    setMessageTemplate((prev) => prev + variable)
  }

  return (
    <div className="space-y-5">
      {/* Message Template Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Customize Message Template</h3>
        </div>

        <Label htmlFor={`msg-${tab.key}`} className="text-xs text-muted-foreground mb-2 block">
          Use variables below — they&apos;ll be replaced with each member&apos;s actual data when sending.
        </Label>

        {/* Variable chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {VARIABLE_HINTS.map((v) => (
            <button
              key={v}
              onClick={() => insertVariable(v)}
              className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors font-mono"
            >
              {v}
            </button>
          ))}
        </div>

        <textarea
          id={`msg-${tab.key}`}
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
          placeholder="Type your message here..."
        />

        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setMessageTemplate(tab.defaultMessage)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Reset to default
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveTemplate}
              disabled={savingTemplate}
              className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {savingTemplate ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Save for automation
            </button>
            <span className="text-xs text-muted-foreground">{messageTemplate.length} chars</span>
          </div>
        </div>
      </motion.div>

      {/* Members list */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${tab.color}`}>
              {tab.icon}
              {loading ? "Loading..." : `${members.length} member${members.length !== 1 ? "s" : ""}`}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:block">— {tab.description}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={loadMembers}
              className="h-8 w-8"
              disabled={loading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={handleSendAll}
              disabled={bulkSending || loading || members.length === 0}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
              id={`send-all-${tab.key}`}
            >
              {bulkSending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
              {bulkSending ? "Sending..." : "Send to All"}
            </Button>
          </div>
        </div>

        {/* Members */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-7 w-7 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{tab.emptyLabel}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {members.map((member) => {
              const status = sendStatus[member.id] || "idle"
              const preview = interpolate(messageTemplate, member)
              const isExpanded = expandedPreview === member.id

              return (
                <div key={member.id} className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-xs font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${tab.badgeColor}`}>
                          {member.plan}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{member.phone}</p>
                    </div>

                    {/* Dates */}
                    <div className="hidden sm:block text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {tab.key === "welcome" ? "Joined" : tab.key === "expired" || tab.key === "past_expired" ? "Expired" : "Expires"}
                      </p>
                      <p className="text-xs font-medium">
                        {tab.key === "welcome" ? member.joinDate : member.expiryDate}
                      </p>
                    </div>

                    {/* Preview toggle */}
                    <button
                      onClick={() => setExpandedPreview(isExpanded ? null : member.id)}
                      className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground flex-shrink-0"
                      title="Preview message"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Send button */}
                    <Button
                      size="sm"
                      variant={status === "sent" ? "outline" : "default"}
                      disabled={status === "sending"}
                      onClick={() => handleSendSingle(member)}
                      className={`flex-shrink-0 h-8 flex items-center gap-1.5 ${
                        status === "sent"
                          ? "border-primary/40 text-primary"
                          : status === "failed"
                          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                      id={`send-${tab.key}-${member.id}`}
                    >
                      {status === "sending" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {status === "sent" && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {status === "failed" && <XCircle className="h-3.5 w-3.5" />}
                      {status === "idle" && <Send className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline text-xs">
                        {status === "sending" ? "Sending..." : status === "sent" ? "Sent" : status === "failed" ? "Retry" : "Send"}
                      </span>
                    </Button>
                  </div>

                  {/* Message preview */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 ml-12 p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Info className="h-3 w-3" /> Message preview for {member.name}
                          </p>
                          <p className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                            {preview}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Bulk Result Modal */}
      <AnimatePresence>
        {bulkResult && (
          <BulkResultModal result={bulkResult} onClose={() => setBulkResult(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RemindersPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("expired")

  // Persist WAHA settings across navigation using localStorage
  const [wahaUrl, setWahaUrlState] = useState("")
  const [wahaSession, setWahaSessionState] = useState("default")
  const [wahaApiKey, setWahaApiKeyState] = useState("")
  const [showSettings, setShowSettings] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem("waha_url")
    const savedSession = localStorage.getItem("waha_session")
    const savedApiKey = localStorage.getItem("waha_api_key")
    if (savedUrl) setWahaUrlState(savedUrl)
    if (savedSession) setWahaSessionState(savedSession)
    if (savedApiKey) setWahaApiKeyState(savedApiKey)
  }, [])

  // Persist to localStorage whenever values change
  const setWahaUrl = useCallback((val: string) => {
    setWahaUrlState(val)
    localStorage.setItem("waha_url", val)
  }, [])

  const setWahaSession = useCallback((val: string) => {
    setWahaSessionState(val)
    localStorage.setItem("waha_session", val)
  }, [])

  const setWahaApiKey = useCallback((val: string) => {
    setWahaApiKeyState(val)
    localStorage.setItem("waha_api_key", val)
  }, [])

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <MessageCircle className="h-7 w-7 text-primary" />
            Reminders
          </h1>
          <p className="text-muted-foreground mt-1">
            Send automated WhatsApp messages to your gym members via WAHA
          </p>
        </div>
      </div>

      {/* WAHA Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
          id="waha-settings-toggle"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <LinkIcon className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-sm">WAHA API Settings</span>
            {wahaUrl ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Connected</span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">Not configured</span>
            )}
          </div>
          {showSettings ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="waha-url" className="text-sm font-medium">
                      WAHA API URL <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="waha-url"
                      value={wahaUrl}
                      onChange={(e) => setWahaUrl(e.target.value)}
                      placeholder="http://localhost:3000  or  https://your-waha-server.com"
                      className="bg-secondary border-border font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Base URL of your WAHA instance. e.g.{" "}
                      <code className="bg-secondary px-1 rounded">http://localhost:3000</code>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waha-session" className="text-sm font-medium">
                      WAHA Session Name
                    </Label>
                    <Input
                      id="waha-session"
                      value={wahaSession}
                      onChange={(e) => setWahaSession(e.target.value)}
                      placeholder="default"
                      className="bg-secondary border-border font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      The session name configured in WAHA (default: <code className="bg-secondary px-1 rounded">default</code>)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waha-api-key" className="text-sm font-medium">
                      API Key <span className="text-muted-foreground text-xs">(X-Api-Key)</span>
                    </Label>
                    <Input
                      id="waha-api-key"
                      type="password"
                      value={wahaApiKey}
                      onChange={(e) => setWahaApiKey(e.target.value)}
                      placeholder="Leave blank if no auth required"
                      className="bg-secondary border-border font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your WAHA <code className="bg-secondary px-1 rounded">X-Api-Key</code> header value (if configured)
                    </p>
                  </div>
                </div>

                {/* Info box */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/15">
                  <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Messages are sent via{" "}
                    <code className="bg-secondary px-1 rounded">[WAHA URL]/api/sendText</code>. Make
                    sure your WAHA instance is running and your session is authenticated. Phone numbers
                    without country code will automatically get <strong>+91</strong> prefix.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass-card rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Tab Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === "automation" ? (
            <AutomationPanel />
          ) : (
            <TabPanel tab={activeTabConfig} wahaUrl={wahaUrl} wahaSession={wahaSession} wahaApiKey={wahaApiKey} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
