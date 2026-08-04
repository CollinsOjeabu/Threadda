"use client";
import { useEffect, useRef } from "react";

const C = { ember:"#FF6B35", cream:"#EDE8E0", creamMuted:"rgba(237,232,224,0.45)", void:"#070E09", surface:"#0D1610", border:"#1E2E22", success:"#1D9E75" };

function Reveal({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add("visible"); }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return <div ref={ref} className="reveal" style={style}>{children}</div>;
}

export default function KnowledgeGraph() {
  return (
    <section id="knowledge" style={{padding:"140px 24px",background:C.void}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <Reveal style={{textAlign:"center",marginBottom:64}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.ember,letterSpacing:"0.1em",marginBottom:12}}>(05) — Knowledge graph</div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(34px,5vw,50px)",fontWeight:400,letterSpacing:"-0.025em",marginBottom:14,color:C.cream}}>Your brain, indexed.</h2>
          <p style={{fontSize:16,color:C.creamMuted,maxWidth:480,margin:"0 auto",lineHeight:1.7}}>Every piece of research you&apos;ve ever saved, mapped as a living graph. The canvas pulls from here. The agents learn from here.</p>
        </Reveal>

        <Reveal>
          <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:16,overflow:"hidden",
            boxShadow:"0 40px 120px rgba(0,0,0,0.6)",
            transform:"perspective(1800px) rotateX(3deg)",transformOrigin:"center bottom",transition:"transform 0.6s ease"}}
            onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.transform="perspective(1800px) rotateX(0deg)"}
            onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.transform="perspective(1800px) rotateX(3deg)"}>

            {/* Chrome */}
            <div style={{background:"#0A1310",padding:"10px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`0.5px solid ${C.border}`}}>
              <div style={{display:"flex",gap:6}}>
                {["#E24B4A","#EF9F27","#1D9E75"].map((bg,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:bg,opacity:0.6}}/>)}
              </div>
              <div style={{flex:1,background:"rgba(237,232,224,0.04)",border:"0.5px solid rgba(237,232,224,0.08)",borderRadius:6,padding:"4px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"rgba(237,232,224,0.25)",textAlign:"center"}}>app.threadda.com/graph</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:C.success}}>● Optimal</div>
            </div>

            {/* Dashboard */}
            <div style={{display:"grid",gridTemplateColumns:"220px 1fr 280px",height:520}}>
              {/* Sidebar */}
              <div style={{background:"#070E09",borderRight:`0.5px solid ${C.border}`,padding:"18px 0",display:"flex",flexDirection:"column"}}>
                <div style={{padding:"0 18px 18px",borderBottom:`0.5px solid ${C.border}`,marginBottom:14}}>
                  <img src="/images/threadda-icon.svg" alt="Threadda" style={{ height: 18, width: 18 }} />
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(237,232,224,0.2)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Knowledge Engine</div>
                </div>
                {[
                  {label:"Dashboard",active:false},
                  {label:"Graph",active:true},
                  {label:"Canvas",active:false},
                  {label:"Analytics",active:false},
                  {label:"Schedule",active:false},
                ].map(item=>(
                  <div key={item.label} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 18px",fontSize:12,
                    background:item.active?"rgba(255,107,53,0.08)":"transparent",
                    color:item.active?C.ember:C.creamMuted,
                    borderRight:item.active?`2px solid ${C.ember}`:"none"}}>
                    {item.label}
                  </div>
                ))}
                <button style={{margin:"auto 14px 14px",background:C.ember,color:"#fff",border:"none",borderRadius:8,padding:9,fontSize:11,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:5,cursor:"pointer"}}>
                  + Add Node
                </button>
              </div>

              {/* Graph Canvas */}
              <div style={{background:"#070E09",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"0.5px solid rgba(30,46,34,0.5)",background:"rgba(7,14,9,0.9)",zIndex:2}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"rgba(237,232,224,0.3)"}}>System Status: <span style={{color:C.success}}>Optimal</span></span>
                  <div style={{background:"rgba(237,232,224,0.04)",border:"0.5px solid rgba(237,232,224,0.08)",borderRadius:6,padding:"5px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"rgba(237,232,224,0.2)",display:"flex",alignItems:"center",gap:6}}>🔍 Find node...</div>
                  <div style={{display:"flex",gap:5}}>
                    {["⊞","+","−"].map(t=><div key={t} style={{width:26,height:26,borderRadius:5,background:"rgba(237,232,224,0.04)",border:"0.5px solid rgba(237,232,224,0.08)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(237,232,224,0.3)",fontSize:11}}>{t}</div>)}
                  </div>
                </div>

                {/* Top fade */}
                <div style={{position:"absolute",left:0,right:0,top:40,height:70,background:"linear-gradient(to bottom, #070E09, transparent)",pointerEvents:"none",zIndex:1}}/>

                <svg viewBox="0 0 640 480" preserveAspectRatio="xMidYMid meet" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
                  <defs>
                    <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FF6B35" stopOpacity="0.3"/><stop offset="100%" stopColor="#FF6B35" stopOpacity="0"/></radialGradient>
                    <radialGradient id="nodeGlowGreen" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#1D9E75" stopOpacity="0.25"/><stop offset="100%" stopColor="#1D9E75" stopOpacity="0"/></radialGradient>
                    <filter id="blur6kg"><feGaussianBlur stdDeviation="6"/></filter>
                    <filter id="blur3kg"><feGaussianBlur stdDeviation="3"/></filter>
                  </defs>
                  <g stroke="rgba(30,46,34,0.8)" strokeWidth="1" fill="none">
                    <line x1="320" y1="240" x2="185" y2="115" stroke="rgba(255,107,53,0.2)" strokeWidth="1.5"/>
                    <line x1="320" y1="240" x2="460" y2="125" stroke="rgba(255,107,53,0.2)" strokeWidth="1.5"/>
                    <line x1="320" y1="240" x2="155" y2="310" stroke="rgba(30,46,34,0.9)"/>
                    <line x1="320" y1="240" x2="490" y2="325" stroke="rgba(255,107,53,0.25)" strokeWidth="1.5"/>
                    <line x1="320" y1="240" x2="320" y2="385" stroke="rgba(30,46,34,0.9)"/>
                    <line x1="185" y1="115" x2="460" y2="125" stroke="rgba(30,46,34,0.5)" strokeWidth="0.6"/>
                  </g>
                  <circle cx="320" cy="240" r="52" fill="url(#nodeGlow)" filter="url(#blur6kg)" opacity="0.8"/>
                  <circle cx="320" cy="240" r="38" fill="#070E09" stroke="#FF6B35" strokeWidth="2"/>
                  <circle cx="320" cy="240" r="28" fill="#0D1610"/>
                  <g transform="translate(320,240)"><line x1="0" y1="-12" x2="0" y2="12" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round"/><line x1="-12" y1="0" x2="12" y2="0" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round"/></g>
                  <text x="320" y="194" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="8" fill="rgba(255,107,53,0.5)" letterSpacing="2">CONTENT HUB</text>
                  <text x="320" y="286" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="10" fill="rgba(237,232,224,0.45)" fontWeight="500">Content Strategy</text>
                  <g><circle cx="185" cy="115" r="18" fill="#0D1610" stroke="rgba(255,107,53,0.3)"/><circle cx="185" cy="115" r="18" fill="url(#nodeGlowGreen)" filter="url(#blur3kg)"/><circle cx="185" cy="115" r="5" fill="#1D9E75"/><text x="185" y="146" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fill="rgba(237,232,224,0.5)">AI Authenticity</text></g>
                  <g><circle cx="460" cy="125" r="20" fill="#0D1610" stroke="rgba(255,107,53,0.35)" strokeWidth="1.2"/><circle cx="460" cy="125" r="5" fill="#1D9E75"/><text x="460" y="156" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fill="rgba(237,232,224,0.5)">LinkedIn Algorithm</text></g>
                  <g><circle cx="490" cy="325" r="22" fill="#0D1610" stroke="rgba(255,107,53,0.4)" strokeWidth="1.5"/><circle cx="490" cy="325" r="22" fill="url(#nodeGlow)" filter="url(#blur3kg)" opacity="0.5"/><circle cx="490" cy="325" r="7" fill="#FF6B35"/><text x="490" y="356" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fill="rgba(237,232,224,0.5)">Contrarian Content</text></g>
                  <g><circle cx="155" cy="310" r="14" fill="#0D1610" stroke="rgba(237,232,224,0.1)" strokeWidth="0.8"/><text x="155" y="333" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fill="rgba(237,232,224,0.35)">Creator Economy</text></g>
                  <g><circle cx="320" cy="385" r="14" fill="#0D1610" stroke="rgba(237,232,224,0.1)" strokeWidth="0.8"/><text x="320" y="408" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fill="rgba(237,232,224,0.35)">Voice-First Writing</text></g>
                </svg>

                {/* Bottom fade */}
                <div style={{position:"absolute",left:0,right:0,bottom:30,height:70,background:"linear-gradient(to top, #070E09, transparent)",pointerEvents:"none",zIndex:1}}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"8px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"0.5px solid rgba(30,46,34,0.5)",background:"rgba(7,14,9,0.9)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(237,232,224,0.2)"}}>
                  <span>24 nodes · 38 connections</span>
                  <div style={{background:"rgba(255,107,53,0.1)",border:"0.5px solid rgba(255,107,53,0.25)",borderRadius:100,padding:"3px 12px",fontSize:10,color:C.ember}}>2 nodes selected · Brief agent →</div>
                  <span>Select nodes to synthesise</span>
                </div>
              </div>

              {/* Right panel */}
              <div style={{background:"#080F0A",borderLeft:`0.5px solid ${C.border}`,padding:18,overflowY:"auto"}}>
                <div style={{overflow:"hidden",marginBottom:12}}>
                  <span style={{display:"inline-flex",background:"rgba(255,107,53,0.1)",border:"0.5px solid rgba(255,107,53,0.25)",borderRadius:6,padding:"3px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:C.ember}}>Knowledge Node</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(237,232,224,0.2)",float:"right"}}>Saved 2d ago</span>
                </div>
                <div style={{fontSize:15,fontWeight:600,color:C.cream,marginBottom:4,lineHeight:1.3}}>Contrarian Content Strategy</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(237,232,224,0.2)",marginBottom:18}}>domain: threadda.internal/content_strat_04</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"rgba(237,232,224,0.25)",textTransform:"uppercase",marginBottom:8}}>Linked Themes</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:4}}>
                  {["Content Marketing","AI Tools","Creator Economy"].map(tag=>(
                    <span key={tag} style={{fontSize:11,color:C.creamMuted,background:"rgba(237,232,224,0.05)",border:"0.5px solid rgba(237,232,224,0.1)",borderRadius:6,padding:"3px 9px"}}>{tag}</span>
                  ))}
                </div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"rgba(237,232,224,0.25)",textTransform:"uppercase",marginBottom:8,marginTop:18}}>Connections</div>
                {["AI Authenticity Research","LinkedIn Algorithm 2026","Voice-First Writing","Creator Economy Report"].map((conn,i)=>(
                  <div key={conn} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 10px",border:"0.5px solid rgba(237,232,224,0.07)",borderRadius:7,marginBottom:5}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:i<2?C.ember:"rgba(237,232,224,0.2)",flexShrink:0}}/>
                    <span style={{fontSize:11,color:C.creamMuted,flex:1}}>{conn}</span>
                    <span style={{fontSize:11,color:"rgba(237,232,224,0.2)"}}>›</span>
                  </div>
                ))}
                <button style={{width:"100%",marginTop:18,padding:10,background:"rgba(237,232,224,0.06)",border:"0.5px solid rgba(237,232,224,0.1)",borderRadius:8,color:C.cream,fontSize:12,fontWeight:500,cursor:"pointer"}}>Add to canvas →</button>
                <div style={{textAlign:"center",fontSize:10,color:"rgba(237,232,224,0.2)",marginTop:5,fontFamily:"'JetBrains Mono',monospace"}}>Select nodes then synthesise</div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:24,marginTop:28,flexWrap:"wrap"}}>
            {[
              {color:C.ember,label:"Active / selected node"},
              {color:C.success,label:"Recently saved"},
              {color:"rgba(237,232,224,0.2)",label:"Connected knowledge"},
            ].map(item=>(
              <div key={item.label} style={{display:"flex",alignItems:"center",gap:7,fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"rgba(237,232,224,0.3)"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:item.color}}/>
                {item.label}
              </div>
            ))}
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.ember}}>24 nodes · 38 connections · your library</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
