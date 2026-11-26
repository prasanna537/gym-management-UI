export interface Plan {
  id: number;
  name: string;
  duration: number;
  duration_unit: string;
  price: number;
  description: string;
  is_active: boolean;
}

export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID";

export interface DBMember {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  plan: string | { id: number; name: string;[k: string]: any };
  plan_price: number | null;
  plan_amount?: number;
  amount_paid?: number | null;
  remaining_amount?: number;
  payment_status?: PaymentStatus;
  join_date: string;
  expiry_date: string;
  status: string;
  created_at: string;
  plan_id?: number;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  plan: string;
  plan_price: number;
  joinDate: string;
  expiryDate: string;
  status: "Active" | "Expired" | "Expiring";
  planId?: number;
  // Payment tracking (computed by the backend)
  amountPaid?: number;
  remainingAmount?: number;
  paymentStatus?: PaymentStatus;
}

export type DashboardMember = Omit<DBMember, "plan"> & { plan: string };

export interface DashboardData {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  memberStatus: {
    active: number;
    expired: number;
  };
  recentMembers: DashboardMember[];
  upcomingRenewals: DashboardMember[];
}

export interface ReportsData {
  cards: {
    newMembersThisMonth: number;
    expiringThisMonth: number;
    totalRevenueYTD?: number;
    revenueThisMonth?: number;
    avgDailyVisits?: number;
  };
  expiringMemberships: {
    thisWeek: number;
    nextWeek: number;
    thisMonth: number;
    nextMonth: number;
  };
  revenueData?: { month: string; revenue: number; members: number }[];
  membershipGrowth?: { month: string; basic: number; elite: number; vip: number }[];
  attendanceData?: { day: string; visits: number }[];
  planDistribution?: { name: string; value: number; color: string }[];
  todo: {
    revenueAnalytics: boolean;
    membershipGrowth: boolean;
    weeklyAttendance: boolean;
    planDistribution: boolean;
  };
}

export interface RevenueData {
  totalRevenue: number;
  totalMembersCount: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://gym-management-backend-hoki.onrender.com/api";

/**
 * Normalizes a database member record (DBMember) to frontend structure (Member).
 */
// Backend may return `plan` as a plan object ({ id, name, ... }); the UI needs the name.
function planName(plan: DBMember["plan"]): string {
  return typeof plan === "object" && plan !== null ? plan.name : (plan ?? "");
}

export function mapDBMemberToMember(db: DBMember): Member {
  let mappedStatus: "Active" | "Expired" | "Expiring" = "Active";
  const statusLower = db.status ? db.status.toLowerCase() : "";
  if (statusLower === "expired") {
    mappedStatus = "Expired";
  } else if (statusLower === "expiring") {
    mappedStatus = "Expiring";
  } else {
    mappedStatus = "Active";
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.split("T")[0] || "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return dateStr.split("T")[0] || "";
    }
  };

  return {
    id: db.id,
    name: db.name,
    email: db.email ?? "",
    phone: db.phone,
    plan: planName(db.plan),
    plan_price: db.plan_price || 0,
    joinDate: formatDate(db.join_date),
    expiryDate: formatDate(db.expiry_date),
    status: mappedStatus,
    planId: db.plan_id ?? (db as any).planId ?? (typeof db.plan === "object" && db.plan ? db.plan.id : undefined),
    amountPaid: db.amount_paid ?? undefined,
    remainingAmount: db.remaining_amount,
    paymentStatus: db.payment_status,
  };
}

/**
 * Fetch overview dashboard numbers, status breakdown, and recent records.
 */
