import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ftwdycuopzfiledwceme.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0d2R5Y3VvcHpmaWxlZHdjZW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzgwNTIsImV4cCI6MjA5MzE1NDA1Mn0.ls5B-0rU_uSXdSZH8sX8ZXaU8gCneZ-BYLrd8tXV1Sg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DRIVER_COLORS = {
  "Customer Maintain": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "New Feature": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
};

const RICE_COLOR = (score) => {
  if (score >= 80) return { bg: "#F0FDF4", text: "#15803D" };
  if (score >= 50) return { bg: "#FEFCE8", text: "#A16207" };
  return { bg: "#FFF7ED", text: "#C2410C" };
};

const genId = () => Math.random().toString(36).slice(2, 10);

const defaultData = () => ({
  sprintLengthDays: 14,
  sprintCount: 8,
  startDate: new Date().toISOString().split("T")[0],
  swimlanes: [
    { id: "lane-1", name: "Compass Global SSO" },
    { id: "lane-2", name: "Compass Dashboard" },
    { id: "lane-3", name: "Engage" },
  ],
  projects: {},
  backlog: [],
  completed: [],
});

function formatDate(isoDate, sprintLengthDays, sprintIndex) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + sprintIndex * sprintLengthDays);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ProjectCard({ project, onEdit, onDelete, dragging, onDragStart, onDragEnd, compact }) {
  const driver = DRIVER_COLORS[project.driver] || DRIVER_COLORS["New Feature"];
  const riceColor = RICE_COLOR(project.rice || 0);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart(e, project.id);
      }}
      onDragEnd={onDragEnd}
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        padding: compact ? "6px 8px" : "8px 10px",
        marginBottom: 4,
        cursor: "grab",
        opacity: dragging ? 0.4 : 1,
        fontSize: 11,
        position: "relative",
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        transition: "opacity 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 }}>
        <span style={{ fontWeight: 600, fontSize: 11, color: "#111827", lineHeight: 1.3, flex: 1 }}>
          {project.name}
        </span>
        <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(project); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "1px 3px", color: "#9CA3AF", fontSize: 10, borderRadius: 3 }}
            title="Edit"
          >✎</button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "1px 3px", color: "#EF4444", fontSize: 10, borderRadius: 3 }}
            title="Delete"
          >×</button>
        </div>
      </div>
      {!compact && project.businessValue && (
        <div style={{ color: "#6B7280", fontSize: 10, marginTop: 2, lineHeight: 1.3 }}>{project.businessValue}</div>
      )}
      <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ background: driver.bg, color: driver.text, border: `1px solid ${driver.border}`, borderRadius: 4, padding: "1px 5px", fontSize: 9, fontWeight: 600 }}>
          {project.driver === "Customer Maintain" ? "CM" : "NF"}
        </span>
        <span style={{ background: riceColor.bg, color: riceColor.text, borderRadius: 4, padding: "1px 5px", fontSize: 9, fontWeight: 700 }}>
          R:{project.rice || 0}
        </span>
        <span style={{ background: "#F3F4F6", color: "#374151", borderRadius: 4, padding: "1px 5px", fontSize: 9 }}>
          {project.sprintCount || 1}sp
        </span>
        {project.confluenceUrl && (
          <a href={project.confluenceUrl} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: "#2563EB", fontSize: 9, textDecoration: "none", fontWeight: 600 }}
            title="Confluence">🔗</a>
        )}
      </div>
    </div>
  );
}

