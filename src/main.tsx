import { useMemo, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, BookOpen, Coins, Crown, Dices, FlaskConical, Globe2, HeartPulse, Users } from "lucide-react";
import { assignTask as engineAssignTask, drawTaskChoices, resolveTask, runBotTurn, setup, startNextRound, type GameState } from "./engine";
import lobbyImage from "../assets/lobby.webp";
import flamenkoImage from "../assets/cards/characters/flamenko.webp";
import alexImage from "../assets/cards/characters/alex_t.webp";
import okruzhnyyImage from "../assets/cards/characters/okruzhnyy.webp";
import microwaveImage from "../assets/cards/capital/microwave.webp";
import flatEarthImage from "../assets/cards/connections/flat_earth.webp";
import missionImage from "../assets/cards/missions/5g_towers.webp";
import herbsImage from "../assets/cards/capital/herbs.webp";
import "./styles.css";

type Screen = "lobby" | "board";
type TrackKey = "enlightenment" | "social" | "natural" | "technical";

type Agent = {
  name: string;
  className: string;
  characteristic: string;
  ability: string;
  image: string;
};

type Region = {
  name: string;
  bonus: string;
  task: string | null;
  agent: string | null;
};

const agents: Agent[] = [
  {
    name: "Павел Фламинго",
    className: "Целитель",
    characteristic: "Харизма",
    ability: "При помощи даёт основному агенту +1 к проверке.",
    image: flamenkoImage,
  },
  {
    name: "Александр Редиска",
    className: "Предсказатель",
    characteristic: "Психопатия",
    ability: "Один раз за раунд может изменить результат проверки.",
    image: okruzhnyyImage,
  },
];

const botName = "Александр Окружной";
const botImage = okruzhnyyImage;
const appVersion = "20e3c0c";
const tutorialAgent: Agent = { name: "Алексей Трёхкорочкин", className: "Духовный лидер", characteristic: "Воля", ability: "Обучающий стартовый агент.", image: alexImage };
const taskImages: Record<string, string> = {
  "task.capital.microwave": microwaveImage,
  "task.connections.flat-earth": flatEarthImage,
  "task.mission.digital-religion": missionImage,
  "task.capital.herbs": herbsImage,
};

const initialRegions: Region[] = [
  { name: "Англосаксония", bonus: "+1 Расследователь", task: null, agent: null },
  { name: "Азиатские республики", bonus: "+1 Предсказатель", task: null, agent: null },
  { name: "Страны шариата", bonus: "+1 Духовный лидер", task: null, agent: null },
  { name: "Третий мир", bonus: "+1 Целитель", task: null, agent: null },
  { name: "Страны Советов", bonus: "+1 Настоящий учёный", task: null, agent: null },
];

const tasks = [
  { name: "Микроволновка в топку", type: "Капитал", cost: 1, check: "Психопатия · 1", reward: "+2 Капитала" },
  { name: "Плоскоземельный сайт знакомств", type: "Связи", cost: 1, check: "Харизма · 1", reward: "+3 Связи" },
  { name: "Цифровая религия", type: "Миссия", cost: 2, check: "Макиавеллизм · 2", reward: "+1 Авторитет" },
];

const initialTracks: Record<TrackKey, number> = {
  enlightenment: 2,
  social: 4,
  natural: 4,
  technical: 4,
};

