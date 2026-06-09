import { useState, useEffect, useRef } from "react";

const C = {
  bg:"#1a1410", surface:"#231c16", card:"#2c231a", border:"#3d3028",
  burgundy:"#8b2252", rust:"#c4622d", copper:"#b87333", olive:"#6b7c3a",
  forest:"#2d5a3d", wine:"#5c1a33", cream:"#f0e6d3", muted:"#9a8878",
  text:"#f0e6d3", gold:"#d4a843", green:"#4a7c59", red:"#8b3a3a", yellow:"#7a6a2a",
};

const CAT = {
  selfcare:  { bg:"#8b225218", border:C.burgundy, dot:C.burgundy, label:"Self-Care",  emoji:"🌸" },
  home:      { bg:"#c4622d18", border:C.rust,     dot:C.rust,     label:"Home",       emoji:"🏠" },
  jobsearch: { bg:"#6b7c3a18", border:C.olive,    dot:C.olive,    label:"Job Search", emoji:"💼" },
  custom:    { bg:"#b8733318", border:C.copper,   dot:C.copper,   label:"Other",      emoji:"✨" },
};

const ENERGY = {
  low:    { label:"low energy",    color:"#4a7c59", bg:"#4a7c5918", dot:"🟢" },
  medium: { label:"medium energy", color:"#b87333", bg:"#b8733318", dot:"🟡" },
  high:   { label:"high energy",   color:"#8b2252", bg:"#8b225218", dot:"🔴" },
};

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const FULL_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const FREQ_LABEL = { daily:"every day", weekly:"weekly", biweekly:"every 2 wks", monthly:"monthly" };

// order: 0=morning, 1=midday, 2=afternoon, 3=evening, 4=night
// energy: low / medium / high
// time: string
// if energy===high, subtasks are auto-shown

