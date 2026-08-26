'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowUpRight, Bell, BriefcaseBusiness, Check, ChevronRight, CircleCheck, Clock3, FileText, FolderOpen, Globe2, LayoutDashboard, Plus, Search, Sparkles, Target, Upload, X, Zap } from 'lucide-react';
import { seedApps, seedEvidence } from '@/lib/demo-data';
import { Application, Evidence, Requirement, University } from '@/lib/types';
import { evidenceMatches, nextAction, readiness } from '@/lib/scoring';

type Tab = 'overview' | 'applications' | 'evidence' | 'discover';

function StatusIcon({status}:{status:Requirement['status']}) {
  return <span className={`statusDot ${status}`}><Check size={12}/></span>;
}

export default function Home() {
  const [apps,setApps] = useState<Application[]>(seedApps);
  const [evidence,setEvidence] = useState<Evidence[]>(seedEvidence);
  const [tab,setTab] = useState<Tab>('overview');
  const [query,setQuery] = useState('');
  const [showAdd,setShowAdd] = useState(false);
  const [showEvidence,setShowEvidence] = useState(false);
  const [selectedApp,setSelectedApp] = useState<number|null>(1);
  const [toast,setToast] = useState('');
  const [sourceText,setSourceText] = useState('');
  const [sourceUrl,setSourceUrl] = useState('');
  const [loading,setLoading] = useState(false);
  const [newSchool,setNewSchool] = useState('');
  const [newProgram,setNewProgram] = useState('');
  const [newDeadline,setNewDeadline] = useState('');
  const [uniQuery,setUniQuery] = useState('');
  const [universities,setUniversities] = useState<University[]>([]);

  useEffect(()=>{ try { const raw=localStorage.getItem('applyx-data-v2'); if(raw){ const d=JSON.parse(raw); setApps(d.apps||seedApps); setEvidence(d.evidence||seedEvidence); } } catch {} },[]);
  useEffect(()=>{ localStorage.setItem('applyx-data-v2',JSON.stringify({apps,evidence})); },[apps,evidence]);
  useEffect(()=>{ if(!toast) return; const t=setTimeout(()=>setToast(''),2600); return()=>clearTimeout(t); },[toast]);
  useEffect(()=>{ if(!showAdd && !showEvidence) return; function onKey(e:KeyboardEvent){ if(e.key==='Escape'){ setShowAdd(false); setShowEvidence(false); } } window.addEventListener('keydown',onKey); return ()=>window.removeEventListener('keydown',onKey); },[showAdd,showEvidence]);
  useEffect(()=>{ const timer=setTimeout(async()=>{ if(uniQuery.trim().length<3){setUniversities([]);return;} try { const r=await fetch(`/api/universities?q=${encodeURIComponent(uniQuery)}`); const d=await r.json(); setUniversities(Array.isArray(d)?d:[]); } catch { setUniversities([]); } },350); return()=>clearTimeout(timer); },[uniQuery]);

  const filteredApps = useMemo(()=>apps.filter(a=>(a.school+' '+a.program).toLowerCase().includes(query.toLowerCase())),[apps,query]);
  const avg = apps.length ? Math.round(apps.reduce((s,a)=>s+readiness(a),0)/apps.length) : 0;
  const missing = apps.reduce((s,a)=>s+a.requirements.filter(r=>r.status==='missing').length,0);
  const action = nextAction(apps);
  const selected = apps.find(a=>a.id===selectedApp) || apps[0];

  function notify(message:string){ setToast(message); }
  function markDone(appId:number, reqId:number){
    setApps(current=>current.map(a=>a.id===appId?{...a,requirements:a.requirements.map(r=>r.id===reqId?{...r,status:'done'}:r)}:a));
    notify('Requirement completed');
  }
  async function analyzeSource(){
    setLoading(true);
    try {
      let text=sourceText;
      if(sourceUrl.trim()){
        const r=await fetch('/api/fetch-url',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url:sourceUrl})});
        const d=await r.json(); if(!r.ok) throw new Error(d.error); text=d.text;
      }
      if(!text.trim()) throw new Error('Paste requirements or add a public application URL.');
      const r=await fetch('/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text,institution:newSchool,program:newProgram})});
      const d=await r.json(); if(!r.ok) throw new Error(d.error);
      const reqs=(d.requirements||[]).map((name:string,i:number)=>({id:i+1,name,status:'missing' as const,category:/essay|statement/i.test(name)?'Essay':/recommend/i.test(name)?'Recommendation':/fee|payment/i.test(name)?'Payment':'Document'}));
      setApps(current=>[{id:Date.now(),school:newSchool||'New opportunity',program:newProgram||'Application',deadline:newDeadline||'Deadline not set',sourceUrl:sourceUrl||undefined,requirements:reqs.length?reqs:[{id:1,name:'Review source requirements',status:'review',category:'Review'}]},...current]);
      setShowAdd(false); setSourceText(''); setSourceUrl(''); setNewSchool(''); setNewProgram(''); setNewDeadline(''); notify(`Application created · ${d.mode==='ai-structured'?'AI':'local'} extraction`);
    } catch(e) { notify(e instanceof Error?e.message:'Could not analyze source'); }
    finally { setLoading(false); }
  }
  function addEvidence(){
    setEvidence(current=>[{id:Date.now(),title:'New achievement',org:'Your organization',category:'Achievement',tags:['new','evidence'],description:'Add a concise description so ApplyX can match this evidence to requirements.'},...current]);
    setShowEvidence(false); notify('Evidence added');
  }

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brandMark"><Sparkles size={17}/></div><span>Apply<span>X</span></span></div>
      <nav>
        <button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}><LayoutDashboard size={18}/>Overview</button>
        <button className={tab==='applications'?'active':''} onClick={()=>setTab('applications')}><BriefcaseBusiness size={18}/>Applications</button>
        <button className={tab==='evidence'?'active':''} onClick={()=>setTab('evidence')}><FolderOpen size={18}/>Evidence Vault</button>
        <button className={tab==='discover'?'active':''} onClick={()=>setTab('discover')}><Globe2 size={18}/>Discover</button>
      </nav>
      <div className="sidebarNote"><Zap size={15}/><div><b>Frictionless mode</b><small>Focus on the next action.</small></div></div>
      <div className="sidebarBottom"><div className="miniAvatar">MO</div><div><b>MO</b><small>Applicant workspace</small></div><Bell size={17}/></div>
    </aside>

    <section className="content">
      <header className="topbar"><div className="mobileBrand">ApplyX</div><div className="search"><Search size={17} aria-hidden/><input aria-label="Search applications, evidence" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search applications, evidence..."/></div><button className="iconBtn" aria-label="Notifications"><Bell size={18}/></button><button className="avatar" aria-label="Account: MO">MO</button></header>

      {tab==='overview' && <>
        <div className="hero"><div><div className="eyebrow">APPLICATION COMMAND CENTER</div><h1>Make every application <em>frictionless.</em></h1><p>ApplyX turns scattered requirements, documents and achievements into one clear path from discovery to submission.</p></div><button className="primary" onClick={()=>setShowAdd(true)}><Plus size={17}/> New application</button></div>
        <div className="metrics"><Metric label="Readiness" value={`${avg}%`} note="Across active applications"/><Metric label="Active" value={String(apps.length)} note="Applications in progress"/><Metric label="Evidence" value={String(evidence.length)} note="Reusable achievements"/><Metric label="Needs attention" value={String(missing)} note="Missing requirements" danger/></div>
        <div className="grid2">
          <section className="panel next"><div className="panelHead"><div><span className="eyebrow">NEXT BEST ACTION</span><h2>{action.label}</h2></div><div className="actionIcon"><Target size={20}/></div></div><p><b>{action.app}</b> is the closest thing between you and a more complete application. ApplyX prioritizes the highest-friction task first.</p><button className="textBtn" onClick={()=>setTab('applications')}>Open applications <ChevronRight size={16}/></button></section>
          <section className="panel"><div className="panelHead"><div><span className="eyebrow">APPLICATION HEALTH</span><h2>Live readiness</h2></div><span className="pill good">Synced</span></div><div className="healthList">{apps.map(a=><button className="healthRow" key={a.id} onClick={()=>{setSelectedApp(a.id);setTab('applications')}}><div><b>{a.school}</b><small>{a.program}</small></div><div className="bar"><i style={{width:`${readiness(a)}%`}}/></div><strong>{readiness(a)}%</strong></button>)}</div></section>
        </div>
        <section className="panel"><div className="panelHead"><div><span className="eyebrow">ACTIVE APPLICATIONS</span><h2>Your pipeline</h2></div><button className="textBtn" onClick={()=>setTab('applications')}>View all <ChevronRight size={16}/></button></div><div className="appTable">{filteredApps.map(a=><ApplicationRow key={a.id} app={a} onOpen={()=>{setSelectedApp(a.id);setTab('applications')}}/>)}</div></section>
        <section className="panel insight"><div className="insightIcon"><Sparkles size={18}/></div><div><span className="eyebrow">EVIDENCE INTELLIGENCE</span><h2>Your evidence is reusable.</h2><p>ApplyX can match achievements like leadership, STEM and teamwork to application requirements instead of making you hunt through old certificates every time.</p></div><button className="secondary" onClick={()=>setTab('evidence')}>Open evidence vault</button></section>
      </>}

      {tab==='applications' && <div className="pageWrap"><div className="pageTitle"><div><div className="eyebrow">WORKFLOW</div><h1>Applications</h1><p>Track every requirement and see exactly what is blocking submission.</p></div><button className="primary" onClick={()=>setShowAdd(true)}><Plus size={17}/> New application</button></div><div className="applicationLayout"><div className="panel listPanel">{filteredApps.map(a=><button className={`applicationCard ${selected?.id===a.id?'selected':''}`} key={a.id} onClick={()=>setSelectedApp(a.id)}><div className="logoBox">{a.school.charAt(0)}</div><div className="grow"><b>{a.school}</b><small>{a.program}</small><div className="miniBar"><i style={{width:`${readiness(a)}%`}}/></div></div><div className="cardScore"><strong>{readiness(a)}%</strong><small>{a.deadline}</small></div></button>)}</div>{selected&&<ApplicationDetail app={selected} evidence={evidence} markDone={markDone}/>}</div></div>}

      {tab==='evidence' && <div className="pageWrap"><div className="pageTitle"><div><div className="eyebrow">EVIDENCE VAULT</div><h1>Proof, organized.</h1><p>Store achievements once. Reuse them across applications.</p></div><button className="primary" onClick={()=>setShowEvidence(true)}><Plus size={17}/> Add evidence</button></div><div className="evidenceGrid">{evidence.filter(e=>(e.title+' '+e.org+' '+e.category+' '+e.tags.join(' ')).toLowerCase().includes(query.toLowerCase())).map(e=><EvidenceCard key={e.id} evidence={e}/>)}</div></div>}

      {tab==='discover' && <div className="pageWrap"><div className="pageTitle"><div><div className="eyebrow">DISCOVERY</div><h1>Find the institution.</h1><p>Search a live university directory and jump straight into an application workspace.</p></div></div><section className="panel discoverPanel"><div className="discoverSearch"><Search size={18} aria-hidden/><input aria-label="Search universities worldwide" value={uniQuery} onChange={e=>setUniQuery(e.target.value)} placeholder="Search universities worldwide..."/></div><div className="uniResults">{uniQuery.length<3?<div className="empty"><Globe2 size={25}/><b>Start typing a university name</b><small>ApplyX uses the Hipo University Domains API for live institution discovery.</small></div>:universities.length?universities.map(u=><div className="uniRow" key={`${u.name}-${u.country}`}><div className="uniMark">{u.name.charAt(0)}</div><div className="grow"><b>{u.name}</b><small>{u.country} · {u.domains?.[0]||'domain unavailable'}</small></div><button className="secondary" onClick={()=>{setNewSchool(u.name);setShowAdd(true)}}>Track <ArrowUpRight size={14}/></button></div>):<div className="empty"><AlertCircle size={25}/><b>No matches</b><small>Try a broader university name.</small></div>}</div></section></div>}
    </section>

    <nav className="mobileTabBar" aria-label="Primary">
      <button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')} aria-label="Overview" aria-current={tab==='overview'?'page':undefined}><LayoutDashboard size={19}/><small>Overview</small></button>
      <button className={tab==='applications'?'active':''} onClick={()=>setTab('applications')} aria-label="Applications" aria-current={tab==='applications'?'page':undefined}><BriefcaseBusiness size={19}/><small>Apps</small></button>
      <button className={tab==='evidence'?'active':''} onClick={()=>setTab('evidence')} aria-label="Evidence Vault" aria-current={tab==='evidence'?'page':undefined}><FolderOpen size={19}/><small>Evidence</small></button>
      <button className={tab==='discover'?'active':''} onClick={()=>setTab('discover')} aria-label="Discover" aria-current={tab==='discover'?'page':undefined}><Globe2 size={19}/><small>Discover</small></button>
    </nav>

    {showAdd && <div className="overlay" role="dialog" aria-modal="true" aria-label="New application"><div className="modal"><button className="close" aria-label="Close dialog" onClick={()=>setShowAdd(false)}><X size={18}/></button><span className="eyebrow">NEW APPLICATION</span><h2>Import the mess. Get a plan.</h2><p>Paste requirements or provide a public application URL. ApplyX extracts the requirements into a structured workflow.</p><label>Institution / organization<input autoFocus value={newSchool} onChange={e=>setNewSchool(e.target.value)} placeholder="e.g. Stanford University"/></label><label>Program<input value={newProgram} onChange={e=>setNewProgram(e.target.value)} placeholder="e.g. Computer Science"/></label><div className="two"><label>Deadline<input value={newDeadline} onChange={e=>setNewDeadline(e.target.value)} placeholder="Aug 31, 2026"/></label><label>Public source URL<input value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="https://..."/></label></div><label>Requirements / source text<textarea value={sourceText} onChange={e=>setSourceText(e.target.value)} placeholder={'Paste the application requirements here...\n\nExample:\nAcademic transcript\nPersonal statement\nOne recommendation letter\nApplication fee'}/></label><button className="primary full" disabled={loading} onClick={analyzeSource}>{loading?<><Clock3 size={16}/> Analyzing...</>:<><Sparkles size={16}/> Analyze & create</>}</button><small className="modalFoot">AI is optional. Without an API key, ApplyX uses a deterministic local requirement parser.</small></div></div>}
    {showEvidence && <div className="overlay" role="dialog" aria-modal="true" aria-label="Add evidence"><div className="modal smallModal"><button className="close" aria-label="Close dialog" onClick={()=>setShowEvidence(false)}><X size={18}/></button><span className="eyebrow">EVIDENCE VAULT</span><h2>Add proof once.</h2><p>The demo creates a structured evidence item. The production roadmap adds document upload, OCR and richer metadata.</p><button className="uploadBox" onClick={addEvidence}><Upload size={20}/><b>Add a new evidence record</b><small>Achievement · certificate · project · leadership</small></button></div></div>}
    {toast&&<div className="toast"><CircleCheck size={16}/>{toast}</div>}
  </main>;
}

