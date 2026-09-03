import {requireChatGPTUser} from "../../chatgpt-auth";
import QuestionManager from "./QuestionManager";
export const dynamic="force-dynamic";
export default async function QuestionsPage(){await requireChatGPTUser("/instructor/questions");return <main className="instructor-page"><aside className="instructor-nav"><a href="/dashboard"><img src="/assets/mark.png" alt="Clash of Errors"/></a><span>INSTRUCTOR</span><nav><a href="/dashboard">Overview</a><a className="active" href="/instructor/questions">Question Bank</a><a href="#">Question Sets</a><a href="#">Arenas</a><a href="#">Reports</a></nav></aside><section className="instructor-main"><QuestionManager/></section></main>}
