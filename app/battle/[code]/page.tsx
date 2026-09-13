import {requirePlayer} from "../../auth";
import BattleArena from "./BattleArena";
export const dynamic="force-dynamic";
export default async function BattlePage({params}:{params:Promise<{code:string}>}){const code=(await params).code.toUpperCase();await requirePlayer(`/battle/${code}`);return <main className="battle-page"><BattleArena code={code}/></main>}
