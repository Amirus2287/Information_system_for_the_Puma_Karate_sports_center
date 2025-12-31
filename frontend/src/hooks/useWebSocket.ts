import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export function useWebSocket() {
  const socketRef = useRef<any>(null)
  
  useEffect(() => {
    socketRef.current = io('http://localhost:8000')
    
    return () => {
      socketRef.current?.disconnect()
    }
  }, [])
  
  return socketRef.current
}