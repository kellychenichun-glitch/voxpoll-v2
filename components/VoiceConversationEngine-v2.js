'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const INITIAL_QUESTIONS = {
  'political-poll': '請問您對目前台灣政治現況的整體滿意度如何？',
  'business-development': '請問您目前在業務拓展上遇到最大的挑戰是什麼？',
  'general-survey': '請問您對我們服務的整體使用體驗如何？',
};
const TOTAL_QUESTIONS = 4;

export default function VoiceConversationEngine({ modeId, onComplete }) {
  const [phase, setPhase] = useState('speaking');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [responses, setResponses] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('')
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const transcriptRef = useRef('');

  const speakText = useCallback((text) => {
    setPhase('speaking');
    setCurrentText(text);
    if (!window.speechSynthesis) { setTimeout(() => startListening(), 1000); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-TW'; u.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const zh = voices.find(v => v.lang.startsWith('zh'));
    if (zh) u.voice = zh;
    u.onend = () => setTimeout(() => startListening(), 500);
    u.onerror = () => setTimeout(() => startListening(), 500);
    window.speechSynthesis.speak(u);
  }, []);

  const submitResponse = useCallback(async (userTranscript, qIdx, qText, prevResponses) => {
    setPhase('processing');
    try {
      const fd = new FormData();
      fd.append('transcript', userTranscript);
      fd.append('modeId', modeId);
      fd.append('questionId', String(qIdx));
      const res = await fetch('/api/conversation', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '處理失敗');
      const newResp = [...prevResponses, { question: qText, answer: userTranscript, analysis: data.analysis }];
      setResponses(newResp);
      const nextQ = qIdx + 1;
      if (nextQ >= TOTAL_QUESTIONS) {
        setPhase('done');
        speakText('感謝您完成本次訪談！');
        setTimeout(() => onComplete && onComplete(newResp), 3000);
    
        setCurrentQuestion(nextQ);
        speakText(data.aiResponse);
      }
    } catch (err) { setError('錯誤：' + err.message); setPhase('listening'); }
  }, [modeId, speakText, onComplete]);

  const startListening = useCallback(() => {
    setPhase('listening');
    setTranscript('');
    transcriptRef.current = '';
    setError('');
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('請使用 Chrome 瀏覽器'); return; }
    const r = new SR();
    r.lang = 'zh-TW'; r.continuous = false; r.interimResults = true;
    recognitionRef.current = r;
    r.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else transcriptRef.current = e.results[i][0].transcript;
      }
      if (final) transcriptRef.current = final;
      setTranscript(transcriptRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => r.stop(), 2000);
    };
    r.onend = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setCurrentQuestion(q => {
        setCurrentText(t => {
          setResponses(prev => {
            submitResponse(transcriptRef.current || '[未偵測到語音]', q, t, prev);
            return prev;
          });
          return t;
        });
        return q;
      });
    };
      r.onerror = (e) => { if (e.error === 'no-speech') submitResponse('[未偵測到語音]', 0, currentText, responses); else if (e.error === 'aborted') {} else setError('語音辨識錯誤: ' + e.error); };
    r.start();
  }, [submitResponse, currentText, responses]);

  useEffect(() => {
    const firstQ = INITIAL_QUESTIONS[modeId] || INITIAL_QUESTIONS['general-survey'];
    speakText(firstQ);
  }, []);

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f172a,#1e293b)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',color:'white'}}>
      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem'}}>
        {Array.from({length:TOTAL_QUESTIONS}).map((_,i)=>(
          <div key={i} style={{width:'40px',height:'4px',borderRadius:'2px',background:i<=currentQuestion?'#3b82f6':'rgba(255,255,255,0.2)'}}/>
        ))}
      </div>
      <p style={{color:'#64748b',fontSize:'0.85rem',marginBottom:'2rem'}}>進度：{currentQuestion+1} / {TOTAL_QUESTIONS}</p>
      <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',padding:'2rem',maxWidth:'500px',width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>
          {phase==='speaking'?'🎙️':phase==='listening'?'🎤':phase==='processing'?'⏳':'✅'}
        </div>
        <p style={{color:'#94a3b8',marginBottom:'1rem'}}>
          {phase==='speaking'?'AI 正在說話...':phase==='listening'?'請回答':phase==='processing'?'AI 分析中...':'訪談完成！'}
        </p>
        {currentText&&<p style={{color:'white',fontSize:'1.05rem',lineHeight:'1.6',marginBottom:'1.5rem',fontWeight:'500'}}>{currentText}</p>}
        {phase==='listening'&&(
          <div style={{background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'12px',padding:'1rem',marginBottom:'1rem',minHeight:'60px'}}>
            <p style={{color:'#93c5fd'}}>{transcript||'正在錄音中...（靜音 2 秒自動停止）'}</p>
          </div>
        )}
        {error&&<p style={{color:'#f87171',fontSize:'0.85rem'}}>{error}</p>}
      </div>
    </div>
  );
}