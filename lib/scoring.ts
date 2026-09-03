export const SCORING_VERSION="1.0";
export function scoreAnswer(correct:boolean,responseMs:number,streak:number){if(!correct)return 0;const seconds=Math.max(0,responseMs)/1000,speed=Math.max(0,Math.round(100-seconds*3)),streakBonus=Math.min(75,streak*15);return 100+speed+streakBonus}
