-- Second content wave: cybersecurity, SQL and web fields, plus the long
-- audit modules used by the solo "read the whole file" challenges.
INSERT OR IGNORE INTO topics (slug,name,description) VALUES ('cybersecurity','Cybersecurity','Injection, authentication, secrets, and the defaults that leak.');
--> statement-breakpoint
INSERT OR IGNORE INTO topics (slug,name,description) VALUES ('sql','SQL & Databases','Queries that lie, migrations that bite, and indexes that never get used.');
--> statement-breakpoint
INSERT OR IGNORE INTO topics (slug,name,description) VALUES ('web','Web & Browser','The DOM, storage, requests, and everything the browser does behind your back.');
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3001,'sec-sql-injection',id,'bug','The login query trusts input','easy','javascript','A penetration test signed in as any account without knowing a password.','async function findUser(db, username) {
  const sql = "SELECT * FROM users WHERE username = ''" + username + "''";
  return db.query(sql);
}',2,'','','','[{"label":"const sql = \"SELECT * FROM users WHERE username = ?\";\n  return db.query(sql, [username]);","correct":true},{"label":"const sql = \"SELECT * FROM users WHERE username = ''\" + escape(username) + \"''\";","correct":false},{"label":"const sql = `SELECT * FROM users WHERE username = ''${username}''`;","correct":false}]','[]','Concatenating input into SQL lets a value like `'' OR ''1''=''1` change the statement. A parameterised query sends the value separately, so it can never be parsed as SQL.','',25,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='cybersecurity';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3002,'sec-xss-innerhtml',id,'bug','A comment ran as script','easy','javascript','Posting a comment containing markup executed it for every later reader.','function renderComment(node, comment) {
  node.innerHTML = "<p>" + comment.body + "</p>";
  node.dataset.author = comment.author;
}',2,'','','','[{"label":"node.textContent = comment.body;","correct":true},{"label":"node.innerHTML = \"<p>\" + escape(comment.body) + \"</p>\";","correct":false},{"label":"node.insertAdjacentHTML(\"beforeend\", comment.body);","correct":false}]','[]','innerHTML parses the string as markup, so an <img onerror> in a comment runs. textContent writes the value as text; when real markup is required, sanitise with a vetted library first.','',25,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='cybersecurity';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3003,'sec-md5-password',id,'bug','Passwords hashed for speed','easy','javascript','A leaked database was cracked almost instantly.','function storePassword(user, password) {
  user.hash = crypto.createHash("md5").update(password).digest("hex");
  return user;
}',2,'','','','[{"label":"user.hash = await argon2.hash(password);","correct":true},{"label":"user.hash = crypto.createHash(\"sha256\").update(password).digest(\"hex\");","correct":false},{"label":"user.hash = crypto.createHash(\"md5\").update(password + user.id).digest(\"hex\");","correct":false}]','[]','MD5 — and plain SHA-256 — are fast, which is exactly wrong for passwords: a GPU tries billions per second. Use a slow, salted KDF such as Argon2, scrypt or bcrypt.','',25,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='cybersecurity';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3004,'sec-timing-compare',id,'bug','The API key check leaks itself','medium','javascript','An attacker recovered a valid key by measuring response times.','function keyMatches(provided, expected) {
  return provided === expected;
}',2,'','','','[{"label":"return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));","correct":true},{"label":"return provided.localeCompare(expected) === 0;","correct":false},{"label":"return provided.trim() === expected.trim();","correct":false}]','[]','String comparison returns as soon as two characters differ, so the time taken reveals how many leading characters were right. A constant-time comparison always reads every byte.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='cybersecurity';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3005,'sec-idor',id,'bug','Any invoice, any account','medium','javascript','Changing the id in the URL returned another customer''s invoice.','async function getInvoice(request, db) {
  const id = request.params.id;
  const invoice = await db.invoices.findById(id);
  return invoice;
}',3,'','','','[{"label":"const invoice = await db.invoices.findOne({ id, accountId: request.user.accountId });","correct":true},{"label":"const invoice = await db.invoices.findById(Number(id));","correct":false},{"label":"const invoice = await db.invoices.findById(encodeURIComponent(id));","correct":false}]','[]','Authentication is not authorisation. The lookup has to be scoped to the caller''s account, otherwise any authenticated user can read any record by id.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='cybersecurity';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3006,'sec-jwt-decode',id,'bug','A forged token walked in','medium','javascript','Tokens signed with the wrong key were accepted as valid.','function currentUser(token, secret) {
  const payload = jwt.decode(token);
  if (!payload || payload.exp * 1000 < Date.now()) return null;
  return payload.sub;
}',2,'','','','[{"label":"const payload = jwt.verify(token, secret, { algorithms: [\"HS256\"] });","correct":true},{"label":"const payload = jwt.decode(token, { complete: true }).payload;","correct":false},{"label":"const payload = JSON.parse(atob(token.split(\".\")[1]));","correct":false}]','[]','decode only base64-decodes the payload — it checks no signature at all, so anyone can mint a token. verify checks the signature, and pinning the algorithm blocks the "alg: none" trick.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='cybersecurity';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3007,'sec-cors-credentials',id,'bug','Every origin can read the session','hard','javascript','A third-party page read authenticated API responses from a logged-in browser.','app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});',2,'','','','[{"label":"res.setHeader(\"Access-Control-Allow-Origin\", allowList.has(req.headers.origin) ? req.headers.origin : \"\");","correct":true},{"label":"res.setHeader(\"Access-Control-Allow-Origin\", req.headers.origin || \"*\");","correct":false},{"label":"res.setHeader(\"Access-Control-Allow-Origin\", \"*.example.com\");","correct":false}]','[]','A wildcard origin combined with credentials tells the browser any site may make credentialed requests and read the reply. Echo only origins from an allow-list — and never reflect the Origin header unchecked.','',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='cybersecurity';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3008,'sec-path-traversal',id,'bug','Downloads escaped the folder','hard','javascript','A crafted filename returned files from outside the uploads directory.','function readUpload(name) {
  const target = path.join(UPLOAD_DIR, name);
  return fs.readFileSync(target);
}',2,'','','','[{"label":"const target = path.join(UPLOAD_DIR, path.basename(name));","correct":true},{"label":"const target = path.join(UPLOAD_DIR, name.replace(\"..\", \"\"));","correct":false},{"label":"const target = UPLOAD_DIR + \"/\" + encodeURIComponent(name);","correct":false}]','[]','path.join resolves ../ segments, so "../../etc/passwd" leaves the upload directory. Strip the path with basename — and then verify the resolved path still starts with the upload directory.','',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='cybersecurity';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3009,'sec-secret-logging',id,'bug','The token went to the log','medium','javascript','Support logs contained working session tokens.','function logRequest(request) {
  logger.info("request", { path: request.path, headers: request.headers });
  return request;
}',2,'','','','[{"label":"logger.info(\"request\", { path: request.path, headers: redact(request.headers, [\"authorization\", \"cookie\"]) });","correct":true},{"label":"logger.debug(\"request\", { path: request.path, headers: request.headers });","correct":false},{"label":"logger.info(\"request\", { path: request.path, headers: JSON.stringify(request.headers) });","correct":false}]','[]','Headers carry Authorization and Cookie. Anyone with log access then has live credentials — redact sensitive keys before they are written, and lowering the log level does not help.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='cybersecurity';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3010,'sec-constant-time',id,'write','Constant-time compare','medium','javascript','Return true when both strings match. Compare every character regardless of where they differ, so the timing does not reveal the matching prefix.','function safeEqual(left, right) {
  // your code here
}',NULL,'','','','[]','[{"name":"equal strings match","call":"safeEqual(\"abc123\", \"abc123\")","expect":true},{"name":"different strings do not","call":"safeEqual(\"abc123\", \"abc124\")","expect":false},{"name":"different lengths do not","call":"safeEqual(\"abc\", \"abcd\")","expect":false},{"name":"empty strings match","call":"safeEqual(\"\", \"\")","expect":true}]','XOR each pair of char codes into an accumulator and compare the accumulator to 0 at the end: the loop runs the same way whatever the input.','',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='cybersecurity';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3011,'sec-sanitize-filename',id,'write','Safe filename','easy','javascript','Return a filename safe to store: keep letters, digits, dot, dash and underscore, drop every path separator and traversal segment, and never return an empty string (use "file").','function safeName(name) {
  // your code here
}',NULL,'','','','[]','[{"name":"keeps a normal name","call":"safeName(\"report_2026.pdf\")","expect":"report_2026.pdf"},{"name":"strips traversal","call":"safeName(\"../../etc/passwd\")","expect":"etcpasswd"},{"name":"strips separators","call":"safeName(\"a/b\\\\c.txt\")","expect":"abc.txt"},{"name":"falls back when empty","call":"safeName(\"///\")","expect":"file"}]','Remove every ".." segment, then strip anything outside [A-Za-z0-9._-], and fall back to "file" when nothing survives.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='cybersecurity';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3012,'sql-update-no-where',id,'bug','One row was meant, every row changed','easy','sql','Marking one order as shipped marked the whole table.','UPDATE orders
SET status = ''shipped'',
    shipped_at = CURRENT_TIMESTAMP;',3,'','','','[{"label":"    shipped_at = CURRENT_TIMESTAMP\nWHERE id = :order_id;","correct":true},{"label":"    shipped_at = CURRENT_TIMESTAMP LIMIT 1;","correct":false},{"label":"    shipped_at = CURRENT_TIMESTAMP\nHAVING id = :order_id;","correct":false}]','[]','An UPDATE with no WHERE touches every row. A WHERE on the primary key scopes it — and running it inside a transaction lets you check the affected count before committing.','',25,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='sql';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3013,'sql-left-join-filter',id,'bug','The LEFT JOIN became an INNER JOIN','medium','sql','Customers with no orders vanished from the report.','SELECT c.id, c.name, COUNT(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.created_at > :since
GROUP BY c.id, c.name;',4,'','','','[{"label":"LEFT JOIN orders o ON o.customer_id = c.id AND o.created_at > :since","correct":true},{"label":"WHERE o.created_at > :since OR o.id IS NULL","correct":false},{"label":"RIGHT JOIN orders o ON o.customer_id = c.id","correct":false}]','[]','A WHERE on the right-hand table filters out the NULL rows the LEFT JOIN produced, silently turning it into an inner join. Put the condition in the ON clause instead.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='sql';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3014,'sql-count-distinct',id,'bug','The totals doubled','medium','sql','Every customer that ordered twice was counted twice.','SELECT r.name, COUNT(c.id) AS customers
FROM regions r
JOIN customers c ON c.region_id = r.id
JOIN orders o ON o.customer_id = c.id
GROUP BY r.name;',1,'','','','[{"label":"SELECT r.name, COUNT(DISTINCT c.id) AS customers","correct":true},{"label":"SELECT r.name, SUM(c.id) AS customers","correct":false},{"label":"SELECT r.name, COUNT(o.id) AS customers","correct":false}]','[]','The join to orders multiplies each customer row by their order count, so COUNT counts duplicates. COUNT(DISTINCT c.id) counts each customer once.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='sql';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3015,'sql-index-unused',id,'bug','The index is never used','hard','sql','A query on an indexed column still scans the whole table.','SELECT id, email
FROM users
WHERE LOWER(email) = :email
ORDER BY created_at DESC
LIMIT 50;',3,'','','','[{"label":"WHERE email = :email  -- with a LOWER(email) expression index, or store the address folded","correct":true},{"label":"WHERE email LIKE ''%'' || :email || ''%''","correct":false},{"label":"WHERE CAST(email AS TEXT) = :email","correct":false}]','[]','Wrapping the column in a function makes the stored index unusable, because the index holds email, not LOWER(email). Compare the bare column, or create an index on the expression.','',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='sql';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3016,'web-token-localstorage',id,'bug','Any script can take the session','medium','javascript','One compromised dependency exfiltrated every logged-in session.','function saveSession(token) {
  localStorage.setItem("session", token);
  document.body.dataset.signedIn = "true";
}',2,'','','','[{"label":"// keep the token in an http-only cookie set by the server, not in JS-readable storage","correct":true},{"label":"sessionStorage.setItem(\"session\", token);","correct":false},{"label":"localStorage.setItem(\"session\", btoa(token));","correct":false}]','[]','Anything in localStorage is readable by every script on the page, so one bad dependency takes every session. An http-only cookie is not reachable from JavaScript at all.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='web';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3017,'web-fetch-no-check',id,'bug','A 500 was treated as data','easy','javascript','An error page ended up rendered as an empty list.','async function loadUsers() {
  const response = await fetch("/api/users");
  return response.json();
}',3,'','','','[{"label":"if (!response.ok) throw new Error(`Request failed: ${response.status}`);\n  return response.json();","correct":true},{"label":"return response.json().catch(() => []);","correct":false},{"label":"return response.text();","correct":false}]','[]','fetch only rejects on a network failure — a 404 or 500 still resolves. Check response.ok before reading the body.','',25,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='web';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3018,'web-state-mutation',id,'bug','The list never re-rendered','medium','javascript','Adding an item updated the data but not the screen.','function addTag(setTags, tags, tag) {
  tags.push(tag);
  setTags(tags);
}',2,'','','','[{"label":"setTags([...tags, tag]);","correct":true},{"label":"setTags(tags.concat(tag).slice());","correct":false},{"label":"setTags(Object.assign([], tags));","correct":false}]','[]','Mutating the existing array keeps the same reference, so the state comparison sees no change and skips the render. Pass a new array instead.','',35,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='web';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3019,'web-debounce-leak',id,'bug','Every keystroke queued a request','hard','javascript','The search endpoint received one request per character typed.','function useSearch(term) {
  useEffect(() => {
    const timer = setTimeout(() => search(term), 300);
  }, [term]);
}',4,'','','','[{"label":"return () => clearTimeout(timer);","correct":true},{"label":"clearTimeout(timer);","correct":false},{"label":"return () => search(term);","correct":false}]','[]','Without a cleanup the previous timer still fires, so debouncing never happens. Returning a cleanup that clears the timer cancels the pending call whenever the term changes.','',45,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='web';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3020,'audit-checkout-weight',id,'audit','Checkout service: the shipping tier is wrong','medium','javascript','A 310-line pricing module. Multi-item orders are being charged the wrong shipping rate. Read the pipeline, find the line that miscalculates, and choose the fix.','// checkout-service.js
// Pricing, discounts, tax and totals for the storefront checkout.
// Every amount in this module is an integer number of cents.

