import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import BottomTabs from './BottomTabs'
import { requestPushPermission } from '../lib/notifications'

export default function AppShell() {
  useEffect(() => {
    requestPushPermission()
  }, [])

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] pb-20">
      <Outlet />
      <BottomTabs />
    </div>
  )
}
