import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3, 
  LogOut, 
  Settings, 
  Lock, 
  ShieldAlert, 
  Sparkles, 
  Eye, 
  Camera, 
  Video, 
  Layers, 
  CheckCircle,
  ExternalLink,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  Copy,
  ArrowRight
} from 'lucide-react';
import type { 
  Model, 
  Lead, 
  Transaction
} from './mockDb';
import { 
  getModels, 
  addModel, 
  updateModel, 
  deleteModel, 
  getLeads, 
  addLead, 
  deleteLead, 
  getTransactions, 
  getStats, 
  getAdminUser, 
  updateAdminPassword,
  initializeStorage
} from './mockDb';

function App() {
  // Navigation & Auth State
  const [route, setRoute] = useState<'home' | 'admin-login' | 'admin-dashboard'>('home');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'models' | 'leads' | 'transactions' | 'settings'>('dashboard');
  
  // Data States
  const [models, setModels] = useState<Model[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState(getStats());
  
  // Age Verification
  const [ageVerified, setAgeVerified] = useState<boolean>(true);
  
  // Filters & Selection
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [modelToUnlock, setModelToUnlock] = useState<Model | null>(null);
  
  // Checkout Multi-Step Form State
  const [checkoutStep, setCheckoutStep] = useState<number>(1);
  const [upsell1Active, setUpsell1Active] = useState<boolean>(false);
  const [upsell1ModelId, setUpsell1ModelId] = useState<string>('');
  const [upsell2Active, setUpsell2Active] = useState<boolean>(false);

  // Customer details input
  const [custName, setCustName] = useState('');
  const [custWhatsapp, setCustWhatsapp] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custCpf, setCustCpf] = useState('');

  // Payment states
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [pixCode, setPixCode] = useState('');
  const [successModelNames, setSuccessModelNames] = useState<string[]>([]);
  const [successTotal, setSuccessTotal] = useState<number>(0);
  const [isCopied, setIsCopied] = useState(false);
  
  // BackRedirect Popup state
  const [showBackPopup, setShowBackPopup] = useState(false);
  
  // Admin Login Inputs
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Admin CRUD Form state
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [modelFormData, setModelFormData] = useState({
    name: '',
    cover: '',
    description: '',
    price: 39.90,
    discountPercentage: 10,
    buyLink: '',
    categories: '',
    photosCount: 100,
    videosCount: 10,
    isFeatured: false,
    isAvailable: true,
    returnDays: 14
  });

  // Admin Change Password input
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Initial Load
  useEffect(() => {
    initializeStorage();
    setModels(getModels());
    setLeads(getLeads());
    setTransactions(getTransactions());
    setStats(getStats());
    
    // Check age verification
    const verified = localStorage.getItem('hotmodel_age_verified');
    if (!verified) {
      setAgeVerified(false);
    }

    // Hash routing for Admin Login/Dashboard
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setRoute('admin-login');
      } else if (window.location.hash === '#home' || window.location.hash === '') {
        setRoute('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // check on load

    // Detect mouse leaving window for BackRedirect popup
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 50) {
        const dismissed = sessionStorage.getItem('hotmodel_back_popup_dismissed');
        if (!dismissed) {
          setShowBackPopup(true);
        }
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Update lists when operations happen
  const refreshData = () => {
    setModels(getModels());
    setLeads(getLeads());
    setTransactions(getTransactions());
    setStats(getStats());
  };

  // Age Confirm handler
  const confirmAge = () => {
    localStorage.setItem('hotmodel_age_verified', 'true');
    setAgeVerified(true);
  };

  // Checkout Steps Handlers
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelToUnlock) return;

    if (!custName.trim() || !custEmail.trim() || !custWhatsapp.trim() || !custCpf.trim()) {
      setPaymentError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setPaymentLoading(true);
    setPaymentError('');

    // Compute prices
    const mainPrice = modelToUnlock.price * (1 - modelToUnlock.discountPercentage / 100);
    let extraPrice = 0;
    let extraNames = '';
    
    if (upsell1Active && upsell1ModelId) {
      const upModel = models.find(m => m.id === upsell1ModelId);
      if (upModel) {
        extraPrice += (upModel.price * (1 - upModel.discountPercentage / 100)) * 0.5;
        extraNames += ` + ${upModel.name} (Modelo Exclusiva 50% OFF)`;
      }
    }
    
    if (upsell2Active) {
      extraPrice += 49.90;
      extraNames += ` + Acesso Painel Privacy (50% OFF)`;
    }
    
    const finalTotal = mainPrice + extraPrice;
    const prodName = `hotmodel2026 - ${modelToUnlock.name}${extraNames}`;

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
          total: finalTotal
        })
      });

      const data = await response.json();
      setPaymentLoading(false);

      if (data.ok) {
        setPixCode(data.qr_code_text);
        setCheckoutStep(3); // Go to Payment display

        // Also save this lead in our mockDb immediately!
        addLead({
          name: custName,
          whatsapp: custWhatsapp,
          email: custEmail,
          modelId: modelToUnlock.id,
          modelName: modelToUnlock.name
        });
        
        // If upsell 1 was selected, save lead for the second model too
        if (upsell1Active && upsell1ModelId) {
          const upModel = models.find(m => m.id === upsell1ModelId);
          if (upModel) {
            addLead({
              name: custName,
              whatsapp: custWhatsapp,
              email: custEmail,
              modelId: upModel.id,
              modelName: upModel.name
            });
          }
        }
      } else {
        setPaymentError(data.erro || 'Erro ao gerar o Pix via Dice API. Tente novamente.');
      }
    } catch (err: any) {
      setPaymentLoading(false);
      setPaymentError(err.message || 'Erro de conexão ao criar pagamento.');
    }
  };

  const confirmMockPayment = () => {
    if (!modelToUnlock) return;

    const mainPrice = modelToUnlock.price * (1 - modelToUnlock.discountPercentage / 100);
    let extraPrice = 0;
    const purchasedModels: Model[] = [modelToUnlock];
    
    if (upsell1Active && upsell1ModelId) {
      const upModel = models.find(m => m.id === upsell1ModelId);
      if (upModel) {
        extraPrice += (upModel.price * (1 - upModel.discountPercentage / 100)) * 0.5;
        purchasedModels.push(upModel);
      }
    }
    
    if (upsell2Active) {
      extraPrice += 49.90;
    }
    
    const finalTotal = mainPrice + extraPrice;

    // 1. Mark purchased models as unavailable (Sold & Retired from vitrine)
    const currentModels = getModels();
    purchasedModels.forEach(pm => {
      const found = currentModels.find(m => m.id === pm.id);
      if (found) {
        found.isAvailable = false;
        // Increment statistics
        found.earnings += (pm.id === modelToUnlock.id) ? mainPrice : (pm.price * (1 - pm.discountPercentage / 100)) * 0.5;
        found.views += 1;
        updateModel(found);
      }
    });

    // 2. Add approved transaction to mock db
    const modelNamesStr = purchasedModels.map(m => m.name).join(' & ');
    const trans: Omit<Transaction, 'id' | 'createdAt'> = {
      customerName: custName,
      customerEmail: custEmail,
      modelName: modelNamesStr + (upsell2Active ? ' + Privacy VIP' : ''),
      amount: finalTotal,
      status: 'Aprovado'
    };
    
    // Add transaction to storage
    const transactionsList = JSON.parse(localStorage.getItem('hotmodel_transactions') || '[]');
    transactionsList.unshift({
      ...trans,
      id: 'trans-' + Date.now(),
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('hotmodel_transactions', JSON.stringify(transactionsList));

    // 3. Set success state
    setSuccessModelNames(purchasedModels.map(m => m.name));
    setSuccessTotal(finalTotal);
    setCheckoutStep(4);
    
    // Refresh list and stats
    refreshData();
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

  // Categories list
  const getUniqueCategories = () => {
    const cats = new Set<string>();
    models.forEach(m => m.categories.forEach(c => cats.add(c)));
    return ['Todos', ...Array.from(cats)];
  };

  // Filtered models (only active/sold models are NOT displayed)
  const getFilteredModels = () => {
    const activeModels = models.filter(m => m.isAvailable);
    if (selectedCategory === 'Todos') return activeModels;
    return activeModels.filter(m => m.categories.includes(selectedCategory));
  };

  // Admin Login action
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = getAdminUser();
    if (adminUsername === admin.username && adminPassword === admin.passwordHash) {
      setRoute('admin-dashboard');
      setLoginError('');
      setAdminUsername('');
      setAdminPassword('');
    } else {
      setLoginError('Credenciais inválidas. Tente novamente.');
    }
  };

  // Admin Logout action
  const handleLogout = () => {
    setRoute('home');
    window.location.hash = 'home';
  };

  // Admin Model Image Upload to base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setModelFormData(prev => ({ ...prev, cover: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Admin Submit Model Create/Edit
  const handleModelFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedCategories = modelFormData.categories
      .split(',')
      .map(c => c.trim())
      .filter(c => c !== '');

    const payload = {
      name: modelFormData.name,
      cover: modelFormData.cover || 'https://picsum.photos/400/600',
      description: modelFormData.description,
      price: Number(modelFormData.price),
      discountPercentage: Number(modelFormData.discountPercentage),
      buyLink: modelFormData.buyLink || '#',
      categories: formattedCategories,
      photosCount: Number(modelFormData.photosCount),
      videosCount: Number(modelFormData.videosCount),
      isFeatured: modelFormData.isFeatured,
      isAvailable: modelFormData.isAvailable,
      returnDays: Number(modelFormData.returnDays)
    };

    if (editingModel) {
      updateModel({
        ...editingModel,
        ...payload
      });
      setEditingModel(null);
    } else {
      addModel(payload);
      setIsAddingModel(false);
    }

    refreshData();
  };

  // Populate form for editing
  const startEditModel = (model: Model) => {
    setEditingModel(model);
    setModelFormData({
      name: model.name,
      cover: model.cover,
      description: model.description,
      price: model.price,
      discountPercentage: model.discountPercentage,
      buyLink: model.buyLink,
      categories: model.categories.join(', '),
      photosCount: model.photosCount,
      videosCount: model.videosCount,
      isFeatured: model.isFeatured,
      isAvailable: model.isAvailable,
      returnDays: model.returnDays
    });
  };

  const startAddModel = () => {
    setIsAddingModel(true);
    setEditingModel(null);
    setModelFormData({
      name: '',
      cover: '',
      description: '',
      price: 39.90,
      discountPercentage: 10,
      buyLink: '',
      categories: 'Premium, VIP',
      photosCount: 120,
      videosCount: 15,
      isFeatured: false,
      isAvailable: true,
      returnDays: 14
    });
  };

  // Delete model handler
  const handleDeleteModel = (id: string) => {
    if (confirm('Deseja realmente remover esta modelo do catálogo?')) {
      deleteModel(id);
      refreshData();
    }
  };

  // Delete lead handler
  const handleDeleteLead = (id: string) => {
    if (confirm('Deseja realmente excluir este lead?')) {
      deleteLead(id);
      refreshData();
    }
  };

  // Change Password handler
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    updateAdminPassword(newPassword.trim());
    setPasswordSuccess('Senha de administrador alterada com sucesso!');
    setNewPassword('');
    setTimeout(() => setPasswordSuccess(''), 3000);
  };

  const closeBackPopup = () => {
    setShowBackPopup(false);
    sessionStorage.setItem('hotmodel_back_popup_dismissed', 'true');
  };

  // R$ 7.90 trial offer checkout
  const buyBackOffer = () => {
    closeBackPopup();
    const available = models.find(m => m.isAvailable);
    if (available) {
      setModelToUnlock(available);
      setCheckoutStep(1);
      setUpsell1Active(false);
      setUpsell2Active(false);
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // RENDER LANDING PAGE (FRONTEND)
  const renderHome = () => (
    <div className="vitrine-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">🔥</div>
          <span className="logo-text">hotmodel2026</span>
          <span className="logo-tag">ELITE VIP</span>
        </div>
        <div style={{ display: 'none' }}>
          {/* O painel admin foi removido da visualização pública, podendo ser acessado via /#admin */}
          <a href="#admin">Painel</a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="copy-badge">
          <Sparkles size={14} /> Modelos 100% Únicas e Exclusivas no Mercado
        </div>
        <h1 className="hero-title">
          Adquira os Direitos de <span>Sua Modelo Exclusiva</span>
        </h1>
        <p className="hero-subtitle">
          Cada cliente possui sua própria modelo validada. Ao comprar, você adquire o direito de uso exclusivo do acervo completo da modelo, e ela é **imediatamente retirada da vitrine pública** para sempre.
        </p>
      </section>

      {/* Category Bar */}
      <div className="category-bar">
        {getUniqueCategories().map(cat => (
          <button 
            key={cat} 
            className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Models Catalog */}
      <div className="model-grid">
        {getFilteredModels().map(model => {
          const discountPrice = model.price * (1 - model.discountPercentage / 100);
          return (
            <div key={model.id} className={`model-card ${model.isFeatured ? 'featured' : ''}`}>
              {model.isFeatured && <span className="model-badge">Destaque Elite</span>}
              {model.discountPercentage > 0 && (
                <span className="discount-badge">-{model.discountPercentage}% OFF</span>
              )}
              
              <div className="model-card-image-container">
                <img src={model.cover} alt={model.name} className="model-card-img" />
              </div>
              
              <div className="model-card-content">
                <h3 className="model-card-title">{model.name}</h3>
                
                <div className="model-card-meta">
                  <span><Camera size={14} /> {model.photosCount} Fotos</span>
                  <span><Video size={14} /> {model.videosCount} Vídeos</span>
                  <span><Eye size={14} /> {model.views.toLocaleString()} acessos</span>
                </div>
                
                <p className="model-card-description">{model.description}</p>
                
                <div className="model-tags">
                  {model.categories.map(c => (
                    <span key={c} className="model-tag">{c}</span>
                  ))}
                  <span className="model-tag" style={{borderColor: 'rgba(236, 72, 153, 0.3)', color: '#fbcfe8'}}>
                    Apenas 1 licença de uso
                  </span>
                  <span className="model-tag" style={{borderColor: 'rgba(16, 185, 129, 0.3)', color: '#a7f3d0'}}>
                    {model.returnDays} Dias de Garantia
                  </span>
                </div>
                
                <div className="model-price-container">
                  <div className="price-block">
                    {model.discountPercentage > 0 && (
                      <span className="old-price">R$ {model.price.toFixed(2)}</span>
                    )}
                    <span className="new-price">R$ {discountPrice.toFixed(2)}</span>
                  </div>
                  
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      setModelToUnlock(model);
                      setCheckoutStep(1);
                      setUpsell1Active(false);
                      setUpsell2Active(false);
                      setUpsell1ModelId('');
                      setPaymentError('');
                    }}
                  >
                    Adquirir Direitos <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {getFilteredModels().length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <p>Todas as modelos exclusivas deste catálogo já foram adquiridas e retiradas da vitrine.</p>
          </div>
        )}
      </div>

      {/* FAQ/Exclusivity Banner */}
      <section className="glass-card" style={{ marginBottom: '80px', textAlign: 'left' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '15px', borderRadius: '12px', color: '#a78bfa' }}>
            <ShieldAlert size={32} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Garantia de Modelo Única e Validação Exclusiva</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Após a confirmação do pagamento do Pix via Dice, os dados de acesso da modelo (fotos, vídeos e histórico) são transferidos para você e a modelo é **deletada automaticamente desta vitrine pública**. Ninguém mais poderá adquirir a mesma modelo. O processo é sigiloso e imediato.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 hotmodel2026. Todos os direitos reservados. Proibido para menores de 18 anos.</p>
        <p style={{ marginTop: '10px', color: '#64748b', fontSize: '0.75rem' }}>
          Acesso VIP restrito e confidencial. O compartilhamento do material baixado é passível de sanções legais de direitos autorais.
        </p>
      </footer>
    </div>
  );

  // RENDER ADMIN PANEL (BACKEND)
  const renderAdmin = () => (
    <div className="admin-container">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="logo-container">
            <div className="logo-icon">🔥</div>
            <span className="logo-text">hotmodel</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Painel de Controle
          </span>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${adminTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setAdminTab('dashboard'); setIsAddingModel(false); setEditingModel(null); }}
          >
            <TrendingUp size={18} /> Dashboard
          </button>
          <button 
            className={`admin-nav-item ${adminTab === 'models' ? 'active' : ''}`}
            onClick={() => { setAdminTab('models'); setIsAddingModel(false); setEditingModel(null); }}
          >
            <Layers size={18} /> Modelos (Vitrine)
          </button>
          <button 
            className={`admin-nav-item ${adminTab === 'leads' ? 'active' : ''}`}
            onClick={() => { setAdminTab('leads'); setIsAddingModel(false); setEditingModel(null); }}
          >
            <Users size={18} /> Leads / Clientes
          </button>
          <button 
            className={`admin-nav-item ${adminTab === 'transactions' ? 'active' : ''}`}
            onClick={() => { setAdminTab('transactions'); setIsAddingModel(false); setEditingModel(null); }}
          >
            <DollarSign size={18} /> Vendas
          </button>
          <button 
            className={`admin-nav-item ${adminTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setAdminTab('settings'); setIsAddingModel(false); setEditingModel(null); }}
          >
            <Settings size={18} /> Configurações
          </button>
        </nav>
        
        <div className="admin-logout">
          <button className="admin-nav-item" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}>
            <LogOut size={18} /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* Admin Main Body */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-title-group">
            <h1>
              {adminTab === 'dashboard' && 'Visão Geral'}
              {adminTab === 'models' && 'Catálogo de Modelos'}
              {adminTab === 'leads' && 'Gerenciador de Leads'}
              {adminTab === 'transactions' && 'Histórico de Faturamento'}
              {adminTab === 'settings' && 'Segurança do Painel'}
            </h1>
            <p>
              {adminTab === 'dashboard' && 'Métricas em tempo real das suas campanhas.'}
              {adminTab === 'models' && 'Adicione, edite e organize os packs da vitrine.'}
              {adminTab === 'leads' && 'Lista de contatos e WhatsApps capturados.'}
              {adminTab === 'transactions' && 'Acompanhe as compras mockadas.'}
              {adminTab === 'settings' && 'Gerencie o acesso administrativo.'}
            </p>
          </div>
          <button className="btn btn-secondary" onClick={() => setRoute('home')}>
            Visualizar Vitrine
          </button>
        </header>

        {/* TAB: DASHBOARD */}
        {adminTab === 'dashboard' && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-card-title">Faturamento Total</span>
                <span className="stat-card-value">R$ {stats.totalRevenue.toFixed(2)}</span>
                <div className="stat-card-footer">
                  <CheckCircle size={12} /> Apenas aprovados
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-card-title">Vendas Aprovadas</span>
                <span className="stat-card-value">{stats.approvedSales}</span>
                <div className="stat-card-footer">
                  <UserCheck size={12} /> Pagamentos ok
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-card-title">Vendas Pendentes</span>
                <span className="stat-card-value">{stats.pendingSales}</span>
                <div className="stat-card-footer neutral" style={{color: '#f59e0b'}}>
                  <AlertTriangle size={12} /> Aguardando Pix/Boleto
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-card-title">Total de Leads</span>
                <span className="stat-card-value">{stats.totalLeads}</span>
                <div className="stat-card-footer">
                  <Users size={12} /> Contatos WhatsApp
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-card-title">Conversão Geral</span>
                <span className="stat-card-value">{stats.conversionRate.toFixed(1)}%</span>
                <div className="stat-card-footer">
                  <Sparkles size={12} /> Média do funil
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', flexWrap: 'wrap' }}>
              {/* Leads */}
              <div className="table-card">
                <div className="table-header">
                  <h3>Últimos Leads Capturados</h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => setAdminTab('leads')}>Ver todos</button>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>WhatsApp</th>
                        <th>Modelo Alvo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.slice(0, 5).map(lead => (
                        <tr key={lead.id}>
                          <td>{lead.name}</td>
                          <td>{lead.whatsapp}</td>
                          <td>{lead.modelName}</td>
                        </tr>
                      ))}
                      {leads.length === 0 && (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', color: '#64748b' }}>Nenhum lead capturado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transactions */}
              <div className="table-card">
                <div className="table-header">
                  <h3>Transações Recentes</h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => setAdminTab('transactions')}>Ver todas</button>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Modelo</th>
                        <th>Valor</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map(trans => (
                        <tr key={trans.id}>
                          <td>{trans.modelName}</td>
                          <td>R$ {trans.amount.toFixed(2)}</td>
                          <td>
                            <span className={`badge-status ${trans.status === 'Aprovado' ? 'approved' : trans.status === 'Pendente' ? 'pending' : 'canceled'}`}>
                              {trans.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', color: '#64748b' }}>Nenhuma venda registrada.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MODELS */}
        {adminTab === 'models' && (
          <div>
            {!isAddingModel && !editingModel ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <button className="btn btn-primary" onClick={startAddModel}>
                    <Plus size={16} /> Nova Modelo
                  </button>
                </div>
                
                <div className="model-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                  {models.map(model => (
                    <div key={model.id} className="model-card" style={{ border: '1px solid var(--border-color)', opacity: model.isAvailable ? 1 : 0.4 }}>
                      <div className="model-card-image-container" style={{ aspectRatio: '1' }}>
                        <img src={model.cover} alt={model.name} className="model-card-img" />
                      </div>
                      <div className="model-card-content" style={{ padding: '15px' }}>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{model.name} {!model.isAvailable && ' (Vendida)'}</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '15px' }}>
                          <span>R$ {model.price.toFixed(2)}</span>
                          <span>{model.photosCount}F | {model.videosCount}V</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ flex: 1 }}
                            onClick={() => startEditModel(model)}
                          >
                            <Edit3 size={12} /> Editar
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteModel(model.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="glass-card" style={{ maxWidth: '750px', margin: '0 auto' }}>
                <h3 style={{ marginBottom: '25px' }}>{editingModel ? 'Editar Modelo' : 'Cadastrar Nova Modelo'}</h3>
                
                <form onSubmit={handleModelFormSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Nome da Modelo</label>
                      <input 
                        type="text" 
                        required
                        className="form-control"
                        value={modelFormData.name}
                        onChange={e => setModelFormData({ ...modelFormData, name: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Categorias (Separadas por vírgula)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Premium, Novidades, VIP"
                        className="form-control"
                        value={modelFormData.categories}
                        onChange={e => setModelFormData({ ...modelFormData, categories: e.target.value })}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Link de Imagem de Capa (URL)</label>
                      <input 
                        type="url" 
                        className="form-control"
                        placeholder="https://..."
                        value={modelFormData.cover}
                        onChange={e => setModelFormData({ ...modelFormData, cover: e.target.value })}
                      />
                      <div style={{ marginTop: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Ou faça upload local:</span>
                        <input type="file" accept="image/*" onChange={handleImageFileChange} />
                      </div>
                      {modelFormData.cover && (
                        <div style={{ marginTop: '15px' }}>
                          <img src={modelFormData.cover} alt="Preview" style={{ height: '80px', borderRadius: '8px', border: '1px solid #333' }} />
                        </div>
                      )}
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Descrição / Copy (Altamente persuasiva)</label>
                      <textarea 
                        className="form-control"
                        rows={3}
                        required
                        value={modelFormData.description}
                        onChange={e => setModelFormData({ ...modelFormData, description: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Preço Inicial (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        className="form-control"
                        value={modelFormData.price}
                        onChange={e => setModelFormData({ ...modelFormData, price: Number(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Porcentagem de Desconto (%)</label>
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        className="form-control"
                        value={modelFormData.discountPercentage}
                        onChange={e => setModelFormData({ ...modelFormData, discountPercentage: Number(e.target.value) })}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Link do Checkout de Venda (Redirecionamento/Opcional)</label>
                      <input 
                        type="text" 
                        placeholder="https://checkout..."
                        className="form-control"
                        value={modelFormData.buyLink}
                        onChange={e => setModelFormData({ ...modelFormData, buyLink: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Qtd. Fotos (Exibição)</label>
                      <input 
                        type="number" 
                        min="0"
                        className="form-control"
                        value={modelFormData.photosCount}
                        onChange={e => setModelFormData({ ...modelFormData, photosCount: Number(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Qtd. Vídeos (Exibição)</label>
                      <input 
                        type="number" 
                        min="0"
                        className="form-control"
                        value={modelFormData.videosCount}
                        onChange={e => setModelFormData({ ...modelFormData, videosCount: Number(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Dias de Retorno Garantido</label>
                      <input 
                        type="number" 
                        min="0"
                        className="form-control"
                        value={modelFormData.returnDays}
                        onChange={e => setModelFormData({ ...modelFormData, returnDays: Number(e.target.value) })}
                      />
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                        <input 
                          type="checkbox"
                          checked={modelFormData.isFeatured}
                          onChange={e => setModelFormData({ ...modelFormData, isFeatured: e.target.checked })}
                        />
                        Modelo Destacada na Vitrine
                      </label>
                      
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                        <input 
                          type="checkbox"
                          checked={modelFormData.isAvailable}
                          onChange={e => setModelFormData({ ...modelFormData, isAvailable: e.target.checked })}
                        />
                        Disponível para venda
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {editingModel ? 'Salvar Alterações' : 'Cadastrar Modelo'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => { setIsAddingModel(false); setEditingModel(null); }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB: LEADS */}
        {adminTab === 'leads' && (
          <div className="table-card">
            <div className="table-header">
              <h3>Clientes em Potencial Capturados</h3>
              <span className="badge-status approved" style={{fontSize: '0.8rem'}}>{leads.length} Leads</span>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>WhatsApp</th>
                    <th>E-mail</th>
                    <th>Modelo Alvo</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id}>
                      <td style={{fontWeight: 600}}>{lead.name}</td>
                      <td>
                        <a 
                          href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{color: '#10b981', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px'}}
                        >
                          {lead.whatsapp} <ExternalLink size={12} />
                        </a>
                      </td>
                      <td>{lead.email}</td>
                      <td>{lead.modelName}</td>
                      <td>{new Date(lead.createdAt).toLocaleString('pt-BR')}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLead(lead.id)}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '30px 0' }}>Nenhum lead capturado ainda.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: TRANSACTIONS */}
        {adminTab === 'transactions' && (
          <div className="table-card">
            <div className="table-header">
              <h3>Faturamento Detalhado</h3>
              <span className="badge-status approved" style={{fontSize: '0.8rem'}}>Total: R$ {stats.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Comprador</th>
                    <th>E-mail</th>
                    <th>Modelo Adquirida</th>
                    <th>Valor Pago</th>
                    <th>Data da Compra</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(trans => (
                    <tr key={trans.id}>
                      <td style={{fontWeight: 600}}>{trans.customerName}</td>
                      <td>{trans.customerEmail}</td>
                      <td>{trans.modelName}</td>
                      <td style={{color: 'white', fontWeight: 700}}>R$ {trans.amount.toFixed(2)}</td>
                      <td>{new Date(trans.createdAt).toLocaleString('pt-BR')}</td>
                      <td>
                        <span className={`badge-status ${trans.status === 'Aprovado' ? 'approved' : trans.status === 'Pendente' ? 'pending' : 'canceled'}`}>
                          {trans.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '30px 0' }}>Nenhuma venda registrada ainda.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {adminTab === 'settings' && (
          <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} /> Alterar Senha Administrativa
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '25px' }}>
              Modifique a senha de acesso ao painel admin. O usuário continuará sendo <strong>admin</strong>.
            </p>
            
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">Nova Senha</label>
                <input 
                  type="password" 
                  required
                  className="form-control"
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>

              {passwordSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px' }}>
                  {passwordSuccess}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Atualizar Senha
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );

  // RENDER ADMIN LOGIN PAGE
  const renderLogin = () => (
    <div className="login-container">
      <div className="glass-card login-card">
        <div className="login-logo">
          <div className="logo-icon" style={{ width: '50px', height: '50px', fontSize: '1.6rem', marginBottom: '15px' }}>🔥</div>
          <span className="logo-text" style={{ fontSize: '1.8rem' }}>hotmodel2026</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>Acesso Restrito</span>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Usuário</label>
            <input 
              type="text" 
              required
              className="form-control"
              value={adminUsername}
              onChange={e => setAdminUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input 
              type="password" 
              required
              className="form-control"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
            />
          </div>

          {loginError && (
            <div style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>
              {loginError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Entrar
            </button>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setRoute('home'); window.location.hash = ''; }}>
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Helper calculations for summary
  const getMainPrice = () => {
    if (!modelToUnlock) return 0;
    return modelToUnlock.price * (1 - modelToUnlock.discountPercentage / 100);
  };

  const getUpsell1Price = () => {
    if (!upsell1Active || !upsell1ModelId) return 0;
    const upModel = models.find(m => m.id === upsell1ModelId);
    if (!upModel) return 0;
    return (upModel.price * (1 - upModel.discountPercentage / 100)) * 0.5;
  };

  const getUpsell2Price = () => {
    return upsell2Active ? 49.90 : 0;
  };

  const getCheckoutTotal = () => {
    return getMainPrice() + getUpsell1Price() + getUpsell2Price();
  };

  return (
    <>
      {/* Background glow effects */}
      <div className="glow-bg">
        <div className="glow-circle glow-1"></div>
        <div className="glow-circle glow-2"></div>
      </div>

      {/* Main Routing Render */}
      {route === 'home' && renderHome()}
      {route === 'admin-login' && renderLogin()}
      {route === 'admin-dashboard' && renderAdmin()}

      {/* AGE VERIFICATION MODAL OVERLAY */}
      {!ageVerified && (
        <div className="modal-overlay">
          <div className="modal-content age-modal">
            <div className="age-icon">18+</div>
            <h2 className="modal-title">Conteúdo Adulto Restrito</h2>
            <p className="modal-desc">
              Você deve ter 18 anos ou mais para acessar esta vitrine de modelos. Ao entrar, você confirma estar de acordo com os termos de privacidade.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={confirmAge}>
                Tenho 18 anos ou mais
              </button>
              <a href="https://google.com" className="btn btn-secondary">
                Sair
              </a>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC MULTI-STEP CHECKOUT OVERLAY */}
      {modelToUnlock && (
        <div className="modal-overlay" style={{ overflowY: 'auto', padding: '10px 0' }}>
          <div className="modal-content" style={{ textAlign: 'left', maxWidth: '600px', margin: '30px auto' }}>
            
            {/* Header / Steps Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>
                {checkoutStep === 1 && '🛒 Resumo do Pedido'}
                {checkoutStep === 2 && '👤 Dados para Acesso'}
                {checkoutStep === 3 && '⚡ Efetuar Pagamento'}
                {checkoutStep === 4 && '🎉 Compra Confirmada!'}
              </h3>
              {checkoutStep < 4 && (
                <button 
                  onClick={() => setModelToUnlock(null)} 
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Stepper Tags */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
              <span style={{ flex: 1, height: '4px', borderRadius: '2px', background: checkoutStep >= 1 ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)' }}></span>
              <span style={{ flex: 1, height: '4px', borderRadius: '2px', background: checkoutStep >= 2 ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)' }}></span>
              <span style={{ flex: 1, height: '4px', borderRadius: '2px', background: checkoutStep >= 3 ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)' }}></span>
              <span style={{ flex: 1, height: '4px', borderRadius: '2px', background: checkoutStep >= 4 ? 'var(--color-success)' : 'rgba(255,255,255,0.08)' }}></span>
            </div>

            {/* STEP 1: SUMMARY & UPSELLS */}
            {checkoutStep === 1 && (
              <div>
                {/* Main Product Info */}
                <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <img src={modelToUnlock.cover} alt={modelToUnlock.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.1rem' }}>{modelToUnlock.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Direitos de uso exclusivos & acervo digital</span>
                  </div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>R$ {getMainPrice().toFixed(2)}</span>
                </div>

                {/* UPSELL 1: SECOND MODEL 50% OFF */}
                {models.filter(m => m.isAvailable && m.id !== modelToUnlock.id).length > 0 && (
                  <div className="glass-card" style={{ padding: '18px', marginBottom: '15px', border: '1px dashed rgba(236, 72, 153, 0.4)', background: 'rgba(236, 72, 153, 0.02)' }}>
                    <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={upsell1Active} 
                        onChange={(e) => {
                          setUpsell1Active(e.target.checked);
                          if (e.target.checked && !upsell1ModelId) {
                            // select first alternative model automatically
                            const firstAlt = models.find(m => m.isAvailable && m.id !== modelToUnlock.id);
                            if (firstAlt) setUpsell1ModelId(firstAlt.id);
                          }
                        }}
                        style={{ marginTop: '5px' }}
                      />
                      <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-secondary)', display: 'block' }}>
                          🔥 LEVE MAIS UMA MODELO COM 50% DE DESCONTO!
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Adquira também os direitos de uma segunda modelo selecionada pela metade do preço.
                        </span>
                      </div>
                    </label>

                    {upsell1Active && (
                      <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select 
                          className="form-control"
                          value={upsell1ModelId}
                          onChange={(e) => setUpsell1ModelId(e.target.value)}
                          style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }}
                        >
                          {models.filter(m => m.isAvailable && m.id !== modelToUnlock.id).map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} (Por apenas R$ {((m.price * (1 - m.discountPercentage / 100)) * 0.5).toFixed(2)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* UPSELL 2: PRIVACY VIP ACCESS */}
                <div className="glass-card" style={{ padding: '18px', marginBottom: '25px', border: '1px dashed rgba(139, 92, 246, 0.4)', background: 'rgba(139, 92, 246, 0.02)' }}>
                  <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={upsell2Active} 
                      onChange={(e) => setUpsell2Active(e.target.checked)}
                      style={{ marginTop: '5px' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a78bfa', display: 'block' }}>
                        🔒 ACESSO COMPLETO AO PAINEL DO PRIVACY VIP (50% OFF)
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Garanta 1 mês de acesso integral à nossa comunidade do Privacy de R$ 79,90 por apenas **R$ 49,90/mês**.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Total Summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Valor Total do Pedido:</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white' }}>R$ {getCheckoutTotal().toFixed(2)}</span>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '14px' }}
                  onClick={() => setCheckoutStep(2)}
                >
                  Confirmar e Continuar <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 2: CUSTOMER IDENTIFICATION */}
            {checkoutStep === 2 && (
              <form onSubmit={handleLeadSubmit}>
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Seu nome"
                    className="form-control"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp (DDD + Número)</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="(11) 99999-9999"
                    className="form-control"
                    value={custWhatsapp}
                    onChange={handleWhatsappChange}
                  />
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">E-mail para entrega</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="seu@email.com"
                      className="form-control"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CPF (Emissão do PIX)</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="000.000.000-00"
                      className="form-control"
                      value={custCpf}
                      onChange={handleCpfChange}
                    />
                  </div>
                </div>

                {paymentError && (
                  <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '15px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
                    {paymentError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setCheckoutStep(1)}
                    disabled={paymentLoading}
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? 'Gerando PIX com a Dice API...' : 'Confirmar e Ir para o Pagamento'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: PIX DISPLAY AND SIMULATION */}
            {checkoutStep === 3 && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Escaneie o QR Code ou copie a chave Pix abaixo. O pagamento é processado com total segurança pela Dice.
                </p>

                {/* QR Code Container */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '12px', display: 'inline-block' }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`} 
                      alt="Pix QR Code" 
                      style={{ display: 'block', width: '200px', height: '200px' }} 
                    />
                  </div>
                </div>

                {/* Pix Code Display */}
                <div className="glass-card" style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Código Pix Copia e Cola
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      readOnly 
                      value={pixCode} 
                      style={{ flex: 1, background: 'none', border: 'none', color: 'white', fontSize: '0.8rem', outline: 'none' }} 
                    />
                    <button 
                      onClick={copyToClipboard}
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                    >
                      <Copy size={12} /> {isCopied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                {/* SIMULATED PAYMENT CONFIRMATION (TESTER UTILITY) */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '10px' }}>
                    ⚙️ Simulador de Integração Dice API
                  </p>
                  <button 
                    className="btn btn-primary" 
                    style={{ background: 'linear-gradient(135deg, var(--color-success), #059669)', border: 'none', boxShadow: 'none', width: '100%', padding: '12px' }}
                    onClick={confirmMockPayment}
                  >
                    Confirmar Pagamento no Simulador
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS AND CONFIRMATION */}
            {checkoutStep === 4 && (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2px solid var(--color-success)', color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: '20px' }}>
                  ✓
                </div>
                <h4 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Garantia de Exclusividade Ativada!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Parabéns! O pagamento de **R$ {successTotal.toFixed(2)}** foi aprovado com sucesso via Dice API. 
                  As modelos **{successModelNames.join(', ')}** foram vinculadas à sua licença exclusiva e **foram deletadas da vitrine pública**.
                </p>
                <div className="glass-card" style={{ padding: '15px', textAlign: 'left', fontSize: '0.85rem', marginBottom: '25px', borderColor: 'rgba(16,185,129,0.3)' }}>
                  <strong>Próximos Passos:</strong>
                  <ul style={{ paddingLeft: '15px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>1. O link com a pasta completa do Google Drive foi enviado para o WhatsApp **{custWhatsapp}**.</li>
                    <li>2. Uma cópia do contrato de direitos autorais foi enviada para o e-mail **{custEmail}**.</li>
                    <li>3. Atualizações semanais de mídia serão enviadas no mesmo contato.</li>
                  </ul>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => setModelToUnlock(null)}
                >
                  Concluir e Voltar
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* BACKREDIRECT/POPUNDER SPECIAL DISCOUNT OVERLAY */}
      {showBackPopup && (
        <div className="back-redirect-popup">
          <button className="back-popup-close" onClick={closeBackPopup}>×</button>
          <div style={{ color: '#ec4899', fontSize: '1.8rem', marginBottom: '10px' }}>💝</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Espera! Não Vá Embora Ainda...</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '15px' }}>
            Adquira os direitos de uma de nossas modelos exclusivas com desconto especial!
          </p>
          <button className="btn btn-primary btn-sm" onClick={buyBackOffer} style={{ width: '100%', padding: '8px 16px', fontSize: '0.85rem' }}>
            Aproveitar Desconto
          </button>
        </div>
      )}
    </>
  );
}

export default App;
