export const RANKS = [
 {name:"Bronze I",xp:0,color:"#bd8a60",crest:"I"},{name:"Bronze II",xp:250,color:"#bd8a60",crest:"II"},{name:"Bronze III",xp:500,color:"#bd8a60",crest:"III"},
 {name:"Silver I",xp:900,color:"#bdcbd9",crest:"I"},{name:"Silver II",xp:1400,color:"#bdcbd9",crest:"II"},{name:"Silver III",xp:2000,color:"#bdcbd9",crest:"III"},
 {name:"Gold I",xp:2800,color:"#e3bd65",crest:"I"},{name:"Gold II",xp:3700,color:"#e3bd65",crest:"II"},{name:"Gold III",xp:4700,color:"#e3bd65",crest:"III"},
 {name:"Platinum I",xp:6000,color:"#80d8d1",crest:"I"},{name:"Platinum II",xp:7500,color:"#80d8d1",crest:"II"},{name:"Platinum III",xp:9200,color:"#80d8d1",crest:"III"},
 {name:"Diamond I",xp:11000,color:"#8abaff",crest:"I"},{name:"Diamond II",xp:13000,color:"#8abaff",crest:"II"},{name:"Diamond III",xp:15500,color:"#8abaff",crest:"III"},
 {name:"Master I",xp:18500,color:"#c6a0f2",crest:"I"},{name:"Master II",xp:22000,color:"#c6a0f2",crest:"II"},{name:"Master III",xp:26000,color:"#c6a0f2",crest:"III"},
 {name:"MASTERPIECE",xp:30000,color:"#f5dca0",crest:"♛"},
] as const;
export function rankForXp(xp:number){return [...RANKS].reverse().find(r=>xp>=r.xp)||RANKS[0]}
export function nextRank(xp:number){return RANKS.find(r=>r.xp>xp)||null}
export const WHEEL_PRIZES=[{label:"25 XP",xp:25,shards:0},{label:"10 Shards",xp:0,shards:10},{label:"50 XP",xp:50,shards:0},{label:"20 Shards",xp:0,shards:20},{label:"75 XP",xp:75,shards:0},{label:"100 XP",xp:100,shards:0}] as const;
export const lossCost=(xp:number)=>Math.max(1,Math.ceil(xp/5));