const TAX_RULES = {
  "GB": { rate: 0.2, compound: false, label: "VAT" },
  "DE": { rate: 0.19, compound: false, label: "MwSt" },
  "FR": { rate: 0.2, compound: false, label: "TVA" },
  "US-CA": { rate: 0.0725, compound: false, label: "Sales tax" },
  "US-NY": { rate: 0.08875, compound: false, label: "Sales tax" },
  "CA-QC": { rate: 0.09975, compound: true, label: "QST" },
};

const SHIPPING_TIERS = [
  { maxWeightGrams: 500, standard: 399, express: 899 },
  { maxWeightGrams: 2000, standard: 599, express: 1299 },
  { maxWeightGrams: 10000, standard: 999, express: 2499 },
  { maxWeightGrams: Infinity, standard: 1999, express: 4999 },
];

const LOYALTY_TIERS = [
  { name: "bronze", minPoints: 0, discountBasisPoints: 0 },
  { name: "silver", minPoints: 500, discountBasisPoints: 250 },
  { name: "gold", minPoints: 2000, discountBasisPoints: 500 },
  { name: "platinum", minPoints: 10000, discountBasisPoints: 800 },
];

const FREE_SHIPPING_THRESHOLD = 7500;
const MAX_COUPON_STACK = 2;

