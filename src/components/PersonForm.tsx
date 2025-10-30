'use client'

import { useState } from 'react'
import { Person } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'

interface PersonFormProps {
  person?: Person | null
  onSave: (person: Person) => void
  onCancel: () => void
}

export default function PersonForm({ person, onSave, onCancel }: PersonFormProps) {
  const [formData, setFormData] = useState({
    name: person?.name || '',
    email: person?.email || '',
    phone: person?.phone || '',
    hasAccess: person?.hasAccess || true
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let qrCode = person?.qrCode || ''
      
      // Generate QR code if this is a new person
      if (!person) {
        const personId = uuidv4()
        const qrData = JSON.stringify({
          id: personId,
          name: formData.name,
          timestamp: new Date().toISOString()
        })
        qrCode = await QRCode.toDataURL(qrData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
      }

      const personData: Person = {
        id: person?.id || uuidv4(),
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        hasAccess: formData.hasAccess,
        qrCode,
        createdAt: person?.createdAt || new Date(),
        lastAccessed: person?.lastAccessed
      }

      onSave(personData)
    } catch (error) {
      console.error('Error creating person:', error)
      alert('Error creating person. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">
        {person ? 'Edit Person' : 'Add New Person'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter phone number"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="hasAccess"
            name="hasAccess"
            checked={formData.hasAccess}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="hasAccess" className="ml-2 block text-sm text-gray-700">
            Grant access
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : (person ? 'Update' : 'Add Person')}
          </button>
        </div>
      </form>
    </div>
  )
}
