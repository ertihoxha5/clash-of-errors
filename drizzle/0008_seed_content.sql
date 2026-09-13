-- Seed content: topics and a published question bank.
-- Challenges, the practice lab, bot battles and live arenas all draw from this pool.
-- INSERT OR IGNORE keeps the migration safe to replay against an existing database.
INSERT OR IGNORE INTO topics (slug,name,description) VALUES ('javascript','JavaScript','Language semantics, async behaviour, and the quirks that bite in review.');
--> statement-breakpoint
INSERT OR IGNORE INTO topics (slug,name,description) VALUES ('python','Python','Idiomatic Python, mutability traps, and standard library behaviour.');
--> statement-breakpoint
INSERT OR IGNORE INTO topics (slug,name,description) VALUES ('algorithms','Data Structures & Algorithms','Complexity, traversal, and the classic interview toolkit.');
--> statement-breakpoint
INSERT OR IGNORE INTO topics (slug,name,description) VALUES ('debugging','Debugging & Errors','Reading stack traces, isolating faults, and naming the real bug.');
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1001,id,'What does this log?','console.log(typeof null);','typeof null returns "object". It is a bug preserved from the first JavaScript release for backwards compatibility; use value === null to test for null.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5001,1001,'a TypeError',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5002,1001,'"object"',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5003,1001,'"null"',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5004,1001,'"undefined"',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1002,id,'Which comparison is true?','console.log(0 == ''0'', 0 === ''0'');','== coerces the string to a number, so 0 == ''0'' is true. === compares types first, so 0 === ''0'' is false. Prefer === to avoid coercion surprises.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5005,1002,'true true',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5006,1002,'false true',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5007,1002,'true false',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5008,1002,'false false',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1003,id,'What is the value of x?','let x;
console.log(x);','A declared but unassigned binding holds undefined. A ReferenceError would only occur if the name were never declared.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5009,1003,'null',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5010,1003,'0',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5011,1003,'a ReferenceError',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5012,1003,'undefined',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1004,id,'What does this print?','const a = [1, 2, 3];
a.push(4);
console.log(a.length);','const prevents reassignment of the binding, not mutation of the array it points to. push adds an element, so length becomes 4.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5013,1004,'4',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5014,1004,'3',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5015,1004,'undefined',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5016,1004,'a TypeError because a is const',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1005,id,'Which fixes the string concatenation?','const n = 5;
console.log(''total: '' + n + 1);','+ is left-associative, so ''total: '' + 5 produces a string and + 1 appends ''1'', printing ''total: 51''. A template literal evaluates n + 1 as arithmetic first.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5017,1005,'Nothing — it already prints total: 6',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5018,1005,'Use `total: ${n + 1}`',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5019,1005,'Use ''total: '' + (n + 1) + ''''',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5020,1005,'Use ''total: '' + n++ ',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1006,id,'What is logged?','console.log([1, 2, 3].map(n => n * 2));','map returns a new array with the callback applied to each element; it does not mutate the original array.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5021,1006,'6',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5022,1006,'undefined',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5023,1006,'[2, 4, 6]',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5024,1006,'[1, 2, 3]',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1007,id,'What does this log and why?','for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}','var creates one function-scoped binding shared by all three callbacks. The loop finishes before any timeout runs, so each sees the final value 3. Switching to let gives a fresh binding per iteration and logs 0 1 2.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5025,1007,'0 1 2 — each callback captures its own i',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5026,1007,'0 0 0 — i resets each tick',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5027,1007,'Nothing — setTimeout needs a delay',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5028,1007,'3 3 3 — var is function scoped',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1008,id,'What is the output order?','console.log(''a'');
setTimeout(() => console.log(''b''), 0);
Promise.resolve().then(() => console.log(''c''));
console.log(''d'');','Synchronous code runs first (a, d). The microtask queue — promise callbacks — drains before the macrotask queue, so c precedes b even with a 0 ms timeout.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5029,1008,'a d c b',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5030,1008,'a d b c',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5031,1008,'a b c d',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5032,1008,'a c d b',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1009,id,'Why does this log undefined?','const counter = {
  n: 1,
  read() { return function () { return this.n; }(); }
};
console.log(counter.read());','A plain function invoked standalone gets its own this (undefined in strict mode, the global object otherwise). An arrow function inherits this lexically from read and returns 1.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5033,1009,'Object methods cannot return functions',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5034,1009,'The inner function has its own this, which is not counter',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5035,1009,'n is not initialised',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5036,1009,'read must be an arrow function to exist',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1010,id,'What does this evaluate to?','console.log([] + {}, typeof ([] + {}));','+ with non-primitives calls toPrimitive on both sides: [] becomes '''' and {} becomes ''[object Object]'', producing the string ''[object Object]''.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5037,1010,'0 number',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5038,1010,'a TypeError',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5039,1010,'"[object Object]" string',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5040,1010,'"{}" object',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1011,id,'Which value does spread copy?','const user = { name: ''Ana'', tags: [''a''] };
const copy = { ...user };
copy.tags.push(''b'');
console.log(user.tags.length);','Spread copies own enumerable properties one level deep. copy.tags is the same array reference as user.tags, so the push is visible through both. structuredClone gives a deep copy.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5041,1011,'1 — spread deep clones',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5042,1011,'0 — tags is detached',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5043,1011,'a TypeError — copy.tags is frozen',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5044,1011,'2 — spread is a shallow copy',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1012,id,'What does this async function return?','async function load() {
  return 42;
}
console.log(load());','An async function always returns a Promise wrapping its return value. Read it with await load() or load().then(...).','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5045,1012,'A Promise that resolves to 42',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5046,1012,'42',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5047,1012,'undefined',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5048,1012,'a SyntaxError',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1013,id,'What is the final value of result?','const result = [1, 2, 3].reduce((acc, n) => acc + n);','With no initial value reduce uses element 0 as the accumulator and starts the callback at index 1, giving 6. On an empty array with no initial value it throws a TypeError.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5049,1013,'a TypeError on an empty accumulator',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5050,1013,'6 — the first element seeds the accumulator',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5051,1013,'0 — reduce needs an initial value',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5052,1013,'NaN — acc starts undefined',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1014,id,'Why can this loop deadlock throughput?','for (const id of ids) {
  await fetchUser(id);
}','await suspends the loop until each request settles, so N requests take the sum of their latencies. await Promise.all(ids.map(fetchUser)) issues them concurrently when order does not matter.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5053,1014,'fetchUser is never called',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5054,1014,'The loop leaks a microtask per iteration',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5055,1014,'Each await serialises the requests; Promise.all runs them concurrently',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5056,1014,'await inside for..of is a SyntaxError',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1015,id,'What does this print?','class A { static x = 1; get v() { return A.x; } }
class B extends A { static x = 2; }
console.log(new B().v);','The getter closes over the identifier A, not over this.constructor, so it reads A.x regardless of the instance. Using this.constructor.x would print 2.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5057,1015,'2 — static fields are inherited dynamically',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5058,1015,'undefined',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5059,1015,'a ReferenceError',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5060,1015,'1 — the getter hard-codes A',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1016,id,'Which statement about this generator is true?','function* gen() {
  const x = yield 1;
  yield x * 2;
}
const g = gen();
g.next();
console.log(g.next(10).value);','The value passed to next() is the result of the paused yield expression, so x is 10 and the second yield produces 20. The first next() argument is discarded because no yield is waiting.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5061,1016,'20 — the argument to next becomes the value of the yield expression',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5062,1016,'2 — x is 1',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5063,1016,'NaN — x is undefined',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5064,1016,'1 — next ignores arguments',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1017,id,'What is the bug?','const cache = new Map();
function memo(key, compute) {
  if (cache.get(key)) return cache.get(key);
  const value = compute();
  cache.set(key, value);
  return value;
}','Truthiness is the wrong cache test: a cached 0 or false looks like a miss and is recomputed forever. Use cache.has(key) to distinguish a stored falsy value from an absent one.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5065,1017,'compute is never invoked',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5066,1017,'Falsy cached values (0, '''', false) are recomputed every call',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5067,1017,'Map keys must be strings',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5068,1017,'cache.set overwrites the whole map',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1018,id,'What does Object.freeze guarantee here?','const config = Object.freeze({ db: { host: ''local'' } });
config.db.host = ''remote'';
console.log(config.db.host);','Object.freeze only seals the object''s own properties. Nested objects stay mutable, so config.db.host changes. A deep freeze must recurse over nested values.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5069,1018,'a TypeError in strict mode',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5070,1018,'undefined',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5071,1018,'''remote'' — freeze is shallow',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5072,1018,'''local'' — freeze is deep',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1019,id,'What does this print?','print(type([]) is list)','type([]) returns the list class itself, and is compares identity against the same class object, so the result is True.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5073,1019,'False',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5074,1019,'list',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5075,1019,'a TypeError',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5076,1019,'True',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1020,id,'What is the output?','print(len(''clash''))','len returns the number of characters in the string: c, l, a, s, h.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5077,1020,'5',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5078,1020,'4',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5079,1020,'6',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5080,1020,'a TypeError',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1021,id,'Which slice reverses the list?','nums = [1, 2, 3]','A slice step of -1 walks the sequence backwards and returns a new reversed list. nums.reverse() reverses in place instead.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5081,1021,'nums[::1]',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5082,1021,'nums[::-1]',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5083,1021,'nums[-1:]',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5084,1021,'nums[0:-1]',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1022,id,'What does this print?','print(3 / 2, 3 // 2)','In Python 3, / is true division and always yields a float; // is floor division and truncates toward negative infinity.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5085,1022,'1.5 1.5',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5086,1022,'1 1.5',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5087,1022,'1.5 1',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5088,1022,'1 1',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1023,id,'What is the result?','d = {''a'': 1}
print(d.get(''b'', 0))','dict.get returns the default argument when the key is absent instead of raising KeyError like d[''b''] would.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5089,1023,'None',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5090,1023,'a KeyError',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5091,1023,'''b''',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5092,1023,'0',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1024,id,'What does this print?','print(bool([]), bool([0]))','An empty list is falsy. A list containing one element is truthy regardless of that element''s own truthiness.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5093,1024,'False True',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5094,1024,'False False',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5095,1024,'True True',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5096,1024,'True False',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1025,id,'Why does the second call return [1, 2]?','def add(item, bucket=[]):
    bucket.append(item)
    return bucket

