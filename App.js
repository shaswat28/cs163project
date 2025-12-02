import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Plus, CheckCircle, Circle, Clock, Target, Zap, Shield, TrendingUp, Settings, X, AlertCircle, Coffee, Trash2 } from 'lucide-react';
import './App.css';

const DeepWorkApp = () => {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Review PRs', verb: 'Review', duration: 30, dependencies: [], completed: false, energy: 'medium' },
    { id: 2, name: 'Write documentation', verb: 'Write', duration: 45, dependencies: [1], completed: false, energy: 'high' }
  ]);
  
  const [activeTimebox, setActiveTimebox] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState('');
  const [focusScore, setFocusScore] = useState(85);
  const [dailyStats, setDailyStats] = useState({
    focusMinutes: 127,
    completedTasks: 3,
    interruptions: 2,
    streak: 5
  });
  const [contextState, setContextState] = useState({
    activeApp: 'VS Code',
    inputCadence: 'steady',
    calendarFree: true,
    distraction: 'low'
  });
  const [showRitual, setShowRitual] = useState(false);
  const [ritualType, setRitualType] = useState('begin');
  const [microIntention, setMicroIntention] = useState('');
  const [endCondition, setEndCondition] = useState('');
  const [newTask, setNewTask] = useState({ name: '', verb: '', duration: 30, energy: 'medium' });
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (activeTimebox && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeboxComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [activeTimebox, timeRemaining]);

  useEffect(() => {
    const nudgeTimer = setTimeout(() => {
      if (!activeTimebox && contextState.calendarFree && Math.random() > 0.7) {
        triggerAdaptiveNudge();
      }
    }, 15000);
    return () => clearTimeout(nudgeTimer);
  }, [activeTimebox]);

  const triggerAdaptiveNudge = () => {
    const nudges = [
      { msg: 'Your calendar is free for the next hour. Ready to start a 30-minute deep work session?', reason: 'Calendar analysis shows availability' },
      { msg: 'You\'ve been context-switching. A focused timebox might help build momentum.', reason: 'Input cadence suggests distraction' },
      { msg: 'Take a 2-minute breath before diving in?', reason: 'Ritual can improve focus quality' }
    ];
    const selected = nudges[Math.floor(Math.random() * nudges.length)];
    setNudgeMessage(selected.msg);
    setShowNudge(true);
  };

  const startTimebox = (task) => {
    setActiveTimebox(task);
    setTimeRemaining(task.duration * 60);
    setFocusMode(true);
    setShowRitual(true);
    setRitualType('begin');
  };

  const pauseTimebox = () => {
    clearInterval(timerRef.current);
    setActiveTimebox(null);
  };

  const handleTimeboxComplete = () => {
    setFocusMode(false);
    setShowRitual(true);
    setRitualType('close');
    setDailyStats(prev => ({
      ...prev,
      focusMinutes: prev.focusMinutes + activeTimebox.duration,
      completedTasks: prev.completedTasks + 1
    }));
  };

  const completeTask = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: true } : t));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const addTask = (taskData) => {
    setTasks([...tasks, { ...taskData, id: Date.now(), completed: false, dependencies: [] }]);
    setShowTaskModal(false);
    setNewTask({ name: '', verb: '', duration: 30, energy: 'medium' });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAvailableTasks = () => {
    return tasks.filter(t => 
      !t.completed && 
      t.dependencies.every(depId => tasks.find(task => task.id === depId)?.completed)
    );
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <div className="logo">
              <Zap className="logo-icon" />
            </div>
            <div>
              <h1 className="title">DeepWork</h1>
              <p className="subtitle">Deep Focus Companion</p>
            </div>
          </div>
          <div className="header-right">
            <div className="focus-score">
              <Target className="icon-sm" />
              <span>Focus Score: {focusScore}%</span>
            </div>
            <button className="icon-button">
              <Settings className="icon-sm" />
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="main-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Active Timebox HUD */}
            {activeTimebox && (
              <div className="timebox-hud">
                <div className="hud-header">
                  <div className="hud-title">
                    <Shield className="icon-md" />
                    <span>DEEP FOCUS MODE</span>
                  </div>
                  <div className="dnd-badge">
                    <Circle className="pulse-dot" />
                    <span>Do Not Disturb</span>
                  </div>
                </div>
                <div className="hud-content">
                  <h2 className="task-title">{activeTimebox.verb} • {activeTimebox.name}</h2>
                  <div className="timer">{formatTime(timeRemaining)}</div>
                  <div className="hud-controls">
                    <button onClick={pauseTimebox} className="btn btn-secondary">
                      <Pause className="icon-sm" />
                      Pause
                    </button>
                    <button onClick={handleTimeboxComplete} className="btn btn-secondary">
                      <Square className="icon-sm" />
                      End Session
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Task Graph */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Target className="icon-md" />
                  Task Graph
                </h2>
                <button onClick={() => setShowTaskModal(true)} className="btn btn-primary">
                  <Plus className="icon-sm" />
                  Add Task
                </button>
              </div>
              <div className="task-list">
                {tasks.map(task => (
                  <div 
                    key={task.id}
                    className={`task-card ${
                      task.completed ? 'task-completed' : 
                      getAvailableTasks().includes(task) ? 'task-available' : 'task-blocked'
                    }`}
                  >
                    <div className="task-content">
                      <div className="task-left">
                        <button onClick={() => completeTask(task.id)} className="checkbox-btn">
                          {task.completed ? 
                            <CheckCircle className="icon-md check-icon" /> : 
                            <Circle className="icon-md uncheck-icon" />
                          }
                        </button>
                        <div className="task-info">
                          <div className="task-name-row">
                            <span className={task.completed ? 'task-name-completed' : 'task-name'}>
                              {task.name}
                            </span>
                            <span className="task-verb">{task.verb}</span>
                          </div>
                          <div className="task-meta">
                            <span className="meta-item">
                              <Clock className="icon-xs" />
                              {task.duration}min
                            </span>
                            <span className="meta-item capitalize">{task.energy} energy</span>
                            {task.dependencies.length > 0 && (
                              <span className="meta-warning">
                                Depends on {task.dependencies.length} task(s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="task-actions">
                        {!task.completed && getAvailableTasks().includes(task) && (
                          <button 
                            onClick={() => startTimebox(task)}
                            className="btn btn-primary"
                            disabled={activeTimebox !== null}
                          >
                            <Play className="icon-sm" />
                            Start
                          </button>
                        )}
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="btn-delete"
                          title="Delete task"
                        >
                          <Trash2 className="icon-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Daily Stats */}
            <div className="card">
              <h3 className="card-title">
                <TrendingUp className="icon-md" />
                Today's Progress
              </h3>
              <div className="stats-content">
                <div className="stat-item">
                  <div className="stat-header">
                    <span className="stat-label">Deep Focus</span>
                    <span className="stat-value">{dailyStats.focusMinutes}min</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${(dailyStats.focusMinutes / 240) * 100}%`}} />
                  </div>
                </div>
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-number green">{dailyStats.completedTasks}</div>
                    <div className="stat-text">Tasks Done</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-number yellow">{dailyStats.interruptions}</div>
                    <div className="stat-text">Interruptions</div>
                  </div>
                </div>
                <div className="streak-box">
                  <div className="streak-header">
                    <Zap className="icon-sm streak-icon" />
                    <span>Streak</span>
                  </div>
                  <div className="streak-number">{dailyStats.streak} days</div>
                </div>
              </div>
            </div>

            {/* Context Sensing */}
            <div className="card">
              <h3 className="card-title">
                <AlertCircle className="icon-md" />
                Context State
              </h3>
              <div className="context-list">
                <div className="context-item">
                  <span className="context-label">Active App</span>
                  <span className="context-value">{contextState.activeApp}</span>
                </div>
                <div className="context-item">
                  <span className="context-label">Input Cadence</span>
                  <span className="context-value capitalize">{contextState.inputCadence}</span>
                </div>
                <div className="context-item">
                  <span className="context-label">Calendar Status</span>
                  <span className="context-value green">
                    {contextState.calendarFree ? 'Free' : 'Busy'}
                  </span>
                </div>
                <div className="context-item">
                  <span className="context-label">Distraction Level</span>
                  <span className={`context-value ${
                    contextState.distraction === 'low' ? 'green' : 
                    contextState.distraction === 'medium' ? 'yellow' : 'red'
                  }`}>
                    {contextState.distraction}
                  </span>
                </div>
              </div>
              <div className="privacy-notice">
                <strong>Privacy:</strong> All inference happens locally. No data leaves your device.
              </div>
            </div>
          </div>
        </div>

        {/* Adaptive Nudge */}
        {showNudge && !activeTimebox && (
          <div className="nudge">
            <div className="nudge-header">
              <div className="nudge-title">
                <Coffee className="icon-md" />
                <span>Adaptive Nudge</span>
              </div>
              <button onClick={() => setShowNudge(false)} className="close-btn">
                <X className="icon-sm" />
              </button>
            </div>
            <p className="nudge-message">{nudgeMessage}</p>
            <div className="nudge-actions">
              <button 
                onClick={() => {
                  setShowNudge(false);
                  if (getAvailableTasks().length > 0) {
                    startTimebox(getAvailableTasks()[0]);
                  }
                }}
                className="btn btn-primary-light"
              >
                Start Session
              </button>
              <button 
                onClick={() => setShowNudge(false)}
                className="btn btn-secondary"
              >
                Later
              </button>
            </div>
          </div>
        )}

        {/* Ritual Modal */}
        {showRitual && (
          <div className="modal-overlay">
            <div className="modal">
              <h2 className="modal-title">
                {ritualType === 'begin' ? 'Plan & Begin' : 'Review & Close'}
              </h2>
              {ritualType === 'begin' ? (
                <div className="modal-content">
                  <div className="form-group">
                    <label className="form-label">Micro-Intention</label>
                    <input 
                      type="text"
                      placeholder="What's the one thing you'll accomplish?"
                      className="form-input"
                      value={microIntention}
                      onChange={(e) => setMicroIntention(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Condition</label>
                    <input 
                      type="text"
                      placeholder="How will you know you're done?"
                      className="form-input"
                      value={endCondition}
                      onChange={(e) => setEndCondition(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => setShowRitual(false)}
                    className="btn btn-primary btn-full"
                  >
                    Begin Deep Work
                  </button>
                </div>
              ) : (
                <div className="modal-content">
                  <div className="form-group">
                    <label className="form-label">What did you accomplish?</label>
                    <textarea 
                      className="form-textarea"
                      placeholder="Capture your progress..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Any blockers?</label>
                    <input 
                      type="text"
                      placeholder="What's stopping you from moving forward?"
                      className="form-input"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      setShowRitual(false);
                      setActiveTimebox(null);
                    }}
                    className="btn btn-success btn-full"
                  >
                    Complete Session
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Task Modal */}
        {showTaskModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2 className="modal-title">Create Task</h2>
              <div className="modal-content">
                <div className="form-group">
                  <label className="form-label">Task Name</label>
                  <input 
                    type="text"
                    value={newTask.name}
                    onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Action Verb</label>
                  <input 
                    type="text"
                    placeholder="e.g., Write, Review, Build"
                    value={newTask.verb}
                    onChange={(e) => setNewTask({...newTask, verb: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Duration (min)</label>
                    <input 
                      type="number"
                      min="20"
                      max="60"
                      value={newTask.duration}
                      onChange={(e) => setNewTask({...newTask, duration: parseInt(e.target.value)})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Energy Level</label>
                    <select 
                      value={newTask.energy}
                      onChange={(e) => setNewTask({...newTask, energy: e.target.value})}
                      className="form-input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="modal-actions">
                  <button 
                    onClick={() => addTask(newTask)}
                    disabled={!newTask.name || !newTask.verb}
                    className="btn btn-primary btn-flex"
                  >
                    Create Task
                  </button>
                  <button 
                    onClick={() => setShowTaskModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeepWorkApp;