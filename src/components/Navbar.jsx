import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ userName, onChangeName }) => {
  return (
    <nav className="border-b border-[#d4af37]/30 bg-[#140b07]/90 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="group flex items-center gap-3">
            <span className="text-2xl">🎩</span>
            <span className="text-2xl font-black uppercase tracking-[0.2em] text-[#d4af37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-colors group-hover:text-[#f3e5ab]">
              Mafia Cards
            </span>
          </Link>

          {/* НОВАЯ КНОПКА "ИГРАТЬ" */}
          <Link 
            to="/play" 
            className="rounded-lg bg-gradient-to-r from-[#8b0000] to-[#5c0000] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#f3e5ab] border border-[#d4af37] shadow-md transition-all hover:brightness-125 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
          >
            🎮 Играть
          </Link>
          <Link
          to="/"
          className ='rounded-lg bg-gradient-to-r from-[#8b0000] to-[#5c0000] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#f3e5ab] border border-[#d4af37] shadow-md transition-all hover:brightness-125 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"'

          >
            🏠Home
          </Link>
         

        </div>

        {userName && (
          <div className="flex items-center gap-4">
            <span className="text-sm italic text-[#c5a059]">
              Добро пожаловать, <strong className="text-[#d4af37] not-italic">{userName}</strong>
            </span>
            <button
              onClick={onChangeName}
              className="rounded border border-[#c5a059]/30 bg-[#180e0a] px-3 py-1 text-xs uppercase tracking-wider text-[#c5a059] transition-all hover:border-[#d4af37] hover:text-[#d4af37]"
              title="Сменить имя"
            >
              Сменить
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;