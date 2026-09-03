import {requireChatGPTUser} from "../../../chatgpt-auth";
import PracticeRunner from "./PracticeRunner";
export const dynamic="force-dynamic";
export default async function Session({params}:{params:Promise<{id:string}>}){await requireChatGPTUser(`/practice/session/${(await params).id}`);return <main className="session-page"><PracticeRunner id={(await params).id}/></main>}
