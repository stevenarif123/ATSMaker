import './App.css'
import ImportWorkflowPage from './app/(app)/import/ImportWorkflowPage.jsx'
import { ResumeProvider } from './store/resumeStore.js'

function App() {
  return (
    <ResumeProvider>
      <div className="app-shell">
        <ImportWorkflowPage />
      </div>
    </ResumeProvider>
  )
}

export default App
