import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { verifyOlmexKey } from '@/lib/olmex-key';
export const runtime='nodejs'; export const maxDuration=60;
export async function POST(req:Request){
 const auth=req.headers.get('authorization')||''; const token=auth.startsWith('Bearer ')?auth.slice(7):'';
 if(!verifyOlmexKey(token))return NextResponse.json({error:'A valid Olmex API key is required in Authorization: Bearer <key>.'},{status:401});
 const key=process.env.GEMINI_API_KEY;if(!key)return NextResponse.json({error:'AI provider is not configured.'},{status:503});
 try{const body=await req.json();const messages=Array.isArray(body.messages)?body.messages.slice(-20):[];
 if(!messages.length||messages.some((m:any)=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()))return NextResponse.json({error:'messages must be a non-empty array of user/assistant text messages.'},{status:400});
 if(messages.reduce((n:number,m:any)=>n+m.content.length,0)>30000)return NextResponse.json({error:'Conversation is too long.'},{status:413});
 const modelName=['gemini-2.5-flash','gemini-2.5-pro'].includes(body.model)?body.model:(process.env.GEMINI_MODEL||'gemini-2.5-flash');
 const model=new GoogleGenerativeAI(key).getGenerativeModel({model:modelName,systemInstruction:'You are Olmex AI, a helpful and accurate assistant.'});
 const history=messages.slice(0,-1).map((m:any)=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
 while(history.length&&history[0].role!=='user')history.shift();
 const cleaned:any[]=[];for(const item of history){if(cleaned.length&&cleaned[cleaned.length-1].role===item.role)cleaned[cleaned.length-1]=item;else cleaned.push(item)}
 const result=await model.startChat({history:cleaned}).sendMessage(messages[messages.length-1].content);
 return NextResponse.json({text:result.response.text(),model:modelName});
 }catch(e:any){const msg=String(e?.message||'Request failed');const status=/429|quota|rate.?limit|resource_exhausted/i.test(msg)?429:/not found|invalid.*model/i.test(msg)?400:500;return NextResponse.json({error:status===429?'Gemini quota/rate limit reached.':status===400?'Gemini model unavailable.':'AI request failed.'},{status})}
}
