import initialModels from './initialModels.json';

export interface Model {
  id: string;
  name: string;
  cover: string;
  description: string;
  price: number;
  discountPercentage: number;
  buyLink: string;
  categories: string[];
  photosCount: number;
  videosCount: number;
  isFeatured: boolean;
  isAvailable: boolean;
  returnDays: number;
  views: number;
  earnings: number;
}

export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  modelId: string;
  modelName: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  customerName: string;
  customerEmail: string;
  modelName: string;
  amount: number;
  status: 'Aprovado' | 'Pendente' | 'Cancelado';
  createdAt: string;
}

export interface AdminUser {
  username: string;
  passwordHash: string;
}

const DEFAULT_MODELS: Model[] = initialModels as Model[];

const DEFAULT_LEADS: Lead[] = [];
const DEFAULT_TRANSACTIONS: Transaction[] = [];

// Inicializar localStorage se estiver vazio ou com o catálogo antigo
export const initializeStorage = () => {
  const storedModels = localStorage.getItem('hotmodel_models');
  let resetModels = false;
  if (storedModels) {
    try {
      const parsed = JSON.parse(storedModels);
      if (Array.isArray(parsed) && parsed.length < 10) {
        resetModels = true; // migração do catálogo de testes antigo
      }
    } catch (e) {
      resetModels = true;
    }
  } else {
    resetModels = true;
  }

  if (resetModels) {
    localStorage.setItem('hotmodel_models', JSON.stringify(DEFAULT_MODELS));
  }
  if (!localStorage.getItem('hotmodel_leads')) {
    localStorage.setItem('hotmodel_leads', JSON.stringify(DEFAULT_LEADS));
  }
  if (!localStorage.getItem('hotmodel_transactions')) {
    localStorage.setItem('hotmodel_transactions', JSON.stringify(DEFAULT_TRANSACTIONS));
  }
  if (!localStorage.getItem('hotmodel_admin_user')) {
    localStorage.setItem('hotmodel_admin_user', JSON.stringify({ username: 'admin', passwordHash: 'admin' }));
  }
};

// Modelos CRUD
export const getModels = (): Model[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem('hotmodel_models') || '[]');
};

export const saveModels = (models: Model[]) => {
  localStorage.setItem('hotmodel_models', JSON.stringify(models));
};

export const addModel = (model: Omit<Model, 'id' | 'views' | 'earnings'>): Model => {
  const models = getModels();
  const newModel: Model = {
    ...model,
    id: Date.now().toString(),
    views: 0,
    earnings: 0
  };
  models.push(newModel);
  saveModels(models);
  return newModel;
};

export const updateModel = (updatedModel: Model) => {
  const models = getModels();
  const index = models.findIndex(m => m.id === updatedModel.id);
  if (index !== -1) {
    models[index] = updatedModel;
    saveModels(models);
  }
};

export const deleteModel = (id: string) => {
  const models = getModels();
  const filtered = models.filter(m => m.id !== id);
  saveModels(filtered);
};

// Leads CRUD
export const getLeads = (): Lead[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem('hotmodel_leads') || '[]');
};

export const addLead = (lead: Omit<Lead, 'id' | 'createdAt'>): Lead => {
  const leads = getLeads();
  const newLead: Lead = {
    ...lead,
    id: 'lead-' + Date.now(),
    createdAt: new Date().toISOString()
  };
  leads.unshift(newLead); // Adicionar no topo
  localStorage.setItem('hotmodel_leads', JSON.stringify(leads));
  return newLead;
};

export const deleteLead = (id: string) => {
  const leads = getLeads();
  const filtered = leads.filter(l => l.id !== id);
  localStorage.setItem('hotmodel_leads', JSON.stringify(filtered));
};

// Transações CRUD
export const getTransactions = (): Transaction[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem('hotmodel_transactions') || '[]');
};

export const addTransaction = (trans: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
  const transactions = getTransactions();
  const newTrans: Transaction = {
    ...trans,
    id: 'trans-' + Date.now(),
    createdAt: new Date().toISOString()
  };
  transactions.unshift(newTrans);
  localStorage.setItem('hotmodel_transactions', JSON.stringify(transactions));
  return newTrans;
};

// Estatísticas Gerais
export interface Stats {
  totalRevenue: number;
  approvedSales: number;
  pendingSales: number;
  totalLeads: number;
  conversionRate: number;
}

export const getStats = (): Stats => {
  const transactions = getTransactions();
  const leads = getLeads();
  
  const approved = transactions.filter(t => t.status === 'Aprovado');
  const pending = transactions.filter(t => t.status === 'Pendente');
  
  const totalRevenue = approved.reduce((acc, curr) => acc + curr.amount, 0);
  const totalLeads = leads.length;
  
  // Taxa de conversão = vendas aprovadas / (leads + vendas aprovadas)
  const denominator = totalLeads + approved.length;
  const conversionRate = denominator > 0 ? (approved.length / denominator) * 100 : 0;
  
  return {
    totalRevenue,
    approvedSales: approved.length,
    pendingSales: pending.length,
    totalLeads,
    conversionRate
  };
};

// Configuração do Admin
export const getAdminUser = (): AdminUser => {
  initializeStorage();
  return JSON.parse(localStorage.getItem('hotmodel_admin_user') || '{"username":"admin","passwordHash":"admin"}');
};

export const updateAdminPassword = (newPassword: string) => {
  const user = getAdminUser();
  user.passwordHash = newPassword;
  localStorage.setItem('hotmodel_admin_user', JSON.stringify(user));
};
