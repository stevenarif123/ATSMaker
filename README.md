# ATS Resume Maker

A free, open-source ATS-friendly resume builder built with React, Vite, and DaisyUI.

## Features

### Core Functionality
- **Live Resume Editor**: Edit your resume with real-time preview
- **Multiple Sections**: Personal info, experience, education, skills, and projects
- **Drag & Drop**: Reorder experience entries with drag-and-drop functionality
- **Auto-Save**: Changes are automatically saved to browser storage
- **Offline Support**: Works offline with clear status indicators

### Export Options
- **PDF Export**: Generate ATS-friendly PDFs using html2canvas + jsPDF
- **JSON Export**: Export your resume data for backup or sharing
- **JSON Import**: Import existing resume data from JSON files

### Technical Features
- **React Hook Form**: Form validation and management
- **Zustand**: Lightweight state management with localStorage persistence
- **DaisyUI**: Beautiful, accessible UI components
- **Tailwind CSS**: Utility-first styling
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd atsmaker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Creating Your Resume

1. **Personal Information**: Add your contact details and professional summary
2. **Experience**: Add work experience with bullet points and dates
3. **Education**: Add your educational background
4. **Skills**: List your technical and soft skills with proficiency levels
5. **Projects**: Showcase personal or professional projects

### Exporting Your Resume

- **PDF**: Click "Export PDF" to generate a downloadable PDF file
- **JSON**: Click "Export JSON" to save your resume data
- **Import**: Click "Import JSON" to load previously saved resume data

### Offline Usage

The application works completely offline:
- All data is stored in your browser's localStorage
- PDF generation happens client-side
- No network connection required for editing or exporting

## ATS Optimization

The generated PDFs are optimized for Applicant Tracking Systems:
- Clean, simple layout
- Standard fonts (Arial, sans-serif)
- No images or complex formatting
- Proper heading hierarchy
- Machine-readable text

## Tech Stack

- **Frontend**: React 19, Vite
- **UI Framework**: DaisyUI, Tailwind CSS
- **State Management**: Zustand with persistence
- **Forms**: React Hook Form
- **PDF Generation**: html2canvas, jsPDF
- **Drag & Drop**: @dnd-kit
- **Routing**: React Router

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
