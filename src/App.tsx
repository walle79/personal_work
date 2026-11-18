import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  Home,
  CheckSquare,
  Briefcase,
  Timer,
  BarChart3,
  Settings,
  Play,
  Pause,
  Plus,
  Pencil,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  Flame,
  Star,
  Clock,
  Square,
} from 'lucide-react';
import reference from './assets/room-compact-sidebar.png';
import avatar from './assets/avatar.png';
import shiftlyIcon from './assets/shiftly.svg';

type Job = 'india' | 'singapore' | 'nigeria';
type Task = {
  id: string;
  title: string;
  job: Job;
  done: boolean;
  due?: string;
  priority?: 'P1' | 'P2' | 'P3';
  completedAt?: string;
};
type Mood = 'Working' | 'Coffee Break' | 'Stretch' | 'Thinking' | 'Idle';
const moods: Mood[] = ['Working', 'Coffee Break', 'Stretch', 'Thinking', 'Idle'];

const DESIGN_W = 1671;
const DESIGN_H = 941;

function getScale() {
  if (typeof window === 'undefined') return 1;
  return Math.min(document.documentElement.clientWidth / DESIGN_W, window.innerHeight / DESIGN_H);
}

function FlagBadge({ job }: { job: Job }) {
  if (job === 'india') {
    return (
      <svg className="flag-circle" viewBox="0 0 36 36">
        <defs>
          <clipPath id="circle-clip-in">
            <circle cx="18" cy="18" r="18" />
          </clipPath>
        </defs>
        <g clipPath="url(#circle-clip-in)">
          <rect width="36" height="12" fill="#FF9933" />
          <rect y="12" width="36" height="12" fill="#FFFFFF" />
          <rect y="24" width="36" height="12" fill="#128807" />
          <circle cx="18" cy="18" r="4.5" fill="none" stroke="#000088" strokeWidth="1" />
          <circle cx="18" cy="18" r="1.5" fill="#000088" />
        </g>
      </svg>
    );
  }
  if (job === 'singapore') {
    return (
      <svg className="flag-circle" viewBox="0 0 36 36">
        <defs>
          <clipPath id="circle-clip-sg">
            <circle cx="18" cy="18" r="18" />
          </clipPath>
        </defs>
        <g clipPath="url(#circle-clip-sg)">
          <rect width="36" height="18" fill="#ED2939" />
          <rect y="18" width="36" height="18" fill="#FFFFFF" />
          <circle cx="11" cy="9" r="5" fill="#FFFFFF" />
          <circle cx="13" cy="9" r="4.2" fill="#ED2939" />
          <circle cx="14" cy="6.5" r="0.8" fill="#FFFFFF" />
          <circle cx="16" cy="8" r="0.8" fill="#FFFFFF" />
          <circle cx="15.5" cy="10.5" r="0.8" fill="#FFFFFF" />
          <circle cx="13" cy="11.5" r="0.8" fill="#FFFFFF" />
          <circle cx="12.5" cy="8.5" r="0.8" fill="#FFFFFF" />
        </g>
      </svg>
    );
  }
  return (
    <svg className="flag-circle" viewBox="0 0 36 36">
      <defs>
        <clipPath id="circle-clip-ng">
          <circle cx="18" cy="18" r="18" />
        </clipPath>
      </defs>
      <g clipPath="url(#circle-clip-ng)">
        <rect width="12" height="36" fill="#008751" />
        <rect x="12" width="12" height="36" fill="#FFFFFF" />
        <rect x="24" width="12" height="36" fill="#008751" />
      </g>
    </svg>
  );
}

const jobs: { id: Job; name: string; flag: string; color: string; gradient: string; tag: string }[] = [
  { id: 'india', name: 'India', flag: '🇮🇳', color: '#38bdf8', gradient: 'linear-gradient(90deg, #38bdf8, #0ea5e9)', tag: 'J1' },
  { id: 'singapore', name: 'Singapore', flag: '🇸🇬', color: '#c084fc', gradient: 'linear-gradient(90deg, #c084fc, #a855f7)', tag: 'J2' },
  { id: 'nigeria', name: 'Nigeria', flag: '🇳🇬', color: '#4ade80', gradient: 'linear-gradient(90deg, #4ade80, #22c55e)', tag: 'J3' },
];

const TIME_ZONE = 'Asia/Ho_Chi_Minh';
const dateKey = (d = new Date()) =>
  d.toLocaleDateString('sv-SE', { timeZone: TIME_ZONE });

