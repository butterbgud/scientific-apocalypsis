import { useMemo, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, BookOpen, Coins, Crown, Dices, FlaskConical, Globe2, HeartPulse, Users } from "lucide-react";
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
  const [regions, setRegions] = useState(initialRegions);
  const [tracks, setTracks] = useState(initialTracks);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [notice, setNotice] = useState("Выберите задание, затем регион для агента.");

  const activeAgent = agents[0];
  const selectedTaskData = useMemo(() => tasks.find((task) => task.name === selectedTask), [selectedTask]);

  function startGame() {
    setScreen("board");
    setNotice("Раунд 1 начинается. Выберите задание для Павла Фламинго.");
  }

  function assignTask(index: number) {
    if (!selectedTaskData) {
      setNotice("Сначала выберите карту задания.");
      return;
    }
    if (regions[index].agent) {
      setNotice("В этом регионе уже заняты обе зоны задания.");
      return;
    }
    setRegions((current) => current.map((region, regionIndex) => regionIndex === index
      ? { ...region, task: selectedTaskData.name, agent: activeAgent.name }
      : region));
    setTracks((current) => ({ ...current, enlightenment: current.enlightenment + 1 }));
    setNotice(`${activeAgent.name} отправлен в регион «${regions[index].name}». Проверка готова к разрешению.`);
    setSelectedTask(null);
  }

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
          <div className="seat-preview"><Users size={18} /><span>{playerName || "You"}</span><span className="seat-divider">vs</span><span>Bot · Ponomarev</span></div>
          <button className="primary-button" onClick={startGame}>Начать прототип <ArrowRight size={18} /></button>
          <p className="lobby-note">Версия прототипа · локальная игра · язык: {language}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <div><div className="eyebrow"><FlaskConical size={15} /> APOCALYPSIS</div><h1>Раунд 1 · Ход {playerName || "You"}</h1></div>
        <div className="header-actions"><span className="turn-pill"><Crown size={15} /> Первый игрок</span><button className="ghost-button" onClick={() => setScreen("lobby")}>Выйти</button></div>
      </header>
      <section className="track-strip">
        <Track icon={<Globe2 size={16} />} label="Просветление" value={tracks.enlightenment} max={12} tone="light" />
        <Track icon={<Users size={16} />} label="Социальный" value={tracks.social} max={13} tone="social" />
        <Track icon={<FlaskConical size={16} />} label="Естественно-научный" value={tracks.natural} max={13} tone="natural" />
        <Track icon={<Dices size={16} />} label="Технический" value={tracks.technical} max={13} tone="technical" />
      </section>
      <div className="board-layout">
        <aside className="side-panel player-panel">
          <div className="panel-heading"><span>Ваша фракция</span><Crown size={17} /></div>
          <h2>Мировое Антиправительство</h2>
          <div className="resources"><Resource icon={<Coins size={17} />} label="Капитал" value={5} /><Resource icon={<Users size={17} />} label="Связи" value={4} /><Resource icon={<Crown size={17} />} label="Авторитет" value={1} /></div>
          <div className="panel-heading agent-heading"><span>Агенты · 1/4</span><button className="small-link">+ нанять</button></div>
          <article className="agent-card"><img src={activeAgent.image} alt="" /><div><strong>{activeAgent.name}</strong><span>{activeAgent.className}</span><small>{activeAgent.ability}</small></div></article>
          <div className="bot-mini"><span className="bot-dot" /> Bot · Ponomarev <span className="muted">3 агента</span></div>
        </aside>
        <section className="board-center">
          <div className="section-title"><div><span className="eyebrow">КАРТА МИРА</span><h2>Выберите регион для задания</h2></div><span className="round-status">{notice}</span></div>
          <div className="regions-grid">{regions.map((region, index) => <button key={region.name} className={`region-card ${region.agent ? "occupied" : ""}`} onClick={() => assignTask(index)}><div className="region-top"><span>{String(index + 1).padStart(2, "0")}</span><span>{region.agent ? "занято" : "2 зоны"}</span></div><h3>{region.name}</h3><p>{region.bonus}</p>{region.agent ? <div className="placed-agent"><img src={activeAgent.image} alt="" /><span>{region.agent}</span></div> : <div className="empty-slot">свободные зоны · нажмите, чтобы разместить</div>}</button>)}</div>
          <div className="board-footer"><div><span className="eyebrow">СОСТОЯНИЕ РАУНДА</span><p>{selectedTaskData ? `Выбрано: ${selectedTaskData.name}` : "Задание не выбрано"}</p></div><div className="disaster-chip"><HeartPulse size={16} /> Бедствий на карте: 0</div></div>
        </section>
        <aside className="side-panel task-panel"><div className="panel-heading"><span>Задания в руке · 3</span><BookOpen size={17} /></div><div className="task-list">{tasks.map((task) => <button key={task.name} className={`task-card ${selectedTask === task.name ? "selected" : ""}`} onClick={() => setSelectedTask(task.name)}><div className="task-meta"><span className={`task-type type-${task.type}`}>{task.type}</span><span>{task.cost} ◈</span></div><strong>{task.name}</strong><span className="task-check">{task.check}</span><small>{task.reward}</small></button>)}</div><button className="secondary-button" onClick={() => setNotice("Фаза помощников: выберите агента, который уже выполняет задание.")}><Users size={16} /> Добавить помощника</button></aside>
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
