import {requireChatGPTUser} from "../chatgpt-auth";
import {getDb} from "../../db";
import {topics} from "../../db/schema";
import BotSetup from "./BotSetup";
export const dynamic="force-dynamic";
export default async function Bots(){await requireChatGPTUser("/bots");const db=await getDb();return <main className="bots-page"><header className="account-nav"><a className="brand compact" href="/dashboard"><img src="/assets/mark.png" alt=""/><span>CLASH OF ERRORS</span></a><a href="/dashboard">← Command Center</a></header><BotSetup topics={await db.select().from(topics)}/></main>}
