import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Builder from './app/(app)/builder/page'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Builder />} />
        <Route path="/builder" element={<Builder />} />
      </Routes>
    </Router>
  )
}

export default App