const DEFAULT_TASKS = [
  // ── MONDAY ──────────────────────────────────────────────────────
  { id:"m-am-0",    day:0, order:0, text:"Morning routine 🌅 — face wash + teeth",         category:"selfcare",  freq:"daily",   time:"5 min",   energy:"low",    subtasks:["wash face","brush teeth"] },
  { id:"m-study-0", day:0, order:1, text:"Study for cert 📚 — 30 min",                     category:"jobsearch", freq:"weekly",  time:"30 min",  energy:"medium", subtasks:["open study material","set a 30 min timer","take notes as you go"] },
  { id:"m-apply-0", day:0, order:2, text:"Apply to 1 job 📬",                              category:"jobsearch", freq:"daily",   time:"45 min",  energy:"high",   subtasks:["find a role on your target list","read the job description fully","tailor your resume for this role","write or adapt your cover letter","submit + note it down"] },
  { id:"m-recycle", day:0, order:2, text:"Recycling night 🗑️",                             category:"home",      freq:"weekly",  time:"10 min",  energy:"low",    subtasks:["gather recycling from room","sort into correct bins","take to curb"] },
  { id:"m-pm-0",    day:0, order:4, text:"Evening routine 🌙 — face wash + teeth + skincare", category:"selfcare", freq:"daily",  time:"10 min",  energy:"low",    subtasks:["wash face","brush teeth","skincare"] },
  { id:"m-shower-0",day:0, order:4, text:"Shower 🚿",                                      category:"selfcare",  freq:"daily",   time:"15 min",  energy:"low",    subtasks:[] },

  // ── TUESDAY ─────────────────────────────────────────────────────
  { id:"t-am-1",    day:1, order:0, text:"Morning routine 🌅 — face wash + teeth",         category:"selfcare",  freq:"daily",   time:"5 min",   energy:"low",    subtasks:["wash face","brush teeth"] },
  { id:"t-handles", day:1, order:1, text:"Wipe door handles + light switches 🧼",          category:"home",      freq:"biweekly",time:"5 min",   energy:"low",    subtasks:[] },
  { id:"t-apply-1", day:1, order:2, text:"Apply to 1 job 📬",                              category:"jobsearch", freq:"daily",   time:"45 min",  energy:"high",   subtasks:["find a role on your target list","read the job description fully","tailor your resume for this role","write or adapt your cover letter","submit + note it down"] },
  { id:"t-dishes",  day:1, order:2, text:"Do the dishes 🍽️ — bring from room + wash",     category:"home",      freq:"weekly",  time:"20 min",  energy:"medium", subtasks:["collect all dishes from room","bring to kitchen","wash","dry + put away"] },
  { id:"t-pm-1",    day:1, order:4, text:"Evening routine 🌙 — face wash + teeth + skincare", category:"selfcare", freq:"daily",  time:"10 min",  energy:"low",    subtasks:["wash face","brush teeth","skincare"] },
  { id:"t-shower-1",day:1, order:4, text:"Shower 🚿",                                      category:"selfcare",  freq:"daily",   time:"15 min",  energy:"low",    subtasks:[] },

  // ── WEDNESDAY ───────────────────────────────────────────────────
  { id:"w-am-2",    day:2, order:0, text:"Morning routine 🌅 — face wash + teeth",         category:"selfcare",  freq:"daily",   time:"5 min",   energy:"low",    subtasks:["wash face","brush teeth"] },
  { id:"w-laundry1",day:2, order:0, text:"Laundry step 1 👕 — put clothes in machine",     category:"home",      freq:"weekly",  time:"5 min",   energy:"low",    subtasks:["gather dirty clothes from room","check pockets","load machine + add detergent","press start"] },
  { id:"w-restock", day:2, order:1, text:"Restock personal care supplies 💊",              category:"home",      freq:"monthly", time:"10 min",  energy:"low",    subtasks:["check toiletries","check skincare","check medicine cabinet","add anything low to shopping list"] },
  { id:"w-study-2", day:2, order:1, text:"Study for cert 📚 — 30 min",                     category:"jobsearch", freq:"weekly",  time:"30 min",  energy:"medium", subtasks:["open study material","set a 30 min timer","take notes as you go"] },
  { id:"w-laundry2",day:2, order:2, text:"Laundry step 2 👕 — move to dryer or hang dry",  category:"home",      freq:"weekly",  time:"5 min",   energy:"low",    subtasks:["move clothes to dryer or hang on stand","set dryer if using"] },
  { id:"w-plants",  day:2, order:2, text:"Water + check houseplants 🌿",                   category:"home",      freq:"biweekly",time:"10 min",  energy:"low",    subtasks:[] },
  { id:"w-surfaces",day:2, order:2, text:"Wipe down surfaces + desk 🧴",                   category:"home",      freq:"weekly",  time:"10 min",  energy:"low",    subtasks:[] },
  { id:"w-pm-2",    day:2, order:4, text:"Evening routine 🌙 — face wash + teeth + skincare", category:"selfcare", freq:"daily",  time:"10 min",  energy:"low",    subtasks:["wash face","brush teeth","skincare"] },
  { id:"w-shower-2",day:2, order:4, text:"Shower 🚿",                                      category:"selfcare",  freq:"daily",   time:"15 min",  energy:"low",    subtasks:[] },

  // ── THURSDAY ────────────────────────────────────────────────────
  { id:"th-am-3",   day:3, order:0, text:"Morning routine 🌅 — face wash + teeth",         category:"selfcare",  freq:"daily",   time:"5 min",   energy:"low",    subtasks:["wash face","brush teeth"] },
  { id:"th-study",  day:3, order:1, text:"Study for cert 📚 — 30 min",                     category:"jobsearch", freq:"weekly",  time:"30 min",  energy:"medium", subtasks:["open study material","set a 30 min timer","take notes as you go"] },
  { id:"th-interv", day:3, order:1, text:"Interview prep 🎤 — practice 2 questions",       category:"jobsearch", freq:"weekly",  time:"20 min",  energy:"medium", subtasks:["pick 2 behavioural questions","write STAR answers","say them out loud once"] },
  { id:"th-fold",   day:3, order:2, text:"Laundry step 3 🧺 — fold + put away",            category:"home",      freq:"weekly",  time:"20 min",  energy:"medium", subtasks:["grab all clean laundry","fold everything — one item at a time","sort into piles by type","put away by category","return hangers"] },
  { id:"th-vacuum", day:3, order:2, text:"Vacuum / sweep floor 🧹",                        category:"home",      freq:"weekly",  time:"10 min",  energy:"medium", subtasks:[] },
  { id:"th-underbed",day:3,order:2, text:"Clean under + behind bed 🧹",                    category:"home",      freq:"biweekly",time:"15 min",  energy:"medium", subtasks:["move anything stored under bed","sweep/vacuum underneath","wipe skirting board"] },
  { id:"th-pm-3",   day:3, order:4, text:"Evening routine 🌙 — face wash + teeth + skincare", category:"selfcare", freq:"daily",  time:"10 min",  energy:"low",    subtasks:["wash face","brush teeth","skincare"] },
  { id:"th-shower-3",day:3,order:4, text:"Shower 🚿",                                      category:"selfcare",  freq:"daily",   time:"15 min",  energy:"low",    subtasks:[] },

  // ── FRIDAY ──────────────────────────────────────────────────────
  { id:"f-shower-4",day:4, order:0, text:"Hair wash shower 🚿💆 — do this in the morning so hair can dry", category:"selfcare", freq:"daily", time:"30 min", energy:"medium", subtasks:["wet hair thoroughly","shampoo + massage scalp","condition for 3 min","rinse cold","towel dry","diffuse or air dry"] },
  { id:"f-am-4",    day:4, order:0, text:"Morning routine 🌅 — face wash + teeth",         category:"selfcare",  freq:"daily",   time:"5 min",   energy:"low",    subtasks:["wash face","brush teeth"] },
  { id:"f-apply-4", day:4, order:1, text:"Apply to 1 job 📬",                              category:"jobsearch", freq:"daily",   time:"45 min",  energy:"high",   subtasks:["find a role on your target list","read the job description fully","tailor your resume for this role","write or adapt your cover letter","submit + note it down"] },
  { id:"f-trash",   day:4, order:2, text:"Take trash out of room 🪣",                      category:"home",      freq:"weekly",  time:"5 min",   energy:"low",    subtasks:[] },
  { id:"f-declutter",day:4,order:2, text:"Declutter 🗂️ — one bag or box out of room",     category:"home",      freq:"monthly", time:"20 min",  energy:"high",   subtasks:["pick one small area — just one","sort everything: keep / donate / bin","bag it up","move the bag out of your room today"] },
  { id:"f-pm-4",    day:4, order:4, text:"Evening routine 🌙 — face wash + teeth + skincare", category:"selfcare", freq:"daily",  time:"10 min",  energy:"low",    subtasks:["wash face","brush teeth","skincare"] },

  // ── SATURDAY ────────────────────────────────────────────────────
  { id:"s-am-5",    day:5, order:0, text:"Morning routine 🌅 — face wash + teeth",         category:"selfcare",  freq:"daily",   time:"5 min",   energy:"low",    subtasks:["wash face","brush teeth"] },
  { id:"s-study-5", day:5, order:1, text:"Study for cert 📚 — 30 min",                     category:"jobsearch", freq:"weekly",  time:"30 min",  energy:"medium", subtasks:["open study material","set a 30 min timer","take notes as you go"] },
  { id:"s-skipprep",day:5, order:1, text:"Skip-level interview prep 🎯 — 1 question",      category:"jobsearch", freq:"weekly",  time:"15 min",  energy:"medium", subtasks:["pick a skip-level style question","write your answer","focus on strategic thinking not just task execution"] },
  { id:"s-sheets",  day:5, order:2, text:"Change + wash bed sheets 🛏️",                   category:"home",      freq:"weekly",  time:"20 min",  energy:"medium", subtasks:["strip bed","put sheets in wash","remake bed with clean sheets while they wash"] },
  { id:"s-mirrors", day:5, order:2, text:"Wipe mirrors + windows in room 🪟",              category:"home",      freq:"biweekly",time:"10 min",  energy:"low",    subtasks:[] },
  { id:"s-deepclean",day:5,order:2, text:"Deep clean room 🧹 — baseboards + behind furniture", category:"home", freq:"monthly", time:"45 min",  energy:"high",   subtasks:["put on a playlist first","move furniture slightly — one piece at a time","vacuum behind + under","wipe baseboards","put furniture back","reward yourself after"] },
  { id:"s-selfcare",day:5, order:2, text:"Self-care check-in 💅 — nails, skin, anything needing attention", category:"selfcare", freq:"weekly", time:"15 min", energy:"low", subtasks:[] },
  { id:"s-pm-5",    day:5, order:4, text:"Evening routine 🌙 — face wash + teeth + skincare", category:"selfcare", freq:"daily",  time:"10 min",  energy:"low",    subtasks:["wash face","brush teeth","skincare"] },
  { id:"s-shower-5",day:5, order:4, text:"Shower 🚿",                                      category:"selfcare",  freq:"daily",   time:"15 min",  energy:"low",    subtasks:[] },

  // ── SUNDAY ──────────────────────────────────────────────────────
  { id:"su-am-6",   day:6, order:0, text:"Morning routine 🌅 — face wash + teeth",         category:"selfcare",  freq:"daily",   time:"5 min",   energy:"low",    subtasks:["wash face","brush teeth"] },
  { id:"su-apply-6",day:6, order:1, text:"Research a company on your target list 🔍",      category:"jobsearch", freq:"weekly",  time:"20 min",  energy:"medium", subtasks:["look up the company GRC team","check recent news / LinkedIn","note anything to tailor your cover letter"] },
  { id:"su-pm-6",   day:6, order:4, text:"Evening routine 🌙 — face wash + teeth + skincare", category:"selfcare", freq:"daily",  time:"10 min",  energy:"low",    subtasks:["wash face","brush teeth","skincare"] },
  { id:"su-shower-6",day:6,order:4, text:"Shower 🚿",                                      category:"selfcare",  freq:"daily",   time:"15 min",  energy:"low",    subtasks:[] },
];

