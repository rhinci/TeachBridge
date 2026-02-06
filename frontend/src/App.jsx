import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import ForgotPassword from './pages/ForgotPassword';
import PersonalChats from './pages/PersonalChats';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import StudyChatPage from './pages/StudyChatPage';
import StudyChats from './pages/StudyChats'
import PersonalChatPage from './pages/PersonalChatPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Публичные страницы */}
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />

        {/* Защищённые страницы */}
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />

        <Route path="/personalchats" element={
          <PrivateRoute>
            <PersonalChats />
          </PrivateRoute>
        } />

        {/* Страница конкретного личного чата */}
        <Route path="/personal-chat/:chatId" element={
          <PrivateRoute>
            <PersonalChatPage />
          </PrivateRoute>
        } />

        {/* Страница конкретного учебного чата */}
        <Route path="/study-chat/:chatId" element={
          <PrivateRoute>
            <StudyChatPage />
          </PrivateRoute>
        } />

        <Route path="/courses" element={
          <PrivateRoute>
            <Courses />
          </PrivateRoute>
        } />

        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        <Route path="/chat" element={
          <PrivateRoute>
            <StudyChatPage />
          </PrivateRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;