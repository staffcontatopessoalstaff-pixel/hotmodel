import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Copy,
  Smartphone
} from 'lucide-react';

function App() {
  // Checkout Multi-Step Form State
  const [checkoutStep, setCheckoutStep] = useState<number>(0); // 0 = landing, 1 = form, 2 = pix, 3 = success

  // Customer details input
  const [custName, setCustName] = useState('');
  const [custWhatsapp, setCustWhatsapp] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custCpf, setCustCpf] = useState('');

  // Payment states
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [pixCode, setPixCode] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  const TEMPLATE_PRICE = 49.90;

  // Poll transaction status dynamically using Dice API
  useEffect(() => {
    if (checkoutStep !== 2 || !paymentId) return;

    let intervalId: any;
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/verificar-pagamento?id=${paymentId}`);
        if (!response.ok) return;

        const data = await response.json();
        if (data.ok && data.status === 'COMPLETED' && isMounted) {
          clearInterval(intervalId);
          setCheckoutStep(3);
        }
      } catch (err) {
        console.error('Erro ao verificar status do pagamento:', err);
      }
    };

    intervalId = setInterval(checkStatus, 4000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [checkoutStep, paymentId]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!custName.trim() || !custEmail.trim() || !custWhatsapp.trim() || !custCpf.trim()) {
      setPaymentError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setPaymentLoading(true);
    setPaymentError('');

    const prodName = `Template Privacy Fake VIP`;

    try {
      const response = await fetch('/api/criar-pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: custName,
          email: custEmail,
          tel: custWhatsapp.replace(/\D/g, ''),
          cpf: custCpf.replace(/\D/g, ''),
          productName: prodName,
          total: TEMPLATE_PRICE
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('O servidor retornou uma resposta inválida.');
      }

      const data = await response.json();
      setPaymentLoading(false);

      if (data.ok) {
        setPixCode(data.qr_code_text);
        setPaymentId(data.payment_id || '');
        setCheckoutStep(2); // Go to Pix display
      } else {
        setPaymentError(data.erro || 'Erro ao gerar o Pix via Dice API. Tente novamente.');
      }
    } catch (err: any) {
      setPaymentLoading(false);
      setPaymentError(err.message || 'Erro de conexão ao criar pagamento.');
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Mask formatting
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const clean = val.replace(/\D/g, '').slice(0, 11);
    if (clean.length > 10) {
      setCustWhatsapp(`(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`);
    } else if (clean.length > 6) {
      setCustWhatsapp(`(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`);
    } else if (clean.length > 2) {
      setCustWhatsapp(`(${clean.slice(0, 2)}) ${clean.slice(2)}`);
    } else {
      setCustWhatsapp(clean);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const clean = val.replace(/\D/g, '').slice(0, 11);
    if (clean.length > 9) {
      setCustCpf(`${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`);
    } else if (clean.length > 6) {
      setCustCpf(`${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`);
    } else if (clean.length > 3) {
      setCustCpf(`${clean.slice(0, 3)}.${clean.slice(3)}`);
    } else {
      setCustCpf(clean);
    }
  };

  return (
    <>
      <div className="glow-bg">
        <div className="glow-circle glow-1"></div>
        <div className="glow-circle glow-2"></div>
      </div>

      <div className="vitrine-container">
        <header className="app-header">
          <div className="logo-container">
            <div className="logo-icon">🔥</div>
            <span className="logo-text">hotmodel2026</span>
            <span className="logo-tag">TEMPLATE VIP</span>
          </div>
        </header>

        {checkoutStep === 0 && (
          <>
            <section className="hero-section">
              <div className="copy-badge">
                <Sparkles size={14} /> O Template de Maior Conversão do Mercado
              </div>
              <h1 className="hero-title">
                Template Privacy Fake <span>Completo</span> e Funcional
              </h1>
              <p className="hero-subtitle">
                O mesmo template validado usado pelos maiores players. Design perfeito, totalmente responsivo e pronto para você configurar com qualquer modelo e vender assinaturas simuladas que convertem 10x mais.
              </p>
              <div style={{ marginTop: '30px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '15px 30px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}
                  onClick={() => setCheckoutStep(1)}
                >
                  Quero o Template por apenas R$ 49,90 <ArrowRight size={20} />
                </button>
              </div>
            </section>

            {/* Preview Section com Iframe */}
            <section className="preview-section" style={{ margin: '60px auto', maxWidth: '1000px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', color: '#fff' }}>Veja o Template em Ação</h2>
              <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Navegue pelo tema real diretamente abaixo (preview interativo):</p>
              
              <div style={{ 
                background: '#1e293b', 
                padding: '15px', 
                borderRadius: '24px', 
                border: '1px solid #334155',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                margin: '0 auto',
                maxWidth: '400px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                </div>
                
                <div style={{
                  width: '100%',
                  height: '650px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#000'
                }}>
                  <iframe 
                    src="https://privacy.vercel.app/" 
                    width="100%" 
                    height="100%" 
                    frameBorder="0"
                    title="Preview do Template Privacy Fake"
                    style={{ background: '#000' }}
                  ></iframe>
                </div>
              </div>
            </section>

            <section className="glass-card" style={{ margin: '40px auto', maxWidth: '800px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#ec4899', textAlign: 'center' }}>O que está incluso no pacote?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <CheckCircle color="#10b981" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>Código Fonte Completo</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Acesso total aos arquivos do template para você hospedar onde quiser (Vercel, Hostinger, etc).</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <CheckCircle color="#10b981" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>Design Fiel ao Original</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Layout desenvolvido para ter a maior semelhança possível, gerando 100% de confiança no clique.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <CheckCircle color="#10b981" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>Integração Pronta para Checkout</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Botões de assinatura já configurados e otimizados para receber o seu link de pagamento direto.</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Formulário de Cadastro */}
        {checkoutStep === 1 && (
          <div className="checkout-modal">
            <div className="checkout-content">
              <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', textAlign: 'center' }}>
                Garantir Template VIP
              </h2>
              
              <div className="order-summary" style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#cbd5e1' }}>Template Privacy Fake Completo</span>
                  <span style={{ fontWeight: 'bold' }}>R$ {TEMPLATE_PRICE.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '10px', marginTop: '10px' }}>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>Total a pagar:</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>R$ {TEMPLATE_PRICE.toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handleLeadSubmit}>
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control" 
                    placeholder="Seu nome completo"
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">E-mail (Para receber o acesso)</label>
                  <input 
                    type="email" 
                    required 
                    className="form-control" 
                    placeholder="seu@email.com"
                    value={custEmail}
                    onChange={e => setCustEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control" 
                    placeholder="(00) 00000-0000"
                    value={custWhatsapp}
                    onChange={handleWhatsappChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CPF</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control" 
                    placeholder="000.000.000-00"
                    value={custCpf}
                    onChange={handleCpfChange}
                  />
                </div>

                {paymentError && (
                  <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '15px' }}>
                    {paymentError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '15px' }} disabled={paymentLoading}>
                    {paymentLoading ? 'Gerando Pagamento...' : 'Gerar Pix Seguro'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setCheckoutStep(0)}>
                    Voltar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PIX QR Code */}
        {checkoutStep === 2 && (
          <div className="checkout-modal">
            <div className="checkout-content" style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '10px', color: '#fff', fontSize: '1.5rem' }}>Pagamento Gerado!</h2>
              <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '0.9rem' }}>
                Copie o código abaixo e pague no aplicativo do seu banco. O acesso ao código fonte será liberado automaticamente.
              </p>
              
              <div style={{ 
                background: '#fff', 
                padding: '20px', 
                borderRadius: '12px', 
                display: 'inline-block',
                marginBottom: '20px'
              }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`} alt="QR Code Pix" />
              </div>

              <div className="pix-code-box">
                <div className="pix-code-text">{pixCode}</div>
                <button className="btn btn-secondary" onClick={copyToClipboard} style={{ width: '100%' }}>
                  {isCopied ? 'Código Copiado!' : <><Copy size={16} /> Copiar Código Pix Copia e Cola</>}
                </button>
              </div>

              <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div className="spinner"></div>
                Aguardando confirmação do pagamento...
              </div>
            </div>
          </div>
        )}

        {/* Sucesso */}
        {checkoutStep === 3 && (
          <div className="checkout-modal">
            <div className="checkout-content" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(16,185,129,0.2)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={40} />
              </div>
              <h2 style={{ marginBottom: '15px', color: '#fff', fontSize: '1.8rem' }}>Pagamento Confirmado!</h2>
              <p style={{ color: '#cbd5e1', marginBottom: '30px', fontSize: '1.1rem' }}>
                Parabéns! O seu pagamento foi aprovado com sucesso.
              </p>
              
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', textAlign: 'left', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ color: '#fff', marginBottom: '10px', fontSize: '1.1rem' }}>Próximos Passos:</h3>
                <ol style={{ color: '#94a3b8', paddingLeft: '20px', lineHeight: '1.6' }}>
                  <li>O link para download do código fonte completo foi enviado para o seu e-mail: <strong>{custEmail}</strong></li>
                  <li>Você também receberá uma mensagem no WhatsApp com as instruções de instalação rápida.</li>
                  <li>Caso não receba em até 5 minutos, verifique a caixa de spam ou contate o suporte.</li>
                </ol>
              </div>

              <a href="https://github.com" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '15px 30px', display: 'inline-flex', textDecoration: 'none' }}>
                Acessar Área de Membros <ArrowRight size={18} style={{ marginLeft: '10px' }} />
              </a>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default App;
