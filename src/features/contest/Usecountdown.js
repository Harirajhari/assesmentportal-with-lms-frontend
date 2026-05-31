import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useCountdown
 * @param {Date|string} endTime  - when the contest ends
 * @param {Function}    onExpire - called once when timer hits 0
 * @returns {{ remaining, formatted, isExpired, isWarning }}
 */
export const useCountdown = (endTime, onExpire) => {
  const calcRemaining = () => Math.max(0, new Date(endTime) - Date.now())
  const [remaining, setRemaining] = useState(calcRemaining)
  const calledRef = useRef(false)

  const format = useCallback((ms) => {
    if (ms <= 0) return '00:00:00'
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
  }, [])

  useEffect(() => {
    const tick = setInterval(() => {
      const r = calcRemaining()
      setRemaining(r)
      if (r <= 0 && !calledRef.current) {
        calledRef.current = true
        onExpire?.()
        clearInterval(tick)
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [endTime]) // eslint-disable-line

  return {
    remaining,
    formatted: format(remaining),
    isExpired: remaining <= 0,
    isWarning: remaining > 0 && remaining <= 5 * 60 * 1000,  // last 5 minutes
  }
}