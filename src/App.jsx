import { useState, useEffect, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ftwdycuopzfiledwceme.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0d2R5Y3VvcHpmaWxlZHdjZW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzgwNTIsImV4cCI6MjA5MzE1NDA1Mn0.ls5B-0rU_uSXdSZH8sX8ZXaU8gCneZ-BYLrd8tXV1Sg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ── Aline Design Tokens ──────────────────────────────────────── */
const A = {
  sidebar:     "#14273D",
  interactive: "#337AB8",
  textOnDark:  "#E2E8F0",
  canvas:      "#FFFFFF",
  card:        "#FFFFFF",
  borderCard:  "#E2E8F0",
  textPrimary: "#14273D",
  textSecond:  "#64748B",
  textLink:    "#337AB8",
  shadowCard:  "0 1px 3px rgba(0,0,0,0.08)",
  font:        "'DM Sans', Arial, sans-serif",
  statusGood:  "#22C55E",
  statusLate:  "#F97316",
  statusCrit:  "#EF4444",
};

const DRIVER_COLORS = {
  "New Feature":       { bg: "#EBF4FB", text: "#1A5C8A", border: "#A8D0EF" },
  "Customer Maintain": { bg: "#EDFAF0", text: "#1A5C2A", border: "#A8D8A8" },
};

const RICE_COLOR = (s) =>
  s >= 80 ? { bg: "#EDFAF0", text: "#15803D" }
  : s >= 50 ? { bg: "#FFFBEB", text: "#92400E" }
  : { bg: "#FFF4ED", text: "#C2410C" };

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

/* ── Style helpers ────────────────────────────────────────────── */
const labelSt = { display:"flex", flexDirection:"column", gap:4, fontSize:13, color:A.textPrimary, fontWeight:600, fontFamily:A.font };
const inputSt = { padding:"8px 10px", border:`1px solid ${A.borderCard}`, borderRadius:6, fontSize:13, color:A.textPrimary, background:A.canvas, outline:"none", fontFamily:A.font };
const btnP  = { padding:"8px 18px", background:A.interactive, color:"#fff", border:"none", borderRadius:6, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:A.font };
const btnS  = { padding:"8px 18px", background:A.canvas, color:A.interactive, border:`1px solid ${A.interactive}`, borderRadius:6, fontSize:13, cursor:"pointer", fontFamily:A.font };
const btnG  = { padding:"6px 14px", background:A.canvas, color:A.textPrimary, border:`1px solid ${A.borderCard}`, borderRadius:6, fontSize:13, cursor:"pointer", fontFamily:A.font };

/* ── Capacity bar ─────────────────────────────────────────────── */
function CapBar({ used, max }) {
  const pct = Math.min(1, used / max);
  const color = pct >= 1 ? A.statusCrit : pct >= 0.75 ? A.statusLate : A.statusGood;
  return (
    <div style={{ height:3, background:A.borderCard, borderRadius:2, marginTop:4, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${pct*100}%`, background:color, borderRadius:2, transition:"width 0.3s" }} />
    </div>
  );
}

/* ── Gantt bar ────────────────────────────────────────────────── */
function GanttBar({ project, sprintCount, onEdit, onDelete, dragging, onDragStart, onDragEnd }) {
  const spanCols = Math.min(project.sprintCount || 1, sprintCount - (project.sprintIdx || 0));
  const c = DRIVER_COLORS[project.driver] || DRIVER_COLORS["New Feature"];
  const rc = RICE_COLOR(project.rice || 0);
  return (
    <div draggable
      onDragStart={e => { e.stopPropagation(); onDragStart(e, project.id); }}
      onDragEnd={onDragEnd}
      style={{ width:"100%", background:c.bg, border:`1.5px solid ${c.border}`, borderRadius:6, padding:"6px 8px", marginBottom:2, cursor:"grab", opacity:dragging?0.4:1, boxSizing:"border-box", overflow:"hidden", boxShadow:A.shadowCard, fontFamily:A.font }}
    >
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:4 }}>
        <span style={{ fontWeight:600, fontSize:12, color:A.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{project.name}</span>
        <div style={{ display:"flex", gap:2, flexShrink:0 }}>
          <button type="button" onClick={e=>{e.stopPropagation();onEdit(project);}} style={{ background:"none",border:"none",cursor:"pointer",padding:"1px 3px",color:A.textSecond,fontSize:11 }}>✎</button>
          <button type="button" onClick={e=>{e.stopPropagation();onDelete(project.id);}} style={{ background:"none",border:"none",cursor:"pointer",padding:"1px 3px",color:A.statusCrit,fontSize:11 }}>×</button>
        </div>
      </div>
      <div style={{ display:"flex", gap:4, marginTop:4, alignItems:"center", flexWrap:"wrap" }}>
        <span style={{ background:c.bg, color:c.text, borderRadius:4, padding:"1px 6px", fontSize:10, fontWeight:600, border:`1px solid ${c.border}` }}>{project.driver==="Customer Maintain"?"CM":"NF"}</span>
        <span style={{ background:rc.bg, color:rc.text, borderRadius:4, padding:"1px 6px", fontSize:10, fontWeight:700 }}>S:{project.rice||0}</span>
        <span style={{ background:"#F1F5F9", color:A.textSecond, borderRadius:4, padding:"1px 6px", fontSize:10 }}>{spanCols}sp</span>
        {project.confluenceUrl && <a href={project.confluenceUrl} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ color:A.textLink, fontSize:10, textDecoration:"none" }}>🔗</a>}
      </div>
      {project.businessValue && spanCols>1 && (
        <div style={{ fontSize:10, color:A.textSecond, marginTop:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{project.businessValue}</div>
      )}
    </div>
  );
}

/* ── Row-packing ──────────────────────────────────────────────── */
function buildRows(allProjects, laneId, total) {
  const placed = Object.values(allProjects).filter(p => p.laneId===laneId && p.sprintIdx!=null);
  placed.sort((a,b)=>(a.sprintIdx||0)-(b.sprintIdx||0));
  const rows = [];
  placed.forEach(proj => {
    const s=proj.sprintIdx||0, span=Math.min(proj.sprintCount||1,total-s), e=s+span-1;
    let ok=false;
    for(const row of rows){ const last=row[row.length-1]; const le=(last.sprintIdx||0)+Math.min(last.sprintCount||1,total-(last.sprintIdx||0))-1; if(s>le){row.push(proj);ok=true;break;} }
    if(!ok) rows.push([proj]);
  });
  return rows;
}

/* ── Project modal ────────────────────────────────────────────── */
function ProjectModal({ project, onSave, onClose }) {
  const [form, setForm] = useState(project || { id:genId(), name:"", businessValue:"", rice:50, sprintCount:1, driver:"New Feature", confluenceUrl:"" });
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=e=>{e.preventDefault();e.stopPropagation();if(form.name)onSave(form);};
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(20,39,61,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }} onClick={e=>e.stopPropagation()}>
      <div style={{ background:A.canvas,borderRadius:8,padding:28,width:440,maxWidth:"92vw",boxShadow:"0 8px 40px rgba(20,39,61,0.2)",fontFamily:A.font }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
          <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:A.textPrimary }}>{project?"Edit initiative":"Add initiative"}</h3>
          <button type="button" onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",fontSize:20,color:A.textSecond,lineHeight:1 }}>×</button>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <label style={labelSt}>Initiative title *<input value={form.name} onChange={e=>set("name",e.target.value)} style={inputSt} placeholder="Initiative title" /></label>
          <label style={labelSt}>Initiative description<textarea value={form.businessValue} onChange={e=>set("businessValue",e.target.value)} style={{...inputSt,height:64,resize:"vertical"}} placeholder="Why this matters..." /></label>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <label style={labelSt}>Score<input type="number" value={form.rice} onChange={e=>set("rice",+e.target.value)} style={inputSt} min={0} max={200} /></label>
            <label style={labelSt}>Sprint count<input type="number" value={form.sprintCount} onChange={e=>set("sprintCount",+e.target.value)} style={inputSt} min={1} max={20} /></label>
          </div>
          <label style={labelSt}>Driver<select value={form.driver} onChange={e=>set("driver",e.target.value)} style={inputSt}><option>New Feature</option><option>Customer Maintain</option></select></label>
          <label style={labelSt}>Confluence URL<input value={form.confluenceUrl} onChange={e=>set("confluenceUrl",e.target.value)} style={inputSt} placeholder="https://..." /></label>
        </div>
        <div style={{ display:"flex",gap:10,marginTop:24,justifyContent:"flex-end" }}>
          <button type="button" onClick={onClose} style={btnS}>Cancel</button>
          <button type="button" onClick={save} style={{...btnP,opacity:form.name?1:0.5}} disabled={!form.name}>{project?"Save changes":"Add initiative"}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Settings modal ───────────────────────────────────────────── */
function SettingsModal({ data, onSave, onClose }) {
  const [sprintLen,setSprintLen]=useState(data.sprintLengthDays);
  const [sprintCount,setSprintCount]=useState(data.sprintCount);
  const [startDate,setStartDate]=useState(data.startDate);
  const [lanes,setLanes]=useState(data.swimlanes.map(l=>({...l})));
  const [newLane,setNewLane]=useState("");
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(20,39,61,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
      <div style={{ background:A.canvas,borderRadius:8,padding:28,width:460,maxWidth:"92vw",boxShadow:"0 8px 40px rgba(20,39,61,0.2)",fontFamily:A.font }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
          <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:A.textPrimary }}>Roadmap settings</h3>
          <button type="button" onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",fontSize:20,color:A.textSecond }}>×</button>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <label style={labelSt}>Sprint length (days)<input type="number" value={sprintLen} onChange={e=>setSprintLen(+e.target.value)} style={inputSt} min={1} max={60}/></label>
            <label style={labelSt}>Number of sprints<input type="number" value={sprintCount} onChange={e=>setSprintCount(+e.target.value)} style={inputSt} min={1} max={24}/></label>
          </div>
          <label style={labelSt}>Start date<input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={inputSt}/></label>
          <div>
            <div style={{ fontSize:13,color:A.textPrimary,fontWeight:600,marginBottom:8 }}>Swimlanes</div>
            {lanes.map((lane,i)=>(
              <div key={lane.id} style={{ display:"flex",gap:8,marginBottom:8,alignItems:"center" }}>
                <input value={lane.name} onChange={e=>{const l=[...lanes];l[i].name=e.target.value;setLanes(l);}} style={{...inputSt,flex:1}}/>
                <button type="button" onClick={()=>setLanes(lanes.filter((_,j)=>j!==i))} style={{...btnG,padding:"7px 12px",color:A.statusCrit}}>×</button>
              </div>
            ))}
            <div style={{ display:"flex",gap:8 }}>
              <input value={newLane} onChange={e=>setNewLane(e.target.value)} placeholder="New lane name..." style={{...inputSt,flex:1}}/>
              <button type="button" onClick={()=>{if(newLane.trim()){setLanes([...lanes,{id:genId(),name:newLane.trim()}]);setNewLane("");}}} style={btnS}>Add</button>
            </div>
          </div>
        </div>
        <div style={{ display:"flex",gap:10,marginTop:24,justifyContent:"flex-end" }}>
          <button type="button" onClick={onClose} style={btnS}>Cancel</button>
          <button type="button" onClick={()=>onSave({sprintLengthDays:sprintLen,sprintCount,startDate,swimlanes:lanes})} style={btnP}>Save settings</button>
        </div>
      </div>
    </div>
  );
}

/* ── Timeline view ────────────────────────────────────────────── */
function TimelineView({ data, allProjects, draggingId, dragOverTarget, setDragOverTarget, onDragStart, onDragEnd, onDropCell, onEdit, onDelete, onAddToCell }) {
  const sprints=Array.from({length:data.sprintCount},(_,i)=>i);
  const CW=180, LW=160;
  const colStyle = { width:CW, minWidth:CW, maxWidth:CW, flexShrink:0, flexGrow:0, boxSizing:"border-box" };
  return (
    <div style={{ overflowX:"auto", padding:"0 24px 24px" }}>
      <div style={{ minWidth:LW+data.sprintCount*CW }}>
        {/* Header */}
        <div style={{ display:"flex", position:"sticky", top:0, zIndex:10, background:A.canvas }}>
          <div style={{ width:LW, minWidth:LW, maxWidth:LW, flexShrink:0, boxSizing:"border-box", borderBottom:`2px solid ${A.interactive}` }}/>
          {sprints.map(i=>(
            <div key={i} style={{ ...colStyle, padding:"10px 8px", textAlign:"center", borderBottom:`2px solid ${A.interactive}`, borderLeft:`1px solid ${A.borderCard}`, background:A.canvas }}>
              <div style={{ fontWeight:600, fontSize:12, color:A.interactive, fontFamily:A.font }}>Sprint {i+1}</div>
              <div style={{ fontSize:11, color:A.textSecond, marginTop:2, fontFamily:A.font }}>{formatDate(data.startDate,data.sprintLengthDays,i)} – {formatDate(data.startDate,data.sprintLengthDays,i+1)}</div>
            </div>
          ))}
        </div>
        {/* Lanes */}
        {data.swimlanes.map((lane,li)=>{
          const rows=buildRows(allProjects,lane.id,data.sprintCount);
          const cap={};
          sprints.forEach(si=>{ cap[si]=Object.values(allProjects).filter(p=>p.laneId===lane.id&&p.sprintIdx===si).length; });
          const active=Object.values(allProjects).filter(p=>p.laneId===lane.id&&p.sprintIdx!=null).length;
          return (
            <div key={lane.id} style={{ display:"flex", borderBottom:`1px solid ${A.borderCard}`, background:li%2===0?A.canvas:"#F8FAFC" }}>
              <div style={{ width:LW, minWidth:LW, maxWidth:LW, flexShrink:0, boxSizing:"border-box", padding:"14px 12px", borderRight:`2px solid ${A.interactive}`, display:"flex", flexDirection:"column" }}>
                <span style={{ fontWeight:600, fontSize:13, color:A.textPrimary, fontFamily:A.font, lineHeight:1.3 }}>{lane.name}</span>
                <span style={{ fontSize:11, color:A.textSecond, marginTop:3, fontFamily:A.font }}>{active} active</span>
              </div>
              <div style={{ flex:1, position:"relative", minHeight:64 }}>
                {/* Drop grid */}
                <div style={{ display:"flex", position:"absolute", inset:0, zIndex:0 }}>
                  {sprints.map(si=>{
                    const over=dragOverTarget?.laneId===lane.id&&dragOverTarget?.sprintIdx===si;
                    return <div key={si} onDragOver={e=>{e.preventDefault();setDragOverTarget({laneId:lane.id,sprintIdx:si});}} onDragLeave={()=>setDragOverTarget(null)} onDrop={e=>onDropCell(e,lane.id,si)} style={{ ...colStyle, height:"100%", borderLeft:`1px solid ${A.borderCard}`, background:over?"rgba(51,122,184,0.08)":"transparent", transition:"background 0.15s" }}/>;
                  })}
                </div>
                {/* Bars */}
                <div style={{ position:"relative", zIndex:1, paddingTop:8, paddingBottom:4 }}>
                  {rows.length===0&&<div style={{height:20}}/>}
                  {rows.map((row,ri)=>{
                    const items=[]; let cursor=0;
                    row.forEach(proj=>{
                      const s=proj.sprintIdx||0, span=Math.min(proj.sprintCount||1,data.sprintCount-s);
                      if(s>cursor) items.push(<div key={`sp-${proj.id}`} style={{width:(s-cursor)*CW,flexShrink:0}}/>);
                      items.push(<div key={proj.id} style={{width:span*CW,flexShrink:0,paddingLeft:4,paddingRight:4,boxSizing:"border-box"}}><GanttBar project={proj} sprintCount={data.sprintCount} onEdit={onEdit} onDelete={onDelete} dragging={draggingId===proj.id} onDragStart={onDragStart} onDragEnd={onDragEnd}/></div>);
                      cursor=s+span;
                    });
                    return <div key={ri} style={{display:"flex",alignItems:"flex-start",marginBottom:2}}>{items}</div>;
                  })}
                  {/* Capacity row */}
                  <div style={{ display:"flex", borderTop:`1px dashed ${A.borderCard}`, marginTop:4 }}>
                    {sprints.map(si=>{
                      const count=cap[si]||0, full=count>=6;
                      return (
                        <div key={si} style={{width:CW,minWidth:CW,maxWidth:CW,flexShrink:0,boxSizing:"border-box",padding:"3px 4px",borderLeft:`1px solid ${A.borderCard}`}}>
                          <CapBar used={count} max={6}/>
                          {!full
                            ?<button type="button" onClick={()=>onAddToCell(lane.id,si)} style={{marginTop:3,width:"100%",background:"none",border:`1px dashed ${A.borderCard}`,borderRadius:4,color:A.textSecond,fontSize:10,padding:"2px 0",cursor:"pointer",fontFamily:A.font}}>+ add</button>
                            :<div style={{fontSize:9,color:A.statusCrit,textAlign:"center",marginTop:3,fontFamily:A.font}}>Full</div>
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── List view ────────────────────────────────────────────────── */
function ListView({ data, allProjects, onEdit, onDelete, onMarkComplete }) {
  const sprints=Array.from({length:data.sprintCount},(_,i)=>i);
  return (
    <div style={{ padding:"0 24px 24px", fontFamily:A.font }}>
      {sprints.map(si=>{
        const lp=data.swimlanes.map(lane=>({lane,projects:Object.values(allProjects).filter(p=>p.laneId===lane.id&&p.sprintIdx===si)})).filter(({projects})=>projects.length>0);
        if(!lp.length) return null;
        return (
          <div key={si} style={{marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,paddingBottom:8,borderBottom:`2px solid ${A.interactive}`}}>
              <span style={{fontWeight:700,fontSize:14,color:A.interactive}}>Sprint {si+1}</span>
              <span style={{fontSize:12,color:A.textSecond}}>{formatDate(data.startDate,data.sprintLengthDays,si)} – {formatDate(data.startDate,data.sprintLengthDays,si+1)}</span>
            </div>
            {lp.map(({lane,projects})=>(
              <div key={lane.id} style={{marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:600,color:A.textSecond,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{lane.name}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
                  {projects.map(p=>{
                    const c=DRIVER_COLORS[p.driver]||DRIVER_COLORS["New Feature"];
                    const rc=RICE_COLOR(p.rice||0);
                    return (
                      <div key={p.id} style={{background:A.card,border:`1px solid ${A.borderCard}`,borderRadius:8,padding:"14px 16px",minWidth:220,maxWidth:300,boxShadow:A.shadowCard}}>
                        <div style={{fontWeight:600,fontSize:14,color:A.textPrimary,marginBottom:4}}>{p.name}</div>
                        {p.businessValue&&<div style={{fontSize:12,color:A.textSecond,marginBottom:10,lineHeight:1.4}}>{p.businessValue}</div>}
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginBottom:12}}>
                          <span style={{background:c.bg,color:c.text,border:`1px solid ${c.border}`,borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:600}}>{p.driver}</span>
                          <span style={{background:rc.bg,color:rc.text,borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:700}}>Score: {p.rice}</span>
                          <span style={{background:"#F1F5F9",color:A.textSecond,borderRadius:4,padding:"2px 8px",fontSize:11}}>{p.sprintCount} sprint{p.sprintCount!==1?"s":""}</span>
                          {p.confluenceUrl&&<a href={p.confluenceUrl} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{color:A.textLink,fontSize:11,textDecoration:"none",fontWeight:600}}>📄 Confluence</a>}
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button type="button" onClick={()=>onEdit(p)} style={{...btnS,padding:"4px 10px",fontSize:11}}>Edit</button>
                          <button type="button" onClick={()=>onMarkComplete(p.id)} style={{background:"#F0FDF4",border:"1px solid #BBF7D0",color:"#15803D",borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>✓ Done</button>
                          <button type="button" onClick={()=>onDelete(p.id)} style={{background:"#FEF2F2",border:"1px solid #FECACA",color:A.statusCrit,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ── Backlog panel ────────────────────────────────────────────── */
function BacklogPanel({ data, allProjects, draggingId, backlogDragIdx, onDragStart, onDragEnd, onDrop, onBacklogDragStart, onBacklogDrop, onEdit, onDelete, onMarkComplete, onAdd }) {
  const backlog=data.backlog||[];
  return (
    <div style={{width:232,flexShrink:0,background:A.canvas,borderLeft:`1px solid ${A.borderCard}`,display:"flex",flexDirection:"column",fontFamily:A.font}} onDragOver={e=>e.preventDefault()} onDrop={onDrop}>
      <div style={{padding:"14px 14px 10px",borderBottom:`1px solid ${A.borderCard}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:"#F8FAFC"}}>
        <span style={{fontWeight:600,fontSize:13,color:A.textPrimary}}>Backlog ({backlog.length})</span>
        <button type="button" onClick={onAdd} style={{...btnP,padding:"5px 12px",fontSize:12}}>+ Add</button>
      </div>
      <div style={{padding:10,flex:1,overflowY:"auto"}}>
        {backlog.length===0&&<div style={{textAlign:"center",padding:"24px 10px",color:A.textSecond,fontSize:12}}>Drop initiatives here or click + Add</div>}
        {backlog.map((pid,idx)=>{
          const p=allProjects[pid]; if(!p) return null;
          const c=DRIVER_COLORS[p.driver]||DRIVER_COLORS["New Feature"];
          return (
            <div key={pid} draggable onDragStart={e=>{onBacklogDragStart(e,idx);onDragStart(e,pid);}} onDragEnd={onDragEnd} onDragOver={e=>e.preventDefault()} onDrop={e=>onBacklogDrop(e,idx)}
              style={{opacity:draggingId===pid?0.4:1,borderTop:backlogDragIdx!==null&&backlogDragIdx!==idx?`2px dashed ${A.interactive}`:undefined}}>
              <div style={{background:"#F8FAFC",border:`1px solid ${A.borderCard}`,borderRadius:6,padding:"8px 10px",marginBottom:6,cursor:"grab",boxShadow:A.shadowCard}}>
                <div style={{fontWeight:600,fontSize:12,color:A.textPrimary,lineHeight:1.3,marginBottom:4}}>
                  <span style={{color:A.textSecond,marginRight:4,fontSize:11}}>#{idx+1}</span>{p.name}
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                  <span style={{background:RICE_COLOR(p.rice||0).bg,color:RICE_COLOR(p.rice||0).text,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>S:{p.rice||0}</span>
                  <span style={{background:c.bg,color:c.text,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:600,border:`1px solid ${c.border}`}}>{p.driver==="Customer Maintain"?"CM":"NF"}</span>
                  <span style={{background:"#F1F5F9",color:A.textSecond,borderRadius:4,padding:"1px 6px",fontSize:10}}>{p.sprintCount||1}sp</span>
                </div>
                <div style={{display:"flex",gap:5}}>
                  <button type="button" onClick={()=>onEdit(p)} style={{flex:1,...btnS,padding:"3px 0",fontSize:10,textAlign:"center"}}>Edit</button>
                  <button type="button" onClick={()=>onMarkComplete(pid)} style={{flex:1,background:"#F0FDF4",border:"1px solid #BBF7D0",color:"#15803D",borderRadius:6,padding:"3px 0",fontSize:10,cursor:"pointer"}}>Done</button>
                  <button type="button" onClick={()=>onDelete(pid)} style={{background:"#FEF2F2",border:"1px solid #FECACA",color:A.statusCrit,borderRadius:6,padding:"3px 8px",fontSize:10,cursor:"pointer"}}>×</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Root App ─────────────────────────────────────────────────── */
export default function App() {
  const [data,setData]=useState(null);
  const [view,setView]=useState("timeline");
  const [showBacklog,setShowBacklog]=useState(true);
  const [editProject,setEditProject]=useState(null);
  const [addingTo,setAddingTo]=useState(null);
  const [showSettings,setShowSettings]=useState(false);
  const [draggingId,setDraggingId]=useState(null);
  const [dragOverTarget,setDragOverTarget]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [backlogDragIdx,setBacklogDragIdx]=useState(null);
  const [completedOpen,setCompletedOpen]=useState(false);

  useEffect(()=>{
    (async()=>{
      try {
        const {data:rows,error:err}=await supabase.from("roadmap_state").select("*").eq("key","main").single();
        if(err&&err.code!=="PGRST116") throw err;
        setData(rows?.value||defaultData());
      } catch(e) {
        console.error(e);
        setData(defaultData());
        setError("Could not connect to Supabase — using local state.");
      }
      setLoading(false);
    })();
  },[]);

  const updateData=useCallback(updater=>{
    setData(prev=>{
      const next=updater(prev);
      (async()=>{ try{ await supabase.from("roadmap_state").upsert({key:"main",value:next},{onConflict:"key"}); }catch(e){console.error(e);} })();
      return next;
    });
  },[]);

  const handleSaveNew=proj=>{
    updateData(d=>{
      if(addingTo?.type==="sprint") return {...d,projects:{...(d.projects||{}),[proj.id]:{...proj,laneId:addingTo.laneId,sprintIdx:addingTo.sprintIdx}}};
      return {...d,projects:{...(d.projects||{}),[proj.id]:proj},backlog:[...(d.backlog||[]),proj.id]};
    });
    setAddingTo(null);
  };

  const handleUpdateProject=proj=>{
    updateData(d=>({...d,projects:{...d.projects,[proj.id]:{...d.projects[proj.id],...proj}}}));
    setEditProject(null);
  };

  const handleDelete=pid=>{
    updateData(d=>{ const p={...d.projects}; delete p[pid]; return {...d,projects:p,backlog:(d.backlog||[]).filter(id=>id!==pid),completed:(d.completed||[]).filter(id=>id!==pid)}; });
  };

  const handleComplete=pid=>{
    updateData(d=>{
      const proj=d.projects[pid]; if(!proj) return d;
      return {...d,projects:{...d.projects,[pid]:{...proj,laneId:undefined,sprintIdx:undefined}},completed:[...(d.completed||[]),pid],backlog:(d.backlog||[]).filter(id=>id!==pid)};
    });
  };

  const handleDropCell=(e,laneId,sprintIdx)=>{
    e.preventDefault();
    const pid=e.dataTransfer.getData("pid"); if(!pid) return;
    updateData(d=>{
      const count=Object.values(d.projects||{}).filter(p=>p.laneId===laneId&&p.sprintIdx===sprintIdx).length;
      if(count>=6) return d;
      const proj=d.projects[pid]; if(!proj) return d;
      return {...d,projects:{...d.projects,[pid]:{...proj,laneId,sprintIdx}},backlog:(d.backlog||[]).filter(id=>id!==pid),completed:(d.completed||[]).filter(id=>id!==pid)};
    });
    setDragOverTarget(null); setDraggingId(null);
  };

  const handleDropBacklog=e=>{
    e.preventDefault();
    const pid=e.dataTransfer.getData("pid"); if(!pid) return;
    updateData(d=>{ const proj=d.projects[pid]; if(!proj) return d; const bl=d.backlog?.includes(pid)?d.backlog:[...(d.backlog||[]),pid]; return {...d,projects:{...d.projects,[pid]:{...proj,laneId:undefined,sprintIdx:undefined}},backlog:bl}; });
    setDraggingId(null);
  };

  const handleBacklogDragStart=(e,idx)=>{ setBacklogDragIdx(idx); e.dataTransfer.setData("backlogIdx",idx); };
  const handleBacklogDrop=(e,ti)=>{ e.preventDefault(); const fi=parseInt(e.dataTransfer.getData("backlogIdx")); if(isNaN(fi)||fi===ti) return; updateData(d=>{ const bl=[...(d.backlog||[])]; const [r]=bl.splice(fi,1); bl.splice(ti,0,r); return {...d,backlog:bl}; }); setBacklogDragIdx(null); };

  const dragStart=(e,pid)=>{ e.dataTransfer.setData("pid",pid); setDraggingId(pid); };
  const dragEnd=()=>{ setDraggingId(null); setDragOverTarget(null); };

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:A.font,color:A.textSecond}}>Loading roadmap...</div>;
  if(!data) return null;

  const allProjects=data.projects||{};

  return (
    <div style={{fontFamily:A.font,background:A.canvas,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* Global header */}
      <div style={{background:A.sidebar,height:48,display:"flex",alignItems:"center",padding:"0 20px",gap:12,flexShrink:0}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,6px)",gap:3}}>
          {Array(9).fill(0).map((_,i)=><div key={i} style={{width:6,height:6,background:A.textOnDark,borderRadius:1,opacity:0.6}}/>)}
        </div>
        <span style={{color:A.textOnDark,fontWeight:700,fontSize:15,letterSpacing:"-0.2px"}}>Aline</span>
        <div style={{flex:1}}/>
        <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.1)",borderRadius:20,padding:"4px 14px",cursor:"pointer"}}>
          <span style={{fontSize:12,color:A.textOnDark}}>🏠 Product Roadmap</span>
          <span style={{fontSize:10,color:A.textOnDark,opacity:0.6}}>▼</span>
        </div>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* Sidebar */}
        <div style={{width:220,background:A.sidebar,flexShrink:0,display:"flex",flexDirection:"column"}}>
          <div style={{padding:"12px 10px 8px"}}>
            <div style={{background:"rgba(255,255,255,0.08)",borderRadius:6,padding:"8px 10px",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
              <span style={{fontSize:12}}>⊞</span>
              <span style={{fontSize:12,color:A.textOnDark}}>All Communities</span>
              <span style={{fontSize:10,color:A.textOnDark,opacity:0.5,marginLeft:"auto"}}>▼</span>
            </div>
          </div>

          <nav style={{padding:"6px 0",flex:1}}>
            {[{label:"Roadmap",icon:"◈",active:true},{label:"Backlog",icon:"☰",active:false},{label:"Completed",icon:"✓",active:false}].map(item=>(
              <div key={item.label}
                onClick={()=>{ if(item.label==="Backlog") setShowBacklog(b=>!b); if(item.label==="Completed") setCompletedOpen(o=>!o); }}
                style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",cursor:"pointer",background:item.active?A.interactive:"transparent",borderRadius:item.active?6:0,margin:item.active?"2px 8px":"2px 0"}}>
                <span style={{fontSize:14,color:A.textOnDark,opacity:item.active?1:0.7}}>{item.icon}</span>
                <span style={{fontSize:14,fontWeight:item.active?600:400,color:A.textOnDark,opacity:item.active?1:0.85}}>{item.label}</span>
              </div>
            ))}

            <div style={{margin:"14px 14px 6px",fontSize:11,color:A.textOnDark,opacity:0.45,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em"}}>Swimlanes</div>
            {data.swimlanes.map(lane=>(
              <div key={lane.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 14px"}}>
                <div style={{width:6,height:6,background:A.interactive,borderRadius:"50%",flexShrink:0}}/>
                <span style={{fontSize:12,color:A.textOnDark,opacity:0.8}}>{lane.name}</span>
              </div>
            ))}
          </nav>

          <div style={{padding:"10px 8px",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
            <button type="button" onClick={()=>setShowSettings(true)}
              style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"none",borderRadius:6,padding:"8px 12px",color:A.textOnDark,fontSize:12,cursor:"pointer",textAlign:"left",fontFamily:A.font,display:"flex",alignItems:"center",gap:8}}>
              ⚙ Settings
            </button>
          </div>
        </div>

        {/* Main */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* Page header */}
          <div style={{background:A.canvas,borderBottom:`1px solid ${A.borderCard}`,padding:"16px 24px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",flexShrink:0}}>
            <div style={{flex:1}}>
              <h1 style={{margin:0,fontSize:22,fontWeight:700,color:A.textPrimary,lineHeight:1.1,fontFamily:A.font}}>Product Roadmap</h1>
              <div style={{fontSize:12,color:A.textSecond,marginTop:3,fontFamily:A.font}}>{data.sprintLengthDays}-day sprints · {data.sprintCount} sprints · starts {data.startDate}</div>
            </div>
            {error&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",color:A.statusCrit,borderRadius:6,padding:"5px 12px",fontSize:11}}>{error}</div>}
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{display:"flex",border:`1px solid ${A.borderCard}`,borderRadius:6,overflow:"hidden"}}>
                {["timeline","list"].map(v=>(
                  <button key={v} type="button" onClick={()=>setView(v)}
                    style={{padding:"6px 16px",background:view===v?A.interactive:A.canvas,color:view===v?"#fff":A.textPrimary,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:A.font}}>
                    {v.charAt(0).toUpperCase()+v.slice(1)}
                  </button>
                ))}
              </div>
              <button type="button" onClick={()=>setShowBacklog(b=>!b)}
                style={{...btnG,fontSize:12,fontWeight:600,background:showBacklog?"#EBF4FB":A.canvas,color:showBacklog?A.interactive:A.textPrimary,borderColor:showBacklog?A.interactive:A.borderCard}}>
                Backlog ({(data.backlog||[]).length})
              </button>
              <button type="button" onClick={()=>setAddingTo({type:"backlog"})} style={{...btnP,fontSize:12}}>+ Initiative</button>
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
            <div style={{flex:1}}>
              {view==="timeline"
                ?<TimelineView data={data} allProjects={allProjects} draggingId={draggingId} dragOverTarget={dragOverTarget} setDragOverTarget={setDragOverTarget} onDragStart={dragStart} onDragEnd={dragEnd} onDropCell={handleDropCell} onEdit={setEditProject} onDelete={handleDelete} onAddToCell={(laneId,si)=>setAddingTo({type:"sprint",laneId,sprintIdx:si})}/>
                :<ListView data={data} allProjects={allProjects} onEdit={setEditProject} onDelete={handleDelete} onMarkComplete={handleComplete}/>
              }
            </div>

            {/* Completed */}
            <div style={{margin:"0 24px 20px",borderTop:`1px solid ${A.borderCard}`,paddingTop:14}}>
              <button type="button" onClick={()=>setCompletedOpen(o=>!o)}
                style={{background:"none",border:"none",cursor:"pointer",fontWeight:600,fontSize:13,color:A.textPrimary,display:"flex",alignItems:"center",gap:8,fontFamily:A.font,padding:0}}>
                <span style={{fontSize:10,color:A.textSecond}}>{completedOpen?"▼":"▶"}</span>
                Completed ({(data.completed||[]).length})
              </button>
              {completedOpen&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10}}>
                  {(data.completed||[]).map(pid=>{
                    const p=allProjects[pid]; if(!p) return null;
                    return (
                      <div key={pid} style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:6,padding:"6px 12px",fontSize:12,display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontWeight:600,color:"#15803D"}}>✓ {p.name}</span>
                        <button type="button" onClick={()=>handleDelete(pid)} style={{background:"none",border:"none",color:A.statusCrit,cursor:"pointer",fontSize:12}}>×</button>
                      </div>
                    );
                  })}
                  {!(data.completed||[]).length&&<div style={{fontSize:12,color:A.textSecond}}>No completed initiatives yet.</div>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Backlog panel */}
        {showBacklog&&(
          <BacklogPanel data={data} allProjects={allProjects} draggingId={draggingId} backlogDragIdx={backlogDragIdx}
            onDragStart={dragStart} onDragEnd={dragEnd} onDrop={handleDropBacklog}
            onBacklogDragStart={handleBacklogDragStart} onBacklogDrop={handleBacklogDrop}
            onEdit={setEditProject} onDelete={handleDelete} onMarkComplete={handleComplete}
            onAdd={()=>setAddingTo({type:"backlog"})}/>
        )}
      </div>

      {(addingTo||editProject)&&(
        <ProjectModal project={editProject||null} onSave={editProject?handleUpdateProject:handleSaveNew} onClose={()=>{setEditProject(null);setAddingTo(null);}}/>
      )}
      {showSettings&&<SettingsModal data={data} onSave={s=>{updateData(d=>({...d,...s}));setShowSettings(false);}} onClose={()=>setShowSettings(false)}/>}
    </div>
  );
}
