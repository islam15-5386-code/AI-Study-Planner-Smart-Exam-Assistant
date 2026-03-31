import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const pages = ["dashboard", "planner", "tasks", "quiz", "tutor", "analytics", "setup"];

function buildMarchCalendar() {
  const names = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const firstDay = new Date(2026, 2, 1).getDay();
  const days = [...names.map((d) => ({ type: "name", value: d }))];
  for (let i = 0; i < firstDay; i += 1) days.push({ type: "muted", value: "" });
  for (let d = 1; d <= 31; d += 1) days.push({ type: d === 31 ? "today" : "day", value: d });
  return days;
}

function App() {
  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({ stats: {}, subjects: [], weakTopics: [] });
  const [analytics, setAnalytics] = useState({ summary: {}, heatmap: [], subjects: [] });
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState({ name: "Rahul Ahmed", grade: "Class 12 (HSC)", dailyStudyGoal: 4, examDate: "2026-04-18", streak: 12 });

  const [toast, setToast] = useState("");

  const [planHours, setPlanHours] = useState(4);
  const [planDate, setPlanDate] = useState("2026-04-18");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [plan, setPlan] = useState([]);

  const [quizTopic, setQuizTopic] = useState("");
  const [quizData, setQuizData] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizChoice, setQuizChoice] = useState(null);

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "ai",
      text: "Hi, I am your AI Study Tutor. Ask me about Maths, Physics, Chemistry, Biology, Computer Science, or study strategy."
    }
  ]);

  const [countdown, setCountdown] = useState({ days: "00", hours: "00", mins: "00", secs: "00" });

  const pageTitle = useMemo(() => {
    return {
      dashboard: "Dashboard",
      planner: "Study Planner",
      tasks: "Tasks",
      quiz: "AI Quiz",
      tutor: "AI Tutor",
      analytics: "Analytics",
      setup: "My Subjects"
    }[page];
  }, [page]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [d, t, a, p] = await Promise.all([
          api.getDashboard(),
          api.getTasks(),
          api.getAnalytics(),
          api.getProfile()
        ]);

        if (!mounted) return;
        setDashboard(d);
        setTasks(t.tasks || []);
        setAnalytics(a);
        setProfile(p.profile || profile);
        setPlanDate(p.profile?.examDate || "2026-04-18");
        setPlanHours(p.profile?.dailyStudyGoal || 4);
        setSelectedSubjects((d.subjects || []).map((s) => s.name));
      } catch (_err) {
        if (mounted) setToast("Could not load backend data. Is server running?");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    function tick() {
      const exam = new Date(profile.examDate || "2026-04-18");
      const diff = Math.max(0, exam.getTime() - Date.now());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        mins: String(mins).padStart(2, "0"),
        secs: String(secs).padStart(2, "0")
      });
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [profile.examDate]);

  const pendingTasks = tasks.filter((t) => !t.done).length;
  const calendar = buildMarchCalendar();

  async function onGeneratePlan() {
    if (selectedSubjects.length === 0) {
      setToast("Select at least one subject");
      return;
    }

    setPlanLoading(true);
    try {
      const result = await api.generatePlan({
        subjects: selectedSubjects,
        hours: Number(planHours),
        examDate: planDate
      });
      setPlan(result.plan || []);
      setToast("Plan generated");
    } catch (_err) {
      setToast("Plan generation failed");
    } finally {
      setPlanLoading(false);
    }
  }

  async function onAddTask() {
    const title = window.prompt("Task title:");
    if (!title) return;

    try {
      const result = await api.addTask({ title: title.trim() });
      setTasks((prev) => [...prev, result.task]);
      setToast("Task added");
    } catch (_err) {
      setToast("Could not add task");
    }
  }

  async function onToggleTask(id) {
    try {
      const result = await api.toggleTask(id);
      setTasks((prev) => prev.map((task) => (task._id === id ? result.task : task)));
    } catch (_err) {
      setToast("Could not update task");
    }
  }

  async function onStartQuiz() {
    try {
      const result = await api.generateQuiz({ topic: quizTopic });
      setQuizData(result.questions || []);
      setQuizIndex(0);
      setQuizScore(0);
      setQuizAnswered(false);
      setQuizChoice(null);
    } catch (_err) {
      setToast("Could not generate quiz");
    }
  }

  function onChooseQuiz(choice) {
    if (quizAnswered) return;
    const current = quizData[quizIndex];
    setQuizChoice(choice);
    setQuizAnswered(true);
    if (choice === current.ans) setQuizScore((s) => s + 1);
  }

  function onNextQuiz() {
    if (quizIndex + 1 >= quizData.length) return;
    setQuizIndex((i) => i + 1);
    setQuizAnswered(false);
    setQuizChoice(null);
  }

  async function onSendChat() {
    const message = chatInput.trim();
    if (!message) return;

    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", text: message }]);

    try {
      const result = await api.chat({ message });
      setChatHistory((prev) => [...prev, { role: "ai", text: result.reply }]);
    } catch (_err) {
      setChatHistory((prev) => [...prev, { role: "ai", text: "Server error. Please try again." }]);
    }
  }

  async function onSaveProfile() {
    try {
      const result = await api.saveProfile(profile);
      setProfile(result.profile);
      setToast("Profile saved");
    } catch (_err) {
      setToast("Could not save profile");
    }
  }

  function toggleSubject(name) {
    setSelectedSubjects((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]));
  }

  if (loading) {
    return <div className="page">Loading StudyAI project...</div>;
  }

  const currentQuiz = quizData[quizIndex];
  const quizDone = quizData.length > 0 && quizIndex >= quizData.length - 1 && quizAnswered;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">Study<span>AI</span></div>
        {pages.map((p) => (
          <div key={p} className={`nav-item ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>
            <span>{p === "dashboard" ? "⚡" : p === "planner" ? "📅" : p === "tasks" ? "✅" : p === "quiz" ? "🧠" : p === "tutor" ? "🤖" : p === "analytics" ? "📊" : "⚙️"}</span>
            <span className="nav-label">{pageTitleMap(p)}</span>
            {p === "tasks" ? <span className="nav-badge">{pendingTasks}</span> : null}
          </div>
        ))}
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="page-title">{pageTitle}</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>{profile.name}</div>
            <div className="avatar">{initials(profile.name)}</div>
          </div>
        </div>

        <div className="page">
          {page === "dashboard" && (
            <>
              <div className="grid4">
                <div className="card">
                  <div className="card-sub">Study Streak</div>
                  <div className="stat-num" style={{ color: "var(--warning)" }}>{dashboard.stats.streak || 0}</div>
                  <div className="card-sub">days in a row</div>
                </div>
                <div className="card">
                  <div className="card-sub">Tasks Done Today</div>
                  <div className="stat-num" style={{ color: "var(--accent3)" }}>
                    {dashboard.stats.tasksDone || 0}
                    <span style={{ fontSize: 16, color: "var(--muted)" }}>/{dashboard.stats.tasksTotal || 0}</span>
                  </div>
                  <div className="prog-bar"><div className="prog-fill" style={{ width: `${((dashboard.stats.tasksDone || 0) / Math.max(1, dashboard.stats.tasksTotal || 0)) * 100}%`, background: "var(--accent3)" }} /></div>
                </div>
                <div className="card">
                  <div className="card-sub">Quiz Score Avg</div>
                  <div className="stat-num" style={{ color: "var(--success)" }}>{dashboard.stats.quizAverage || 0}%</div>
                </div>
                <div className="card">
                  <div className="card-sub">Exam In</div>
                  <div className="stat-num" style={{ color: "var(--accent2)" }}>{countdown.days}d</div>
                  <div className="card-sub">HSC Final Exam</div>
                </div>
              </div>

              <div className="grid2">
                <div className="card">
                  <div className="section-row">
                    <div className="card-title">Subject Progress</div>
                    <button className="btn btn-ghost" onClick={() => setPage("planner")}>View Plan</button>
                  </div>
                  {(dashboard.subjects || []).map((s) => (
                    <div className="subject-item" key={s._id || s.name}>
                      <div className="subject-dot" style={{ background: s.color }} />
                      <div style={{ flex: 1 }}>{s.name}</div>
                      <div style={{ width: 120 }}>
                        <div className="prog-bar"><div className="prog-fill" style={{ width: `${s.progress}%`, background: s.color }} /></div>
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>{s.progress}%</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-title">March 2026</div>
                  <div className="calendar-grid">
                    {calendar.map((cell, idx) => (
                      <div key={`${cell.type}-${idx}`} className={`cal-${cell.type === "name" ? "day-name" : "day"} ${cell.type === "today" ? "today" : ""} ${cell.type === "muted" ? "muted" : ""}`}>
                        {cell.value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid2">
                <div className="card">
                  <div className="card-title">Weak Topics</div>
                  {(dashboard.weakTopics || []).map((w) => (
                    <div className="weak-item" key={w._id || w.topic}>
                      <div className="weak-alert" />
                      <div style={{ flex: 1 }}>
                        <div>{w.topic}</div>
                        <div className="card-sub">{w.subject}</div>
                      </div>
                      <div style={{ color: "var(--accent2)", fontWeight: 700 }}>{w.score}%</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-title">Exam Countdown</div>
                  <div className="grid4" style={{ marginTop: 10, marginBottom: 0 }}>
                    <MiniCount label="Days" value={countdown.days} color="var(--accent2)" />
                    <MiniCount label="Hours" value={countdown.hours} color="var(--warning)" />
                    <MiniCount label="Mins" value={countdown.mins} color="var(--accent3)" />
                    <MiniCount label="Secs" value={countdown.secs} color="var(--success)" />
                  </div>
                </div>
              </div>
            </>
          )}

          {page === "planner" && (
            <>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-row">
                  <div className="card-title">AI Study Plan Generator</div>
                  <button className="btn" disabled={planLoading} onClick={onGeneratePlan}>{planLoading ? "Generating..." : "Generate Plan"}</button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Daily Study Hours</label>
                    <input className="form-input" type="number" min="1" max="12" value={planHours} onChange={(e) => setPlanHours(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Exam Date</label>
                    <input className="form-input" type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Select Subjects</label>
                  <div className="chips">
                    {(dashboard.subjects || []).map((s) => (
                      <div key={s._id || s.name} className={`chip ${selectedSubjects.includes(s.name) ? "selected" : ""}`} onClick={() => toggleSubject(s.name)}>
                        {s.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                {plan.map((day, i) => (
                  <div className="card" key={`${day.day}-${i}`} style={{ marginBottom: 10, borderLeft: "3px solid var(--accent)" }}>
                    <div className="card-title" style={{ marginBottom: 8 }}>{day.day} - Focus: {day.focus}</div>
                    {(day.tasks || []).map((task, idx) => <div key={idx} className="card-sub" style={{ marginBottom: 4 }}>• {task}</div>)}
                    <div style={{ marginTop: 8, color: "var(--accent)" }}>Tip: {day.tip}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {page === "tasks" && (
            <>
              <div className="section-row">
                <div className="section-title">Today's Tasks</div>
                <button className="btn" onClick={onAddTask}>Add Task</button>
              </div>
              {(tasks || []).map((t) => (
                <div className={`task-item ${t.done ? "done" : ""}`} key={t._id} onClick={() => onToggleTask(t._id)}>
                  <div className={`task-check ${t.done ? "checked" : ""}`}>{t.done ? "✓" : ""}</div>
                  <div style={{ flex: 1 }}>
                    <div className={`task-title ${t.done ? "done" : ""}`}>{t.title}</div>
                    <div className="card-sub">{t.subject} · {t.time}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {page === "quiz" && (
            <div className="card" style={{ maxWidth: 760 }}>
              <div className="section-row">
                <div className="card-title">AI Quiz Generator</div>
                <div style={{ color: "var(--accent)", fontWeight: 700 }}>Score: {quizScore}/{Math.max(quizIndex + (quizAnswered ? 1 : 0), 0)}</div>
              </div>
              <div className="form-row" style={{ marginBottom: 14 }}>
                <input className="form-input" placeholder="Enter topic" value={quizTopic} onChange={(e) => setQuizTopic(e.target.value)} />
                <button className="btn" onClick={onStartQuiz}>Generate Quiz</button>
              </div>

              {currentQuiz && (
                <>
                  <div className="card-sub" style={{ marginBottom: 6 }}>Question {quizIndex + 1} of {quizData.length}</div>
                  <div className="card-title" style={{ marginBottom: 12 }}>{currentQuiz.q}</div>
                  {(currentQuiz.opts || []).map((opt, idx) => {
                    let cls = "quiz-opt";
                    if (quizAnswered && idx === currentQuiz.ans) cls += " correct";
                    if (quizAnswered && idx === quizChoice && idx !== currentQuiz.ans) cls += " wrong";
                    return <div key={idx} className={cls} onClick={() => onChooseQuiz(idx)}>{String.fromCharCode(65 + idx)}. {opt}</div>;
                  })}

                  {quizAnswered && (
                    <div className="card-sub" style={{ marginTop: 10 }}>
                      {quizChoice === currentQuiz.ans ? "Correct" : "Wrong"}. {currentQuiz.exp}
                    </div>
                  )}

                  {quizAnswered && !quizDone && <button className="btn" style={{ marginTop: 12 }} onClick={onNextQuiz}>Next Question</button>}
                  {quizDone && (
                    <div style={{ marginTop: 12, color: "var(--success)", fontWeight: 700 }}>
                      Quiz complete. Final score: {quizScore}/{quizData.length}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {page === "tutor" && (
            <div className="card" style={{ maxWidth: 760 }}>
              <div className="section-row">
                <div className="card-title">AI Tutor Chat</div>
                <div style={{ color: "var(--success)", fontSize: 12 }}>Online</div>
              </div>
              <div className="chat-area">
                {chatHistory.map((m, idx) => <div key={idx} className={`bubble ${m.role}`}>{m.text}</div>)}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="Ask a study question"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSendChat();
                  }}
                />
                <button className="btn" onClick={onSendChat}>Send</button>
              </div>
            </div>
          )}

          {page === "analytics" && (
            <>
              <div className="section-title">Performance Analytics</div>
              <div className="grid3">
                <div className="card"><div className="card-sub">Total Study Hours</div><div className="stat-num">{analytics.summary.totalStudyHours || 0}h</div></div>
                <div className="card"><div className="card-sub">Tasks Completed</div><div className="stat-num" style={{ color: "var(--success)" }}>{analytics.summary.tasksCompletedPercent || 0}%</div></div>
                <div className="card"><div className="card-sub">Quizzes Taken</div><div className="stat-num" style={{ color: "var(--warning)" }}>{analytics.summary.quizzesTaken || 0}</div></div>
              </div>
              <div className="grid2">
                <div className="card">
                  <div className="card-title">Activity Heatmap</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: 4, marginTop: 12 }}>
                    {(analytics.heatmap || []).map((h, i) => {
                      const opacity = [0.08, 0.25, 0.45, 0.7, 1][h.value] || 0.08;
                      return <div key={i} style={{ aspectRatio: "1", borderRadius: 3, background: `rgba(124, 92, 252, ${opacity})` }} title={`${h.dayOffset} days ago`} />;
                    })}
                  </div>
                </div>
                <div className="card">
                  <div className="card-title">Subject Breakdown</div>
                  {(analytics.subjects || []).map((s) => (
                    <div key={s._id || s.name} style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span>{s.name}</span>
                        <span className="card-sub">{s.progress}%</span>
                      </div>
                      <div className="prog-bar"><div className="prog-fill" style={{ width: `${s.progress}%`, background: s.color }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {page === "setup" && (
            <div className="card" style={{ maxWidth: 680 }}>
              <div className="card-title">My Study Profile</div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Your Name</label>
                <input className="form-input" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Class / Grade</label>
                <input className="form-input" value={profile.grade} onChange={(e) => setProfile((p) => ({ ...p, grade: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Daily Study Goal</label>
                <input
                  className="form-input"
                  type="range"
                  min="1"
                  max="12"
                  value={profile.dailyStudyGoal}
                  onChange={(e) => setProfile((p) => ({ ...p, dailyStudyGoal: Number(e.target.value) }))}
                />
                <div style={{ color: "var(--accent)", marginTop: 6 }}>{profile.dailyStudyGoal} hours</div>
              </div>
              <div className="form-group">
                <label className="form-label">Exam Date</label>
                <input className="form-input" type="date" value={profile.examDate} onChange={(e) => setProfile((p) => ({ ...p, examDate: e.target.value }))} />
              </div>
              <button className="btn" onClick={onSaveProfile}>Save Profile</button>
            </div>
          )}
        </div>
      </main>

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}

function pageTitleMap(page) {
  if (page === "dashboard") return "Dashboard";
  if (page === "planner") return "Study Planner";
  if (page === "tasks") return "Tasks";
  if (page === "quiz") return "AI Quiz";
  if (page === "tutor") return "AI Tutor";
  if (page === "analytics") return "Analytics";
  return "My Subjects";
}

function initials(name = "User") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";
}

function MiniCount({ label, value, color }) {
  return (
    <div className="card" style={{ padding: 10, textAlign: "center", background: "var(--surface2)" }}>
      <div style={{ color, fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24 }}>{value}</div>
      <div className="card-sub" style={{ textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

export default App;
