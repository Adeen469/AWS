import type { DashboardStats, RecentActivity, Disruption } from '@/types/operator'
import { mockDashboardStats, mockRecentActivity } from './mock/mockDashboard'
import { mockDisruptions } from './mock/mockDisruptions'

const USE_MOCK = true

export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) {
    await delay(400)
    return mockDashboardStats
  }
  const res = await apiFetch('/api/dashboard/stats')
  return res.json()
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  if (USE_MOCK) {
    await delay(300)
    return mockRecentActivity
  }
  const res = await apiFetch('/api/dashboard/activity')
  return res.json()
}

export async function getActiveDisruptions(): Promise<Disruption[]> {
  if (USE_MOCK) {
    await delay(300)
    return mockDisruptions.filter((d) => d.status === 'active')
  }
  const res = await apiFetch('/api/disruptions?status=active')
  return res.json()
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function apiFetch(path: string, options?: RequestInit) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw { status: res.status, message: body.detail ?? res.statusText }
  }
  return res
}