add(1)
print(add(2))','Default arguments are evaluated once when the function is defined, so every call without an explicit bucket mutates the same list. Use bucket=None and create a fresh list inside the body.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5097,1025,'bucket is a global variable',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5098,1025,'The default list is created once at definition and shared across calls',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5099,1025,'append mutates the argument name',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5100,1025,'Python caches return values',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1026,id,'What does this print?','a = [1, 2, 3]
b = a
b.append(4)
print(len(a))','Assignment binds a second name to the same object; it does not copy. Use a.copy() or list(a) for an independent shallow copy.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5101,1026,'1',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5102,1026,'a TypeError',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5103,1026,'4 — b is another name for the same list',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5104,1026,'3 — b is a copy',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1027,id,'What is printed?','print([x for x in range(5) if x % 2][-1])','The comprehension keeps odd values [1, 3], and [-1] takes the last element, 3.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5105,1027,'4',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5106,1027,'1',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5107,1027,'an IndexError',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5108,1027,'3',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1028,id,'Which statement is true about this code?','try:
    raise ValueError(''bad'')
except Exception as e:
    print(type(e).__name__)
finally:
    print(''done'')','ValueError is a subclass of Exception, so the handler catches it and type(e).__name__ is the concrete class name. finally always runs, handled or not.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5109,1028,'It prints ValueError then done',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5110,1028,'It prints Exception then done',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5111,1028,'finally is skipped because the error was handled',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5112,1028,'It re-raises after finally',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1029,id,'What does this print?','s = {1, 2, 2, 3}