export async function fetchDashboard(): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/dashboard`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch dashboard data");
  }
  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.error || "Failed to fetch dashboard data");
  }
  const flatten = (list: DBMember[] = []): DashboardMember[] =>
    list.map((m) => ({ ...m, plan: planName(m.plan) }));
  return {
    ...payload,
    recentMembers: flatten(payload.recentMembers),
    upcomingRenewals: flatten(payload.upcomingRenewals),
  };
}

/**
 * Fetch all members from the database.
 */
export async function fetchMembers(): Promise<Member[]> {
  const response = await fetch(`${API_BASE_URL}/members`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch members");
  }
  const payload = await response.json();
  if (!payload.success || !Array.isArray(payload.data)) {
    throw new Error(payload.error || "Failed to fetch members");
  }
  return payload.data.map(mapDBMemberToMember);
}

/**
 * Add a new member to the database.
 */
export async function createMember(member: Omit<Member, "id" | "plan_price">): Promise<Member> {
  // Map fields to database schema format
  const payloadBody: any = {
    name: member.name,
    email: member.email?.trim() || undefined,
    phone: member.phone,
    planId: member.planId ? Number(member.planId) : undefined,
    plan: member.plan,
    join_date: new Date(member.joinDate).toISOString(),
    expiry_date: new Date(member.expiryDate).toISOString(),
    status: member.status.toUpperCase(), // Store in uppercase for consistency (e.g. 'ACTIVE')
    ...(member.amountPaid !== undefined ? { amount_paid: member.amountPaid } : {}),
  };

  const response = await fetch(`${API_BASE_URL}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payloadBody),
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Failed to create member");
  }
  return mapDBMemberToMember(payload.data);
}

/**
 * Fetch real reports card figures and expiring membership statistics.
 */
export async function fetchReports(): Promise<ReportsData> {
  const response = await fetch(`${API_BASE_URL}/reports`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch reports");
  }
  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.error || "Failed to fetch reports");
  }
  return payload;
}

/**
 * Fetch total revenue analytics (optional dashboard/YTD feature).
 */
export async function fetchRevenue(): Promise<RevenueData> {
  const response = await fetch(`${API_BASE_URL}/members/revenue`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch revenue analytics");
  }
  const payload = await response.json();
  if (!payload.success || !payload.data) {
    throw new Error(payload.error || "Failed to fetch revenue analytics");
  }
  return payload.data;
}

/**
 * Update an existing member in the database.
 */
export async function updateMember(id: number, member: Omit<Member, "id" | "plan_price">): Promise<Member> {
  const planPrices: Record<string, number> = {
    Basic: 30,
    Elite: 80,
    VIP: 150,
  };
  const price = planPrices[member.plan] || 30;

  const payloadBody = {
    name: member.name,
    email: member.email?.trim() || null,
    phone: member.phone,
    plan: member.plan,
    // When a plan is selected the backend links it and uses its price; the legacy map is only a fallback
    ...(member.planId ? { planId: Number(member.planId) } : { plan_price: price }),
    join_date: new Date(member.joinDate).toISOString(),
    expiry_date: new Date(member.expiryDate).toISOString(),
    status: member.status.toUpperCase(),
    ...(member.amountPaid !== undefined ? { amount_paid: member.amountPaid } : {}),
  };

  const response = await fetch(`${API_BASE_URL}/members/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payloadBody),
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Failed to update member");
  }
  return mapDBMemberToMember(payload.data);
}

/**
 * Delete a member from the database.
 */
export async function deleteMember(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/members/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete member");
  }

  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.error || "Failed to delete member");
  }
}

// ─── WhatsApp / WAHA Types ───────────────────────────────────────────────────

export interface WhatsAppSendResult {
  success: boolean;
  message?: string;
  chatId?: string;
  error?: string;
}

export interface WhatsAppBulkResult {
  success: boolean;
  message: string;
  total: number;
  sent: number;
  failed: number;
  results: Array<{
    id: number;
    name: string;
    phone: string;
    status: "sent" | "failed";
    chatId?: string;
    error?: string;
  }>;
}

// ─── WhatsApp / WAHA API functions ──────────────────────────────────────────

/**
 * Send a single WhatsApp message via WAHA.
 */
export async function sendWhatsAppMessage(
  wahaUrl: string,
  phone: string,
  message: string,
  session = "default",
  apiKey = ""
): Promise<WhatsAppSendResult> {
  const response = await fetch(`${API_BASE_URL}/whatsapp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wahaUrl, phone, message, session, apiKey }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Failed to send WhatsApp message");
  }
  return payload;
}

