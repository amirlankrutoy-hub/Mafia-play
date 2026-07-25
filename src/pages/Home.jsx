import React from 'react';
import { useSearchParams } from 'react-router-dom';
import roles from '../data/roles';
import RoleCard from '../components/RoleCard';

const Home = ({ userName }) => {
  // Используем useSearchParams вместо useState
  const [searchParams, setSearchParams] = useSearchParams();

  // Получаем текущую категорию из URL (по умолчанию 'all')
  const selectedCategory = searchParams.get('category') || 'all';

  // Функция для смены категории и обновления URL
  const handleCategoryChange = (category) => {
    if (category === 'all') {
      setSearchParams({}); // Очищаем URL, если выбрано "Вся Семья"
    } else {
      setSearchParams({ category }); // Добавляем ?category=... в URL
    }
  };

  const filteredRoles = selectedCategory === 'all' 
    ? roles 
    : roles.filter(role => role.category === selectedCategory);

  return (
    <div className="space-y-10 py-6">
      {/* ЗАГОЛОВОК С ИМЕНЕМ */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-[0.25em] text-[#d4af37] drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
          Вся Семья в Сборе
        </h1>
        <p className="text-sm md:text-base italic text-[#c5a059] max-w-xl mx-auto">
          {userName ? `Приветствуем в штабе, ${userName}. ` : ''}
          Познокомтесь с нашей странной семйкой
        </p>
        <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-4" />
      </div>

      {/* ФИЛЬТРЫ (Теперь меняют URL) */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {[
          { id: 'all', label: 'Вся Семья' },
          { id: 'mafia', label: '🔴 Клан Мафии' },
          { id: 'civilians', label: '🟢 Мирные Жители' },
          { id: 'neutrals', label: '🟣 Одиночки и Нейтралы' }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => handleCategoryChange(btn.id)}
            className={`rounded-lg px-5 py-2.5 text-xs md:text-sm font-bold uppercase tracking-wider transition-all border ${
              selectedCategory === btn.id
                ? 'bg-gradient-to-r from-[#8b0000] to-[#5c0000] text-[#f3e5ab] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                : 'bg-[#180e0a]/80 text-[#c5a059] border-[#c5a059]/30 hover:border-[#d4af37] hover:text-[#d4af37]'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* СЕТКА КАРТОЧЕК */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredRoles.map((role) => (
          <RoleCard key={role.id} role={role} />
        ))}
      </div>
    </div>
  );
};

export default Home;