import {requirePlayer} from "../../../auth";
import BotBattle from "./BotBattle";
export const dynamic="force-dynamic";
export default async function Battle({params}:{params:Promise<{id:string}>}){const id=(await params).id;await requirePlayer(`/bots/battle/${id}`);return <main className="bots-page"><BotBattle id={id}/></main>}
