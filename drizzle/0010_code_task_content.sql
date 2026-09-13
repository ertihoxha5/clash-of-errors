-- Code challenge content: find-the-bug tasks (server-verified line + fix)
-- and write-the-code tasks (tests executed in the browser sandbox).
-- The bug tasks are also the terminal content for the Bug Hunter arcade run.
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2001,'bug-off-by-one-last',id,'bug','The last item never arrives','easy','javascript','This should return every item in the list, but the final one is always missing.','function copyAll(items) {
  const out = [];
  for (let i = 0; i < items.length - 1; i++) {
    out.push(items[i]);
  }
  return out;
}',3,'[{"label":"for (let i = 0; i < items.length; i++) {","correct":true},{"label":"for (let i = 1; i < items.length; i++) {","correct":false},{"label":"for (let i = 0; i <= items.length; i++) {","correct":false}]','[]','length - 1 stops one iteration early, so the last element is never pushed. Indices run from 0 to length - 1, which the condition i < items.length covers exactly.','',25,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2002,'bug-assignment-in-if',id,'bug','The branch always runs','easy','javascript','Every call reports the user as an admin, even for regular accounts.','function isAdmin(user) {
  if (user.role = "admin") {
    return true;
  }
  return false;
}',2,'[{"label":"if (user.role === \"admin\") {","correct":true},{"label":"if (user.role = \"admin\" ) return true;","correct":false},{"label":"if (user.role != \"admin\") {","correct":false}]','[]','A single = assigns instead of comparing. The assignment evaluates to the truthy string "admin", so the branch always runs — and it overwrites the user''s real role as a side effect.','',25,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2003,'bug-push-returns-length',id,'bug','The array turned into a number','easy','javascript','addTag is supposed to return the updated list, but callers receive a number.','function addTag(tags, tag) {
  const next = tags.slice();
  return next.push(tag);
}',3,'[{"label":"next.push(tag);\n  return next;","correct":true},{"label":"return next.concat();","correct":false},{"label":"return tags.push(tag);","correct":false}]','[]','push returns the new length, not the array. Push first, then return the array — or use next.concat(tag), which returns a new array.','',25,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2004,'bug-missing-await',id,'bug','The caller gets a Promise','easy','javascript','This logs ''Promise { <pending> }'' instead of the user record.','async function show(id) {
  const user = fetchUser(id);
  console.log(user.name);
  return user;
}',2,'[{"label":"const user = await fetchUser(id);","correct":true},{"label":"const user = fetchUser(id).value;","correct":false},{"label":"const user = async fetchUser(id);","correct":false}]','[]','fetchUser returns a Promise. Without await, user is the Promise itself and user.name is undefined. await unwraps it inside the async function.','',25,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2005,'bug-splice-in-loop',id,'bug','Half the matches survive','medium','javascript','Removing every flagged row leaves some of them behind.','function removeFlagged(rows) {
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].flagged) rows.splice(i, 1);
  }
  return rows;
}',3,'[{"label":"if (rows[i].flagged) { rows.splice(i, 1); i--; }","correct":true},{"label":"if (rows[i].flagged) rows.splice(i, 2);","correct":false},{"label":"if (rows[i].flagged) delete rows[i];","correct":false}]','[]','splice shifts every later element down one, and the loop still increments i, so the row that moved into the current slot is skipped. Step back with i-- after removing, or build a new array with filter.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2006,'bug-closure-var',id,'bug','Every handler sees the last index','medium','javascript','Each button should log its own index, but they all log the same number.','function wire(buttons) {
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].onclick = () => console.log(i);
  }
}',2,'[{"label":"for (let i = 0; i < buttons.length; i++) {","correct":true},{"label":"for (var i = buttons.length; i > 0; i--) {","correct":false},{"label":"for (var i in buttons) {","correct":false}]','[]','var creates a single function-scoped binding that every closure shares, so all handlers read its final value. let gives each iteration its own binding.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2007,'bug-falsy-default',id,'bug','Zero becomes the default','medium','javascript','A quantity of 0 is silently replaced by 1.','function lineTotal(price, quantity) {
  const count = quantity || 1;
  return price * count;
}',2,'[{"label":"const count = quantity ?? 1;","correct":true},{"label":"const count = quantity | 1;","correct":false},{"label":"const count = Boolean(quantity) * 1;","correct":false}]','[]','|| treats every falsy value as missing, and 0 is falsy. ?? only falls back for null and undefined, which is what a default value should mean.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2008,'bug-shallow-copy',id,'bug','The original mutated too','medium','javascript','Editing the copy changes the record it was copied from.','function withTag(record, tag) {
  const copy = { ...record };
  copy.tags.push(tag);
  return copy;
}',3,'[{"label":"copy.tags = [...record.tags, tag];","correct":true},{"label":"copy.tags = record.tags.push(tag);","correct":false},{"label":"copy = { ...record, tags: tag };","correct":false}]','[]','Spread copies one level deep, so copy.tags and record.tags are the same array. Replace the nested array with a new one instead of mutating it.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2009,'bug-async-loop-sum',id,'bug','The total is always zero','medium','javascript','The totals never accumulate, however many rows are fetched.','async function total(ids) {
  let sum = 0;
  ids.forEach(async id => {
    sum += await fetchAmount(id);
  });
  return sum;
}',3,'[{"label":"for (const id of ids) { sum += await fetchAmount(id); }","correct":true},{"label":"ids.forEach(id => sum += fetchAmount(id));","correct":false},{"label":"ids.map(async id => sum += await fetchAmount(id));","correct":false}]','[]','forEach ignores the promises its async callback returns, so the function returns before any addition happens. A for..of loop with await — or Promise.all plus a reduce — actually waits.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2010,'bug-sort-numbers',id,'bug','10 sorts before 9','medium','javascript','Sorting these numbers produces a strange order.','function ranked(scores) {
  return scores.slice().sort();
}',2,'[{"label":"return scores.slice().sort((a, b) => a - b);","correct":true},{"label":"return scores.slice().sort().reverse();","correct":false},{"label":"return scores.slice().sort(Number);","correct":false}]','[]','The default sort compares values as strings, so "10" comes before "9". Pass a numeric comparator.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2011,'bug-this-in-callback',id,'bug','this is undefined inside the callback','medium','javascript','The counter never increments and throws in strict mode.','class Counter {
  constructor() { this.total = 0; }
  watch(events) {
    events.forEach(function () { this.total++; });
  }
}',4,'[{"label":"events.forEach(() => { this.total++; });","correct":true},{"label":"events.forEach(function () { total++; });","correct":false},{"label":"events.forEach(this.total++);","correct":false}]','[]','A plain function expression gets its own this. An arrow function inherits this from watch, so it points at the instance.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2012,'bug-regex-global-state',id,'bug','Every second call fails','hard','javascript','The same string matches, then fails, then matches again.','const EMAIL = /\S+@\S+/g;
function looksLikeEmail(value) {
  return EMAIL.test(value);
}',1,'[{"label":"const EMAIL = /\\S+@\\S+/;","correct":true},{"label":"const EMAIL = new RegExp(''\\\\S+@\\\\S+'', ''gi'');","correct":false},{"label":"const EMAIL = /\\S+@\\S+/gm;","correct":false}]','[]','A /g regex keeps lastIndex between calls, so test alternates between true and false on the same input. Drop the g flag for a boolean check, or reset lastIndex before each test.','',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2013,'bug-float-equality',id,'bug','The balance never reaches zero','hard','javascript','This loop never terminates for some inputs.','function drain(balance, step) {
  while (balance !== 0) {
    balance -= step;
  }
  return balance;
}',2,'[{"label":"while (balance > 1e-9) {","correct":true},{"label":"while (balance != 0) {","correct":false},{"label":"while (!balance) {","correct":false}]','[]','Floating point subtraction rarely lands exactly on 0, so an equality test can be skipped over forever. Compare against a small epsilon, or work in integer cents.','',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2014,'bug-mutable-default-cache',id,'bug','Cached zero is recomputed forever','hard','javascript','A computed value of 0 never gets cached.','const cache = new Map();
function memo(key, compute) {
  if (cache.get(key)) return cache.get(key);
  const value = compute();
  cache.set(key, value);
  return value;
}',3,'[{"label":"if (cache.has(key)) return cache.get(key);","correct":true},{"label":"if (cache.get(key) != null) return key;","correct":false},{"label":"if (cache.size) return cache.get(key);","correct":false}]','[]','Truthiness is the wrong hit test: a cached 0, "" or false looks like a miss. Map.has distinguishes a stored falsy value from an absent key.','',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2015,'bug-missing-break',id,'bug','Two branches run at once','hard','javascript','Choosing ''draft'' also applies the published behaviour.','function label(state) {
  switch (state) {
    case "draft":
      return "Draft";
    case "review":
      text = "In review";
    case "published":
      return "Live";
  }
}',6,'[{"label":"return \"In review\";","correct":true},{"label":"text = \"In review\"; continue;","correct":false},{"label":"case \"published\":","correct":false}]','[]','Without a break or return, execution falls through into the next case, so "review" returns "Live". It also assigns an undeclared global.','',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2016,'bug-promise-swallow',id,'bug','Failures disappear','hard','javascript','When save rejects, the caller sees success.','async function persist(record) {
  try {
    await save(record);
  } catch (error) {}
  return "saved";
}',4,'[{"label":"} catch (error) {\n    throw error;","correct":true},{"label":"} catch (error) { return error; }","correct":false},{"label":"} finally { return ''saved''; }","correct":false}]','[]','An empty catch swallows the failure and the function reports success anyway. Rethrow after logging, or return a result the caller can inspect.','',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2017,'bug-index-of-zero',id,'bug','The first element is never found','medium','javascript','Searching for the item at index 0 reports it as missing.','function has(list, value) {
  if (list.indexOf(value)) return true;
  return false;
}',2,'[{"label":"if (list.indexOf(value) !== -1) return true;","correct":true},{"label":"if (list.indexOf(value) > 1) return true;","correct":false},{"label":"if (!list.indexOf(value)) return true;","correct":false}]','[]','indexOf returns 0 for the first element, which is falsy. Compare against -1, or use list.includes(value).','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2018,'bug-return-newline',id,'bug','The function returns undefined','hard','javascript','This always returns undefined, whatever the input.','function point(x, y) {
  return
  { x: x, y: y };
}',2,'[{"label":"return {","correct":true},{"label":"return; { x: x, y: y };","correct":false},{"label":"return ({ x, y })","correct":false}]','[]','Automatic semicolon insertion ends the return statement at the line break, so the object literal is unreachable. Keep the opening brace on the return line.','',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2019,'bug-array-fill-reference',id,'bug','Every row changed together','hard','javascript','Writing to one row writes to all of them.','function grid(size) {
  const rows = new Array(size).fill([]);
  rows[0].push("x");
  return rows;
}',2,'[{"label":"const rows = Array.from({ length: size }, () => []);","correct":true},{"label":"const rows = new Array(size).fill(new Array());","correct":false},{"label":"const rows = [...new Array(size)].fill([]);","correct":false}]','[]','fill stores the same array reference in every slot. Array.from with a factory builds a distinct array per row.','',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2020,'bug-parseint-radix',id,'bug','Leading zeros break parsing','easy','javascript','Some numeric strings parse to unexpected values.','function toNumber(value) {
  return parseInt(value);
}',2,'[{"label":"return parseInt(value, 10);","correct":true},{"label":"return parseInt(value, 8);","correct":false},{"label":"return parseFloat(value, 10);","correct":false}]','[]','parseInt without a radix lets the input decide the base, and it stops at the first non-digit. Always pass 10 — or use Number(value) when the whole string must be numeric.','',25,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2021,'bug-length-check-order',id,'bug','Crash on an empty list','easy','javascript','This throws whenever the list is empty.','function firstName(users) {
  const name = users[0].name;
  if (!users.length) return "nobody";
  return name;
}',2,'[{"label":"if (!users.length) return \"nobody\";\n  const name = users[0].name;","correct":true},{"label":"const name = users[0]?.name ?? users;","correct":false},{"label":"const name = users.name[0];","correct":false}]','[]','The guard runs after the access it is supposed to protect. Check the length — or use optional chaining — before reading index 0.','',25,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2022,'bug-event-listener-leak',id,'bug','Memory grows on every mount','hard','javascript','Each time this component mounts, another listener is added and never removed.','useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener("resize", onResize);
  return undefined;
}, []);',4,'[{"label":"return () => window.removeEventListener(\"resize\", onResize);","correct":true},{"label":"return () => setWidth(0);","correct":false},{"label":"window.removeEventListener(\"resize\", onResize);","correct":false}]','[]','The effect never cleans up, so every mount leaves another listener holding its closure alive. Return a cleanup function that removes the same handler reference.','',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2023,'bug-nan-compare',id,'bug','NaN is never detected','medium','javascript','Invalid numbers slip through this guard.','function isInvalid(value) {
  return value === NaN;
}',2,'[{"label":"return Number.isNaN(value);","correct":true},{"label":"return value == NaN;","correct":false},{"label":"return typeof value === ''NaN'';","correct":false}]','[]','NaN is the only value not equal to itself, so any comparison with it is false. Number.isNaN performs the check without coercing.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2024,'bug-object-key-order',id,'bug','The override is ignored','medium','javascript','The caller''s options never take effect.','function config(options) {
  return { ...options, retries: 3, timeout: 1000 };
}',2,'[{"label":"return { retries: 3, timeout: 1000, ...options };","correct":true},{"label":"return { ...options, ...{ retries: 3 } };","correct":false},{"label":"return Object.assign(options, { retries: 3, timeout: 1000 });","correct":false}]','[]','Later properties win in an object literal, so the hard-coded values overwrite the caller''s. Spread the overrides last.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2025,'write-array-sum',id,'write','Array sum','easy','javascript','Return the sum of every number in the array. An empty array sums to 0.','function arraySum(arr) {
  // your code here
}',NULL,'[]','[{"name":"sums a short list","call":"arraySum([1, 2, 3])","expect":6},{"name":"handles an empty array","call":"arraySum([])","expect":0},{"name":"handles negatives","call":"arraySum([-4, 4, -2])","expect":-2},{"name":"handles one element","call":"arraySum([42])","expect":42},{"name":"handles a long list","call":"arraySum([1,1,1,1,1,1,1,1,1,1])","expect":10}]','A reduce with an explicit initial value of 0 covers the empty case: arr.reduce((total, n) => total + n, 0).','function arraySum(arr) {
  return arr.reduce((total, n) => total + n, 0);
}',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2026,'write-reverse-words',id,'write','Reverse the words','easy','javascript','Return the sentence with its words in reverse order, separated by single spaces.','function reverseWords(sentence) {
  // your code here
}',NULL,'[]','[{"name":"reverses three words","call":"reverseWords(\"code or be coded\")","expect":"coded be or code"},{"name":"handles one word","call":"reverseWords(\"solo\")","expect":"solo"},{"name":"handles an empty string","call":"reverseWords(\"\")","expect":""},{"name":"collapses nothing extra","call":"reverseWords(\"a b\")","expect":"b a"}]','Split on whitespace, reverse, and join: sentence.split(/\s+/).filter(Boolean).reverse().join(" ").','function reverseWords(sentence) {
  return sentence.split(/s+/).filter(Boolean).reverse().join(" ");
}',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2027,'write-count-vowels',id,'write','Count the vowels','easy','javascript','Return how many vowels (a, e, i, o, u) the string contains, ignoring case.','function countVowels(text) {
  // your code here
}',NULL,'[]','[{"name":"counts lowercase","call":"countVowels(\"banana\")","expect":3},{"name":"ignores case","call":"countVowels(\"AEIOUxyz\")","expect":5},{"name":"handles no vowels","call":"countVowels(\"rhythm\")","expect":0},{"name":"handles an empty string","call":"countVowels(\"\")","expect":0}]','A regex match is the shortest route: (text.match(/[aeiou]/gi) || []).length.','function countVowels(text) {
  return (text.match(/[aeiou]/gi) || []).length;
}',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2028,'write-fizzbuzz-line',id,'write','FizzBuzz value','easy','javascript','Return "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for both, otherwise the number as a string.','function fizzbuzz(n) {
  // your code here
}',NULL,'[]','[{"name":"multiple of three","call":"fizzbuzz(9)","expect":"Fizz"},{"name":"multiple of five","call":"fizzbuzz(10)","expect":"Buzz"},{"name":"multiple of both","call":"fizzbuzz(15)","expect":"FizzBuzz"},{"name":"plain number","call":"fizzbuzz(7)","expect":"7"},{"name":"zero is both","call":"fizzbuzz(0)","expect":"FizzBuzz"}]','Test the combined case first, then each single case, and fall through to String(n).','function fizzbuzz(n) {
  if (n % 15 === 0) return "FizzBuzz";
  if (n % 3 === 0) return "Fizz";
  if (n % 5 === 0) return "Buzz";
  return String(n);
}',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2029,'write-unique',id,'write','Unique values','medium','javascript','Return a new array with duplicates removed, keeping the first occurrence order.','function unique(items) {
  // your code here
}',NULL,'[]','[{"name":"removes duplicates","call":"unique([1, 2, 2, 3, 1])","expect":[1,2,3]},{"name":"keeps order","call":"unique([\"b\", \"a\", \"b\"])","expect":["b","a"]},{"name":"handles an empty array","call":"unique([])","expect":[]},{"name":"keeps falsy values","call":"unique([0, 0, false, 0])","expect":[0,false]}]','[...new Set(items)] preserves insertion order and treats 0 and false as distinct values.','function unique(items) {
  return [...new Set(items)];
}',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2030,'write-title-case',id,'write','Title case','medium','javascript','Capitalise the first letter of each word and lowercase the rest.','function titleCase(text) {
  // your code here
}',NULL,'[]','[{"name":"capitalises words","call":"titleCase(\"clash of errors\")","expect":"Clash Of Errors"},{"name":"lowercases the rest","call":"titleCase(\"HELLO world\")","expect":"Hello World"},{"name":"handles one word","call":"titleCase(\"solo\")","expect":"Solo"},{"name":"handles an empty string","call":"titleCase(\"\")","expect":""}]','Split on spaces, then rebuild each word as word[0].toUpperCase() + word.slice(1).toLowerCase().','function titleCase(text) {
  return text
    .split(" ")
    .map(word => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word)
    .join(" ");
}',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2031,'write-chunk',id,'write','Chunk an array','medium','javascript','Split the array into groups of at most `size`, in order.','function chunk(items, size) {
  // your code here
}',NULL,'[]','[{"name":"splits evenly","call":"chunk([1, 2, 3, 4], 2)","expect":[[1,2],[3,4]]},{"name":"keeps a short tail","call":"chunk([1, 2, 3], 2)","expect":[[1,2],[3]]},{"name":"handles an empty array","call":"chunk([], 3)","expect":[]},{"name":"handles size larger than input","call":"chunk([1], 5)","expect":[[1]]}]','Step the index by size and slice: for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size)).','function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2032,'write-word-count',id,'write','Word frequency','medium','javascript','Return an object mapping each lowercase word to how many times it appears.','function wordCount(text) {
  // your code here
}',NULL,'[]','[{"name":"counts repeats","call":"wordCount(\"a b a\")","expect":{"a":2,"b":1}},{"name":"ignores case","call":"wordCount(\"Bug bug\")","expect":{"bug":2}},{"name":"handles an empty string","call":"wordCount(\"\")","expect":{}}]','Lowercase, split on whitespace, drop empties, then accumulate counts into an object with reduce.','function wordCount(text) {
  return text
    .toLowerCase()
    .split(/s+/)
    .filter(Boolean)
    .reduce((counts, word) => {
      counts[word] = (counts[word] || 0) + 1;
      return counts;
    }, {});
}',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2033,'write-balanced-brackets',id,'write','Balanced brackets','hard','javascript','Return true when every bracket in the string is closed in the right order. Handles (), [] and {}.','function balanced(text) {
  // your code here
}',NULL,'[]','[{"name":"simple pair","call":"balanced(\"()\")","expect":true},{"name":"nested pairs","call":"balanced(\"{[()]}\")","expect":true},{"name":"wrong order","call":"balanced(\"([)]\")","expect":false},{"name":"unclosed","call":"balanced(\"(()\")","expect":false},{"name":"empty string","call":"balanced(\"\")","expect":true},{"name":"ignores other characters","call":"balanced(\"a(b)c\")","expect":true}]','Push opening brackets onto a stack; on a closing bracket, the popped value must be its partner. The stack must be empty at the end.','function balanced(text) {
  const partner = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const char of text) {
    if (char === "(" || char === "[" || char === "{") stack.push(char);
    else if (partner[char] && stack.pop() !== partner[char]) return false;
  }
  return stack.length === 0;
}',60,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2034,'write-flatten',id,'write','Flatten deeply','hard','javascript','Flatten an arbitrarily nested array into a single flat array, preserving order.','function flatten(items) {
  // your code here
}',NULL,'[]','[{"name":"one level","call":"flatten([1, [2, 3]])","expect":[1,2,3]},{"name":"deep nesting","call":"flatten([1, [2, [3, [4]]]])","expect":[1,2,3,4]},{"name":"already flat","call":"flatten([1, 2])","expect":[1,2]},{"name":"empty arrays vanish","call":"flatten([[], [1, []]])","expect":[1]}]','Recurse on each element: items.reduce((out, item) => out.concat(Array.isArray(item) ? flatten(item) : item), []).','function flatten(items) {
  return items.reduce(
    (out, item) => out.concat(Array.isArray(item) ? flatten(item) : item),
    []
  );
}',60,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 2035,'write-debounce-count',id,'write','Longest run','hard','javascript','Return the length of the longest run of equal values in the array.','function longestRun(items) {
  // your code here
}',NULL,'[]','[{"name":"one long run","call":"longestRun([1, 1, 1, 2])","expect":3},{"name":"run at the end","call":"longestRun([1, 2, 2, 2])","expect":3},{"name":"no repeats","call":"longestRun([1, 2, 3])","expect":1},{"name":"empty array","call":"longestRun([])","expect":0},{"name":"all equal","call":"longestRun([\"a\", \"a\"])","expect":2}]','Track the current run length and the best seen: reset the counter whenever the value changes, and remember the maximum.','function longestRun(items) {
  let best = 0;
  let run = 0;
  for (let i = 0; i < items.length; i++) {
    run = i > 0 && items[i] === items[i - 1] ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}',60,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
