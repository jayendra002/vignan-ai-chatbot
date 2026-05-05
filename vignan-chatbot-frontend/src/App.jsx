import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';
import SharedChat from './pages/SharedChat';
import MarksForm from './pages/MarksForm';
import ProspectDashboard from './pages/ProspectDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route sends users to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/chat" element={<Chat />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/share/:shareId" element={<SharedChat />} />

        <Route path="/marks" element={<MarksForm />} />

        <Route path="/admissions" element={<ProspectDashboard />} />
        
        {/* We will build these next! */}
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/chat" element={<Chat />} /> */}
      </Routes>
    </Router>
  );
}

export default App;