function ProjectModal({ project, onSave, onClose }) {
  const [form, setForm] = useState(
    project || {
      id: genId(), name: "", businessValue: "", rice: 50, sprintCount: 1,
      driver: "New Feature", confluenceUrl: "",
    }
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 420, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#111827" }}>
          {project ? "Edit project" : "Add project"}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>
            Name *
            <input value={form.name} onChange={e => set("name", e.target.value)} style={inputStyle} placeholder="Project name" />
          </label>
          <label style={labelStyle}>
            Business value
            <textarea value={form.businessValue} onChange={e => set("businessValue", e.target.value)} style={{ ...inputStyle, height: 60, resize: "vertical" }} placeholder="Why this matters..." />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={labelStyle}>
              RICE score
              <input type="number" value={form.rice} onChange={e => set("rice", +e.target.value)} style={inputStyle} min={0} max={200} />
            </label>
            <label style={labelStyle}>
              Sprint count
              <input type="number" value={form.sprintCount} onChange={e => set("sprintCount", +e.target.value)} style={inputStyle} min={1} max={10} />
            </label>
          </div>
          <label style={labelStyle}>
            Driver
            <select value={form.driver} onChange={e => set("driver", e.target.value)} style={inputStyle}>
              <option>New Feature</option>
              <option>Customer Maintain</option>
            </select>
          </label>
          <label style={labelStyle}>
            Confluence URL
            <input value={form.confluenceUrl} onChange={e => set("confluenceUrl", e.target.value)} style={inputStyle} placeholder="https://..." />
          </label>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button onClick={() => form.name && onSave(form)} style={btnPrimary} disabled={!form.name}>
            {project ? "Save changes" : "Add project"}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#374151", fontWeight: 500 };
const inputStyle = { padding: "7px 10px", border: "1px solid #D1D5DB", borderRadius: 7, fontSize: 13, color: "#111827", background: "#fff", outline: "none" };
const btnPrimary = { padding: "8px 18px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnSecondary = { padding: "8px 18px", background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB", borderRadius: 7, fontSize: 13, cursor: "pointer" };

function SettingsModal({ data, onSave, onClose }) {
  const [sprintLen, setSprintLen] = useState(data.sprintLengthDays);
  const [sprintCount, setSprintCount] = useState(data.sprintCount);
  const [startDate, setStartDate] = useState(data.startDate);
  const [lanes, setLanes] = useState(data.swimlanes.map(l => ({ ...l })));
  const [newLane, setNewLane] = useState("");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 440, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Settings</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={labelStyle}>Sprint length (days)
            <input type="number" value={sprintLen} onChange={e => setSprintLen(+e.target.value)} style={inputStyle} min={1} max={60} />
          </label>
          <label style={labelStyle}>Number of sprints
            <input type="number" value={sprintCount} onChange={e => setSprintCount(+e.target.value)} style={inputStyle} min={1} max={24} />
          </label>
          <label style={labelStyle}>Start date
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
          </label>
          <div>
            <div style={{ fontSize: 12, color: "#374151", fontWeight: 500, marginBottom: 6 }}>Swimlanes</div>
            {lanes.map((lane, i) => (
              <div key={lane.id} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                <input value={lane.name} onChange={e => { const l = [...lanes]; l[i].name = e.target.value; setLanes(l); }} style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => setLanes(lanes.filter((_, j) => j !== i))} style={{ ...btnSecondary, padding: "7px 10px", color: "#EF4444" }}>×</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 6 }}>
              <input value={newLane} onChange={e => setNewLane(e.target.value)} placeholder="New lane name..." style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => { if (newLane.trim()) { setLanes([...lanes, { id: genId(), name: newLane.trim() }]); setNewLane(""); } }} style={btnSecondary}>Add</button>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button onClick={() => onSave({ sprintLengthDays: sprintLen, sprintCount, startDate, swimlanes: lanes })} style={btnPrimary}>Save</button>
        </div>
      </div>
    </div>
  );
}

