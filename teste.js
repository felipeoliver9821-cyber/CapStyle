/* =====================================================
   Brand Impact Control Panel
   Engine v1.0
   CapStyle
===================================================== */

/* =========================
   GLOBAL STATE
========================= */

const state = {
  activeTab: 'impacto',
  brandLevel: 2, // 1 = básico | 2 = intermediário | 3 = premium
  metrics: {
    valor: 35,
    consistencia: 50,
    risco: 75
  }
};

/* =========================
   DOM ELEMENTS
========================= */

const tabs = document.querySelectorAll('.tab');
const statusTitle = document.querySelector('.status h3');
const statusText = document.querySelector('.status p');
const alertBox = document.querySelector('.panel-alert');
const ctaButton = document.querySelector('.primary-cta');

const metricFills = {
  valor: document.querySelectorAll('.metric-fill')[0],
  consistencia: document.querySelectorAll('.metric-fill')[1],
  risco: document.querySelectorAll('.metric-fill')[2]
};

/* =========================
   DATA MODELS
========================= */

const scenarios = {
  impacto: {
    title: 'Produção sem padrão definido',
    text: 'Marcas nesse estágio competem por preço e dependem de volume para sobreviver. Pequenos erros acumulam impacto negativo ao longo do tempo.',
    metrics: { valor: 35, consistencia: 50, risco: 75 },
    alert: 'A falta de controle produtivo afeta percepção antes de afetar vendas.',
    cta: 'Produzir no padrão certo'
  },

  marca: {
    title: 'Marca em construção',
    text: 'Aqui a marca já é percebida, mas ainda sofre com inconsistências. Cada detalhe influencia a confiança do cliente.',
    metrics: { valor: 55, consistencia: 60, risco: 45 },
    alert: 'Inconsistência visual e produtiva limita crescimento orgânico.',
    cta: 'Fortalecer identidade da marca'
  },

  risco: {
    title: 'Zona crítica de percepção',
    text: 'Neste cenário, o risco não está no produto, mas na experiência. Clientes não reclamam — apenas não retornam.',
    metrics: { valor: 40, consistencia: 45, risco: 85 },
    alert: 'O maior risco é parecer amador em um mercado competitivo.',
    cta: 'Eliminar riscos de produção'
  }
};

/* =========================
   UTILS
========================= */

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function animateBar(element, target) {
  let current = 0;
  const speed = 2;

  function step() {
    if (current < target) {
      current += speed;
      element.style.width = current + '%';
      requestAnimationFrame(step);
    } else {
      element.style.width = target + '%';
    }
  }

  step();
}

/* =========================
   RENDER FUNCTIONS
========================= */

function renderMetrics(metrics) {
  animateBar(metricFills.valor, metrics.valor);
  animateBar(metricFills.consistencia, metrics.consistencia);
  animateBar(metricFills.risco, metrics.risco);
}

function renderStatus(title, text) {
  statusTitle.innerText = title;
  statusText.innerText = text;
}

function renderAlert(text) {
  alertBox.innerHTML = `<strong>Atenção:</strong> ${text}`;
}

function renderCTA(text) {
  ctaButton.innerText = text;
}

/* =========================
   BRAND LEVEL LOGIC
========================= */

function evaluateBrandLevel(metrics) {
  const score =
    metrics.valor * 0.4 +
    metrics.consistencia * 0.4 -
    metrics.risco * 0.2;

  if (score < 40) return 1;
  if (score < 65) return 2;
  return 3;
}

function applyBrandLevel(level) {
  document.body.dataset.brandLevel = level;

  if (level === 1) {
    alertBox.style.background = 'rgba(235,87,87,0.15)';
  } else if (level === 2) {
    alertBox.style.background = 'rgba(242,201,76,0.12)';
  } else {
    alertBox.style.background = 'rgba(111,177,255,0.12)';
  }
}

/* =========================
   TAB HANDLING
========================= */

function switchTab(tabName) {
  state.activeTab = tabName;

  tabs.forEach(tab => {
    tab.classList.toggle(
      'active',
      tab.innerText.toLowerCase() === tabName
    );
  });

  const scenario = scenarios[tabName];

  state.metrics = scenario.metrics;
  state.brandLevel = evaluateBrandLevel(scenario.metrics);

  renderStatus(scenario.title, scenario.text);
  renderMetrics(scenario.metrics);
  renderAlert(scenario.alert);
  renderCTA(scenario.cta);
  applyBrandLevel(state.brandLevel);
}

/* =========================
   CTA INTERACTION
========================= */

ctaButton.addEventListener('mouseenter', () => {
  ctaButton.style.transform = 'translateY(-2px)';
});

ctaButton.addEventListener('mouseleave', () => {
  ctaButton.style.transform = 'translateY(0)';
});

ctaButton.addEventListener('click', () => {
  // Futuro: redirecionar para catálogo
  alert('Direcionando para soluções CapStyle...');
});

/* =========================
   TAB EVENTS
========================= */

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const name = tab.innerText.toLowerCase();
    switchTab(name);
  });
});

/* =========================
   INITIALIZATION
========================= */

function init() {
  switchTab('impacto');
}

init();

/* =========================
   FUTURE EXTENSIONS (READY)
========================= */

/*
- Integração com dados reais
- Persistência de estado
- A/B testing
- Tracking de decisão
- Personalização por tipo de cliente
- Integração com orçamento
- Simulação por volume
- Simulação por ticket médio
- Heatmap de interação
- Score de maturidade de marca
- Comparação com benchmark do mercado
*/
