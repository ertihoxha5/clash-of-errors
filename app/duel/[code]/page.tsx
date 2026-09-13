import {requirePlayer} from "../../auth";
import DuelArena from "./DuelArena";
export const dynamic="force-dynamic";
export default async function DuelPage({params}:{params:Promise<{code:string}>}){
 const code=(await params).code.toUpperCase();
 await requirePlayer(`/duel/${code}`);
 return <main className="duel-page">
  <header className="topbar">
   <a className="brand compact" href="/dashboard"><img src="/assets/mark.png" alt=""/><span>CLASH OF ERRORS</span></a>
   <nav aria-label="Duel navigation"><a className="profile-link" href="/battles">Battles</a><a className="profile-link" href="/challenges">Challenges</a></nav>
  </header>
  <DuelArena code={code}/>
 </main>;
}