// Apply this requested reset once per browser; subsequent work is preserved.
const RESET_VERSION = 'workroom.reset.2026-11-17';
try {
  if (!localStorage.getItem(RESET_VERSION)) {
    for (const key of ['workroom.final.tasks_v2', 'workroom.final.xp_v2', 'workroom.final.log_v2']) {
      localStorage.removeItem(key);
    }
    localStorage.setItem(RESET_VERSION, 'done');
  }
} catch {
  // Storage may be disabled; state still starts empty.
}

function load<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

const uid = () => crypto.randomUUID?.() || String(Date.now() + Math.random());
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function App() {
  const [today, setToday] = useState(() => dateKey());
  const [scale, setScale] = useState(getScale);
  const [screenWidth, setScreenWidth] = useState(() => document.documentElement.clientWidth);
  const [tasks, setTasks] = useState<Task[]>(() => load('workroom.final.tasks_v2', []));
  const [chosen, setChosen] = useState('');
  const [filter, setFilter] = useState<Job | 'all'>('all');
  const [page, setPage] = useState('Home');
  const [mood, setMood] = useState<Mood>('Working');
  const [xp, setXp] = useState(() => load('workroom.final.xp_v2', 0));
  const [streak] = useState(0);
  const [seconds, setSeconds] = useState(25 * 60);
  const [duration] = useState(25);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('P2');
  const [editJob, setEditJob] = useState<Job>('singapore');
  const [addOpen, setAddOpen] = useState(false);
  const [weekShift, setWeekShift] = useState(0);
  const [effects, setEffects] = useState(true);
  const [notice, setNotice] = useState('');
  const [focusLog, setFocusLog] = useState<{ date: string; job: Job; minutes: number }[]>(() =>
    load('workroom.final.log_v2', [])
  );

  useEffect(() => {
    const refreshDate = () => setToday(dateKey());
    const timer = window.setInterval(refreshDate, 1000);
    window.addEventListener('focus', refreshDate);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshDate);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      setScale(getScale());
      setScreenWidth(document.documentElement.clientWidth);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('workroom.final.tasks_v2', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('workroom.final.xp_v2', JSON.stringify(xp));
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('workroom.final.log_v2', JSON.stringify(focusLog));
  }, [focusLog]);

  useEffect(() => {
    if (!running || deadline === null) return;
    const update = () => setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 250);
    return () => clearInterval(timer);
  }, [running, deadline]);

  useEffect(() => {
    if (!running || seconds !== 0) return;
    setRunning(false);
    setDeadline(null);
    setXp((x) => x + 25);
    const task = tasks.find((t) => t.id === chosen);
    if (task) setFocusLog((l) => [{ date: dateKey(), job: task.job, minutes: duration }, ...l]);
    setNotice('Focus completed! +25 XP 🎉');
    setMood('Idle');
  }, [seconds, running]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 2800);
    return () => clearTimeout(t);
  }, [notice]);

  const done = tasks.filter((t) => t.done).length;
  const percentage = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const active = tasks.find((t) => t.id === chosen) || tasks[0];
  const stats = jobs.map((j) => {
    const all = tasks.filter((t) => t.job === j.id).length;
    const d = tasks.filter((t) => t.job === j.id && t.done).length;
    const pct = all ? Math.round((d / all) * 100) : 0;
    return { ...j, all, done: d, pct };
  });

  const week = useMemo(() => {
    const d = new Date(`${today}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - d.getUTCDay() + weekShift * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const a = new Date(d);
      a.setUTCDate(d.getUTCDate() + i);
      return { key: dateKey(a), name: a.toLocaleDateString('en', { weekday: 'short', timeZone: TIME_ZONE }), day: a.getUTCDate() };
    });
  }, [weekShift, today]);

  function toggle(t: Task) {
    setTasks((all) =>
      all.map((a) => (a.id === t.id ? { ...a, done: !a.done, completedAt: !a.done ? dateKey() : undefined } : a))
    );
    if (!t.done) {
      setXp((x) => x + 50);
      setNotice('Task complete! +50 XP ✨');
    }
  }

  function pause() {
    if (deadline !== null) setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    setDeadline(null);
    setRunning(false);
  }

  function play() {
    if (!active || active.done) {
      setNotice('Select an unfinished task first');
      return;
    }
    setDeadline(Date.now() + seconds * 1000);
    setRunning(true);
    setMood('Working');
  }

  function reset() {
    pause();
    setSeconds(duration * 60);
  }

  function edit(t?: Task) {
    setEditing(t?.id || 'new');
    setTitle(t?.title || '');
    setDue(t?.due || '');
    setPriority(t?.priority || 'P2');
    setEditJob(t?.job || 'singapore');
    setAddOpen(true);
  }

  function save() {
    if (!title.trim()) return;
    if (editing === 'new') {
      const t: Task = { id: uid(), title: title.trim(), job: editJob, done: false, due, priority };
      setTasks((a) => [t, ...a]);
      setChosen(t.id);
    } else {
      setTasks((a) => a.map((t) => (t.id === editing ? { ...t, title: title.trim(), job: editJob, due, priority } : t)));
    }
    setAddOpen(false);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ tasks, xp, focusLog }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workroom-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  const timerProgress = Math.max(0, Math.min(100, Math.round(((duration * 60 - seconds) / (duration * 60)) * 100)));

  return (
    <div className="viewport">
      <div
        className="stage-scaler"
        style={{ width: screenWidth, height: DESIGN_H * scale }}
      >
        <div
          className="stage"
          style={{
            backgroundImage: `url(${reference})`,
            '--room-art': `url(${reference})`,
            '--extra-width': `${Math.max(0, screenWidth / scale - DESIGN_W)}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          } as CSSProperties}
        >
          {effects && (
            <>
              <div className="rain-mask" aria-hidden="true">
                {Array.from({ length: 32 }, (_, i) => (
                  <i
                    key={i}
                    style={{
                      left: `${(i * 41) % 100}%`,
                      height: `${19 + (i % 4) * 4}px`,
                      animationDelay: `-${i * 0.73}s`,
                      animationDuration: `${0.85 + (i % 6) * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <div className="aquarium-motion" aria-hidden="true">
                {['fish-a', 'fish-b', 'fish-c'].map((fish) => (
                  <span className={`swim-fish ${fish}`} key={fish}>
                    <svg viewBox="0 0 36 22">
                      <path d="M25 11 35 3v16Z" fill="#ff9d30" />
                      <ellipse cx="15" cy="11" rx="13" ry="8" fill="#ffae38" />
                      <path d="m12 4 6-4 3 6M12 17l6 5 3-6" fill="#ed7724" />
                      <circle cx="8" cy="9" r="2" fill="white" />
                      <circle cx="7.5" cy="9" r="1" fill="#17243a" />
                    </svg>
                  </span>
                ))}
                <i className="aquarium-bubble bubble-a" />
                <i className="aquarium-bubble bubble-b" />
              </div>
              <span className="steam-layer">〰</span>
              <div className="sleep-bubbles" aria-hidden="true">
                <span>Z</span>
                <span>Z</span>
              </div>
              <span className={`typing-layer ${mood === 'Working' ? 'on' : ''}`}>✧</span>
              {mood === 'Working' && (
                <div className="character-typing" aria-hidden="true">
                  <div className="typing-hand hand-left" />
                  <div className="typing-hand hand-right" />
                  <div className="keyboard-light" />
                </div>
              )}
            </>
          )}

          <div className="brand">
            <img src={avatar} alt="Avatar" className="avatar-img" />
            <div>
              <strong className="brand-title" title="Switch jobs. Stay in flow.">
                <img src={shiftlyIcon} alt="" /> Shiftly
              </strong>
              <small>Lv. {Math.floor(xp / 500) + 1} • QA / Automation / SDET</small>
            </div>
          </div>

          <aside className="sidebar region">
            <div className="nav">
              {[
                { n: 'Home', I: Home },
                { n: 'Tasks', I: CheckSquare },
                { n: 'Jobs', I: Briefcase },
                { n: 'Focus', I: Timer },
                { n: 'Reports', I: BarChart3 },
                { n: 'Settings', I: Settings },
              ].map(({ n, I }) => (
                <button className={page === n ? 'active' : ''} key={n} onClick={() => setPage(n)}>
                  <I />
                  {n}
                </button>
              ))}
            </div>
          </aside>

          <div className="top region">
            <span>
              <Calendar className="top-icon" />
              {new Date(`${today}T12:00:00Z`).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: TIME_ZONE,
              })}
            </span>
            <span>
              <Flame className="top-icon flame-icon" />
              {streak}-day streak
            </span>
            <span>
              <Star className="top-icon star-icon" />
              {xp.toLocaleString()} XP
            </span>
            <button onClick={() => setPage('Settings')} aria-label="Settings">
              <Settings className="settings-svg" />
            </button>
          </div>

          {/* Focus Session Widget - Exact match to reference.png */}
          <section className="focus region">
            <h2>
              <span className="h2-icon">🎯</span> Focus Session
            </h2>
            <div className="focus-clock">
              <div className="clock-display">
                <Clock className="stopwatch-icon" />
                <strong>{fmt(seconds)}</strong>
              </div>
              <div className="clock-controls">
                <button className="play" onClick={running ? pause : play} title={running ? 'Pause' : 'Start'}>
                  {running ? <Pause /> : <Play />}
                </button>
                <button className="stop" onClick={reset} title="Reset">
                  <Square className="square-icon" />
                </button>
              </div>
            </div>
            <div className="focus-task-box">
              <div className="focus-task-title" title={active?.title}>
                {active?.title || 'Add a task to start focusing'}
              </div>
              <div className="track">
                <span style={{ width: `${timerProgress}%` }} />
              </div>
            </div>
          </section>

          {/* Today's Tasks - Exact match to reference.png */}
          <section className="tasks region">
            <div className="heading">
              <h2>
                <span className="h2-icon">☑</span> Today’s Tasks ({done}/{tasks.length})
              </h2>
            </div>
            <div className="task-list">
              {stats.filter((job) => job.all > 0).map((job) => (
                <section className="task-group" key={job.id} aria-label={`${job.name} tasks`}>
                  <div className="task-group-heading">
                    <span title={job.name} role="img" aria-label={job.name}>
                      <FlagBadge job={job.id} />
                    </span>
                  </div>
              {tasks.filter((t) => t.job === job.id).map((t) => {
                const isChosen = chosen === t.id && !t.done;
                return (
                  <div
                    key={t.id}
                    className={`task ${isChosen ? 'chosen' : ''} ${t.done ? 'done' : ''}`}
                    onClick={() => {
                      if (!t.done) {
                        setChosen(t.id);
                        setNotice('Focus task selected');
                      }
                    }}
                  >
                    <button
                      className="tick"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(t);
                      }}
                      title={t.done ? 'Mark incomplete' : 'Mark complete'}
                      role="checkbox"
                      aria-checked={t.done}
                      aria-label={`${t.done ? 'Mark incomplete' : 'Mark complete'}: ${t.title}`}
                    >
                      {t.done && <Check className="check-svg" />}
                    </button>
                    <span className="task-name" title={t.title}>
                      {t.title}
                    </span>
                    <button
                      className="edit-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        edit(t);
                      }}
                      title="Edit"
                    >
                      <Pencil />
                    </button>
                    <button
                      className="edit-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete task?')) setTasks((a) => a.filter((x) => x.id !== t.id));
                      }}
                      title="Delete"
                    >
                      <Trash2 />
                    </button>
                  </div>
                );
              })}
                </section>
              ))}
            </div>
            <button className="add" onClick={() => edit()}>
              <Plus /> Add task
            </button>
          </section>

          {/* Moods Bar - Transparent to let reference.png character illustrations shine through */}
          <section className="moods region">
            <button className="mood-arrow" onClick={() => setMood((current) => moods[(moods.indexOf(current) + moods.length - 1) % moods.length])} title="Previous">
              <ChevronLeft />
            </button>
            <div className="mood-items">
              {moods.map((m) => (
                <button
                  key={m}
                  className={`mood-btn ${mood === m ? 'active' : ''}`}
                  onClick={() => setMood(m)}
                  title={m}
                  aria-label={m}
                  aria-pressed={mood === m}
                />
              ))}
            </div>
            <button className="mood-arrow" onClick={() => setMood((current) => moods[(moods.indexOf(current) + 1) % moods.length])} title="Next">
              <ChevronRight />
            </button>
          </section>

          {/* Today Progress - Exact match to reference.png */}
          <section className="daily region">
            <h2>
              <span className="h2-icon">🎯</span> Today Progress
            </h2>
            <div className="daily-big">
              {done} / {tasks.length} tasks ({percentage}%)
            </div>
            <div className="track">
              <span style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, #4ade80, #38bdf8)' }} />
            </div>
          </section>

          {/* Job Progress - Exact match to reference.png without text "Job 1 - India" etc */}
          <section className="progress region">
            <h2>
              <span className="h2-icon">🚀</span> Job Progress
            </h2>
            <div className="progress-list">
              {stats.map((j) => (
                <div className="progress-row" key={j.id}>
                  <FlagBadge job={j.id} />
                  <div className="track">
                    <span style={{ width: `${j.pct}%`, background: j.gradient }} />
                  </div>
                  <b>{j.pct}%</b>
                </div>
              ))}
            </div>
          </section>

          {/* This Week - Exact match to reference.png */}
          <section className="week region">
            <div className="heading">
              <h2>
                <span className="h2-icon">🗓</span> This Week
              </h2>
              <div className="week-nav">
                <button onClick={() => setWeekShift((v) => v - 1)}>
                  <ChevronLeft />
                </button>
                <button onClick={() => setWeekShift((v) => v + 1)}>
                  <ChevronRight />
                </button>
              </div>
            </div>
            <div className="days">
              {week.map((d) => (
                <div key={d.key} className={d.key === today ? 'current' : ''} aria-current={d.key === today ? 'date' : undefined}>
                  <small>{d.name}</small>
                  <b>{d.day}</b>
                  <span>{tasks.some((task) => task.done && task.completedAt === d.key) ? '✓' : '□'}</span>
                </div>
              ))}
            </div>
          </section>

          {page !== 'Home' && (
            <div className="drawer region">
              <div className="heading">
                <h2>
                  {page === 'Tasks'
                    ? 'All tasks'
                    : page === 'Jobs'
                    ? 'Job overview'
                    : page === 'Focus'
                    ? 'Focus controls'
                    : page === 'Reports'
                    ? 'Focus reports'
                    : 'Settings'}
                </h2>
                <button onClick={() => setPage('Home')}>✕</button>
              </div>
              {page === 'Settings' ? (
                <>
                  <label>
                    <input type="checkbox" checked={effects} onChange={(e) => setEffects(e.target.checked)} /> Ambient
                    animation
                  </label>
                  <button className="drawer-action" onClick={exportData}>
                    <Download /> Export backup JSON
                  </button>
                  <p>Task data stays in this browser. GitHub Pages does not sync devices.</p>
                </>
              ) : page === 'Reports' ? (
                <>
                  <p>Completed sessions: {focusLog.length}</p>
                  <p>Total focus: {focusLog.reduce((a, b) => a + b.minutes, 0)} minutes</p>
                  <button className="drawer-action" onClick={exportData}>
                    Export data
                  </button>
                </>
              ) : page === 'Focus' ? (
                <>
                  <p>Current: {active?.title || 'No task selected'}</p>
                  <button className="drawer-action" onClick={running ? pause : play}>
                    {running ? 'Pause' : 'Start'} focus
                  </button>
                </>
              ) : (
                <>
                  <div className="drawer-filters">
                    {([{ id: 'all', name: 'All' }, ...jobs] as { id: Job | 'all'; name: string }[]).map((j) => (
                      <button
                        className={filter === j.id ? 'selected' : ''}
                        key={j.id}
                        onClick={() => setFilter(j.id)}
                      >
                        {j.name}
                      </button>
                    ))}
                  </div>
                  {tasks.map((t) => (
                    <div className="drawer-task" key={t.id}>
                      <input type="checkbox" checked={t.done} onChange={() => toggle(t)} />
                      <button
                        onClick={() => {
                          setChosen(t.id);
                          setPage('Home');
                        }}
                      >
                        {t.title}
                      </button>
                      <button onClick={() => edit(t)}>
                        <Pencil />
                      </button>
                    </div>
                  ))}
                  <button className="drawer-action" onClick={() => edit()}>
                    <Plus /> Add task
                  </button>
                </>
              )}
            </div>
          )}

          {addOpen && (
            <div className="modal-backdrop">
              <form
                className="modal"
                onSubmit={(e) => {
                  e.preventDefault();
                  save();
                }}
              >
                <h2>{editing === 'new' ? 'Add task' : 'Edit task'}</h2>
                <label>
                  Task
                  <input required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
                </label>
                <label>
                  Job
                  <select value={editJob} onChange={(e) => setEditJob(e.target.value as Job)}>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Priority
                  <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])}>
                    <option>P1</option>
                    <option>P2</option>
                    <option>P3</option>
                  </select>
                </label>
                <label>
                  Due date
                  <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
                </label>
                <div>
                  <button type="button" onClick={() => setAddOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit">Save</button>
                </div>
              </form>
            </div>
          )}

          {notice && <div className="toast">{notice}</div>}
        </div>
      </div>
    </div>
  );
}