class CheckoutError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "CheckoutError";
    this.code = code;
  }
}

function assertPositiveInteger(value, field) {
  if (!Number.isInteger(value) || value < 0) {
    throw new CheckoutError("invalid_field", `${field} must be a non-negative integer`);
  }
  return value;
}

function roundCents(value) {
  // Bankers'' rounding keeps long invoices from drifting upward.
  const floor = Math.floor(value);
  const remainder = value - floor;
  if (Math.abs(remainder - 0.5) > Number.EPSILON) return Math.round(value);
  return floor % 2 === 0 ? floor : floor + 1;
}

function normaliseLine(line) {
  if (!line || typeof line !== "object") {
    throw new CheckoutError("invalid_line", "Each cart line must be an object");
  }
  return {
    sku: String(line.sku || "").trim(),
    title: String(line.title || "Untitled item"),
    unitPrice: assertPositiveInteger(line.unitPrice, "unitPrice"),
    quantity: assertPositiveInteger(line.quantity, "quantity"),
    weightGrams: assertPositiveInteger(line.weightGrams || 0, "weightGrams"),
    taxExempt: Boolean(line.taxExempt),
    giftCard: Boolean(line.giftCard),
    categories: Array.isArray(line.categories) ? line.categories.slice() : [],
  };
}

function normaliseCart(cart) {
  if (!cart || !Array.isArray(cart.lines)) {
    throw new CheckoutError("invalid_cart", "A cart needs a lines array");
  }
  const lines = cart.lines.map(normaliseLine).filter(line => line.quantity > 0);
  if (lines.length === 0) {
    throw new CheckoutError("empty_cart", "The cart has no purchasable lines");
  }
  return {
    lines,
    region: String(cart.region || "GB"),
    currency: String(cart.currency || "GBP"),
    customer: cart.customer || {},
    coupons: Array.isArray(cart.coupons) ? cart.coupons.slice(0, MAX_COUPON_STACK) : [],
    shippingSpeed: cart.shippingSpeed === "express" ? "express" : "standard",
  };
}

function lineSubtotal(line) {
  return line.unitPrice * line.quantity;
}

