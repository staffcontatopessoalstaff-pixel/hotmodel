import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles, CheckCircle, ArrowRight, Copy, Lock, Search,
  LayoutGrid, LogOut, Users, DollarSign, TrendingUp, ShoppingBag,
  Trash2, Edit2, Plus, X, Eye, ChevronLeft, Shield, Star, Play,
} from "lucide-react";
import {
  initializeStorage, getModels, addModel, updateModel, deleteModel,
  getLeads, addLead, getTransactions, addTransaction, getStats, getAdminUser,
} from "./mockDb";
import type { Model, Lead, Transaction } from "./mockDb";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type View = "catalog" | "detail" | "checkout" | "pix" | "success" | "admin-login" | "admin";
type AdminTab = "overview" | "models" | "leads" | "transactions";
const CATEGORIES = ["Todas", "Premium", "VIP", "Loiras", "Morenas", "Cosplayer"];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const finalPrice = (m: Model) =>
  m.discountPercentage > 0 ? m.price * (1 - m.discountPercentage / 100) : m.price;

const formatMoney = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length > 10) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length > 6) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return d;
}

function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length > 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`;
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// AgeGate
// ─────────────────────────────────────────────────────────────────────────────
function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content age-modal">
        <div className="age-icon">18+</div>
        <h2 className="modal-title">Conteúdo adulto</h2>
        <p className="modal-desc">
          Este site contém conteúdo exclusivo para maiores de 18 anos. Confirme que você tem 18 anos ou mais para continuar.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button className="btn btn-primary" onClick={onConfirm}>
            Tenho 18 anos ou mais — Entrar
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => (window.location.href = "https://google.com")}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ModelCard
// ─────────────────────────────────────────────────────────────────────────────
function ModelCard({ model, onView }: { model: Model; onView: () => void }) {
  const fp = finalPrice(model);
  return (
    <div className={`model-card${model.isFeatured ? " featured" : ""}`} onClick={onView}>
      <div className="model-card-image-container">
        <img
          src={model.cover}
          alt={model.name}
          className="model-card-img"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(model.name)}&backgroundColor=ec4899`;
          }}
        />
        {model.categories.includes("VIP") && (
          <span className="model-badge">
            <Star size={10} style={{ display: "inline", marginRight: 3 }} />VIP
          </span>
        )}
        {model.discountPercentage > 0 && (
          <span className="discount-badge">-{model.discountPercentage}%</span>
        )}
      </div>
      <div className="model-card-content">
        <h3 className="model-card-title">{model.name}</h3>
        <div className="model-card-meta">
          <span><Eye size={12} /> {model.views.toLocaleString()} views</span>
          <span>📷 {model.photosCount.toLocaleString()} fotos</span>
          {model.videosCount > 0 && <span><Play size={12} /> {model.videosCount} vídeos</span>}
        </div>
        <p className="model-card-description">{model.description}</p>
        <div className="model-tags">
          {model.categories.map((c) => (
            <span key={c} className="model-tag">{c}</span>
          ))}
        </div>
        <div className="model-price-container">
          <div className="price-block">
            {model.discountPercentage > 0 && (
              <span className="old-price">{formatMoney(model.price)}</span>
            )}
            <span className="new-price">{formatMoney(fp)}</span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.stopPropagation(); onView(); }}
          >
            Ver Perfil <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Catalog
