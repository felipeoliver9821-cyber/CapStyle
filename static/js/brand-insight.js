/* =====================================================
   CapStyle Brand Insight™
   Sistema de Análise Simulada de Marca
   Front-end only | Isolated scope | Production-safe
===================================================== */

(() => {
  document.addEventListener("DOMContentLoaded", () => {

    /* ========================
       ROOT
    ======================== */

    const root = document.querySelector("#brand-insight");
    if (!root) return;

    /* ========================
       STATE (ISOLATED)
    ======================== */

    const state = {
      objetivo: null,
      exigencia: 2,
      lastProcessId: 0,
      analysisId: null,
      analysisDate: null,
      hasAnimatedIn: false,
      scores: {
        impacto: 0,
        consistencia: 0,
        risco: 0
      }
    };

    /* ========================
       MAPAS DE INTELIGÊNCIA
    ======================== */

    const ObjetivoMap = {
      branding: {
        label: "Branding de marca",
        pesoImpacto: 1.4,
        pesoConsistencia: 1.3,
        pesoRisco: 1.2,
        insight: {
          baixo: "Marcas focadas em branding perdem autoridade quando não mantêm consistência visual.",
          medio: "A consistência visual já gera reconhecimento, mas ainda há margem de profissionalização.",
          alto: "Marcas com foco em branding e alto padrão ampliam recall e percepção premium.",
          premium: "Produção premium consolida identidade e diferencia sua marca no mercado."
        }
      },
      uniforme: {
        label: "Uniforme / equipe",
        pesoImpacto: 1.1,
        pesoConsistencia: 1.5,
        pesoRisco: 1.3,
        insight: {
          baixo: "Uniformes sem padrão reduzem percepção de organização.",
          medio: "Padronização básica melhora a imagem interna e externa.",
          alto: "Uniformes bem produzidos elevam profissionalismo da equipe.",
          premium: "Uniformização premium transmite autoridade e confiança imediata."
        }
      },
      evento: {
        label: "Evento / ação promocional",
        pesoImpacto: 1.5,
        pesoConsistencia: 1.0,
        pesoRisco: 1.4,
        insight: {
          baixo: "Eventos com baixa qualidade visual reduzem lembrança da marca.",
          medio: "Boa execução visual aumenta engajamento pontual.",
          alto: "Produção estratégica amplia alcance pós-evento.",
          premium: "Eventos com produção premium criam forte impacto e memorização."
        }
      },
      revenda: {
        label: "Revenda / produto final",
        pesoImpacto: 1.3,
        pesoConsistencia: 1.4,
        pesoRisco: 1.5,
        insight: {
          baixo: "Produtos inconsistentes geram devoluções e insatisfação.",
          medio: "Qualidade aceitável sustenta vendas básicas.",
          alto: "Produção de alto padrão aumenta valor percebido.",
          premium: "Produtos premium fortalecem marca e margens."
        }
      },
      corporativo: {
        label: "Presente corporativo",
        pesoImpacto: 1.2,
        pesoConsistencia: 1.3,
        pesoRisco: 1.2,
        insight: {
          baixo: "Presentes genéricos passam pouco valor institucional.",
          medio: "Personalização básica já diferencia.",
          alto: "Presentes bem produzidos fortalecem relações.",
          premium: "Produção premium transmite cuidado e posicionamento."
        }
      }
    };

    const ExigenciaMap = {
      1: { label: "Essencial", fator: 0.8 },
      2: { label: "Profissional", fator: 1.0 },
      3: { label: "Alto padrão", fator: 1.2 },
      4: { label: "Premium", fator: 1.4 }
    };

    /* ========================
       DOM
    ======================== */

    const options = root.querySelectorAll(".bi-option");
    const firstOption = options[0];
    const range = root.querySelector("#exigenciaRange");
    const processingText = root.querySelector(".bi-processing-text");

    const resObjetivo = root.querySelector("#resObjetivo");
    const resExigencia = root.querySelector("#resExigencia");

    const impactoValor = root.querySelector("#impactoValor");
    const consistenciaValor = root.querySelector("#consistenciaValor");
    const riscoValor = root.querySelector("#riscoValor");

    const insightEl = root.querySelector("#biInsight");
    const ctaWhatsapp = root.querySelector("#biWhatsappBtn");

    const btnHeader = document.querySelector(".btn-header");
    const navbar = document.querySelector(".navbar");

    /* ========================
       UTILS
    ======================== */

    const delay = ms => new Promise(r => setTimeout(r, ms));
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    const randomize = (base, variance = 6) => {
      const delta = Math.floor(Math.random() * variance * 2) - variance;
      return clamp(Math.round(base + delta), 10, 100);
    };

    function generateAnalysisId() {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let id = "A-";
      for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
    }

    function getFormattedDateTime() {
      const now = new Date();
      return (
        now.toLocaleDateString("pt-BR") +
        " às " +
        now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      );
    }

    /* ========================
       CORE PROCESS
    ======================== */

    async function processAnalysis() {
      if (!state.objetivo) return;

      const processId = ++state.lastProcessId;

      if (!state.analysisId) {
        state.analysisId = generateAnalysisId();
        state.analysisDate = getFormattedDateTime();
      }

      processingText.textContent = "Analisando estrutura da marca…";
      await delay(600);
      if (processId !== state.lastProcessId) return;

      processingText.textContent = "Aplicando parâmetros de produção…";
      await delay(600);
      if (processId !== state.lastProcessId) return;

      processingText.textContent = "Calculando impacto visual e risco…";
      await delay(600);
      if (processId !== state.lastProcessId) return;

      calculateScores();
      updateUI();

      processingText.textContent =
        `Análise ${state.analysisId} concluída em ${state.analysisDate}`;
    }

    /* ========================
       CALCULATIONS
    ======================== */

    function calculateScores() {
      const obj = ObjetivoMap[state.objetivo];
      const exig = ExigenciaMap[state.exigencia];

      state.scores.impacto = randomize(55 * obj.pesoImpacto * exig.fator);
      state.scores.consistencia = randomize(50 * obj.pesoConsistencia * exig.fator);
      state.scores.risco = randomize(60 / (obj.pesoRisco * exig.fator));
    }

    /* ========================
       UI UPDATE
    ======================== */

    function updateUI() {
      const obj = ObjetivoMap[state.objetivo];
      const exig = ExigenciaMap[state.exigencia];

      resObjetivo.textContent = obj.label;
      resExigencia.textContent = exig.label;

      impactoValor.textContent = `${state.scores.impacto}%`;
      consistenciaValor.textContent = `${state.scores.consistencia}%`;
      riscoValor.textContent = `${state.scores.risco}%`;

      const level =
        state.exigencia === 1 ? "baixo" :
        state.exigencia === 2 ? "medio" :
        state.exigencia === 3 ? "alto" :
        "premium";

      insightEl.textContent = obj.insight[level];

      ctaWhatsapp.disabled = false;
      ctaWhatsapp.setAttribute("aria-disabled", "false");
    }

    /* ========================
       SECTION HIGHLIGHT + ANIMATION
    ======================== */

    function highlightSection() {
      root.classList.add("bi-focus");
      setTimeout(() => {
        root.classList.remove("bi-focus");
      }, 1200);
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !state.hasAnimatedIn) {
          state.hasAnimatedIn = true;
          root.classList.add("bi-visible");
          highlightSection();

          // foco no primeiro botão (UX)
          setTimeout(() => {
            firstOption?.focus();
          }, 500);
        }
      });
    }, { threshold: 0.35 });

    observer.observe(root);

    /* ========================
       WHATSAPP CTA
    ======================== */

    ctaWhatsapp.addEventListener("click", () => {
      if (!state.objetivo) return;

      const obj = ObjetivoMap[state.objetivo];
      const exig = ExigenciaMap[state.exigencia];

      const mensagem = `
Olá! Realizei uma análise no site da CapStyle.

🧠 Análise: ${state.analysisId}
🕒 Data: ${state.analysisDate}

🎯 Objetivo do boné:
${obj.label}

⭐ Nível de exigência da marca:
${exig.label}

Quero continuar a análise e receber uma proposta no padrão correto.
      `.trim();

      const phone = "556294536745";
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensagem)}`;

      window.open(url, "_blank", "noopener");
    });

    /* ========================
       HEADER CTA (SCROLL)
    ======================== */

    if (btnHeader) {
      btnHeader.addEventListener("click", () => {
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const target =
          root.getBoundingClientRect().top +
          window.pageYOffset -
          navbarHeight -
          20;

        window.scrollTo({ top: target, behavior: "smooth" });
      });
    }

    /* ========================
       EVENTS
    ======================== */

    options.forEach(btn => {
      btn.addEventListener("click", () => {
        options.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        state.objetivo = btn.dataset.objetivo;
        processAnalysis();
      });
    });

    range.addEventListener("input", e => {
      state.exigencia = Number(e.target.value);
      processAnalysis();
    });

    /* ========================
       INIT
    ======================== */

    processingText.textContent =
      "Selecione o objetivo e ajuste o nível de exigência para iniciar a análise.";

  });
})();
