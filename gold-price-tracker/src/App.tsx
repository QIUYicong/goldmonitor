import React, { useState } from 'react'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import Charts from './pages/Charts'
import EmailSettings from './pages/EmailSettings'
import DataSources from './pages/DataSources'
import './index.css'

function App() {
  const [currentSection, setCurrentSection] = useState('dashboard')

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard />
      case 'charts':
        return <Charts />
      case 'email-settings':
        return <EmailSettings />
      case 'data-sources':
        return <DataSources />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection} 
      />
      <main className="pt-[64px]">
        {renderSection()}
      </main>
    </div>
  )
}

export default App
