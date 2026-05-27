/**
 * Shared formatting utilities
 */

/** Format a number as USD currency */
export function formatCurrency(amount: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

/** Format an ISO date string into a human-readable date */
export function formatDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string {
  return new Date(iso).toLocaleDateString('en-US', opts)
}

/** Format an ISO date string with time */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/** Return a relative time string, e.g. "2 hours ago" */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return formatDate(iso)
}

/** Truncate a string to a max length with ellipsis */
export function truncate(str: string, maxLen = 40): string {
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str
}

/** Copy text to clipboard and return success boolean */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Capitalise the first letter of a string */
export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** Map a ProductCategory key to a display label */
export const CATEGORY_LABELS: Record<string, string> = {
  us_numbers: 'US Numbers',
  facebook:   'Facebook',
  instagram:  'Instagram',
  twitter:    'Twitter / X',
  whatsapp:   'WhatsApp',
  tiktok:     'TikTok',
}

/** Map a ProductCategory key to an emoji icon */
export const CATEGORY_ICONS: Record<string, string> = {
  us_numbers: '📱',
  facebook:   '📘',
  instagram:  '📸',
  twitter:    '🐦',
  whatsapp:   '💬',
  tiktok:     '🎵',
}

/** Map a ProductCategory key to its brand colour */
export const CATEGORY_COLORS: Record<string, string> = {
  us_numbers: '#00d4ff',
  facebook:   '#1877f2',
  instagram:  '#e1306c',
  twitter:    '#1da1f2',
  whatsapp:   '#25d366',
  tiktok:     '#ee1d52',
}
