export interface Person {
  id: string
  name: string
  email?: string
  phone?: string
  hasAccess: boolean
  qrCode: string
  lastAccessed?: Date
  createdAt: Date
}

export interface AccessLog {
  id: string
  personId: string
  personName: string
  timestamp: Date
  granted: boolean
  method: 'qr-scan' | 'manual'
}
