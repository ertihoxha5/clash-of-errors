import a from "./auth.module.css";

// Both account screens share the landing page's language: the same brand mark,
// the same neon panel, the same kicker type.
const POINTS=[
 {title:"Find the bug",copy:"Broken snippets and full 300-line modules. Name the faulty line, choose the fix."},
 {title:"Write the code",copy:"Implement the function until every test passes, in a sandbox that runs in your browser."},
 {title:"Duel an NPC rival",copy:"Same task, one clock, live test counters. Beat them before they commit."},
];

export default function AuthScreen({mode,player,returnTo,children}:{
 mode:"login"|"register";
 player:{displayName:string;username:string}|null;
 returnTo:string;
 children:React.ReactNode;
}){
 const registering=mode==="register";
 return <main className={a.page}>
  <header className={a.bar}>
   <a className="brand compact" href="/"><img src="/assets/mark.png" alt=""/><span>CLASH OF ERRORS</span></a>
   <a className={a.swap} href={registering?"/login":"/register"}>{registering?"Already have an account? Sign in":"New here? Create an account"}</a>
  </header>

  <div className={a.layout}>
   <section className={a.pitch}>
    <span className="kicker">PLAYER ACCESS</span>
    <h1 className={a.headline}>{registering?<>Claim your <em>handle.</em></>:<>Back to the <em>arena.</em></>}</h1>
    <p className={a.lede}>One account carries your XP, your solved bugs, your duel record and your place on the leaderboard.</p>
    <ul className={a.points}>
     {POINTS.map(point=><li key={point.title}><b>{point.title}</b><span>{point.copy}</span></li>)}
    </ul>
   </section>

   <section className={a.card}>
    {player
     ?<>
       <span className="kicker">SIGNED IN</span>
       <h2 className={a.cardTitle}>You are @{player.username}</h2>
       <p className={a.note}>Continue as {player.displayName}, or sign out to use another account.</p>
       <div className={a.ready}>
        <a className="btn cyan solid" href={returnTo}>Continue</a>
        <a className="btn pink outline" href="/logout">Sign out</a>
       </div>
      </>
     :<>
       <span className="kicker">{registering?"CREATE ACCOUNT":"SIGN IN"}</span>
       <h2 className={a.cardTitle}>{registering?"Your details":"Welcome back"}</h2>
       {children}
       <p className={a.note}>
        {registering?<>Already registered? <a href="/login">Sign in instead</a>.</>:<>No account yet? <a href="/register">Create one</a>.</>}
       </p>
      </>}
    <a className={a.back} href="/">← Return home</a>
   </section>
  </div>
 </main>;
}
