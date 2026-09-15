import {getStore} from "../db";
import {LOGIN_INSERT} from "./progression-sql";
export async function dailyLogin(userId:string){const db=await getStore();const now=new Date().toISOString();const r=await db.prepare(LOGIN_INSERT).bind(userId,`login:${now.slice(0,10)}`,now).run();return r.meta.changes?30:0}
