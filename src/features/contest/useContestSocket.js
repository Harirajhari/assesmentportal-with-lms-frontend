import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { io } from 'socket.io-client'
import { setLiveLeaderboard } from '../../features/contest/contestSlice'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

let socketInstance = null

export const getSocket = (token) => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })
  }
  return socketInstance
}

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}

/**
 * useContestSocket
 * Connects to socket, joins the contest room, and listens for live leaderboard updates.
 */
export const useContestSocket = (contestId) => {
  const dispatch = useDispatch()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!contestId) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    const socket = getSocket(token)
    socketRef.current = socket

    if (!socket.connected) socket.connect()

    socket.emit('contest:join', { contestId })

    socket.on('leaderboard:update', (data) => {
      if (data.contestId === contestId) {
        dispatch(setLiveLeaderboard(data))
      }
    })

    socket.on('connect_error', (err) => {
      console.warn('Socket connect error:', err.message)
    })

    return () => {
      socket.emit('contest:leave', { contestId })
      socket.off('leaderboard:update')
    }
  }, [contestId, dispatch])

  return socketRef
}