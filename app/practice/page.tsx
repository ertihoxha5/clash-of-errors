import {requireChatGPTUser} from "../chatgpt-auth";
import {getDb} from "../../db";
import {topics} from "../../db/schema";
import PracticeSetup from "./PracticeSetup";
export const dynamic="force-dynamic";
export default async function Practice(){await requireChatGPTUser("/practice");const db=await getDb(),topicRows=await db.select().from(topics);return <main className="practice-page"><header className="account-nav"><a className="brand compact" href="/dashboard"><img src="/assets/mark.png" alt=""/><span>CLASH OF ERRORS</span></a><a href="/dashboard">← Command Center</a></header><PracticeSetup topics={topicRows}/></main>}
