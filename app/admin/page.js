'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
export default function AdminPage() {
  const [responses, setResponses] = useState([]);
  useEffect(()=>{fetch('/api/responses').then(r=>r.json()).then(setResponses).catch(()=>{});},[]);
  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'white',padding:'2rem'}}>
      <div style={{maxWidth:'800px',margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'2rem'}}>
          <h1 style={{fontSize:'1.5rem',fontWeight:'700'}}>📊 後台管理</h1>
          <Link href="/" style={{color:'#3b82f6',textDecoration:'none'}}>← 回首頁</Link>
        </div>
        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:'12px',padding:'1.5rem'}}>
          <h2 style={{marginBottom:'1rem'}}>訪談記錄（{responses.length} 筆）</h2>
          {responses.length===0?<p style={{color:'#64748b'}}>目前無記錄</p>:
            responses.map((r,i)=>(
              <div key={i} style={{borderTop:'1px solid rgba(255,255,255,0.1)',paddingTop:'1rem',marginTop:'1rem'}}>
                <p style={{color:'#94a3b8',fontSize:'0.8rem'}}>{r.modeId} · {new Date(r.timestamp).toLocaleString('zh-TW')}</p>
                {r.responses?.map((resp,j)=>(
                  <div key={j} style={{marginTop:'0.5rem'}}>
                    <p style={{color:'#60a5fa'}}>Q: {resp.question}</p>
                    <p>A: {resp.answer}</p>
                  </div>
                ))}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}