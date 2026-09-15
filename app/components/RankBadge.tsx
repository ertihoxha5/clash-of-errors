import {rankForXp} from "../../lib/ranks";
import s from "../rewards/rewards.module.css";
export default function RankBadge({xp,compact=false}:{xp:number;compact?:boolean}){const rank=rankForXp(xp);return <span className={`${s.badge} ${compact?s.compact:""}`} style={{color:rank.color}}><span className={s.shield} aria-hidden="true"><i>♛</i><b>{rank.crest}</b></span><span>{rank.name}</span></span>}