/**
 * Send bulk WhatsApp messages to members of a specific type via WAHA.
 * type: "expired" | "welcome" | "renewal"
 */
export async function sendBulkWhatsAppMessages(
  wahaUrl: string,
  messageTemplate: string,
  type: "expired" | "past_expired" | "welcome" | "renewal",
  session = "default",
  apiKey = ""
): Promise<WhatsAppBulkResult> {
  const response = await fetch(`${API_BASE_URL}/whatsapp/send-bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wahaUrl, messageTemplate, type, session, apiKey }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Failed to send bulk WhatsApp messages");
  }
  return payload;
}

/**
 * Fetch expired members (status = Expired).
 */
export async function fetchExpiredMembers(): Promise<Member[]> {
  // Backend lifecycle decides the stage: EXPIRED = expired message still pending
  const [all, lifecycle] = await Promise.all([fetchMembers(), fetchLifecycle()]);
  const ids = new Set(lifecycle.filter((l) => l.state === "EXPIRED").map((l) => l.id));
  return all.filter((m) => ids.has(m.id));
}

/**
 * Fetch past-expired members (expired message already sent, not renewed).
 */
export async function fetchPastExpiredMembers(): Promise<Member[]> {
  const [all, lifecycle] = await Promise.all([fetchMembers(), fetchLifecycle()]);
  const ids = new Set(lifecycle.filter((l) => l.state === "PAST_EXPIRED").map((l) => l.id));
  return all.filter((m) => ids.has(m.id));
}

export interface LifecycleMember {
  id: number;
  state: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "PAST_EXPIRED";
  daysLeft: number;
  nextMessage: string | null;
}

export async function fetchLifecycle(): Promise<LifecycleMember[]> {
  const response = await fetch(`${API_BASE_URL}/automation/lifecycle`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Failed to fetch member lifecycle");
  }
  return payload.data;
}

export type AutomationTemplates = Record<"expiring_soon" | "expired" | "past_expired" | "welcome", string>;

export async function getAutomationTemplates(): Promise<AutomationTemplates> {
  const response = await fetch(`${API_BASE_URL}/automation/templates`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Failed to load automation templates");
  }
  return payload.data;
}

export async function saveAutomationTemplate(key: keyof AutomationTemplates, text: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/automation/templates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templates: { [key]: text } }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Failed to save automation template");
  }
}

/**
 * Fetch new members (joined in the last 7 days).
 */
export async function fetchNewMembers(): Promise<Member[]> {
  const all = await fetchMembers();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return all.filter((m) => {
    const joinDate = new Date(m.joinDate);
    return joinDate >= sevenDaysAgo;
  });
}

/**
 * Fetch expiring members (status = Expiring).
 */
export async function fetchExpiringMembers(): Promise<Member[]> {
  const all = await fetchMembers();
  return all.filter((m) => m.status === "Expiring");
}

/**
 * Fetch all plans.
 */
export async function fetchPlans(): Promise<Plan[]> {
  const response = await fetch(`${API_BASE_URL}/plans`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch plans");
  }
  const payload = await response.json();
  if (!payload.success || !Array.isArray(payload.data)) {
    throw new Error(payload.error || "Failed to fetch plans");
  }
  return payload.data.map(fromApiPlan);
}

// Backend uses camelCase (durationUnit, isActive); UI uses snake_case.
function fromApiPlan(p: any): Plan {
  return {
    id: p.id,
    name: p.name,
    duration: p.duration,
    duration_unit: p.durationUnit ?? p.duration_unit,
    price: Number(p.price),
    description: p.description ?? "",
    is_active: p.isActive ?? p.is_active,
  };
}

/**
 * Create a new plan.
 */
export async function createPlan(plan: Omit<Plan, "id">): Promise<Plan> {
  const response = await fetch(`${API_BASE_URL}/plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: plan.name,
      duration: plan.duration,
      durationUnit: plan.duration_unit,
      price: plan.price,
      description: plan.description,
      isActive: plan.is_active,
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Failed to create plan");
  }
  return fromApiPlan(payload.data);
}