const MYSTERIES = [
  { pts:10,  unlocked:false, icon:"🔮", title:"your first secret", color:C.burgundy, content:"okay so your gemini stellium in the 7th house? that's literally why you mentally draft 47 versions of every message before sending. AND why you're so good at seeing both sides of every situation. chaotic gift but it's a gift bestie 💫" },
  { pts:25,  unlocked:false, icon:"🍂", title:"deep autumn mode: unlocked", color:C.rust, content:"you just unlocked your palette. burgundy, rust, copper, forest green, wine. these are YOUR colors — chosen by the universe and seasonal color analysis. wear them. surround yourself with them. you look incredible in them. 🍂" },
  { pts:50,  unlocked:false, icon:"🌕", title:"virgo moon dispatch", color:C.copper, content:"virgo moon conjunct MC means your emotional security is tied to being competent and useful. so when you feel anxious? your brain says 'fix something.' this is why you research everything to death. you're not overthinking. you're moon-ing. there's a difference. 🌕" },
  { pts:75,  unlocked:false, icon:"🧶", title:"from the yarn vault", color:C.olive, content:"the fact that you started a CABLE SWEATER as your first sweater project is so scorpio rising of you. no beginner scarves here. straight to the cables. frogging is not failing — every knitter frogs. the olive green is going to look stunning on you. deep autumn + handmade = unbeatable. 🧶" },
  { pts:100, unlocked:false, icon:"🌱", title:"meet Fig", color:C.forest, content:"you just grew a plant 🌱 her name is Fig. she lives in your planner now. she's a fiddle leaf fig because she's dramatic and particular and somehow still beautiful — you two have a lot in common. keep going and she'll grow." },
  { pts:150, unlocked:false, icon:"🍮", title:"ras malai achievement unlocked", color:C.gold, content:"you poached 26 chenna discs FROM SCRATCH. most people just buy ras malai. you made the cheese. you shaped the discs. you froze them. the rabri is coming. this is not a small thing. you are a person who does impressive things. the job search is going the same way. 🍮" },
  { pts:200, unlocked:false, icon:"🔐", title:"cancer sun in the 8th: the real tea", color:C.wine, content:"GOSSIP: your cancer sun in the 8th house means you feel everything deeply but show almost none of it on the surface. people think you're chill. you are not chill. you are a slow-boiling ocean. this is why you're good at GRC — you naturally sense hidden risks. that's not anxiety. that's your superpower dressed up in anxious clothing. 🦀" },
  { pts:300, unlocked:false, icon:"🏆", title:"300 points. genuinely.", color:C.burgundy, content:"ISO 27001 auditors don't build themselves. GRC professionals don't grow on trees. YOU are building a career from scratch in a field that requires precision, patience, and holding a lot of complexity at once. Wealthsimple, Rewind, whoever gets you — they're lucky. keep going. 💼✨" },
];

