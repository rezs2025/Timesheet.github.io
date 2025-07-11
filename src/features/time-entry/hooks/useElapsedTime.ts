import { useState, useEffect } from 'react'
import { differenceInSeconds, format } from 'date-fns'

/**
 * Recibe la fecha de inicio y devuelve un string "HH:mm:ss" que se actualiza cada segundo.
 */
export function useElapsedTime(startTime: Date | null) {
  const [elapsed, setElapsed] = useState<string>('00:00:00')

  useEffect(() => {
    if (!startTime) {
      setElapsed('00:00:00')
      return
    }

    function update() {
      const totalSec = differenceInSeconds(new Date(), startTime!)
      const hrs = Math.floor(totalSec / 3600)
      const mins = Math.floor((totalSec % 3600) / 60)
      const secs = totalSec % 60
      setElapsed(
        [hrs, mins, secs]
          .map((n) => String(n).padStart(2, '0'))
          .join(':')
      )
    }

    // Ejecutamos inmediatamente y luego a intervalos de 1s
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [startTime])

  return elapsed
}