print(len(s))','A set stores unique values, so the duplicate 2 is collapsed and the length is 3.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5113,1029,'a TypeError',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5114,1029,'3',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5115,1029,'4',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5116,1029,'2',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1030,id,'Why is this comparison risky?','if 0.1 + 0.2 == 0.3:
    print(''equal'')','IEEE-754 doubles store approximations of decimal fractions. Compare with math.isclose or use decimal.Decimal when exact decimal arithmetic matters.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5117,1030,'0.1 + 0.2 raises an OverflowError',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5118,1030,'Python rounds to 2 decimals, so it always matches',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5119,1030,'Binary floats cannot represent these decimals exactly, so the sum is 0.30000000000000004',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5120,1030,'== is not defined for floats',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1031,id,'What does this print?','class Counter:
    count = 0
    def bump(self):
        self.count += 1

a, b = Counter(), Counter()
a.bump()
print(a.count, b.count, Counter.count)','self.count += 1 reads the class attribute but assigns to an instance attribute, shadowing the class value for a only. Mutating Counter.count directly would affect every instance.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5121,1031,'1 1 1 — the class attribute is shared',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5122,1031,'1 0 1',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5123,1031,'an AttributeError',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5124,1031,'1 0 0 — self.count += 1 creates an instance attribute',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1032,id,'What is the value of result?','result = [lambda: i for i in range(3)][0]()','Closures capture the variable by reference. After the comprehension finishes i is 2, so every lambda returns 2. Bind eagerly with lambda i=i: i to capture each value.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5125,1032,'2 — the lambdas close over the variable, not its value',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5126,1032,'0 — each lambda captures its own i',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5127,1032,'a NameError after the loop',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5128,1032,'None',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1033,id,'Which describes this generator''s memory use?','total = sum(x * x for x in range(10_000_000))','A generator expression is lazy: sum pulls one value at a time, so memory stays flat. A list comprehension with brackets would materialise ten million entries.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5129,1033,'It raises a MemoryError',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5130,1033,'Constant — the generator yields one value at a time',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5131,1033,'Linear — the whole sequence is materialised',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5132,1033,'Quadratic in the range size',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1034,id,'What does this print?','def f():
    try:
        return ''try''
    finally:
        return ''finally''

