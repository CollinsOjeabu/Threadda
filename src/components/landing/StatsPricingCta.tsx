"use client";
import { useEffect, useRef } from "react";

const C = { ember:"#FF6B35", cream:"#EDE8E0", creamMuted:"rgba(237,232,224,0.45)", void:"#070E09", surface:"#0D1610", border:"#1E2E22", success:"#1D9E75" };

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

export function Stats() {
  return (
    <section id="stats" style={{background:C.void,padding:"100px 24px",borderTop:`0.5px solid ${C.border}`,borderBottom:`0.5px solid ${C.border}`}}>
      <Reveal>
        <div style={{display:"flex",justifyContent:"center"}}>
          {[
            {num:<><span style={{color:C.ember}}>94</span>%</>, label:"Average voice match score"},
            {num:<>5<span style={{color:C.ember}}>×</span></>, label:"More posts from same research"},
            {num:<><span style={{color:C.ember}}>847</span></>, label:"Creators synthesising this week"},
          ].map((s,i) => (
            <div key={i} style={{flex:1,maxWidth:260,textAlign:"center",padding:"0 32px",borderLeft:i>0?`0.5px solid ${C.border}`:"none"}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(48px,7vw,72px)",fontWeight:400,color:C.cream,letterSpacing:"-0.03em",lineHeight:1,marginBottom:8}}>{s.num}</div>
              <div style={{fontSize:13,color:C.creamMuted}}>{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

const plans = [
  {
    tier:"Free", label:"Free during beta", price:"0", period:"while in beta", cta:"Join the waitlist →", ctaStyle:"outline", featured:false,
    mailto:"mailto:hello@threadda.com?subject=Threadda Beta Access",
    features:[
      {ok:true,t:"Save up to 20 sources"},
      {ok:true,t:"3 canvas sessions/month"},
      {ok:true,t:"Voice DNA (LinkedIn)"},
      {ok:true,t:"5 posts/month"},
      {ok:true,t:"Knowledge graph"},
      {ok:false,t:"Scheduling"},
      {ok:false,t:"Analytics"},
    ],
  },
  {
    tier:"Pro", label:"Launching soon", price:"29", period:"per month", cta:"Get notified →", ctaStyle:"solid", featured:true,
    mailto:"mailto:hello@threadda.com?subject=Threadda Pro Waitlist",
    features:[
      {ok:true,t:"Everything in Free"},
      {ok:true,t:"Unlimited sources"},
      {ok:true,t:"Unlimited canvas sessions"},
      {ok:true,t:"Unlimited posts"},
      {ok:true,t:"Scheduling + calendar"},
      {ok:true,t:"Analytics"},
      {ok:true,t:"The Catalyst (X/Twitter) — V2"},
      {ok:true,t:"Priority support"},
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" style={{padding:"140px 24px",background:C.surface}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <Reveal style={{textAlign:"center",marginBottom:60}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"rgba(237,232,224,0.18)",marginBottom:12}}>(07) — Choose your plan</div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(34px,5vw,50px)",fontWeight:400,letterSpacing:"-0.025em",marginBottom:12,color:C.cream}}>Simple, honest pricing.</h2>
          <p style={{fontSize:16,color:C.creamMuted}}>Start free. Upgrade when your synthesis proves its worth.</p>
        </Reveal>
        <Reveal>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:12,alignItems:"start",maxWidth:720,margin:"0 auto"}}>
            {plans.map(p => (
              <div key={p.tier} style={{
                background: p.featured?"#152219":C.void,
                border: p.featured?`1.5px solid ${C.ember}`:`0.5px solid ${C.border}`,
                borderRadius:16, padding:"30px 26px", position:"relative",
                transition:"transform 0.2s",
              }}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.transform="translateY(-3px)"}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.transform=""}>
                {p.featured && <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:C.ember,color:"#fff",fontSize:10,fontWeight:600,padding:"3px 14px",borderRadius:100,whiteSpace:"nowrap"}}>Most popular</div>}
                <div style={{fontSize:13,fontWeight:600,color:C.cream,marginBottom:6}}>{p.tier}</div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:48,fontWeight:400,color:C.cream,letterSpacing:"-0.02em",lineHeight:1,marginBottom:4}}>
                  <span style={{fontSize:22,verticalAlign:"top",marginTop:9,display:"inline-block"}}>$</span>{p.price}
                </div>
                <div style={{fontSize:12,color:C.creamMuted,marginBottom:22}}>{p.period}</div>
                <a href={p.mailto} style={{
                  display:"block",width:"100%",padding:11,borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:22,border:"none",textAlign:"center",textDecoration:"none",
                  background: p.ctaStyle==="solid"?C.ember:"transparent",
                  color: p.ctaStyle==="solid"?"#fff":C.cream,
                  outline: p.ctaStyle==="outline"?`1px solid ${C.border}`:"none",
                }}>{p.cta}</a>
                <hr style={{border:"none",borderTop:`0.5px solid ${C.border}`,marginBottom:18}}/>
                <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:9}}>
                  {p.features.map(f => (
                    <li key={f.t} style={{display:"flex",alignItems:"flex-start",gap:7,fontSize:12,color:C.creamMuted,lineHeight:1.5}}>
                      <span style={{color:f.ok?C.success:C.border,flexShrink:0}}>{f.ok?"✓":"–"}</span>
                      <span style={{opacity:f.ok?1:0.4}}>{f.t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={{textAlign:"center",marginTop:24,fontSize:12,color:"rgba(237,232,224,0.2)"}}>Free during beta. No credit card required.</p>
        </Reveal>
      </div>
    </section>
  );
}

export function CtaSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    function resize() { canvas!.width = section!.offsetWidth; canvas!.height = section!.offsetHeight; }
    resize();
    window.addEventListener("resize", resize);
    const paths = Array.from({length:18},(_,i) => ({
      points: Array.from({length:40},(_,j)=>({x:(i/17)*canvas!.width+(Math.random()-0.5)*60, y:(j/39)*canvas!.height})),
      speed: 0.3+Math.random()*0.4, offset: Math.random()*Math.PI*2, opacity: 0.04+Math.random()*0.08,
    }));
    let t=0, raf=0;
    function draw() {
      ctx!.clearRect(0,0,canvas!.width,canvas!.height);
      paths.forEach(path => {
        ctx!.beginPath();
        ctx!.strokeStyle=`rgba(255,107,53,${path.opacity})`;
        ctx!.lineWidth=0.8;
        path.points.forEach((pt,i)=>{
          const wave=Math.sin(t*path.speed+path.offset+i*0.3)*25;
          if(i===0) ctx!.moveTo(pt.x+wave,pt.y); else ctx!.lineTo(pt.x+wave,pt.y);
        });
        ctx!.stroke();
      });
      t+=0.008;
      raf=requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, []);

  return (
    <section id="cta" ref={sectionRef} style={{background:C.surface,padding:"160px 24px",textAlign:"center",position:"relative",overflow:"hidden"}}>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.4}}/>
      <div style={{position:"relative",zIndex:2}}>
        <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"rgba(237,232,224,0.25)",letterSpacing:"0.06em",marginBottom:28}}>— Your research is waiting —</p>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(44px,7vw,76px)",fontWeight:400,color:C.cream,letterSpacing:"-0.03em",lineHeight:1.02,marginBottom:12}}>Stop saving. Start synthesising.</h2>
        <p style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:"clamp(34px,5vw,60px)",color:C.ember,letterSpacing:"-0.025em",lineHeight:1.05,marginBottom:36}}>Be heard.</p>
        <button style={{fontSize:15,fontWeight:600,background:C.ember,color:"#fff",padding:"15px 36px",borderRadius:100,border:"none",cursor:"pointer"}}>Start synthesising for free →</button>
        <p style={{fontSize:13,color:"rgba(237,232,224,0.2)",marginTop:16}}>Join 847 creators turning their research into original content.</p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer style={{background:C.void,borderTop:`0.5px solid ${C.border}`,padding:"60px 24px 36px"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 1fr 1fr",gap:40,paddingBottom:44,borderBottom:`0.5px solid ${C.border}`,marginBottom:28}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:C.ember,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg viewBox="0 0 12 12" fill="none" width={10} height={10}><path d="M4 10 C4 6 6 3 10 2" stroke="#FF6B35" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/><path d="M6 10 C6 7 7.5 5 10 4" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" fill="none"/><line x1="5" y1="1.5" x2="7.5" y2="11" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <span style={{fontSize:12,fontWeight:700,letterSpacing:"0.07em",color:C.cream}}>THREADDA</span>
            </div>
            <p style={{fontSize:13,color:C.creamMuted,lineHeight:1.7,maxWidth:200}}>Save research. Synthesise connections. Publish original thought leadership.</p>
            <p style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:17,color:C.ember,marginTop:18}}>Your research, amplified.</p>
          </div>
          {[
            {h:"Product",links:["Synthesis Canvas","Knowledge Graph","How it works","Pricing","Changelog"]},
            {h:"Agents",links:["The Authority","The Catalyst","Voice DNA","Analytics","Scheduling"]},
            {h:"Company",links:["About","Blog","Privacy","Terms"]},
          ].map(col => (
            <div key={col.h}>
              <h4 style={{fontSize:10,fontWeight:600,color:"rgba(237,232,224,0.3)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14}}>{col.h}</h4>
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:9}}>
                {col.links.map(l => (
                  <li key={l}><a href="#" style={{fontSize:13,color:C.creamMuted,textDecoration:"none"}}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <p style={{fontSize:12,color:"rgba(237,232,224,0.2)"}}>© 2026 Threadda. All rights reserved.</p>
          <p style={{fontSize:12,color:"rgba(237,232,224,0.2)",fontFamily:"'JetBrains Mono',monospace"}}>Built for creators who have something real to say.</p>
        </div>
      </div>
    </footer>
  );
}
