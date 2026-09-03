import {requireChatGPTUser} from "../../chatgpt-auth";
import Lobby from "./Lobby";
export const dynamic="force-dynamic";
export default async function Room({params}:{params:Promise<{code:string}>}){const code=(await params).code.toUpperCase();await requireChatGPTUser(`/room/${code}`);return <main className="arena-page"><Lobby code={code}/></main>}
