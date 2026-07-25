import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import roles from '../data/roles';

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

const KICK_REASONS = [
  "Подглядывает ночью 🫣",
  "Играет нечестно / Мертвые говорят 🙊",
  "Нарушает правила игры 📜",
  "Ругается / Неадекватное поведение 🤬"
];

function Play({ currentUser }) {
  const navigate = useNavigate();

  // Название городка и История
  const [cityNameInput, setCityNameInput] = useState('');
  const [cityName, setCityName] = useState('Тёмный Ручей');
  const [introStep, setIntroStep] = useState('setup'); // 'setup', 'story', 'done'
  const [storyPage, setStoryPage] = useState(1);

  // Состояние вспышки молнии
  const [isLightning, setIsLightning] = useState(false);

  // Режимы и Лобби
  const [mode, setMode] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  // Экран Загрузки (3 секунды)
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Загрузка...');

  // Выбранные роли
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Фазы игры
  const [phase, setPhase] = useState('night');
  const [round, setRound] = useState(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // Ночные действия
  const [nightActions, setNightActions] = useState({
    doctorTarget: null,
    mafiaTarget: null,
    bossTarget: null,
    maniacTarget: null,
    sheriffTarget: null,
    priestTarget: null,
    priestActionType: null,
    ripperTarget: null,
    fanTarget: null,
    beautyTarget: null,
    snitchTarget: null,
    snitchActionType: null,
  });

  const [nightLog, setNightLog] = useState([]);
  const [detailedMorningReport, setDetailedMorningReport] = useState([]);
  const [nightText, setNightText] = useState('');

  // Специальные механики
  const [fanAffiliation, setFanAffiliation] = useState(null);
  const [snitchKnownRolesCount, setSnitchKnownRolesCount] = useState(0);
  const [silencedPlayerId, setSilencedPlayerId] = useState(null);
  const [checkedRoleInfo, setCheckedRoleInfo] = useState(null);

  // День и Результаты
  const [votes, setVotes] = useState({});
  const [executedPlayer, setExecutedPlayer] = useState(null);
  const [winnerInfo, setWinnerInfo] = useState(null);

  // Панель Мэра
  const [isMayorPanelOpen, setIsMayorPanelOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ x: 10, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, posX: 10, posY: 80 });

  const [kickTarget, setKickTarget] = useState(null);
  const [selectedReason, setSelectedReason] = useState(KICK_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  // ⚡ 👻 УЖАСАЮЩАЯ МУЗЫКА, ЗВУК ГРОМА И МИГАНИЕ МОЛНИИ (Web Audio API)
  useEffect(() => {
    let audioCtx = null;
    let thunderInterval = null;

    if (introStep === 'story') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          audioCtx = new AudioCtx();

          const subBass = audioCtx.createOscillator();
          const screechOsc = audioCtx.createOscillator();
          const ambientGain = audioCtx.createGain();

          subBass.type = 'sawtooth';
          subBass.frequency.setValueAtTime(35, audioCtx.currentTime);

          screechOsc.type = 'triangle';
          screechOsc.frequency.setValueAtTime(110, audioCtx.currentTime);
          screechOsc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 5);

          const filter = audioCtx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(150, audioCtx.currentTime);

          ambientGain.gain.setValueAtTime(0.35, audioCtx.currentTime);

          subBass.connect(filter);
          screechOsc.connect(filter);
          filter.connect(ambientGain);
          ambientGain.connect(audioCtx.destination);

          subBass.start();
          screechOsc.start();

          const triggerLightningAndThunder = () => {
            if (!audioCtx) return;

            setIsLightning(true);
            setTimeout(() => setIsLightning(false), 80);
            setTimeout(() => setIsLightning(true), 160);
            setTimeout(() => setIsLightning(false), 240);
            setTimeout(() => setIsLightning(true), 320);
            setTimeout(() => setIsLightning(false), 500);

            const bufferSize = audioCtx.sampleRate * 4.0;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
              data[i] = Math.random() * 2 - 1;
            }

            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;

            const thunderFilter = audioCtx.createBiquadFilter();
            thunderFilter.type = 'lowpass';
            thunderFilter.frequency.setValueAtTime(1200, audioCtx.currentTime);
            thunderFilter.frequency.exponentialRampToValueAtTime(25, audioCtx.currentTime + 3.8);

            const thunderGain = audioCtx.createGain();
            thunderGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
            thunderGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.9);

            noise.connect(thunderFilter);
            thunderFilter.connect(thunderGain);
            thunderGain.connect(audioCtx.destination);

            noise.start();
          };

          triggerLightningAndThunder();
          thunderInterval = setInterval(() => {
            triggerLightningAndThunder();
          }, 3500);
        }
      } catch (e) {
        console.log('Audio Context error', e);
      }
    }

    return () => {
      if (thunderInterval) clearInterval(thunderInterval);
      if (audioCtx) audioCtx.close();
    };
  }, [introStep]);

  const triggerLoading = (text, callback) => {
    setLoadingText(text);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (callback) callback();
    }, 3000);
  };

  useEffect(() => {
    if (phase === 'night') {
      const randomText = NIGHT_ATMOSPHERE_TEXTS[Math.floor(Math.random() * NIGHT_ATMOSPHERE_TEXTS.length)];
      setNightText(randomText);
    }
  }, [phase, round]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.posX = panelPos.x;
    dragRef.current.posY = panelPos.y;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPanelPos({
        x: dragRef.current.posX + (e.clientX - dragRef.current.startX),
        y: dragRef.current.posY + (e.clientY - dragRef.current.startY),
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!currentUser) {
    return (
      <div className="text-center py-20 text-[#d4af37] px-4">
        <h2 className="text-2xl font-bold uppercase">Доступ ограничен</h2>
      </div>
    );
  }

  const handleStartIntro = (e) => {
    e.preventDefault();
    if (cityNameInput.trim()) {
      setCityName(cityNameInput.trim());
    }
    setIntroStep('story');
    setStoryPage(1);
  };

  const handleNextPage = () => {
    if (storyPage < 5) {
      setStoryPage(prev => prev + 1);
    } else {
      finishIntro();
    }
  };

  const finishIntro = () => {
    triggerLoading(`Вход в странный городок "${cityName}"...`, () => {
      setIntroStep('done');
    });
  };

  const handleCreateRoom = () => {
    triggerLoading('Создание городской ратуши...', () => {
      setRoomCode(Math.floor(1000 + Math.random() * 9000).toString());
      setPlayers([]);
      setMode('lobby');
    });
  };

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    if (players.length >= 20) return alert('Максимум 20 игроков!');
    setPlayers([...players, { id: Date.now(), name: newPlayerName.trim(), isAlive: true, role: null }]);
    setNewPlayerName('');
  };

  const handleRemovePlayerFromLobby = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleAddRole = (roleId) => {
    if (selectedRoles.length >= players.length) return alert(`Выбрано максимум карт (${players.length})`);
    setSelectedRoles(prev => [...prev, roleId]);
  };

  const handleRemoveRole = (roleId, e) => {
    e.stopPropagation();
    const index = selectedRoles.indexOf(roleId);
    if (index > -1) {
      const updated = [...selectedRoles];
      updated.splice(index, 1);
      setSelectedRoles(updated);
    }
  };

  const goToCardSelect = () => {
    triggerLoading('Подготовка к выбору ролей...', () => {
      setMode('card_select');
    });
  };

  const startGame = () => {
    if (selectedRoles.length < players.length) return alert(`Выберите ещё ${players.length - selectedRoles.length} карт!`);

    triggerLoading(`Раздача карт и погружение города ${cityName} во тьму...`, () => {
      const shuffledRoleIds = [...selectedRoles].sort(() => Math.random() - 0.5);
      const assigned = players.map((p, idx) => ({
        ...p,
        role: roles.find(r => r.id === shuffledRoleIds[idx]) || roles[0],
        isAlive: true,
        diedBy: null
      }));

      setPlayers(assigned);
      setMode('game');
      setPhase('night');
      setRound(1);
      setCurrentTurnIndex(0);
      setSnitchKnownRolesCount(0);
      setFanAffiliation(null);
      setSilencedPlayerId(null);
      resetNightActions();
    });
  };

  const resetNightActions = () => {
    setNightActions({
      doctorTarget: null,
      mafiaTarget: null,
      bossTarget: null,
      maniacTarget: null,
      sheriffTarget: null,
      priestTarget: null,
      priestActionType: null,
      ripperTarget: null,
      fanTarget: null,
      beautyTarget: null,
      snitchTarget: null,
      snitchActionType: null,
    });
    setNightLog([]);
  };

  const buildNightQueue = () => {
    if (mode !== 'game') return [];
    
    const queue = [];
    const alive = players.filter(p => p.isAlive);

    const findAliveRole = (keys) => {
      return alive.find(p => {
        const id = p.role?.id?.toLowerCase() || '';
        const name = p.role?.name?.toLowerCase() || '';
        return keys.some(k => id.includes(k) || name.includes(k));
      });
    };

    const doctor = findAliveRole(['doctor', 'доктор', 'врач']);
    if (doctor) queue.push({ key: 'doctor', title: '🟢 Доктор просыпается...', player: doctor });

    const hasMafia = alive.some(p => p.role?.category === 'mafia');
    if (hasMafia) queue.push({ key: 'mafia', title: '🔴 Мафия просыпается...' });

    const boss = findAliveRole(['boss', 'босс', 'дон']);
    if (boss) queue.push({ key: 'boss', title: '🎩 Босс Мафии просыпается...', player: boss });

    const maniac = findAliveRole(['maniac', 'маньяк']);
    if (maniac) queue.push({ key: 'maniac', title: '🔪 Маньяк просыпается...', player: maniac });

    const sheriff = findAliveRole(['sherif', 'sheriff', 'шериф', 'детектив']);
    if (sheriff) queue.push({ key: 'sheriff', title: '🟡 Шериф просыпается...', player: sheriff });

    const priest = findAliveRole(['priest', 'sveshennik', 'священник']);
    if (priest) queue.push({ key: 'priest', title: '🟣 Священник просыпается...', player: priest });

    const ripper = findAliveRole(['ripper', 'потрошитель']);
    if (ripper) queue.push({ key: 'ripper', title: '⚔️ Потрошитель просыпается...', player: ripper });

    const fan = findAliveRole(['fan', 'поклонница']);
    if (fan && round === 1) queue.push({ key: 'fan', title: '💖 Поклонница просыпается...', player: fan });

    const beauty = findAliveRole(['beauty', 'красотка', 'любовница']);
    if (beauty) queue.push({ key: 'beauty', title: '💄 Красотка просыпается...', player: beauty });

    const snitch = findAliveRole(['snitch', 'стукач']);
    if (snitch) queue.push({ key: 'snitch', title: '📣 Стукач просыпается...', player: snitch });

    return queue;
  };

  const nightQueue = buildNightQueue();
  const currentTurn = nightQueue[currentTurnIndex];

  const nextTurn = () => {
    if (currentTurnIndex + 1 < nightQueue.length) {
      setCurrentTurnIndex(prev => prev + 1);
    } else {
      setCurrentTurnIndex(-1);
    }
  };

  const handleNightAbility = (targetPlayer, subAction = null) => {
    if (!currentTurn) return;

    let logMsg = '';
    const key = currentTurn.key;

    if (key === 'doctor') {
      setNightActions(prev => ({ ...prev, doctorTarget: targetPlayer.id }));
      logMsg = `🟢 Доктор сделал свой выбор.`;
    } else if (key === 'mafia') {
      setNightActions(prev => ({ ...prev, mafiaTarget: targetPlayer.id }));
      logMsg = `🔴 Мафия выбрала цель.`;
    } else if (key === 'boss') {
      setNightActions(prev => ({ ...prev, bossTarget: targetPlayer.id }));
      logMsg = `🎩 Босс Мафии заблокировал голос игрока.`;
    } else if (key === 'maniac') {
      setNightActions(prev => ({ ...prev, maniacTarget: targetPlayer.id }));
      logMsg = `🔪 Маньяк сделал свой выбор.`;
    } else if (key === 'sheriff') {
      setNightActions(prev => ({ ...prev, sheriffTarget: targetPlayer.id }));
      logMsg = `🟡 Шериф сделал свой выстрел.`;
    } else if (key === 'priest') {
      if (subAction === 'check') {
        setNightActions(prev => ({ ...prev, priestTarget: targetPlayer.id, priestActionType: 'check' }));
        setCheckedRoleInfo({ name: targetPlayer.name, role: targetPlayer.role?.name || 'Мирный житель' });
        logMsg = `🟣 Священник проверил игрока ${targetPlayer.name}.`;
      } else {
        setNightActions(prev => ({ ...prev, priestTarget: targetPlayer.id, priestActionType: 'kill' }));
        logMsg = `🟣 Священник решил вынести приговор.`;
      }
    } else if (key === 'ripper') {
      setNightActions(prev => ({ ...prev, ripperTarget: targetPlayer.id }));
      logMsg = `⚔️ Потрошитель нанес удар.`;
    } else if (key === 'fan') {
      setNightActions(prev => ({ ...prev, fanTarget: targetPlayer.id }));
      setFanAffiliation(targetPlayer.role?.category || 'civilians');
      logMsg = `💖 Поклонница присоединилась к выбору.`;
    } else if (key === 'beauty') {
      setNightActions(prev => ({ ...prev, beautyTarget: targetPlayer.id }));
      logMsg = `💄 Красотка выбрала укрытие.`;
    } else if (key === 'snitch') {
      if (subAction === 'check') {
        setNightActions(prev => ({ ...prev, snitchTarget: targetPlayer.id, snitchActionType: 'check' }));
        setSnitchKnownRolesCount(prev => prev + 1);
        setCheckedRoleInfo({ name: targetPlayer.name, role: targetPlayer.role?.name || 'Мирный житель' });
        logMsg = `📣 Стукач узнал роль ${targetPlayer.name}.`;
      } else {
        setNightActions(prev => ({ ...prev, snitchActionType: 'tell' }));
        logMsg = `📣 Стукач слил информацию одной из сторон.`;
      }
    }

    setNightLog(prev => [...prev, logMsg]);
    nextTurn();
  };

  const handleEndNight = () => {
    triggerLoading('Город просыпается... Подсчет ночных событий', () => {
      let updatedPlayers = [...players];
      let attackTargets = new Set();
      let summaryList = [];

      const docTarget = nightActions.doctorTarget;
      const beautyUser = players.find(p => p.role?.id?.includes('beauty') && p.isAlive);
      const beautyTarget = nightActions.beautyTarget;

      if (nightActions.mafiaTarget) attackTargets.add(nightActions.mafiaTarget);
      if (nightActions.maniacTarget) attackTargets.add(nightActions.maniacTarget);
      if (nightActions.sheriffTarget) attackTargets.add(nightActions.sheriffTarget);
      if (nightActions.priestActionType === 'kill' && nightActions.priestTarget) attackTargets.add(nightActions.priestTarget);

      if (nightActions.ripperTarget) {
        const target = players.find(p => p.id === nightActions.ripperTarget);
        if (target && target.role?.id !== 'civilian') {
          attackTargets.add(nightActions.ripperTarget);
        } else {
          summaryList.push(`⚔️ Потрошитель напал на Обывателя, но тот оказался невосприимчив!`);
        }
      }

      if (beautyUser && attackTargets.has(beautyUser.id) && beautyTarget) {
        attackTargets.delete(beautyUser.id);
        attackTargets.add(beautyTarget);
        summaryList.push(`💄 На Красотку совершили нападение, но вместо нее под удар попал её покровитель!`);
      }

      let deadIDs = new Set();
      attackTargets.forEach(targetId => {
        if (targetId === docTarget) {
          summaryList.push(`🛡️ Доктор спас игрока ${players.find(p => p.id === targetId)?.name}! Он выжил после всех атак.`);
        } else {
          deadIDs.add(targetId);
        }
      });

      if (nightActions.bossTarget) {
        setSilencedPlayerId(nightActions.bossTarget);
        summaryList.push(`🤫 ${players.find(p => p.id === nightActions.bossTarget)?.name} был лишен права голоса Боссом Мафии!`);
      } else {
        setSilencedPlayerId(null);
      }

      if (deadIDs.size > 0) {
        updatedPlayers = updatedPlayers.map(p => {
          if (deadIDs.has(p.id)) {
            summaryList.push(`💀 Погиб этой ночью: ${p.name}`);
            return { ...p, isAlive: false, diedBy: 'Погиб ночью' };
          }
          return p;
        });
      } else if (summaryList.length === 0) {
        summaryList.push('☀️ Этой ночью никто не погиб!');
      }

      setPlayers(updatedPlayers);
      setDetailedMorningReport(['--- ИТОГИ НОЧИ ---', ...summaryList]);

      if (!checkWinConditions(updatedPlayers)) {
        setPhase('day');
      }
    });
  };

  const handleVote = (targetId) => {
    setVotes(prev => ({ ...prev, [targetId]: (prev[targetId] || 0) + 1 }));
  };

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

      setTimeout(() => {
        const updated = players.map(p => p.id === eliminatedId ? { ...p, isAlive: false, diedBy: 'Казнён днем' } : p);
        setPlayers(updated);
        setVotes({});
        setExecutedPlayer(null);

        if (!checkWinConditions(updated)) {
          triggerLoading('Город засыпает... Наступает ночь', () => {
            setRound(prev => prev + 1);
            setPhase('night');
            setCurrentTurnIndex(0);
            resetNightActions();
          });
        }
      }, 3000);
    } else {
      triggerLoading('Город засыпает... Наступает ночь', () => {
        setVotes({});
        setRound(prev => prev + 1);
        setPhase('night');
        setCurrentTurnIndex(0);
        resetNightActions();
      });
    }
  };

  const handleMayorKickPlayer = () => {
    if (!kickTarget) return;
    const reasonText = selectedReason === 'Своя причина' ? customReason : selectedReason;
    const updated = players.map(p => p.id === kickTarget.id ? { ...p, isAlive: false, diedBy: `Исключен (${reasonText})` } : p);
    setPlayers(updated);
    setKickTarget(null);
    checkWinConditions(updated);
  };

  const handleRestorePlayer = (id) => {
    setPlayers(players.map(p => p.id === id ? { ...p, isAlive: true, diedBy: null } : p));
  };

  const handleMayorInstantWin = (team) => {
    const fanSuffix = fanAffiliation === team ? ' и Поклонница' : '';
    setWinnerInfo({ team: `${team}${fanSuffix} (Решением Мэра)`, color: 'bg-yellow-950 border-yellow-500 text-yellow-200' });
    setPhase('ended');
    setIsMayorPanelOpen(false);
  };

  const checkWinConditions = (currentPlayers) => {
    const alive = currentPlayers.filter(p => p.isAlive);
    const aliveMafia = alive.filter(p => p.role?.category === 'mafia');
    const aliveCivs = alive.filter(p => p.role?.category === 'civilians');
    const aliveManiac = alive.filter(p => p.role?.id === 'maniac');

    const fanAdd = (cat) => (fanAffiliation === cat ? ' и Поклонница' : '');

    if (alive.length === 1 && aliveManiac.length === 1) {
      setWinnerInfo({ team: `Маньяк${fanAdd('neutrals')}`, color: 'bg-purple-950 border-purple-500 text-purple-200' });
      setPhase('ended');
      return true;
    }

    if (aliveMafia.length >= aliveCivs.length && aliveMafia.length > 0) {
      setWinnerInfo({ team: `Мафия${fanAdd('mafia')}`, color: 'bg-red-950 border-red-600 text-red-200' });
      setPhase('ended');
      return true;
    }

    if (aliveMafia.length === 0 && aliveCivs.length > 0) {
      setWinnerInfo({ team: `Мирные Жители${fanAdd('civilians')}`, color: 'bg-emerald-950 border-emerald-500 text-emerald-200' });
      setPhase('ended');
      return true;
    }

    return false;
  };

  const handlePlayAgain = () => {
    setPlayers(players.map(p => ({ ...p, isAlive: true, role: null, diedBy: null })));
    setSelectedRoles([]);
    setWinnerInfo(null);
    setExecutedPlayer(null);
    setIsMayorPanelOpen(false);
    setPhase('night');
    setMode('lobby');
  };

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-6 space-y-6 relative min-h-[80vh] overflow-x-hidden">
      {/* ⏳ ЭКРАН ЗАГРУЗКИ (3 секунды) */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
          <div className="h-16 w-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl sm:text-2xl font-black text-[#d4af37] text-center tracking-widest uppercase animate-pulse">
            {loadingText}
          </h2>
          <p className="text-xs text-[#c5a059] mt-2">Пожалуйста, подождите 3 секунды...</p>
        </div>
      )}

      {/* 📖 ИНТРО: Создание городка */}
      {introStep === 'setup' && (
        <div className="rounded-2xl border-2 border-[#d4af37] bg-[#120a07] p-5 sm:p-8 text-center space-y-6 max-w-xl mx-auto shadow-2xl">
          <div className="text-5xl animate-bounce"><img className="w-[50px] h-[50px] mx-auto" src="/favicon.svg" alt="" /></div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#d4af37] uppercase tracking-wider">
            Добро пожаловать в наш странный городок!
          </h1>
          <p className="text-xs sm:text-sm text-[#c5a059]">
            Придумайте название для городка, чтобы погрузиться в его таинственную историю...
          </p>

          <form onSubmit={handleStartIntro} className="space-y-4">
            <input
              type="text"
              placeholder="Название городка..."
              value={cityNameInput}
              onChange={(e) => setCityNameInput(e.target.value)}
              className="w-full rounded-xl border border-[#d4af37]/60 bg-[#0d0907] px-4 py-3 text-center text-base sm:text-lg text-white font-bold focus:border-red-600 outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-[#8b0000] to-[#500000] border border-[#d4af37] py-3.5 font-black uppercase text-[#f3e5ab] hover:scale-105 transition-all shadow-lg"
            >
              Начать историю....
            </button>
          </form>
        </div>
      )}

      {/* 👻 5 СТРАНИЦ ИСТОРИИ */}
      {introStep === 'story' && (
        <div
          className={`fixed inset-0 z-40 flex flex-col items-center justify-between p-4 sm:p-6 transition-colors duration-75 ${
            isLightning ? 'bg-white text-black' : 'bg-black text-white'
          }`}
        >
          <div className="absolute top-3 left-3 right-3 flex items-center justify-center text-[10px] sm:text-xs text-red-500 animate-pulse bg-black/80 px-3 py-1 rounded-full border border-red-800 text-center">
            <span>⚡ Саундтрек, молния и гром активны</span>
          </div>

          <div className="max-w-2xl w-full my-auto text-center space-y-6 sm:space-y-8">
            {storyPage === 1 && (
              <div className="space-y-6 animate-pulse">
                <div className="p-4 sm:p-6 rounded-2xl bg-red-950/40 border border-red-600/50">
                  <h2 className={`text-2xl sm:text-4xl font-black uppercase font-serif leading-tight ${isLightning ? 'text-black' : 'text-red-600'}`}>
                    «Наш городок <span className="underline">{cityName}</span> был вполне обычным городом...»
                  </h2>
                </div>
              </div>
            )}

            {storyPage === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/80 border border-zinc-700">
                  <h2 className="text-xl sm:text-3xl font-bold font-serif leading-relaxed mb-4">
                    «...Но в одну ночь мы услышали чей-то криК ......»
                  </h2>
                  <p className="text-3xl sm:text-5xl font-black text-red-600 tracking-widest animate-bounce uppercase">
                    ПОМОГИТЕ!!!!!!!
                  </p>
                </div>
              </div>
            )}

            {storyPage === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/80 border border-zinc-700">
                  <h2 className="text-xl sm:text-3xl font-bold font-serif leading-relaxed">
                    «Мы быстро побежали к месту крика......»
                  </h2>
                </div>
              </div>
            )}

            {storyPage === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-4 sm:p-6 rounded-2xl bg-red-950/50 border border-red-800">
                  <h2 className="text-xl sm:text-3xl font-bold text-red-500 font-serif leading-relaxed">
                    «Прийдя на место крика мы увидели мертвое тело и чей-то зловещий смех .....»
                  </h2>
                  <p className="text-2xl sm:text-3xl font-black text-red-700 italic mt-3">«ХА-ХА-ХА-ХА...»</p>
                </div>
              </div>
            )}

            {storyPage === 5 && (
              <div className="space-y-6 animate-bounce">
                <div className="p-4 sm:p-6 rounded-2xl bg-[#120f0f] border-2 border-[#670202]">
                  <h2 className="text-2xl sm:text-4xl font-black text-[#710704] font-serif uppercase tracking-widest">
                    Да что тут вообще происходит!!??!
                  </h2>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center justify-center space-y-2 pt-2">
              <div className="relative">
                <img
                  src="/Otez.jpg"
                  alt="Крёстный Отец"
                  className="w-24 h-24 sm:w-36 sm:h-36 object-cover rounded-full border-4 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.6)]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300";
                  }}
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#8b0000] text-[#f3e5ab] text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-[#d4af37]">
                  Крёстный Отец
                </span>
              </div>
              <p className={`text-xs font-serif italic ${isLightning ? 'text-black font-bold' : 'text-[#c5a059]'}`}>Говорит Крёстный Отец города {cityName}</p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
              <span className={`text-xs font-bold ${isLightning ? 'text-black' : 'text-[#c5a059]'}`}>Страница {storyPage} из 5</span>
              <button
                onClick={handleNextPage}
                className="w-full sm:w-auto rounded-xl border-2 border-[#d4af37] bg-[#8b0000] px-8 py-3 text-base sm:text-lg font-black uppercase text-[#f3e5ab] hover:scale-105 transition-all shadow-xl"
              >
                {storyPage === 5 ? 'Войти в игру 🚪' : 'Далее ➔'}
              </button>
            </div>
          </div>
        </div>
      )}

      {checkedRoleInfo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c100b] border-2 border-[#d4af37] p-5 sm:p-6 rounded-2xl max-w-sm w-full text-center space-y-4">
            <h3 className="text-xl font-bold text-[#d4af37]">Результат проверки</h3>
            <p className="text-white text-base sm:text-lg">Игрок: <strong>{checkedRoleInfo.name}</strong></p>
            <p className="text-xl font-black text-emerald-400">Роль: {checkedRoleInfo.role}</p>
            <button onClick={() => setCheckedRoleInfo(null)} className="w-full bg-[#d4af37] text-black py-2.5 rounded-lg font-bold">
              Понятно
            </button>
          </div>
        </div>
      )}

      {winnerInfo && (
        <div className={`rounded-2xl border-2 p-6 sm:p-8 text-center shadow-2xl animate-bounce ${winnerInfo.color}`}>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-widest">Победили: {winnerInfo.team}!</h2>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button onClick={handlePlayAgain} className="rounded-lg bg-[#d4af37] px-6 py-3 font-bold uppercase text-black hover:bg-[#f3e5ab]">
              Играть снова 🔄
            </button>
            <button onClick={() => navigate('/')} className="rounded-lg border border-[#d4af37] bg-[#0d0907] px-6 py-3 font-bold uppercase text-[#d4af37]">
              В главное меню
            </button>
          </div>
        </div>
      )}

      {/* ОСНОВНОЕ МЕНЮ И ЛОББИ ПОСЛЕ ИСТОРИИ */}
      {introStep === 'done' && !mode && (
        <div className="text-center space-y-6 py-8 sm:py-12 px-2">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-widest text-[#d4af37]">
            Игровой Зал: {cityName}
          </h1>
          <p className="text-xs sm:text-sm text-[#c5a059]">Мэр города: <strong className="text-white font-bold">{currentUser}</strong></p>
          <button onClick={handleCreateRoom} className="max-w-md w-full mx-auto rounded-2xl border-2 border-[#d4af37] bg-[#1c100b] p-6 sm:p-8 hover:scale-105 transition-all block">
            <div className="text-4xl sm:text-5xl mb-3"><img className="w-[50px] h-[50px] mx-auto" src="/favicon.svg" alt="" /></div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#d4af37]">Создать город как Мэр</h3>
          </button>
        </div>
      )}

      {mode === 'lobby' && (
        <div className="rounded-2xl border border-[#d4af37]/40 bg-[#120a07] p-4 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#c5a059]/30 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#d4af37]">Участники ({players.length}/20)</h2>
              <p className="text-xs text-[#c5a059]">Мэр: {currentUser} | Код: {roomCode}</p>
            </div>
            <button onClick={goToCardSelect} disabled={players.length < 3} className="w-full sm:w-auto rounded-lg bg-[#d4af37] px-6 py-2.5 font-bold uppercase text-black disabled:opacity-40">
              К выбору карт →
            </button>
          </div>

          <form onSubmit={handleAddPlayer} className="flex flex-col sm:flex-row gap-3">
            <input type="text" placeholder="Имя игрока..." value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} className="flex-1 rounded-lg border border-[#c5a059]/40 bg-[#0d0907] px-4 py-3 text-white text-sm" />
            <button type="submit" className="rounded-lg border border-[#d4af37] bg-[#8b0000] px-5 py-3 font-bold text-[#f3e5ab]">+ Добавить</button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
            {players.map((p) => (
              <div key={p.id} className="rounded-lg border border-[#c5a059]/30 bg-[#180e0a] p-3 flex justify-between items-center">
                <p className="font-bold text-white text-sm">{p.name}</p>
                <button onClick={() => handleRemovePlayerFromLobby(p.id)} className="rounded px-2.5 py-1.5 text-xs font-bold text-red-400 bg-red-950/60 border border-red-800">
                  Удалить 🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'card_select' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#d4af37]">Выбрано карт: {selectedRoles.length} из {players.length}</h2>
            <button onClick={startGame} disabled={selectedRoles.length !== players.length} className="w-full sm:w-auto rounded-lg bg-[#8b0000] border border-[#d4af37] px-6 py-2.5 font-bold uppercase text-[#f3e5ab] disabled:opacity-40">
              Начать 🚀
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {roles.map((role) => {
              const count = selectedRoles.filter(id => id === role.id).length;
              return (
                <div key={role.id} onClick={() => handleAddRole(role.id)} className={`relative cursor-pointer rounded-xl border p-2.5 sm:p-3 text-center transition-all ${count > 0 ? 'border-[#d4af37] bg-[#8b0000]/40' : 'border-[#c5a059]/30 bg-[#120a07]'}`}>
                  {count > 0 && <div className="absolute top-2 right-2 bg-[#d4af37] text-black font-black text-xs h-6 w-6 rounded-full flex items-center justify-center">x{count}</div>}
                  <img src={role.image} alt={role.name} className="h-24 sm:h-28 w-full object-cover rounded-md mb-2" />
                  <p className="font-bold text-xs sm:text-sm text-white">{role.name}</p>
                  {count > 0 && <button onClick={(e) => handleRemoveRole(role.id, e)} className="mt-1 text-[10px] text-red-400 underline block mx-auto">Убрать (-1)</button>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'game' && phase !== 'ended' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setIsMayorPanelOpen(!isMayorPanelOpen)} className="w-full sm:w-auto rounded-xl border-2 border-[#d4af37] bg-gradient-to-r from-[#8b0000] to-[#1c100b] px-6 py-3 font-black uppercase text-[#f3e5ab] text-sm">
              🎩 Полномочия Мэра
            </button>
          </div>

          {phase === 'night' && (
            <div className="rounded-2xl border-2 border-[#d4af37] bg-[#120a07] p-4 sm:p-8 space-y-6">
              <h2 className="text-xl sm:text-3xl font-black uppercase text-[#d4af37] text-center">🌙 Ночь в {cityName} ({round})</h2>

              <div className="flex gap-2 overflow-x-auto pb-2 border-b border-[#c5a059]/30 scrollbar-thin">
                {nightQueue.map((step, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      idx === currentTurnIndex
                        ? 'bg-[#d4af37] text-black scale-105 shadow-md'
                        : idx < currentTurnIndex
                        ? 'bg-zinc-800 text-zinc-500 line-through'
                        : 'bg-[#1c100b] text-[#c5a059] border border-[#c5a059]/20'
                    }`}
                  >
                    {step.title}
                  </div>
                ))}
              </div>

              {currentTurn ? (
                <div className="space-y-6">
                  <div className="rounded-xl border border-[#d4af37]/60 bg-[#1c100b] p-4 sm:p-6 text-center space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] sm:text-xs font-bold uppercase text-[#d4af37]">
                        Ход {currentTurnIndex + 1} из {nightQueue.length}
                      </span>
                      <button onClick={nextTurn} className="text-xs text-[#c5a059] hover:text-white underline">
                        Пропустить ➔
                      </button>
                    </div>

                    <h3 className="text-xl sm:text-3xl font-black text-white">{currentTurn.title}</h3>

                    {currentTurn.key === 'priest' && (
                      <div className="space-y-3">
                        <p className="text-xs text-[#c5a059]">Выберите действие:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {players.filter(p => p.isAlive).map(p => (
                            <div key={p.id} className="border border-[#c5a059]/40 bg-[#0d0907] p-2.5 rounded-lg flex flex-col gap-2">
                              <span className="text-sm font-bold text-white">{p.name}</span>
                              <div className="flex gap-2">
                                <button onClick={() => handleNightAbility(p, 'check')} className="flex-1 bg-purple-900/80 text-purple-200 text-xs py-2 rounded font-bold">
                                  Проверить 🔍
                                </button>
                                <button onClick={() => handleNightAbility(p, 'kill')} className="flex-1 bg-red-900/80 text-red-200 text-xs py-2 rounded font-bold">
                                  Убить ⚔️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentTurn.key === 'snitch' && (
                      <div className="space-y-4">
                        <p className="text-xs text-[#c5a059]">Стукач делает свой выбор:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {players.filter(p => p.isAlive).map(p => (
                            <button key={p.id} onClick={() => handleNightAbility(p, 'check')} className="bg-[#0d0907] border border-[#c5a059]/40 p-3 rounded text-xs font-bold text-white hover:border-[#d4af37] text-left">
                              Узнать роль: {p.name} 🔍
                            </button>
                          ))}
                        </div>

                        <button
                          disabled={snitchKnownRolesCount < 2}
                          onClick={() => handleNightAbility(null, 'tell')}
                          className="w-full bg-yellow-600 border border-[#d4af37] text-black font-bold py-3 rounded text-xs disabled:opacity-30"
                        >
                          Рассказать 📣 ({snitchKnownRolesCount}/2)
                        </button>
                      </div>
                    )}

                    {!['priest', 'snitch'].includes(currentTurn.key) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
                        {players.filter(p => p.isAlive).map(p => (
                          <button key={p.id} onClick={() => handleNightAbility(p)} className="rounded-lg border border-[#c5a059]/40 bg-[#0d0907] p-3 text-sm font-bold text-white hover:border-[#d4af37]">
                            Выбрать: {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-red-900/60 bg-black/90 p-4 sm:p-6 text-center">
                    <p className="text-xl sm:text-2xl font-black text-red-700 animate-pulse font-serif">«{nightText}»</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-xl border border-[#d4af37]/40 bg-[#1c100b] p-4 sm:p-6 space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-[#d4af37]">📜 Ночь завершилась</h3>
                    {nightLog.map((log, idx) => (
                      <div key={idx} className="bg-[#0d0907] p-2.5 text-xs sm:text-sm text-[#e6d5bc] rounded border border-[#c5a059]/20">{log}</div>
                    ))}
                  </div>
                  <button onClick={handleEndNight} className="w-full bg-[#8b0000] border border-[#d4af37] py-3.5 font-bold uppercase text-[#f3e5ab] text-sm">
                    Разбудить город ☀️
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 'day' && (
            <div className="rounded-2xl border-2 border-[#d4af37] bg-[#120a07] p-4 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#c5a059]/30 pb-4">
                <h2 className="text-xl sm:text-3xl font-black uppercase text-[#d4af37]">☀️ Дневное Обсуждение</h2>
                <button onClick={handleEndDay} className="w-full sm:w-auto rounded-lg bg-[#d4af37] px-6 py-3 font-bold uppercase text-black text-sm">
                  Итоги голосования 🌙
                </button>
              </div>

              {detailedMorningReport.length > 0 && (
                <div className="rounded-xl border border-[#d4af37]/40 bg-[#1c100b] p-4 text-xs sm:text-sm text-[#f3e5ab] space-y-1">
                  {detailedMorningReport.map((line, idx) => <div key={idx}>{line}</div>)}
                </div>
              )}

              {executedPlayer && (
                <div className="rounded-xl border-2 border-red-600 bg-red-950 p-6 text-center animate-pulse">
                  <h3 className="text-2xl sm:text-3xl font-black text-white">{executedPlayer.name} Казнён!</h3>
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-[#d4af37]/40 bg-[#120a07] p-4 sm:p-6 space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-[#d4af37]">Жители города {cityName}:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map((p) => {
                const isSilenced = p.id === silencedPlayerId;
                return (
                  <div key={p.id} className={`rounded-xl border p-3.5 flex justify-between items-center ${!p.isAlive ? 'border-red-900 bg-black/90' : 'border-[#c5a059]/40 bg-[#180e0a]'}`}>
                    <div>
                      <p className={`font-bold text-base sm:text-lg ${!p.isAlive ? 'text-red-400 line-through' : 'text-white'}`}>
                        {p.name} {!p.isAlive && '💀'}
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#d4af37]">Роль: {p.role?.name || 'Не назначена'}</p>
                      {isSilenced && <span className="text-[10px] bg-yellow-900 text-yellow-200 px-1 rounded">Лишен голоса!</span>}
                    </div>

                    {p.isAlive ? (
                      phase === 'day' && (
                        <button
                          disabled={isSilenced}
                          onClick={() => handleVote(p.id)}
                          className="px-3.5 py-2 text-xs font-bold rounded bg-[#d4af37] text-black disabled:opacity-30"
                        >
                          Голос ({votes[p.id] || 0})
                        </button>
                      )
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-red-300 bg-red-950 px-2 py-0.5 rounded">{p.diedBy || 'Мертв'}</span>
                        <button onClick={() => handleRestorePlayer(p.id)} className="text-[10px] text-emerald-300 border border-emerald-500 bg-emerald-950 px-2 py-0.5 rounded">
                          Восстановить 🔄
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isMayorPanelOpen && (
        <div style={{ left: `${Math.max(10, Math.min(panelPos.x, window.innerWidth - 330))}px`, top: `${Math.max(10, panelPos.y)}px` }} className="fixed w-[90vw] max-w-[320px] rounded-2xl border-2 border-[#d4af37] bg-[#120a07]/95 p-4 z-50 shadow-2xl">
          <div onMouseDown={handleMouseDown} className="cursor-move border-b border-[#c5a059]/30 pb-2 flex justify-between items-center">
            <h3 className="font-bold text-[#d4af37] text-sm">🎩 Полномочия Мэра</h3>
            <button onClick={() => setIsMayorPanelOpen(false)} className="text-red-400 text-base font-bold p-1">✕</button>
          </div>
          <div className="mt-3 space-y-3">
            <p className="text-xs text-[#c5a059]">Присудить победу:</p>
            <div className="grid grid-cols-3 gap-1.5">
              <button onClick={() => handleMayorInstantWin('civilians')} className="bg-emerald-950 border border-emerald-500 text-[10px] py-2 text-emerald-200 rounded font-bold">Мирные</button>
              <button onClick={() => handleMayorInstantWin('mafia')} className="bg-red-950 border border-red-600 text-[10px] py-2 text-red-200 rounded font-bold">Мафия</button>
              <button onClick={() => handleMayorInstantWin('neutrals')} className="bg-purple-950 border border-purple-500 text-[10px] py-2 text-purple-200 rounded font-bold">Нейтралы</button>
            </div>
            <p className="text-xs text-[#c5a059] border-t border-[#c5a059]/20 pt-2">Ликвидировать:</p>
            <div className="max-h-36 overflow-y-auto space-y-1.5">
              {players.filter(p => p.isAlive).map(p => (
                <button key={p.id} onClick={() => setKickTarget(p)} className="w-full bg-red-900/60 p-2 text-xs text-white rounded flex justify-between items-center font-bold">
                  <span>{p.name}</span>
                  <span className="text-red-300 underline">Удалить</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {kickTarget && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl border-2 border-[#d4af37] bg-[#1c100b] p-5 sm:p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-[#d4af37] text-center">Ликвидация: {kickTarget.name}</h3>
            <div className="space-y-2">
              {KICK_REASONS.map((reason, idx) => (
                <label key={idx} className="flex items-center gap-2 text-xs text-white bg-[#0d0907] p-2.5 rounded border border-[#c5a059]/30">
                  <input type="radio" name="kick_reason" checked={selectedReason === reason} onChange={() => setSelectedReason(reason)} />
                  {reason}
                </label>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleMayorKickPlayer} className="flex-1 bg-[#8b0000] py-3 text-xs font-bold text-white rounded border border-red-500 uppercase">
                Исключить
              </button>
              <button onClick={() => setKickTarget(null)} className="flex-1 bg-[#0d0907] py-3 text-xs font-bold text-[#c5a059] rounded border border-[#c5a059] uppercase">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Play;