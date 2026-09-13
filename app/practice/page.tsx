import {requirePlayer} from "../auth";
import {getDb} from "../../db";
import {topics} from "../../db/schema";
import PlatformShell from "../PlatformShell";
import PracticeSetup from "./PracticeSetup";

export const dynamic="force-dynamic";

export default async function Practice(){
 await requirePlayer("/practice");
 const db=await getDb();
 return <PlatformShell kicker="PRACTICE LAB" title="Build mastery on one topic"
  subtitle="A timed set of questions from one field, scored for speed and accuracy, with mastery tracked per topic.">
  <PracticeSetup topics={await db.select().from(topics)}/>
 </PlatformShell>;
}
