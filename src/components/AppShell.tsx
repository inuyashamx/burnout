import { Outlet } from 'react-router-dom'
import BottomTabs from './BottomTabs'

export default function AppShell() {
  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] pb-20">
      <Outlet />
      <BottomTabs />
    </div>
  )
}
