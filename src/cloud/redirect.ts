import { rememberJoinCode } from './auth'
import { supabase } from './client'

export const AUTH_ERROR_KEY = 'agent-lab:auth-error'

/**
 * Magic links land on `/#access_token=…` (or `/#error=…`). That fragment collides
 * with the hash router, so finish the sign-in first, then hand the router a clean `#/`.
 */
export async function completeEmailRedirect() {
  // Family invite carried through the email link (?join=CODE).
  const join = new URLSearchParams(window.location.search).get('join')
  if (join) {
    rememberJoinCode(join)
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`)
  }
  const hash = window.location.hash
  if (!supabase || !/access_token=|error_description=|error_code=/.test(hash)) return
  const params = new URLSearchParams(hash.slice(1))
  const error = params.get('error_description')
  if (error) {
    const expired = params.get('error_code') === 'otp_expired' || /expired|invalid/i.test(error)
    try {
      sessionStorage.setItem(AUTH_ERROR_KEY, expired ? 'That sign-in link has already been used or has expired. Links work once — request a new one below.' : error.replace(/\+/g, ' '))
    } catch { /* ignore */ }
  } else {
    // Waits until supabase-js has read the tokens from the URL and stored the session.
    await supabase.auth.getSession()
  }
  window.history.replaceState(null, '', `${window.location.pathname}#/`)
}