function cartSubtotal(lines) {
  let total = 0;
  for (const line of lines) {
    total += lineSubtotal(line);
  }
  return total;
}

function cartWeight(lines) {
  return lines.reduce((total, line) => total + line.weightGrams, 0);
}

function loyaltyTierFor(points) {
  const safePoints = Number.isFinite(points) ? points : 0;
  let matched = LOYALTY_TIERS[0];
  for (const tier of LOYALTY_TIERS) {
    if (safePoints >= tier.minPoints) matched = tier;
  }
  return matched;
}

function loyaltyDiscount(subtotal, customer) {
  const tier = loyaltyTierFor(customer.loyaltyPoints);
  if (tier.discountBasisPoints === 0) return { amount: 0, tier: tier.name };
  const amount = roundCents((subtotal * tier.discountBasisPoints) / 10000);
  return { amount, tier: tier.name };
}

function couponValue(coupon, subtotal, lines) {
  if (!coupon || typeof coupon !== "object") return 0;
  if (coupon.type === "percent") {
    const basisPoints = Math.min(5000, Math.max(0, Number(coupon.basisPoints) || 0));
    return roundCents((subtotal * basisPoints) / 10000);
  }
  if (coupon.type === "fixed") {
    return Math.min(subtotal, Math.max(0, Number(coupon.amount) || 0));
  }
  if (coupon.type === "category") {
    const eligible = lines.filter(line => line.categories.includes(coupon.category));
    const eligibleTotal = cartSubtotal(eligible);
    const basisPoints = Math.min(5000, Math.max(0, Number(coupon.basisPoints) || 0));
    return roundCents((eligibleTotal * basisPoints) / 10000);
  }
  return 0;
}

function applyCoupons(coupons, subtotal, lines) {
  const applied = [];
  let remaining = subtotal;
  for (const coupon of coupons) {
    const value = couponValue(coupon, remaining, lines);
    if (value <= 0) continue;
    const capped = Math.min(value, remaining);
    remaining -= capped;
    applied.push({ code: coupon.code || "COUPON", amount: capped });
  }
  return { applied, total: subtotal - remaining };
}

function shippingTierFor(weightGrams) {
  for (const tier of SHIPPING_TIERS) {
    if (weightGrams <= tier.maxWeightGrams) return tier;
  }
  return SHIPPING_TIERS[SHIPPING_TIERS.length - 1];
}

function shippingCost(cart, discountedSubtotal) {
  const weight = cartWeight(cart.lines);
  const tier = shippingTierFor(weight);
  const base = cart.shippingSpeed === "express" ? tier.express : tier.standard;
  const everythingIsDigital = cart.lines.every(line => line.weightGrams === 0);
  if (everythingIsDigital) return 0;
  if (cart.shippingSpeed === "standard" && discountedSubtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return base;
}

function taxableBase(lines, discountTotal, subtotal) {
  // Discounts reduce the taxable amount proportionally across taxable lines.
  const taxableSubtotal = lines
    .filter(line => !line.taxExempt && !line.giftCard)
    .reduce((total, line) => total + lineSubtotal(line), 0);
  if (subtotal === 0) return 0;
  const share = taxableSubtotal / subtotal;
  return Math.max(0, roundCents(taxableSubtotal - discountTotal * share));
}

function taxFor(region, base) {
  const rule = TAX_RULES[region];
  if (!rule) return { amount: 0, label: "Tax", rate: 0 };
  const amount = roundCents(base * rule.rate);
  return { amount, label: rule.label, rate: rule.rate };
}

function giftCardTotal(lines) {
  return lines.filter(line => line.giftCard).reduce((total, line) => total + lineSubtotal(line), 0);
}

function creditsApplied(customer, amountDue) {
  const balance = Math.max(0, Number(customer.storeCredit) || 0);
  const used = Math.min(balance, amountDue);
  return { used, remainingBalance: balance - used };
}

function summariseLines(lines) {
  return lines.map(line => ({
    sku: line.sku,
    title: line.title,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    subtotal: lineSubtotal(line),
  }));
}

function priceCart(rawCart) {
  const cart = normaliseCart(rawCart);
  const subtotal = cartSubtotal(cart.lines);

  const loyalty = loyaltyDiscount(subtotal, cart.customer);
  const coupons = applyCoupons(cart.coupons, subtotal - loyalty.amount, cart.lines);
  const discountTotal = loyalty.amount + coupons.total;
  const discountedSubtotal = Math.max(0, subtotal - discountTotal);

  const shipping = shippingCost(cart, discountedSubtotal);
  const base = taxableBase(cart.lines, discountTotal, subtotal);
  const tax = taxFor(cart.region, base);

  const amountBeforeCredit = discountedSubtotal + shipping + tax.amount;
  const credit = creditsApplied(cart.customer, amountBeforeCredit);
  const total = amountBeforeCredit - credit.used;

  return {
    currency: cart.currency,
    lines: summariseLines(cart.lines),
    subtotal,
    discounts: {
      loyalty: { amount: loyalty.amount, tier: loyalty.tier },
      coupons: coupons.applied,
      total: discountTotal,
    },
    shipping: { amount: shipping, speed: cart.shippingSpeed },
    tax: { amount: tax.amount, label: tax.label, rate: tax.rate, base },
    giftCards: giftCardTotal(cart.lines),
    storeCredit: { used: credit.used, remaining: credit.remainingBalance },
    total,
  };
}

function validateQuote(quote) {
  const problems = [];
  if (quote.total < 0) problems.push("total is negative");
  if (quote.discounts.total > quote.subtotal) problems.push("discounts exceed the subtotal");
  if (quote.tax.amount > quote.subtotal) problems.push("tax exceeds the subtotal");
  if (quote.storeCredit.used > quote.subtotal + quote.shipping.amount + quote.tax.amount) {
    problems.push("store credit exceeds the amount due");
  }
  return problems;
}

function quoteForDisplay(quote, formatter) {
  const format = typeof formatter === "function" ? formatter : value => (value / 100).toFixed(2);
  return {
    subtotal: format(quote.subtotal),
    discounts: format(quote.discounts.total),
    shipping: format(quote.shipping.amount),
    tax: format(quote.tax.amount),
    total: format(quote.total),
  };
}

function compareQuotes(left, right) {
  const fields = ["subtotal", "total"];
  const differences = {};
  for (const field of fields) {
    if (left[field] !== right[field]) {
      differences[field] = { left: left[field], right: right[field] };
    }
  }
  if (left.tax.amount !== right.tax.amount) {
    differences.tax = { left: left.tax.amount, right: right.tax.amount };
  }
  return differences;
}

function auditTrail(quote) {
  const entries = [];
  entries.push({ step: "subtotal", amount: quote.subtotal });
  if (quote.discounts.loyalty.amount > 0) {
    entries.push({ step: `loyalty:${quote.discounts.loyalty.tier}`, amount: -quote.discounts.loyalty.amount });
  }
  for (const coupon of quote.discounts.coupons) {
    entries.push({ step: `coupon:${coupon.code}`, amount: -coupon.amount });
  }
  if (quote.shipping.amount > 0) {
    entries.push({ step: `shipping:${quote.shipping.speed}`, amount: quote.shipping.amount });
  }
  if (quote.tax.amount > 0) {
    entries.push({ step: `tax:${quote.tax.label}`, amount: quote.tax.amount });
  }
  if (quote.storeCredit.used > 0) {
    entries.push({ step: "store-credit", amount: -quote.storeCredit.used });
  }
  entries.push({ step: "total", amount: quote.total });
  return entries;
}

function reconcile(quote) {
  const trail = auditTrail(quote);
  const computed = trail
    .filter(entry => entry.step !== "subtotal" && entry.step !== "total")
    .reduce((running, entry) => running + entry.amount, quote.subtotal);
  return { computed, reported: quote.total, balanced: computed === quote.total };
}

module.exports = {
  CheckoutError,
  priceCart,
  validateQuote,
  quoteForDisplay,
  compareQuotes,
  auditTrail,
  reconcile,
  loyaltyTierFor,
  shippingTierFor,
  roundCents,
};
',101,'Shipping picks a tier from the cart weight. Follow how that weight is produced.','An order of six 900g items ships at the lightest parcel rate. Single-item orders are always correct.','Pricing helpers, roughly lines 85–160','[{"label":"return lines.reduce((total, line) => total + line.weightGrams * line.quantity, 0);","correct":true},{"label":"return lines.reduce((total, line) => total + line.quantity, 0);","correct":false},{"label":"return lines.map(line => line.weightGrams).reduce((a, b) => Math.max(a, b), 0);","correct":false}]','[]','Cart weight ignored the quantity, so six 900g items counted as 900g and fell into the lightest shipping tier. Weight has to be multiplied by the line quantity, exactly as the line subtotal multiplies the unit price.','',70,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='javascript';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3021,'audit-session-token-entropy',id,'audit','Session service: tokens are predictable','hard','javascript','A 300-line authentication module. A security review found password-reset links could be predicted after observing a handful of them. Find the line responsible.','// session-service.js
// Account sessions, password resets and login throttling for the API gateway.
// Tokens are opaque strings; nothing here should ever be guessable.

const crypto = require("crypto");

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const RESET_TTL_MS = 1000 * 60 * 30;
const MFA_WINDOW_MS = 1000 * 60 * 5;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 1000 * 60 * 15;
const PBKDF2_ITERATIONS = 210000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = "sha256";

class AuthError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}

