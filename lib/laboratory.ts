export const LAB_ITEMS=[
 {id:"reactor",name:"Aether reactor",cost:20,description:"Bring the central power core online. Its cyan field illuminates your laboratory.",symbol:"◈"},
 {id:"archive",name:"Runic archive",cost:40,description:"Build a luminous archive of your discoveries beside the research console.",symbol:"▥"},
 {id:"beacon",name:"Storm beacon",cost:65,description:"Channel a violet storm above your laboratory's signal tower.",symbol:"ϟ"},
 {id:"crest",name:"Sovereign crest",cost:100,description:"Raise a golden crest over your completed research chamber.",symbol:"♜"},
] as const;
// A balance derived from the immutable reward ledger cannot be replayed by
// resubmitting a challenge. Purchases subtract their recorded, server-set cost.
export const EARNED_SHARDS="COALESCE((SELECT sum(earned) FROM (SELECT user_id,CAST(xp/5 AS INTEGER) earned FROM platform_rewards WHERE source LIKE 'task:%' OR source LIKE 'challenge:%' UNION ALL SELECT user_id,shards earned FROM progression_events) WHERE user_id=?),0)";
export const SPENT_SHARDS="COALESCE((SELECT sum(cost) FROM lab_unlocks WHERE user_id=?),0)";
export const PURCHASE_SQL=`INSERT OR IGNORE INTO lab_unlocks (user_id,item,cost,created_at) SELECT ?,?,?,? WHERE ${EARNED_SHARDS}-${SPENT_SHARDS}>=?`;
