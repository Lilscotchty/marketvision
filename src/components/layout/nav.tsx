
"use client"

import { motion } from 'framer-motion'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import type { NavItem } from './sidebar-nav'
import { cn } from '@/lib/utils'

const NavLink = ({
  item,
  isActive,
  onMouseEnter
}: {
  item: NavItem
  isActive: boolean
  onMouseEnter: () => void
}) => (
  <Link
    href={item.href}
    className={cn(
      'relative block whitespace-nowrap px-3 py-1.5 text-sm transition',
      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
    )}
    onMouseEnter={onMouseEnter}
  >
    {isActive && (
      <motion.span
        layoutId="underline"
        className="absolute bottom-0 left-0 block h-px w-full bg-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    )}
    {item.label}
  </Link>
)

export const NavBar = ({ tabs }: { tabs: NavItem[] }) => {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)

  const visibleTabs = tabs.filter((tab) => {
    if (loading) return false
    if (tab.authRequired && !user) return false
    if (tab.guestOnly && user) return false
    // Exclude login/signup from this nav
    if (tab.href === '/login' || tab.href === '/signup') return false
    return true
  })

  return (
    <nav
      className="relative flex items-center"
      onMouseLeave={() => setHoveredTab(null)}
    >
      {visibleTabs.map((tab) => (
        <NavLink
          key={tab.href}
          item={tab}
          isActive={pathname === tab.href}
          onMouseEnter={() => setHoveredTab(tab.href)}
        />
      ))}
      {hoveredTab && (
        <motion.span
          layoutId="underline"
          className="absolute bottom-0 left-0 block h-px w-full bg-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          style={{
            left:
              document.querySelector(`a[href="${hoveredTab}"]`)?.offsetLeft || 0,
            width:
              document.querySelector(`a[href="${hoveredTab}"]`)?.clientWidth || 0
          }}
        />
      )}
    </nav>
  )
}
