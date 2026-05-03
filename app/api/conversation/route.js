import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const transcript = formData.get('transcript') || '';
    const modeId = formData.get('modeId') || 'general-survey';
    const questionId = formData.get('questionId') || '0';

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: '未設定 API Key' }, { status: 500 });

    const client = new Anthropic({ apiKey });

    const systemPrompts = {
      'political-poll': '你是專業政治民調訪員，針對台灣政治議題進行民意調查。針對受訪者回答簡短確認後提出下一個問題，共4個問題，保持中立，用繁體中文。',
      'business-development': '你是專業商業顧問，進行客戶需求訪談。針對回答確認後深入探索需求，共4個問題，用繁體中文。',
      'general-survey': '你是客服滿意度調查員，收集客戶意見。針對回答確認後了解體驗，共4個問題，友善語氣，用繁體中文。',
    };

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: systemPrompts[modeId] || systemPrompts['general-survey'],
      messages: [{ role: 'user', content: `第${parseInt(questionId)+1}題。受訪者說：「${transcript}」請確認並提出下一個問題。` }],
    });

    const aiResponse = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const neg = ['不滿','糟糕','差','失望','反對'].some(w => transcript.includes(w));
    const pos = ['滿意','很好','棒','讚','支持'].some(w => transcript.includes(w));

    return NextResponse.json({ transcript, aiResponse, analysis: { transcript, sentiment: neg ? 'negative' : pos ? 'positive' : 'neutral' } });
  } catch (e) {
    console.error('API Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}