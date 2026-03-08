import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'

let socket = null

export function useSocket(date) {
  const queryClient = useQueryClient()
  const { getToken, orgId } = useAuth()
  const roomRef = useRef(null)

  useEffect(() => {
    if (!orgId || !date) return

    const connect = async () => {
      const token = await getToken()

      if (!socket) {
        socket = io({ auth: { token } })
      }

      const room = `${orgId}-${date}`

      // Leave previous room
      if (roomRef.current && roomRef.current !== room) {
        socket.emit('leave', roomRef.current)
      }

      socket.emit('join', room)
      roomRef.current = room

      socket.on('schedule:updated', ({ date: updatedDate }) => {
        queryClient.invalidateQueries({ queryKey: ['schedule', updatedDate] })
      })

      socket.on('staff:updated', () => {
        queryClient.invalidateQueries({ queryKey: ['staff'] })
      })
    }

    connect()

    return () => {
      if (socket && roomRef.current) {
        socket.off('schedule:updated')
        socket.off('staff:updated')
        socket.emit('leave', roomRef.current)
      }
    }
  }, [orgId, date])
}
