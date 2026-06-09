/**
 * CEVONS Growth Command — Integration Placeholders
 * --------------------------------------------------
 * This CRM is currently FRONT-END ONLY. All pages render static demo data.
 * The hooks below are stubs to mark where future integrations will be wired.
 * Do NOT call live services, APIs, or external platforms from this file yet.
 *
 * Replace the stub returns with real data fetches when backend is enabled.
 */

// Future CRM data integration (leads, customers, requests, pipeline)
export async function loadCrmRecords(_resource: string) {
  // TODO: replace with real CRM data source
  return { data: [], meta: { source: "mock" } };
}

// Future lead submission sync (website forms, WhatsApp click, phone)
export async function syncLeadSubmission(_payload: unknown) {
  // TODO: persist new lead and dispatch auto-reply
  return { ok: true, mock: true };
}

// Future conversations sync (WhatsApp, SMS, email, web chat)
export async function syncConversationMessage(_payload: unknown) {
  // TODO: relay outbound message through unified messaging layer
  return { ok: true, mock: true };
}

// Future calendar sync (bookings, dispatch scheduling)
export async function syncCalendarEvent(_payload: unknown) {
  // TODO: persist booking and notify assigned team
  return { ok: true, mock: true };
}

// Future reporting sync (revenue, ROI, response time, conversion funnel)
export async function loadReportingMetrics(_range: { from: string; to: string }) {
  // TODO: aggregate metrics from operational tables
  return { metrics: {}, mock: true };
}

// Future review request sync (post-job feedback automation)
export async function sendReviewRequest(_payload: unknown) {
  // TODO: dispatch review request and track open/response
  return { ok: true, mock: true };
}

// Future invoicing sync (issue, payment status, reminders — no payment wiring yet)
export async function syncInvoiceUpdate(_payload: unknown) {
  // TODO: persist invoice state changes
  return { ok: true, mock: true };
}
