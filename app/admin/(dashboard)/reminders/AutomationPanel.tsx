import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Zap, Play, Clock, CheckCircle2, XCircle, AlertCircle, Settings2, Loader2, Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { 
  getAutomationStatus, 
  getAutomationLogs, 
  updateAutomationSettings, 
  runDailyAutomation,
  AutomationStatus,
  AutomationLog,
  AutomationSettings
} from "@/lib/api"

export function AutomationPanel() {
  const [status, setStatus] = useState<AutomationStatus | null>(null)
  const [logs, setLogs] = useState<AutomationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [loadError, setLoadError] = useState(false)
  const [settings, setSettings] = useState<AutomationSettings | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setLoadError(false)
      const [statusData, logsData] = await Promise.all([
        getAutomationStatus().catch(() => null),
        getAutomationLogs().catch(() => [])
      ])
      if (statusData) {
        setStatus(statusData)
        setSettings({
          isEnabled: statusData.enabled,
          scheduleTime: statusData.time,
          timezone: statusData.timezone
        })
      } else {
        setLoadError(true)
      }
      setLogs(logsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (saving || !settings) return
    try {
      setSaving(true)
      await updateAutomationSettings(settings)
      toast({ title: "✓ Automation settings saved successfully", duration: 2500 })
      // Refresh the status card from the DB without remounting the form
      const fresh = await getAutomationStatus().catch(() => null)
      if (fresh) setStatus(fresh)
    } catch (err: any) {
      toast({
        title: "Failed to save automation settings",
        variant: "destructive",
        duration: 2500,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRunManual = async (dryRun: boolean = false) => {
    try {
      setRunning(true)
      const res = await runDailyAutomation(dryRun)
      toast({
        title: dryRun ? "Dry Run Completed" : "Automation Completed",
        description: `Sent: ${res.sent}, Failed: ${res.failed}, Skipped: ${res.skipped}`,
      })
      fetchData()
    } catch (err: any) {
      toast({
        title: "Execution Failed",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setRunning(false)
    }
  }

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading automation data...</p>
      </div>
    )
  }

  if (loadError || !settings) {
    return (
      <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Failed to load automation settings.</p>
        <Button variant="outline" onClick={fetchData}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status Card */}
        <div className="glass-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Daily Automation</h3>
              <p className="text-sm text-muted-foreground">Status & Overview</p>
            </div>
          </div>
          
          {status ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Status</span>
                <span className="flex items-center gap-2 font-medium">
                  <span className={`w-2 h-2 rounded-full ${status.enabled ? 'bg-emerald-500' : 'bg-muted'}`}></span>
                  {status.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{status.time}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Last Run</span>
                <span className="font-medium">{status.lastRun || "Never"}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center p-3 rounded-lg bg-primary/5">
                  <div className="text-xl font-bold text-primary">{status.sent}</div>
                  <div className="text-xs text-muted-foreground">Sent</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-destructive/5">
                  <div className="text-xl font-bold text-destructive">{status.failed}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <div className="text-xl font-bold">{status.skipped}</div>
                  <div className="text-xs text-muted-foreground">Skipped</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Status unavailable
            </div>
          )}
        </div>

        {/* Settings Card */}
        <div className="glass-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-secondary rounded-lg">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Configuration</h3>
              <p className="text-sm text-muted-foreground">Automation preferences</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-automation" className="cursor-pointer">Enable Daily Automation</Label>
              <input 
                id="enable-automation" 
                type="checkbox" 
                checked={settings.isEnabled}
                onChange={e => setSettings({...settings, isEnabled: e.target.checked})}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schedule-time">Scheduled Time</Label>
              <Input 
                id="schedule-time" 
                type="time" 
                value={settings.scheduleTime}
                onChange={e => setSettings({...settings, scheduleTime: e.target.value})}
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">Timezone: {settings.timezone ?? "Asia/Kolkata"}</p>
            </div>

            <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>

      {/* Manual Actions */}
      <div className="glass-card rounded-xl p-6 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">Manual Trigger</h3>
          <p className="text-sm text-muted-foreground">Run the automation immediately</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={() => handleRunManual(true)} disabled={running} className="flex-1 sm:flex-none">
            DRY RUN
          </Button>
          <Button onClick={() => handleRunManual(false)} disabled={running || !status?.enabled} className="flex-1 sm:flex-none">
            {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Run Automation Now
          </Button>
        </div>
      </div>

      {/* History */}
      <div className="glass-card rounded-xl p-6 border border-border">
        <h3 className="font-semibold mb-6">Message Automation History</h3>
        
        {logs.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
            No automation history found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="p-3 font-semibold text-sm">Member</th>
                  <th className="p-3 font-semibold text-sm">Message Type</th>
                  <th className="p-3 font-semibold text-sm">Status</th>
                  <th className="p-3 font-semibold text-sm">Sent At</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-secondary/10">
                    <td className="p-3">
                      <div className="font-medium">{log.memberName}</div>
                      <div className="text-xs text-muted-foreground">{log.memberPhone}</div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm capitalize">{log.messageType.replace('_', ' ')}</span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                        log.status === "SENT" ? "bg-emerald-500/10 text-emerald-500" :
                        log.status === "FAILED" ? "bg-destructive/10 text-destructive" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {log.status === "SENT" && <CheckCircle2 className="h-3 w-3" />}
                        {log.status === "FAILED" && <XCircle className="h-3 w-3" />}
                        {log.status === "SKIPPED" && <AlertCircle className="h-3 w-3" />}
                        {log.status}
                      </span>
                      {log.error && <div className="text-xs text-destructive mt-1 max-w-[200px] truncate">{log.error}</div>}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(log.sentAt).toLocaleString('en-IN', {
                        dateStyle: 'short', timeStyle: 'short'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
