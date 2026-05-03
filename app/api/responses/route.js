import { NextResponse } from 'next/server';
const store = [];
export async function POST(request) {
  try { const d = await request.json(); store.push({id:Date.now(),...d}); return NextResponse.json({success:true}); }
  catch(e) { return NextResponse.json({error:e.message},{status:500}); }
}
export async function GET() { return NextResponse.json(store); }