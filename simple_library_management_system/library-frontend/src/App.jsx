import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';
import Navbar from './components/navbar';
import BooksList from './pages/BooksList';
import Register from './pages/Register';
import Login from './pages/Login';
import BookDetailpage from './pages/BookDetailpage';
import Background from './components/Background';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Background />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BooksList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/book/:id" element={<BookDetailpage />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;