import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import roles from '../data/roles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

function Home({ userName }) {
  // Состояние выбранного фильтра ('all', 'civilians', 'mafia', 'neutrals')
  const [activeCategory, setActiveCategory] = useState('all');

  // Фильтрация списка ролей
  const filteredRoles = roles.filter((role) => {
    if (activeCategory === 'all') return true;
    return role.category === activeCategory;
  });

  // Вспомогательная функция для стилизации тегов
  const getTeamBadgeStyle = (category) => {
    switch (category) {
      case 'mafia':
        return 'border-red-600/60 bg-red-950/80 text-red-300';
      case 'neutrals':
        return 'border-purple-600/60 bg-purple-950/80 text-purple-300';
      case 'civilians':
      default:
        return 'border-emerald-600/60 bg-emerald-950/80 text-emerald-300';
    }
  };

  return (
    <div className="space-y-12 py-6">
      {/* Приветственный баннер */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#d4af37] bg-gradient-to-b from-[#1c100b] via-[#120a07] to-[#080402] p-8 text-center shadow-[0_0_50px_rgba(212,175,55,0.25)]">
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-widest text-[#d4af37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          Добро пожаловать в Mafia Play
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#c5a059] max-w-2xl mx-auto italic">
          Город засыпает... Пролетают тени, а судьба жителей теперь в ваших руках. Погрузитесь в атмосферу интриг и расследований.
        </p>

        {userName && (
          <p className="mt-4 text-xs sm:text-sm text-[#f3e5ab]">
            Вы вошли как: <strong className="text-[#d4af37] font-bold">{userName}</strong>
          </p>
        )}

        <div className="mt-6 flex justify-center gap-4">
          <Link
            to="/play"
            className="rounded-xl bg-gradient-to-r from-[#8b0000] to-[#5c0000] px-8 py-3 text-sm font-bold uppercase tracking-widest text-[#f3e5ab] border border-[#d4af37] shadow-lg transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            🎮 Начать игру
          </Link>
        </div>
      </div>

      {/* Галерея Ролей */}
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-[#d4af37]">
            Персонажи и Карты
          </h2>
          
          {/* 4 КНОПКИ КАТЕГОРИЙ */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`rounded-xl border px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
                activeCategory === 'all'
                  ? 'border-[#d4af37] bg-[#8b0000] text-[#f3e5ab] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'border-[#c5a059]/40 bg-[#120a07] text-[#c5a059] hover:border-[#d4af37]'
              }`}
            >
              Вся семья
            </button>

            <button
              onClick={() => setActiveCategory('civilians')}
              className={`rounded-xl border px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
                activeCategory === 'civilians'
                  ? 'border-emerald-500 bg-emerald-950 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'border-[#c5a059]/40 bg-[#120a07] text-[#c5a059] hover:border-emerald-500'
              }`}
            >
              Жители
            </button>

            <button
              onClick={() => setActiveCategory('mafia')}
              className={`rounded-xl border px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
                activeCategory === 'mafia'
                  ? 'border-red-600 bg-red-950 text-red-200 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                  : 'border-[#c5a059]/40 bg-[#120a07] text-[#c5a059] hover:border-red-600'
              }`}
            >
              Мафии
            </button>

            <button
              onClick={() => setActiveCategory('neutrals')}
              className={`rounded-xl border px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
                activeCategory === 'neutrals'
                  ? 'border-purple-600 bg-purple-950 text-purple-200 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                  : 'border-[#c5a059]/40 bg-[#120a07] text-[#c5a059] hover:border-purple-600'
              }`}
            >
              Нейтралы и Одиночки
            </button>
          </div>
        </div>

        {/* Сетка карточек */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredRoles.map((role) => (
            <Link
              key={role.id}
              to={`/role/${role.id}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#c5a059]/40 bg-gradient-to-b from-[#1c100b] via-[#120a07] to-[#0a0503] p-4 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#d4af37] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              {/* Декоративные уголки карточки */}
              <div className="absolute top-1.5 left-1.5 h-3 w-3 border-l-2 border-t-2 border-[#d4af37]/60 group-hover:border-[#d4af37]"></div>
              <div className="absolute top-1.5 right-1.5 h-3 w-3 border-r-2 border-t-2 border-[#d4af37]/60 group-hover:border-[#d4af37]"></div>
              <div className="absolute bottom-1.5 left-1.5 h-3 w-3 border-l-2 border-b-2 border-[#d4af37]/60 group-hover:border-[#d4af37]"></div>
              <div className="absolute bottom-1.5 right-1.5 h-3 w-3 border-r-2 border-b-2 border-[#d4af37]/60 group-hover:border-[#d4af37]"></div>

              <div>
                {/* Изображение карты */}
                <div className="relative h-60 w-full overflow-hidden rounded-lg border border-[#c5a059]/30 bg-black">
                  <img
                    src={role.image}
                    alt={role.name}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Информация о персонаже */}
                <div className="mt-3 text-center space-y-1.5">
                  <div>
                    <span className={`inline-block rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getTeamBadgeStyle(role.category)}`}>
                      {role.team}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold uppercase tracking-wider text-[#d4af37]">
                    {role.name}
                  </h3>

                  <p className="text-xs italic text-[#c5a059]/90 line-clamp-3">
                    "{role.description}"
                  </p>
                </div>
              </div>

              {/* Кнопка «Досье» внизу карточки */}
              <div className="mt-4 border-t border-[#c5a059]/20 pt-3 text-center">
                <span className="inline-block w-full rounded-lg border border-[#d4af37]/50  px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f3e5ab] transition-all duration-300 group-hover:border-[#d4af37] group-hover:text-white group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                  Досье <FontAwesomeIcon icon={faArrowRight} className="text-[#d4af37] transition-colors group-hover:text-white" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;