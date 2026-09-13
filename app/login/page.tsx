import {getPlayer,safeReturnPath} from "../auth";
import AccountForm from "./AccountForm";
import AuthScreen from "./AuthScreen";

export const dynamic="force-dynamic";

export default async function Login({searchParams}:{searchParams:Promise<{return_to?:string}>}){
 const returnTo=safeReturnPath((await searchParams).return_to??"/dashboard");
 const player=await getPlayer();
 return <AuthScreen
  mode="login"
  player={player&&{displayName:player.displayName,username:player.username}}
  returnTo={returnTo}>
  <AccountForm mode="login" returnTo={returnTo}/>
 </AuthScreen>;
}
