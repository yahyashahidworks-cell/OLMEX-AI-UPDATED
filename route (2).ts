import { createHmac, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
function secret(){return process.env.OLMEX_API_SECRET || process.env.GEMINI_API_KEY || '';}
export async function POST(){
  const s=secret(); if(!s) return NextResponse.json({error:'Set OLMEX_API_SECRET in Vercel Environment Variables first.'},{status:503});
  const payload=Buffer.from(JSON.stringify({id:randomBytes(12).toString('hex'),iat:Date.now()})).toString('base64url');
  const signature=createHmac('sha256',s).update(payload).digest('base64url');
  return NextResponse.json({key:`olm_${payload}.${signature}`,createdAt:new Date().toISOString()});
}
