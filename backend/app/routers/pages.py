from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()

# Página pública para pedir a eliminação da conta sem a app instalada.
# A Google Play exige este link na secção "Segurança dos dados".
DELETE_PAGE = """<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Apagar conta · BuroZero</title>
<style>
  body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#0d1117;color:#e6edf3}
  main{max-width:440px;margin:0 auto;padding:40px 16px}
  h1{font-size:24px;margin:0 0 4px} h1 span{color:#2563eb}
  p{color:#7d8590;font-size:15px;line-height:1.5}
  .card{background:#161b22;border:1px solid #2a3548;border-radius:16px;padding:24px;margin-top:24px}
  label{display:block;font-size:12px;font-weight:700;color:#7d8590;letter-spacing:.8px;margin:16px 0 8px}
  input{width:100%;box-sizing:border-box;background:#0d1117;border:1px solid #2a3548;border-radius:12px;
        padding:14px;font-size:16px;color:#e6edf3}
  button{width:100%;margin-top:20px;border:0;border-radius:12px;padding:15px;font-size:16px;font-weight:700;
         color:#fff;background:#2563eb;cursor:pointer}
  button.danger{background:#ef4444}
  button:disabled{opacity:.6}
  .msg{margin-top:16px;font-size:14px} .err{color:#ef4444} .ok{color:#10b981}
  .hidden{display:none}
  ul{color:#7d8590;font-size:14px;padding-left:18px;line-height:1.6}
</style>
</head>
<body>
<main>
  <h1>Buro<span>Zero</span></h1>
  <p>Apagar a tua conta e todos os teus dados.</p>

  <div class="card">
    <p style="margin-top:0">Ao apagar a conta, eliminamos de forma permanente:</p>
    <ul>
      <li>o teu email e dados de conta;</li>
      <li>todos os processos e prazos que registaste;</li>
      <li>todos os alertas e notificações.</li>
    </ul>
    <p>Não guardamos cópias. Também podes apagar a conta dentro da app, no botão 🚪 → "Apagar conta".</p>

    <div id="step1">
      <label for="email">EMAIL DA CONTA</label>
      <input id="email" type="email" autocomplete="email" placeholder="o.teu@email.pt">
      <button id="send">Enviar código</button>
    </div>

    <div id="step2" class="hidden">
      <label for="code">CÓDIGO RECEBIDO POR EMAIL</label>
      <input id="code" inputmode="numeric" maxlength="6" placeholder="000000">
      <button id="del" class="danger">Apagar conta definitivamente</button>
    </div>

    <div id="msg" class="msg"></div>
  </div>
</main>
<script>
  const API = "/api/auth";
  const $ = id => document.getElementById(id);
  const say = (t, ok) => { $("msg").textContent = t; $("msg").className = "msg " + (ok ? "ok" : "err"); };

  async function call(path, method, body, token) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = "Bearer " + token;
    const r = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(typeof d.detail === "string" ? d.detail : "Ocorreu um erro. Tenta novamente.");
    return d;
  }

  $("send").onclick = async () => {
    const email = $("email").value.trim();
    if (!email) return say("Escreve o teu email.");
    $("send").disabled = true;
    try {
      await call("/request-otp", "POST", { email });
      $("step1").classList.add("hidden");
      $("step2").classList.remove("hidden");
      say("Enviámos um código de 6 dígitos para " + email + ".", true);
    } catch (e) { say(e.message); }
    $("send").disabled = false;
  };

  $("del").onclick = async () => {
    const email = $("email").value.trim();
    const code = $("code").value.trim();
    if (code.length !== 6) return say("O código tem 6 dígitos.");
    if (!confirm("Tens a certeza? Esta ação não pode ser desfeita.")) return;
    $("del").disabled = true;
    try {
      const t = await call("/verify-otp", "POST", { email, code });
      await call("/account", "DELETE", null, t.access_token);
      $("step2").classList.add("hidden");
      say("A tua conta e todos os dados foram apagados.", true);
    } catch (e) { say(e.message); $("del").disabled = false; }
  };
</script>
</body>
</html>"""


@router.get("/apagar-conta", response_class=HTMLResponse, include_in_schema=False)
async def delete_account_page():
    return DELETE_PAGE
