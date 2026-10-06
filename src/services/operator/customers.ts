import type { Customer } from '@/types/operator'
import { mockCustomers } from './mock/mockCustomers'

const USE_MOCK = true

export async function getCustomers(): Promise<Customer[]> {
  if (USE_MOCK) {
    await delay(400)
    return mockCustomers
  }
  const res = await apiFetch('/api/customers')
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