const WEEK_SURPRISES = [
  "🎉 you completed every task this week. every. single. one. your virgo moon is doing a little dance right now.",
  "🌟 full week. done. that's not luck, that's you building something real.",
  "✨ complete week! the version of you from two months ago would be so proud of this.",
  "🍂 flawless week. deep autumn brain in full effect.",
];

const JOB_MILESTONES = [
  { count:1,  msg:"first application in. the scariest one is always the first 📬" },
  { count:5,  msg:"5 applications. you're not someone who gives up 💪" },
  { count:10, msg:"10 applications. ISO 27001 auditors don't build themselves 📊" },
  { count:20, msg:"20 applications. this is what a GRC career looks like being built in real time 🏗️" },
];

const FACE_WASH_MSGS = [
  "5 face washes!! your skin barrier is thriving 🌸",
  "10 face washes. you convinced yourself you didn't need to and did it anyway. that's the whole game ✨",
  "15 face washes. this is a habit now. virgo moon approves 🌕",
];

const SK = "cassplanner-v4";
function load() { try { const r = localStorage.getItem(SK); return r ? JSON.parse(r) : null; } catch { return null; } }
function save(s) { try { localStorage.setItem(SK, JSON.stringify(s)); } catch {} }

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", background:C.gold, color:C.bg, padding:"10px 20px", borderRadius:12, fontWeight:800, fontSize:13, zIndex:1000, boxShadow:"0 4px 24px #00000080", maxWidth:"88vw", textAlign:"center", lineHeight:1.5 }}>{msg}</div>
  );
}

function EnergyBadge({ energy, time }) {
  const e = ENERGY[energy];
  return (
    <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:5, flexWrap:"wrap" }}>
      <span style={{ fontSize:10, fontWeight:700, color:e.color, background:e.bg, border:`1px solid ${e.color}`, borderRadius:4, padding:"1px 6px", letterSpacing:"0.05em" }}>
        {e.dot} {e.label}
      </span>
      {time && <span style={{ fontSize:10, color:C.muted, background:C.surface, border:`1px solid ${C.border}`, borderRadius:4, padding:"1px 6px" }}>⏱ {time}</span>}
    </div>
  );
}

function FreqBadge({ freq }) {
  if (!freq || freq === "daily") return null;
  const colors = { weekly:C.muted, biweekly:C.copper, monthly:C.burgundy };
  return <span style={{ fontSize:9, fontWeight:800, letterSpacing:"0.07em", textTransform:"uppercase", color:colors[freq]||C.muted, border:`1px solid ${colors[freq]||C.muted}`, borderRadius:4, padding:"1px 5px", marginLeft:4, opacity:0.8 }}>{FREQ_LABEL[freq]}</span>;
}

function playDoneSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // C5 E5 G5 — a little major chord
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.35);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.35);
    });
  } catch {}
}

