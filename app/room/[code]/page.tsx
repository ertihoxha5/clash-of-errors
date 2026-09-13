import {requirePlayer} from "../../auth";
import Lobby from "./Lobby";
export const dynamic="force-dynamic";
export default async function Room({params}:{params:Promise<{code:string}>}){const code=(await params).code.toUpperCase();await requirePlayer(`/room/${code}`);return <main className="arena-page"><Lobby code={code}/></main>}