function App() {
  const [screen, setScreen] = useState<Screen>("lobby");
  const [language, setLanguage] = useState("Русский");
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [zoomedTask, setZoomedTask] = useState<string | null>(null);
  const [notice, setNotice] = useState("Выберите задание, затем регион для агента.");

  const activeAgent = game?.tutorial ? tutorialAgent : agents[0];
  const selectedTaskData = useMemo(() => game ? game.tasks[selectedTask ?? ""] : undefined, [game, selectedTask]);
  const zoomedTaskData = useMemo(() => game ? game.tasks[zoomedTask ?? ""] : undefined, [game, zoomedTask]);

  function startGame(tutorial = false) {
    const initialized = setup(42, 2, tutorial);
    if ("error" in initialized) return setNotice(initialized.error);
    const drawn = drawTaskChoices(initialized.state);
    if ("error" in drawn) return setNotice(drawn.error);
    setGame(drawn.state);
    setScreen("board");
    setNotice(tutorial ? "Обучающая партия. Откройте руку и выберите карту «Плоскоземельный сайт знакомств»." : "Раунд 1 начинается. Выберите задание для Павла Фламинго.");
  }

  function assignTask(index: number) {
    if (!game || !selectedTaskData || !selectedTask) {
      setNotice("Сначала выберите карту задания.");
      return;
    }
    const region = Object.values(game.regions)[index];
    const assigned = engineAssignTask(game, selectedTask, "agent.flamenko", region.id);
    if ("error" in assigned) return setNotice(assigned.error);
    const resolved = resolveTask(assigned.state, selectedTask);
    if ("error" in resolved) return setNotice(resolved.error);
    const botTurn = runBotTurn(resolved.state);
    if ("error" in botTurn) return setNotice(botTurn.error);
    setGame(botTurn.state);
    setNotice(`${resolved.events[0].message} Бот завершил свой ход.`);
    setSelectedTask(null);
    setZoomedTask(null);
  }

  function nextRound() {
    if (!game) return;
    const ended = startNextRound(game);
    if ("error" in ended) return setNotice(ended.error);
    const drawn = drawTaskChoices(ended.state);
    if ("error" in drawn) return setNotice(drawn.error);
    setGame(drawn.state);
    setNotice(`Раунд ${drawn.state.round} начинается. Выберите задание.`);
  }

  const player = game?.players.find((candidate) => candidate.id === "player.0");
  const regions = game ? Object.values(game.regions) : initialRegions;
  const boardTasks = game ? game.taskChoices.map((id) => game.tasks[id]) : [];
  const tracks = game?.tracks ?? initialTracks;
  const tutorialStep = selectedTask
    ? "Шаг 2 из 3 · Нажмите на регион, чтобы отправить агента."
    : player && player.sentThisRound > 0
      ? "Шаг 3 из 3 · Задание разрешено. Нажмите «Следующий раунд», чтобы продолжить."
      : "Шаг 1 из 3 · Откройте руку и выберите карту задания.";
  if (screen === "lobby") {
    const english = language === "English";
    return (
      <main className="lobby-shell" style={{ backgroundImage: `url(${lobbyImage})` }}>
        <div className="lobby-topbar"><button className="language-button" onClick={() => setLanguage(english ? "Русский" : "English")}>{english ? "Русский" : "English"}</button><span className="lobby-version">#{appVersion}</span></div>
        <section className="lobby-card">
          <div className="lobby-actions"><button className="primary-button" onClick={() => startGame(false)}>{english ? "Start Prototype" : "Начать прототип"} <ArrowRight size={18} /></button><button className="tutorial-button" onClick={() => startGame(true)}>{english ? "Tutorial Match" : "Обучающая партия"} <BookOpen size={17} /></button></div>
        </section>
      </main>
    );
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <div><div className="eyebrow"><FlaskConical size={15} /> APOCALYPSIS</div><h1>Раунд {game?.round ?? 1} · Ход You</h1></div>
        <div className="header-actions"><span className="turn-pill"><Crown size={15} /> Первый игрок</span><button className="ghost-button" onClick={() => setScreen("lobby")}>Выйти</button></div>
      </header>
      <section className="track-strip">
        <Track icon={<Globe2 size={16} />} label="Просветление" value={tracks.enlightenment} max={12} tone="light" />
        <Track icon={<Users size={16} />} label="Социальный" value={"social_progress" in tracks ? tracks.social_progress : tracks.social} max={13} tone="social" />
        <Track icon={<FlaskConical size={16} />} label="Естественно-научный" value={"natural_progress" in tracks ? tracks.natural_progress : tracks.natural} max={13} tone="natural" />
        <Track icon={<Dices size={16} />} label="Технический" value={"technical_progress" in tracks ? tracks.technical_progress : tracks.technical} max={13} tone="technical" />
      </section>
      <div className="tutorial-bar"><span className="tutorial-label">ТУТОРИАЛ</span><span>{tutorialStep}</span></div>
      <div className="board-layout">
        <aside className="side-panel player-panel">
          <div className="panel-heading"><span>Ваша фракция</span><Crown size={17} /></div>
          <h2>Мировое Антиправительство</h2>
          <div className="resources"><Resource icon={<Coins size={17} />} label="Капитал" value={player?.resources.capital ?? 0} /><Resource icon={<Users size={17} />} label="Связи" value={player?.resources.connections ?? 0} /><Resource icon={<Crown size={17} />} label="Авторитет" value={player?.resources.authority ?? 0} /></div>
          <div className="panel-heading agent-heading"><span>Агенты · {player?.agents.length ?? 0}/4</span><button className="small-link">+ нанять</button></div>
          <article className="agent-card"><img src={activeAgent.image} alt="" /><div><strong>{activeAgent.name}</strong><span>{activeAgent.className}</span><small>{activeAgent.ability}</small></div></article>
          <div className="bot-mini"><img src={botImage} alt="" /><span className="bot-dot" /> {botName} <span className="muted">3 агента</span></div>
        </aside>
        <section className="board-center">
          <div className="section-title"><div><span className="eyebrow">КАРТА МИРА</span><h2>Выберите регион для задания</h2></div><span className="round-status">{notice}</span></div>
          <div className="regions-grid">{regions.map((region, index) => <button key={region.name} className={`region-card ${"assignments" in region && region.assignments.length ? "occupied" : ""}`} onClick={() => assignTask(index)}><div className="region-top"><span>{String(index + 1).padStart(2, "0")}</span><span>{"assignments" in region ? `${region.capacity} зоны` : "2 зоны"}</span></div><h3>{region.name}</h3><p>{"bonus" in region ? region.bonus : "Региональная поддержка"}</p>{"assignments" in region && region.assignments.length ? <div className="placed-agent"><img src={activeAgent.image} alt="" /><span>{activeAgent.name}</span></div> : <div className="empty-slot">свободные зоны · нажмите, чтобы разместить</div>}</button>)}</div>
          <div className="board-footer"><div><span className="eyebrow">СОСТОЯНИЕ РАУНДА</span><p>{selectedTaskData ? `Выбрано: ${selectedTaskData.title}` : "Задание не выбрано"}</p></div><div className="footer-actions"><div className="disaster-chip"><HeartPulse size={16} /> Бедствий на карте: 0</div>{player && player.sentThisRound >= 1 && <button className="small-link next-round" onClick={nextRound}>Следующий раунд →</button>}</div></div>
          <div className="history-panel"><div className="history-heading"><span className="eyebrow">ИСТОРИЯ РАЗРЕШЕНИЯ</span><span>{game?.history.length ?? 0} событий</span></div>{(game?.history ?? []).slice(-5).reverse().map((event, index) => <div className="history-event" key={`${event.type}-${index}`}><span className="history-dot" /><div><strong>{event.message}</strong>{event.data?.dice ? <small>Кубик: {String(event.data.dice)} · Результат: {String(event.data.score)} / {String(event.data.difficulty)}</small> : null}</div></div>)}</div>
        </section>
        <aside className="side-panel task-panel hand-collapsed"><div className="panel-heading"><span>Карты в руке · {boardTasks.length}</span><BookOpen size={17} /></div><div className="task-list">{boardTasks.map((task, index) => <button key={task.id} className={`task-card hand-card hand-card-${index} ${selectedTask === task.id ? "selected" : ""}`} onClick={() => setZoomedTask(zoomedTask === task.id ? null : task.id)} aria-label={`Просмотреть карту: ${task.title}`}><img className="task-image" src={taskImages[task.id]} alt="" /><div className="task-meta"><span className={`task-type type-${task.deck}`}>{task.deck}</span><span>{task.cost} ◈</span></div><strong>{task.title}</strong><span className="task-check">Проверка · {task.difficulty}</span><small>Нажмите для просмотра</small></button>)}</div><button className="secondary-button" onClick={() => setNotice("Фаза помощников: выберите агента, который уже выполняет задание.")}><Users size={16} /> Добавить помощника</button></aside>
      </div>
      {zoomedTaskData && <div className="task-zoom-backdrop" role="dialog" aria-modal="true" aria-label={`Карта: ${zoomedTaskData.title}`}><div className="task-zoom-content"><button className="task-zoom-card" onClick={() => setZoomedTask(null)} aria-label="Закрыть просмотр карты"><img src={taskImages[zoomedTaskData.id]} alt={zoomedTaskData.title} /><div className="task-zoom-details"><div className="task-meta"><span className={`task-type type-${zoomedTaskData.deck}`}>{zoomedTaskData.deck}</span><span>{zoomedTaskData.cost} ◈</span></div><strong>{zoomedTaskData.title}</strong><span className="task-check">Проверка · {zoomedTaskData.difficulty}</span></div></button><button className="primary-button task-select-button" onClick={() => { setSelectedTask(zoomedTaskData.id); setZoomedTask(null); setNotice(`Выбрано задание: ${zoomedTaskData.title}. Теперь выберите регион.`); }}>Select</button></div></div>}
    </main>
  );
}

function Track({ icon, label, value, max, tone }: { icon: ReactNode; label: string; value: number; max: number; tone: string }) {
  return <div className="track"><div className="track-label">{icon}<span>{label}</span><b>{value}/{max}</b></div><div className="track-bar"><span className={`track-fill ${tone}`} style={{ width: `${(value / max) * 100}%` }} /></div></div>;
}

function Resource({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <div className="resource"><span>{icon}</span><small>{label}</small><strong>{value}</strong></div>;
}

createRoot(document.getElementById("root")!).render(<App />);