function randomToken(bytes = 32) {
  return Array.from({ length: bytes }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString("hex");
  return { salt, hash: derived, iterations: PBKDF2_ITERATIONS };
}

function verifyPassword(password, record) {
  if (!record || !record.salt || !record.hash) return false;
  const derived = crypto
    .pbkdf2Sync(password, record.salt, record.iterations || PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString("hex");
  return timingSafeEqual(derived, record.hash);
}

function normaliseUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function isStrongEnough(password) {
  if (typeof password !== "string") return false;
  if (password.length < 12) return false;
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/];
  return classes.filter(pattern => pattern.test(password)).length >= 3;
}

class MemoryStore {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.resets = new Map();
    this.attempts = new Map();
    this.auditLog = [];
  }

  putUser(user) {
    this.users.set(user.id, user);
    return user;
  }

  userByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return null;
  }

  userById(id) {
    return this.users.get(id) || null;
  }

  putSession(session) {
    this.sessions.set(session.token, session);
    return session;
  }

  session(token) {
    return this.sessions.get(token) || null;
  }

  dropSession(token) {
    return this.sessions.delete(token);
  }

  dropSessionsForUser(userId) {
    let removed = 0;
    for (const [token, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(token);
        removed += 1;
      }
    }
    return removed;
  }

  putReset(reset) {
    this.resets.set(reset.token, reset);
    return reset;
  }

  reset(token) {
    return this.resets.get(token) || null;
  }

  dropReset(token) {
    return this.resets.delete(token);
  }

  record(event) {
    this.auditLog.push({ ...event, at: new Date().toISOString() });
    if (this.auditLog.length > 5000) this.auditLog.shift();
  }
}

function attemptKey(username, ip) {
  return `${username}|${ip || "unknown"}`;
}

function readAttempts(store, key, now) {
  const entry = store.attempts.get(key);
  if (!entry) return { count: 0, firstAt: now, lockedUntil: 0 };
  if (entry.lockedUntil && entry.lockedUntil <= now) {
    store.attempts.delete(key);
    return { count: 0, firstAt: now, lockedUntil: 0 };
  }
  return entry;
}

function registerFailure(store, key, now) {
  const entry = readAttempts(store, key, now);
  entry.count += 1;
  entry.firstAt = entry.firstAt || now;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
  }
  store.attempts.set(key, entry);
  return entry;
}

function clearFailures(store, key) {
  store.attempts.delete(key);
}