function Metric({label,value,note,danger=false}:{label:string;value:string;note:string;danger?:boolean}){return <div className="metric"><span>{label}</span><strong className={danger?'dangerText':''}>{value}</strong><small>{note}</small></div>}
function ApplicationRow({app,onOpen}:{app:Application;onOpen:()=>void}){return <button className="appRow" onClick={onOpen}><div className="logoBox">{app.school.charAt(0)}</div><div className="appName"><b>{app.school}</b><small>{app.program}</small></div><span className="deadline"><Clock3 size={12}/>{app.deadline}</span><span className={`status ${readiness(app)>80?'green':readiness(app)>50?'amber':'red'}`}>{readiness(app)}% ready</span><ChevronRight size={17}/></button>}
function ApplicationDetail({app,evidence,markDone}:{app:Application;evidence:Evidence[];markDone:(a:number,r:number)=>void}){const missing=app.requirements.filter(r=>r.status!=='done'); return <section className="panel detailPanel"><div className="appDetailTop"><div className="logoBox large">{app.school.charAt(0)}</div><div><h2>{app.school}</h2><p>{app.program} · Deadline {app.deadline}</p></div><div className="score"><strong>{readiness(app)}%</strong><small>ready</small></div></div><div className="detailGrid"><div><div className="sectionLabel">REQUIREMENTS · {app.requirements.length}</div><div className="reqs">{app.requirements.map(r=><div className="req" key={r.id}><StatusIcon status={r.status}/><div><b>{r.name}</b><small>{r.category||'Requirement'} · {r.status==='done'?'Complete':r.status==='review'?'Needs review':'Missing'}</small></div>{r.status!=='done'&&<button onClick={()=>markDone(app.id,r.id)}>Mark done</button>}</div>)}</div></div><div className="matchBox"><div className="sectionLabel">EVIDENCE MATCHING</div>{missing.length?missing.slice(0,3).map(r=>{const best=evidenceMatches(r,evidence)[0]; return <div className="match" key={r.id}><div><b>{r.name}</b><small>{best?.item.title||'No evidence yet'}</small></div><span>{best?.score||0}%</span></div>}):<div className="empty compact"><CircleCheck size={22}/><b>Everything is complete.</b><small>This application is ready for final review.</small></div>}</div></div></section>}
function EvidenceCard({evidence}:{evidence:Evidence}){return <article className="evidenceCard"><div className="evidenceTop"><div className="fileIcon"><FileText size={18}/></div><span>{evidence.category}</span></div><h3>{evidence.title}</h3><p>{evidence.org}</p><div className="evidenceDesc">{evidence.description}</div><div className="tags">{evidence.tags.map(t=><span key={t}>{t}</span>)}</div></article>}
