import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import ForgotPassword from './pages/ForgotPassword';
import PersonalChats from './pages/PersonalChats';
import Courses from './pages/Courses';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/personalchats" element={<PersonalChats />} />
        <Route path="/courses" element={<Courses />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/registration" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />

      </Routes>
    </Router>

  )
}

export default App