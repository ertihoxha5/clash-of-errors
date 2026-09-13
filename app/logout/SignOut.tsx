"use client";
import {useEffect,useState} from "react";

// Signing out deletes the session row, so the cookie cannot be replayed.
export default function SignOut(){
 const [message,setMessage]=useState("Signing you out…");
 useEffect(()=>{
  let cancelled=false;
  void fetch("/api/account",{method:"DELETE"})
   .then(()=>{if(!cancelled)location.href="/login"})
   .catch(()=>{if(!cancelled)setMessage("Could not reach the server. Refresh to try again.")});
  return()=>{cancelled=true};
 },[]);
 return <p role="status">{message}</p>;
}
