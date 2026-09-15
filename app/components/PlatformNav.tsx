"use client";
import {usePathname} from "next/navigation";
export default function PlatformNav({items}:{items:{href:string;label:string}[]}){const pathname=usePathname();return <>{items.map(item=><a key={item.href} href={item.href} aria-current={pathname===item.href||pathname.startsWith(item.href+"/")?"page":undefined}>{item.label}</a>)}</>}