function BurstParticles({ x, y, color, onDone }) {
  const particles = Array.from({ length: 10 }, (_, i) => ({
    angle: (i / 10) * Math.PI * 2,
    dist: 30 + Math.random() * 30,
    size: 4 + Math.random() * 4,
    color: [color, C.gold, C.cream, C.copper][Math.floor(Math.random() * 4)],
  }));
  useEffect(() => { const t = setTimeout(onDone, 700); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed", left:x, top:y, pointerEvents:"none", zIndex:500 }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position:"absolute",
          width:p.size, height:p.size,
          borderRadius:"50%",
          background:p.color,
          transform:`translate(-50%,-50%)`,
          animation:`burst-${i} 0.6s ease-out forwards`,
        }}>
          <style>{`
            @keyframes burst-${i} {
              0%   { transform: translate(-50%,-50%) translate(0,0) scale(1); opacity:1; }
              100% { transform: translate(-50%,-50%) translate(${Math.cos(p.angle)*p.dist}px,${Math.sin(p.angle)*p.dist}px) scale(0); opacity:0; }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
}

function TaskCard({ task, onToggle, onMove, onDelete }) {
  const isHigh = task.energy === "high";
  const [open, setOpen] = useState(isHigh);
  const [burst, setBurst] = useState(null);
  const [ring, setRing] = useState(false);
  const cat = CAT[task.category];

  const handleToggle = (e) => {
    const completing = !task.done;
    if (completing) {
      const rect = e.currentTarget.getBoundingClientRect();
      setBurst({ x: rect.left + rect.width/2, y: rect.top + rect.height/2 });
      setRing(true);
      setTimeout(() => setRing(false), 400);
      playDoneSound();
    }
    onToggle(task.id);
  };

  return (
    <>
      {burst && <BurstParticles x={burst.x} y={burst.y} color={cat.dot} onDone={()=>setBurst(null)} />}
    <div style={{ background:task.done ? C.surface : cat.bg, border:`1px solid ${task.done ? C.border : cat.border}`, borderRadius:10, padding:"10px 12px", marginBottom:6, opacity:task.done ? 0.5 : 1, transition:"all 0.2s" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
        <button onClick={handleToggle} style={{
          width:20, height:20, borderRadius:"50%", border:`2px solid ${cat.dot}`,
          background:task.done ? cat.dot : "transparent", cursor:"pointer",
          flexShrink:0, marginTop:1, display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow: ring ? `0 0 0 6px ${cat.dot}55` : "none",
          transform: ring ? "scale(1.3)" : "scale(1)",
          transition:"transform 0.15s, box-shadow 0.15s",
        }}>
          {task.done && <span style={{ fontSize:9, color:C.bg, fontWeight:900 }}>✓</span>}
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, lineHeight:1.35, textDecoration:task.done?"line-through":"none" }}>
            {task.text}<FreqBadge freq={task.freq} />
          </div>
          <EnergyBadge energy={task.energy || "low"} time={task.time} />
          {task.subtasks?.length > 0 && (
            <>
              <button onClick={() => setOpen(o => !o)} style={{ fontSize:11, color:C.muted, background:"none", border:"none", cursor:"pointer", padding:"4px 0 2px", display:"block" }}>
                {open ? "▲ hide steps" : `▼ ${task.subtasks.length} steps`}
              </button>
              {open && (
                <div style={{ marginTop:4, background:C.surface, borderRadius:8, padding:"8px 10px" }}>
                  {task.subtasks.map((s,i) => (
                    <div key={i} style={{ fontSize:12, color:C.muted, padding:"3px 0", borderBottom:i < task.subtasks.length-1 ? `1px solid ${C.border}` : "none", display:"flex", gap:6, alignItems:"flex-start" }}>
                      <span style={{ color:cat.dot, flexShrink:0 }}>·</span>{s}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div style={{ display:"flex", gap:4, flexShrink:0 }}>
          <select value={task.day} onChange={e => onMove(task.id, parseInt(e.target.value))} style={{ fontSize:10, background:C.surface, color:C.muted, border:`1px solid ${C.border}`, borderRadius:4, padding:"2px 4px", cursor:"pointer" }}>
            {DAYS.map((d,i) => <option key={d} value={i}>{d}</option>)}
          </select>
          <button onClick={() => onDelete(task.id)} style={{ fontSize:11, background:"none", border:"none", color:C.muted, cursor:"pointer" }}>✕</button>
        </div>
      </div>
      <div style={{ marginTop:5 }}>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.07em", color:cat.dot, background:cat.bg, border:`1px solid ${cat.border}`, borderRadius:4, padding:"1px 6px", textTransform:"uppercase" }}>{cat.emoji} {cat.label}</span>
      </div>
    </div>
    </>
  );
}

function MysteryCard({ m, isNew, onDismiss }) {
  return (
    <div style={{ background:C.card, border:`2px solid ${m.color}`, borderRadius:16, padding:20, marginBottom:12, position:"relative" }}>
      {isNew && <div style={{ position:"absolute", top:10, right:10, background:m.color, color:C.bg, fontSize:10, fontWeight:900, padding:"2px 8px", borderRadius:20 }}>NEW ✨</div>}
      <div style={{ fontSize:28, marginBottom:8 }}>{m.icon}</div>
      <div style={{ fontSize:13, fontWeight:800, color:m.color, marginBottom:6 }}>{m.pts} pts — {m.title}</div>
      <div style={{ fontSize:13, color:C.cream, lineHeight:1.6 }}>{m.content}</div>
      {isNew && <button onClick={onDismiss} style={{ marginTop:12, background:m.color, color:C.bg, border:"none", borderRadius:8, padding:"7px 16px", fontWeight:800, fontSize:12, cursor:"pointer" }}>got it 💫</button>}
    </div>
  );
}

function WeekStats({ tasks, points, onClose }) {
  const total = tasks.length, done = tasks.filter(t => t.done).length;
  const pct = total ? Math.round((done/total)*100) : 0;
  const perfect = pct === 100;
  const byCat = Object.keys(CAT).map(cat => ({ cat, label:CAT[cat].label, emoji:CAT[cat].emoji, dot:CAT[cat].dot, done:tasks.filter(t=>t.category===cat&&t.done).length, total:tasks.filter(t=>t.category===cat).length })).filter(c=>c.total>0);
  const surprise = WEEK_SURPRISES[Math.floor(Math.random()*WEEK_SURPRISES.length)];
  return (
    <div style={{ position:"fixed", inset:0, background:"#00000095", zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ maxWidth:400, width:"100%", background:C.card, border:`2px solid ${C.gold}`, borderRadius:20, padding:24, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ fontSize:22, marginBottom:4 }}>📊</div>
        <div style={{ fontSize:17, fontWeight:900, color:C.gold, marginBottom:2 }}>week in review</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:20 }}>sunday night wrap-up</div>
        <div style={{ fontSize:32, fontWeight:900, color:C.cream, marginBottom:2 }}>{pct}%</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>{done} of {total} tasks completed</div>
        <div style={{ height:8, borderRadius:4, background:C.border, marginBottom:20, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.burgundy},${C.gold})`, transition:"width 0.6s" }} />
        </div>
        {byCat.map(c => (
          <div key={c.cat} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontSize:13, color:C.muted }}>{c.emoji} {c.label}</span>
            <span style={{ fontSize:13, fontWeight:700, color:c.dot }}>{c.done}/{c.total}</span>
          </div>
        ))}
        {perfect && <div style={{ marginTop:16, background:`${C.gold}18`, border:`1px solid ${C.gold}`, borderRadius:12, padding:14 }}><div style={{ fontSize:13, color:C.gold, fontWeight:700, lineHeight:1.5 }}>{surprise}</div><div style={{ fontSize:12, color:C.muted, marginTop:6 }}>+50 bonus points 🎁</div></div>}
        {!perfect && pct>=70 && <div style={{ marginTop:16, fontSize:13, color:C.copper, lineHeight:1.5 }}>{pct}% is real progress. not everything has to be perfect to count. 🍂</div>}
        {!perfect && pct<70 && <div style={{ marginTop:16, fontSize:13, color:C.muted, lineHeight:1.5 }}>rough week. it happens. you don't lose points for hard weeks. the tasks will be here monday. 🌱</div>}
        <button onClick={onClose} style={{ marginTop:20, width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:`linear-gradient(135deg,${C.burgundy},${C.copper})`, color:C.cream, fontWeight:800, fontSize:14, cursor:"pointer" }}>start fresh monday ✨</button>
      </div>
    </div>
  );
}

