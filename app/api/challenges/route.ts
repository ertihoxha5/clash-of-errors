import { apiError, platformPlayer, rewardStatements } from "../../../lib/platform";

export async function GET(request:Request) {
  try {
    const p=await platformPlayer(); if(!p)return Response.json({error:"Authentication required"},{status:401});
    const id=Number(new URL(request.url).searchParams.get("id"));
    if(id){
      const question=await p.db.prepare("SELECT q.id,q.prompt,q.code,q.difficulty,t.name topic FROM questions q JOIN topics t ON t.id=q.topic_id WHERE q.id=? AND q.status='published'").bind(id).first();
      if(!question)return Response.json({error:"Challenge not found"},{status:404});
      const options=await p.db.prepare("SELECT id,label FROM question_options WHERE question_id=? ORDER BY position").bind(id).all();
      return Response.json({question,options:options.results});
    }
    const rows=await p.db.prepare("SELECT q.id,q.prompt,q.difficulty,t.name topic,EXISTS(SELECT 1 FROM challenge_attempts a WHERE a.user_id=? AND a.question_id=q.id AND a.correct=1) solved FROM questions q JOIN topics t ON t.id=q.topic_id WHERE q.status='published' ORDER BY t.name,q.id LIMIT 200").bind(p.user.userId).all();
    return Response.json({challenges:rows.results});
  }catch(error){return apiError(error);}
}
export async function POST(request:Request){
  try{
    const p=await platformPlayer();if(!p)return Response.json({error:"Authentication required"},{status:401});
    const body=await request.json() as {questionId?:number;optionId?:number};
    if(!Number.isInteger(body.questionId)||!Number.isInteger(body.optionId))return Response.json({error:"Choose an answer"},{status:400});
    const option=await p.db.prepare("SELECT o.is_correct correct,q.explanation FROM question_options o JOIN questions q ON q.id=o.question_id WHERE o.id=? AND q.id=? AND q.status='published'").bind(body.optionId,body.questionId).first<{correct:number;explanation:string}>();
    if(!option)return Response.json({error:"Invalid challenge answer"},{status:400});
    const previous=await p.db.prepare("SELECT 1 FROM platform_rewards WHERE user_id=? AND source=?").bind(p.user.userId,`challenge:${body.questionId}`).first();
    const statements=[p.db.prepare("INSERT INTO challenge_attempts (id,user_id,question_id,option_id,correct,created_at) VALUES (?,?,?,?,?,?)").bind(crypto.randomUUID(),p.user.userId,body.questionId,body.optionId,option.correct,new Date().toISOString())];
    if(option.correct)statements.push(...rewardStatements(p.db,p.user.userId,`challenge:${body.questionId}`,25));
    const result=await p.db.batch(statements);
    return Response.json({correct:!!option.correct,explanation:option.explanation,xp:option.correct&&!previous&&result[1]?.meta.changes===1?25:0});
  }catch(error){return apiError(error);}
}
