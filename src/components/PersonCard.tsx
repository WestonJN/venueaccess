'use client'

import { Person } from '@/types'

interface PersonCardProps {
  person: Person
  onEdit: () => void
  onDelete: () => void
  onToggleAccess: () => void
}

export default function PersonCard({ person, onEdit, onDelete, onToggleAccess }: PersonCardProps) {
  const handleDownloadQR = () => {
    const link = document.createElement('a')
    link.download = `${person.name}_QR.png`
    link.href = person.qrCode
    link.click()
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{person.name}</h3>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
            person.hasAccess 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {person.hasAccess ? '✓ Access Granted' : '✗ Access Denied'}
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {person.email && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {person.email}
          </div>
        )}
        {person.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {person.phone}
          </div>
        )}
      </div>

      {/* QR Code */}
      <div className="text-center mb-4">
        <img
          src={person.qrCode}
          alt={`QR Code for ${person.name}`}
          className="w-32 h-32 mx-auto border border-gray-200 rounded"
          width={128}
          height={128}
        />
        <button
          onClick={handleDownloadQR}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Download QR Code
        </button>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={onToggleAccess}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            person.hasAccess
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {person.hasAccess ? 'Revoke Access' : 'Grant Access'}
        </button>
      </div>

      {/* Last Accessed */}
      {person.lastAccessed && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Last accessed: {new Date(person.lastAccessed).toLocaleString()}
        </div>
      )}
    </div>
  )
}
