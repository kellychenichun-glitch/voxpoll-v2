'use client';
import Link from 'next/link';
const modes = [
  {id:'political-poll',name:'政治民調／輿情分析',icon:'🗳️',description:'🎙️ AI 語音訪談 | 自動分析支持度與投票意向'},
  {id:'business-development',name:'商機開發／客戶訪談',icon:'💼',description:'🎙️ AI 語音訪談 | 探索需求痛點與商機等級'},
  {id:'general-survey',name:'一般問卷／滿意度調查',icon:'📊',description:'🎙️ AI 語音訪談 | 收集意見與改善建議'},
];
export default function HomePage() {
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f172a,#1e293b)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem'}}>
      <h1 style={{fontSize:'2.5rem',fontWeight:'800',color:'white',marginBottom:'0.5rem'}}>🎙️ VoxPoll Pro Voice</h1>
      <p style={{color:'#94a3b8',marginBottom:'2rem'}}>AI 語音客服問卷系統</p>
      <div style={{display:'flex',flexDirection:'column',gap:'1.5rem',width:'100%',maxWidth:'500px'}}>
        {modes.map(m=>(
          <div key={m.id} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',padding:'1.5rem'}}>
            <div style={{display:'flex',gap:'1rem',marginBottom:'0.75rem'}}>
              <span style={{fontSize:'2rem'}}>{m.icon}</span>
              <div><h2 style={{color:'white',fontWeight:'700'}}>{m.name}</h2><p style={{color:'#94a3b8',fontSize:'0.85rem'}}>{m.description}</p></div>
            </div>
            <Link href={`/interview/${m.id}`} style={{display:'block',padding:'0.75rem',background:'linear-gradient(135deg,#3b82f6,#2563eb)',color:'white',borderRadius:'8px',textAlign:'center',textDecoration:'none',fontWeight:'600'}}>🎤 開始語音訪談</Link>
          </div>
        ))}
      </div>
    </div>
  );
}