function assertNotLocked(store, key, now) {
  const entry = readAttempts(store, key, now);
  if (entry.lockedUntil && entry.lockedUntil > now) {
    const seconds = Math.ceil((entry.lockedUntil - now) / 1000);
    throw new AuthError("locked_out", `Too many attempts. Try again in ${seconds}s.`, 429);
  }
}

function createSession(store, user, context = {}) {
  const now = Date.now();
  const session = {
    token: randomToken(32),
    userId: user.id,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    ip: context.ip || null,
    userAgent: context.userAgent || null,
    mfaSatisfiedAt: context.mfaSatisfiedAt || null,
  };
  store.putSession(session);
  store.record({ type: "session.created", userId: user.id, ip: session.ip });
  return session;
}

function sessionIsFresh(session, now = Date.now()) {
  if (!session) return false;
  if (session.expiresAt <= now) return false;
  return true;
}

function requireSession(store, token, now = Date.now()) {
  const session = store.session(token);
  if (!sessionIsFresh(session, now)) {
    if (session) store.dropSession(session.token);
    throw new AuthError("no_session", "Your session has expired. Sign in again.", 401);
  }
  const user = store.userById(session.userId);
  if (!user || user.disabled) {
    store.dropSession(session.token);
    throw new AuthError("no_user", "This account is no longer active.", 401);
  }
  return { session, user };
}

function mfaRequired(user, session, now = Date.now()) {
  if (!user.mfaEnabled) return false;
  if (!session.mfaSatisfiedAt) return true;
  return now - session.mfaSatisfiedAt > MFA_WINDOW_MS;
}

function register(store, input) {
  const username = normaliseUsername(input.username);
  if (username.length < 3) throw new AuthError("bad_username", "Usernames need at least three characters");
  if (store.userByUsername(username)) throw new AuthError("taken", "That username is taken", 409);
  if (!isStrongEnough(input.password)) {
    throw new AuthError("weak_password", "Use at least 12 characters from three character classes");
  }
  const credentials = hashPassword(input.password);
  const user = store.putUser({
    id: randomToken(16),
    username,
    email: String(input.email || "").trim().toLowerCase(),
    salt: credentials.salt,
    hash: credentials.hash,
    iterations: credentials.iterations,
    mfaEnabled: false,
    disabled: false,
    createdAt: Date.now(),
  });
  store.record({ type: "user.registered", userId: user.id });
  return user;
}

function login(store, input, context = {}) {
  const now = Date.now();
  const username = normaliseUsername(input.username);
  const key = attemptKey(username, context.ip);
  assertNotLocked(store, key, now);

  const user = store.userByUsername(username);
  const ok = user ? verifyPassword(input.password, user) : false;
  if (!ok) {
    registerFailure(store, key, now);
    store.record({ type: "login.failed", username, ip: context.ip || null });
    throw new AuthError("bad_credentials", "That username and password do not match", 401);
  }
  if (user.disabled) throw new AuthError("disabled", "This account is disabled", 403);

  clearFailures(store, key);
  store.record({ type: "login.succeeded", userId: user.id, ip: context.ip || null });
  return createSession(store, user, context);
}

function logout(store, token) {
  const session = store.session(token);
  if (!session) return false;
  store.dropSession(token);
  store.record({ type: "session.revoked", userId: session.userId });
  return true;
}

function beginPasswordReset(store, input) {
  const username = normaliseUsername(input.username);
  const user = store.userByUsername(username);
  // Always answer the same way so the endpoint cannot enumerate accounts.
  if (!user) return { sent: true };
  const reset = store.putReset({
    token: randomToken(32),
    userId: user.id,
    createdAt: Date.now(),
    expiresAt: Date.now() + RESET_TTL_MS,
    usedAt: null,
  });
  store.record({ type: "reset.requested", userId: user.id });
  return { sent: true, token: reset.token };
}

function completePasswordReset(store, input) {
  const now = Date.now();
  const reset = store.reset(String(input.token || ""));
  if (!reset) throw new AuthError("bad_token", "That reset link is not valid", 400);
  if (reset.usedAt) throw new AuthError("used_token", "That reset link has already been used", 400);
  if (reset.expiresAt <= now) {
    store.dropReset(reset.token);
    throw new AuthError("expired_token", "That reset link has expired", 400);
  }
  if (!isStrongEnough(input.password)) {
    throw new AuthError("weak_password", "Use at least 12 characters from three character classes");
  }
  const user = store.userById(reset.userId);
  if (!user) throw new AuthError("no_user", "This account is no longer active", 404);

  const credentials = hashPassword(input.password);
  user.salt = credentials.salt;
  user.hash = credentials.hash;
  user.iterations = credentials.iterations;
  reset.usedAt = now;
  store.putReset(reset);
  store.dropSessionsForUser(user.id);
  store.record({ type: "reset.completed", userId: user.id });
  return { ok: true };
}

function changePassword(store, token, input) {
  const { session, user } = requireSession(store, token);
  if (!verifyPassword(input.currentPassword, user)) {
    throw new AuthError("bad_credentials", "Your current password is wrong", 401);
  }
  if (!isStrongEnough(input.newPassword)) {
    throw new AuthError("weak_password", "Use at least 12 characters from three character classes");
  }
  const credentials = hashPassword(input.newPassword);
  user.salt = credentials.salt;
  user.hash = credentials.hash;
  user.iterations = credentials.iterations;
  store.dropSessionsForUser(user.id);
  store.record({ type: "password.changed", userId: user.id });
  return createSession(store, user, { ip: session.ip, userAgent: session.userAgent });
}

function enableMfa(store, token, verifier) {
  const { user } = requireSession(store, token);
  if (typeof verifier !== "function" || !verifier(user)) {
    throw new AuthError("mfa_setup_failed", "Could not verify the authenticator code", 400);
  }
  user.mfaEnabled = true;
  store.record({ type: "mfa.enabled", userId: user.id });
  return { ok: true };
}

function satisfyMfa(store, token, code, verifier) {
  const { session, user } = requireSession(store, token);
  if (!user.mfaEnabled) return { ok: true };
  if (typeof verifier !== "function" || !verifier(user, code)) {
    throw new AuthError("mfa_failed", "That code is not valid", 401);
  }
  session.mfaSatisfiedAt = Date.now();
  store.putSession(session);
  return { ok: true };
}