print(f())','A return inside finally replaces any pending return or exception, silently discarding it. Avoid returning from finally for exactly this reason.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5133,1034,'try finally',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5134,1034,'a SyntaxError',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5135,1034,'finally — a return in finally overrides the earlier one',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5136,1034,'try — the first return wins',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1035,id,'Why can this mutate the caller''s data?','def normalise(rows):
    for row in rows:
        row[''name''] = row[''name''].strip()
    return rows','The function edits the same dict objects the caller holds. Build new dicts, or copy.deepcopy the input, when the caller must keep its originals.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5137,1035,'return rows copies the list',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5138,1035,'for loops always copy',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5139,1035,'Strings are mutable in Python',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5140,1035,'The dicts are shared references, so edits are visible to the caller',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1036,id,'What does this print?','print(sorted([''b'', ''A'', ''a''], key=str.lower))','The key folds case so ''A'' and ''a'' compare equal, and Python''s sort is stable, preserving their original relative order — ''A'' came first in the input.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='python';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5141,1036,'[''A'', ''a'', ''b''] — sort is stable, so A keeps its earlier position',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5142,1036,'[''a'', ''A'', ''b'']',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5143,1036,'[''A'', ''a'', ''b''] in random order',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5144,1036,'a TypeError',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1037,id,'What is the average time complexity of binary search?','','Each comparison discards half of the remaining range, so the number of steps grows with the logarithm of the input size. It requires sorted input.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5145,1037,'O(n log n)',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5146,1037,'O(log n)',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5147,1037,'O(n)',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5148,1037,'O(1)',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1038,id,'Which structure gives O(1) average lookup by key?','','A hash map computes a bucket index directly from the key. Collisions degrade it, but average lookup, insert, and delete are constant time.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5149,1038,'Linked list',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5150,1038,'Binary heap',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5151,1038,'Hash map',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5152,1038,'Sorted array',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1039,id,'What does a stack pop return?','','A stack is last-in, first-out. Queues are first-in, first-out, and a priority queue returns the smallest or largest by priority.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5153,1039,'The first item pushed',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5154,1039,'The smallest item',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5155,1039,'A random item',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5156,1039,'The most recently pushed item',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1040,id,'What is the complexity of visiting every cell of an n x n grid?','','The grid holds n × n cells and each is visited once, so the work is quadratic in n.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5157,1040,'O(n²)',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5158,1040,'O(n)',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5159,1040,'O(log n)',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5160,1040,'O(n log n)',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1041,id,'Which traversal visits a binary search tree in sorted order?','','In-order visits the left subtree, the node, then the right subtree. In a BST that yields keys in ascending order.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5161,1041,'Level-order',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5162,1041,'In-order',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5163,1041,'Pre-order',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5164,1041,'Post-order',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1042,id,'What is the worst-case complexity of appending to a dynamic array?','','A resize copies every element, which costs O(n), but doubling the capacity makes those copies rare enough that the amortised cost per append is constant.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5165,1042,'Always O(n)',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5166,1042,'O(log n)',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5167,1042,'O(n) on a resize, but O(1) amortised',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5168,1042,'Always O(1)',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1043,id,'What is the bug in this binary search?','while (lo <= hi) {
  const mid = (lo + hi) / 2;
  if (a[mid] === t) return mid;
  if (a[mid] < t) lo = mid + 1; else hi = mid - 1;
}','Without Math.floor, mid can be fractional and a[mid] is undefined, breaking every comparison. Use Math.floor((lo + hi) / 2) — or lo + ((hi - lo) >> 1) to avoid overflow in fixed-width languages.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5169,1043,'lo <= hi should be lo < hi',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5170,1043,'The array must be reversed first',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5171,1043,'hi should start at a.length',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5172,1043,'mid is not floored, so it can be a fractional index',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1044,id,'Which algorithm finds the shortest path with non-negative weights?','','Dijkstra expands the closest unvisited node using a priority queue, which is correct when no edge weight is negative. Bellman-Ford handles negative weights.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5173,1044,'Dijkstra''s algorithm',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5174,1044,'Depth-first search',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5175,1044,'Kruskal''s algorithm',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5176,1044,'Topological sort',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1045,id,'What does this detect?','let slow = head, fast = head;
while (fast && fast.next) {
  slow = slow.next;
  fast = fast.next.next;
  if (slow === fast) return true;
}
return false;','Floyd''s tortoise and hare: if a cycle exists the fast pointer laps the slow one and they meet. It uses O(1) extra space.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5177,1045,'A duplicate value',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5178,1045,'A cycle in a linked list',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5179,1045,'The middle node',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5180,1045,'A sorted list',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1046,id,'What is the complexity of merge sort?','','The recursion splits the input log n times and each level merges all n elements. The merge step needs an auxiliary buffer, so space is linear.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5181,1046,'O(n) time, O(n) space',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5182,1046,'O(n log n) time, O(1) space',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5183,1046,'O(n log n) time, O(n) space',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5184,1046,'O(n²) time, O(1) space',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1047,id,'Why is this sum O(n²)?','let total = 0;
for (const row of rows) {
  total += rows.indexOf(row);
}','indexOf performs a linear scan inside a linear loop, multiplying the work. Use entries() to get the index directly in constant time.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5185,1047,'Addition is quadratic',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5186,1047,'for..of copies the array each pass',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5187,1047,'rows is re-sorted implicitly',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5188,1047,'indexOf scans the array on every iteration',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1048,id,'Which structure suits a sliding-window maximum?','','A deque holding indices in decreasing value order lets you drop dominated elements and read the window maximum from the front in amortised O(1) per step.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5189,1048,'A monotonic deque',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5190,1048,'A min-heap of all elements',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5191,1048,'A hash set',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5192,1048,'A singly linked list',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1049,id,'Why does this memoised Fibonacci still recompute?','const memo = {};
function fib(n) {
  if (memo[n]) return memo[n];
  return memo[n] = n < 2 ? n : fib(n - 1) + fib(n - 2);
}','memo[0] is 0, and the truthiness check treats it as a miss. Test with n in memo — or memo[n] !== undefined — so stored falsy results count as hits.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5193,1049,'Assignment inside return is ignored',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5194,1049,'fib(0) stores 0, which is falsy, so it is recomputed every time',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5195,1049,'Objects cannot hold numeric keys',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5196,1049,'The base case is wrong',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1050,id,'What is the complexity of this nested loop?','for (let i = 0; i < n; i++)
  for (let j = i; j < n; j++)
    work();','The inner loop runs n, n-1, … 1 times, summing to n(n+1)/2. Constant factors drop out of big-O, leaving O(n²).','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5197,1050,'O(n log n)',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5198,1050,'O(2ⁿ)',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5199,1050,'O(n²) — roughly n²/2 iterations',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5200,1050,'O(n) — j starts at i',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1051,id,'Which invariant makes a min-heap''s extract-min O(log n)?','','The heap property is local, not global. After moving the last element to the root, sift-down restores it along a single path of height log n.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5201,1051,'The array is fully sorted',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5202,1051,'Every level is a sorted list',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5203,1051,'Nodes store pointers to the minimum',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5204,1051,'Each node is no greater than its children, so only one root-to-leaf path is repaired',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1052,id,'Why can this graph DFS revisit nodes forever?','function dfs(node) {
  visit(node);
  for (const next of node.edges) dfs(next);
}','Without a visited set, any cycle sends the recursion around the loop forever until the stack overflows. Mark each node on entry and skip already-marked neighbours.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5205,1052,'It never marks nodes as seen, so cycles recurse endlessly',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5206,1052,'It should use a queue',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5207,1052,'visit must return a boolean',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5208,1052,'node.edges is always empty',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1053,id,'What does this dynamic programming recurrence solve?','dp[i][w] = max(dp[i-1][w], dp[i-1][w - wt[i]] + val[i]);','Each item is either skipped or taken once, and the table is indexed by item count and remaining capacity — the standard 0/1 knapsack recurrence.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5209,1053,'Shortest path',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5210,1053,'0/1 knapsack',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5211,1053,'Longest common subsequence',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5212,1053,'Edit distance',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1054,id,'Why is quicksort O(n²) in the worst case?','','On already-sorted input with a naive first-element pivot, each partition removes only one element, producing n levels of O(n) work. Randomised or median-of-three pivots make that case vanishingly unlikely.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5213,1054,'It uses O(n) extra memory',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5214,1054,'Recursion always costs n²',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5215,1054,'A pivot that always splits off one element gives n levels of partitioning',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5216,1054,'Partitioning is quadratic',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1055,id,'Which line does a stack trace name first?','','Traces are printed innermost-first: the throwing frame appears at the top, with its callers below. Read downward to find the call path that reached it.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5217,1055,'The program entry point',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5218,1055,'The last line of the file',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5219,1055,'The line that caught the error',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5220,1055,'The innermost frame where the error was thrown',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1056,id,'What causes this error?','const user = undefined;
console.log(user.name);','Property access on undefined or null throws a TypeError. Guard with user?.name or check the value before use.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5221,1056,'Reading a property of undefined',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5222,1056,'A missing import',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5223,1056,'A syntax error',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5224,1056,'A network failure',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1057,id,'What does a 404 response mean?','','404 means the route or resource does not exist. 500 signals a server crash, 401/403 cover authentication and permission, and 400 covers a malformed request.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5225,1057,'The request body was malformed',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5226,1057,'The server has no resource at that path',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5227,1057,'The server crashed',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5228,1057,'The request lacked credentials',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1058,id,'Which is the fastest first step when a test starts failing?','','The failure message names the expected and actual values, which usually localises the fault immediately. Changing code before reading it is guesswork.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5229,1058,'Delete the test',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5230,1058,'Upgrade every dependency',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5231,1058,'Read the assertion message and the diff it prints',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5232,1058,'Rewrite the test',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1059,id,'What is an off-by-one error?','','Off-by-one errors come from confusing < with <=, or 0-based with 1-based indices, and typically surface as a missing last element or an out-of-range access.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5233,1059,'A typo in a variable name',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5234,1059,'A missing semicolon',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5235,1059,'An unhandled promise rejection',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5236,1059,'A loop bound that runs one iteration too many or too few',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1060,id,'Why reproduce a bug before fixing it?','','Without a repro you cannot tell a real fix from a coincidence. The repro usually becomes the regression test that keeps the bug from returning.','easy','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5237,1060,'A reliable repro proves the fix works and guards against regressions',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5238,1060,'It is required by the compiler',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5239,1060,'It makes the stack trace shorter',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5240,1060,'It speeds up the test suite',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1061,id,'What does this error usually indicate?','TypeError: Cannot read properties of undefined (reading ''map'')','The value is undefined rather than an array, so the data never arrived. Check that the fetch was awaited, that the response shape matches, and render a fallback while loading.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5241,1061,'A circular import',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5242,1061,'The expected array was never assigned — often an unawaited or failed fetch',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5243,1061,'map is deprecated',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5244,1061,'The array is empty',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1062,id,'Which bug does this code hide?','try {
  save(record);
} catch (e) {}','An empty catch discards the cause and lets the program continue in a broken state. Log the error with context, or rethrow after handling what you can.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5245,1062,'catch must rethrow to compile',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5246,1062,'save is called twice',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5247,1062,'Swallowing the error leaves failures silent and undiagnosable',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5248,1062,'try blocks are slow',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1063,id,'What is the likely cause of a 500 that only appears in production?','','Missing secrets, unmigrated databases, and different data shapes are the usual suspects. Compare environment variables and migration state before rereading application code.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5249,1063,'A typo in the HTML',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5250,1063,'A slow user connection',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5251,1063,'Browser caching',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5252,1063,'Environment-specific configuration or data the local setup does not have',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1064,id,'Why is this log unhelpful?','console.log(''here'');','A marker with no variables tells you only that a line ran. Log the values you are reasoning about, and include the identifier that ties the line to a specific request or record.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5253,1064,'It carries no identity or state, so it cannot narrow the fault',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5254,1064,'console.log is disabled in production',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5255,1064,'It slows the loop',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5256,1064,'It should be console.error',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1065,id,'What does a race condition look like in tests?','','Races produce flaky tests that pass in isolation and fail under load or reordering. Await the real signal instead of sleeping for a fixed delay.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5257,1065,'A linting warning',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5258,1065,'Intermittent failures that depend on timing or ordering',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5259,1065,'A consistent assertion error',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5260,1065,'A compile failure',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1066,id,'Which fix resolves this warning?','Warning: Each child in a list should have a unique "key" prop.','React needs a stable identity per item to match elements across renders. Use the record''s id; array indices break when items are inserted, removed, or reordered.','medium','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5261,1066,'Use index as the key everywhere',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5262,1066,'Disable strict mode',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5263,1066,'Give each rendered item a stable key derived from its identity',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5264,1066,'Wrap the list in a fragment',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1067,id,'How does bisecting find a regression?','','git bisect halves the suspect range with each tested commit, so a thousand commits need about ten checks. A scriptable pass/fail test makes it fully automatic.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5265,1067,'Reverting every commit one at a time',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5266,1067,'Reading the whole diff',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5267,1067,'Rerunning the failing test repeatedly',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5268,1067,'Binary search over commits, testing each midpoint, in log n steps',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1068,id,'What is the real fault here?','const rows = await db.query(sql);
return rows.map(r => r.total.toFixed(2));','The query succeeds, so the crash comes from the data: a NULL total arrives as null and has no toFixed. Coerce with Number(r.total ?? 0) or exclude nulls in the query.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5269,1068,'A nullable column makes r.total null, throwing on toFixed',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5270,1068,'map cannot be used on query results',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5271,1068,'await is misplaced',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5272,1068,'toFixed needs a radix',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1069,id,'Why does this memory grow without bound?','window.addEventListener(''resize'', onResize);
// component unmounts','An un-removed listener holds a reference to the handler and everything its closure captures, so each mount leaks another copy. Remove it in the effect cleanup.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5273,1069,'Listeners are never garbage collected in any case',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5274,1069,'The listener keeps the handler and its closure alive after unmount',1,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5275,1069,'resize events are buffered by the browser',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5276,1069,'onResize allocates a new DOM node',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1070,id,'What does a heisenbug describe?','','Adding logs or a debugger changes timing, optimisation, or memory layout, so the symptom moves or disappears. Races and uninitialised memory are common causes; prefer non-intrusive tracing.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5277,1070,'A bug caused by a typo',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5278,1070,'A bug in a third-party library',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5279,1070,'A defect whose behaviour changes when you observe or instrument it',1,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5280,1070,'A bug only reproducible in production',0,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1071,id,'Which invariant is violated?','async function transfer(a, b, amount) {
  await debit(a, amount);
  await credit(b, amount);
}','The two writes are not in one transaction, so a failure after the debit leaves the system inconsistent. Wrap both in a transaction, or make the operation idempotent and retryable.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5281,1071,'Ordering — credit must come first',0,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5282,1071,'Typing — amount should be a string',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5283,1071,'Idempotency of debit alone',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5284,1071,'Atomicity — a crash between the calls loses the money',1,3);
--> statement-breakpoint
INSERT OR IGNORE INTO questions (id,topic_id,prompt,code,explanation,difficulty,status,created_at,updated_at) SELECT 1072,id,'Why can this cache serve stale data forever?','const cached = await kv.get(key);
if (cached) return cached;
const fresh = await load();
await kv.put(key, fresh);
return fresh;','Nothing invalidates the entry, so the first value is returned indefinitely. Set a TTL, or delete the key when the underlying record is written.','hard','published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='debugging';
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5285,1072,'No expiry is set, so the entry never refreshes',1,0);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5286,1072,'kv.get is asynchronous',0,1);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5287,1072,'load is called twice',0,2);
--> statement-breakpoint
INSERT OR IGNORE INTO question_options (id,question_id,label,is_correct,position) VALUES (5288,1072,'put overwrites the whole namespace',0,3);
