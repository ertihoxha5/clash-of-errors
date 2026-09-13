import {getPlayer,safeReturnPath} from "../auth";
import AccountForm from "../login/AccountForm";
import AuthScreen from "../login/AuthScreen";

export const dynamic="force-dynamic";

export default async function Register({searchParams}:{searchParams:Promise<{return_to?:string}>}){
 const returnTo=safeReturnPath((await searchParams).return_to??"/dashboard");
 const player=await getPlayer();
 return <AuthScreen
  mode="register"
  player={player&&{displayName:player.displayName,username:player.username}}
  returnTo={returnTo}>
  <AccountForm mode="register" returnTo={returnTo}/>
 </AuthScreen>;
}
