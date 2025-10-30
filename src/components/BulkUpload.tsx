'use client'

import { useState, useRef } from 'react'
import { Person } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'
import * as XLSX from 'xlsx'

interface BulkUploadProps {
  onUpload: (people: Person[]) => void
  onClose: () => void
}

interface CSVRow {
  name?: string
  email?: string
  phone?: string
  hasAccess?: string | boolean
  [key: string]: any
}

export default function BulkUpload({ onUpload, onClose }: BulkUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewData, setPreviewData] = useState<CSVRow[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [uploadStats, setUploadStats] = useState<{
    total: number
    valid: number
    invalid: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateQRCode = async (personData: { id: string; name: string }) => {
    try {
      const qrData = {
        id: personData.id,
        name: personData.name,
        timestamp: new Date().toISOString()
      }
      return await QRCode.toDataURL(JSON.stringify(qrData))
    } catch (error) {
      console.error('Error generating QR code:', error)
      return ''
    }
  }

  const parseCSVData = (data: any[]): { people: Person[]; errors: string[] } => {
    const people: Person[] = []
    const errors: string[] = []
    let validCount = 0

    data.forEach((row, index) => {
      const rowNumber = index + 1
      
      // Skip empty rows
      if (!row.name && !row.email && !row.phone) {
        return
      }

      // Validate required fields
      if (!row.name || typeof row.name !== 'string' || row.name.trim() === '') {
        errors.push(`Row ${rowNumber}: Name is required and must be a valid string`)
        return
      }

      // Validate email if provided
      if (row.email && typeof row.email === 'string' && row.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(row.email.trim())) {
          errors.push(`Row ${rowNumber}: Invalid email format`)
          return
        }
      }

      // Validate phone if provided
      if (row.phone && typeof row.phone === 'string' && row.phone.trim()) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/
        if (!phoneRegex.test(row.phone.trim())) {
          errors.push(`Row ${rowNumber}: Invalid phone number format`)
          return
        }
      }

      // Parse access permission
      let hasAccess = true
      if (row.hasAccess !== undefined) {
        if (typeof row.hasAccess === 'boolean') {
          hasAccess = row.hasAccess
        } else if (typeof row.hasAccess === 'string') {
          const accessStr = row.hasAccess.toLowerCase().trim()
          hasAccess = accessStr === 'true' || accessStr === 'yes' || accessStr === '1' || accessStr === 'granted'
        }
      }

      validCount++
      people.push({
        id: uuidv4(),
        name: row.name.trim(),
        email: row.email?.trim() || undefined,
        phone: row.phone?.trim() || undefined,
        hasAccess,
        qrCode: '', // Will be generated later
        createdAt: new Date(),
      })
    })

    return { people, errors }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setErrors([])
    setPreviewData([])
    setUploadStats(null)

    try {
      const fileExtension = file.name.toLowerCase().split('.').pop()
      let parsedData: any[] = []

      if (fileExtension === 'csv') {
        // Parse CSV file
        const text = await file.text()
        const Papa = (await import('papaparse')).default
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => {
            // Normalize headers to expected field names
            const normalizedHeader = header.toLowerCase().trim()
            if (normalizedHeader.includes('name')) return 'name'
            if (normalizedHeader.includes('email')) return 'email'
            if (normalizedHeader.includes('phone')) return 'phone'
            if (normalizedHeader.includes('access')) return 'hasAccess'
            return normalizedHeader
          }
        })
        parsedData = result.data
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Parse Excel file
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
        
        // Convert to object format with normalized headers
        if (jsonData.length > 0) {
          const headers = jsonData[0].map((header: string) => {
            const normalizedHeader = header.toLowerCase().trim()
            if (normalizedHeader.includes('name')) return 'name'
            if (normalizedHeader.includes('email')) return 'email'
            if (normalizedHeader.includes('phone')) return 'phone'
            if (normalizedHeader.includes('access')) return 'hasAccess'
            return normalizedHeader
          })
          
          parsedData = jsonData.slice(1).map(row => {
            const obj: any = {}
            headers.forEach((header, index) => {
              obj[header] = row[index]
            })
            return obj
          })
        }
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel files.')
      }

      const { people, errors } = parseCSVData(parsedData)
      
      setPreviewData(parsedData.slice(0, 5)) // Show first 5 rows for preview
      setErrors(errors)
      setUploadStats({
        total: parsedData.length,
        valid: people.length,
        invalid: errors.length
      })

      // If there are valid people and no critical errors, allow upload
      if (people.length > 0) {
        // Generate QR codes for all people
        const peopleWithQR = await Promise.all(
          people.map(async (person) => ({
            ...person,
            qrCode: await generateQRCode({ id: person.id, name: person.name })
          }))
        )
        
        // Store processed people for upload
        ;(window as any).__processedPeople = peopleWithQR
      }
    } catch (error) {
      setErrors([`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmUpload = () => {
    const processedPeople = (window as any).__processedPeople
    if (processedPeople) {
      onUpload(processedPeople)
      delete (window as any).__processedPeople
      onClose()
    }
  }

  const handleDownloadTemplate = () => {
    const template = [
      ['name', 'email', 'phone', 'hasAccess'],
      ['John Doe', 'john.doe@example.com', '+1234567890', 'true'],
      ['Jane Smith', 'jane.smith@example.com', '+0987654321', 'true'],
      ['Bob Johnson', 'bob.johnson@example.com', '', 'false']
    ]
    
    const worksheet = XLSX.utils.aoa_to_sheet(template)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'People')
    XLSX.writeFile(workbook, 'venue_access_template.xlsx')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Bulk Upload People</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Upload Instructions</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Supported formats: CSV, Excel (.xlsx, .xls)</li>
              <li>• Required column: <code className="bg-blue-100 px-1 rounded">name</code></li>
              <li>• Optional columns: <code className="bg-blue-100 px-1 rounded">email</code>, <code className="bg-blue-100 px-1 rounded">phone</code>, <code className="bg-blue-100 px-1 rounded">hasAccess</code></li>
              <li>• Access values: true/false, yes/no, 1/0, granted/denied</li>
            </ul>
            <button
              onClick={handleDownloadTemplate}
              className="mt-3 text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Download Template File
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Click to Select File or Drag & Drop'}
            </button>
          </div>

          {/* Upload Stats */}
          {uploadStats && (
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-700">{uploadStats.total}</div>
                <div className="text-sm text-gray-600">Total Rows</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-700">{uploadStats.valid}</div>
                <div className="text-sm text-green-600">Valid Records</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-700">{uploadStats.invalid}</div>
                <div className="text-sm text-red-600">Invalid Records</div>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">Validation Errors</h3>
              <ul className="text-red-700 text-sm space-y-1 max-h-32 overflow-y-auto">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Preview (First 5 rows)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      {Object.keys(previewData[0] || {}).map((key) => (
                        <th key={key} className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-b">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2 text-sm text-gray-600">
                            {String(value || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {uploadStats && uploadStats.valid > 0 && (
              <button
                onClick={handleConfirmUpload}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
              >
                Upload {uploadStats.valid} People
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
