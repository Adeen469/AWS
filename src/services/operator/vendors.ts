import type { Vendor } from '@/types/operator'
import { mockVendors } from './mock/mockVendors'

const USE_MOCK = true

export async function getVendors(): Promise<Vendor[]> {
  if (USE_MOCK) {
    await delay(400)
    return mockVendors
  }
  const res = await apiFetch('/api/vendors')
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
