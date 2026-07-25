import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ userName, onChangeName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="border-b border-[#d4af37]/30 bg-[#140b07]/95 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          
          {/* Логотип */}
          <Link to="/" className="group flex items-center gap-2 sm:gap-3" onClick={() => setIsMenuOpen(false)}>
            <img className='w-[30px] h-[30px]' src="favicon.svg" alt="" />
            <span className="text-lg sm:text-2xl font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#d4af37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-colors group-hover:text-[#f3e5ab]">
              Mafia Online
            </span>
          </Link>

          {/* Десктопная навигация */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="rounded-lg bg-gradient-to-r from-[#8b0000] to-[#5c0000] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#f3e5ab] border border-[#d4af37] shadow-md transition-all hover:brightness-125 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            >
              🏠 Главная
            </Link>

            <Link 
              to="/play" 
              className="rounded-lg bg-gradient-to-r from-[#8b0000] to-[#5c0000] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#f3e5ab] border border-[#d4af37] shadow-md transition-all hover:brightness-125 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            >
              🎮 Играть
            </Link>

            {userName && (
              <div className="flex items-center gap-3 border-l border-[#d4af37]/20 pl-6">
                <span className="text-xs sm:text-sm italic text-[#c5a059]">
                  <strong className="text-[#d4af37] not-italic">{userName}</strong>
                </span>
                <button
                  onClick={onChangeName}
                  className="rounded border border-[#c5a059]/30 bg-[#180e0a] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#c5a059] transition-all hover:border-[#d4af37] hover:text-[#d4af37]"
                >
                  Сменить
                </button>
              </div>
            )}
          </div>

          {/* Кнопка "Бургер" для мобилок */}
          <button
            onClick={toggleMenu}
            type="button"
            className="md:hidden rounded-lg border border-[#d4af37]/40 bg-[#180e0a] p-2 text-[#d4af37] focus:outline-none"
            aria-label="Переключить меню"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Выпадающее мобильное меню */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-[#d4af37]/20 space-y-3 pb-2 animate-fadeIn">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block text-center rounded-lg bg-gradient-to-r from-[#8b0000] to-[#5c0000] py-2.5 text-xs font-bold uppercase tracking-widest text-[#f3e5ab] border border-[#d4af37]"
            >
              🏠 Главная
            </Link>

            <Link 
              to="/play" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-center rounded-lg bg-gradient-to-r from-[#8b0000] to-[#5c0000] py-2.5 text-xs font-bold uppercase tracking-widest text-[#f3e5ab] border border-[#d4af37]"
            >
              🎮 Играть
            </Link>

            {userName && (
              <div className="flex items-center justify-between pt-2 px-2 border-t border-[#c5a059]/20">
                <span className="text-xs italic text-[#c5a059]">
                  Игрок: <strong className="text-[#d4af37] not-italic">{userName}</strong>
                </span>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onChangeName();
                  }}
                  className="rounded border border-[#c5a059]/30 bg-[#180e0a] px-3 py-1 text-[10px] uppercase tracking-wider text-[#c5a059]"
                >
                  Сменить имя
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;