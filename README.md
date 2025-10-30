# Venue Access Control System

A simple and efficient web application for managing venue access using QR codes. This MVP allows you to manage a list of people, generate unique QR codes for each person, scan QR codes for access verification, search through people, and grant manual access.

## Features

### ✅ Core Features Implemented
- **User Management**: Add, edit, and delete people with their contact information
- **QR Code Generation**: Automatic generation of unique QR codes for each person
- **QR Code Scanning**: Real-time QR code scanning using device camera
- **Search Functionality**: Search people by name, email, or phone number
- **Manual Access Control**: Grant access manually without QR codes
- **Access Logging**: Complete audit trail of all access attempts
- **Real-time Status**: Live access status updates
- **Data Persistence**: Local storage for offline functionality

### 🔧 Technical Features
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean interface built with Tailwind CSS
- **TypeScript**: Type-safe development for better code quality
- **Next.js 15**: Latest React framework with App Router
- **Client-side Storage**: Browser localStorage for data persistence

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Modern web browser with camera access

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd VenueAccess
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## How to Use

### 1. Managing People
1. Click **"Manage Access"** tab
2. Click **"Add Person"** to add new people
3. Fill in their details (name is required, email and phone are optional)
4. Each person automatically gets a unique QR code
5. Use the search bar to find specific people
6. Toggle access permissions using the **"Grant/Revoke Access"** buttons

### 2. QR Code Operations
- **Download QR Codes**: Click "Download QR Code" on any person card
- **Print QR Codes**: Download and print QR codes for distribution
- **Share QR Codes**: QR codes contain unique person identifiers

### 3. Access Verification
1. Click **"Scan QR Code"** tab
2. Click **"Start Scanning"** 
3. Point camera at QR code
4. System will automatically:
   - ✅ Grant access if person has permissions
   - ❌ Deny access if person doesn't have permissions  
   - ⚠️ Show "Not Found" for unrecognized QR codes

### 4. Manual Access
- Use the **"Manual Access"** section to grant access without QR scanning
- Useful for backup access or when QR codes aren't working

### 5. Access Logs
- View complete history of all access attempts
- See timestamps, methods (QR scan vs manual), and results
- Clear logs when needed for privacy

## Project Structure

```
VenueAccess/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main application page
│   ├── components/          # React components
│   │   ├── PersonList.tsx   # People management interface
│   │   ├── PersonForm.tsx   # Add/edit person form
│   │   ├── PersonCard.tsx   # Individual person display
│   │   └── QRScanner.tsx    # QR scanning interface
│   └── types/
│       └── index.ts         # TypeScript type definitions
├── .github/
│   └── copilot-instructions.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Data Storage

The application uses browser localStorage for data persistence:
- **People Data**: Stored in `venue-people`
- **Access Logs**: Stored in `venue-access-logs`

**Note**: Data is stored locally in the browser. For production use, consider implementing a backend database.

## QR Code Format

QR codes contain JSON data with the following structure:
```json
{
  "id": "unique-person-id",
  "name": "Person Name", 
  "timestamp": "2025-10-30T19:43:00.000Z"
}
```

## Security Considerations

### Current Implementation (MVP)
- ✅ Client-side data validation
- ✅ Unique ID generation using UUID
- ✅ Access logging for audit trails
- ✅ Data stored locally (no external transmission)

### Recommendations for Production
- 🔧 **Backend Integration**: Move data to secure server database
- 🔧 **Authentication**: Add user login and role-based access
- 🔧 **HTTPS**: Ensure all communication is encrypted
- 🔧 **Rate Limiting**: Prevent abuse of QR scanning
- 🔧 **Data Backup**: Regular backups of access data
- 🔧 **Access Expiry**: Time-limited QR codes for enhanced security

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| QR Scanning | ✅ | ✅ | ✅ | ✅ |
| Camera Access | ✅ | ✅ | ✅ | ✅ |
| Local Storage | ✅ | ✅ | ✅ | ✅ |
| Responsive UI | ✅ | ✅ | ✅ | ✅ |

## Troubleshooting

### QR Scanner Issues
- **Camera not working**: Ensure browser has camera permissions
- **QR not scanning**: Ensure good lighting and steady hand
- **Wrong results**: Verify QR codes are generated by this system

### Performance Issues
- **Slow loading**: Large number of people (>1000) may slow performance
- **Storage limits**: Browser localStorage has ~5-10MB limit

### Data Issues
- **Lost data**: Data is stored locally - clearing browser data will reset
- **Sync issues**: No cloud sync in current version

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features
1. **Backend Integration**: Add API routes in `src/app/api/`
2. **New Components**: Add to `src/components/`
3. **Styling**: Modify Tailwind classes or `globals.css`
4. **Types**: Update `src/types/index.ts` for new data structures

## Future Enhancements

### Planned Features
- [ ] **Cloud Sync**: Database integration with PostgreSQL/MongoDB
- [ ] **Multi-venue Support**: Manage multiple venues from one interface
- [ ] **Advanced Analytics**: Access patterns and reporting
- [ ] **Mobile App**: React Native version for mobile devices
- [ ] **Bulk Import**: CSV import for large user lists
- [ ] **Access Schedules**: Time-based access permissions
- [ ] **Visitor Management**: Temporary access for guests
- [ ] **Integration APIs**: Connect with other systems

### Technical Improvements
- [ ] **Real-time Updates**: WebSocket support for live updates
- [ ] **Offline Mode**: Progressive Web App (PWA) capabilities
- [ ] **Performance**: Virtual scrolling for large lists
- [ ] **Accessibility**: Enhanced screen reader support
- [ ] **Testing**: Comprehensive test suite

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing [Issues](../../issues)
3. Create a new issue with detailed information

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
