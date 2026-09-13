// Character portraits for players and NPC rivals. Everything is derived from a
// single hue so a new rival only needs a number, and the same face renders
// identically on the server and in the browser.
export default function Avatar({hue,size=48,label,dim=false}:{hue:number;size?:number;label?:string;dim?:boolean}){
 const skin=`hsl(28 62% ${dim?58:72}%)`;
 const hair=`hsl(${hue} 85% ${dim?52:62}%)`;
 const suit=`hsl(${(hue+18)%360} 70% ${dim?26:34}%)`;
 const glow=`hsl(${hue} 95% 62%)`;
 return <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label={label?`${label} portrait`:"Player portrait"} style={{flex:"none"}}>
  <defs>
   <linearGradient id={`bg-${hue}`} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor={`hsl(${hue} 60% 22%)`}/>
    <stop offset="1" stopColor="#070c18"/>
   </linearGradient>
  </defs>
  <rect x="1" y="1" width="62" height="62" rx="12" fill={`url(#bg-${hue})`} stroke={glow} strokeOpacity="0.55"/>
  {/* shoulders */}
  <path d="M12 62c0-11 9-17 20-17s20 6 20 17z" fill={suit}/>
  <path d="M26 45h12v6a6 6 0 0 1-12 0z" fill={skin}/>
  {/* head */}
  <rect x="19" y="18" width="26" height="28" rx="11" fill={skin}/>
  {/* hair */}
  <path d="M18 30c-1-11 6-18 14-18s15 6 14 18c-2-6-6-9-9-8-4 1-6 4-11 3-3-1-6 1-8 5z" fill={hair}/>
  <path d="M44 24c4 2 5 7 3 11-1-5-3-8-6-9z" fill={hair} opacity="0.8"/>
  {/* eyes and mouth */}
  <rect x="24" y="31" width="5" height="5" rx="2.5" fill="#0a1120"/>
  <rect x="35" y="31" width="5" height="5" rx="2.5" fill="#0a1120"/>
  <path d="M28 40c2 2 6 2 8 0" stroke="#0a1120" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
  {/* headset */}
  <path d="M17 33v-4a15 15 0 0 1 30 0v4" stroke={glow} strokeWidth="2.4" fill="none" strokeLinecap="round"/>
  <rect x="13" y="31" width="6" height="9" rx="3" fill={glow}/>
  <rect x="45" y="31" width="6" height="9" rx="3" fill={glow}/>
 </svg>;
}