// ─────────────────────────────────────────────────────────────────────────────
function Catalog({
  onSelectModel,
  onAdminClick,
}: {
  onSelectModel: (m: Model) => void;
  onAdminClick: () => void;
}) {
  const [models, setModels] = useState<Model[]>([]);
  const [category, setCategory] = useState("Todas");
  const [search, setSearch] = useState("");

  useEffect(() => {
    initializeStorage();
    setModels(getModels().filter((m) => m.isAvailable));
  }, []);

  const filtered = useMemo(() => {
    return models.filter((m) => {
      const matchCat = category === "Todas" || m.categories.includes(category);
      const matchSearch =
        search === "" || m.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [models, category, search]);

  const featured = filtered.filter((m) => m.isFeatured);
  const rest = filtered.filter((m) => !m.isFeatured);

  return (
    <div className="vitrine-container">
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">🔥</div>
          <span className="logo-text">hotmodel2026</span>
          <span className="logo-tag">ACERVO VIP</span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onAdminClick}>
          <Lock size={14} /> Admin
        </button>
      </header>

      <section className="hero-section">
        <div className="copy-badge">
          <Sparkles size={14} /> Acervo verificado · Acesso vitalício
        </div>
        <h1 className="hero-title">
          Os melhores <span>acervos exclusivos</span> do mercado
        </h1>
        <p className="hero-subtitle">
          Escolha sua modelo favorita e acesse fotos e vídeos premium com download imediato após o pagamento via Pix.
        </p>
      </section>

      <div style={{ maxWidth: 560, margin: "0 auto 30px", position: "relative" }}>
        <Search
          size={18}
          style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
        />
        <input
          type="text"
          placeholder="Buscar modelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          style={{ paddingLeft: 46, borderRadius: 100 }}
        />
      </div>

      <div className="category-bar">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`category-tab${category === c ? " active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#64748b" }}>
          <p>Nenhuma modelo encontrada com esses filtros.</p>
        </div>
      ) : (
        <div className="model-grid">
          {featured.map((m) => (
            <ModelCard key={m.id} model={m} onView={() => onSelectModel(m)} />
          ))}
          {rest.map((m) => (
            <ModelCard key={m.id} model={m} onView={() => onSelectModel(m)} />
          ))}
        </div>
      )}

      <footer className="app-footer">
        <p>© 2026 hotmodel2026 · Conteúdo exclusivo para maiores de 18 anos</p>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ModelDetail
// ─────────────────────────────────────────────────────────────────────────────
function ModelDetail({
  model,
  onBuy,
  onBack,
}: {
  model: Model;
  onBuy: () => void;
  onBack: () => void;
}) {
  const fp = finalPrice(model);
  const [currentImg, setCurrentImg] = useState(model.cover);

  return (
    <div className="vitrine-container" style={{ paddingTop: 20 }}>
      <button
        className="btn btn-secondary btn-sm"
        onClick={onBack}
        style={{ marginBottom: 24 }}
      >
        <ChevronLeft size={16} /> Voltar ao catálogo
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,400px)",
          gap: 40,
          alignItems: "start",
        }}
      >
        {/* Gallery */}
        <div>
          <div
            style={{
              borderRadius: 20,
              overflow: "hidden",
              background: "#0f0f15",
              aspectRatio: "3/4",
              maxHeight: 520,
            }}
          >
            <img
              src={currentImg}
              alt={model.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(model.name)}&backgroundColor=ec4899`;
              }}
            />
          </div>
          {model.gallery && model.gallery.length > 0 && (
            <div className="gallery-grid" style={{ marginTop: 16 }}>
              {[model.cover, ...model.gallery].map((img, i) => (
                <div
                  key={i}
                  className="gallery-item"
                  onClick={() => setCurrentImg(img)}
                  style={{
                    cursor: "pointer",
                    border: currentImg === img ? "2px solid #ec4899" : "2px solid transparent",
                    borderRadius: 8,
                  }}
                >
                  <img src={img} alt="" onError={(e) => { (e.target as HTMLImageElement).src = model.cover; }} />
                  {i > 0 && (
                    <div className="gallery-overlay-blur">
                      <Lock size={20} color="#ec4899" />
                      <p style={{ color: "#ec4899", fontSize: "0.75rem", marginTop: 6, fontWeight: 700 }}>
                        Conteúdo bloqueado
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info + CTA */}
        <div className="glass-card" style={{ position: "sticky", top: 20 }}>
          <div className="model-tags" style={{ marginBottom: 12 }}>
            {model.categories.map((c) => (
              <span key={c} className="model-tag">{c}</span>
            ))}
          </div>
          <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>{model.name}</h1>
          <p style={{ color: "#94a3b8", marginBottom: 20, lineHeight: 1.6 }}>
            {model.description}
          </p>

          <div
            style={{
              display: "flex",
              gap: 24,
              marginBottom: 20,
              padding: "16px 0",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div>
              <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Fotos</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>📷 {model.photosCount.toLocaleString()}</div>
            </div>
            {model.videosCount > 0 && (
              <div>
                <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Vídeos</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>🎬 {model.videosCount}</div>
              </div>
            )}
            <div>
              <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Garantia</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>🔒 {model.returnDays}d</div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            {model.discountPercentage > 0 && (
              <div style={{ color: "#94a3b8", fontSize: "0.9rem", textDecoration: "line-through" }}>
                De {formatMoney(model.price)}
              </div>
            )}
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#fff" }}>
              {formatMoney(fp)}
            </div>
            {model.discountPercentage > 0 && (
              <div style={{ color: "#10b981", fontSize: "0.85rem", fontWeight: 700 }}>
                Economia de {formatMoney(model.price - fp)} ({model.discountPercentage}% OFF)
              </div>
            )}
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", padding: "16px", fontSize: "1.1rem", marginBottom: 12 }}
            onClick={onBuy}
          >
            Comprar agora · Pix <ArrowRight size={20} />
          </button>
          <div style={{ display: "flex", gap: 8, fontSize: "0.75rem", color: "#64748b", justifyContent: "center" }}>
            <span>✓ Acesso imediato</span>
            <span>·</span>
            <span>✓ Pix seguro</span>
            <span>·</span>
            <span>✓ Garantia {model.returnDays} dias</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkout (Lead + PIX)
// ─────────────────────────────────────────────────────────────────────────────
function Checkout({
  model,
  onBack,
  onSuccess,
}: {
  model: Model;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const fp = finalPrice(model);
  const [step, setStep] = useState<"form" | "pix">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [copied, setCopied] = useState(false);

  // Poll for payment
  useEffect(() => {
    if (step !== "pix" || !paymentId) return;
    let mounted = true;
    const iv = setInterval(async () => {
      try {
        const r = await fetch(`/api/verificar-pagamento?id=${paymentId}`);
        if (!r.ok) return;
        const d = await r.json();
        if (d.ok && d.status === "COMPLETED" && mounted) {
          clearInterval(iv);
          addTransaction({
            customerName: name,
            customerEmail: email,
            modelName: model.name,
            amount: fp,
            status: "Aprovado",
          });
          onSuccess();
        }
      } catch {}
    }, 4000);
    return () => { mounted = false; clearInterval(iv); };
  }, [step, paymentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !cpf) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: name,
          email,
          tel: phone.replace(/\D/g, ""),
          cpf: cpf.replace(/\D/g, ""),
          productName: `hotmodel2026 - ${model.name}`,
          total: fp,
        }),
      });
      const ct = r.headers.get("content-type");
      if (!ct?.includes("application/json")) throw new Error("Resposta inválida do servidor.");
      const d = await r.json();
      if (d.ok) {
        addLead({ name, whatsapp: phone, email, modelId: model.id, modelName: model.name });
        setPixCode(d.qr_code_text);
        setPaymentId(d.payment_id || "");
        setStep("pix");
      } else {
        setError(d.erro || "Erro ao gerar Pix.");
      }
    } catch (e: any) {
      setError(e.message || "Erro de conexão.");
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard?.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === "pix") {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: 440 }}>
          <h2 className="modal-title">Pagamento Gerado!</h2>
          <p className="modal-desc" style={{ marginBottom: 20 }}>
            Pague via Pix e o acesso ao acervo de <strong>{model.name}</strong> será liberado automaticamente.
          </p>
          <div style={{ background: "#fff", padding: 16, borderRadius: 12, display: "inline-block", marginBottom: 20 }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`}
              alt="QR Code"
            />
          </div>
          <div className="pix-code-box" style={{ marginBottom: 20 }}>
            <div className="pix-code-text" style={{
              background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: 12, fontSize: "0.75rem", wordBreak: "break-all",
              color: "#94a3b8", marginBottom: 8,
            }}>{pixCode}</div>
            <button className="btn btn-secondary" onClick={copy} style={{ width: "100%" }}>
              {copied ? <><CheckCircle size={16} /> Copiado!</> : <><Copy size={16} /> Copiar código Pix</>}
            </button>
          </div>
          <div style={{
            padding: 14, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 8, color: "#34d399", display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem",
          }}>
            <div className="spinner" style={{ width: 16, height: 16, border: "2px solid rgba(52,211,153,0.3)", borderTopColor: "#34d399", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
            Aguardando confirmação do pagamento...
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 500, textAlign: "left" }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ marginBottom: 20 }}>
          <ChevronLeft size={14} /> Voltar
        </button>
        <h2 className="modal-title">Garantir acesso — {model.name}</h2>

        <div style={{
          background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10, padding: 16, marginBottom: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", marginBottom: 6 }}>
            <span>Acervo {model.name}</span>
            {model.discountPercentage > 0 && (
              <span style={{ textDecoration: "line-through" }}>{formatMoney(model.price)}</span>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem" }}>
            <span>Total (Pix)</span>
            <span style={{ color: "#10b981" }}>{formatMoney(fp)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <input className="form-control" type="text" required placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input className="form-control" type="email" required placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp</label>
            <input className="form-control" type="text" required placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">CPF</label>
            <input className="form-control" type="text" required placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} />
          </div>
          {error && (
            <div style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: 10, borderRadius: 8, marginBottom: 16, fontSize: "0.9rem" }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "15px", fontSize: "1rem" }} disabled={loading}>
            {loading ? "Gerando Pix..." : `Pagar ${formatMoney(fp)} via Pix`}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Success
// ─────────────────────────────────────────────────────────────────────────────
function Success({ model, onBack }: { model: Model; onBack: () => void }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: "center" }}>
        <div style={{
          width: 80, height: 80, background: "rgba(16,185,129,0.15)", color: "#10b981",
          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <CheckCircle size={40} />
        </div>
        <h2 className="modal-title">Pagamento Aprovado!</h2>
        <p className="modal-desc">
          Seu acesso ao acervo de <strong>{model.name}</strong> foi liberado!
        </p>
        {model.delivery_links && model.delivery_links.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            {model.delivery_links.map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ display: "flex", textDecoration: "none", marginBottom: 10 }}
              >
                Acessar Conteúdo <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </a>
            ))}
          </div>
        )}
        <button className="btn btn-secondary" onClick={onBack}>Voltar ao catálogo</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Login
// ─────────────────────────────────────────────────────────────────────────────
function AdminLogin({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = getAdminUser();
    if (pass === admin.passwordHash) {
      sessionStorage.setItem("hm_admin", "1");
      onSuccess();
    } else {
      setError("Senha incorreta.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon" style={{ fontSize: "1.8rem", width: 56, height: 56 }}>🔥</div>
          <div className="logo-text" style={{ fontSize: "1.8rem" }}>hotmodel2026</div>
          <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Painel Administrativo</span>
        </div>
        <div className="glass-card">
          <form onSubmit={handle}>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                className="form-control" type="password" required
                placeholder="••••••••" value={pass} onChange={(e) => setPass(e.target.value)}
              />
            </div>
            {error && (
              <div style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: 12 }}>{error}</div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              <Shield size={16} /> Entrar
            </button>
          </form>
          <button className="btn btn-secondary" style={{ width: "100%", marginTop: 10 }} onClick={onBack}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Dashboard
// ─────────────────────────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [models, setModels] = useState<Model[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editModel, setEditModel] = useState<Model | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const refresh = () => {
    setModels(getModels());
    setLeads(getLeads());
    setTransactions(getTransactions());
  };

  useEffect(() => { initializeStorage(); refresh(); }, []);

  const stats = useMemo(() => getStats(), [transactions]);

  const filteredModels = useMemo(() =>
    models.filter((m) => search === "" || m.name.toLowerCase().includes(search.toLowerCase())),
    [models, search]
  );

  const handleDeleteModel = (id: string) => {
    if (!confirm("Apagar esta modelo?")) return;
    deleteModel(id);
    refresh();
  };

  const handleDeleteLead = (id: string) => {
    const leads = JSON.parse(localStorage.getItem("hotmodel_leads") || "[]");
    localStorage.setItem("hotmodel_leads", JSON.stringify(leads.filter((l: Lead) => l.id !== id)));
    refresh();
  };

  const nav = [
    { key: "overview", label: "Visão Geral", icon: <LayoutGrid size={18} /> },
    { key: "models", label: "Modelos", icon: <Users size={18} /> },
    { key: "leads", label: "Leads", icon: <TrendingUp size={18} /> },
    { key: "transactions", label: "Transações", icon: <DollarSign size={18} /> },
  ] as const;

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="logo-container">
            <div className="logo-icon" style={{ fontSize: "1.1rem", width: 32, height: 32 }}>🔥</div>
            <span className="logo-text" style={{ fontSize: "1.1rem" }}>hotmodel</span>
          </div>
        </div>
        <nav className="admin-nav">
          {nav.map((n) => (
            <button
              key={n.key}
              className={`admin-nav-item${tab === n.key ? " active" : ""}`}
              onClick={() => setTab(n.key)}
            >
              {n.icon} {n.label}
            </button>
          ))}
        </nav>
        <div className="admin-logout">
          <button className="admin-nav-item" onClick={onLogout} style={{ width: "100%" }}>
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {/* Overview */}
        {tab === "overview" && (
          <>
            <div className="admin-header">
              <div className="admin-title-group">
                <h1>Visão Geral</h1>
                <p>Resumo do desempenho do catálogo</p>
              </div>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-title">Receita Total</div>
                <div className="stat-card-value">{formatMoney(stats.totalRevenue)}</div>
                <div className="stat-card-footer"><ShoppingBag size={12} /> Vendas aprovadas</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">Vendas Aprovadas</div>
                <div className="stat-card-value">{stats.approvedSales}</div>
                <div className="stat-card-footer"><CheckCircle size={12} /> Confirmadas</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">Leads Capturados</div>
                <div className="stat-card-value">{stats.totalLeads}</div>
                <div className="stat-card-footer neutral"><TrendingUp size={12} /> Total</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">Taxa de Conversão</div>
                <div className="stat-card-value">{stats.conversionRate.toFixed(1)}%</div>
                <div className="stat-card-footer neutral"><TrendingUp size={12} /> Leads → Vendas</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">Modelos no Catálogo</div>
                <div className="stat-card-value">{models.length}</div>
                <div className="stat-card-footer neutral"><Users size={12} /> Cadastradas</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">Pendentes</div>
                <div className="stat-card-value">{stats.pendingSales}</div>
                <div className="stat-card-footer" style={{ color: "#f59e0b" }}>⏳ Aguardando</div>
              </div>
            </div>
          </>
        )}

        {/* Models */}
        {tab === "models" && (
          <>
            <div className="admin-header">
              <div className="admin-title-group">
                <h1>Modelos</h1>
                <p>{models.length} modelos no catálogo</p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { setEditModel(null); setShowForm(true); }}
              >
                <Plus size={16} /> Adicionar
              </button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <input
                className="form-control"
                placeholder="Buscar modelo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="table-card">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Modelo</th>
                      <th>Preço</th>
                      <th>Desconto</th>
                      <th>Categorias</th>
                      <th>Views</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModels.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <img
                              src={m.cover}
                              alt={m.name}
                              style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", background: "#1e1e2d" }}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                            <span style={{ fontWeight: 600 }}>{m.name}</span>
                          </div>
                        </td>
                        <td>{formatMoney(m.price)}</td>
                        <td>{m.discountPercentage > 0 ? `${m.discountPercentage}%` : "-"}</td>
                        <td>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {m.categories.map((c) => <span key={c} className="model-tag">{c}</span>)}
                          </div>
                        </td>
                        <td>{m.views.toLocaleString()}</td>
                        <td>
                          <span className={`badge-status ${m.isAvailable ? "approved" : "canceled"}`}>
                            {m.isAvailable ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => { setEditModel(m); setShowForm(true); }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteModel(m.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Leads */}
        {tab === "leads" && (
          <>
            <div className="admin-header">
              <div className="admin-title-group">
                <h1>Leads</h1>
                <p>{leads.length} leads capturados</p>
              </div>
            </div>
            <div className="table-card">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>WhatsApp</th>
                      <th>Modelo Interesse</th>
                      <th>Data</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr key={l.id}>
                        <td>{l.name}</td>
                        <td>{l.email}</td>
                        <td>{l.whatsapp}</td>
                        <td>{l.modelName}</td>
                        <td>{new Date(l.createdAt).toLocaleDateString("pt-BR")}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLead(l.id)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>Nenhum lead ainda.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Transactions */}
        {tab === "transactions" && (
          <>
            <div className="admin-header">
              <div className="admin-title-group">
                <h1>Transações</h1>
                <p>{transactions.length} transações registradas</p>
              </div>
            </div>
            <div className="table-card">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>E-mail</th>
                      <th>Modelo</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id}>
                        <td>{t.customerName}</td>
                        <td>{t.customerEmail}</td>
                        <td>{t.modelName}</td>
                        <td>{formatMoney(t.amount)}</td>
                        <td>
                          <span className={`badge-status ${t.status === "Aprovado" ? "approved" : t.status === "Pendente" ? "pending" : "canceled"}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>{new Date(t.createdAt).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>Nenhuma transação ainda.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Model Form Modal */}
      {showForm && (
        <ModelFormModal
          model={editModel}
          onClose={() => { setShowForm(false); setEditModel(null); }}
          onSave={() => { setShowForm(false); setEditModel(null); refresh(); }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Model Form Modal
// ─────────────────────────────────────────────────────────────────────────────
function ModelFormModal({
  model,
  onClose,
  onSave,
}: {
  model: Model | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState<Partial<Model>>(
    model || {
      name: "", cover: "", description: "", price: 50, discountPercentage: 0,
      buyLink: "", categories: ["Premium"], photosCount: 0, videosCount: 0,
      isFeatured: false, isAvailable: true, returnDays: 14, views: 0, earnings: 0,
      gallery: [], delivery_links: [],
    }
  );

  const set = (k: keyof Model, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (model) {
      updateModel({ ...model, ...form } as Model);
    } else {
      addModel(form as Omit<Model, "id" | "views" | "earnings">);
    }
    onSave();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div
        className="modal-content"
        style={{ maxWidth: 640, maxHeight: "90vh", overflowY: "auto", textAlign: "left" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 className="modal-title" style={{ margin: 0 }}>
            {model ? "Editar Modelo" : "Nova Modelo"}
          </h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Nome</label>
              <input className="form-control" required value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="form-group full-width">
              <label className="form-label">URL da Capa</label>
              <input className="form-control" value={form.cover || ""} onChange={(e) => set("cover", e.target.value)} placeholder="/models/Nome/cover.jpg" />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Descrição</label>
              <input className="form-control" value={form.description || ""} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Preço (R$)</label>
              <input className="form-control" type="number" step="0.01" value={form.price || 0} onChange={(e) => set("price", parseFloat(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Desconto (%)</label>
              <input className="form-control" type="number" min="0" max="100" value={form.discountPercentage || 0} onChange={(e) => set("discountPercentage", parseInt(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Fotos</label>
              <input className="form-control" type="number" value={form.photosCount || 0} onChange={(e) => set("photosCount", parseInt(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Vídeos</label>
              <input className="form-control" type="number" value={form.videosCount || 0} onChange={(e) => set("videosCount", parseInt(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Garantia (dias)</label>
              <input className="form-control" type="number" value={form.returnDays || 14} onChange={(e) => set("returnDays", parseInt(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Link de Entrega</label>
              <input className="form-control" value={(form.delivery_links || [])[0] || ""} onChange={(e) => set("delivery_links", [e.target.value])} placeholder="https://mega.nz/..." />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Categorias (vírgula)</label>
              <input
                className="form-control"
                value={(form.categories || []).join(", ")}
                onChange={(e) => set("categories", e.target.value.split(",").map((c) => c.trim()).filter(Boolean))}
                placeholder="Premium, Loiras, VIP"
              />
            </div>
            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" id="featured" checked={!!form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
              <label htmlFor="featured" className="form-label" style={{ margin: 0 }}>Destaque</label>
            </div>
            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" id="available" checked={!!form.isAvailable} onChange={(e) => set("isAvailable", e.target.checked)} />
              <label htmlFor="available" className="form-label" style={{ margin: 0 }}>Disponível</label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {model ? "Salvar alterações" : "Adicionar modelo"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App (Main Router)
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [ageOk, setAgeOk] = useState(() => !!localStorage.getItem("hm_age"));
  const [view, setView] = useState<View>("catalog");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [adminAuth, setAdminAuth] = useState(() => !!sessionStorage.getItem("hm_admin"));

  const confirmAge = () => {
    localStorage.setItem("hm_age", "1");
    setAgeOk(true);
  };

  const selectModel = (m: Model) => {
    setSelectedModel(m);
    setView("detail");
  };

  const goBack = () => {
    setView("catalog");
    setSelectedModel(null);
  };

  if (!ageOk) return <AgeGate onConfirm={confirmAge} />;

  if (view === "admin-login") {
    return (
      <AdminLogin
        onSuccess={() => { setAdminAuth(true); setView("admin"); }}
        onBack={() => setView("catalog")}
      />
    );
  }

  if (view === "admin" && adminAuth) {
    return (
      <AdminDashboard
        onLogout={() => {
          sessionStorage.removeItem("hm_admin");
          setAdminAuth(false);
          setView("catalog");
        }}
      />
    );
  }

  if (view === "success" && selectedModel) {
    return <Success model={selectedModel} onBack={goBack} />;
  }

  if ((view === "checkout" || view === "pix") && selectedModel) {
    return (
      <>
        <Catalog onSelectModel={selectModel} onAdminClick={() => setView("admin-login")} />
        <Checkout
          model={selectedModel}
          onBack={() => setView("detail")}
          onSuccess={() => setView("success")}
        />
      </>
    );
  }

  if (view === "detail" && selectedModel) {
    return (
      <>
        <div className="glow-bg">
          <div className="glow-circle glow-1"></div>
          <div className="glow-circle glow-2"></div>
        </div>
        <ModelDetail
          model={selectedModel}
          onBuy={() => setView("checkout")}
          onBack={goBack}
        />
      </>
    );
  }

  return (
    <>
      <div className="glow-bg">
        <div className="glow-circle glow-1"></div>
        <div className="glow-circle glow-2"></div>
      </div>
      <Catalog
        onSelectModel={selectModel}
        onAdminClick={() => setView(adminAuth ? "admin" : "admin-login")}
      />
    </>
  );
}