// ─── Automation ──────────────────────────────────────────────────────────────

export interface AutomationSettings {
  isEnabled: boolean;
  scheduleTime: string; // e.g. "09:00"
  timezone?: string;
}

export interface AutomationStatus {
  enabled: boolean;
  time: string;
  timezone: string;
  lastRun?: string;
  lastRunStatus?: string;
  sent: number;
  failed: number;
  skipped: number;
}

export interface AutomationLog {
  id: number;
  memberName: string;
  memberPhone: string;
  messageType: string;
  message: string;
  status: "SENT" | "FAILED" | "SKIPPED";
  sentAt: string;
  error?: string;
}

export interface AutomationRunResult {
  message: string;
  sent: number;
  failed: number;
  skipped: number;
}

export async function getAutomationStatus(): Promise<AutomationStatus> {
  const response = await fetch(`${API_BASE_URL}/automation/status`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch automation status");
  }
  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.error || "Failed to fetch automation status");
  }
  const d = payload.data;
  return {
    enabled: !!d.enabled,
    time: d.scheduledTime ?? "09:00",
    timezone: d.timezone ?? "Asia/Kolkata",
    sent: d.sentCount ?? 0,
    failed: d.failedCount ?? 0,
    skipped: d.skipped ?? 0,
    lastRun: d.lastRunAt ? new Date(d.lastRunAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Kolkata" }) : undefined,
    lastRunStatus: d.lastRunStatus ?? undefined,
  };
}

export async function getAutomationLogs(): Promise<AutomationLog[]> {
  const response = await fetch(`${API_BASE_URL}/automation/daily-messages/logs`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch automation logs");
  }
  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.error || "Failed to fetch automation logs");
  }
  return payload.data.map((l: any) => ({
    id: l.id,
    memberName: l.member?.name ?? "",
    memberPhone: l.member?.phone ?? "",
    messageType: l.messageType,
    message: l.message,
    status: l.status === "SUCCESS" ? "SENT" : l.status,
    sentAt: l.sentAt ?? l.created_at,
    error: l.error ?? undefined,
  }));
}

function readWahaConfig() {
  if (typeof window === "undefined") return {};
  try {
    const wahaUrl = localStorage.getItem("waha_url") || undefined;
    const wahaSession = localStorage.getItem("waha_session") || undefined;
    const wahaApiKey = localStorage.getItem("waha_api_key") || undefined;
    return wahaUrl ? { wahaUrl, wahaSession, wahaApiKey } : {};
  } catch {
    return {};
  }
}

export async function updateAutomationSettings(settings: AutomationSettings): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/automation/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      enabled: settings.isEnabled,
      scheduledTime: settings.scheduleTime,
      timezone: settings.timezone ?? "Asia/Kolkata",
      // Sync the WAHA connection so the backend scheduler can send while the browser is closed
      ...readWahaConfig(),
    }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update automation settings");
  }
  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.error || "Failed to update automation settings");
  }
}

export async function runDailyAutomation(dryRun: boolean = false): Promise<AutomationRunResult> {
  const url = dryRun ? `${API_BASE_URL}/automation/daily-messages/run?dryRun=true` : `${API_BASE_URL}/automation/daily-messages/run`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to run automation");
  }
  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.error || "Failed to run automation");
  }
  return payload.data;
}


// ─── Outstanding Dues ────────────────────────────────────────────────────────

/**
 * Members with an unpaid balance (PENDING or PARTIAL). Computed by the backend.
 */
export async function fetchOutstandingDues(): Promise<Member[]> {
  const response = await fetch(`${API_BASE_URL}/members/dues`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
    throw new Error(payload.error || "Failed to fetch outstanding dues");
  }
  return payload.data.map(mapDBMemberToMember);
}

/**
 * Update only the amount paid for a member.
 */
export async function updateMemberPayment(id: number, amountPaid: number): Promise<Member> {
  const response = await fetch(`${API_BASE_URL}/members/${id}/payment`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount_paid: amountPaid }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Failed to update payment");
  }
  return mapDBMemberToMember(payload.data);
}
