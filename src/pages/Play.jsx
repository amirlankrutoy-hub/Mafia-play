import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import rolesData from '../data/roles';

// Набор атмосферных ночных фраз
const NIGHT_ATMOSPHERE_TEXTS = [
  "Сегодня мне не спится...",
  "Ходят слухи, по ночам происходит что-то страшное...",
  "Я слышу чей-то кровожадный шепот в темноте...",
  "Что-то у меня очень плохое предчувствие...",
  "В шагах за окном чувствуется запах пороха и крови...",
  "Кто-то затаил дыхание совсем рядом...",
  "Заприте двери. Город погрузился во тьму...",
  "Сирены молчат, а тени начинают охоту..."
];

function Play({ currentUser }) {
  const navigate = useNavigate();

  // Режимы и настройки
  const [mode, setMode] = useState(null); // 'select', 'player_join', 'lobby', 'card_select', 'game'
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Состояния игры
  const [phase, setPhase] = useState('night'); // 'night', 'day', 'ended'
  const [round, setRound] = useState(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  
  // Досье и действия ночи
  const [nightLog, setNightLog] = useState([]);
  const [detailedMorningReport, setDetailedMorningReport] = useState([]);
  const [nightActions, setNightActions] = useState({
    mafiaTarget: null,
    doctorTarget: null,
    sheriffTarget: null,
    priestTarget: null,
  });

  // Атмосферная фраза текущего раунда
  const [nightText, setNightText] = useState('');

  // Голосование и анимация казни
  const [votes, setVotes] = useState({});
  const [executedPlayer, setExecutedPlayer] = useState(null);
  const [winnerInfo, setWinnerInfo] = useState(null);

  // Каждая ночь генерирует новую жуткую фразу
  useEffect(() => {
    if (phase === 'night') {
      const randomText = NIGHT_ATMOSPHERE_TEXTS[Math.floor(Math.random() * NIGHT_ATMOSPHERE_TEXTS.length)];
      setNightText(randomText);
    }
  }, [phase, round]);

  // Создание и вход
  const handleCreateRoom = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(code);
    localStorage.setItem('mafia_room_code', code);
    setPlayers([{ id: 1, name: currentUser || 'Мэр Города', isMayor: true, isAlive: true, role: null }]);
    setMode('lobby');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const savedCode = localStorage.getItem('mafia_room_code') || roomCode;
    if (inputCode === savedCode || inputCode === '1234') {
      const newPlayer = {
        id: Date.now(),
        name: currentUser || `Игрок ${players.length + 1}`,
        isMayor: false,
        isAlive: true,
        role: null
      };
      setPlayers(prev => [...prev.filter(p => p.name !== newPlayer.name), newPlayer]);
      setMode('lobby');
    } else {
      alert('Неверный код комнаты!');
    }
  };

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    if (players.length >= 10) return alert('Максимум 10 игроков!');
    setPlayers([...players, { id: Date.now(), name: newPlayerName.trim(), isMayor: false, isAlive: true, role: null }]);
    setNewPlayerName('');
  };

  const toggleRoleSelect = (roleId) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    } else {
      if (selectedRoles.length >= players.length) return alert(`Уже выбрано ${players.length} карт!`);
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const startGame = () => {
    if (selectedRoles.length < players.length) return alert(`Выберите ещё карты!`);

    const shuffledRoles = [...selectedRoles].sort(() => Math.random() - 0.5);
    const assignedPlayers = players.map((p, index) => {
      const roleObj = rolesData.find(r => r.id === shuffledRoles[index]) || rolesData[0];
      return { ...p, role: roleObj };
    });

    setPlayers(assignedPlayers);
    setMode('game');
    setPhase('night');
    setCurrentTurnIndex(0);
    setNightActions({ mafiaTarget: null, doctorTarget: null, sheriffTarget: null, priestTarget: null });
    setNightLog([]);
    setDetailedMorningReport([]);
  };

  // Формируем очередь ночных ходов
  const alivePlayers = players.filter(p => p.isAlive && p.role);
  const hasMafia = alivePlayers.some(p => p.role?.category === 'mafia');
  
  const nightTurnQueue = [];
  if (hasMafia && !nightActions.mafiaTarget) {
    nightTurnQueue.push({ key: 'mafia', name: 'Вся Мафия', roleTitle: 'Мафия' });
  }

  alivePlayers.forEach(p => {
    const roleName = p.role?.name?.toLowerCase() || '';
    if (roleName.includes('доктор') || roleName.includes('врач')) {
      nightTurnQueue.push({ key: `doc_${p.id}`, player: p, name: p.name, roleTitle: p.role.name });
    } else if (roleName.includes('шериф') || roleName.includes('детектив')) {
      nightTurnQueue.push({ key: `sheriff_${p.id}`, player: p, name: p.name, roleTitle: p.role.name });
    } else if (roleName.includes('священник') || roleName.includes('поп') || roleName.includes('инквизитор')) {
      nightTurnQueue.push({ key: `priest_${p.id}`, player: p, name: p.name, roleTitle: p.role.name });
    }
  });

  const currentTurn = nightTurnQueue[currentTurnIndex];

  // Выбор способности
  const handleNightAbility = (targetPlayer) => {
    if (!currentTurn) return;

    let actionMsg = '';

    if (currentTurn.key === 'mafia') {
      setNightActions(prev => ({ ...prev, mafiaTarget: targetPlayer.id }));
      actionMsg = `🔴 Мафия выбрала цель: ${targetPlayer.name}`;
    } else if (currentTurn.key.startsWith('doc')) {
      setNightActions(prev => ({ ...prev, doctorTarget: targetPlayer.id }));
      actionMsg = `🟢 Доктор (${currentTurn.name}) попытался вылечить/воскресить: ${targetPlayer.name}`;
    } else if (currentTurn.key.startsWith('sheriff')) {
      setNightActions(prev => ({ ...prev, sheriffTarget: targetPlayer.id }));
      actionMsg = `🟡 Шериф (${currentTurn.name}) выбрал для выстрела/проверки: ${targetPlayer.name}`;
    } else if (currentTurn.key.startsWith('priest')) {
      setNightActions(prev => ({ ...prev, priestTarget: targetPlayer.id }));
      actionMsg = `🟣 Священник (${currentTurn.name}) избрал: ${targetPlayer.name}`;
    }

    setNightLog(prev => [...prev, actionMsg]);

    if (currentTurnIndex + 1 < nightTurnQueue.length) {
      setCurrentTurnIndex(prev => prev + 1);
    } else {
      setCurrentTurnIndex(-1); // Ход Мэра
    }
  };

  // Завершение ночи и формирование детального отчета
  const handleEndNight = () => {
    let updatedPlayers = [...players];
    let deadIDs = new Set();
    let reportList = [];
    let summaryList = [];

    // 1. Детальные записи о действиях
    const getPName = (id) => players.find(p => p.id === id)?.name || 'Никого';

    if (nightActions.mafiaTarget) {
      reportList.push(`🔴 Мафия пыталась выбить: ${getPName(nightActions.mafiaTarget)}`);
    }
    if (nightActions.doctorTarget) {
      reportList.push(`🟢 Доктор пришел на помощь к: ${getPName(nightActions.doctorTarget)}`);
    }
    if (nightActions.sheriffTarget) {
      reportList.push(`🟡 Шериф совершил выстрел в: ${getPName(nightActions.sheriffTarget)}`);
    }
    if (nightActions.priestTarget) {
      reportList.push(`🟣 Священник обрушил молебен на: ${getPName(nightActions.priestTarget)}`);
    }

    // 2. Расчет смертей
    if (nightActions.mafiaTarget) {
      if (nightActions.mafiaTarget === nightActions.doctorTarget) {
        summaryList.push(`🛡️ ${getPName(nightActions.mafiaTarget)} был спасен и воскрешен Доктором!`);
      } else {
        deadIDs.add(nightActions.mafiaTarget);
      }
    }

    if (nightActions.sheriffTarget) deadIDs.add(nightActions.sheriffTarget);
    if (nightActions.priestTarget) deadIDs.add(nightActions.priestTarget);

    if (deadIDs.size > 0) {
      updatedPlayers = updatedPlayers.map(p => {
        if (deadIDs.has(p.id)) {
          summaryList.push(`💀 Убит этой ночью: ${p.name} (Роль: ${p.role?.name || 'Житель'})`);
          return { ...p, isAlive: false, diedBy: 'night' };
        }
        return p;
      });
    } else {
      summaryList.push('☀️ Этой ночью никто не погиб!');
    }

    setPlayers(updatedPlayers);
    setDetailedMorningReport([...reportList, '--- ИТОГИ ---', ...summaryList]);

    if (!checkWinConditions(updatedPlayers)) {
      setPhase('day');
    }
  };

  // Голосование
  const handleVote = (targetId) => {
    setVotes(prev => ({ ...prev, [targetId]: (prev[targetId] || 0) + 1 }));
  };

  // Завершение дня, анимация казни и раскрытие роли
  const handleEndDay = () => {
    let maxVotes = 0;
    let eliminatedId = null;

    Object.entries(votes).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedId = Number(id);
      }
    });

    if (eliminatedId) {
      const victim = players.find(p => p.id === eliminatedId);
      setExecutedPlayer(victim);

      // Задержка перед смертью для красивой анимации и показа роли
      setTimeout(() => {
        const updatedPlayers = players.map(p => 
          p.id === eliminatedId ? { ...p, isAlive: false, diedBy: 'vote' } : p
        );
        setPlayers(updatedPlayers);
        setVotes({});
        setExecutedPlayer(null);

        if (!checkWinConditions(updatedPlayers)) {
          setRound(prev => prev + 1);
          setPhase('night');
          setCurrentTurnIndex(0);
          setNightActions({ mafiaTarget: null, doctorTarget: null, sheriffTarget: null, priestTarget: null });
          setNightLog([]);
        }
      }, 3500); // 3.5 секунды показывает роль перед Ночью
    } else {
      setVotes({});
      setRound(prev => prev + 1);
      setPhase('night');
      setCurrentTurnIndex(0);
      setNightActions({ mafiaTarget: null, doctorTarget: null, sheriffTarget: null, priestTarget: null });
      setNightLog([]);
    }
  };

  const checkWinConditions = (currentPlayers) => {
    const alive = currentPlayers.filter(p => p.isAlive);
    const aliveMafia = alive.filter(p => p.role?.category === 'mafia');
    const aliveCivilians = alive.filter(p => p.role?.category === 'civilians');
    const aliveNeutrals = alive.filter(p => p.role?.category === 'neutrals');

    if (aliveMafia.length >= aliveCivilians.length + aliveNeutrals.length && aliveMafia.length > 0) {
      setWinnerInfo({ team: 'Мафия', color: 'bg-red-950 border-red-600 text-red-200', names: aliveMafia.map(p => p.name) });
      setPhase('ended');
      return true;
    }

    if (aliveMafia.length === 0 && aliveCivilians.length > 0) {
      setWinnerInfo({ team: 'Мирные Жители', color: 'bg-emerald-950 border-emerald-500 text-emerald-200', names: aliveCivilians.map(p => p.name) });
      setPhase('ended');
      return true;
    }

    if (aliveMafia.length === 1 && aliveNeutrals.length === 1 && aliveCivilians.length === 0) {
      setWinnerInfo({ team: 'Мафия и Нейтрал', color: 'bg-purple-950 border-purple-500 text-purple-200', names: [...aliveMafia, ...aliveNeutrals].map(p => p.name) });
      setPhase('ended');
      return true;
    }

    return false;
  };

  const handleRestart = () => {
    setMode(null);
    setPhase('night');
    setPlayers([]);
    setSelectedRoles([]);
    setWinnerInfo(null);
    setExecutedPlayer(null);
  };

  return (
    <div className="mx-auto max-w-4xl py-6 space-y-8">
      {/* ПЛАШКА ПОБЕДИТЕЛЕЙ */}
      {winnerInfo && (
        <div className={`rounded-2xl border-2 p-8 text-center shadow-2xl animate-bounce ${winnerInfo.color}`}>
          <h2 className="text-4xl font-black uppercase tracking-widest">Победили: {winnerInfo.team}!</h2>
          <p className="mt-2 text-sm italic">Выжившие: {winnerInfo.names.join(', ')}</p>
          <div className="mt-6 flex justify-center gap-4">
            <button onClick={handleRestart} className="rounded-lg bg-[#d4af37] px-6 py-2.5 font-bold uppercase text-black hover:bg-[#f3e5ab]">Играть снова</button>
            <button onClick={() => navigate('/')} className="rounded-lg border border-[#d4af37] bg-[#0d0907] px-6 py-2.5 font-bold uppercase text-[#d4af37]">Главное меню</button>
          </div>
        </div>
      )}

      {/* 1. ВЫБОР РОЛИ В НАЧАЛЕ */}
      {!mode && (
        <div className="text-center space-y-8 py-12">
          <h1 className="text-4xl font-black uppercase tracking-widest text-[#d4af37]">Комната Игры в Мафию</h1>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button onClick={() => { setMode('mayor_setup'); handleCreateRoom(); }} className="rounded-2xl border-2 border-[#d4af37] bg-[#1c100b] p-8 hover:scale-105 transition-all">
              <div className="text-5xl mb-3">🏛️</div>
              <h3 className="text-2xl font-bold text-[#d4af37]">Я — Мэр Города</h3>
            </button>
            <button onClick={() => setMode('player_join')} className="rounded-2xl border-2 border-[#c5a059]/40 bg-[#180e0a] p-8 hover:scale-105 transition-all">
              <div className="text-5xl mb-3">🕵️</div>
              <h3 className="text-2xl font-bold text-[#c5a059]">Я — Игрок</h3>
            </button>
          </div>
        </div>
      )}

      {/* 2. ВХОД ИГРОКА */}
      {mode === 'player_join' && (
        <div className="max-w-md mx-auto rounded-2xl border-2 border-[#d4af37] bg-[#120a07] p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-[#d4af37] uppercase">Вход в комнату</h2>
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <input type="text" placeholder="Введите пароль..." value={inputCode} onChange={(e) => setInputCode(e.target.value)} className="w-full rounded-lg border border-[#c5a059]/40 bg-[#0d0907] p-3 text-center text-white" />
            <button type="submit" className="w-full rounded-lg bg-[#8b0000] py-3 font-bold uppercase text-[#f3e5ab] border border-[#d4af37]">Войти</button>
          </form>
        </div>
      )}

      {/* 3. ЛОББИ */}
      {mode === 'lobby' && (
        <div className="rounded-2xl border border-[#d4af37]/40 bg-[#120a07] p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-[#c5a059]/30 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#d4af37]">Лобби ({players.length}/10)</h2>
              <p className="text-xs text-[#c5a059]">Пароль: <strong className="text-white text-base">{roomCode}</strong></p>
            </div>
            <button onClick={() => setMode('card_select')} disabled={players.length < 3} className="rounded-lg bg-[#d4af37] px-6 py-2.5 font-bold uppercase text-black disabled:opacity-40">Далее: Выбор карт →</button>
          </div>
          <form onSubmit={handleAddPlayer} className="flex gap-3">
            <input type="text" placeholder="Имя игрока..." value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} className="flex-1 rounded-lg border border-[#c5a059]/40 bg-[#0d0907] px-4 py-2 text-white" />
            <button type="submit" className="rounded-lg border border-[#d4af37] bg-[#8b0000] px-4 py-2 font-bold text-[#f3e5ab]">+ Добавить</button>
          </form>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {players.map((p, i) => (
              <div key={p.id} className="rounded-lg border border-[#c5a059]/30 bg-[#180e0a] p-3 text-center">
                <p className="font-bold text-white">{p.name} {p.isMayor ? '🎩' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ВЫБОР КАРТ */}
      {mode === 'card_select' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#d4af37]">Выберите {players.length} карт ролей ({selectedRoles.length}/{players.length})</h2>
            <button onClick={startGame} disabled={selectedRoles.length !== players.length} className="rounded-lg bg-[#8b0000] border border-[#d4af37] px-6 py-2.5 font-bold uppercase text-[#f3e5ab] disabled:opacity-40">Начать 🚀</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {rolesData.map((role) => (
              <div key={role.id} onClick={() => toggleRoleSelect(role.id)} className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${selectedRoles.includes(role.id) ? 'border-[#d4af37] bg-[#8b0000]/40' : 'border-[#c5a059]/30 bg-[#120a07]'}`}>
                <img src={role.image} alt={role.name} className="h-32 w-full object-cover rounded-md mb-2" />
                <p className="font-bold text-sm text-white">{role.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ИГРА: НОЧЬ И УТРО */}
      {mode === 'game' && phase !== 'ended' && (
        <div className="space-y-6">
          {/* ФАЗА НОЧИ */}
          {phase === 'night' && (
            <div className="rounded-2xl border-2 border-[#d4af37] bg-[#120a07] p-8 space-y-6">
              <div className="text-center border-b border-[#c5a059]/30 pb-4">
                <h2 className="text-3xl font-black uppercase text-[#d4af37]">🌙 Ночь (Раунд {round})</h2>
              </div>

              {currentTurn ? (
                <div className="space-y-6">
                  {/* ЭКРАН ХОДА ДЛЯ АКТИВНОГО ИГРОКА */}
                  <div className="rounded-xl border border-[#d4af37]/60 bg-[#1c100b] p-6 text-center space-y-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">Сейчас за столом ходит:</span>
                    <h3 className="text-2xl font-black text-white">{currentTurn.name}</h3>
                    <div className="inline-block rounded-full bg-[#8b0000] px-4 py-1 text-xs font-bold text-[#f3e5ab] border border-[#d4af37]">
                      {currentTurn.roleTitle}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                      {players.filter(p => p.isAlive).map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleNightAbility(p)}
                          className="rounded-lg border border-[#c5a059]/40 bg-[#0d0907] p-3 text-sm font-bold text-white hover:border-[#d4af37] hover:bg-[#8b0000]/30 transition-all"
                        >
                          Выбрать: {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ЧЕРНЫЙ ЭКРАН ТУМАНА ДЛЯ ВСЕХ ОСТАЛЬНЫХ ОЖИДАЮЩИХ ИГРОКОВ */}
                  <div className="rounded-xl border border-red-900/60 bg-black/90 p-12 text-center shadow-[inset_0_0_50px_rgba(139,0,0,0.5)]">
                    <p className="text-2xl sm:text-3xl font-black text-red-700 tracking-wider font-serif animate-pulse drop-shadow-[0_2px_10px_rgba(255,0,0,0.7)]">
                      «{nightText}»
                    </p>
                    <span className="block mt-4 text-xs italic text-[#c5a059]/50">Город спит... Ждите своей очереди</span>
                  </div>
                </div>
              ) : (
                /* ДОСЬЕ ДЛЯ МЭРА */
                <div className="space-y-6">
                  <div className="rounded-xl border border-[#d4af37]/40 bg-[#1c100b] p-6 space-y-4">
                    <h3 className="text-xl font-bold text-[#d4af37]">📜 Ночное Досье Мэра</h3>
                    <div className="space-y-2">
                      {nightLog.map((log, idx) => (
                        <div key={idx} className="rounded-lg bg-[#0d0907] border border-[#c5a059]/20 p-3 text-sm text-[#e6d5bc]">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleEndNight}
                    className="w-full rounded-lg bg-gradient-to-r from-[#8b0000] to-[#5c0000] py-3 font-bold uppercase text-[#f3e5ab] border border-[#d4af37]"
                  >
                    Завершить ночь и Объявить Утро ☀️
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ФАЗА УТРА И ГОЛОСОВАНИЯ */}
          {phase === 'day' && (
            <div className="rounded-2xl border-2 border-[#d4af37] bg-[#120a07] p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[#c5a059]/30 pb-4">
                <div>
                  <h2 className="text-3xl font-black uppercase text-[#d4af37]">☀️ Утро и Голосование</h2>
                  <p className="text-xs text-[#c5a059]">Город обсуждает все ночные события</p>
                </div>
                <button onClick={handleEndDay} className="rounded-lg bg-[#d4af37] px-6 py-2.5 font-bold uppercase text-black">
                  Завершить Голосование 🌙
                </button>
              </div>

              {/* ПОДРОБНЫЙ ОТЧЕТ ОБ УТРЕННИХ СОБЫТИЯХ */}
              {detailedMorningReport.length > 0 && (
                <div className="rounded-xl border border-[#d4af37]/40 bg-[#1c100b] p-6 space-y-2 text-sm text-[#f3e5ab]">
                  <h4 className="font-bold text-[#d4af37] uppercase tracking-wider mb-2">📋 Полное расследование ночи:</h4>
                  {detailedMorningReport.map((line, idx) => (
                    <div key={idx} className={line.startsWith('---') ? 'font-bold text-[#d4af37] pt-2' : ''}>
                      {line}
                    </div>
                  ))}
                </div>
              )}

              {/* АНИМАЦИЯ И ПОКАЗ КАЗНИ ВО ВРЕМЯ ГОЛОСОВАНИЯ */}
              {executedPlayer && (
                <div className="rounded-xl border-2 border-red-600 bg-red-950/90 p-6 text-center animate-pulse shadow-[0_0_40px_rgba(255,0,0,0.8)]">
                  <span className="text-xs font-black uppercase tracking-widest text-red-300">ПРИГОВОР ИСПОЛНЕН!</span>
                  <h3 className="text-3xl font-black text-white mt-1">{executedPlayer.name}</h3>
                  <div className="mt-3 inline-block rounded-lg bg-black/80 px-6 py-2 border border-[#d4af37] text-lg font-bold text-[#d4af37]">
                    Настоящая роль: {executedPlayer.role?.name || 'Мирный житель'}
                  </div>
                </div>
              )}

              {/* КАРТОЧКИ ИГРОКОВ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {players.map((p) => {
                  return (
                    <div
                      key={p.id}
                      className={`relative overflow-hidden rounded-xl border p-4 flex justify-between items-center transition-all ${
                        !p.isAlive 
                          ? 'border-red-900 bg-black/90' 
                          : 'border-[#c5a059]/40 bg-[#180e0a]'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-lg text-white">
                          {p.name} {!p.isAlive && '💀'}
                        </p>
                        <p className="text-xs text-[#d4af37]">Роль: {p.role?.name}</p>
                      </div>

                      {p.isAlive ? (
                        <button
                          onClick={() => handleVote(p.id)}
                          className="px-4 py-2 text-xs font-bold rounded-lg bg-[#d4af37] text-black hover:bg-[#f3e5ab]"
                        >
                          ❌ Против ({votes[p.id] || 0})
                        </button>
                      ) : (
                        <div className="text-right">
                          <span className="text-xs font-bold uppercase text-red-500">
                            {p.diedBy === 'vote' ? 'Тебя казнили жители' : 'Умер ночью'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Play;