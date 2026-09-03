import {requireChatGPTUser} from "../chatgpt-auth";
import {getDb} from "../../db";
import {topics} from "../../db/schema";
import ArenaSetup from "./ArenaSetup";
export const dynamic="force-dynamic";
export default async function Arena(){await requireChatGPTUser("/arena");const db=await getDb();return <main className="arena-page"><header className="account-nav"><a className="brand compact" href="/dashboard"><img src="/assets/mark.png" alt=""/><span>CLASH OF ERRORS</span></a><a href="/dashboard">← Command Center</a></header><ArenaSetup topics={await db.select().from(topics)}/></main>}
