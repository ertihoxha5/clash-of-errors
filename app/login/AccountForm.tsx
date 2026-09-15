"use client";
import {useState} from "react";
import a from "./auth.module.css";

// One component drives both screens: the register view adds the name fields and
// the confirmation, the login view asks for the two things it needs.
export default function AccountForm({mode,returnTo}:{mode:"login"|"register";returnTo:string}){
 const [firstName,setFirstName]=useState("");
 const [lastName,setLastName]=useState("");
 const [username,setUsername]=useState("");
 const [password,setPassword]=useState("");
 const [confirm,setConfirm]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");

 async function submit(){
  setError("");
  if(mode==="register"&&password!==confirm){setError("Those passwords do not match.");return}
  setBusy(true);
  try{
   const response=await fetch("/api/account",{method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify(mode==="register"?{action:"register",firstName,lastName,username,password}:{action:"login",username,password})});
   const data=await response.json() as {error?:string};
   if(!response.ok)throw new Error(data.error||"That did not work. Please retry.");
   location.href=returnTo;
  }catch(problem){setError(problem instanceof Error?problem.message:"That did not work. Please retry.");setBusy(false)}
 }

 return <form className={a.form} onSubmit={event=>{event.preventDefault();void submit()}}>
  <p className={a.note}>Daily sign-in bonus: <strong>+30 XP</strong>, once per UTC day.</p>
  {mode==="register"&&<div className={a.pair}>
   <label className={a.field}>
    <span>First name</span>
    <input value={firstName} onChange={event=>setFirstName(event.target.value)} maxLength={40} autoComplete="given-name" required/>
   </label>
   <label className={a.field}>
    <span>Surname</span>
    <input value={lastName} onChange={event=>setLastName(event.target.value)} maxLength={40} autoComplete="family-name" required/>
   </label>
  </div>}

  <label className={a.field}>
   <span>Username</span>
   <input value={username} onChange={event=>setUsername(event.target.value.replace(/[^a-zA-Z0-9_]/g,"").toLowerCase())}
    maxLength={20} minLength={3} placeholder="codeninja" autoComplete="username" required/>
   {mode==="register"&&<small>3–20 characters. Letters, numbers and underscore.</small>}
  </label>

  <label className={a.field}>
   <span>Password</span>
   <input type="password" value={password} onChange={event=>setPassword(event.target.value)}
    minLength={mode==="register"?8:1} autoComplete={mode==="register"?"new-password":"current-password"} required/>
   {mode==="register"&&<small>At least 8 characters.</small>}
  </label>

  {mode==="register"&&<label className={a.field}>
   <span>Confirm password</span>
   <input type="password" value={confirm} onChange={event=>setConfirm(event.target.value)} autoComplete="new-password" required/>
  </label>}

  <button className="btn cyan solid" type="submit" disabled={busy}>
   {busy?(mode==="register"?"Creating account…":"Signing in…"):(mode==="register"?"Create account":"Sign in")}
  </button>
  {error&&<p className={a.error} role="alert">{error}</p>}
 </form>;
}
