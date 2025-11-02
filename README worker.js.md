// Cloudflare Worker — Awtad Policies AI (DeepSeek backend)
// Actions:
//   - "qa"     : يجيب حصراً من صفحات السياسات الممرَّرة في urls (صارم).
//   - "author" : مستشار سياسات (تصنيف/فهرسة/تحليل فجوات/خطة وأولويات/قائمة تحقق/أمثلة موجزة).
//   - "auto"   : (جديد) يصنف نية المستخدم (qa أو author) وينفذ الوضع المناسب.

// ====================== الإعدادات ======================
const ORIGINS = [
  "https://awtadpolicies.kholaidy.com",
  "https://kholaidy.com",
  "https://awtadpolicies.pages.dev",
  // للاختبار المحلي (اختياري):
  // "http://localhost:5500", "http://127.0.0.1:5500",
  // "http://localhost:5521", "http://127.0.0.1:5521"
];

const ROUTE_PATH = "/api/policies-ai";
const MAX_USER_TEXT = 8000;       // حد أقصى لطول مدخل المستخدم
const MAX_CONTEXT_CHARS = 140000; // حد أقصى لنص السياسات المُجمّع
const FETCH_TIMEOUT_MS = 12000;   // مهلة جلب كل صفحة سياسات

// ====================== أدوات مساعدة ======================
function pickOrigin(req) {
  const o = req.headers.get("Origin") || "";
  return ORIGINS.includes(o) ? o : ORIGINS[0];
}

function corsHeaders(origin, type = "application/json") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
    "Access-Control-Max-Age": "86400",
    "Content-Type": type
  };
}

function json(body, status = 200, origin) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function fetchWithTimeout(u, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(u, { signal: ctrl.signal, cf: { cacheEverything: true, cacheTtl: 3600 } });
    return r;
  } finally { clearTimeout(t); }
}

async function fetchPoliciesText(urls = []) {
  const chunks = [];
  for (const u of urls) {
    try {
      const res = await fetchWithTimeout(u, FETCH_TIMEOUT_MS);
      if (!res.ok) continue;
      const html = await res.text();
      const text = stripHtml(html);
      if (text) chunks.push(`### SOURCE: ${u}\n${text}`);
    } catch (_) { /* تجاهُل خطأ صفحة منفردة */ }
    const joined = chunks.join("\n\n---\n\n");
    if (joined.length >= MAX_CONTEXT_CHARS) break;
  }
  return chunks.join("\n\n---\n\n").slice(0, MAX_CONTEXT_CHARS);
}

async function callDeepSeek(messages, env, { temperature = 0.2, max_tokens = 1200 } = {}) {
  const model = env.DEEPSEEK_MODEL || "deepseek-chat";
  const resp = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens, stream: false })
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    const code = resp.status;
    const msg = (code === 402 || code === 429 || code === 403)
      ? "DeepSeek: لا يوجد رصيد/حصة كافية أو صلاحيات ناقصة."
      : "DeepSeek HTTP error";
    throw new Error(`${msg} :: ${code} :: ${detail}`);
  }

  const data = await resp.json();
  return data?.choices?.[0]?.message?.content?.trim?.() ||
         data?.choices?.[0]?.delta?.content?.trim?.() || "";
}

