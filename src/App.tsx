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
  const [route, setRoute] = useState<'home' | 'admin-login' | 'admin-dashboard' | 'privacy-panel'>('home');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'models' | 'leads' | 'transactions' | 'settings'>('dashboard');

  // Privacy Platform Simulation States
  const [privacyTab, setPrivacyTab] = useState<'dashboard' | 'posts' | 'chat' | 'finance'>('dashboard');
  const [privacyModelId, setPrivacyModelId] = useState<string>('');
  const [privacyPrice, setPrivacyPrice] = useState<number>(49.90);
  const [privacyDescription, setPrivacyDescription] = useState<string>('Bem-vindo ao meu perfil oficial! Conteúdo exclusivo todos os dias.');
  const [privacyPosts, setPrivacyPosts] = useState<Array<{ id: string; text: string; image: string; price: number; likes: number; date: string }>>([
    { id: '1', text: 'Ensaio exclusivo de sexta-feira liberado para assinantes!', image: '', price: 0, likes: 45, date: '1 dia atrás' },
    { id: '2', text: 'Vídeo completo do bastidor especial de hoje no privado!', image: '', price: 29.90, likes: 89, date: '2 dias atrás' }
  ]);
  const [privacyActiveChatId, setPrivacyActiveChatId] = useState<string>('c-1');
  const [privacyChats, setPrivacyChats] = useState<Array<{ id: string; name: string; avatar: string; messages: Array<{ sender: 'fan' | 'model'; text: string; time: string }>; lastMsg: string; isOnline: boolean }>>([
    {
      id: 'c-1',
      name: 'Carlos Souza',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100',
      messages: [
        { sender: 'fan', text: 'Oi linda! Amei seu último ensaio. Quando sai vídeo novo?', time: '14:20' }
      ],
      lastMsg: 'Oi linda! Amei seu último ensaio. Quando sai vídeo novo?',
      isOnline: true
    },
    {
      id: 'c-2',
      name: 'Rodrigo Mendes',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100',
      messages: [
        { sender: 'fan', text: 'Você faz chamada de vídeo personalizada?', time: 'Ontem' }
      ],
      lastMsg: 'Você faz chamada de vídeo personalizada?',
      isOnline: false
    },
    {
      id: 'c-3',
      name: 'Julio Cesar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
      messages: [
        { sender: 'fan', text: 'Quero assinar o plano anual, tem desconto?', time: '3 dias atrás' }
      ],
      lastMsg: 'Quero assinar o plano anual, tem desconto?',
      isOnline: true
    }
  ]);
  const [privacyTypedMsg, setPrivacyTypedMsg] = useState('');
  const [privacyIsTyping, setPrivacyIsTyping] = useState(false);
  const [privacyPostText, setPrivacyPostText] = useState('');
  const [privacyPostPrice, setPrivacyPostPrice] = useState('0');
  
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
  const [cardActiveImages, setCardActiveImages] = useState<Record<string, string>>({});
  
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

  // Helper to apply random sold models for this session (25 models)
  const applySessionSoldStatus = (allModels: Model[]): Model[] => {
    let soldIds: string[] = [];
    const storedSold = sessionStorage.getItem('hotmodel_session_sold_ids');
    if (storedSold) {
      try {
        soldIds = JSON.parse(storedSold);
      } catch (e) {
        soldIds = [];
      }
    }

    if (!soldIds || soldIds.length === 0) {
      // Pick 25 random models
      const shuffled = [...allModels].sort(() => 0.5 - Math.random());
      soldIds = shuffled.slice(0, 25).map(m => m.id);
      sessionStorage.setItem('hotmodel_session_sold_ids', JSON.stringify(soldIds));
    }

    return allModels.map(m => {
      if (soldIds.includes(m.id)) {
        return { ...m, isAvailable: false };
      }
      return m;
    });
  };

  // Initial Load
  useEffect(() => {
    initializeStorage();
    const initial = getModels();
    const withSold = applySessionSoldStatus(initial);
    setModels(withSold);

    // Find a default model for Privacy panel
    const sold = withSold.find(m => !m.isAvailable);
    if (sold) {
      setPrivacyModelId(sold.id);
    } else if (withSold.length > 0) {
      setPrivacyModelId(withSold[0].id);
    }

    setLeads(getLeads());
    setTransactions(getTransactions());
    setStats(getStats());
    
    // Check age verification
    const verified = localStorage.getItem('hotmodel_age_verified');
    if (!verified) {
      setAgeVerified(false);
    }

    // Hash routing for Admin Login/Dashboard and Privacy VIP Panel
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setRoute('admin-login');
      } else if (window.location.hash === '#privacy') {
        setRoute('privacy-panel');
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
    const initial = getModels();
    const withSold = applySessionSoldStatus(initial);
    setModels(withSold);
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
    
    // Privacy VIP is offered post-purchase as an order bump page, so initial checkout total does not include it.
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
      modelName: modelNamesStr,
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
    setCheckoutStep(5); // Transition to Post-Purchase Order Bump page
    
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

  // Filtered models sorted alphabetically (A-Z) by name
  const getFilteredModels = () => {
    let result = selectedCategory === 'Todos'
      ? [...models]
      : models.filter(m => m.categories.includes(selectedCategory));
    
    return result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
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
            <div key={model.id} className={`model-card ${model.isFeatured ? 'featured' : ''}`} style={{ opacity: model.isAvailable ? 1 : 0.85 }}>
              {model.isFeatured && <span className="model-badge">Destaque Elite</span>}
              {model.discountPercentage > 0 && (
                <span className="discount-badge">-{model.discountPercentage}% OFF</span>
              )}
              {!model.isAvailable && (
                <span className="model-badge" style={{ background: '#ef4444', left: 'auto', right: '15px' }}>Vendida</span>
              )}
              
              <div className="model-card-image-container">
                <img 
                  src={cardActiveImages[model.id] || model.cover} 
                  alt={model.name} 
                  className="model-card-img" 
                  style={{
                    filter: model.isAvailable ? 'none' : 'grayscale(0.8) brightness(0.5)'
                  }}
                />
                
                {/* Previews Thumbnails Grid/Row Overlay inside Card */}
                {model.gallery && model.gallery.length > 0 && (
                  <div 
                    className="card-thumbnails-overlay"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      display: 'flex',
                      gap: '5px',
                      padding: '8px 10px',
                      overflowX: 'auto',
                      background: 'linear-gradient(to top, rgba(15, 15, 21, 0.95) 60%, rgba(15, 15, 21, 0))',
                      zIndex: 3,
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      scrollbarWidth: 'none',
                    }}
                  >
                    {model.gallery.map((imgUrl, idx) => {
                      const isSelected = (cardActiveImages[model.id] || model.cover) === imgUrl;
                      return (
                        <img 
                          key={idx}
                          src={imgUrl}
                          alt={`${model.name} preview thumbnail ${idx + 1}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCardActiveImages(prev => ({
                              ...prev,
                              [model.id]: imgUrl
                            }));
                          }}
                          onMouseEnter={() => {
                            setCardActiveImages(prev => ({
                              ...prev,
                              [model.id]: imgUrl
                            }));
                          }}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '4px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: isSelected ? '2px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.2)',
                            opacity: isSelected ? 1 : 0.6,
                            flexShrink: 0,
                            transition: 'all 0.15s ease'
                          }}
                        />
                      );
                    })}
                  </div>
                )}
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
                </div>
                
                <div className="model-price-container">
                  <div className="price-block">
                    {model.discountPercentage > 0 && (
                      <span className="old-price">R$ {model.price.toFixed(2)}</span>
                    )}
                    <span className="new-price">R$ {discountPrice.toFixed(2)}</span>
                  </div>
                  
                  {model.isAvailable ? (
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
                  ) : (
                    <button 
                      className="btn" 
                      disabled
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#64748b',
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      Indisponível <Lock size={14} />
                    </button>
                  )}
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

  // RENDER PRIVACY PLATFORM SIMULATOR (CREATOR PANEL)
  const renderPrivacyPanel = () => {
    const activeModel = models.find(m => m.id === privacyModelId) || models[0] || {
      id: 'default',
      name: 'Modelo Demonstrativa',
      cover: 'https://picsum.photos/400/600',
      description: 'Biografia demonstrativa da modelo no Privacy.',
      price: 49.90,
      categories: ['VIP']
    };

    // Handle sending a message in the chat
    const handleSendPrivacyMsg = (e: React.FormEvent) => {
      e.preventDefault();
      if (!privacyTypedMsg.trim()) return;

      const userText = privacyTypedMsg.trim();
      const updatedChats = privacyChats.map(c => {
        if (c.id === privacyActiveChatId) {
          const newMessages = [
            ...c.messages,
            { sender: 'model' as const, text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ];
          return {
            ...c,
            messages: newMessages,
            lastMsg: userText
          };
        }
        return c;
      });

      setPrivacyChats(updatedChats);
      setPrivacyTypedMsg('');
      setPrivacyIsTyping(true);

      // Bot auto response simulation
      setTimeout(() => {
        let reply = "Amei falar com você! Me conta, de onde você é? 😘";
        const cleanText = userText.toLowerCase();
        if (cleanText.includes('foto') || cleanText.includes('video') || cleanText.includes('pack') || cleanText.includes('midia') || cleanText.includes('mídia')) {
          reply = "Nossa, acabei de liberar um vídeo super especial e trancado lá no meu Feed! Vai lá desbloquear ou quer que eu te mande aqui por R$ 29,90 no privado? 😈🔥";
        } else if (cleanText.includes('preço') || cleanText.includes('valor') || cleanText.includes('gratis') || cleanText.includes('grátis') || cleanText.includes('assinar')) {
          reply = "A assinatura do meu canal tá com super desconto! Você vai ter acesso a todo o meu acervo completo de ensaios e vídeos sem censura. Vem logo! 🥰";
        } else if (cleanText.includes('linda') || cleanText.includes('gostosa') || cleanText.includes('perfeita')) {
          reply = "Ah, muito obrigada pelo carinho! Você é muito fofo. Quer ver mais de pertinho? Assina meu canal VIP! 😉";
        }

        setPrivacyChats(prevChats => prevChats.map(c => {
          if (c.id === privacyActiveChatId) {
            const newMessages = [
              ...c.messages,
              { sender: 'fan' as const, text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            ];
            return {
              ...c,
              messages: newMessages,
              lastMsg: reply
            };
          }
          return c;
        }));
        setPrivacyIsTyping(false);
      }, 1500);
    };

    const handleCreatePost = (e: React.FormEvent) => {
      e.preventDefault();
      if (!privacyPostText.trim()) return;

      const price = parseFloat(privacyPostPrice) || 0;
      const newPost = {
        id: 'post-' + Date.now(),
        text: privacyPostText,
        image: activeModel.cover, // use current model's photo for the post
        price,
        likes: 0,
        date: 'Agora mesmo'
      };

      setPrivacyPosts([newPost, ...privacyPosts]);
      setPrivacyPostText('');
      setPrivacyPostPrice('0');
    };

    const activeChat = privacyChats.find(c => c.id === privacyActiveChatId) || privacyChats[0];

    return (
      <div className="privacy-container" style={{ width: '100%' }}>
        {/* SIDEBAR */}
        <aside className="privacy-sidebar">
          <div className="privacy-logo">
            <span>🛡️</span>
            <span>Privacy VIP</span>
          </div>

          {/* Profile Switcher */}
          <div className="privacy-profile-select-container">
            <label>Modelo Ativa</label>
            <select 
              className="privacy-profile-select"
              value={privacyModelId}
              onChange={e => {
                setPrivacyModelId(e.target.value);
                const selected = models.find(m => m.id === e.target.value);
                if (selected) {
                  setPrivacyPrice(selected.price);
                  setPrivacyDescription(`Página oficial de ${selected.name}. Conteúdo exclusivo e ensaios premium inéditos.`);
                }
              }}
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} {!m.isAvailable ? '(Adquirida)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation */}
          <div className="privacy-nav-list">
            <button 
              className={`privacy-nav-btn ${privacyTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setPrivacyTab('dashboard')}
            >
              <Layers size={18} />
              <span>Painel</span>
            </button>
            <button 
              className={`privacy-nav-btn ${privacyTab === 'posts' ? 'active' : ''}`}
              onClick={() => setPrivacyTab('posts')}
            >
              <Camera size={18} />
              <span>Meu Feed</span>
            </button>
            <button 
              className={`privacy-nav-btn ${privacyTab === 'chat' ? 'active' : ''}`}
              onClick={() => setPrivacyTab('chat')}
            >
              <Users size={18} />
              <span>Chats ({privacyChats.length})</span>
            </button>
            <button 
              className={`privacy-nav-btn ${privacyTab === 'finance' ? 'active' : ''}`}
              onClick={() => setPrivacyTab('finance')}
            >
              <DollarSign size={18} />
              <span>Financeiro</span>
            </button>
          </div>

          {/* Back button */}
          <button 
            onClick={() => { setRoute('home'); window.location.hash = ''; }} 
            className="privacy-nav-btn" 
            style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}
          >
            <LogOut size={18} />
            <span>Vitrine Pública</span>
          </button>
        </aside>

        {/* MAIN PANEL AREA */}
        <main className="privacy-main">
          {/* HEADER */}
          <header className="privacy-header">
            <div className="privacy-profile-badge">
              <img src={activeModel.cover} alt={activeModel.name} className="privacy-profile-avatar" />
              <div>
                <span className="privacy-profile-name" style={{ display: 'block' }}>{activeModel.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 600 }}>@creator_{activeModel.name.toLowerCase().replace(/\s+/g, '_')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span className="copy-badge" style={{ margin: 0, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
                🟢 Status: Simulação Online
              </span>
            </div>
          </header>

          {/* CONTENT TABS */}
          <div className="privacy-content">
            {/* TAB: DASHBOARD */}
            {privacyTab === 'dashboard' && (
              <div>
                <div style={{ marginBottom: '25px' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>Olá, {activeModel.name.split(' ')[0]}!</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aqui estão os resultados de conversão do seu perfil Privacy hoje.</p>
                </div>

                <div className="privacy-grid">
                  <div className="privacy-card">
                    <div className="privacy-stat-title">Faturamento Total</div>
                    <div className="privacy-stat-value">R$ 4.590,00</div>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>+ R$ 380,00 hoje</span>
                  </div>
                  <div className="privacy-card">
                    <div className="privacy-stat-title">Assinantes VIP</div>
                    <div className="privacy-stat-value">142</div>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>+ 5 novos hoje</span>
                  </div>
                  <div className="privacy-card">
                    <div className="privacy-stat-title">Mensalidade Atual</div>
                    <div className="privacy-stat-value">R$ {privacyPrice.toFixed(2)}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Definido por você</span>
                  </div>
                  <div className="privacy-card">
                    <div className="privacy-stat-title">Conversão Média</div>
                    <div className="privacy-stat-value">18.2%</div>
                    <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 600 }}>Alto rendimento</span>
                  </div>
                </div>

                <div className="privacy-card" style={{ marginTop: '20px' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '15px', fontWeight: 700 }}>Histórico de Atividades Recentes (Simulador)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <span style={{ color: '#34d399' }}>💰</span>
                      <span><strong>Carlos Souza</strong> assinou seu perfil exclusivo por R$ {privacyPrice.toFixed(2)}. <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(há 5 minutos)</span></span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <span style={{ color: '#ec4899' }}>💬</span>
                      <span><strong>Rodrigo Mendes</strong> enviou uma nova mensagem direta no chat. <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(há 12 minutos)</span></span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <span style={{ color: '#a855f7' }}>🔓</span>
                      <span><strong>Julio Cesar</strong> desbloqueou a mídia do feed trancada por R$ 29,90. <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(há 45 minutos)</span></span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                      <span style={{ color: '#3b82f6' }}>📈</span>
                      <span>Seu link do perfil foi compartilhado e recebeu <strong>1.402 cliques</strong> nas redes sociais. <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(hoje)</span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROFILE & FEED */}
            {privacyTab === 'posts' && (
              <div className="privacy-feed-center">
                {/* Profile Header card */}
                <div className="privacy-profile-header-card">
                  <img src={activeModel.cover} alt="Banner" className="privacy-banner-img" />
                  <div className="privacy-profile-info">
                    <img src={activeModel.cover} alt={activeModel.name} className="privacy-profile-info-avatar" />
                    
                    <div className="privacy-profile-details">
                      <h3>{activeModel.name}</h3>
                      <div className="handle">@official_{activeModel.name.toLowerCase().replace(/\s+/g, '')}</div>
                      
                      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '0.85rem' }}>
                        <span><strong>142</strong> assinantes</span>
                        <span><strong>{privacyPosts.length}</strong> publicações</span>
                        <span><strong>R$ {privacyPrice.toFixed(2)}/mês</strong></span>
                      </div>

                      {/* Bio Editor */}
                      <textarea 
                        className="privacy-post-textarea"
                        style={{ minHeight: '50px', fontSize: '0.85rem', marginBottom: '10px' }}
                        value={privacyDescription}
                        onChange={e => setPrivacyDescription(e.target.value)}
                        placeholder="Edite a biografia do perfil..."
                      />

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Preço da Assinatura:</span>
                        <input 
                          type="number"
                          value={privacyPrice}
                          onChange={e => setPrivacyPrice(parseFloat(e.target.value) || 0)}
                          style={{ width: '80px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '5px 8px', borderRadius: '6px', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Create post box */}
                <div className="privacy-post-editor">
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>Nova Publicação</h4>
                  <form onSubmit={handleCreatePost}>
                    <textarea 
                      className="privacy-post-textarea"
                      placeholder="Escreva algo novo para os seus assinantes..."
                      value={privacyPostText}
                      onChange={e => setPrivacyPostText(e.target.value)}
                      required
                    />
                    <div className="privacy-post-actions">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🔒 Cobrar por este post:</span>
                        <select 
                          value={privacyPostPrice}
                          onChange={e => setPrivacyPostPrice(e.target.value)}
                          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem' }}
                        >
                          <option value="0">Gratuito para assinantes</option>
                          <option value="19.90">R$ 19,90 (Paywall)</option>
                          <option value="29.90">R$ 29,90 (Paywall)</option>
                          <option value="49.90">R$ 49,90 (Paywall)</option>
                        </select>
                      </div>
                      <button type="submit" className="privacy-pink-btn">Publicar no Feed</button>
                    </div>
                  </form>
                </div>

                {/* Posts List */}
                {privacyPosts.map(post => (
                  <div key={post.id} className="privacy-post-card">
                    <div className="privacy-post-header">
                      <img src={activeModel.cover} alt={activeModel.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>{activeModel.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{post.date}</span>
                      </div>
                    </div>
                    <div className="privacy-post-body">{post.text}</div>
                    
                    {/* Simulated Post Image */}
                    <div className="privacy-post-media">
                      <img src={post.image || activeModel.cover} alt="Post media" />
                      {post.price > 0 && (
                        <div className="privacy-post-lock-overlay">
                          <Lock size={32} style={{ color: '#ec4899', marginBottom: '10px' }} />
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Conteúdo Exclusivo Desbloqueável</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Compre para liberar o acesso a este arquivo.</p>
                          <span className="privacy-pink-btn">Adquirir por R$ {post.price.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="privacy-post-footer">
                      <span>❤️ {post.likes} curtidas</span>
                      <span>💬 12 comentários</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: CHAT MESSAGES */}
            {privacyTab === 'chat' && (
              <div className="privacy-chat-layout">
                {/* Left contact list */}
                <div className="privacy-chat-sidebar">
                  <div className="privacy-chat-inbox-header">
                    <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Mensagens Privadas</h4>
                  </div>
                  <div className="privacy-chat-inbox-list">
                    {privacyChats.map(contact => (
                      <div 
                        key={contact.id}
                        className={`privacy-chat-contact-item ${contact.id === privacyActiveChatId ? 'active' : ''}`}
                        onClick={() => setPrivacyActiveChatId(contact.id)}
                      >
                        <div className="privacy-chat-contact-avatar-container">
                          <img src={contact.avatar} alt={contact.name} className="privacy-chat-contact-avatar" />
                          {contact.isOnline && <span className="privacy-chat-status-dot"></span>}
                        </div>
                        <div className="privacy-chat-contact-info">
                          <div className="privacy-chat-contact-name">
                            <span>{contact.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                              {contact.messages[contact.messages.length - 1]?.time || '10:00'}
                            </span>
                          </div>
                          <div className="privacy-chat-contact-snippet">
                            {contact.lastMsg}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right chat window */}
                <div className="privacy-chat-window">
                  {/* Chat header */}
                  <div className="privacy-chat-header">
                    <img src={activeChat.avatar} alt={activeChat.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{activeChat.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: activeChat.isOnline ? '#34d399' : 'var(--text-muted)' }}>
                        {activeChat.isOnline ? '● Online' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className="privacy-chat-messages-area">
                    {activeChat.messages.map((msg, i) => (
                      <div key={i} className={`privacy-chat-bubble-container ${msg.sender}`}>
                        <div className="privacy-chat-bubble">
                          {msg.text}
                        </div>
                        <span className="privacy-chat-bubble-time">{msg.time}</span>
                      </div>
                    ))}

                    {/* Bot is typing status */}
                    {privacyIsTyping && (
                      <div className="privacy-chat-bubble-container fan">
                        <div className="privacy-chat-bubble" style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 12px' }}>
                          {activeChat.name} está digitando...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input bar */}
                  <form onSubmit={handleSendPrivacyMsg} className="privacy-chat-input-area">
                    <input 
                      type="text" 
                      className="privacy-chat-input"
                      placeholder="Digite sua resposta de conversão (ex: Mídia de R$ 29,90)..."
                      value={privacyTypedMsg}
                      onChange={e => setPrivacyTypedMsg(e.target.value)}
                      disabled={privacyIsTyping}
                    />
                    <button type="submit" className="privacy-chat-send-btn" disabled={privacyIsTyping}>
                      <ArrowRight size={20} />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: FINANCE & WITHDRAW */}
            {privacyTab === 'finance' && (
              <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '20px' }}>Carteira Digital & Saques</h2>
                
                <div className="privacy-card" style={{ background: 'linear-gradient(135deg, #1e1b4b, #121215)', border: '1px solid rgba(236,72,153,0.15)', marginBottom: '30px', padding: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Saldo Disponível para Saque</span>
                      <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '8px', color: 'white' }}>R$ 4.210,00</h3>
                      <p style={{ fontSize: '0.8rem', color: '#ec4899', marginTop: '5px' }}>✓ R$ 380,00 em processamento futuro</p>
                    </div>
                    <button className="privacy-pink-btn" style={{ padding: '14px 28px', fontSize: '1rem' }} onClick={() => alert('Simulação: Saque enviado com sucesso para a sua conta Pix cadastrada!')}>
                      Sacar via PIX
                    </button>
                  </div>
                </div>

                <div className="privacy-card">
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '15px', fontWeight: 700 }}>Histórico de Transações do Painel</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <div>
                        <strong>Assinatura Mensal</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assinante: Carlos Souza</span>
                      </div>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>+ R$ {privacyPrice.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <div>
                        <strong>Mídia Privada Desbloqueada</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Comprador: Julio Cesar</span>
                      </div>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>+ R$ 29,90</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <div>
                        <strong>Assinatura Mensal</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assinante: Daniel Silva</span>
                      </div>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>+ R$ {privacyPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  };

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

  const getCheckoutTotal = () => {
    return getMainPrice() + getUpsell1Price();
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
      {route === 'privacy-panel' && renderPrivacyPanel()}

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

                {/* Preview Gallery Section */}
                {modelToUnlock.gallery && modelToUnlock.gallery.length > 0 && (
                  <div style={{ marginBottom: '25px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f472b6', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                      🔥 PRÉVIA DO ACERVO EXCLUSIVO DE {modelToUnlock.name.toUpperCase()} ({modelToUnlock.gallery.length} FOTOS/VÍDEOS)
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {modelToUnlock.gallery.slice(0, 4).map((img, idx) => {
                        return (
                          <div 
                            key={idx} 
                            style={{ 
                              position: 'relative', 
                              aspectRatio: '1/1', 
                              borderRadius: '8px', 
                              overflow: 'hidden',
                              border: '1px solid rgba(255,255,255,0.05)',
                              background: '#1e293b'
                            }}
                          >
                            <img 
                              src={img} 
                              alt={`Amostra ${idx + 1}`} 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease'
                              }} 
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                      <div>
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

                        {/* Upsell Model Preview Gallery */}
                        {(() => {
                          const upsellModel = models.find(m => m.id === upsell1ModelId);
                          if (upsellModel && upsellModel.gallery && upsellModel.gallery.length > 0) {
                            return (
                              <div style={{ marginTop: '15px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-secondary)', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                  🔥 PRÉVIA DO ACERVO DE {upsellModel.name.toUpperCase()} ({upsellModel.gallery.length} FOTOS/VÍDEOS)
                                </span>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                  {upsellModel.gallery.slice(0, 4).map((img, idx) => (
                                    <div 
                                      key={idx} 
                                      style={{ 
                                        position: 'relative', 
                                        aspectRatio: '1/1', 
                                        borderRadius: '8px', 
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        background: '#1e293b'
                                      }}
                                    >
                                      <img 
                                        src={img} 
                                        alt={`Upsell Amostra ${idx + 1}`} 
                                        style={{ 
                                          width: '100%', 
                                          height: '100%', 
                                          objectFit: 'cover'
                                        }} 
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>
                )}

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
                    {upsell2Active && (
                      <li style={{ color: '#ec4899', fontWeight: 600 }}>🌟 Acesso ao Gerador de Contas / Painel Privacy VIP liberado!</li>
                    )}
                  </ul>
                </div>

                {/* PREMIUM DOWNLOAD SECTION */}
                {models.filter(m => successModelNames.includes(m.name)).length > 0 && (
                  <div style={{ marginTop: '20px', marginBottom: '25px', textAlign: 'left' }}>
                    <h5 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📥 Acesso Imediato aos Arquivos:
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {models.filter(m => successModelNames.includes(m.name)).map(model => (
                        <div key={model.id} className="glass-card" style={{ padding: '12px 15px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <img 
                              src={model.cover} 
                              alt={model.name} 
                              style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                            <div>
                              <strong style={{ fontSize: '0.95rem', color: '#fff', display: 'block' }}>{model.name}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{model.photosCount} Fotos • {model.videosCount} Vídeos</div>
                            </div>
                          </div>
                          {model.delivery_links && model.delivery_links.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {model.delivery_links.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-primary"
                                  style={{ 
                                    padding: '10px 14px', 
                                    fontSize: '0.85rem', 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '8px', 
                                    background: 'linear-gradient(135deg, var(--color-primary), #d946ef)', 
                                    border: 'none',
                                    textDecoration: 'none',
                                    color: '#fff',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'opacity 0.2s'
                                  }}
                                >
                                  <ExternalLink size={16} /> 
                                  {model.delivery_links!.length > 1 ? `Acessar Pasta ${idx + 1}` : 'Acessar Link de Entrega'}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: '#64748b', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.05)' }}>
                              Nenhum link cadastrado para esta modelo.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {upsell2Active && (
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginBottom: '10px', background: 'linear-gradient(135deg, #ec4899, #d946ef)', border: 'none' }}
                    onClick={() => {
                      setRoute('privacy-panel');
                      window.location.hash = 'privacy';
                      setModelToUnlock(null);
                    }}
                  >
                    Acessar meu Painel Privacy VIP
                  </button>
                )}
                <button 
                  className={upsell2Active ? "btn btn-secondary" : "btn btn-primary"} 
                  style={{ width: '100%' }}
                  onClick={() => setModelToUnlock(null)}
                >
                  Concluir e Voltar
                </button>
              </div>
            )}

            {/* STEP 5: POST-PURCHASE PRIVACY ORDER BUMP */}
            {checkoutStep === 5 && (
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <div className="copy-badge" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', color: '#ec4899', fontSize: '0.8rem', padding: '6px 12px', display: 'inline-flex', marginBottom: '15px' }}>
                  🔥 OPORTUNIDADE ÚNICA: EXCLUSIVO PARA COMPRADORES
                </div>
                
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '12px', background: 'linear-gradient(135deg, #fff, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Ative o Painel Creator Privacy com 50% de Desconto!
                </h3>
                
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  Você acabou de adquirir sua modelo exclusiva! Agora, utilize nossa plataforma integrada para simular contas, publicar mídias bloqueadas por paywall, receber assinaturas de fãs reais simulados e converter leads no chat de alta performance como se fosse uma conta real do Privacy!
                </p>

                <div className="glass-card" style={{ padding: '16px', background: 'rgba(236,72,153,0.02)', borderColor: 'rgba(236,72,153,0.2)', textAlign: 'left', marginBottom: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#f472b6', fontWeight: 700 }}>Acesso Vitalício ao Simulador Privacy</span>
                    <span style={{ fontSize: '0.9rem', textDecoration: 'line-through', color: '#64748b' }}>R$ 79,90</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700 }}>Desconto de Cliente HotModel:</span>
                    <span style={{ fontSize: '1.3rem', color: '#34d399', fontWeight: 900 }}>R$ 49,90 (50% OFF)</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    * Oferta válida apenas nesta página. Ao recusar, o acesso de R$ 49,90 será perdido e o preço voltará ao valor original de R$ 79,90.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    className="btn btn-primary"
                    style={{ width: '100%', background: 'linear-gradient(135deg, #ec4899, #d946ef)', border: 'none', padding: '14px', fontWeight: 700 }}
                    onClick={() => {
                      setUpsell2Active(true);
                      setSuccessTotal(prev => prev + 49.90);
                      const transactionsList = JSON.parse(localStorage.getItem('hotmodel_transactions') || '[]');
                      if (transactionsList.length > 0) {
                        transactionsList[0].amount += 49.90;
                        transactionsList[0].modelName += ' + Privacy VIP';
                        localStorage.setItem('hotmodel_transactions', JSON.stringify(transactionsList));
                        refreshData();
                      }
                      setCheckoutStep(4);
                    }}
                  >
                    🚀 Sim! Adicionar Painel Privacy VIP por R$ 49,90
                  </button>
                  <button 
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
                    onClick={() => {
                      setUpsell2Active(false);
                      setCheckoutStep(4);
                    }}
                  >
                    Não tenho interesse, levar para os meus downloads ➔
                  </button>
                </div>
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
