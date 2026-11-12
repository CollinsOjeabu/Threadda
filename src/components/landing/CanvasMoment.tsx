"use client";
import { useEffect, useRef } from "react";

const C = { ember:"#FF6B35", cream:"#EDE8E0", creamMuted:"rgba(237,232,224,0.45)", void:"#070E09", surface:"#0D1610", border:"#1E2E22", success:"#1D9E75", info:"#378ADD" };

function Reveal({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add("visible"); }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return <div ref={ref} className="reveal" style={style}>{children}</div>;
}

export default function CanvasMoment() {
  return (
    <section id="canvas-section" style={{padding:"140px 24px",background:C.void}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <Reveal style={{textAlign:"center",marginBottom:64}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.ember,letterSpacing:"0.1em",marginBottom:12}}>(03) — The synthesis canvas</div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(34px,5vw,50px)",fontWeight:400,letterSpacing:"-0.025em",marginBottom:14,color:C.cream}}>
            Where your research becomes original thought.
          </h2>
          <p style={{fontSize:16,color:C.creamMuted,maxWidth:500,margin:"0 auto",lineHeight:1.7}}>
            Bring 3–6 saved pieces onto the canvas. Watch the connections between them surface. Then generate content from the synthesis — not from a blank prompt.
          </p>
        </Reveal>

        <Reveal>
          <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:16,overflow:"hidden",
            boxShadow:"0 40px 100px rgba(0,0,0,0.5)",
            transform:"perspective(1800px) rotateX(2deg)",transformOrigin:"center bottom",transition:"transform 0.6s ease"}}
            onMouseEnter={e=>(e.currentTarget.style.transform="perspective(1800px) rotateX(0deg)")}
            onMouseLeave={e=>(e.currentTarget.style.transform="perspective(1800px) rotateX(2deg)")}>

            {/* Chrome bar */}
            <div style={{background:"#0A1310",padding:"10px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`0.5px solid ${C.border}`}}>
              <div style={{display:"flex",gap:6}}>
                {["#E24B4A","#EF9F27","#1D9E75"].map((bg,i) => <div key={i} style={{width:10,height:10,borderRadius:"50%",background:bg,opacity:0.6}}/>)}
              </div>
              <div style={{flex:1,background:"rgba(237,232,224,0.04)",border:"0.5px solid rgba(237,232,224,0.08)",borderRadius:6,padding:"4px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"rgba(237,232,224,0.25)",textAlign:"center"}}>app.threadda.com/canvas</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:C.success}}>● 5 sources loaded</div>
            </div>

            {/* Body */}
            <div style={{display:"grid",gridTemplateColumns:"220px 1fr 260px",height:480}}>
              {/* Sidebar */}
              <div style={{background:"#070E09",borderRight:`0.5px solid ${C.border}`,padding:"18px 0",display:"flex",flexDirection:"column"}}>
                <div style={{padding:"0 18px 18px",borderBottom:`0.5px solid ${C.border}`,marginBottom:14}}>
                  <img src="/images/threadda-icon.svg" alt="Threadda" style={{ height: 18, width: 18 }} />
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(237,232,224,0.2)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Synthesis Canvas</div>
                </div>
                {["Canvas","Library","Graph","Agents"].map((item,i) => (
                  <div key={item} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 18px",fontSize:12,
                    background:i===0?"rgba(255,107,53,0.08)":"transparent",
                    color:i===0?C.ember:C.creamMuted,
                    borderRight:i===0?`2px solid ${C.ember}`:"none"}}>
                    {item}
                  </div>
                ))}
                <div style={{padding:"12px 18px 6px",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(237,232,224,0.2)",letterSpacing:"0.1em",textTransform:"uppercase"}}>On canvas (5)</div>
                {[
                  {color:C.success,title:"AI authenticity & voice in 2026",type:"article · saved 2d ago"},
                  {color:C.ember,title:"LinkedIn algorithm changes",type:"research · saved 4d ago"},
                  {color:C.info,title:"Creator economy 2026 report",type:"PDF · saved 1w ago"},
                  {color:"rgba(237,232,224,0.3)",title:"Contrarian content strategy",type:"notes · saved 3d ago"},
                  {color:"rgba(237,232,224,0.3)",title:"Voice-first writing framework",type:"article · saved 5d ago"},
                ].map(item => (
                  <div key={item.title} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 18px"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:item.color,flexShrink:0,marginTop:4}}/>
                    <div>
                      <div style={{fontSize:11,color:"rgba(237,232,224,0.45)",lineHeight:1.4}}>{item.title}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(237,232,224,0.2)",marginTop:2}}>{item.type}</div>
                    </div>
                  </div>
                ))}
                <button style={{margin:"auto 14px 14px",background:C.ember,color:"#fff",border:"none",borderRadius:8,padding:9,fontSize:11,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:5,cursor:"pointer"}}>
                  + Add to canvas
                </button>
              </div>

              {/* Canvas area */}
              <div style={{background:"#070E09",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"0.5px solid rgba(30,46,34,0.5)",background:"rgba(7,14,9,0.9)",zIndex:2}}>
                  <span style={{fontSize:12,fontWeight:500,color:C.cream}}>Research Synthesis — AI Content Authenticity</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(237,232,224,0.25)"}}>5 sources · 7 connections found</span>
                  <div style={{display:"flex",gap:5}}>
                    {["⊞","+","−"].map(t=><div key={t} style={{width:26,height:26,borderRadius:5,background:"rgba(237,232,224,0.04)",border:"0.5px solid rgba(237,232,224,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"rgba(237,232,224,0.3)"}}>{t}</div>)}
                  </div>
                </div>

                <svg viewBox="0 0 580 440" preserveAspectRatio="xMidYMid meet" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
                  <defs>
                    <radialGradient id="cGlow1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FF6B35" stopOpacity="0.25"/><stop offset="100%" stopColor="#FF6B35" stopOpacity="0"/></radialGradient>
                    <radialGradient id="cGlowG" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#1D9E75" stopOpacity="0.2"/><stop offset="100%" stopColor="#1D9E75" stopOpacity="0"/></radialGradient>
                    <radialGradient id="cGlowB" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#378ADD" stopOpacity="0.2"/><stop offset="100%" stopColor="#378ADD" stopOpacity="0"/></radialGradient>
                    <filter id="f3"><feGaussianBlur stdDeviation="3"/></filter>
                    <filter id="f6"><feGaussianBlur stdDeviation="6"/></filter>
                  </defs>
                  <g fill="none">
                    <line x1="160" y1="140" x2="285" y2="215" stroke="rgba(255,107,53,0.35)" strokeWidth="1.2"/>
                    <line x1="380" y1="100" x2="315" y2="210" stroke="rgba(255,107,53,0.3)" strokeWidth="1.2"/>
                    <line x1="130" y1="310" x2="285" y2="245" stroke="rgba(29,158,117,0.3)" strokeWidth="1"/>
                    <line x1="440" y1="300" x2="320" y2="250" stroke="rgba(55,138,221,0.3)" strokeWidth="1"/>
                    <line x1="290" y1="370" x2="295" y2="260" stroke="rgba(237,232,224,0.15)" strokeWidth="0.8"/>
                  </g>
                  <rect x="240" y="165" width="100" height="20" rx="4" fill="rgba(255,107,53,0.08)" stroke="rgba(255,107,53,0.2)" strokeWidth="0.5"/>
                  <text x="290" y="178" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="8" fill="rgba(255,107,53,0.7)">7 connections</text>
                  <circle cx="300" cy="230" r="44" fill="url(#cGlow1)" filter="url(#f6)"/>
                  <circle cx="300" cy="230" r="32" fill="#0D1610" stroke="#FF6B35" strokeWidth="1.5"/>
                  <circle cx="300" cy="230" r="22" fill="#152219"/>
                  <g transform="translate(300,230)"><line x1="0" y1="-10" x2="0" y2="10" stroke="#FF6B35" strokeWidth="1.4" strokeLinecap="round"/><line x1="-10" y1="0" x2="10" y2="0" stroke="#FF6B35" strokeWidth="1.4" strokeLinecap="round"/></g>
                  <text x="300" y="188" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="7.5" fill="rgba(255,107,53,0.5)" letterSpacing="1.5">SYNTHESIS</text>
                  <text x="300" y="278" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9.5" fill="rgba(237,232,224,0.5)" fontWeight="500">Content Strategy</text>
                  <circle cx="155" cy="135" r="28" fill="url(#cGlowG)" filter="url(#f3)"/>
                  <circle cx="155" cy="135" r="20" fill="#0A1410" stroke="rgba(29,158,117,0.5)" strokeWidth="1"/>
                  <circle cx="155" cy="135" r="6" fill="#1D9E75"/>
                  <text x="155" y="168" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="8.5" fill="rgba(237,232,224,0.55)">AI Authenticity</text>
                  <circle cx="385" cy="95" r="26" fill="url(#cGlow1)" filter="url(#f3)"/>
                  <circle cx="385" cy="95" r="18" fill="#0A1410" stroke="rgba(255,107,53,0.5)" strokeWidth="1"/>
                  <circle cx="385" cy="95" r="6" fill="#FF6B35"/>
                  <text x="385" y="127" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="8.5" fill="rgba(237,232,224,0.55)">LinkedIn Algo</text>
                  <circle cx="120" cy="315" r="24" fill="url(#cGlowB)" filter="url(#f3)"/>
                  <circle cx="120" cy="315" r="16" fill="#0A1410" stroke="rgba(55,138,221,0.4)" strokeWidth="1"/>
                  <circle cx="120" cy="315" r="5" fill="#378ADD"/>
                  <text x="120" y="345" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="8.5" fill="rgba(237,232,224,0.5)">Creator Economy</text>
                  <circle cx="450" cy="300" r="22" fill="#0A1410" stroke="rgba(237,232,224,0.15)" strokeWidth="0.8"/>
                  <circle cx="450" cy="300" r="5" fill="rgba(237,232,224,0.35)"/>
                  <text x="450" y="330" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="8.5" fill="rgba(237,232,224,0.4)">Contrarian Strategy</text>
                  <rect x="420" y="180" width="130" height="56" rx="8" fill="rgba(255,107,53,0.07)" stroke="rgba(255,107,53,0.2)" strokeWidth="0.5"/>
                  <text x="432" y="196" fontFamily="JetBrains Mono,monospace" fontSize="7.5" fill="rgba(255,107,53,0.5)">💡 INSIGHT FOUND</text>
                  <text x="432" y="210" fontFamily="Inter,sans-serif" fontSize="8.5" fill="rgba(237,232,224,0.6)">Engagement drops when</text>
                  <text x="432" y="222" fontFamily="Inter,sans-serif" fontSize="8.5" fill="rgba(237,232,224,0.6)">research stops feeding</text>
                  <text x="432" y="234" fontFamily="Inter,sans-serif" fontSize="8.5" fill="rgba(237,232,224,0.6)">content creation.</text>
                </svg>

                <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"8px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"0.5px solid rgba(30,46,34,0.5)",background:"rgba(7,14,9,0.9)"}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(237,232,224,0.2)"}}>5 sources · 7 connections · 3 insights</span>
                  <button style={{background:C.ember,color:"#fff",border:"none",borderRadius:6,padding:"5px 14px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Synthesise → generate</button>
                </div>
              </div>

              {/* Right panel */}
              <div style={{background:"#080F0A",borderLeft:`0.5px solid ${C.border}`,padding:18,overflowY:"auto"}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"rgba(237,232,224,0.25)",textTransform:"uppercase",marginBottom:10}}>Synthesis output</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <span style={{fontSize:13,fontWeight:600,color:C.cream}}>3 insights found</span>
                  <span style={{fontSize:10,background:"rgba(29,158,117,0.1)",color:C.success,border:"0.5px solid rgba(29,158,117,0.2)",borderRadius:6,padding:"2px 8px",fontFamily:"'JetBrains Mono',monospace"}}>ready</span>
                </div>
                {[
                  {c:C.ember,t:"AI authenticity → engagement patterns"},
                  {c:C.success,t:"Research volume → voice authenticity"},
                  {c:C.info,t:"Creator economy → platform shift"},
                ].map(row=>(
                  <div key={row.t} style={{display:"flex",alignItems:"center",gap:7,fontSize:11,color:C.creamMuted,padding:"7px 10px",background:"rgba(237,232,224,0.03)",borderRadius:6,border:"0.5px solid rgba(237,232,224,0.06)",marginBottom:6}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:row.c,flexShrink:0}}/>
                    {row.t}
                  </div>
                ))}
                <div style={{background:"rgba(255,107,53,0.05)",border:"0.5px solid rgba(255,107,53,0.15)",borderRadius:8,padding:12,marginBottom:12,marginTop:8}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(255,107,53,0.5)",letterSpacing:"0.08em",marginBottom:7}}>TOP INSIGHT</div>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:12,color:"rgba(237,232,224,0.75)",lineHeight:1.6}}>
                    &ldquo;Creators who maintain a research habit outperform those who rely on AI prompts alone — by 3.4× in authentic engagement.&rdquo;
                  </div>
                </div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"rgba(237,232,224,0.25)",textTransform:"uppercase",marginBottom:10}}>Generate for</div>
                <button style={{width:"100%",padding:10,background:C.ember,color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:6}}>Generate LinkedIn post →</button>
                <div style={{display:"flex",gap:6}}>
                  {["X thread","Save as idea"].map(t=>(
                    <button key={t} style={{flex:1,padding:7,background:"transparent",border:"0.5px solid rgba(237,232,224,0.1)",borderRadius:6,fontSize:11,color:C.creamMuted,cursor:"pointer",textAlign:"center"}}>{t}</button>
                  ))}
                </div>
                <div style={{marginTop:14}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"rgba(237,232,224,0.25)",textTransform:"uppercase",marginBottom:8}}>Voice match</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{flex:1,height:3,background:"rgba(237,232,224,0.06)",borderRadius:100,overflow:"hidden"}}>
                      <div style={{width:"94%",height:"100%",background:C.ember,borderRadius:100}}/>
                    </div>
                    <span style={{fontSize:11,color:C.ember,fontFamily:"'JetBrains Mono',monospace"}}>94%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
