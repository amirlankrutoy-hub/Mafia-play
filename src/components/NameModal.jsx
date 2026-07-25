import React, { useState, useEffect } from 'react';

const NameModal = ({ onSaveName, existingName }) => {
  const [inputName, setInputName] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  // Если имя уже есть в базе, но открыли модалку — показываем приветствие
  const hasSavedName = Boolean(existingName) && !isChanging;

  useEffect(() => {
    if (existingName) {
      setInputName(existingName);
    }
  }, [existingName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputName.trim()) {
      onSaveName(inputName.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-[#d4af37] bg-gradient-to-b from-[#1c100b] via-[#120a07] to-[#080402] p-8 shadow-[0_0_50px_rgba(212,175,55,0.3)] text-center">
        {/* Декоративные уголки */}
        <div className="absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-[#d4af37]" />
        <div className="absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-[#d4af37]" />
        <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-[#d4af37]" />
        <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-[#d4af37]" />

        <div className="text-4xl mb-3">🎩</div>

        {hasSavedName ? (
          /* РЕЖИМ ПОВТОРНОГО ВХОДА */
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-[#d4af37]">
                С возвращением!
              </h2>
              <p className="mt-3 text-lg font-bold text-[#f3e5ab]">
                {existingName}
              </p>
              <p className="mt-1 text-xs italic text-[#c5a059]">
                Семья рада видеть вас снова в штабе.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => onSaveName(existingName)}
                className="w-full rounded-lg bg-gradient-to-r from-[#8b0000] to-[#5c0000] py-3 text-sm font-bold uppercase tracking-wider text-[#f3e5ab] border border-[#d4af37] transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110"
              >
                Продолжить как {existingName}
              </button>

              <button
                type="button"
                onClick={() => setIsChanging(true)}
                className="w-full rounded-lg border border-[#c5a059]/40 bg-[#0d0907] py-2.5 text-xs font-semibold uppercase tracking-wider text-[#c5a059] transition-all hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                Войти под другим именем
              </button>
            </div>
          </div>
        ) : (
          /* РЕЖИМ ВВОДА НОВОГО ИМЕНИ */
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-[#d4af37]">
              Представьтесь, гангстер
            </h2>
            <p className="mt-2 text-xs italic text-[#c5a059]">
              Семья должна знать, с кем имеет дело. Введите ваше имя для входа в картотеку.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Ваше имя или псевдоним..."
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full rounded-lg border border-[#c5a059]/40 bg-[#0d0907] px-4 py-3 text-center text-[#e6d5bc] placeholder-[#c5a059]/40 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                autoFocus
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-[#8b0000] to-[#5c0000] py-3 text-sm font-bold uppercase tracking-wider text-[#f3e5ab] border border-[#d4af37] transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110"
              >
                Сохранить и войти
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default NameModal;