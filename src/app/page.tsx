'use client'

import { useState, useEffect } from 'react'
import PersonList from '@/components/PersonList'
import QRScanner from '@/components/QRScanner'
import { Person } from '@/types'

export default function Home() {
  const [people, setPeople] = useState<Person[]>([])
  const [activeTab, setActiveTab] = useState<'manage' | 'scan'>('manage')

  useEffect(() => {
    // Load people from localStorage on component mount
    const storedPeople = localStorage.getItem('venue-people')
    if (storedPeople) {
      setPeople(JSON.parse(storedPeople))
    }
  }, [])

  const updatePeople = (newPeople: Person[]) => {
    setPeople(newPeople)
    localStorage.setItem('venue-people', JSON.stringify(newPeople))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Venue Access Control
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'manage'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              Manage Access
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'scan'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              Scan QR Code
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'manage' && (
          <PersonList people={people} onUpdatePeople={updatePeople} />
        )}
        
        {activeTab === 'scan' && (
          <QRScanner people={people} onUpdatePeople={updatePeople} />
        )}
      </div>
    </div>
  )
}
