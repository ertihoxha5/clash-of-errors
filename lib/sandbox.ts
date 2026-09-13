// Runs a player's code against a task's tests inside a Web Worker.
//
// The worker is a throwaway origin-less context created from a blob: it has no
// DOM, no access to this page's variables, and it is terminated the moment it
// takes too long, which is what makes an accidental infinite loop survivable.
// Results are advisory — the server decides what a passing run is worth.

export type TestOutcome={name:string;call:string;passed:boolean;expected:string;actual:string;error?:string};

const WORKER_SOURCE=`
const show = value => {
  if (typeof value === "string") return JSON.stringify(value);
  if (value === undefined) return "undefined";
  try { return JSON.stringify(value); } catch { return String(value); }
};
const same = (a, b) => {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(key => same(a[key], b[key]));
};
self.onmessage = event => {
  const { code, tests } = event.data;
  const results = [];
  let runner;
  try {
    // Direct eval inside this function body can see whatever the player declared.
    runner = new Function("__expression", code + "\\nreturn eval(__expression);");
  } catch (error) {
    self.postMessage({ compileError: String(error && error.message ? error.message : error), results: [] });
    return;
  }
  for (const test of tests) {
    try {
      const actual = runner(test.call);
      results.push({ name: test.name, call: test.call, passed: same(actual, test.expect), expected: show(test.expect), actual: show(actual) });
    } catch (error) {
      results.push({ name: test.name, call: test.call, passed: false, expected: show(test.expect), actual: "—", error: String(error && error.message ? error.message : error) });
    }
  }
  self.postMessage({ results });
};
`;

export function runTests(code:string,tests:{name:string;call:string;expect:unknown}[],timeoutMs=3000){
 return new Promise<{results:TestOutcome[];compileError?:string;timedOut?:boolean}>(resolve=>{
  let url="",worker:Worker|null=null;
  const finish=(value:{results:TestOutcome[];compileError?:string;timedOut?:boolean})=>{
   clearTimeout(timer);
   worker?.terminate();
   if(url)URL.revokeObjectURL(url);
   resolve(value);
  };
  const timer=setTimeout(()=>finish({
   results:tests.map(test=>({name:test.name,call:test.call,passed:false,expected:"—",actual:"—",error:"Timed out — check for an endless loop."})),
   timedOut:true,
  }),timeoutMs);
  try{
   url=URL.createObjectURL(new Blob([WORKER_SOURCE],{type:"text/javascript"}));
   worker=new Worker(url);
   worker.onmessage=event=>finish(event.data as {results:TestOutcome[];compileError?:string});
   worker.onerror=event=>finish({results:[],compileError:event.message||"The sandbox could not start."});
   worker.postMessage({code,tests});
  }catch{
   finish({results:[],compileError:"This browser blocked the code sandbox."});
  }
 });
}
