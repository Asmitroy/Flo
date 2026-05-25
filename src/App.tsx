import { Routes, Route } from 'react-router-dom';
import CognitiveSimulator from './CognitiveSimulator';
import AnalysisPage from './AnalysisPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<CognitiveSimulator />}>
        <Route path="analysis" element={<AnalysisPage />} />
      </Route>
    </Routes>
  );
}

export default App;