export default function App() {
  const saved = load();
  const [tasks, setTasks]           = useState(saved?.tasks ?? DEFAULT_TASKS);
  const [points, setPoints]         = useState(saved?.points ?? 0);
  const [mysteries, setMysteries]   = useState(saved?.mysteries ?? MYSTERIES);
  const [jobApps, setJobApps]       = useState(saved?.jobApps ?? 0);
  const [faceWashes, setFaceWashes] = useState(saved?.faceWashes ?? 0);
  const [view, setView]             = useState("today");
  const [toast, setToast]           = useState("");
  const [newMystery, setNewMystery] = useState(null);
  const [showStats, setShowStats]   = useState(false);
  const [aiInput, setAiInput]       = useState("");
  const [aiCat, setAiCat]           = useState("jobsearch");
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiError, setAiError]       = useState("");
  const [addDay, setAddDay]         = useState(0);
  const prevPts = useRef(points);

  const todayIdx = (new Date().getDay() + 6) % 7;
  const isSunday = todayIdx === 6;

  useEffect(() => { save({ tasks, points, mysteries, jobApps, faceWashes }); }, [tasks, points, mysteries, jobApps, faceWashes]);

  useEffect(() => {
    if (points <= prevPts.current) { prevPts.current = points; return; }
    prevPts.current = points;
    const updated = [...mysteries];
    for (let i = 0; i < updated.length; i++) {
      if (!updated[i].unlocked && points >= updated[i].pts) {
        updated[i] = { ...updated[i], unlocked:true };
        setMysteries(updated); setNewMystery(updated[i]); return;
      }
    }
    setMysteries(updated);
  }, [points]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3200); };

  const toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const completing = !task.done;
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done:!t.done } : t));
    const pts = task.category==="jobsearch" ? 5 : task.category==="selfcare" ? 3 : 2;
    if (completing) {
      setPoints(p => p + pts);
      showToast(`+${pts} pts ✨`);
      if (task.text.toLowerCase().includes("apply")) { const n=jobApps+1; setJobApps(n); const m=JOB_MILESTONES.find(x=>x.count===n); if(m) setTimeout(()=>showToast(m.msg),3400); }
      if (task.text.toLowerCase().includes("face wash")||task.text.toLowerCase().includes("morning routine")||task.text.toLowerCase().includes("evening routine")) { const n=faceWashes+1; setFaceWashes(n); const idx=[5,10,15].indexOf(n); if(idx>=0) setTimeout(()=>showToast(FACE_WASH_MSGS[idx]),3400); }
    } else { setPoints(p => Math.max(0, p-pts)); }
  };

  const moveTask   = (id, day) => setTasks(ts => ts.map(t => t.id===id ? {...t, day} : t));
  const deleteTask = (id) => setTasks(ts => ts.filter(t => t.id!==id));

  const handleAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true); setAiError("");
    try {
      const isJob = aiCat==="jobsearch";
      const prompt = isJob
        ? `Help someone with ADHD break a job search task into tiny concrete steps. Task: "${aiInput}". Return ONLY valid JSON no markdown: {"taskName":"short name","subtasks":["step 1","step 2","step 3"],"suggestedDay":0,"time":"X min","energy":"low|medium|high"}. suggestedDay 0-6 Mon=0. Max 5 steps each under 15 min.`
        : `Help someone with ADHD add a task to their weekly planner. Task: "${aiInput}", Category: ${aiCat}. Return ONLY valid JSON no markdown: {"taskName":"short name","subtasks":[],"suggestedDay":${addDay},"time":"X min","energy":"low|medium|high"}`;
      const res = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:500, messages:[{role:"user",content:prompt}] }) });
      const data = await res.json();
      const raw = data.content?.find(b=>b.type==="text")?.text||"";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      const isHighEnergy = parsed.energy === "high";
      const newTask = { id:`t-${Date.now()}`, text:parsed.taskName||aiInput, category:aiCat, day:typeof parsed.suggestedDay==="number"?parsed.suggestedDay:addDay, done:false, subtasks:parsed.subtasks||[], freq:"custom", time:parsed.time||"", energy:parsed.energy||"medium", order:2 };
      setTasks(ts => [...ts, newTask]);
      setAiInput("");
      showToast(`"${newTask.text}" added${isHighEnergy?" — steps shown so it's easier to start 🎯":""}!`);
    } catch { setAiError("something went wrong — try again"); }
    setAiLoading(false);
  };

  const handleWeekClose = () => {
    if (tasks.every(t=>t.done)) setPoints(p=>p+50);
    setTasks(ts => ts.map(t=>({...t,done:false})));
    setShowStats(false);
  };

  const todayTasks = [...tasks.filter(t=>t.day===todayIdx)].sort((a,b)=>(a.order??2)-(b.order??2));
  const doneToday  = todayTasks.filter(t=>t.done).length;
  const pct        = todayTasks.length ? Math.round((doneToday/todayTasks.length)*100) : 0;
  const nextM      = mysteries.find(m=>!m.unlocked);
  const ptsToNext  = nextM ? nextM.pts-points : 0;
  const unlocked   = mysteries.filter(m=>m.unlocked).length;
  const plantStage = unlocked===0?"🌱":unlocked<=2?"🌿":unlocked<=4?"🪴":unlocked<=6?"🌳":"🌲";

  const navItems = [{id:"today",icon:"⚡",label:"today"},{id:"week",icon:"📅",label:"week"},{id:"add",icon:"＋",label:"add"},{id:"secrets",icon:"🔮",label:"secrets"}];

  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"'Inter',system-ui,sans-serif", color:C.text, paddingBottom:80 }}>
      <Toast msg={toast} />

      {newMystery && (
        <div style={{ position:"fixed", inset:0, background:"#00000090", zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ maxWidth:400, width:"100%" }}>
            <div style={{ fontSize:13, color:C.gold, fontWeight:800, textAlign:"center", marginBottom:12, letterSpacing:"0.1em" }}>✦ MYSTERY UNLOCKED ✦</div>
            <MysteryCard m={newMystery} isNew={true} onDismiss={()=>setNewMystery(null)} />
          </div>
        </div>
      )}

      {showStats && <WeekStats tasks={tasks} points={points} onClose={handleWeekClose} />}

      {/* Header */}
      <div style={{ padding:"20px 20px 0", borderBottom:`1px solid ${C.border}`, paddingBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:20, fontWeight:900, letterSpacing:"-0.03em", color:C.cream }}>{plantStage} brain garden</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{FULL_DAYS[todayIdx]}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:22, fontWeight:900, color:C.gold }}>{points}</div>
            <div style={{ fontSize:10, color:C.muted, fontWeight:700, letterSpacing:"0.08em" }}>POINTS</div>
            {nextM && <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{ptsToNext} to next 🔒</div>}
          </div>
        </div>
        {nextM && <div style={{ marginTop:10, height:4, borderRadius:2, background:C.border, overflow:"hidden" }}><div style={{ height:"100%", width:`${Math.min(100,(points/nextM.pts)*100)}%`, background:`linear-gradient(90deg,${C.burgundy},${C.gold})`, transition:"width 0.5s" }} /></div>}
        {isSunday && <button onClick={()=>setShowStats(true)} style={{ marginTop:10, width:"100%", padding:"8px 0", borderRadius:8, border:`1px solid ${C.gold}`, background:`${C.gold}18`, color:C.gold, fontWeight:800, fontSize:12, cursor:"pointer" }}>📊 view this week's stats</button>}
      </div>

      <div style={{ padding:20 }}>

        {/* TODAY */}
        {view==="today" && (
          <div style={{ maxWidth:500 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <div style={{ fontSize:15, fontWeight:800 }}>⚡ {FULL_DAYS[todayIdx]}</div>
              <div style={{ fontSize:12, color:C.muted }}>{doneToday}/{todayTasks.length} done</div>
            </div>
            {todayTasks.length>0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ height:6, borderRadius:3, background:C.border, overflow:"hidden" }}><div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.burgundy},${C.copper},${C.gold})`, transition:"width 0.4s" }} /></div>
                {pct===100 && <div style={{ fontSize:13, color:C.gold, fontWeight:700, marginTop:6 }}>🎉 everything done today. genuinely impressive.</div>}
              </div>
            )}
            {todayTasks.length===0 && <div style={{ fontSize:13, color:C.muted, padding:"20px 0" }}>nothing scheduled — enjoy the rest 🌿</div>}

            {/* group by time of day */}
            {[
              { label:"🌅 morning",   orderVals:[0] },
              { label:"☀️ daytime",   orderVals:[1,2] },
              { label:"🌙 evening",   orderVals:[3,4] },
            ].map(group => {
              const gt = todayTasks.filter(t => group.orderVals.includes(t.order??2));
              if (!gt.length) return null;
              return (
                <div key={group.label} style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8, paddingBottom:4, borderBottom:`1px solid ${C.border}` }}>{group.label}</div>
                  {gt.map(t => <TaskCard key={t.id} task={t} onToggle={toggleTask} onMove={moveTask} onDelete={deleteTask} />)}
                </div>
              );
            })}
          </div>
        )}

        {/* WEEK */}
        {view==="week" && (
          <div style={{ overflowX:"auto", paddingBottom:12 }}>
            <div style={{ display:"flex", gap:10, minWidth:"fit-content" }}>
              {DAYS.map((_,i) => {
                const dt = [...tasks.filter(t=>t.day===i)].sort((a,b)=>(a.order??2)-(b.order??2));
                const dd = dt.filter(t=>t.done).length;
                const isToday = i===todayIdx;
                return (
                  <div key={i} style={{ flex:"0 0 200px", minWidth:200, background:isToday?"#2c1f18":C.surface, border:`1px solid ${isToday?C.rust:C.border}`, borderRadius:12, padding:12 }}>
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:11, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:isToday?C.rust:C.muted }}>{isToday?"◉ ":""}{FULL_DAYS[i]}</div>
                      <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{dd}/{dt.length}</div>
                      <div style={{ height:3, borderRadius:2, background:C.border, marginTop:4, overflow:"hidden" }}><div style={{ height:"100%", width:dt.length?`${(dd/dt.length)*100}%`:"0%", background:isToday?C.rust:C.olive, transition:"width 0.3s" }} /></div>
                    </div>
                    {dt.length===0 && <div style={{ fontSize:12, color:C.border, textAlign:"center", padding:"16px 0" }}>rest ☁️</div>}
                    {dt.map(t => <TaskCard key={t.id} task={t} onToggle={toggleTask} onMove={moveTask} onDelete={deleteTask} />)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ADD */}
        {view==="add" && (
          <div style={{ maxWidth:500 }}>
            <div style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>＋ add a task</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>type anything — ai breaks it down, estimates time + energy, and schedules it</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
              {Object.entries(CAT).map(([cat,c]) => (
                <button key={cat} onClick={()=>setAiCat(cat)} style={{ padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", border:`2px solid ${aiCat===cat?c.dot:C.border}`, background:aiCat===cat?c.bg:"transparent", color:aiCat===cat?c.dot:C.muted }}>{c.emoji} {c.label}</button>
              ))}
            </div>
            <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder={aiCat==="jobsearch"?"e.g. prepare for a skip-level interview at a fintech":aiCat==="selfcare"?"e.g. start a hair care routine":aiCat==="home"?"e.g. reorganise my wardrobe":"e.g. call the dentist"} rows={3}
              style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:13, padding:14, resize:"vertical", fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
            {aiCat!=="jobsearch" && (
              <div style={{ marginTop:12, marginBottom:4 }}>
                <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>schedule for</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {DAYS.map((d,i) => <button key={d} onClick={()=>setAddDay(i)} style={{ padding:"5px 11px", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", border:`1px solid ${addDay===i?C.copper:C.border}`, background:addDay===i?"#b8733320":"transparent", color:addDay===i?C.copper:C.muted }}>{d}</button>)}
                </div>
              </div>
            )}
            <button onClick={handleAI} disabled={aiLoading||!aiInput.trim()} style={{ marginTop:14, width:"100%", padding:"13px 0", borderRadius:10, border:"none", fontWeight:800, fontSize:14, cursor:aiLoading||!aiInput.trim()?"not-allowed":"pointer", background:aiLoading||!aiInput.trim()?C.border:`linear-gradient(135deg,${C.burgundy},${C.copper})`, color:aiLoading||!aiInput.trim()?C.muted:C.cream }}>
              {aiLoading?"✦ thinking...":"✦ add + break it down"}
            </button>
            {aiError && <div style={{ marginTop:8, fontSize:12, color:C.rust }}>{aiError}</div>}
            <div style={{ marginTop:24 }}>
              <div style={{ fontSize:11, color:C.muted, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>quick add</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[{text:"wash face",cat:"selfcare"},{text:"shower",cat:"selfcare"},{text:"take trash out",cat:"home"},{text:"do dishes",cat:"home"},{text:"apply to 1 job",cat:"jobsearch"},{text:"interview prep",cat:"jobsearch"},{text:"study for cert",cat:"jobsearch"},{text:"skip-level prep",cat:"jobsearch"}].map(p => (
                  <button key={p.text} onClick={()=>{setAiCat(p.cat);setAiInput(p.text);}} style={{ padding:"5px 11px", borderRadius:20, fontSize:11, fontWeight:600, cursor:"pointer", border:`1px solid ${CAT[p.cat].border}`, background:CAT[p.cat].bg, color:CAT[p.cat].dot }}>{CAT[p.cat].emoji} {p.text}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECRETS */}
        {view==="secrets" && (
          <div style={{ maxWidth:500 }}>
            <div style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>🔮 your secrets</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>{unlocked} of {mysteries.length} unlocked · {points} pts total</div>
            {mysteries.map((m,i) => m.unlocked ? <MysteryCard key={i} m={m} isNew={false} /> : (
              <div key={i} style={{ background:C.surface, border:`1px dashed ${C.border}`, borderRadius:16, padding:16, marginBottom:10, display:"flex", alignItems:"center", gap:12, opacity:0.6 }}>
                <div style={{ fontSize:22, filter:"grayscale(1)" }}>🔒</div>
                <div><div style={{ fontSize:12, color:C.muted, fontWeight:700 }}>{m.pts} points</div><div style={{ fontSize:13, color:C.muted }}>mystery unlock</div></div>
              </div>
            ))}
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:16, marginTop:8 }}>
              <div style={{ fontSize:12, fontWeight:800, color:C.gold, marginBottom:8 }}>points guide</div>
              {[{label:"self-care task",pts:"+3 pts",color:C.burgundy},{label:"home task",pts:"+2 pts",color:C.rust},{label:"job search task",pts:"+5 pts",color:C.olive}].map(r => (
                <div key={r.label} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.muted, padding:"4px 0" }}>
                  <span style={{ color:r.color }}>● {r.label}</span><span style={{ fontWeight:700, color:C.gold }}>{r.pts}</span>
                </div>
              ))}
              <div style={{ fontSize:11, color:C.muted, marginTop:10, borderTop:`1px solid ${C.border}`, paddingTop:10 }}>complete every task in a week → +50 bonus pts on sunday 🎁</div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:C.surface, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-around", padding:"10px 0 14px", zIndex:100 }}>
        {navItems.map(n => (
          <button key={n.id} onClick={()=>setView(n.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, background:"none", border:"none", cursor:"pointer", color:view===n.id?C.gold:C.muted, fontWeight:view===n.id?800:400 }}>
            <span style={{ fontSize:18 }}>{n.icon}</span>
            <span style={{ fontSize:10, letterSpacing:"0.05em" }}>{n.label}</span>
            {n.id==="secrets"&&unlocked>0&&<span style={{ fontSize:8, color:C.gold, fontWeight:900 }}>{unlocked} unlocked</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