function activeSessions(store, userId) {
  const now = Date.now();
  const list = [];
  for (const session of store.sessions.values()) {
    if (session.userId !== userId) continue;
    if (!sessionIsFresh(session, now)) continue;
    list.push({
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      ip: session.ip,
      userAgent: session.userAgent,
    });
  }
  return list.sort((left, right) => right.createdAt - left.createdAt);
}

function purgeExpired(store, now = Date.now()) {
  let removed = 0;
  for (const [token, session] of store.sessions) {
    if (session.expiresAt <= now) {
      store.sessions.delete(token);
      removed += 1;
    }
  }
  for (const [token, reset] of store.resets) {
    if (reset.expiresAt <= now) {
      store.resets.delete(token);
      removed += 1;
    }
  }
  return removed;
}

module.exports = {
  AuthError,
  MemoryStore,
  register,
  login,
  logout,
  requireSession,
  mfaRequired,
  beginPasswordReset,
  completePasswordReset,
  changePassword,
  enableMfa,
  satisfyMfa,
  activeSessions,
  purgeExpired,
  hashPassword,
  verifyPassword,
  isStrongEnough,
};
',26,'Everything that must be unguessable in this file comes from one helper.','Given several tokens issued in the same second, a reviewer could generate the next one and take over an account.','Helpers near the top, and everything that calls them','[{"label":"return crypto.randomBytes(bytes).toString(\"hex\");","correct":true},{"label":"return Date.now().toString(16) + Math.random().toString(16).slice(2);","correct":false},{"label":"return crypto.createHash(\"sha256\").update(String(Math.random())).digest(\"hex\");","correct":false}]','[]','Math.random is a fast PRNG, not a cryptographic one: its internal state can be recovered from a few outputs, and every session token, reset token and user id in this file came from it. crypto.randomBytes draws from the OS CSPRNG. Hashing a weak value does not add entropy — the input is still guessable.','',90,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='cybersecurity';
--> statement-breakpoint
INSERT OR IGNORE INTO code_tasks (id,slug,topic_id,kind,title,difficulty,language,prompt,code,buggy_line,hint,symptom,region,fixes,tests,explanation,solution,xp,status,created_at,updated_at) SELECT 3022,'audit-match-queue-fairness',id,'audit','Match queue: lopsided pairings','hard','javascript','A 280-line matchmaking service. New players are occasionally matched against far stronger opponents when the queue is quiet. One boolean decides it.','// match-queue.js
// Matchmaking for ranked duels: rating buckets, wait-time widening, and the
// tick loop that pairs players and hands rooms to the game servers.

const BUCKET_WIDTH = 100;
const START_RANGE = 75;
const RANGE_GROWTH_PER_SECOND = 12;
const MAX_RANGE = 600;
const MAX_WAIT_MS = 1000 * 120;
const TICK_MS = 500;
const MAX_PARTIES_PER_TICK = 40;
const REGION_PENALTY = 45;

class QueueError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "QueueError";
    this.code = code;
  }
}

function bucketFor(rating) {
  return Math.floor(rating / BUCKET_WIDTH);
}

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

function nowMs() {
  return Date.now();
}

class Party {
  constructor(input) {
    if (!input || !Array.isArray(input.players) || input.players.length === 0) {
      throw new QueueError("empty_party", "A party needs at least one player");
    }
    this.id = input.id || `party-${Math.random().toString(36).slice(2, 10)}`;
    this.players = input.players.map(player => ({
      id: String(player.id),
      rating: Number(player.rating) || 1000,
      region: String(player.region || "eu"),
    }));
    this.region = this.players[0].region;
    this.queuedAt = input.queuedAt || nowMs();
    this.mode = input.mode === "team" ? "team" : "duel";
    this.tags = Array.isArray(input.tags) ? input.tags.slice() : [];
    this.cancelled = false;
  }

  get size() {
    return this.players.length;
  }

  get rating() {
    const total = this.players.reduce((sum, player) => sum + player.rating, 0);
    return Math.round(total / this.players.length);
  }

  waitedMs(now = nowMs()) {
    return Math.max(0, now - this.queuedAt);
  }

  searchRange(now = nowMs()) {
    const seconds = this.waitedMs(now) / 1000;
    return clamp(START_RANGE + seconds * RANGE_GROWTH_PER_SECOND, START_RANGE, MAX_RANGE);
  }

  summary() {
    return {
      id: this.id,
      size: this.size,
      rating: this.rating,
      region: this.region,
      mode: this.mode,
      waitedMs: this.waitedMs(),
    };
  }
}

class MatchQueue {
  constructor(options = {}) {
    this.parties = [];
    this.byId = new Map();
    this.rooms = [];
    this.metrics = { enqueued: 0, matched: 0, expired: 0, ticks: 0 };
    this.onRoom = typeof options.onRoom === "function" ? options.onRoom : () => {};
    this.maxWaitMs = options.maxWaitMs || MAX_WAIT_MS;
  }

  enqueue(input) {
    const party = input instanceof Party ? input : new Party(input);
    if (this.byId.has(party.id)) {
      throw new QueueError("already_queued", `${party.id} is already in the queue`);
    }
    this.parties.push(party);
    this.byId.set(party.id, party);
    this.metrics.enqueued += 1;
    return party;
  }

  cancel(partyId) {
    const party = this.byId.get(partyId);
    if (!party) return false;
    party.cancelled = true;
    this.byId.delete(partyId);
    const index = this.parties.indexOf(party);
    if (index !== -1) this.parties.splice(index, 1);
    return true;
  }

  size() {
    return this.parties.length;
  }

  snapshot() {
    return this.parties.map(party => party.summary());
  }

  bucketIndex() {
    const buckets = new Map();
    for (const party of this.parties) {
      const key = bucketFor(party.rating);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(party);
    }
    return buckets;
  }

