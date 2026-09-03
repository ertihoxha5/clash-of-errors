import type {Metadata} from "next";
import {Oxanium,Space_Mono} from "next/font/google";
import "./globals.css";
const display=Oxanium({variable:"--font-display",subsets:["latin"],weight:["500","600","700"]});
const mono=Space_Mono({variable:"--font-mono",subsets:["latin"],weight:["400","700"]});
export const metadata:Metadata={title:"Clash of Errors — Battle. Code. Conquer.",description:"A competitive coding arena for practice, live battles, progression, and adaptive coaching.",icons:{icon:"/assets/mark.png"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={`${display.variable} ${mono.variable}`}>{children}</body></html>}
