import { createHmac, timingSafeEqual } from 'node:crypto';
export function verifyOlmexKey(key:string){
 const s=process.env.OLMEX_API_SECRET || process.env.GEMINI_API_KEY || ''; if(!s||!key.startsWith('olm_'))return false;
 const parts=key.slice(4).split('.');if(parts.length!==2)return false;
 const expected=createHmac('sha256',s).update(parts[0]).digest();let actual:Buffer;
 try{actual=Buffer.from(parts[1],'base64url')}catch{return false}
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return false;
 try{const data=JSON.parse(Buffer.from(parts[0],'base64url').toString());return typeof data.iat==='number'&&Date.now()-data.iat<1000*60*60*24*365&&data.iat<=Date.now()+60000}catch{return false}
}
