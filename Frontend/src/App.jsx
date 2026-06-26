import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Monitor from './pages/Monitor';


/**
 * App Component
 * 
 * Main app with routing:
 * - / → Home page
 * - /monitor → Monitoring page
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/monitor" element={<Monitor />} />
      </Routes>
    </Router>
  );
}

export default App;
