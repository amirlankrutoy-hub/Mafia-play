import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, set, onValue, update, push } from 'firebase/database';
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

function Play({ currentUser = 'Игрок' }) {
  const navigate = useNavigate();

  // Состояния комнаты
  const [mode, setMode] = useState(null); // 'player_join', 'lobby', 'card_select', 'game'
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Состояния самой игры
  const [phase, setPhase] = useState('night'); // 'night', 'day', 'ended'
  const [round, setRound] = useState(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // Досье и действия
  const [nightLog, setNightLog] = useState([]);
  const [detailedMorningReport, setDetailedMorningReport] = useState([]);
  const [nightActions, setNightActions] = useState({
    mafiaTarget: null,
    doctorTarget: null,
    sheriffTarget: null,
    priestTarget: null,
  });

  const [nightText, setNightText] = useState('');
  const [votes, setVotes] = useState({});
  const [executedPlayer, setExecutedPlayer] = useState(null);
  const [winnerInfo, setWinnerInfo] = useState(null);

  // Синхронизация комнаты в реальном времени через Firebase
  useEffect(() => {
    if (!roomCode) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.players) {
          const playerList = Object.keys(data.players).map(key => ({
            id: key,
            ...data.players[key]
          }));
          setPlayers(playerList);
        }
        if (data.status) setMode(data.status);
        if (data.phase) setPhase(data.phase);
        if (data.selectedRoles) setSelectedRoles(data.selectedRoles);
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Генерация атмосферной фразы для ночи
  useEffect(() => {
    if (phase === 'night') {
      const randomText = NIGHT_ATMOSPHERE_TEXTS[Math.floor(Math.random() * NIGHT_ATMOSPHERE_TEXTS.length)];
      setNightText(randomText);
    }
  }, [phase, round]);

  // Мэр создает онлайн-комнату
  const handleCreateRoom = async () => {
    console.log("Кнопка Мэра нажата!");
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const activeUserName = currentUser || 'Мэр';

    // Мгновенно переключаем экран
    setRoomCode(code);
    setMode('lobby');

    try {
      const roomRef = ref(db, `rooms/${code}`);
      const playersRef = ref(db, `rooms/${code}/players`);
      const newPlayerRef = push(playersRef);

      await set(roomRef, {
        createdAt: Date.now(),
        status: 'lobby',
        phase: 'night'
      });

      await set(newPlayerRef, {
        name: `${activeUserName} (Мэр)`,
        isMayor: true,
        isAlive: true,
        role: null
      });
    } catch (error) {
      console.error("Ошибка при работе с Firebase:", error);
      alert("Не удалось записать данные в Firebase. Проверьте вкладку Rules (Правила) в Firebase Console!");
    }
  };

  // Игрок присоединяется под своим именем
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    const code = inputCode.trim();

    if (!code) return alert('Введите код комнаты!');
    const activeUserName = currentUser || 'Игрок';

    setRoomCode(code);
    setMode('lobby');

    try {
      const newPlayerRef = push(ref(db, `rooms/${code}/players`));
      await set(newPlayerRef, {
        name: activeUserName,
        isMayor: false,
        isAlive: true,
        role: null
      });
    } catch (error) {
      console.error("Ошибка при подключении к комнате:", error);
      alert("Не удалось войти в комнату. Проверьте код и подключение.");
    }
  };

  // Выбор карт и старт игры
  const toggleRoleSelect = (roleId) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    } else {
      if (selectedRoles.length >= players.length) return alert(`Уже выбрано ${players.length} карт!`);
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const startGame = async () => {
    if (selectedRoles.length < players.length) return alert(`Выберите еще карты!`);

    const shuffledRoles = [...selectedRoles].sort(() => Math.random() - 0.5);
    const updatedPlayers = {};

    players.forEach((p, index) => {
      const roleObj = rolesData.find(r => r.id === shuffledRoles[index]) || rolesData[0];
      updatedPlayers[p.id] = {
        ...p,
        role: roleObj
      };
    });

    await update(ref(db, `rooms/${roomCode}`), {
      status: 'game',
      phase: 'night',
      players: updatedPlayers
    });
  };

  // Очередь ночных ходов
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
    } else if (roleName.includes('священник') || roleName.includes('поп')) {
      nightTurnQueue.push({ key: `priest_${p.id}`, player: p, name: p.name, roleTitle: p.role.name });
    }
  });

  const currentTurn = nightTurnQueue[currentTurnIndex];

  // Применение ночных способностей
  const handleNightAbility = (targetPlayer) => {
    if (!currentTurn) return;

    let actionMsg = '';

    if (currentTurn.key === 'mafia') {
      setNightActions(prev => ({ ...prev, mafiaTarget: targetPlayer.id }));
      actionMsg = `🔴 Мафия выбрала цель: ${targetPlayer.name}`;
    } else if (currentTurn.key.startsWith('doc')) {
      setNightActions(prev => ({ ...prev, doctorTarget: targetPlayer.id }));
      actionMsg = `🟢 Доктор (${currentTurn.name}) попытался вылечить: ${targetPlayer.name}`;
    } else if (currentTurn.key.startsWith('sheriff')) {
      setNightActions(prev => ({ ...prev, sheriffTarget: targetPlayer.id }));
      actionMsg = `🟡 Шериф (${currentTurn.name}) выстрелил/проверил: ${targetPlayer.name}`;
    } else if (currentTurn.key.startsWith('priest')) {
      setNightActions(prev => ({ ...prev, priestTarget: targetPlayer.id }));
      actionMsg = `🟣 Священник (${currentTurn.name}) избрал: ${targetPlayer.name}`;
    }

    setNightLog(prev => [...prev, actionMsg]);

    if (currentTurnIndex + 1 < nightTurnQueue.length) {
      setCurrentTurnIndex(prev => prev + 1);
    } else {
      setCurrentTurnIndex(-1);
    }
  };

  // Итоги ночи
  const handleEndNight = () => {
    let updatedPlayers = [...players];
    let deadIDs = new Set();
    let reportList = [];
    let summaryList = [];

    const getPName = (id) => players.find(p => p.id === id)?.name || 'Никого';

    if (nightActions.mafiaTarget) reportList.push(`🔴 Мафия пыталась выбить: ${getPName(nightActions.mafiaTarget)}`);
    if (nightActions.doctorTarget) reportList.push(`🟢 Доктор пришел к: ${getPName(nightActions.doctorTarget)}`);
    if (nightActions.sheriffTarget) reportList.push(`🟡 Шериф сделал выстрел в: ${getPName(nightActions.sheriffTarget)}`);
    if (nightActions.priestTarget) reportList.push(`🟣 Священник избрал: ${getPName(nightActions.priestTarget)}`);

    if (nightActions.mafiaTarget) {
      if (nightActions.mafiaTarget === nightActions.doctorTarget) {
        summaryList.push(`🛡️ ${getPName(nightActions.mafiaTarget)} был спасен Доктором!`);
      } else {
        deadIDs.add(nightActions.mafiaTarget);
      }
    }

    if (nightActions.sheriffTarget) deadIDs.add(nightActions.sheriffTarget);
    if (nightActions.priestTarget) deadIDs.add(nightActions.priestTarget);

    if (deadIDs.size > 0) {
      updatedPlayers = updatedPlayers.map(p => {
        if (deadIDs.has(p.id)) {
          summaryList.push(`💀 Убит этой ночью: ${p.name}`);
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

  const handleEndDay = () => {
    let maxVotes = 0;
    let eliminatedId = null;

    Object.entries(votes).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedId = id;
      }
    });

    if (eliminatedId) {
      const victim = players.find(p => p.id === eliminatedId);
      setExecutedPlayer(victim);

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
      }, 3500);
    } else {
      setVotes({});
      setRound(prev => prev + 1);
      setPhase('night');
      setCurrentTurnIndex(0);
      setNightActions({ mafiaTarget: null, doctorTarget: null, sheriffTarget: null, priestTarget: null });
      setNightLog([]);
    }
  };

  // Проверка условий победы
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
      {/* ПЛАШКА ПОБЕДЫ */}
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

      {/* 1. ГЛАВНОЕ МЕНЮ */}
      {!mode && (
        <div className="text-center space-y-8 py-12">
          <h1 className="text-4xl font-black uppercase tracking-widest text-[#d4af37]">
            Комната Игры в Мафию
          </h1>
          <p className="text-sm text-[#c5a059]">
            Вы вошли как: <strong className="text-white font-bold">{currentUser}</strong>
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button 
              onClick={handleCreateRoom} 
              className="rounded-2xl border-2 border-[#d4af37] bg-[#1c100b] p-8 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
            >
              <div className="text-5xl mb-3">🏛️</div>
              <h3 className="text-2xl font-bold text-[#d4af37]">Я — Мэр Города</h3>
            </button>

            <button 
              onClick={() => setMode('player_join')} 
              className="rounded-2xl border-2 border-[#c5a059]/40 bg-[#180e0a] p-8 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
            >
              <div className="text-5xl mb-3">🕵️</div>
              <h3 className="text-2xl font-bold text-[#c5a059]">Присоединиться к Мэру</h3>
            </button>
          </div>
        </div>
      )}

      {/* 2. ПОДКЛЮЧЕНИЕ ПО КОДУ */}
      {mode === 'player_join' && (
        <div className="max-w-md mx-auto rounded-2xl border-2 border-[#d4af37] bg-[#120a07] p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-[#d4af37] uppercase">Подключение к Мэру</h2>
          <p className="text-xs text-[#c5a059]">
            Игрок: <span className="text-white font-bold">{currentUser}</span>
          </p>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <input 
              type="text" 
              placeholder="Введите код комнаты Мэра..." 
              value={inputCode} 
              onChange={(e) => setInputCode(e.target.value)} 
              className="w-full rounded-lg border border-[#c5a059]/40 bg-[#0d0907] p-3 text-center text-white focus:border-[#d4af37] focus:outline-none" 
              required
            />
            <button 
              type="submit" 
              className="w-full rounded-lg bg-[#8b0000] py-3 font-bold uppercase text-[#f3e5ab] border border-[#d4af37]"
            >
              Войти в лобби
            </button>
            <button 
              type="button" 
              onClick={() => setMode(null)} 
              className="text-xs text-[#c5a059] underline block mx-auto cursor-pointer"
            >
              Назад
            </button>
          </form>
        </div>
      )}

      {/* 3. ОНЛАЙН ЛОББИ */}
      {mode === 'lobby' && (
        <div className="rounded-2xl border border-[#d4af37]/40 bg-[#120a07] p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-[#c5a059]/30 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#d4af37]">Лобби ({players.length}/10)</h2>
              <p className="text-xs text-[#c5a059]">Код комнаты: <strong className="text-white text-base">{roomCode}</strong></p>
            </div>

            <button 
              onClick={() => update(ref(db, `rooms/${roomCode}`), { status: 'card_select' })} 
              disabled={players.length < 3} 
              className="rounded-lg bg-[#d4af37] px-6 py-2.5 font-bold uppercase text-black disabled:opacity-40 cursor-pointer"
            >
              Далее: Выбор карт →
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#c5a059] uppercase tracking-wider">Подключённые игроки:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {players.map((p) => (
                <div key={p.id} className="rounded-lg border border-[#c5a059]/30 bg-[#180e0a] p-3 text-center">
                  <p className="font-bold text-white">{p.name} {p.isMayor ? '🎩' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. ВЫБОР КАРТ */}
      {mode === 'card_select' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#d4af37]">Выберите {players.length} карт ролей ({selectedRoles.length}/{players.length})</h2>
            <button onClick={startGame} disabled={selectedRoles.length !== players.length} className="rounded-lg bg-[#8b0000] border border-[#d4af37] px-6 py-2.5 font-bold uppercase text-[#f3e5ab] disabled:opacity-40 cursor-pointer">Начать 🚀</button>
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

      {/* 5. ИГРОВОЙ ПРОЦЕСС */}
      {mode === 'game' && phase !== 'ended' && (
        <div className="space-y-6">
          {phase === 'night' && (
            <div className="rounded-2xl border-2 border-[#d4af37] bg-[#120a07] p-8 space-y-6">
              <div className="text-center border-b border-[#c5a059]/30 pb-4">
                <h2 className="text-3xl font-black uppercase text-[#d4af37]">🌙 Ночь (Раунд {round})</h2>
              </div>

              {currentTurn ? (
                <div className="space-y-6">
                  <div className="rounded-xl border border-[#d4af37]/60 bg-[#1c100b] p-6 text-center space-y-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">Сейчас ходит:</span>
                    <h3 className="text-2xl font-black text-white">{currentTurn.name}</h3>
                    <div className="inline-block rounded-full bg-[#8b0000] px-4 py-1 text-xs font-bold text-[#f3e5ab] border border-[#d4af37]">
                      {currentTurn.roleTitle}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                      {players.filter(p => p.isAlive).map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleNightAbility(p)}
                          className="rounded-lg border border-[#c5a059]/40 bg-[#0d0907] p-3 text-sm font-bold text-white hover:border-[#d4af37] hover:bg-[#8b0000]/30 transition-all cursor-pointer"
                        >
                          Выбрать: {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-900/60 bg-black/90 p-12 text-center shadow-[inset_0_0_50px_rgba(139,0,0,0.5)]">
                    <p className="text-2xl sm:text-3xl font-black text-red-700 tracking-wider font-serif animate-pulse drop-shadow-[0_2px_10px_rgba(255,0,0,0.7)]">
                      «{nightText}»
                    </p>
                    <span className="block mt-4 text-xs italic text-[#c5a059]/50">Город спит... Ждите своей очереди</span>
                  </div>
                </div>
              ) : (
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
                    className="w-full rounded-lg bg-gradient-to-r from-[#8b0000] to-[#5c0000] py-3 font-bold uppercase text-[#f3e5ab] border border-[#d4af37] cursor-pointer"
                  >
                    Завершить ночь и Объявить Утро ☀️
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 'day' && (
            <div className="rounded-2xl border-2 border-[#d4af37] bg-[#120a07] p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[#c5a059]/30 pb-4">
                <div>
                  <h2 className="text-3xl font-black uppercase text-[#d4af37]">☀️ Утро и Голосование</h2>
                  <p className="text-xs text-[#c5a059]">Обсуждение ночных событий</p>
                </div>
                <button onClick={handleEndDay} className="rounded-lg bg-[#d4af37] px-6 py-2.5 font-bold uppercase text-black cursor-pointer">
                  Завершить Голосование 🌙
                </button>
              </div>

              {detailedMorningReport.length > 0 && (
                <div className="rounded-xl border border-[#d4af37]/40 bg-[#1c100b] p-6 space-y-2 text-sm text-[#f3e5ab]">
                  <h4 className="font-bold text-[#d4af37] uppercase tracking-wider mb-2">📋 Отчет ночи:</h4>
                  {detailedMorningReport.map((line, idx) => (
                    <div key={idx} className={line.startsWith('---') ? 'font-bold text-[#d4af37] pt-2' : ''}>
                      {line}
                    </div>
                  ))}
                </div>
              )}

              {executedPlayer && (
                <div className="rounded-xl border-2 border-red-600 bg-red-950/90 p-6 text-center animate-pulse shadow-[0_0_40px_rgba(255,0,0,0.8)]">
                  <span className="text-xs font-black uppercase tracking-widest text-red-300">ПРИГОВОР ИСПОЛНЕН!</span>
                  <h3 className="text-3xl font-black text-white mt-1">{executedPlayer.name}</h3>
                  <div className="mt-3 inline-block rounded-lg bg-black/80 px-6 py-2 border border-[#d4af37] text-lg font-bold text-[#d4af37]">
                    Игрок был казнён решением жителей
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {players.map((p) => (
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
                      {p.isAlive && <p className="text-xs text-[#d4af37]">Роль: {p.role?.name}</p>}
                    </div>

                    {p.isAlive ? (
                      <button
                        onClick={() => handleVote(p.id)}
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-[#d4af37] text-black hover:bg-[#f3e5ab] cursor-pointer"
                      >
                        ❌ Против ({votes[p.id] || 0})
                      </button>
                    ) : (
                      <span className="text-xs font-bold uppercase text-red-500">
                        {p.diedBy === 'vote' ? 'Казнён' : 'Выбыл'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Play;