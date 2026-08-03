import { useMemo, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, BookOpen, Coins, Crown, Dices, FlaskConical, Globe2, HeartPulse, Users } from "lucide-react";
import { assignTask as engineAssignTask, drawTaskChoices, resolveTask, runBotTurn, setup, startNextRound, type GameState } from "./engine";
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
    image: "/assets/cards/characters/flamenko.webp",
  },
  {
    name: "Александр Редиска",
    className: "Предсказатель",
    characteristic: "Психопатия",
    ability: "Один раз за раунд может изменить результат проверки.",
    image: "/assets/cards/characters/alexander_r.webp",
  },
];

const botName = "Александр Окружной";
const botImage = "/assets/cards/characters/okruzhnyy.webp";

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
  const [playerName, setPlayerName] = useState("You");
  const [language, setLanguage] = useState("Русский");
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [notice, setNotice] = useState("Выберите задание, затем регион для агента.");

  const activeAgent = agents[0];
  const selectedTaskData = useMemo(() => game ? game.tasks[selectedTask ?? ""] : undefined, [game, selectedTask]);

  function startGame() {
    const initialized = setup(42);
    if ("error" in initialized) return setNotice(initialized.error);
    const drawn = drawTaskChoices(initialized.state);
    if ("error" in drawn) return setNotice(drawn.error);
    setGame(drawn.state);
    setScreen("board");
    setNotice("Раунд 1 начинается. Выберите задание для Павла Фламинго.");
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

  if (screen === "lobby") {
    return (
      <main className="lobby-shell">
        <section className="lobby-card">
          <div className="eyebrow"><FlaskConical size={16} /> SCIENCE APOCALYPSE</div>
          <h1>Apocalypsis</h1>
          <p className="lede">Мир ускоряется. Ваши агенты знают правду.</p>
          <div className="lobby-form">
            <label>Имя игрока<input value={playerName} onChange={(event) => setPlayerName(event.target.value)} /></label>
            <label>Язык<select value={language} onChange={(event) => setLanguage(event.target.value)}><option>Русский</option><option>English</option></select></label>
          </div>
          <div className="seat-preview"><Users size={18} /><span>{playerName || "You"}</span><span className="seat-divider">vs</span><span>{botName}</span></div>
          <button className="primary-button" onClick={startGame}>Начать прототип <ArrowRight size={18} /></button>
          <p className="lobby-note">Версия прототипа · локальная игра · язык: {language}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <div><div className="eyebrow"><FlaskConical size={15} /> APOCALYPSIS</div><h1>Раунд {game?.round ?? 1} · Ход {playerName || "You"}</h1></div>
        <div className="header-actions"><span className="turn-pill"><Crown size={15} /> Первый игрок</span><button className="ghost-button" onClick={() => setScreen("lobby")}>Выйти</button></div>
      </header>
      <section className="track-strip">
        <Track icon={<Globe2 size={16} />} label="Просветление" value={tracks.enlightenment} max={12} tone="light" />
        <Track icon={<Users size={16} />} label="Социальный" value={"social_progress" in tracks ? tracks.social_progress : tracks.social} max={13} tone="social" />
        <Track icon={<FlaskConical size={16} />} label="Естественно-научный" value={"natural_progress" in tracks ? tracks.natural_progress : tracks.natural} max={13} tone="natural" />
        <Track icon={<Dices size={16} />} label="Технический" value={"technical_progress" in tracks ? tracks.technical_progress : tracks.technical} max={13} tone="technical" />
      </section>
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
          <div className="board-footer"><div><span className="eyebrow">СОСТОЯНИЕ РАУНДА</span><p>{selectedTaskData ? `Выбрано: ${selectedTaskData.title}` : "Задание не выбрано"}</p></div><div className="footer-actions"><div className="disaster-chip"><HeartPulse size={16} /> Бедствий на карте: 0</div>{player && player.sentThisRound >= 2 && <button className="small-link next-round" onClick={nextRound}>Следующий раунд →</button>}</div></div>
          <div className="history-panel"><div className="history-heading"><span className="eyebrow">ИСТОРИЯ РАЗРЕШЕНИЯ</span><span>{game?.history.length ?? 0} событий</span></div>{(game?.history ?? []).slice(-5).reverse().map((event, index) => <div className="history-event" key={`${event.type}-${index}`}><span className="history-dot" /><div><strong>{event.message}</strong>{event.data?.dice ? <small>Кубик: {String(event.data.dice)} · Результат: {String(event.data.score)} / {String(event.data.difficulty)}</small> : null}</div></div>)}</div>
        </section>
        <aside className="side-panel task-panel"><div className="panel-heading"><span>Карты в руке · {boardTasks.length}</span><BookOpen size={17} /></div><div className="task-list">{boardTasks.map((task) => <button key={task.id} className={`task-card ${selectedTask === task.id ? "selected" : ""}`} onClick={() => setSelectedTask(task.id)}><img className="task-image" src={task.image} alt="" /><div className="task-meta"><span className={`task-type type-${task.deck}`}>{task.deck}</span><span>{task.cost} ◈</span></div><strong>{task.title}</strong><span className="task-check">Проверка · {task.difficulty}</span><small>Выберите карту, затем регион</small></button>)}</div><button className="secondary-button" onClick={() => setNotice("Фаза помощников: выберите агента, который уже выполняет задание.")}><Users size={16} /> Добавить помощника</button></aside>
      </div>
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
