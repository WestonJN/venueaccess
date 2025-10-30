'use client'

import { useState } from 'react'
import { Person } from '@/types'
import PersonForm from './PersonForm'
import PersonCard from './PersonCard'
import BulkUpload from './BulkUpload'

interface PersonListProps {
  people: Person[]
  onUpdatePeople: (people: Person[]) => void
}

export default function PersonList({ people, onUpdatePeople }: PersonListProps) {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.phone?.includes(searchTerm)
  )

  const handleAddPerson = (person: Person) => {
    onUpdatePeople([...people, person])
    setShowForm(false)
  }

  const handleEditPerson = (updatedPerson: Person) => {
    onUpdatePeople(people.map(p => p.id === updatedPerson.id ? updatedPerson : p))
    setEditingPerson(null)
  }

  const handleDeletePerson = (personId: string) => {
    onUpdatePeople(people.filter(p => p.id !== personId))
  }

  const handleToggleAccess = (personId: string) => {
    onUpdatePeople(people.map(p => 
      p.id === personId ? { ...p, hasAccess: !p.hasAccess } : p
    ))
  }

  const handleBulkUpload = (newPeople: Person[]) => {
    // Merge with existing people, avoiding duplicates based on email or name
    const existingEmails = new Set(people.map(p => p.email?.toLowerCase()).filter(Boolean))
    const existingNames = new Set(people.map(p => p.name.toLowerCase()))
    
    const uniqueNewPeople = newPeople.filter(person => {
      const emailExists = person.email && existingEmails.has(person.email.toLowerCase())
      const nameExists = existingNames.has(person.name.toLowerCase())
      return !emailExists && !nameExists
    })
    
    onUpdatePeople([...people, ...uniqueNewPeople])
    setShowBulkUpload(false)
  }

  const handleExportData = () => {
    const dataToExport = people.map(person => ({
      name: person.name,
      email: person.email || '',
      phone: person.phone || '',
      hasAccess: person.hasAccess,
      createdAt: person.createdAt.toISOString(),
      lastAccessed: person.lastAccessed?.toISOString() || ''
    }))
    
    const dataStr = JSON.stringify(dataToExport, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `venue_access_data_${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Add Button and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            People ({people.length})
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Add Person
              </button>
              <button
                onClick={() => setShowBulkUpload(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Bulk Upload
              </button>
              {people.length > 0 && (
                <button
                  onClick={handleExportData}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Export
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Person Form */}
      {(showForm || editingPerson) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <PersonForm
              person={editingPerson}
              onSave={editingPerson ? handleEditPerson : handleAddPerson}
              onCancel={() => {
                setShowForm(false)
                setEditingPerson(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUpload
          onUpload={handleBulkUpload}
          onClose={() => setShowBulkUpload(false)}
        />
      )}

      {/* People Grid */}
      {filteredPeople.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No people found matching your search.' : 'No people added yet.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Add Your First Person
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeople.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onEdit={() => setEditingPerson(person)}
              onDelete={() => handleDeletePerson(person.id)}
              onToggleAccess={() => handleToggleAccess(person.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