function CapacityBar({ used, max }) {
  const pct = Math.min(1, used / max);
  const color = pct >= 1 ? "#EF4444" : pct >= 0.75 ? "#F59E0B" : "#10B981";
  return (
    <div style={{ height: 4, background: "#E5E7EB", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct * 100}%`, background: color, borderRadius: 2, transition: "width 0.3s" }} />
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [view, setView] = useState("timeline");
  const [showBacklog, setShowBacklog] = useState(true);
  const [editProject, setEditProject] = useState(null);
  const [addingTo, setAddingTo] = useState(null); // {type:'sprint'|'backlog', laneId, sprintIdx}
  const [showSettings, setShowSettings] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backlogDragIdx, setBacklogDragIdx] = useState(null);
  const [completedOpen, setCompletedOpen] = useState(false);

  // Supabase load/save
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: rows, error: err } = await supabase
          .from("roadmap_state")
          .select("*")
          .eq("key", "main")
          .single();
        if (err && err.code !== "PGRST116") throw err;
        if (rows?.value) {
          setData(rows.value);
        } else {
          setData(defaultData());
        }
      } catch (e) {
        console.error("Load error:", e);
        setData(defaultData());
        setError("Could not connect to Supabase — using local state. Create a table 'roadmap_state' with columns key (text) and value (jsonb).");
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const save = useCallback(async (newData) => {
    setData(newData);
    try {
      await supabase.from("roadmap_state").upsert({ key: "main", value: newData }, { onConflict: "key" });
    } catch (e) {
      console.error("Save error:", e);
    }
  }, []);

  const updateData = useCallback((updater) => {
    setData(prev => {
      const next = updater(prev);
      const doSave = async () => {
        try {
          await supabase.from("roadmap_state").upsert({ key: "main", value: next }, { onConflict: "key" });
        } catch (e) {
          console.error("Save error:", e);
        }
      };
      doSave();
      return next;
    });
  }, []);

  // Derive sprint cells: projects[laneId][sprintIdx] = [projectId, ...]
  const getSprintProjects = (d) => {
    const result = {};
    if (!d) return result;
    d.swimlanes.forEach(lane => {
      result[lane.id] = {};
      for (let i = 0; i < d.sprintCount; i++) result[lane.id][i] = [];
    });
    Object.entries(d.projects || {}).forEach(([pid, proj]) => {
      if (proj.sprintIdx != null && proj.laneId && result[proj.laneId]) {
        const idx = proj.sprintIdx;
        if (!result[proj.laneId][idx]) result[proj.laneId][idx] = [];
        result[proj.laneId][idx].push(pid);
      }
    });
    return result;
  };

  const handleSaveProject = (proj, targetLaneId, targetSprintIdx) => {
    updateData(d => {
      const projs = { ...(d.projects || {}), [proj.id]: { ...proj, laneId: proj.laneId || targetLaneId, sprintIdx: proj.sprintIdx ?? targetSprintIdx } };
      return { ...d, projects: projs };
    });
    setEditProject(null);
    setAddingTo(null);
  };

  const handleSaveNewProject = (proj) => {
    updateData(d => {
      if (addingTo?.type === "sprint") {
        const newProj = { ...proj, laneId: addingTo.laneId, sprintIdx: addingTo.sprintIdx };
        return { ...d, projects: { ...(d.projects || {}), [proj.id]: newProj } };
      } else {
        const backlog = [...(d.backlog || []), proj.id];
        return { ...d, projects: { ...(d.projects || {}), [proj.id]: proj }, backlog };
      }
    });
    setAddingTo(null);
  };

  const handleEditProject = (proj) => {
    setEditProject(proj);
  };

  const handleUpdateEditedProject = (proj) => {
    updateData(d => ({ ...d, projects: { ...d.projects, [proj.id]: { ...d.projects[proj.id], ...proj } } }));
    setEditProject(null);
  };

  const handleDeleteProject = (pid) => {
    updateData(d => {
      const projs = { ...d.projects };
      delete projs[pid];
      return {
        ...d,
        projects: projs,
        backlog: (d.backlog || []).filter(id => id !== pid),
        completed: (d.completed || []).filter(id => id !== pid),
      };
    });
  };

  const handleMarkComplete = (pid) => {
    updateData(d => {
      const proj = d.projects[pid];
      if (!proj) return d;
      const updatedProj = { ...proj, laneId: undefined, sprintIdx: undefined };
      return {
        ...d,
        projects: { ...d.projects, [pid]: updatedProj },
        completed: [...(d.completed || []), pid],
        backlog: (d.backlog || []).filter(id => id !== pid),
      };
    });
  };

  // Drag-and-drop
  const handleDragStart = (e, pid) => {
    e.dataTransfer.setData("pid", pid);
    setDraggingId(pid);
  };
  const handleDragEnd = () => { setDraggingId(null); setDragOverTarget(null); };

  const handleDropOnCell = (e, laneId, sprintIdx) => {
    e.preventDefault();
    const pid = e.dataTransfer.getData("pid");
    if (!pid) return;
    updateData(d => {
      const cell = getSprintProjects(d)[laneId]?.[sprintIdx] || [];
      if (cell.length >= 6) return d;
      const proj = d.projects[pid];
      if (!proj) return d;
      const updatedProj = { ...proj, laneId, sprintIdx };
      return {
        ...d,
        projects: { ...d.projects, [pid]: updatedProj },
        backlog: (d.backlog || []).filter(id => id !== pid),
        completed: (d.completed || []).filter(id => id !== pid),
      };
    });
    setDragOverTarget(null);
    setDraggingId(null);
  };

  const handleDropOnBacklog = (e) => {
    e.preventDefault();
    const pid = e.dataTransfer.getData("pid");
    if (!pid) return;
    updateData(d => {
      const proj = d.projects[pid];
      if (!proj) return d;
      const updatedProj = { ...proj, laneId: undefined, sprintIdx: undefined };
      const backlog = d.backlog?.includes(pid) ? d.backlog : [...(d.backlog || []), pid];
      return { ...d, projects: { ...d.projects, [pid]: updatedProj }, backlog };
    });
    setDraggingId(null);
  };

  // Backlog drag reorder
  const handleBacklogDragStart = (e, idx) => { setBacklogDragIdx(idx); e.dataTransfer.setData("backlogIdx", idx); };
  const handleBacklogDrop = (e, targetIdx) => {
    e.preventDefault();
    const fromIdx = parseInt(e.dataTransfer.getData("backlogIdx"));
    if (isNaN(fromIdx) || fromIdx === targetIdx) return;
    updateData(d => {
      const bl = [...(d.backlog || [])];
      const [removed] = bl.splice(fromIdx, 1);
      bl.splice(targetIdx, 0, removed);
      return { ...d, backlog: bl };
    });
    setBacklogDragIdx(null);
  };

  const handleSaveSettings = (settings) => {
    updateData(d => ({ ...d, ...settings }));
    setShowSettings(false);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#6B7280", fontSize: 14 }}>
      Loading roadmap...
    </div>
  );

  if (!data) return null;

  const sprintProjects = getSprintProjects(data);
  const allProjects = data.projects || {};

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#F8FAFC", minHeight: "100vh", color: "#111827" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: "#111827", letterSpacing: "-0.3px" }}>Sprint Roadmap</div>
          <div style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>
            {data.sprintLengthDays}-day sprints · {data.sprintCount} sprints · starts {data.startDate}
          </div>
        </div>
        {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 6, padding: "4px 10px", fontSize: 11 }}>{error}</div>}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ display: "flex", border: "1px solid #E5E7EB", borderRadius: 7, overflow: "hidden" }}>
            {["timeline", "list"].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "6px 14px", background: view === v ? "#2563EB" : "#fff", color: view === v ? "#fff" : "#374151", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setShowBacklog(b => !b)} style={{ ...btnSecondary, padding: "6px 12px", fontSize: 12, fontWeight: 600, background: showBacklog ? "#EFF6FF" : undefined, color: showBacklog ? "#1D4ED8" : undefined }}>
            Backlog ({(data.backlog || []).length})
          </button>
          <button onClick={() => setShowSettings(true)} style={{ ...btnSecondary, padding: "6px 10px", fontSize: 13 }}>⚙</button>
          <button onClick={() => setAddingTo({ type: "backlog" })} style={{ ...btnPrimary, padding: "6px 14px", fontSize: 12 }}>+ Project</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0 }}>
        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          {view === "timeline" ? (
            <TimelineView
              data={data}
              sprintProjects={sprintProjects}
              allProjects={allProjects}
              draggingId={draggingId}
              dragOverTarget={dragOverTarget}
              setDragOverTarget={setDragOverTarget}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDropCell={handleDropOnCell}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onMarkComplete={handleMarkComplete}
              onAddToCell={(laneId, sprintIdx) => setAddingTo({ type: "sprint", laneId, sprintIdx })}
            />
          ) : (
            <ListView
              data={data}
              sprintProjects={sprintProjects}
              allProjects={allProjects}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onMarkComplete={handleMarkComplete}
            />
          )}

          {/* Completed */}
          <div style={{ margin: "16px 16px 8px", borderTop: "1px solid #E5E7EB", paddingTop: 12 }}>
            <button onClick={() => setCompletedOpen(o => !o)}
              style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10 }}>{completedOpen ? "▼" : "▶"}</span>
              Completed ({(data.completed || []).length})
            </button>
            {completedOpen && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {(data.completed || []).map(pid => {
                  const p = allProjects[pid];
                  if (!p) return null;
                  return (
                    <div key={pid} style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 7, padding: "6px 10px", fontSize: 11 }}>
                      <span style={{ fontWeight: 600, color: "#15803D" }}>✓ {p.name}</span>
                      <button onClick={() => handleDeleteProject(pid)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 10, marginLeft: 6 }}>×</button>
                    </div>
                  );
                })}
                {(data.completed || []).length === 0 && <div style={{ fontSize: 12, color: "#9CA3AF" }}>No completed projects yet.</div>}
              </div>
            )}
          </div>
        </div>

        {/* Backlog Panel */}
        {showBacklog && (
          <BacklogPanel
            data={data}
            allProjects={allProjects}
            draggingId={draggingId}
            backlogDragIdx={backlogDragIdx}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDropOnBacklog}
            onBacklogDragStart={handleBacklogDragStart}
            onBacklogDrop={handleBacklogDrop}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onMarkComplete={handleMarkComplete}
            onAdd={() => setAddingTo({ type: "backlog" })}
          />
        )}
      </div>

      {/* Modals */}
      {(addingTo || editProject) && (
        <ProjectModal
          project={editProject || null}
          onSave={editProject ? handleUpdateEditedProject : handleSaveNewProject}
          onClose={() => { setEditProject(null); setAddingTo(null); }}
        />
      )}
      {showSettings && (
        <SettingsModal data={data} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

function TimelineView({ data, sprintProjects, allProjects, draggingId, dragOverTarget, setDragOverTarget, onDragStart, onDragEnd, onDropCell, onEdit, onDelete, onMarkComplete, onAddToCell }) {
  const sprints = Array.from({ length: data.sprintCount }, (_, i) => i);
  const CELL_W = 160;
  const LANE_LABEL_W = 140;

  return (
    <div style={{ overflowX: "auto", padding: "12px 16px" }}>
      <div style={{ minWidth: LANE_LABEL_W + data.sprintCount * CELL_W }}>
        {/* Sprint headers */}
        <div style={{ display: "flex", marginBottom: 0 }}>
          <div style={{ width: LANE_LABEL_W, flexShrink: 0 }} />
          {sprints.map(i => (
            <div key={i} style={{ width: CELL_W, flexShrink: 0, padding: "6px 8px", textAlign: "center", borderBottom: "2px solid #2563EB" }}>
              <div style={{ fontWeight: 700, fontSize: 11, color: "#2563EB" }}>Sprint {i + 1}</div>
              <div style={{ fontSize: 10, color: "#9CA3AF" }}>
                {formatDate(data.startDate, data.sprintLengthDays, i)} – {formatDate(data.startDate, data.sprintLengthDays, i + 1)}
              </div>
            </div>
          ))}
        </div>

        {/* Swimlanes */}
        {data.swimlanes.map((lane, laneIdx) => {
          // per-sprint capacity
          return (
            <div key={lane.id} style={{ display: "flex", borderBottom: "1px solid #E5E7EB", background: laneIdx % 2 === 0 ? "#fff" : "#F9FAFB" }}>
              {/* Lane label */}
              <div style={{ width: LANE_LABEL_W, flexShrink: 0, padding: "10px 8px", display: "flex", alignItems: "flex-start", borderRight: "2px solid #E5E7EB" }}>
                <span style={{ fontWeight: 700, fontSize: 11, color: "#374151", lineHeight: 1.3, writingMode: "horizontal-tb" }}>{lane.name}</span>
              </div>

              {/* Sprint cells */}
              {sprints.map(sprintIdx => {
                const cellProjects = (sprintProjects[lane.id]?.[sprintIdx] || []).map(pid => allProjects[pid]).filter(Boolean);
                const isDragOver = dragOverTarget?.laneId === lane.id && dragOverTarget?.sprintIdx === sprintIdx;
                const isFull = cellProjects.length >= 6;

                return (
                  <div
                    key={sprintIdx}
                    onDragOver={e => { if (!isFull || draggingId && cellProjects.find(p => p.id === draggingId)) { e.preventDefault(); setDragOverTarget({ laneId: lane.id, sprintIdx }); } }}
                    onDragLeave={() => setDragOverTarget(null)}
                    onDrop={e => onDropCell(e, lane.id, sprintIdx)}
                    style={{
                      width: CELL_W, flexShrink: 0, padding: "6px", borderRight: "1px solid #F3F4F6",
                      minHeight: 80, verticalAlign: "top",
                      background: isDragOver ? "#EFF6FF" : undefined,
                      transition: "background 0.15s",
                      position: "relative",
                    }}
                  >
                    {cellProjects.map(p => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        dragging={draggingId === p.id}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        compact={true}
                      />
                    ))}
                    <CapacityBar used={cellProjects.length} max={6} />
                    {!isFull && (
                      <button
                        onClick={() => onAddToCell(lane.id, sprintIdx)}
                        style={{ marginTop: 4, width: "100%", background: "none", border: "1px dashed #D1D5DB", borderRadius: 5, color: "#9CA3AF", fontSize: 10, padding: "3px 0", cursor: "pointer" }}
                      >+ add</button>
                    )}
                    {isFull && <div style={{ fontSize: 9, color: "#EF4444", textAlign: "center", marginTop: 2 }}>Full (6/6)</div>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListView({ data, sprintProjects, allProjects, onEdit, onDelete, onMarkComplete }) {
  const sprints = Array.from({ length: data.sprintCount }, (_, i) => i);

  return (
    <div style={{ padding: "12px 16px" }}>
      {sprints.map(sprintIdx => {
        const hasAny = data.swimlanes.some(lane => (sprintProjects[lane.id]?.[sprintIdx] || []).length > 0);
        if (!hasAny) return null;
        return (
          <div key={sprintIdx} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#2563EB", marginBottom: 8, paddingBottom: 4, borderBottom: "2px solid #DBEAFE" }}>
              Sprint {sprintIdx + 1} · {formatDate(data.startDate, data.sprintLengthDays, sprintIdx)} – {formatDate(data.startDate, data.sprintLengthDays, sprintIdx + 1)}
            </div>
            {data.swimlanes.map(lane => {
              const pids = sprintProjects[lane.id]?.[sprintIdx] || [];
              if (pids.length === 0) return null;
              return (
                <div key={lane.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lane.name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {pids.map(pid => {
                      const p = allProjects[pid];
                      if (!p) return null;
                      const driver = DRIVER_COLORS[p.driver] || DRIVER_COLORS["New Feature"];
                      const riceColor = RICE_COLOR(p.rice || 0);
                      return (
                        <div key={pid} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "10px 14px", minWidth: 200, maxWidth: 280 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 4 }}>{p.name}</div>
                          {p.businessValue && <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>{p.businessValue}</div>}
                          <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ background: driver.bg, color: driver.text, border: `1px solid ${driver.border}`, borderRadius: 4, padding: "2px 7px", fontSize: 10, fontWeight: 600 }}>{p.driver}</span>
                            <span style={{ background: riceColor.bg, color: riceColor.text, borderRadius: 4, padding: "2px 7px", fontSize: 10, fontWeight: 700 }}>RICE: {p.rice}</span>
                            <span style={{ background: "#F3F4F6", color: "#374151", borderRadius: 4, padding: "2px 7px", fontSize: 10 }}>{p.sprintCount} sprint{p.sprintCount !== 1 ? "s" : ""}</span>
                            {p.confluenceUrl && <a href={p.confluenceUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: "#2563EB", fontSize: 10, textDecoration: "none" }}>📄 Confluence</a>}
                          </div>
                          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                            <button onClick={() => onEdit(p)} style={{ ...btnSecondary, padding: "3px 8px", fontSize: 10 }}>Edit</button>
                            <button onClick={() => onMarkComplete(pid)} style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#15803D", borderRadius: 5, padding: "3px 8px", fontSize: 10, cursor: "pointer" }}>✓ Done</button>
                            <button onClick={() => onDelete(pid)} style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 5, padding: "3px 8px", fontSize: 10, cursor: "pointer" }}>Delete</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function BacklogPanel({ data, allProjects, draggingId, backlogDragIdx, onDragStart, onDragEnd, onDrop, onBacklogDragStart, onBacklogDrop, onEdit, onDelete, onMarkComplete, onAdd }) {
  const backlog = data.backlog || [];

  return (
    <div
      style={{ width: 220, flexShrink: 0, background: "#fff", borderLeft: "1px solid #E5E7EB", minHeight: "60vh", display: "flex", flexDirection: "column" }}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
    >
      <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: 12, color: "#374151" }}>Backlog ({backlog.length})</span>
        <button onClick={onAdd} style={{ ...btnPrimary, padding: "4px 10px", fontSize: 11 }}>+ Add</button>
      </div>
      <div style={{ padding: 8, flex: 1, overflowY: "auto" }}>
        {backlog.length === 0 && (
          <div style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", padding: "20px 8px" }}>
            Drop projects here or click + Add
          </div>
        )}
        {backlog.map((pid, idx) => {
          const p = allProjects[pid];
          if (!p) return null;
          return (
            <div
              key={pid}
              draggable
              onDragStart={e => { onBacklogDragStart(e, idx); onDragStart(e, pid); }}
              onDragEnd={onDragEnd}
              onDragOver={e => e.preventDefault()}
              onDrop={e => onBacklogDrop(e, idx)}
              style={{ opacity: draggingId === pid ? 0.4 : 1, borderTop: backlogDragIdx !== null && backlogDragIdx !== idx ? "1px dashed #BFDBFE" : undefined }}
            >
              <div style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 7, padding: "6px 8px", marginBottom: 4, cursor: "grab" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 11, color: "#111827", lineHeight: 1.3, flex: 1 }}>
                    <span style={{ color: "#9CA3AF", marginRight: 4 }}>#{idx + 1}</span>
                    {p.name}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ background: RICE_COLOR(p.rice || 0).bg, color: RICE_COLOR(p.rice || 0).text, borderRadius: 4, padding: "1px 5px", fontSize: 9, fontWeight: 700 }}>R:{p.rice || 0}</span>
                  <span style={{ background: DRIVER_COLORS[p.driver]?.bg || "#F0FDF4", color: DRIVER_COLORS[p.driver]?.text || "#15803D", borderRadius: 4, padding: "1px 5px", fontSize: 9, fontWeight: 600 }}>
                    {p.driver === "Customer Maintain" ? "CM" : "NF"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                  <button onClick={() => onEdit(p)} style={{ flex: 1, ...btnSecondary, padding: "2px 0", fontSize: 9, textAlign: "center" }}>Edit</button>
                  <button onClick={() => onMarkComplete(pid)} style={{ flex: 1, background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#15803D", borderRadius: 4, padding: "2px 0", fontSize: 9, cursor: "pointer" }}>Done</button>
                  <button onClick={() => onDelete(pid)} style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 4, padding: "2px 5px", fontSize: 9, cursor: "pointer" }}>×</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
