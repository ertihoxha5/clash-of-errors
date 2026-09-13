import {getPlayer} from "./auth";
import s from "./platform.module.css";

// One frame for every signed-in page: the landing page's topbar, the same
// kicker/headline rhythm, the same footer. Individual pages only supply their
// heading and body, so nothing drifts visually between sections.
const NAV=[
 {href:"/dashboard",label:"Command"},
 {href:"/challenges",label:"Challenges"},
 {href:"/battles",label:"Battles"},
 {href:"/play",label:"Bug Hunter"},
 {href:"/leaderboards",label:"Ranks"},
 {href:"/teams",label:"Teams"},
 {href:"/history",label:"History"},
];

export default async function PlatformShell({title,subtitle,kicker="YOUR NEXT LEVEL STARTS HERE",actions,children}:{
 title:string;subtitle:string;kicker?:string;actions?:React.ReactNode;children:React.ReactNode;
}){
 const player=await getPlayer();
 return <div className={s.frame}>
  <header className="topbar">
   <a className="brand compact" href="/"><img src="/assets/mark.png" alt=""/><span>CLASH OF ERRORS</span></a>
   <nav className={s.nav} aria-label="Platform">
    {NAV.map(item=><a key={item.href} href={item.href}>{item.label}</a>)}
   </nav>
   <div className={s.account}>
    {player
     ?<><a className={s.handle} href="/profile">@{player.username}</a><a className={s.signout} href="/logout">Sign out</a></>
     :<><a className="btn cyan outline" href="/login">Sign in</a><a className="btn pink outline" href="/register">Create account</a></>}
   </div>
  </header>

  <main className={s.shell}>
   <div className={s.head}>
    <div>
     <span className="kicker">{kicker}</span>
     <h1 className={s.title}>{title}</h1>
     <p className={s.lede}>{subtitle}</p>
    </div>
    {actions&&<div className={s.actions}>{actions}</div>}
   </div>
   {children}
  </main>

  <footer className={s.foot}>
   <a className="brand compact" href="/"><img src="/assets/mark.png" alt=""/><span>CLASH OF ERRORS</span></a>
   <p>Battle. Code. Conquer.</p>
   <span>© 2026 Clash of Errors</span>
  </footer>
 </div>;
}
