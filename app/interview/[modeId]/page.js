'use client';
import { useParams, useRouter } from 'next/navigation';
import VoiceConversationEngine from '../../../components/VoiceConversationEngine-v2';

const MODES = {
  'political-poll': { name: '政治民調／輿情分析', icon: '🗳️' },
  'business-development': { name: '商機開發／客戶訪談', icon: '💼' },
  'general-survey': { name: '一般問卷／滿意度調查', icon: '📊' },
};

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const modeId = params.modeId;
  const mode = MODES[modeId];
  if (!mode) return <div style={{color:'white',padding:'2rem'}}>模式不存在</div>;

  const handleComplete = async (responses) => {
    try {
      await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modeId, responses, timestamp: new Date().toISOString() }),
      });
    } catch(e) {}
    setTimeout(() => router.push('/admin'), 3000);
  };

  return (
    <div>
      <div style={{position:'fixed',top:0,left:0,right:0,padding:'1rem 1.5rem',background:'rgba(15,23,42,0.9)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',gap:'0.75rem',zIndex:100,borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
        <span style={{fontSize:'1.5rem'}}>{mode.icon}</span>
        <span style={{color:'white',fontWeight:'600'}}>{mode.name}</span>
      </div>
      <div style={{paddingTop:'60px'}}>
        <VoiceConversationEngine modeId={modeId} onComplete={handleComplete} />
      </div>
    </div>
  );
}