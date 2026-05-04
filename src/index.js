<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Aline — Initiative Scoring</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Serif+Display&display=swap" rel="stylesheet"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:#f7f5f0;color:#1a1a1a;min-height:100vh;}
input,select,textarea,button{font-family:'DM Sans',sans-serif;}
input,select,textarea{background:#fff;color:#1a1a1a;border:1px solid #e5e5e5;border-radius:8px;padding:10px 12px;font-size:14px;width:100%;outline:none;transition:border-color .15s;}
input:focus,select:focus,textarea:focus{border-color:#1a1a1a;}
textarea{resize:vertical;}
.hdr{background:#1a1a1a;padding:0 1.5rem;height:52px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;}
.hdr-logo{font-family:'DM Serif Display',serif;font-size:19px;color:#fff;letter-spacing:-.02em;}
.nav-btn{background:transparent;color:#888;border:none;border-radius:6px;padding:5px 12px;font-size:13px;cursor:pointer;transition:all .15s;}
.nav-btn.active{background:#fff;color:#1a1a1a;font-weight:500;}
.page{max-width:1020px;margin:0 auto;padding:1.5rem 1.5rem 4rem;}
.page-sm{max-width:640px;margin:0 auto;padding:1.5rem 1.5rem 4rem;}
.lbl{font-size:11px;font-weight:500;color:#aaa;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:7px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
.card{background:#fff;border:1px solid #ebebeb;border-radius:10px;padding:14px 16px;margin-bottom:8px;}
.chip{padding:6px 13px;border:1px solid #e5e5e5;border-radius:20px;font-size:13px;background:#fff;color:#555;cursor:pointer;transition:all .15s;}
.chip.on{background:#1a1a1a;color:#fff;border-color:#1a1a1a;}
.arr-btn{display:flex;justify-content:space-between;align-items:center;padding:9px 13px;border:1px solid #e5e5e5;border-radius:8px;background:#fff;cursor:pointer;width:100%;margin-bottom:5px;transition:all .15s;text-align:left;}
.arr-btn.on{background:#1a1a1a;border-color:#1a1a1a;}
.arr-btn.on .abl{color:#fff;font-weight:500;}
.arr-btn.on .abr{color:#777;}
.abl{font-size:13px;color:#333;}
.abr{font-size:11px;color:#bbb;}
.score-opt{flex:1;padding:9px 6px;border:1px solid #e5e5e5;border-radius:8px;background:#fafaf8;color:#555;cursor:pointer;font-size:13px;text-align:center;transition:all .15s;}
.score-opt.on{background:#1a1a1a;color:#fff;border-color:#1a1a1a;font-weight:500;}
.btn-primary{padding:11px;background:#c8f04a;color:#1a1a1a;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;width:100%;transition:all .2s;}
.btn-primary:disabled{background:#e5e5e5;color:#aaa;cursor:default;}
.btn-secondary{padding:11px;background:#fff;color:#555;border:1px solid #e5e5e5;border-radius:8px;font-size:14px;cursor:pointer;width:100%;}
.btn-ghost{padding:11px;background:transparent;color:#aaa;border:1px solid #ebebeb;border-radius:8px;font-size:14px;cursor:pointer;width:100%;}
.tbl-hdr{display:grid;grid-template-columns:2fr 1.1fr .9fr .8fr 70px 90px 115px;padding:5px 14px;margin-bottom:5px;}
.tbl-hdr span{font-size:11px;font-weight:500;color:#aaa;text-transform:uppercase;letter-spacing:.06em;}
.tbl-row{display:grid;grid-template-columns:2fr 1.1fr .9fr .8fr 70px 90px 115px;padding:13px 14px;cursor:pointer;align-items:center;}
.prod-tag{font-size:11px;background:#f0ede8;color:#666;padding:2px 7px;border-radius:4px;margin:2px 2px 0 0;display:inline-block;}
.pri-badge{font-size:11px;padding:2px 7px;border-radius:4px;font-weight:500;}
.sort-btn{background:#fff;color:#555;border:1px solid #e5e5e5;border-radius:6px;padding:4px 11px;font-size:12px;cursor:pointer;transition:all .15s;}
.sort-btn.on{background:#1a1a1a;color:#fff;border-color:#1a1a1a;}
.expand-area{border-top:1px solid #f0ede8;padding:14px 16px;background:#fafaf8;}
.bk-row{display:flex;align-items:center;gap:8px;margin-bottom:5px;}
.bk-bar-wrap{flex:1;height:4px;background:#ebebeb;border-radius:2px;overflow:hidden;}
.bk-bar{height:4px;border-radius:2px;}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:100;}
.modal{background:#fff;border-radius:12px;padding:1.5rem;width:420px;max-width:calc(100vw - 2rem);}
.sz-btn{flex:1;padding:9px 4px;border:1px solid #e5e5e5;border-radius:8px;background:#fafaf8;color:#555;cursor:pointer;font-size:13px;text-align:center;transition:all .15s;}
.sz-btn.on{background:#1a1a1a;color:#fff;border-color:#1a1a1a;font-weight:500;}
.tm-btn{flex:1;padding:10px;border:1px solid #e5e5e5;border-radius:8px;background:#fafaf8;color:#555;cursor:pointer;font-size:13px;text-align:center;transition:all .15s;}
.tm-btn.on{background:#1a1a1a;color:#fff;border-color:#1a1a1a;font-weight:500;}
.edit-badge{display:inline-flex;align-items:center;font-size:11px;background:#faeeda;color:#854f0b;padding:2px 8px;border-radius:4px;font-weight:500;}
.discard-link{background:none;border:none;color:#aaa;font-size:13px;cursor:pointer;text-decoration:underline;padding:0;font-family:inherit;}
.dl-btn{display:flex;align-items:center;gap:6px;padding:5px 12px;background:#fff;color:#1a1a1a;border:1px solid #ccc;border-radius:6px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;transition:all .15s;white-space:nowrap;}
.dl-btn:hover{background:#f0ede8;border-color:#aaa;}
.x-btn{background:transparent;border:none;cursor:pointer;color:#aaa;font-size:22px;line-height:1;padding:4px 8px;border-radius:6px;}
.x-btn:hover{color:#555;background:#f0ede8;}
.toast{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;z-index:200;opacity:0;transition:opacity .2s;pointer-events:none;}
.toast.show{opacity:1;}
.loading-state{text-align:center;padding:4rem 2rem;color:#aaa;font-size:14px;}
.live-dot{width:7px;height:7px;border-radius:50%;background:#c8f04a;display:inline-block;margin-right:5px;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
</style>
</head>
<body>
<div id="app"></div>
<div id="modal-root"></div>
<div id="toast" class="toast"></div>

<script>
/* ── Supabase ── */
const SUPA_URL="https://syepukprhhhoescxeoiu.supabase.co";
const SUPA_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5ZXB1a3ByaGhob2VzY3hlb2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NTcwMTEsImV4cCI6MjA5MzIzMzAxMX0.zRBZWS2qMG4xIi4zIoylDwLrK-WY5BJpxh001zi7bSA";
const sb=supabase.createClient(SUPA_URL,SUPA_KEY);

/* ── constants ── */
const WEIGHTS={arr:.20,ret:.25,saydo:.40,mig:.10,diff:.10};
const ARR_TIERS=[
  {label:"Internal / no customer",   value:1.0,  sub:"no multiplier"},
  {label:"Tail — < $5K ARR",         value:1.0,  sub:"62% of accounts"},
  {label:"Small — $5K–$25K",         value:1.15, sub:"19% of accounts"},
  {label:"Mid-market — $25K–$50K",   value:1.35, sub:"7% of accounts"},
  {label:"Strategic — $50K–$100K",   value:1.6,  sub:"5% of accounts"},
  {label:"Key account — $100K–$250K",value:1.85, sub:"4% of accounts"},
  {label:"Enterprise — $250K–$500K", value:2.2,  sub:"1.5% of accounts"},
  {label:"Anchor — $500K+",          value:3.0,  sub:"Atria tier, < 1%"},
];
const PRODUCTS=["Aline","Compass","Billing","Analytics","Integrations","Mobile","API / Platform","Other"];
const DIMS=[
  {key:"arr",   label:"ARR impact",               weight:"20%",hint:"Low: minimal · Med: indirect (win rate, upsell) · High: direct growth or RFP req."},
  {key:"ret",   label:"Retention impact",          weight:"25%",hint:"Low: limited · Med: improves adoption · High: known churn driver"},
  {key:"saydo", label:"Say/Do urgency",            weight:"40%",hint:"Low: no commitments · Med: mentioned to some · High: publicly promised or overdue"},
  {key:"mig",   label:"Migration dependency",      weight:"10%",hint:"Low: unaffected · Med: slowed not blocked · High: directly prevents migration"},
  {key:"diff",  label:"Strategic differentiation", weight:"10%",hint:"Low: table stakes · Med: incremental lift · High: major differentiator"},
];
const SZ={XS:1,S:2,M:3,L:4,XL:5};
const SZ_LBL={XS:"<1 wk",S:"1–2 wks",M:"3–4 wks",L:"5–6 wks",XL:"7+ wks"};
const TM_LBL={1:"1 team",2:"2 teams",3:"3+ teams"};
const TM={1:1.0,2:1.3,3:1.6};

/* ── scoring ── */
function effNorm(sz,tm){if(!sz||!tm)return null;return Math.min((SZ[sz]*TM[tm])/5,1)*3;}
function calcBase(s,en){let b=0;Object.keys(WEIGHTS).forEach(k=>{b+=((s[k]||0)*WEIGHTS[k]);});if(en!==null)b-=en*0.15;return b;}
function calcFinal(base,mult){return base*mult;}
function pri(score){
  if(score>=4.0)return{label:"High",  color:"#0f6e56",bg:"#e1f5ee"};
  if(score>=2.2)return{label:"Medium",color:"#854f0b",bg:"#faeeda"};
  return          {label:"Low",   color:"#5f5e5a",bg:"#f1efe8"};
}
function getScore(s){const en=effNorm(s.efSz,s.efTm);return calcFinal(calcBase(s,en),ARR_TIERS[s.arrIdx].value);}

/* ── DB row ↔ app object mapping ── */
function dbToApp(r){
  return{
    id:r.id, name:r.name, role:r.role, title:r.title||"", customer:r.customer,
    arrIdx:r.arr_idx, desc:r.description, products:r.products||[],
    arr:r.arr, ret:r.ret, saydo:r.saydo, mig:r.mig, diff:r.diff,
    efSz:r.ef_sz, efTm:r.ef_tm, obsolete:r.obsolete||false,
    ts:new Date(r.created_at).getTime()
  };
}
function appToDB(f){
  return{
    name:f.name, role:f.role, title:f.title||"", customer:f.customer,
    arr_idx:f.arrIdx, description:f.desc, products:f.products,
    arr:f.arr, ret:f.ret, saydo:f.saydo, mig:f.mig, diff:f.diff,
    ef_sz:f.efSz||null, ef_tm:f.efTm||null, obsolete:f.obsolete||false
  };
}

/* ── state ── */
const BLANK={name:"",role:"Sales",title:"",customer:"",arrIdx:0,desc:"",products:[],arr:0,ret:0,saydo:0,mig:0,diff:0};
let S={
  view:"board", subs:[], loading:true,
  step:1, submitted:false, saving:false,
  form:{...BLANK}, editingId:null,
  sortBy:"score", expandId:null, showObsolete:false,
  efModal:null, efDraft:{sz:null,tm:null}
};

/* ── toast ── */
let toastTimer=null;
function toast(msg){
  const el=document.getElementById("toast");
  el.textContent=msg;el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove("show"),2500);
}

/* ── set: never touches live text inputs ── */
function set(patch){
  Object.assign(S,typeof patch==="function"?patch(S):patch);
  syncBoard();syncFormChrome();syncModal();
}

/* ── Supabase: load all ── */
async function loadAll(){
  set({loading:true});
  const{data,error}=await sb.from("initiatives").select("*").order("created_at",{ascending:false});
  if(error){toast("Error loading data: "+error.message);set({loading:false});return;}
  set({subs:data.map(dbToApp),loading:false});
}

/* ── Supabase: real-time subscription ── */
function subscribeRealtime(){
  sb.channel("initiatives-changes")
    .on("postgres_changes",{event:"*",schema:"public",table:"initiatives"},payload=>{
      const{eventType,new:nr,old:or}=payload;
      if(eventType==="INSERT"){
        S.subs=[dbToApp(nr),...S.subs.filter(x=>x.id!==nr.id)];
        toast("New initiative added");
      } else if(eventType==="UPDATE"){
        S.subs=S.subs.map(x=>x.id===nr.id?dbToApp(nr):x);
      } else if(eventType==="DELETE"){
        S.subs=S.subs.filter(x=>x.id!==or.id);
      }
      syncBoard();syncModal();
    })
    .subscribe();
}

/* ── navigation ── */
function goBoard(){set({view:"board",editingId:null,submitted:false});}
function goSubmit(){
  Object.assign(S.form,{...BLANK});
  set({view:"submit",step:1,submitted:false,editingId:null,saving:false});
  pushToInputs();
}
function cancelSubmit(){set({view:"board",editingId:null,submitted:false});}
function editSub(id){
  const sub=S.subs.find(x=>x.id===id);
  Object.assign(S.form,{name:sub.name,role:sub.role,title:sub.title||"",customer:sub.customer,arrIdx:sub.arrIdx,
    desc:sub.desc,products:[...sub.products],arr:sub.arr,ret:sub.ret,saydo:sub.saydo,mig:sub.mig,diff:sub.diff});
  set({view:"submit",step:1,submitted:false,editingId:id,saving:false});
  pushToInputs();
}

function pushToInputs(){
  requestAnimationFrame(()=>{
    const n=document.getElementById("f-name"),c=document.getElementById("f-customer"),
          t=document.getElementById("f-title"),d=document.getElementById("f-desc"),r=document.getElementById("f-role");
    if(n)n.value=S.form.name;if(c)c.value=S.form.customer;
    if(t)t.value=S.form.title;if(d)d.value=S.form.desc;if(r)r.value=S.form.role;
  });
}
function pullFromInputs(){
  const n=document.getElementById("f-name"),c=document.getElementById("f-customer"),
        t=document.getElementById("f-title"),d=document.getElementById("f-desc");
  if(n)S.form.name=n.value;if(c)S.form.customer=c.value;
  if(t)S.form.title=t.value;if(d)S.form.desc=d.value;
}

function fsetArrIdx(i){S.form.arrIdx=i;set({});}
function fsetRole(v){S.form.role=v;set({});}
function fsetDim(k,v){S.form[k]=v;set({});}
function toggleProd(p){
  S.form.products=S.form.products.includes(p)?S.form.products.filter(x=>x!==p):[...S.form.products,p];
  set({});
}
function goStep2(){pullFromInputs();set({step:2});}
function goStep1(){set({step:1});pushToInputs();}
function onTextInput(){
  const n=document.getElementById("f-name"),c=document.getElementById("f-customer"),
        t=document.getElementById("f-title"),d=document.getElementById("f-desc"),btn=document.getElementById("btn-continue");
  if(btn)btn.disabled=!(n&&n.value.trim()&&t&&t.value.trim()&&c&&c.value.trim()&&d&&d.value.trim()&&S.form.products.length>0);
}

/* ── submit / edit → Supabase ── */
async function submitForm(){
  pullFromInputs();
  set({saving:true});
  const f=S.form;
  let error;
  if(S.editingId!==null){
    const row=appToDB(f);
    ({error}=await sb.from("initiatives").update(row).eq("id",S.editingId));
  } else {
    const row=appToDB(f);
    ({error}=await sb.from("initiatives").insert(row));
  }
  if(error){toast("Save failed: "+error.message);set({saving:false});return;}
  set({submitted:true,saving:false});
}

/* ── effort → Supabase ── */
async function saveEff(){
  const{error}=await sb.from("initiatives")
    .update({ef_sz:S.efDraft.sz,ef_tm:S.efDraft.tm})
    .eq("id",S.efModal);
  if(error){toast("Save failed: "+error.message);return;}
  set({efModal:null});
  toast("Effort estimate saved");
}

/* ── obsolete → Supabase ── */
async function markObsolete(id){
  const{error}=await sb.from("initiatives").update({obsolete:true}).eq("id",id);
  if(error){toast("Error: "+error.message);return;}
  set({expandId:null});
  toast("Marked as obsolete");
}
async function restoreObsolete(id){
  const{error}=await sb.from("initiatives").update({obsolete:false}).eq("id",id);
  if(error){toast("Error: "+error.message);return;}
  toast("Restored");
}

/* ── effort modal helpers ── */
function openEff(id){const sub=S.subs.find(x=>x.id===id);set({efModal:id,efDraft:{sz:sub.efSz,tm:sub.efTm}});}
function closeEff(){set({efModal:null});}
function setEfSz(sz){set(s=>({efDraft:{...s.efDraft,sz}}));}
function setEfTm(tm){set(s=>({efDraft:{...s.efDraft,tm}}));}
function toggleExpand(id){set(s=>({expandId:s.expandId===id?null:id}));}

/* ── board sync ── */
function sortedSubs(){
  return [...S.subs].filter(s=>S.showObsolete?s.obsolete:!s.obsolete).sort((a,b)=>{
    if(S.sortBy==="score")return getScore(b)-getScore(a);
    if(S.sortBy==="arr")return ARR_TIERS[b.arrIdx].value-ARR_TIERS[a.arrIdx].value;
    return b.ts-a.ts;
  });
}

function syncBoard(){
  const boardEl=document.getElementById("view-board"),formEl=document.getElementById("view-form");
  if(!boardEl||!formEl)return;
  boardEl.style.display=S.view==="board"?"block":"none";
  formEl.style.display=S.view==="submit"?"block":"none";
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===S.view));
  if(S.view!=="board")return;

  const tblBody=document.getElementById("tbl-body");
  if(S.loading){tblBody.innerHTML=`<div class="loading-state">Loading initiatives…</div>`;return;}

  const activeCount=S.subs.filter(s=>!s.obsolete).length;
  const obsCount=S.subs.filter(s=>s.obsolete).length;
  document.getElementById("sub-count").innerHTML=`<span class="live-dot"></span>${activeCount} active · ${obsCount} obsolete · sorted by ${S.sortBy}`;
  document.getElementById("board-title").textContent=S.showObsolete?"Obsolete initiatives":"Initiative requests";
  document.querySelectorAll(".sort-btn").forEach(b=>b.classList.toggle("on",b.dataset.sort===S.sortBy));
  const obsBtn=document.getElementById("btn-toggle-obsolete");
  if(obsBtn){
    obsBtn.textContent=S.showObsolete?"← Back to active":`View obsolete (${obsCount})`;
    obsBtn.style.display=obsCount>0||S.showObsolete?"inline-flex":"none";
  }

  let rows="";
  sortedSubs().forEach(sub=>{
    const en=effNorm(sub.efSz,sub.efTm),base=calcBase(sub,en),mult=ARR_TIERS[sub.arrIdx].value,
          final=calcFinal(base,mult),p=pri(final),hasEff=!!(sub.efSz&&sub.efTm),isExp=S.expandId===sub.id;
    const d=new Date(sub.ts).toLocaleDateString("en-US",{month:"short",day:"numeric"});
    rows+=`<div style="background:#fff;border:1px solid #ebebeb;border-radius:10px;overflow:hidden;margin-bottom:6px;${sub.obsolete?"opacity:.55;":""}">
      <div class="tbl-row" onclick="toggleExpand(${sub.id})">
        <div>
          <div style="font-size:14px;font-weight:500;margin-bottom:2px;">${sub.title||(sub.desc.length>52?sub.desc.slice(0,52)+"…":sub.desc)}</div>
          <div style="font-size:12px;color:#aaa;">${sub.name} · ${sub.role} · ${d}</div>
        </div>
        <div style="font-size:13px;color:#555;">${sub.customer}</div>
        <div>${sub.products.map(pp=>`<span class="prod-tag">${pp}</span>`).join("")}</div>
        <div><div style="font-size:13px;color:#555;">${ARR_TIERS[sub.arrIdx].label.split("—")[0].trim()}</div><div style="font-size:11px;color:#aaa;">×${mult.toFixed(2)}</div></div>
        <div style="font-size:18px;font-weight:500;color:${hasEff?"#1a1a1a":"#ccc"}">${hasEff?base.toFixed(2):"—"}</div>
        <div style="display:flex;align-items:center;gap:5px;">${sub.obsolete
          ?`<span class="pri-badge" style="background:#f1efe8;color:#888;">Obsolete</span>`
          :`<span style="font-size:19px;font-weight:500;color:${hasEff?p.color:"#ccc"}">${hasEff?final.toFixed(2):"—"}</span>${hasEff?`<span class="pri-badge" style="background:${p.bg};color:${p.color}">${p.label}</span>`:""}`
        }</div>
        <div style="display:flex;justify-content:flex-end;">${sub.obsolete
          ?`<button style="font-size:12px;background:transparent;color:#aaa;border:1px solid #ebebeb;border-radius:6px;padding:5px 9px;cursor:pointer;" onclick="event.stopPropagation();restoreObsolete(${sub.id})">Restore</button>`
          :(!hasEff
            ?`<button style="font-size:12px;background:#f7f5f0;color:#555;border:1px solid #e5e5e5;border-radius:6px;padding:5px 9px;cursor:pointer;" onclick="event.stopPropagation();openEff(${sub.id})">+ Add effort</button>`
            :`<button style="font-size:12px;background:transparent;color:#aaa;border:1px solid #ebebeb;border-radius:6px;padding:5px 9px;cursor:pointer;" onclick="event.stopPropagation();openEff(${sub.id})">${sub.efSz} · ${sub.efTm}T</button>`)
        }</div>
      </div>
      ${isExp?`<div class="expand-area"><div style="display:grid;grid-template-columns:1.5fr 1fr;gap:20px;">
        <div>
          ${sub.title?`<div class="lbl">Title</div><div style="font-size:15px;font-weight:500;color:#1a1a1a;margin-bottom:14px;">${sub.title}</div>`:""}
          <div class="lbl">Description</div>
          <p style="font-size:14px;color:#444;line-height:1.6;margin-bottom:12px;">${sub.desc}</p>
          ${hasEff?`<div style="font-size:12px;color:#aaa;margin-bottom:12px;">Effort: <strong style="color:#555;">${sub.efSz}</strong> (${SZ_LBL[sub.efSz]}) · <strong style="color:#555;">${TM_LBL[sub.efTm]}</strong></div>`:""}
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${sub.obsolete
              ?`<button onclick="restoreObsolete(${sub.id})" style="font-size:12px;background:#e1f5ee;color:#0f6e56;border:1px solid #9fe1cb;border-radius:6px;padding:6px 12px;cursor:pointer;">Restore</button>`
              :`<button onclick="editSub(${sub.id})" style="font-size:12px;background:#fff;color:#555;border:1px solid #e5e5e5;border-radius:6px;padding:6px 12px;cursor:pointer;">Edit submission</button>
                <button onclick="markObsolete(${sub.id})" style="font-size:12px;background:#fff;color:#aaa;border:1px solid #e5e5e5;border-radius:6px;padding:6px 12px;cursor:pointer;">Mark obsolete</button>`
            }
          </div>
        </div>
        <div>
          <div class="lbl">Score breakdown</div>
          ${DIMS.map(dim=>{const c=(sub[dim.key]||0)*WEIGHTS[dim.key];return`<div class="bk-row"><span style="font-size:12px;color:#888;min-width:130px;">${dim.label}</span><div class="bk-bar-wrap"><div class="bk-bar" style="width:${(c/3)*100}%;background:#1a1a1a;"></div></div><span style="font-size:12px;color:#555;min-width:36px;text-align:right;">+${c.toFixed(2)}</span></div>`;}).join("")}
          ${hasEff?`<div class="bk-row"><span style="font-size:12px;color:#888;min-width:130px;">Effort penalty</span><div class="bk-bar-wrap"><div class="bk-bar" style="width:${Math.min((en*0.15/3)*100,100)}%;background:#e24b4a;"></div></div><span style="font-size:12px;color:#e24b4a;min-width:36px;text-align:right;">−${(en*0.15).toFixed(2)}</span></div>`:""}
        </div>
      </div></div>`:""}
    </div>`;
  });

  if(sortedSubs().length===0){
    rows=`<div class="loading-state">${S.showObsolete?"No obsolete initiatives.":"No initiatives yet — submit the first one!"}</div>`;
  }
  tblBody.innerHTML=rows;
}

/* ── form chrome sync ── */
function syncFormChrome(){
  if(S.view!=="submit")return;
  const isEditing=S.editingId!==null,f=S.form;
  document.getElementById("form-title").textContent=isEditing?"Edit submission":"Submit an initiative";
  document.getElementById("edit-badge-row").style.display=isEditing?"flex":"none";
  document.getElementById("prog1").style.background=S.step>=1?"#1a1a1a":"#e5e5e5";
  document.getElementById("prog2").style.background=S.step>=2?"#1a1a1a":"#e5e5e5";
  document.getElementById("form-step-label").textContent=`Step ${S.step} of 2 — ${S.step===1?"Details":"Business scoring"}`;
  document.getElementById("step1").style.display=S.step===1?"block":"none";
  document.getElementById("step2").style.display=S.step===2?"block":"none";
  document.getElementById("success-screen").style.display=S.submitted?"block":"none";
  document.getElementById("form-body").style.display=S.submitted?"none":"block";
  if(S.submitted){
    document.getElementById("success-title").textContent=isEditing?"Changes saved":"Submitted";
    document.getElementById("success-msg").textContent=isEditing
      ?"Your edits have been saved to the board."
      :"Your initiative has been added to the board. Product and engineering will review and add effort estimates.";
  }
  const roleEl=document.getElementById("f-role");if(roleEl)roleEl.value=f.role;
  document.getElementById("arr-tier-btns").innerHTML=ARR_TIERS.map((t,i)=>
    `<button class="arr-btn${f.arrIdx===i?" on":""}" onclick="fsetArrIdx(${i})"><span class="abl">${t.label}</span><span class="abr">${t.sub}${t.value>1?" · ×"+t.value:""}</span></button>`
  ).join("");
  document.getElementById("product-chips").innerHTML=PRODUCTS.map(p=>
    `<button class="chip${f.products.includes(p)?" on":""}" onclick="toggleProd('${p}')">${p}</button>`
  ).join("");
  const nb=document.getElementById("f-name"),tb=document.getElementById("f-title"),cb=document.getElementById("f-customer"),db=document.getElementById("f-desc"),contBtn=document.getElementById("btn-continue");
  if(contBtn){const hasText=nb&&nb.value.trim()&&tb&&tb.value.trim()&&cb&&cb.value.trim()&&db&&db.value.trim();contBtn.disabled=!(hasText&&f.products.length>0);}
  DIMS.forEach(dim=>{document.querySelectorAll(`#dim-${dim.key} .score-opt`).forEach(btn=>btn.classList.toggle("on",parseInt(btn.dataset.v)===f[dim.key]));});
  const v2=f.arr>0&&f.ret>0&&f.saydo>0&&f.mig>0&&f.diff>0,lp=document.getElementById("live-preview");
  if(lp){lp.style.display=v2?"flex":"none";if(v2){const lb=calcBase(f,null),lf=calcFinal(lb,ARR_TIERS[f.arrIdx].value);document.getElementById("live-base").textContent=lb.toFixed(2);document.getElementById("live-final").textContent=lf.toFixed(2);}}
  const subBtn=document.getElementById("btn-submit");
  if(subBtn){subBtn.disabled=!v2||S.saving;subBtn.textContent=S.saving?"Saving…":(isEditing?"Save changes":"Submit initiative");}
}

/* ── effort modal ── */
function syncModal(){
  const root=document.getElementById("modal-root");
  if(S.efModal===null){root.innerHTML="";return;}
  const sub=S.subs.find(x=>x.id===S.efModal),d=S.efDraft;
  if(!sub){root.innerHTML="";return;}
  const pEn=d.sz&&d.tm?effNorm(d.sz,d.tm):null,pBase=pEn!==null?calcBase(sub,pEn):null,
        pFinal=pBase!==null?calcFinal(pBase,ARR_TIERS[sub.arrIdx].value):null,pp=pFinal!==null?pri(pFinal):null;
  root.innerHTML=`<div class="modal-overlay" onclick="if(event.target===this)closeEff()"><div class="modal">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
      <div><div style="font-size:15px;font-weight:500;margin-bottom:3px;">Effort estimate</div><div style="font-size:13px;color:#888;">${sub.title||(sub.desc.length>48?sub.desc.slice(0,48)+"…":sub.desc)}</div></div>
      <button class="x-btn" style="font-size:18px;" onclick="closeEff()">✕</button>
    </div>
    <div style="margin-bottom:16px;"><div class="lbl">T-shirt size (timeframe)</div>
      <div style="display:flex;gap:6px;">${Object.entries(SZ_LBL).map(([sz,lbl])=>`<button class="sz-btn${d.sz===sz?" on":""}" onclick="setEfSz('${sz}')"><div style="font-weight:500;">${sz}</div><div style="font-size:10px;color:${d.sz===sz?"#aaa":"#bbb"};margin-top:2px;">${lbl}</div></button>`).join("")}</div>
    </div>
    <div style="margin-bottom:18px;"><div class="lbl">Teams impacted</div>
      <div style="display:flex;gap:6px;">${[1,2,3].map(t=>`<button class="tm-btn${d.tm===t?" on":""}" onclick="setEfTm(${t})">${t===3?"3+ teams":t+" team"+(t>1?"s":"")}</button>`).join("")}</div>
    </div>
    ${pp?`<div style="background:#f7f5f0;border-radius:8px;padding:12px 14px;margin-bottom:16px;display:flex;justify-content:space-between;">
      <div><div style="font-size:11px;color:#aaa;margin-bottom:2px;">Final score</div><div style="font-size:22px;font-weight:500;color:${pp.color};">${pFinal.toFixed(2)}</div></div>
      <div style="text-align:right;"><div style="font-size:11px;color:#aaa;margin-bottom:4px;">Priority</div><span class="pri-badge" style="background:${pp.bg};color:${pp.color};font-size:13px;">${pp.label}</span></div>
    </div>`:""}
    <div style="display:flex;gap:8px;">
      <button class="btn-secondary" style="flex:1;padding:10px;" onclick="closeEff()">Cancel</button>
      <button class="btn-primary" style="flex:2;padding:10px;" ${!d.sz||!d.tm?"disabled":""} onclick="saveEff()">Save estimate</button>
    </div>
  </div></div>`;
}

/* ── Excel export ── */
function downloadExcel(){
  const allSubs=[...S.subs].sort((a,b)=>{
    if(S.sortBy==="score")return getScore(b)-getScore(a);
    if(S.sortBy==="arr")return ARR_TIERS[b.arrIdx].value-ARR_TIERS[a.arrIdx].value;
    return b.ts-a.ts;
  });
  const rows=allSubs.map((s,i)=>{
    const en=effNorm(s.efSz,s.efTm),base=calcBase(s,en),mult=ARR_TIERS[s.arrIdx].value,
          final=calcFinal(base,mult),p=pri(final),hasEff=!!(s.efSz&&s.efTm);
    return{"Rank":i+1,"Status":s.obsolete?"Obsolete":"Active","Title":s.title||"","Description":s.desc,"Submitted By":s.name,"Role":s.role,
      "Date Submitted":new Date(s.ts).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
      "Customer":s.customer,"ARR Tier":ARR_TIERS[s.arrIdx].label,"ARR Multiplier":mult,"Products":s.products.join(", "),
      "ARR Impact (1–3)":s.arr||"","Retention Impact (1–3)":s.ret||"","Say/Do Urgency (1–3)":s.saydo||"",
      "Migration Dependency (1–3)":s.mig||"","Strategic Differentiation (1–3)":s.diff||"",
      "T-Shirt Size":s.efSz||"Pending","Teams Impacted":s.efTm?TM_LBL[s.efTm]:"Pending",
      "Base Score":hasEff?parseFloat(base.toFixed(2)):"","ARR-Adjusted Score":hasEff?parseFloat(final.toFixed(2)):"",
      "Priority":hasEff?p.label:"Pending"};
  });
  const wb=XLSX.utils.book_new(),ws=XLSX.utils.json_to_sheet(rows);
  ws["!cols"]=[{wch:6},{wch:10},{wch:40},{wch:55},{wch:16},{wch:10},{wch:16},{wch:28},{wch:28},{wch:14},{wch:30},{wch:20},{wch:22},{wch:22},{wch:26},{wch:28},{wch:14},{wch:16},{wch:12},{wch:22},{wch:12}];
  ws["!freeze"]={xSplit:0,ySplit:1};
  XLSX.utils.book_append_sheet(wb,ws,"Initiative Requests");
  XLSX.writeFile(wb,`initiative-requests-${new Date().toISOString().slice(0,10)}.xlsx`);
}

/* ── scaffold (written once) ── */
document.getElementById("app").innerHTML=`
<div class="hdr">
  <div style="display:flex;align-items:center;gap:10px;">
    <span class="hdr-logo">Aline</span>
    <span style="color:#555;font-size:13px;">/</span>
    <span style="color:#aaa;font-size:13px;font-weight:300;">Initiative Scoring</span>
  </div>
  <div style="display:flex;gap:4px;">
    <button class="nav-btn active" data-view="board" onclick="goBoard()">All submissions</button>
    <button class="nav-btn" data-view="submit" onclick="goSubmit()">Submit request</button>
  </div>
</div>

<div id="view-board" class="page">
  <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:1.2rem;">
    <div>
      <div style="font-family:'DM Serif Display',serif;font-size:28px;letter-spacing:-.02em;margin-bottom:3px;" id="board-title">Initiative requests</div>
      <div id="sub-count" style="color:#888;font-size:13px;font-weight:300;"></div>
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <span style="font-size:12px;color:#aaa;">Sort</span>
      <div style="display:flex;gap:4px;">
        <button class="sort-btn on" data-sort="score" onclick="set({sortBy:'score'})">Score</button>
        <button class="sort-btn" data-sort="arr" onclick="set({sortBy:'arr'})">ARR tier</button>
        <button class="sort-btn" data-sort="date" onclick="set({sortBy:'date'})">Date</button>
      </div>
      <button id="btn-toggle-obsolete" class="dl-btn" style="display:none;color:#888;border-color:#e5e5e5;" onclick="set(s=>({showObsolete:!s.showObsolete,expandId:null}))">View obsolete</button>
      <button class="dl-btn" onclick="downloadExcel()">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 10.5v1A1.5 1.5 0 003.5 13h7A1.5 1.5 0 0012 11.5v-1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Export to Excel
      </button>
      <button class="btn-primary" style="width:auto;padding:6px 16px;font-size:13px;" onclick="goSubmit()">+ New request</button>
    </div>
  </div>
  <div class="tbl-hdr"><span>Initiative</span><span>Customer</span><span>Products</span><span>ARR tier</span><span>Base</span><span>Score</span><span></span></div>
  <div id="tbl-body"><div class="loading-state">Connecting to database…</div></div>
</div>

<div id="view-form" style="display:none;">
  <div id="form-body" class="page-sm">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px;">
      <div>
        <div id="form-title" style="font-family:'DM Serif Display',serif;font-size:28px;letter-spacing:-.02em;"></div>
        <div id="edit-badge-row" style="display:none;align-items:center;gap:8px;margin-top:6px;">
          <span class="edit-badge">Editing</span>
          <button class="discard-link" onclick="cancelSubmit()">Discard changes</button>
        </div>
      </div>
      <button class="x-btn" onclick="cancelSubmit()">✕</button>
    </div>
    <div id="form-step-label" style="color:#888;font-size:13px;margin-bottom:1.2rem;"></div>
    <div style="display:flex;gap:5px;margin-bottom:1.5rem;">
      <div id="prog1" style="height:3px;flex:1;border-radius:2px;background:#1a1a1a;transition:background .3s;"></div>
      <div id="prog2" style="height:3px;flex:1;border-radius:2px;background:#e5e5e5;transition:background .3s;"></div>
    </div>
    <div id="step1">
      <div class="g2">
        <div><label class="lbl">Your name</label><input id="f-name" placeholder="Full name" oninput="onTextInput()"/></div>
        <div><label class="lbl">Role</label>
          <select id="f-role" onchange="fsetRole(this.value)">
            <option>Sales</option><option>CSM</option><option>Support</option><option>Other</option>
          </select>
        </div>
      </div>
      <div style="margin-bottom:14px;"><label class="lbl">Initiative title</label><input id="f-title" placeholder="Short name for this initiative, e.g. Pharmacy API Integration" oninput="onTextInput()"/></div>
      <div style="margin-bottom:14px;"><label class="lbl">Customer name</label><input id="f-customer" placeholder="e.g. Atria Senior Living" oninput="onTextInput()"/></div>
      <div style="margin-bottom:14px;"><label class="lbl">Customer ARR tier</label><div id="arr-tier-btns"></div></div>
      <div style="margin-bottom:14px;"><label class="lbl">Initiative description</label><textarea id="f-desc" rows="4" placeholder="Describe the initiative, the customer request, and the context…" oninput="onTextInput()"></textarea></div>
      <div style="margin-bottom:20px;"><label class="lbl">Products / platforms involved</label><div id="product-chips" style="display:flex;flex-wrap:wrap;gap:6px;"></div></div>
      <div style="display:flex;gap:10px;">
        <button class="btn-ghost" style="flex:1;" onclick="cancelSubmit()">Cancel</button>
        <button id="btn-continue" class="btn-primary" style="flex:2;" onclick="goStep2()" disabled>Continue to scoring →</button>
      </div>
    </div>
    <div id="step2" style="display:none;">
      ${DIMS.map(dim=>`<div class="card" id="dim-${dim.key}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
          <div><div style="font-size:14px;font-weight:500;">${dim.label}</div><div style="font-size:12px;color:#aaa;margin-top:2px;">${dim.hint}</div></div>
          <span style="font-size:11px;background:#f0ede8;color:#888;padding:3px 8px;border-radius:4px;margin-left:12px;flex-shrink:0;">${dim.weight}</span>
        </div>
        <div style="display:flex;gap:7px;">
          <button class="score-opt" data-v="1" onclick="fsetDim('${dim.key}',1)">Low — 1</button>
          <button class="score-opt" data-v="2" onclick="fsetDim('${dim.key}',2)">Medium — 2</button>
          <button class="score-opt" data-v="3" onclick="fsetDim('${dim.key}',3)">High — 3</button>
        </div>
      </div>`).join("")}
      <div id="live-preview" style="display:none;background:#1a1a1a;border-radius:10px;padding:14px 16px;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <div><div style="font-size:11px;color:#888;margin-bottom:2px;">Base score (before effort)</div><div id="live-base" style="font-size:22px;font-weight:500;color:#c8f04a;"></div></div>
        <div style="text-align:right;"><div style="font-size:11px;color:#888;margin-bottom:2px;">ARR-adjusted</div><div id="live-final" style="font-size:22px;font-weight:500;color:#fff;"></div></div>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn-secondary" style="flex:1;" onclick="goStep1()">← Back</button>
        <button id="btn-submit" class="btn-primary" style="flex:2;" onclick="submitForm()" disabled>Submit initiative</button>
      </div>
    </div>
  </div>
  <div id="success-screen" style="display:none;max-width:440px;margin:4rem auto;padding:2rem;text-align:center;">
    <div style="width:52px;height:52px;background:#c8f04a;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.2rem;font-size:22px;">✓</div>
    <div id="success-title" style="font-family:'DM Serif Display',serif;font-size:28px;letter-spacing:-.02em;margin-bottom:8px;"></div>
    <p id="success-msg" style="color:#888;font-size:14px;line-height:1.6;margin-bottom:2rem;"></p>
    <div style="display:flex;gap:10px;justify-content:center;">
      <button onclick="goBoard()" style="padding:10px 18px;background:#1a1a1a;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit;">View all submissions</button>
      <button onclick="goSubmit()" style="padding:10px 18px;background:#fff;color:#555;border:1px solid #e5e5e5;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit;">Submit another</button>
    </div>
  </div>
</div>`;

/* ── boot ── */
syncBoard();
syncFormChrome();
syncModal();
loadAll();
subscribeRealtime();
</script>
</body>
</html>
