import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles, CheckCircle, ArrowRight, Copy, Lock, Search,
  LayoutGrid, LogOut, Users, DollarSign, TrendingUp, ShoppingBag,
  Trash2, Edit2, Plus, X, Eye, Shield, Play, Camera,
  ChevronRight, Layers,
} from "lucide-react";
import {
  initializeStorage, getModels, addModel, updateModel, deleteModel,
  getLeads, addLead, getTransactions, getStats, getAdminUser,
  updateAdminPassword, deleteLead,
} from "./mockDb";
import type { Model, Lead, Transaction } from "./mockDb";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Route = "home" | "admin-login" | "admin-dashboard";
type AdminTab = "overview" | "models" | "leads" | "transactions";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const discountedPrice = (m: Model) =>
  m.discountPercentage > 0 ? m.price * (1 - m.discountPercentage / 100) : m.price;

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const minVideos = (n: number) => Math.max(258, n);

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length > 10) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length > 6)  return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length > 2)  return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return d;
}
function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length > 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`;
  return d;
}

// Apply 25 random "sold" models per session
function applySessionSold(all: Model[]): Model[] {
  let soldIds: string[] = [];
  try { soldIds = JSON.parse(sessionStorage.getItem("hm_sold_ids") || "[]"); } catch {}
  if (!soldIds.length) {
    soldIds = [...all].sort(() => Math.random() - 0.5).slice(0, 25).map(m => m.id);
    sessionStorage.setItem("hm_sold_ids", JSON.stringify(soldIds));
  }
  return all.map(m => soldIds.includes(m.id) ? { ...m, isAvailable: false } : m);
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF Generator
// ─────────────────────────────────────────────────────────────────────────────
function generatePDF(purchasedModels: Model[]) {
  const win = window.open("", "_blank");
  if (!win) { alert("Ative os pop-ups para gerar o PDF."); return; }

  const linksHtml = purchasedModels.map(m => `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:6px;margin-bottom:10px;">
      <strong>Modelo: ${m.name}</strong><br/>
      ${m.delivery_links?.length
        ? m.delivery_links.map((l, i) => `<a href="${l}" target="_blank" style="color:#ec4899;font-weight:bold;word-break:break-all;display:block;margin-top:4px;">Pasta ${i+1}: ${l}</a>`).join("")
        : '<span style="color:#ef4444;font-weight:bold;">Pasta pendente de sincronização.</span>'}
    </div>`).join("");

  win.document.write(`<html><head><title>Manual_Modelo_Que_Vende_${Date.now()}</title>
  <style>
    body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1e293b;background:#fff;margin:0;padding:40px;line-height:1.7}
    .header{text-align:center;border-bottom:3px double #ec4899;padding-bottom:20px;margin-bottom:30px}
    .brand{font-size:24px;font-weight:900;letter-spacing:2px;color:#ec4899;text-transform:uppercase}
    .confidential{color:#ef4444;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-top:5px}
    h1{font-size:22px;font-weight:800;margin:15px 0 5px;color:#0f172a}
    h2{font-size:14px;font-weight:700;margin-top:28px;color:#ec4899;border-bottom:1px solid #e2e8f0;padding-bottom:5px;text-transform:uppercase}
    p,li{font-size:13px;color:#334155;margin-bottom:6px}ul{padding-left:20px;margin-top:8px}
    .step-box{background:#f8fafc;border-left:4px solid #ec4899;padding:12px 16px;border-radius:0 8px 8px 0;margin:10px 0}
    .step-number{font-size:11px;font-weight:800;color:#ec4899;text-transform:uppercase;letter-spacing:1px}
    .coupon-box{border:2px dashed #ec4899;background:#fff5f7;padding:18px;text-align:center;border-radius:10px;margin-top:16px}
    .coupon-code{font-size:26px;font-weight:900;color:#ec4899;letter-spacing:3px;margin:6px 0}
    .privacy-box{background:#f0fdf4;border:1px solid #86efac;padding:16px;border-radius:8px;margin-top:16px}
    .privacy-box a{color:#16a34a;font-weight:700}
    .alert-box{background:#fff7ed;border:1px solid #fdba74;padding:12px 16px;border-radius:8px;margin-top:16px;font-size:12px}
    .footer{margin-top:50px;text-align:center;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:15px}
    @media print{.no-print{display:none}body{padding:20px}}
  </style></head><body>
  <div class="no-print" style="margin-bottom:20px;text-align:right">
    <button onclick="window.print()" style="background:#ec4899;color:white;border:none;padding:10px 20px;font-weight:bold;border-radius:5px;cursor:pointer">🖨️ Salvar como PDF / Imprimir Manual</button>
  </div>
  <div class="header">
    <div class="brand">Modelo Que Vende™</div>
    <div class="confidential">Manual de Monetização Exclusivo • Acesso Restrito ao Comprador</div>
  </div>
  <h1>MANUAL COMPLETO — DO ACERVO À PRIMEIRA VENDA</h1>
  <p>Você adquiriu os direitos de uso exclusivos das mídias abaixo. Este manual contém seus links de acesso e o passo a passo para gerar as primeiras vendas ainda hoje.</p>

  <h2>1. SEUS LINKS DE ACESSO</h2>
  <div style="margin-top:15px">${linksHtml}</div>

  <h2>2. COMO FAZER A PRIMEIRA VENDA AINDA HOJE</h2>
  <p>Siga este roteiro na ordem. Cada passo leva menos de 15 minutos.</p>

  <div class="step-box">
    <div class="step-number">Passo 1 — Abra o acervo e escolha as 3 melhores fotos</div>
    <p>Acesse a pasta pelo link acima. Selecione 3 fotos de ângulos diferentes: rosto/busto, corpo inteiro e uma foto de maior apelo. Essas serão suas "iscas" de divulgação — <strong>nunca mostre tudo de graça</strong>.</p>
  </div>

  <div class="step-box">
    <div class="step-number">Passo 2 — Monte sua vitrine profissional (grátis)</div>
    <p>Crie sua página de vendas no <strong>Privacy Painel</strong> — tem período de teste gratuito. Acesse, cadastre a modelo com as 3 fotos escolhidas, defina o preço (sugestão: R$ 19,90 a R$ 49,90) e personalize a bio.</p>
    <p>Copie o link gerado pela plataforma — esse é o seu link de vendas.</p>
  </div>

  <div class="step-box">
    <div class="step-number">Passo 3 — Coloque o link na bio e comece a divulgar</div>
    <p>Insira o link da vitrine na bio do Instagram, TikTok, Kwai, Threads e X. Publique as 3 fotos de isca com a chamada: <em>"Conteúdo completo e exclusivo no link da bio 🔗"</em></p>
    <p>Repita isso 2x por dia nos primeiros 3 dias. A maioria das primeiras vendas acontece nas primeiras 48h de divulgação.</p>
  </div>

  <div class="step-box">
    <div class="step-number">Passo 4 — Use IA para multiplicar o conteúdo (avançado)</div>
    <p>Com as fotos originais em mãos, você pode gerar variações ilimitadas:</p>
    <ul>
      <li><strong>FaceSwap (Fooocus / Reface):</strong> Crie novas fotos mantendo as feições da modelo.</li>
      <li><strong>ChatGPT / Midjourney:</strong> Descreva poses e ambientes baseados nas originais para criar conteúdo novo sem fotografar.</li>
      <li><strong>Dica:</strong> Mantenha iluminação e paleta de cores similares às fotos originais para consistência.</li>
    </ul>
  </div>

  <h2>3. VITRINE PROFISSIONAL — PRIVACY PAINEL</h2>
  <p>A ferramenta recomendada para montar sua vitrine e receber pagamentos automaticamente. <strong>Você pode testar o site gratuitamente</strong> — sem precisar colocar cartão agora.</p>
  <div class="privacy-box">
    <p style="font-size:15px;font-weight:800;color:#16a34a;margin-bottom:8px">🆓 Teste grátis disponível — comece a vender ainda hoje!</p>
    <p><strong>🔗 Cadastre-se aqui:</strong> <a href="https://app.privacy-s.com/login" target="_blank">app.privacy-s.com/login</a></p>
    <p>Crie sua conta, cadastre a modelo com as fotos escolhidas, defina o preço e copie o link da sua vitrine. O cliente acessa, paga e recebe o conteúdo — automático, sem você precisar fazer nada manualmente.</p>
    <p><strong>Planos disponíveis:</strong></p>
    <ul>
      <li><strong>Start:</strong> 1 modelo na vitrine — ideal para começar</li>
      <li><strong>Pro:</strong> 3 modelos na mesma vitrine — recomendado</li>
      <li><strong>Agência:</strong> escala ilimitada</li>
    </ul>
  </div>

  <h2>4. CUPOM EXCLUSIVO — 50% OFF NO PLANO PRO</h2>
  <p>Após o teste gratuito, se quiser manter o plano Pro ou Agência, use o cupom abaixo para 50% de desconto:</p>
  <div class="coupon-box">
    <span style="font-size:12px;font-weight:bold;color:#64748b;text-transform:uppercase">Cupom Privacy Painel — Plano Pro ou Agência</span><br/>
    <div class="coupon-code">tel050</div>
    <p style="margin:5px 0 0;font-size:11px;color:#64748b">50% de desconto · Aplique no checkout em <a href="https://app.privacy-s.com/login" style="color:#ec4899">app.privacy-s.com/login</a></p>
  </div>

  <h2>5. TERMOS DE USO E SEGURANÇA</h2>
  <div class="alert-box">
    <strong>⚠️ Atenção:</strong> Os direitos de uso das mídias adquiridas são exclusivos e intransferíveis. Não compartilhe as pastas originais publicamente nem revenda o acesso direto ao conteúdo. A exploração deve ser feita exclusivamente através de uma vitrine de criador de conteúdo (Privacy Painel ou similar). A divulgação indevida das pastas originais resultará em suspensão dos direitos.
  </div>

  <div class="footer"><p>Modelo Que Vende™ © ${new Date().getFullYear()} — Todos os direitos reservados.</p></div>
  <script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
  </body></html>`);
  win.document.close();
}

// ─────────────────────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  // Route
  const [route, setRoute] = useState<Route>("home");

  // Catalog state
  const [models, setModels] = useState<Model[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState(getStats());
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [cardActiveImages, setCardActiveImages] = useState<Record<string, string>>({});
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);

  // Age gate
  const [ageVerified, setAgeVerified] = useState(() => !!localStorage.getItem("hm_age"));

  // Checkout
  const [modelToUnlock, setModelToUnlock] = useState<Model | null>(null);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [upsell1Active, setUpsell1Active] = useState(false);
  const [upsell1ModelId, setUpsell1ModelId] = useState("");
  const [upsell2Active, setUpsell2Active] = useState(false);
  const [custName, setCustName] = useState("");
  const [custWhatsapp, setCustWhatsapp] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custCpf, setCustCpf] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [successModelNames, setSuccessModelNames] = useState<string[]>([]);
  const [successTotal, setSuccessTotal] = useState(0);

  // Back redirect popup
  const [showBackPopup, setShowBackPopup] = useState(false);

  // Admin
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [adminTab, setAdminTab] = useState<AdminTab>("overview");
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [modelFormData, setModelFormData] = useState({
    name: "", cover: "", description: "", price: 39.9, discountPercentage: 10,
    buyLink: "", categories: "Premium, VIP", photosCount: 100, videosCount: 280,
    isFeatured: false, isAvailable: true, returnDays: 14,
  });
  const [newPassword, setNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [adminSearch, setAdminSearch] = useState("");

  // ── Init ──────────────────────────────────────────────────────────────────
  const refreshData = () => {
    const all = getModels();
    setModels(applySessionSold(all));
    setLeads(getLeads());
    setTransactions(getTransactions());
    setStats(getStats());
  };

  useEffect(() => {
    initializeStorage();
    refreshData();

    const onHash = () => {
      if (window.location.hash === "#admin") setRoute("admin-login");
      else if (window.location.hash === "#home" || !window.location.hash) setRoute("home");
    };
    window.addEventListener("hashchange", onHash);
    onHash();

    const onLeave = (e: MouseEvent) => {
      if (e.clientY < 50 && !sessionStorage.getItem("hm_back_dismissed")) {
        setShowBackPopup(true);
      }
    };
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // ── PIX polling ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (checkoutStep !== 3 || !paymentId) return;
    let mounted = true;
    const iv = setInterval(async () => {
      try {
        const r = await fetch(`/api/verificar-pagamento?id=${paymentId}`);
        if (!r.ok) return;
        const d = await r.json();
        if (d.ok && d.status === "COMPLETED" && mounted) {
          clearInterval(iv);
          confirmPayment();
        }
      } catch {}
    }, 4000);
    return () => { mounted = false; clearInterval(iv); };
  }, [checkoutStep, paymentId]);

  // ── Price helpers ─────────────────────────────────────────────────────────
  const getMainPrice = () => modelToUnlock ? discountedPrice(modelToUnlock) : 0;

  const getUpsell1Price = () => {
    if (!upsell1Active || !upsell1ModelId) return 0;
    const up = models.find(m => m.id === upsell1ModelId);
    return up ? discountedPrice(up) * 0.5 : 0;
  };

  const getCheckoutTotal = () => getMainPrice() + getUpsell1Price();

  // ── Open checkout ─────────────────────────────────────────────────────────
  const openCheckout = (m: Model) => {
    setModelToUnlock(m);
    setCheckoutStep(1);
    setUpsell1Active(false);
    setUpsell1ModelId("");
    setUpsell2Active(false);
    setPaymentError("");
    setPixCode("");
    setPaymentId("");
    setCustName(""); setCustWhatsapp(""); setCustEmail(""); setCustCpf("");
  };

  // ── Submit data form → generate PIX ──────────────────────────────────────
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelToUnlock) return;
    setPaymentLoading(true);
    setPaymentError("");

    let extraNames = "";
    if (upsell1Active && upsell1ModelId) {
      const up = models.find(m => m.id === upsell1ModelId);
      if (up) extraNames += ` + ${up.name} (50% OFF)`;
    }
    const prodName = `Modelo Que Vende - ${modelToUnlock.name}${extraNames}`;

    try {
      const r = await fetch("/api/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: custName, email: custEmail,
          tel: custWhatsapp.replace(/\D/g, ""),
          cpf: custCpf.replace(/\D/g, ""),
          productName: prodName,
          total: getCheckoutTotal(),
        }),
      });
      const ct = r.headers.get("content-type");
      if (!ct?.includes("application/json")) throw new Error("Resposta inválida do servidor.");
      const d = await r.json();
      setPaymentLoading(false);
      if (d.ok) {
        addLead({ name: custName, whatsapp: custWhatsapp, email: custEmail, modelId: modelToUnlock.id, modelName: modelToUnlock.name });
        if (upsell1Active && upsell1ModelId) {
          const up = models.find(m => m.id === upsell1ModelId);
          if (up) addLead({ name: custName, whatsapp: custWhatsapp, email: custEmail, modelId: up.id, modelName: up.name });
        }
        setPixCode(d.qr_code_text);
        setPaymentId(d.transaction_id || d.payment_id || "");
        setCheckoutStep(3);
      } else {
        setPaymentError(d.erro || "Erro ao gerar o Pix. Tente novamente.");
      }
    } catch (err: any) {
      setPaymentLoading(false);
      setPaymentError(err.message || "Erro de conexão.");
    }
  };

  // ── Confirm payment (real or simulated) ──────────────────────────────────
  const confirmPayment = () => {
    if (!modelToUnlock) return;
    const mainPrice = getMainPrice();
    let extraPrice = 0;
    const purchased: Model[] = [modelToUnlock];
    if (upsell1Active && upsell1ModelId) {
      const up = models.find(m => m.id === upsell1ModelId);
      if (up) { extraPrice += discountedPrice(up) * 0.5; purchased.push(up); }
    }
    const total = mainPrice + extraPrice;

    const all = getModels();
    purchased.forEach(pm => {
      const found = all.find(m => m.id === pm.id);
      if (found) { found.isAvailable = false; found.views += 1; updateModel(found); }
    });

    const nameStr = purchased.map(m => m.name).join(" & ");
    const txList = JSON.parse(localStorage.getItem("hotmodel_transactions") || "[]");
    txList.unshift({ id: "trans-" + Date.now(), customerName: custName, customerEmail: custEmail, modelName: nameStr, amount: total, status: "Aprovado", createdAt: new Date().toISOString() });
    localStorage.setItem("hotmodel_transactions", JSON.stringify(txList));

    setSuccessModelNames(purchased.map(m => m.name));
    setSuccessTotal(total);
    setCheckoutStep(4); // → success direto
    refreshData();
  };

  // ── Admin ─────────────────────────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = getAdminUser();
    if (adminUsername === admin.username && adminPassword === admin.passwordHash) {
      setRoute("admin-dashboard"); setLoginError("");
    } else {
      setLoginError("Credenciais inválidas.");
    }
  };

  const handleModelFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cats = modelFormData.categories.split(",").map(c => c.trim()).filter(Boolean);
    const payload = { ...modelFormData, categories: cats, price: Number(modelFormData.price), discountPercentage: Number(modelFormData.discountPercentage), photosCount: Number(modelFormData.photosCount), videosCount: Number(modelFormData.videosCount), returnDays: Number(modelFormData.returnDays), buyLink: modelFormData.buyLink || "#", gallery: [], delivery_links: [] };
    if (editingModel) updateModel({ ...editingModel, ...payload });
    else addModel(payload as Omit<Model, "id" | "views" | "earnings">);
    setEditingModel(null); setIsAddingModel(false); refreshData();
  };

  const startEdit = (m: Model) => {
    setEditingModel(m);
    setModelFormData({ name: m.name, cover: m.cover, description: m.description, price: m.price, discountPercentage: m.discountPercentage, buyLink: m.buyLink, categories: m.categories.join(", "), photosCount: m.photosCount, videosCount: m.videosCount, isFeatured: m.isFeatured, isAvailable: m.isAvailable, returnDays: m.returnDays });
    setIsAddingModel(true);
  };

  const closeBackPopup = () => { setShowBackPopup(false); sessionStorage.setItem("hm_back_dismissed", "1"); };

  // ── Filtered catalog ──────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const s = new Set<string>();
    models.forEach(m => m.categories.forEach(c => s.add(c)));
    return ["Todos", ...Array.from(s).sort()];
  }, [models]);

  const filteredModels = useMemo(() => {
    setVisibleCount(24);
    return models
      .filter(m => selectedCategory === "Todos" || m.categories.includes(selectedCategory))
      .filter(m => !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [models, selectedCategory, searchQuery]);

  // ── ADMIN DASHBOARD ───────────────────────────────────────────────────────
  if (route === "admin-login") {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <div className="logo-icon" style={{ fontSize: "1.8rem", width: 56, height: 56 }}>🔥</div>
            <div className="logo-text" style={{ fontSize: "1.8rem" }}>Modelo Que Vende</div>
            <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Painel Administrativo</span>
          </div>
          <div className="glass-card">
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Usuário</label>
                <input className="form-control" required value={adminUsername} onChange={e => setAdminUsername(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Senha</label>
                <input className="form-control" type="password" required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
              </div>
              {loginError && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: 12 }}>{loginError}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}><Shield size={16} /> Entrar</button>
            </form>
            <button className="btn btn-secondary" style={{ width: "100%", marginTop: 10 }} onClick={() => { setRoute("home"); window.location.hash = "home"; }}>Voltar</button>
          </div>
        </div>
      </div>
    );
  }

  if (route === "admin-dashboard") {
    const filteredAdminModels = models.filter(m => !adminSearch || m.name.toLowerCase().includes(adminSearch.toLowerCase()));
    return (
      <div className="admin-container">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <div className="logo-container">
              <div className="logo-icon" style={{ fontSize: "1.1rem", width: 32, height: 32 }}>🔥</div>
              <span className="logo-text" style={{ fontSize: "1.1rem" }}>Modelo Que Vende</span>
            </div>
          </div>
          <nav className="admin-nav">
            {(["overview", "models", "leads", "transactions"] as AdminTab[]).map(t => (
              <button key={t} className={`admin-nav-item${adminTab === t ? " active" : ""}`} onClick={() => setAdminTab(t)}>
                {t === "overview" && <><LayoutGrid size={18} /> Visão Geral</>}
                {t === "models" && <><Users size={18} /> Modelos</>}
                {t === "leads" && <><TrendingUp size={18} /> Leads</>}
                {t === "transactions" && <><DollarSign size={18} /> Transações</>}
              </button>
            ))}
          </nav>
          <div className="admin-logout">
            <button className="admin-nav-item" style={{ width: "100%" }} onClick={() => { setRoute("home"); window.location.hash = "home"; }}>
              <LogOut size={18} /> Sair
            </button>
          </div>
        </aside>
        <main className="admin-main">
          {adminTab === "overview" && (
            <>
              <div className="admin-header"><div className="admin-title-group"><h1>Visão Geral</h1><p>Resumo do desempenho</p></div></div>
              <div className="stats-grid">
                {[
                  { title: "Receita Total", value: fmt(stats.totalRevenue), footer: "Vendas aprovadas", icon: <ShoppingBag size={12} /> },
                  { title: "Vendas Aprovadas", value: stats.approvedSales, footer: "Confirmadas", icon: <CheckCircle size={12} /> },
                  { title: "Leads Capturados", value: stats.totalLeads, footer: "Total", icon: <TrendingUp size={12} />, neutral: true },
                  { title: "Taxa de Conversão", value: stats.conversionRate.toFixed(1) + "%", footer: "Leads → Vendas", icon: <TrendingUp size={12} />, neutral: true },
                  { title: "Modelos no Catálogo", value: models.length, footer: "Cadastradas", icon: <Users size={12} />, neutral: true },
                  { title: "Pendentes", value: stats.pendingSales, footer: "Aguardando", icon: <span>⏳</span>, warn: true },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-card-title">{s.title}</div>
                    <div className="stat-card-value">{s.value}</div>
                    <div className={`stat-card-footer${s.neutral ? " neutral" : ""}${s.warn ? "" : ""}`} style={s.warn ? { color: "#f59e0b" } : {}}>
                      {s.icon} {s.footer}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {adminTab === "models" && (
            <>
              <div className="admin-header">
                <div className="admin-title-group"><h1>Modelos</h1><p>{models.length} no catálogo</p></div>
                <button className="btn btn-primary btn-sm" onClick={() => { setIsAddingModel(true); setEditingModel(null); setModelFormData({ name: "", cover: "", description: "", price: 39.9, discountPercentage: 10, buyLink: "", categories: "Premium, VIP", photosCount: 100, videosCount: 280, isFeatured: false, isAvailable: true, returnDays: 14 }); }}>
                  <Plus size={16} /> Adicionar
                </button>
              </div>
              {isAddingModel && (
                <div className="glass-card" style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ margin: 0 }}>{editingModel ? "Editar Modelo" : "Nova Modelo"}</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setIsAddingModel(false); setEditingModel(null); }}><X size={14} /></button>
                  </div>
                  <form onSubmit={handleModelFormSubmit}>
                    <div className="form-grid">
                      <div className="form-group full-width"><label className="form-label">Nome</label><input className="form-control" required value={modelFormData.name} onChange={e => setModelFormData(p => ({ ...p, name: e.target.value }))} /></div>
                      <div className="form-group full-width"><label className="form-label">URL da Capa</label><input className="form-control" value={modelFormData.cover} onChange={e => setModelFormData(p => ({ ...p, cover: e.target.value }))} /></div>
                      <div className="form-group full-width"><label className="form-label">Descrição</label><input className="form-control" value={modelFormData.description} onChange={e => setModelFormData(p => ({ ...p, description: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Preço (R$)</label><input className="form-control" type="number" step="0.01" value={modelFormData.price} onChange={e => setModelFormData(p => ({ ...p, price: parseFloat(e.target.value) }))} /></div>
                      <div className="form-group"><label className="form-label">Desconto (%)</label><input className="form-control" type="number" min="0" max="100" value={modelFormData.discountPercentage} onChange={e => setModelFormData(p => ({ ...p, discountPercentage: parseInt(e.target.value) }))} /></div>
                      <div className="form-group"><label className="form-label">Fotos</label><input className="form-control" type="number" value={modelFormData.photosCount} onChange={e => setModelFormData(p => ({ ...p, photosCount: parseInt(e.target.value) }))} /></div>
                      <div className="form-group"><label className="form-label">Vídeos</label><input className="form-control" type="number" value={modelFormData.videosCount} onChange={e => setModelFormData(p => ({ ...p, videosCount: parseInt(e.target.value) }))} /></div>
                      <div className="form-group full-width"><label className="form-label">Categorias (vírgula)</label><input className="form-control" value={modelFormData.categories} onChange={e => setModelFormData(p => ({ ...p, categories: e.target.value }))} /></div>
                      <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}><input type="checkbox" checked={modelFormData.isFeatured} onChange={e => setModelFormData(p => ({ ...p, isFeatured: e.target.checked }))} /><label className="form-label" style={{ margin: 0 }}>Destaque</label></div>
                      <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}><input type="checkbox" checked={modelFormData.isAvailable} onChange={e => setModelFormData(p => ({ ...p, isAvailable: e.target.checked }))} /><label className="form-label" style={{ margin: 0 }}>Disponível</label></div>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingModel ? "Salvar" : "Adicionar"}</button>
                      <button type="button" className="btn btn-secondary" onClick={() => { setIsAddingModel(false); setEditingModel(null); }}>Cancelar</button>
                    </div>
                  </form>
                </div>
              )}
              <input className="form-control" placeholder="Buscar..." value={adminSearch} onChange={e => setAdminSearch(e.target.value)} style={{ marginBottom: 16 }} />
              <div className="table-card"><div className="table-responsive"><table className="admin-table">
                <thead><tr><th>Modelo</th><th>Preço</th><th>Desc.</th><th>Categorias</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {filteredAdminModels.map(m => (
                    <tr key={m.id}>
                      <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><img src={m.cover} alt={m.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", background: "#1e1e2d" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /><span style={{ fontWeight: 600 }}>{m.name}</span></div></td>
                      <td>{fmt(m.price)}</td>
                      <td>{m.discountPercentage > 0 ? `${m.discountPercentage}%` : "-"}</td>
                      <td><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{m.categories.map(c => <span key={c} className="model-tag">{c}</span>)}</div></td>
                      <td><span className={`badge-status ${m.isAvailable ? "approved" : "canceled"}`}>{m.isAvailable ? "Ativo" : "Vendida"}</span></td>
                      <td><div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(m)}><Edit2 size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => { if (confirm("Remover?")) { deleteModel(m.id); refreshData(); } }}><Trash2 size={14} /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table></div></div>
            </>
          )}

          {adminTab === "leads" && (
            <>
              <div className="admin-header"><div className="admin-title-group"><h1>Leads</h1><p>{leads.length} capturados</p></div></div>
              <div className="table-card"><div className="table-responsive"><table className="admin-table">
                <thead><tr><th>Nome</th><th>E-mail</th><th>WhatsApp</th><th>Modelo</th><th>Data</th><th>Ação</th></tr></thead>
                <tbody>
                  {leads.map(l => <tr key={l.id}><td>{l.name}</td><td>{l.email}</td><td>{l.whatsapp}</td><td>{l.modelName}</td><td>{new Date(l.createdAt).toLocaleDateString("pt-BR")}</td><td><button className="btn btn-danger btn-sm" onClick={() => { deleteLead(l.id); refreshData(); }}><Trash2 size={14} /></button></td></tr>)}
                  {!leads.length && <tr><td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>Nenhum lead ainda.</td></tr>}
                </tbody>
              </table></div></div>
            </>
          )}

          {adminTab === "transactions" && (
            <>
              <div className="admin-header"><div className="admin-title-group"><h1>Transações</h1><p>{transactions.length} registradas</p></div></div>
              <div className="table-card"><div className="table-responsive"><table className="admin-table">
                <thead><tr><th>Cliente</th><th>E-mail</th><th>Modelo</th><th>Valor</th><th>Status</th><th>Data</th></tr></thead>
                <tbody>
                  {transactions.map(t => <tr key={t.id}><td>{t.customerName}</td><td>{t.customerEmail}</td><td>{t.modelName}</td><td>{fmt(t.amount)}</td><td><span className={`badge-status ${t.status === "Aprovado" ? "approved" : t.status === "Pendente" ? "pending" : "canceled"}`}>{t.status}</span></td><td>{new Date(t.createdAt).toLocaleDateString("pt-BR")}</td></tr>)}
                  {!transactions.length && <tr><td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>Nenhuma transação ainda.</td></tr>}
                </tbody>
              </table></div></div>
              <div className="glass-card" style={{ marginTop: 24 }}>
                <h3>Alterar Senha Admin</h3>
                <form onSubmit={e => { e.preventDefault(); if (!newPassword.trim()) return; updateAdminPassword(newPassword.trim()); setPasswordSuccess("Senha alterada!"); setNewPassword(""); setTimeout(() => setPasswordSuccess(""), 3000); }}>
                  <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                    <input className="form-control" type="password" placeholder="Nova senha" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <button type="submit" className="btn btn-primary">Salvar</button>
                  </div>
                  {passwordSuccess && <p style={{ color: "#10b981", marginTop: 8 }}>{passwordSuccess}</p>}
                </form>
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // ── HOME (Catalog) ────────────────────────────────────────────────────────
  return (
    <>
      {/* Age Gate */}
      {!ageVerified && (
        <div className="modal-overlay">
          <div className="modal-content age-modal">
            <div className="age-icon">18+</div>
            <h2 className="modal-title">Conteúdo Adulto Restrito</h2>
            <p className="modal-desc">Você deve ter 18 anos ou mais para acessar esta vitrine. Ao entrar, confirma estar de acordo com os termos.</p>
            <div style={{ display: "flex", gap: 15, justifyContent: "center" }}>
              <button className="btn btn-primary" onClick={() => { localStorage.setItem("hm_age", "1"); setAgeVerified(true); }}>Tenho 18 anos ou mais</button>
              <a href="https://google.com" className="btn btn-secondary">Sair</a>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT OVERLAY */}
      {modelToUnlock && (
        <div className="modal-overlay" style={{ overflowY: "auto", padding: "10px 0" }}>
          <div className="modal-content" style={{ textAlign: "left", maxWidth: 600, margin: "30px auto" }}>

            {/* Header + stepper */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid var(--border-color)", paddingBottom: 15 }}>
              <h3 style={{ fontSize: "1.4rem" }}>
                {checkoutStep === 1 && "🛒 Resumo do Pedido"}
                {checkoutStep === 2 && "👤 Dados para Acesso"}
                {checkoutStep === 3 && "⚡ Efetuar Pagamento"}
                {checkoutStep === 4 && "🎉 Compra Confirmada!"}
              </h3>
              {checkoutStep < 4 && (
                <button onClick={() => setModelToUnlock(null)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.8rem", cursor: "pointer", lineHeight: 1 }}>×</button>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 25 }}>
              {[1,2,3,4].map(s => <span key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: checkoutStep >= s ? (s === 4 ? "var(--color-success)" : "var(--color-primary)") : "rgba(255,255,255,0.08)" }} />)}
            </div>

            {/* STEP 1 — Summary + upsell */}
            {checkoutStep === 1 && (
              <div>
                <div className="glass-card" style={{ padding: 16, display: "flex", gap: 15, alignItems: "center", marginBottom: 20, borderColor: "rgba(255,255,255,0.08)" }}>
                  <img src={modelToUnlock.cover} alt={modelToUnlock.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "1.1rem" }}>{modelToUnlock.name}</h4>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Direitos de uso exclusivos · acervo digital</span>
                  </div>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800 }}>{fmt(getMainPrice())}</span>
                </div>

                {modelToUnlock.gallery && modelToUnlock.gallery.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f472b6", display: "block", marginBottom: 8 }}>
                      🔥 PRÉVIA DO ACERVO DE {modelToUnlock.name.toUpperCase()} ({modelToUnlock.gallery.length} fotos)
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                      {modelToUnlock.gallery.slice(0, 4).map((img, i) => (
                        <div key={i} style={{ aspectRatio: "1/1", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", background: "#1e293b" }}>
                          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upsell 1 */}
                {models.filter(m => m.isAvailable && m.id !== modelToUnlock.id).length > 0 && (
                  <div className="glass-card" style={{ padding: 18, marginBottom: 15, border: "1px dashed rgba(236,72,153,0.4)", background: "rgba(236,72,153,0.02)" }}>
                    <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                      <input type="checkbox" checked={upsell1Active} onChange={e => {
                        setUpsell1Active(e.target.checked);
                        if (e.target.checked && !upsell1ModelId) {
                          const first = models.find(m => m.isAvailable && m.id !== modelToUnlock.id);
                          if (first) setUpsell1ModelId(first.id);
                        }
                      }} style={{ marginTop: 5 }} />
                      <div>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-secondary)", display: "block" }}>🔥 LEVE MAIS UMA MODELO COM 50% DE DESCONTO!</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Adquira também os direitos de uma segunda modelo pela metade do preço.</span>
                      </div>
                    </label>
                    {upsell1Active && (
                      <div style={{ marginTop: 12 }}>
                        <select className="form-control" value={upsell1ModelId} onChange={e => setUpsell1ModelId(e.target.value)} style={{ padding: "8px 12px", fontSize: "0.85rem" }}>
                          {models.filter(m => m.isAvailable && m.id !== modelToUnlock.id).map(m => (
                            <option key={m.id} value={m.id}>{m.name} (Por {fmt(discountedPrice(m) * 0.5)})</option>
                          ))}
                        </select>
                        {(() => {
                          const up = models.find(m => m.id === upsell1ModelId);
                          if (!up?.gallery?.length) return null;
                          return (
                            <div style={{ marginTop: 12 }}>
                              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-secondary)", display: "block", marginBottom: 8 }}>
                                🔥 PRÉVIA DE {up.name.toUpperCase()} ({up.gallery.length} fotos)
                              </span>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                                {up.gallery.slice(0, 4).map((img, i) => (
                                  <div key={i} style={{ aspectRatio: "1/1", borderRadius: 8, overflow: "hidden", background: "#1e293b" }}>
                                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25, borderTop: "1px solid var(--border-color)", paddingTop: 15 }}>
                  <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>Total do Pedido:</span>
                  <span style={{ fontSize: "1.6rem", fontWeight: 900 }}>{fmt(getCheckoutTotal())}</span>
                </div>
                <button className="btn btn-primary" style={{ width: "100%", padding: 14 }} onClick={() => setCheckoutStep(2)}>
                  Confirmar e Continuar <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 2 — Customer data */}
            {checkoutStep === 2 && (
              <form onSubmit={handleLeadSubmit}>
                <div className="form-group"><label className="form-label">Nome Completo</label><input className="form-control" required placeholder="Seu nome" value={custName} onChange={e => setCustName(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">WhatsApp (DDD + Número)</label><input className="form-control" required placeholder="(11) 99999-9999" value={custWhatsapp} onChange={e => setCustWhatsapp(maskPhone(e.target.value))} /></div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">E-mail para entrega</label><input className="form-control" type="email" required placeholder="seu@email.com" value={custEmail} onChange={e => setCustEmail(e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">CPF (Emissão do Pix)</label><input className="form-control" required placeholder="000.000.000-00" value={custCpf} onChange={e => setCustCpf(maskCpf(e.target.value))} /></div>
                </div>
                {paymentError && <div style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: 10, borderRadius: 8, fontSize: "0.85rem", marginBottom: 15 }}>{paymentError}</div>}
                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setCheckoutStep(1)} disabled={paymentLoading}>Voltar</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={paymentLoading}>
                    {paymentLoading ? "Gerando Pix..." : "Confirmar e Ir para Pagamento"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3 — PIX */}
            {checkoutStep === 3 && (
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 20 }}>
                  Escaneie o QR Code ou copie a chave Pix. Pagamento processado com segurança pela Dice.
                </p>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <div style={{ background: "white", padding: 12, borderRadius: 12 }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`} alt="QR Code" style={{ display: "block", width: 200, height: 200 }} />
                  </div>
                </div>
                <div className="glass-card" style={{ padding: 12, background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-color)", borderRadius: 8, marginBottom: 20 }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 5, textTransform: "uppercase", fontWeight: 700 }}>Código Pix Copia e Cola</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input readOnly value={pixCode} style={{ flex: 1, background: "none", border: "none", color: "white", fontSize: "0.78rem", outline: "none" }} />
                    <button onClick={() => { navigator.clipboard?.writeText(pixCode); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-color)", padding: "6px 10px", borderRadius: 6, cursor: "pointer", color: "white", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}>
                      <Copy size={12} /> {isCopied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 — Success + PDF */}
            {checkoutStep === 4 && (
              <div style={{ textAlign: "center", padding: "20px 10px" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid var(--color-success)", color: "var(--color-success)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", marginBottom: 20 }}>✓</div>
                <h4 style={{ fontSize: "1.5rem", marginBottom: 10 }}>Garantia de Exclusividade Ativada!</h4>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 20 }}>
                  Pagamento de <strong>{fmt(successTotal)}</strong> aprovado com sucesso! As modelos <strong>{successModelNames.join(", ")}</strong> foram vinculadas à sua licença e removidas da vitrine pública.
                </p>

                <div className="glass-card" style={{ marginBottom: 20, padding: 20, border: "1px solid rgba(236,72,153,0.3)", background: "rgba(236,72,153,0.04)", textAlign: "left", boxShadow: "0 4px 15px rgba(236,72,153,0.1)" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: "2.5rem" }}>📚</span>
                    <div>
                      <h5 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#f472b6", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Manual Completo — Do Acervo à Primeira Venda
                      </h5>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0 0 14px", lineHeight: 1.5 }}>
                        Seus links de acesso estão aqui dentro. O manual também tem o passo a passo para fazer a primeira venda ainda hoje, o cupom <strong>tel050</strong> (50% OFF no Privacy Painel Pro) e o guia de como usar as imagens com IA.
                      </p>
                      <button
                        onClick={() => generatePDF(models.filter(m => successModelNames.includes(m.name)))}
                        className="btn btn-primary"
                        style={{ background: "linear-gradient(135deg,#ec4899,#d946ef)", border: "none", display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800 }}
                      >
                        <Layers size={18} /> 📥 Gerar e Baixar PDF com Todos os Links
                      </button>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: 15, textAlign: "left", fontSize: "0.85rem", marginBottom: 20, borderColor: "rgba(16,185,129,0.3)" }}>
                  <strong>Próximos Passos:</strong>
                  <ul style={{ paddingLeft: 15, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                    <li>1. O link com a pasta completa foi enviado para o WhatsApp <strong>{custWhatsapp}</strong>.</li>
                    <li>2. Cópia do contrato de direitos autorais enviada para <strong>{custEmail}</strong>.</li>
                    <li>3. Atualizações semanais de mídia serão enviadas no mesmo contato.</li>
                    {upsell2Active && <li style={{ color: "#ec4899", fontWeight: 600 }}>🌟 Acesso ao Painel Privacy VIP liberado!</li>}
                  </ul>
                </div>

                <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setModelToUnlock(null)}>Concluir e Voltar ao Catálogo</button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* BACK REDIRECT POPUP */}
      {showBackPopup && (
        <div className="back-redirect-popup">
          <button className="back-popup-close" onClick={closeBackPopup}>×</button>
          <div style={{ color: "#ec4899", fontSize: "1.8rem", marginBottom: 10 }}>💝</div>
          <h3 style={{ fontSize: "1.2rem", marginBottom: 6 }}>Espera! Não Vá Embora Ainda...</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: 15 }}>Adquira os direitos de uma de nossas modelos com desconto especial!</p>
          <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => {
            closeBackPopup();
            const available = models.find(m => m.isAvailable);
            if (available) openCheckout(available);
          }}>Aproveitar Desconto</button>
        </div>
      )}

      {/* CATALOG */}
      <div className="vitrine-container">
        <header className="app-header">
          <div className="logo-container">
            <div className="logo-icon">🔥</div>
            <span className="logo-text">Modelo Que Vende</span>
            <span className="logo-tag">ELITE VIP</span>
          </div>
          <a href="#admin" style={{ display: "none" }}>Admin</a>
        </header>

        <section className="hero-section">
          <div className="copy-badge"><Sparkles size={14} /> Mais de 200 Modelos Exclusivas · Licença Única</div>
          <h1 className="hero-title">Mais de 200 Modelos <span>À Venda</span></h1>
          <p className="hero-subtitle">
            Modelos exclusivas e validadas prontas para implantação rápida. Ao comprar, você adquire a licença de uso exclusiva do acervo completo — e a modelo é <strong>imediatamente retirada da vitrine</strong> para sempre.
          </p>
        </section>

        {/* Banner — 2ª modelo 50% OFF */}
        <div style={{ maxWidth: 860, margin: "0 auto 28px", background: "linear-gradient(135deg, rgba(236,72,153,0.12), rgba(217,70,239,0.08))", border: "1px solid rgba(236,72,153,0.35)", borderRadius: 14, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: "2rem" }}>🔥</span>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: "1rem", color: "#f9a8d4" }}>A 2ª modelo sai pela metade do preço</p>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#94a3b8" }}>Adicione uma segunda modelo no carrinho e pague 50% menos. Ofertas exclusivas · disponibilidade limitada.</p>
            </div>
          </div>
          <div style={{ background: "rgba(236,72,153,0.15)", border: "1px dashed rgba(236,72,153,0.5)", borderRadius: 8, padding: "8px 16px", textAlign: "center", whiteSpace: "nowrap" }}>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Desconto automático</p>
            <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, color: "#ec4899" }}>50% OFF</p>
          </div>
        </div>

        <div style={{ maxWidth: 560, margin: "0 auto 24px", position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input type="text" placeholder="Buscar modelo..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="form-control" style={{ paddingLeft: 46, borderRadius: 100 }} />
        </div>

        <div className="category-bar">
          {categories.map(c => (
            <button key={c} className={`category-tab${selectedCategory === c ? " active" : ""}`} onClick={() => setSelectedCategory(c)}>{c}</button>
          ))}
        </div>

        <div className="model-grid">
          {filteredModels.slice(0, visibleCount).map(model => {
            const fp = discountedPrice(model);
            return (
              <div key={model.id} className={`model-card${model.isFeatured ? " featured" : ""}`} style={{ opacity: model.isAvailable ? 1 : 0.8 }}
                onMouseEnter={() => setHoveredCard(model.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {model.isFeatured && <span className="model-badge">Destaque Elite</span>}
                {model.discountPercentage > 0 && <span className="discount-badge">-{model.discountPercentage}% OFF</span>}
                {!model.isAvailable && <span className="model-badge" style={{ background: "#ef4444", left: "auto", right: 15 }}>Vendida</span>}

                <div className="model-card-image-container">
                  <img
                    src={cardActiveImages[model.id] || model.cover}
                    alt={model.name}
                    className="model-card-img"
                    loading="lazy"
                    decoding="async"
                    style={{ filter: model.isAvailable ? "none" : "grayscale(0.8) brightness(0.5)" }}
                    onError={e => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(model.name)}&backgroundColor=ec4899`; }}
                  />
                  {hoveredCard === model.id && model.gallery && model.gallery.length > 0 && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", display: "flex", gap: 5, padding: "8px 10px", overflowX: "auto", background: "linear-gradient(to top,rgba(15,15,21,0.95) 60%,rgba(15,15,21,0))", zIndex: 3, scrollbarWidth: "none" }} className="card-thumbnails-overlay">
                      {model.gallery.map((img, i) => (
                        <img key={i} src={img} alt="" loading="lazy" decoding="async"
                          onClick={e => { e.stopPropagation(); setCardActiveImages(p => ({ ...p, [model.id]: img })); }}
                          onMouseEnter={() => setCardActiveImages(p => ({ ...p, [model.id]: img }))}
                          style={{ width: 36, height: 36, borderRadius: 4, objectFit: "cover", cursor: "pointer", flexShrink: 0, border: (cardActiveImages[model.id] || model.cover) === img ? "2px solid #ec4899" : "1px solid rgba(255,255,255,0.2)", opacity: (cardActiveImages[model.id] || model.cover) === img ? 1 : 0.6, transition: "all 0.15s ease" }} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="model-card-content">
                  <h3 className="model-card-title">{model.name}</h3>
                  <div className="model-card-meta">
                    <span><Camera size={14} /> {model.photosCount.toLocaleString()} Fotos</span>
                    <span><Play size={14} /> {minVideos(model.videosCount).toLocaleString()}+ Vídeos</span>
                    <span><Eye size={14} /> {model.views.toLocaleString()} acessos</span>
                  </div>
                  <p className="model-card-description">{model.description}</p>
                  <div className="model-tags">
                    {model.categories.map(c => <span key={c} className="model-tag">{c}</span>)}
                    <span className="model-tag" style={{ borderColor: "rgba(236,72,153,0.3)", color: "#fbcfe8" }}>Apenas 1 licença</span>
                  </div>
                  <div className="model-price-container">
                    <div className="price-block">
                      {model.discountPercentage > 0 && <span className="old-price">R$ {model.price.toFixed(2)}</span>}
                      <span className="new-price">R$ {fp.toFixed(2)}</span>
                    </div>
                    {model.isAvailable ? (
                      <button className="btn btn-primary" onClick={() => openCheckout(model)}>
                        Adquirir Direitos <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button className="btn" disabled style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", cursor: "not-allowed" }}>
                        <Lock size={14} /> Vendida
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {visibleCount < filteredModels.length && (
          <div style={{ textAlign: "center", marginTop: 32, marginBottom: 8 }}>
            <button
              className="btn btn-secondary"
              style={{ padding: "12px 40px", fontSize: "0.95rem", borderRadius: 100 }}
              onClick={() => setVisibleCount(v => v + 24)}
            >
              Carregar Mais ({filteredModels.length - visibleCount} restantes)
            </button>
          </div>
        )}

        <footer className="app-footer">
          <p>© 2026 Modelo Que Vende · Conteúdo exclusivo para maiores de 18 anos</p>
        </footer>
      </div>
    </>
  );
}
