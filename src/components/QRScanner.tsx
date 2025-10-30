'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Person, AccessLog } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface QRScannerProps {
  people: Person[]
  onUpdatePeople: (people: Person[]) => void
}

export default function QRScanner({ people, onUpdatePeople }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    // Load access logs from localStorage
    const storedLogs = localStorage.getItem('venue-access-logs')
    if (storedLogs) {
      setAccessLogs(JSON.parse(storedLogs))
    }
  }, [])

  const addAccessLog = (log: AccessLog) => {
    const newLogs = [...accessLogs, log]
    setAccessLogs(newLogs)
    localStorage.setItem('venue-access-logs', JSON.stringify(newLogs))
  }

  const startScanning = () => {
    setIsScanning(true)
    setScanResult(null)

    if (scannerRef.current) {
      scannerRef.current.clear()
    }

    // Wait for DOM element to be available
    setTimeout(() => {
      const element = document.getElementById('qr-reader')
      if (!element) {
        console.error('QR reader element not found')
        setIsScanning(false)
        return
      }

      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      )

      scanner.render(
        (decodedText) => {
          try {
            const qrData = JSON.parse(decodedText)
            handleQRSuccess(qrData)
          } catch (error) {
            // If it's not JSON, treat as plain text
            handleQRSuccess({ id: decodedText, name: 'Unknown', timestamp: new Date().toISOString() })
          }
          scanner.clear()
          setIsScanning(false)
        },
        (error) => {
          // Ignore scan errors (they happen frequently during scanning)
        }
      )

      scannerRef.current = scanner
    }, 100)
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleQRSuccess = (qrData: any) => {
    const person = people.find(p => p.id === qrData.id)
    
    if (person) {
      const accessGranted = person.hasAccess
      const log: AccessLog = {
        id: uuidv4(),
        personId: person.id,
        personName: person.name,
        timestamp: new Date(),
        granted: accessGranted,
        method: 'qr-scan'
      }
      
      addAccessLog(log)
      
      // Update person's last accessed time if access granted
      if (accessGranted) {
        const updatedPeople = people.map(p => 
          p.id === person.id ? { ...p, lastAccessed: new Date() } : p
        )
        onUpdatePeople(updatedPeople)
      }
      
      setScanResult(accessGranted ? 'granted' : 'denied')
    } else {
      const log: AccessLog = {
        id: uuidv4(),
        personId: qrData.id || 'unknown',
        personName: qrData.name || 'Unknown Person',
        timestamp: new Date(),
        granted: false,
        method: 'qr-scan'
      }
      
      addAccessLog(log)
      setScanResult('not-found')
    }
  }

  const grantManualAccess = (personId: string) => {
    const person = people.find(p => p.id === personId)
    if (person) {
      const log: AccessLog = {
        id: uuidv4(),
        personId: person.id,
        personName: person.name,
        timestamp: new Date(),
        granted: true,
        method: 'manual'
      }
      
      addAccessLog(log)
      
      const updatedPeople = people.map(p => 
        p.id === person.id ? { ...p, lastAccessed: new Date() } : p
      )
      onUpdatePeople(updatedPeople)
    }
  }

  const clearLogs = () => {
    setAccessLogs([])
    localStorage.removeItem('venue-access-logs')
  }

  // Calculate database statistics
  const totalPeople = people.length
  const peopleWithAccess = people.filter(p => p.hasAccess).length
  const peopleWithoutAccess = totalPeople - peopleWithAccess

  // Filter people for search
  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.phone?.includes(searchTerm)
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Database Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Database Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">{totalPeople}</div>
            <div className="text-sm text-blue-600">Total People</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">{peopleWithAccess}</div>
            <div className="text-sm text-green-600">Access Granted</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">{peopleWithoutAccess}</div>
            <div className="text-sm text-red-600">Access Denied</div>
          </div>
        </div>
      </div>

      {/* QR Scanner Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">QR Code Scanner</h2>
        
        <div className="text-center">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Start Scanning
            </button>
          ) : (
            <div>
              <div id="qr-reader" className="mb-4"></div>
              <button
                onClick={stopScanning}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Stop Scanning
              </button>
            </div>
          )}
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div className={`mt-6 p-4 rounded-lg text-center font-medium ${
            scanResult === 'granted' 
              ? 'bg-green-100 text-green-800' 
              : scanResult === 'denied'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {scanResult === 'granted' && '✅ Access Granted'}
            {scanResult === 'denied' && '❌ Access Denied'}
            {scanResult === 'not-found' && '⚠️ Person Not Found'}
          </div>
        )}
      </div>

      {/* Manual Access Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Manual Access & Database Search</h3>
        </div>
        
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search people in database..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredPeople.length === 0 && searchTerm && (
            <p className="text-gray-500 text-center py-4">No people found matching &ldquo;{searchTerm}&rdquo;</p>
          )}
          
          {(searchTerm ? filteredPeople : people.filter(p => p.hasAccess)).map((person) => (
            <div key={person.id} className={`flex justify-between items-center p-3 rounded-lg ${
              person.hasAccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium">{person.name}</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    person.hasAccess 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {person.hasAccess ? 'Access Granted' : 'Access Denied'}
                  </span>
                </div>
                {person.email && <div className="text-gray-600 text-sm">{person.email}</div>}
                {person.phone && <div className="text-gray-600 text-sm">{person.phone}</div>}
              </div>
              {person.hasAccess && (
                <button
                  onClick={() => grantManualAccess(person.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Grant Access
                </button>
              )}
            </div>
          ))}
          {!searchTerm && people.filter(p => p.hasAccess).length === 0 && (
            <p className="text-gray-500 text-center py-4">No people with access permissions found. Upload a database to get started.</p>
          )}
        </div>
      </div>

      {/* Access Logs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Access Logs</h3>
          {accessLogs.length > 0 && (
            <button
              onClick={clearLogs}
              className="text-red-600 hover:text-red-800 text-sm underline"
            >
              Clear Logs
            </button>
          )}
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {accessLogs.slice().reverse().map((log) => (
            <div key={log.id} className={`p-3 rounded-lg border-l-4 ${
              log.granted 
                ? 'bg-green-50 border-green-400' 
                : 'bg-red-50 border-red-400'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium">{log.personName}</span>
                  <span className={`ml-2 text-sm ${log.granted ? 'text-green-600' : 'text-red-600'}`}>
                    {log.granted ? 'Granted' : 'Denied'}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({log.method === 'qr-scan' ? 'QR Scan' : 'Manual'})
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          {accessLogs.length === 0 && (
            <p className="text-gray-500 text-center py-8">No access logs yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
