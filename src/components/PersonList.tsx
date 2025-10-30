'use client'

import { useState } from 'react'
import { Person } from '@/types'
import PersonForm from './PersonForm'
import PersonCard from './PersonCard'

interface PersonListProps {
  people: Person[]
  onUpdatePeople: (people: Person[]) => void
}

export default function PersonList({ people, onUpdatePeople }: PersonListProps) {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)

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
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Add Person
            </button>
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
