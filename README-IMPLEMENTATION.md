# ATS Resume Maker

A modern, type-safe resume builder with ATS optimization, built with React, TypeScript, Zod, Zustand, and IndexedDB persistence.

## Features

### 🎯 Core Features
- **Type-safe Resume Schema**: Comprehensive resume domain model with Zod validation
- **ATS Optimization**: Built-in text cleanup, keyword extraction, and validation
- **Offline Resilience**: Dual persistence with localStorage and IndexedDB
- **Real-time Validation**: Form validation with runtime type checking
- **Import/Export**: JSON-based resume data management

### 🛠 Technical Stack
- **Frontend**: React 19 + TypeScript
- **State Management**: Zustand with persistence middleware
- **Form Handling**: React Hook Form with Zod resolvers
- **Validation**: Zod schemas with custom refinements
- **Storage**: IndexedDB (idb-keyval) + localStorage fallback
- **Styling**: Tailwind CSS + DaisyUI
- **Build Tool**: Vite

## Architecture

### Schema Design (`src/lib/schema/`)

#### Resume Domain Model
```typescript
interface Resume {
  personalInfo: PersonalInfo
  summary: string
  workExperience: WorkExperience[]
  education: Education[]
  projects: Project[]
  skills: Skills
  certifications: Certification[]
  languages: Language[]
  lastModified?: string
}
```

#### Key Schema Features
- **Nested Validation**: Complex objects with deep validation rules
- **Date Range Validation**: Ensures logical date sequences
- **Contact Validation**: Email/phone format validation
- **Array Validation**: Skills, achievements, and certifications
- **Custom Refinements**: ATS-specific cleanup and validation

### State Management (`src/stores/`)

#### Zustand Store Features
- **Dual Persistence**: IndexedDB for reliability, localStorage for speed
- **Type-safe Actions**: All actions are fully typed
- **Selective Subscriptions**: Optimized re-renders with selectors
- **Validation Integration**: Built-in resume validation
- **Import/Merge**: Smart data merging capabilities

#### Store Actions
- CRUD operations for all resume sections
- Import/export functionality
- Validation and completeness scoring
- Keyword extraction for ATS optimization
- Data merging from external sources

### Form Integration (`src/components/forms/`)

#### React Hook Form + Zod
- **Type Inference**: Automatic type generation from Zod schemas
- **Real-time Validation**: Live validation with error handling
- **Auto-save**: Automatic saving on form changes
- **Reset Functionality**: Form state management

## ATS Optimization

### Text Processing
- **Whitespace Normalization**: Consistent spacing and formatting
- **Character Cleanup**: Removal of non-ASCII and control characters
- **Keyword Extraction**: Automated keyword identification
- **Email/Phone Validation**: ATS-compatible format checking

### Validation Features
- **Completeness Scoring**: Resume completeness percentage
- **Section Validation**: Required field checking
- **Date Logic**: Valid date range enforcement
- **Format Compliance**: ATS-friendly formatting

## Persistence Strategy

### IndexedDB Integration
- **Primary Storage**: IndexedDB via idb-keyval
- **localStorage Backup**: Fast access for frequently used data
- **Automatic Sync**: Bidirectional synchronization
- **Error Handling**: Graceful fallback between storage mechanisms

### Data Flow
```
User Input → Zod Validation → Zustand Store → IndexedDB → localStorage Backup
```

## Usage Examples

### Basic Store Usage
```typescript
import { useResumeStore, usePersonalInfo } from './stores/resume-store';

// Get personal info
const personalInfo = usePersonalInfo();

// Update personal info
const { updatePersonalInfo } = useResumeStore();
updatePersonalInfo({ fullName: 'John Doe', title: 'Developer' });
```

### Form Integration
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PersonalInfoSchema } from '../lib/schema';

const { register, handleSubmit } = useForm<PersonalInfo>({
  resolver: zodResolver(PersonalInfoSchema),
});
```

### Validation and Analytics
```typescript
const { validate, getScore, getKeywords } = useResumeValidation();

const validation = validate(); // { isValid: boolean, errors: string[] }
const score = getScore(); // 0-100
const keywords = getKeywords(); // string[]
```

## File Structure

```
src/
├── lib/
│   └── schema/
│       ├── index.ts              # Schema exports
│       ├── resume-schema.ts      # Zod schemas
│       └── validation-helpers.ts # ATS utilities
├── stores/
│   └── resume-store.ts           # Zustand store
├── components/
│   ├── forms/
│   │   └── PersonalInfoForm.tsx  # Sample form
│   └── ResumeStoreDemo.tsx       # Store demonstration
├── App.tsx                       # Main application
└── main.tsx                      # Application entry
```

## Development

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Type Checking
```bash
npx tsc --noEmit
```

## Type Safety

All components and store operations are fully typed:
- **Schema Types**: Auto-generated from Zod schemas
- **Form Types**: Inferred from schemas in React Hook Form
- **Store Types**: Typed actions and selectors
- **Component Props**: Type-safe component interfaces

## Performance Features

- **Optimized Re-renders**: Selective subscriptions in Zustand
- **Efficient Storage**: IndexedDB for large datasets
- **Lazy Loading**: Components load on demand
- **Memory Management**: Automatic cleanup and garbage collection

## Browser Support

- Modern browsers with IndexedDB support
- Graceful degradation for older browsers
- Progressive enhancement approach

## Contributing

When adding new features:
1. Define Zod schemas first
2. Update store with type-safe actions
3. Create forms with React Hook Form integration
4. Add validation helpers as needed
5. Update TypeScript types

## License

MIT License - see LICENSE file for details