// ====================== الموزّع الرئيسي ======================
export default {
  async fetch(req, env) {
    const allow = pickOrigin(req);

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(allow) });
    }

    const url = new URL(req.url);
    if (req.method !== "POST" || url.pathname !== ROUTE_PATH) {
      return new Response("Not found", { status: 404, headers: corsHeaders(allow, "text/plain") });
    }

    // قراءة الطلب
    let payload = {};
    try { payload = await req.json(); } catch { /* تجاهُل */ }

    const action   = (payload.action || "").toLowerCase();
    const page     = payload.page || "";
    // سنستخدم 'question' أو 'text' لضمان التوافقية
    const question = (payload.question || payload.text || "").toString().slice(0, MAX_USER_TEXT);
    const urls     = Array.isArray(payload.urls) ? payload.urls.filter(Boolean) : [];
    const userText = (payload.text || "").toString().slice(0, MAX_USER_TEXT); // يبقى للاستخدام في 'author' القديم

    try {
      // ===================== وضع AUTO (تلقائي) - [جديد] =====================
      if (action === "auto") {
          // استخدم 'question' الذي عرفناه أعلاه
          const userQuestion = question; 

          if (!userQuestion) {
              return json({ result: "يرجى كتابة سؤالك." }, 200, allow);
          }
          if (!urls.length) {
               return json({ error: "no_urls", message: "يجب تمرير روابط صفحات السياسات في الحقل urls." }, 400, allow);
          }

          // --- خطوة 1: تصنيف نية المستخدم ---
          const classificationPrompt = `
              صنّف طلب المستخدم التالي. 
              - إذا كان السؤال يطلب "كتابة" أو "إنشاء" أو "اقتراح" أو "تحليل" أو "رأي" أو "مساعدة عامة" (مثل "ساعدني في كتابة سياسة" أو "ما رأيك في...؟" أو "اكتب لي إجراء...")، أجب بكلمة "author" فقط.
              - إذا كان السؤال يبحث عن "معلومة" أو "إجابة محددة" من داخل نص (مثل "ما هي سياسة الإجازات؟" أو "كم مدة العهدة؟" أو "اشرح لي سياسة التوظيف")، أجب بكلمة "qa" فقط.

              طلب المستخدم: "${userQuestion}"
              الإجابة (author أو qa):
          `;
          
          const detectedMode = (await callDeepSeek(
              [{ role: "user", content: classificationPrompt }],
              env,
              { temperature: 0.0, max_tokens: 10 }
          )).toLowerCase().replace(/[^a-z]/g, ''); // Get 'qa' or 'author'

          
          // --- خطوة 2: التنفيذ بناءً على التصنيف ---

          if (detectedMode === "author") {
              // --- (هذا هو كود 'author' الحالي الخاص بك) ---
              const context = urls.length ? await fetchPoliciesText(urls) : "";
              const systemPrompt =
                "أنت مستشار سياسات لشركات المقاولات في السعودية . " +
                "قدّم مخرجات استشارية عملية بالعربية تركز على: " ;
              const userPrompt =
                `استفسار المستخدم: ${userQuestion}\n` + // استخدام userQuestion
                `الموقع/الصفحة الحالية: ${page || "غير محدد"}\n\n` +
                (context ? `نص السياسات الحالي (للاطلاع وتحليل الفجوات فقط):\n\n${context}` :
                             "لا يوجد نص سياسات حالي مرفق. اعرض إطارًا عامًا وأفضل الممارسات.");

              const advisory = await callDeepSeek(
                [
                  { role: "system", content: systemPrompt },
                  { role: "user",   content: userPrompt }
                ],
                env,
                { temperature: 0.2, max_tokens: 1800 }
              );
              // أضفنا detected: "author" للواجهة الأمامية
              return json({ result: advisory.trim(), detected: "author" }, 200, allow);
          
          } else {
              // --- (هذا هو كود 'qa' الحالي الخاص بك - الافتراضي) ---
              const context = await fetchPoliciesText(urls);
              if (!context) {
                return json({ result: "غير مذكور في سياسات الشركة" }, 200, allow);
              }

              const systemPrompt =
                'أنت مساعد سياسات لشركة مقاولات سعودية. أجب بإيجاز وبالعربية الفصحى ' +
                'وبشكل دقيق اعتمادًا فقط على "النص المعتمد" أدناه. ' +
                'إذا لم تجد إجابة صريحة في النص، اكتب حرفيًا: غير مذكور في سياسات الشركة. ' +
                'ممنوع استخدام أي معرفة خارج النص أو التخمين.';
              
              const ctxMessage = `النص المعتمد:\n\n${context}`;
              const userMessage = `سؤال الموظف (الصفحة الحالية: ${page || "غير محدد"}):\n${userQuestion}`; // استخدام userQuestion

              const answer = await callDeepSeek(
                [
                  { role: "system", content: systemPrompt },
                  { role: "assistant", content: ctxMessage },
                  { role: "user", content: userMessage }
                ],
                env,
                { temperature: 0.0, max_tokens: 900 }
              );

              const safe = (answer && /غير مذكور في سياسات الشركة/.test(answer)) ? "غير مذكور في سياسات الشركة" : (answer || "");
              // أضفنا detected: "qa" للواجهة الأمامية
              return json({ result: safe || "غير مذكور في سياسات الشركة", detected: "qa" }, 200, allow);
          }
      }
      
      // ===================== وضع QA (القديم - اختياري) =====================
      if (action === "qa") {
        if (!urls.length) {
          return json({ error: "no_urls", message: "يجب تمرير روابط صفحات السياسات في الحقل urls." }, 400, allow);
        }

        const context = await fetchPoliciesText(urls);
        if (!context) {
          return json({ result: "غير مذكور في سياسات الشركة" }, 200, allow);
        }

        const systemPrompt =
          'أنت مساعد سياسات لشركة مقاولات سعودية. أجب بإيجاز وبالعربية الفصحى ' +
          'وبشكل دقيق اعتمادًا فقط على "النص المعتمد" أدناه. ' +
          'إذا لم تجد إجابة صريحة في النص، اكتب حرفيًا: غير مذكور في سياسات الشركة. ' +
          'ممنوع استخدام أي معرفة خارج النص أو التخمين.';

        const ctxMessage = `النص المعتمد:\n\n${context}`;
        const userMessage = `سؤال الموظف (الصفحة الحالية: ${page || "غير محدد"}):\n${question}`;

        const answer = await callDeepSeek(
          [
            { role: "system", content: systemPrompt },
            { role: "assistant", content: ctxMessage },
            { role: "user", content: userMessage }
          ],
          env,
          { temperature: 0.0, max_tokens: 900 }
        );

        const safe = (answer && /غير مذكور في سياسات الشركة/.test(answer)) ? "غير مذكور في سياسات الشركة" : (answer || "");
        return json({ result: safe || "غير مذكور في سياسات الشركة" }, 200, allow);
      }

      // ===================== وضع AUTHOR (القديم - اختياري) =====================
      if (action === "author") {
        // إذا وُجدت urls سنستخدمها لتحليل الفجوات.
        const context = urls.length ? await fetchPoliciesText(urls) : "";

        const systemPrompt =
          "أنت مستشار سياسات لشركات المقاولات في السعودية . " +
          "قدّم مخرجات استشارية عملية بالعربية تركز على: " ;

        const userPrompt =
          `استفسار المستخدم: ${userText || "أريد إطارًا استشاريًا عامًا حول سياسات شركة المقاولات."}\n` + // هنا نستخدم userText القديم
          `الموقع/الصفحة الحالية: ${page || "غير محدد"}\n\n` +
          (context ? `نص السياسات الحالي (للاطلاع وتحليل الفجوات فقط):\n\n${context}` :
                       "لا يوجد نص سياسات حالي مرفق. اعرض إطارًا عامًا وأفضل الممارسات.");

        const advisory = await callDeepSeek(
          [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userPrompt }
          ],
          env,
          { temperature: 0.2, max_tokens: 1800 }
        );

        // نعيد نصًا منسقًا (Markdown/نقاط) ليُعرض كما هو في الواجهة.
        return json({ result: advisory.trim() }, 200, allow);
      }

      // غير معروف
      // [تم التعديل]
      return json({ error: "unknown_action", message: "action يجب أن تكون auto أو qa أو author" }, 400, allow);

    } catch (e) {
      return json({ error: "server_error", detail: (e?.message || String(e)).slice(0, 2000) }, 500, allow);
    }
  }
};