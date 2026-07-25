import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RoleDetail from './pages/RoleDetail';
import Play from './pages/Play';
import Navbar from './components/Navbar';
import NotFound from './pages/NotFound';
import NameModal from './components/NameModal';

function App() {
  const [userName, setUserName] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('mafia_user_name');
    if (savedName) {
      setUserName(savedName);
    }
    setShowModal(true);
  }, []);

  const handleSaveName = (name) => {
    localStorage.setItem('mafia_user_name', name);
    setUserName(name);
    setShowModal(false);
  };

  const handleChangeName = () => {
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-[#0d0907] text-[#e6d5bc] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a170e] via-[#0d0907] to-[#050302] font-serif selection:bg-[#d4af37] selection:text-black">
      {showModal && (
        <NameModal 
          onSaveName={handleSaveName} 
          existingName={userName} 
        />
      )}

      <Navbar userName={userName} onChangeName={handleChangeName} />

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home userName={userName} />} />
          <Route path="/role/:id" element={<RoleDetail />} />
          <Route path="/play" element={<Play currentUser={userName} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;