  // Two parties are compatible when both search ranges cover the gap between
  // them; a cross-region pairing has to clear an extra penalty.
  compatible(left, right, now = nowMs()) {
    if (left.id === right.id) return false;
    if (left.mode !== right.mode) return false;
    if (left.size !== right.size) return false;
    const gap = Math.abs(left.rating - right.rating);
    const penalty = left.region === right.region ? 0 : REGION_PENALTY;
    const leftRange = left.searchRange(now) - penalty;
    const rightRange = right.searchRange(now) - penalty;
    return gap <= leftRange || gap <= rightRange;
  }

  candidatesFor(party, now = nowMs()) {
    const range = party.searchRange(now);
    const low = bucketFor(party.rating - range);
    const high = bucketFor(party.rating + range);
    const buckets = this.bucketIndex();
    const found = [];
    for (let key = low; key <= high; key += 1) {
      const bucket = buckets.get(key);
      if (!bucket) continue;
      for (const other of bucket) {
        if (this.compatible(party, other, now)) found.push(other);
      }
    }
    return found.sort((left, right) => {
      const leftGap = Math.abs(left.rating - party.rating);
      const rightGap = Math.abs(right.rating - party.rating);
      if (leftGap !== rightGap) return leftGap - rightGap;
      return left.queuedAt - right.queuedAt;
    });
  }

  removeParty(party) {
    this.byId.delete(party.id);
    const index = this.parties.indexOf(party);
    if (index !== -1) this.parties.splice(index, 1);
  }

  buildRoom(left, right, now = nowMs()) {
    const room = {
      id: `room-${Math.random().toString(36).slice(2, 10)}`,
      mode: left.mode,
      createdAt: now,
      region: left.region === right.region ? left.region : "mixed",
      averageRating: Math.round((left.rating + right.rating) / 2),
      ratingGap: Math.abs(left.rating - right.rating),
      sides: [left.summary(), right.summary()],
      players: [...left.players, ...right.players].map(player => player.id),
    };
    this.rooms.push(room);
    this.metrics.matched += 2;
    return room;
  }

  expireStale(now = nowMs()) {
    const expired = [];
    for (let index = this.parties.length - 1; index >= 0; index -= 1) {
      const party = this.parties[index];
      if (party.waitedMs(now) < this.maxWaitMs) continue;
      this.parties.splice(index, 1);
      this.byId.delete(party.id);
      this.metrics.expired += 1;
      expired.push(party);
    }
    return expired;
  }

  // One pass over the queue, oldest first: every party either finds a partner
  // or stays in for the next tick with a wider range.
  tick(now = nowMs()) {
    this.metrics.ticks += 1;
    const created = [];
    const expired = this.expireStale(now);
    const ordered = [...this.parties].sort((left, right) => left.queuedAt - right.queuedAt);

    for (const party of ordered) {
      if (created.length >= MAX_PARTIES_PER_TICK) break;
      if (!this.byId.has(party.id)) continue;
      const candidates = this.candidatesFor(party, now);
      const partner = candidates.find(other => this.byId.has(other.id));
      if (!partner) continue;
      this.removeParty(party);
      this.removeParty(partner);
      const room = this.buildRoom(party, partner, now);
      created.push(room);
      this.onRoom(room);
    }

    return { rooms: created, expired: expired.map(party => party.id) };
  }

  waitingStats(now = nowMs()) {
    if (this.parties.length === 0) {
      return { count: 0, medianWaitMs: 0, longestWaitMs: 0, widestRange: 0 };
    }
    const waits = this.parties.map(party => party.waitedMs(now)).sort((left, right) => left - right);
    const middle = Math.floor(waits.length / 2);
    const median = waits.length % 2 === 0 ? Math.round((waits[middle - 1] + waits[middle]) / 2) : waits[middle];
    return {
      count: this.parties.length,
      medianWaitMs: median,
      longestWaitMs: waits[waits.length - 1],
      widestRange: Math.round(Math.max(...this.parties.map(party => party.searchRange(now)))),
    };
  }

  healthReport(now = nowMs()) {
    const stats = this.waitingStats(now);
    const warnings = [];
    if (stats.longestWaitMs > this.maxWaitMs * 0.8) warnings.push("parties are close to expiry");
    if (stats.count > 500) warnings.push("queue depth is unusually high");
    if (this.metrics.ticks > 0 && this.metrics.matched === 0) warnings.push("no matches have been made");
    return { ...stats, metrics: { ...this.metrics }, warnings };
  }
}

function runFor(queue, durationMs, stepMs = TICK_MS, startAt = nowMs()) {
  const rooms = [];
  for (let elapsed = 0; elapsed <= durationMs; elapsed += stepMs) {
    const result = queue.tick(startAt + elapsed);
    rooms.push(...result.rooms);
  }
  return rooms;
}

function fairnessReport(rooms) {
  if (rooms.length === 0) return { rooms: 0, averageGap: 0, worstGap: 0, crossRegion: 0 };
  const gaps = rooms.map(room => room.ratingGap);
  return {
    rooms: rooms.length,
    averageGap: Math.round(gaps.reduce((total, gap) => total + gap, 0) / gaps.length),
    worstGap: Math.max(...gaps),
    crossRegion: rooms.filter(room => room.region === "mixed").length,
  };
}

module.exports = {
  QueueError,
  Party,
  MatchQueue,
  runFor,
  fairnessReport,
  bucketFor,
};
',141,'Search range widens with waiting time. Ask what has to be true for two parties to agree on a match.','A player who just queued at 1000 rating gets paired with a 1600 who has been waiting two minutes. Both-fresh pairings are always close.','The compatibility test used by candidate search','[{"label":"return gap <= leftRange && gap <= rightRange;","correct":true},{"label":"return gap <= Math.max(leftRange, rightRange);","correct":false},{"label":"return gap <= leftRange + rightRange;","correct":false}]','[]','With ||, one party''s widened range is enough to force the match, so a long-waiting veteran drags a freshly queued player into a mismatch. Both sides have to accept the gap, which is what && expresses. Math.max is the same bug written differently.','',90,'published','2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z' FROM topics WHERE slug='algorithms';
