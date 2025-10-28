import React from 'react'

interface NavigationProps {
  currentSection: string
  onSectionChange: (section: string) => void
}

const Navigation: React.FC<NavigationProps> = ({ currentSection, onSectionChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'charts', label: 'CHARTS' },
    { id: 'email-settings', label: 'EMAIL SETTINGS' },
    { id: 'data-sources', label: 'DATA SOURCES' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-300" style={{ height: '64px' }}>
      <div className="max-w-[1200px] mx-auto px-lg h-full flex items-center justify-between">
        <div className="font-bold text-headline tracking-tight">
          GOLD PRICE TRACKER
        </div>
        <div className="flex gap-xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                text-small font-bold tracking-wider transition-colors duration-fast
                ${currentSection === item.id 
                  ? 'text-primary border-b-medium border-primary' 
                  : 'text-neutral-900 hover:text-primary'
                }
              `}
              style={{ paddingBottom: '2px' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
