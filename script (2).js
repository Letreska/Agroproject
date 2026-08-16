/* =====================================================
   PORTAL AGROCONECTA — script.js
   Organizado por módulos independentes.
===================================================== */

// ============================================
// ARMAZENAMENTO SEGURO
// Alguns navegadores bloqueiam localStorage quando o arquivo é aberto
// diretamente (protocolo file://) em vez de por um servidor. Esse wrapper
// evita que o site inteiro pare de funcionar nesse caso: se o localStorage
// não estiver disponível, os dados ficam apenas em memória durante a sessão.
// ============================================
const storage = (() => {
  let available = true;
  try {
    const testKey = '__agro_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
  } catch (e) {
    available = false;
    console.warn('AgroConecta: localStorage indisponível neste navegador/contexto. O progresso não será salvo entre visitas.');
  }
  const memory = {};
  return {
    getItem(key) { return available ? window.localStorage.getItem(key) : (key in memory ? memory[key] : null); },
    setItem(key, value) { if (available) { window.localStorage.setItem(key, value); } else { memory[key] = String(value); } },
    removeItem(key) { if (available) { window.localStorage.removeItem(key); } else { delete memory[key]; } }
  };
})();

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // CONFIGURAÇÃO CENTRAL DE IMAGENS DO PROJETO
  // Substitua as URLs abaixo pelos links reais quando disponíveis.
  // As 3 imagens fornecidas pelo projeto têm prioridade visual.
  // ============================================
  const imagens = {
    // IMAGEM FORNECIDA — água e sustentabilidade (mãos recebendo água)
    agua: "COLE_AQUI_O_LINK_DA_IMAGEM_DE_AGUA",
    // IMAGEM FORNECIDA — estudantes na horta escolar
    horta: "COLE_AQUI_O_LINK_DA_IMAGEM_DA_HORTA",
    // IMAGEM FORNECIDA — mãos segurando planta / sustentabilidade e futuro
    sustentabilidade: "COLE_AQUI_O_LINK_DA_IMAGEM_DE_SUSTENTABILIDADE"
  };

  function aplicarImagens() {
    const mapa = [
      { id: 'imgHeroAgua', src: imagens.agua, alt: 'Mãos recebendo água — uso consciente dos recursos hídricos' },
      { id: 'imgPilares', src: imagens.sustentabilidade, alt: 'Mãos segurando uma planta, representando sustentabilidade e futuro' },
      { id: 'imgHorta', src: imagens.horta, alt: 'Estudantes cuidando de uma horta escolar' }
    ];
    mapa.forEach(item => {
      const el = document.getElementById(item.id);
      if (!el) return;
      const valido = item.src && !item.src.startsWith('COLE_AQUI');
      if (valido) {
        el.src = item.src;
        el.alt = item.alt;
        el.onerror = () => { el.removeAttribute('src'); };
      }
      // Se não houver imagem válida, o CSS mantém um fundo em gradiente elegante no lugar (fallback).
    });
  }
  aplicarImagens();

  // ============================================
  // TOAST (feedback rápido)
  // ============================================
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
  }

  // ============================================
  // NAVBAR: hambúrguer + indicador de seção ativa
  // ============================================
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }));

  const sections = document.querySelectorAll('main section[id], .hero[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => a.classList.toggle('active', a.dataset.section === id));
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  sections.forEach(s => sectionObserver.observe(s));

  // ============================================
  // PAINEL DE ACESSIBILIDADE
  // ============================================
  const a11yToggle = document.getElementById('a11yToggle');
  const a11yPanel = document.getElementById('a11yPanel');
  a11yToggle.addEventListener('click', () => {
    const isHidden = a11yPanel.hasAttribute('hidden');
    if (isHidden) { a11yPanel.removeAttribute('hidden'); } else { a11yPanel.setAttribute('hidden', ''); }
    a11yToggle.setAttribute('aria-expanded', isHidden);
  });

  const root = document.documentElement;
  let fontScale = parseFloat(storage.getItem('agro_fontScale')) || 1;
  function applyFontScale() { root.style.setProperty('--font-scale', fontScale); storage.setItem('agro_fontScale', fontScale); }
  applyFontScale();
  document.getElementById('fontIncrease').addEventListener('click', () => { fontScale = Math.min(1.3, fontScale + 0.1); applyFontScale(); });
  document.getElementById('fontDecrease').addEventListener('click', () => { fontScale = Math.max(0.85, fontScale - 0.1); applyFontScale(); });
  document.getElementById('fontReset').addEventListener('click', () => { fontScale = 1; applyFontScale(); });

  const contrastToggle = document.getElementById('contrastToggle');
  let highContrast = storage.getItem('agro_highContrast') === 'true';
  function applyContrast() {
    document.body.classList.toggle('high-contrast', highContrast);
    contrastToggle.setAttribute('aria-checked', highContrast);
    storage.setItem('agro_highContrast', highContrast);
  }
  applyContrast();
  contrastToggle.addEventListener('click', () => { highContrast = !highContrast; applyContrast(); });

  const motionToggle = document.getElementById('motionToggle');
  let reduceMotion = storage.getItem('agro_reduceMotion') === 'true';
  function applyMotion() {
    document.body.classList.toggle('reduce-motion', reduceMotion);
    motionToggle.setAttribute('aria-checked', reduceMotion);
    storage.setItem('agro_reduceMotion', reduceMotion);
  }
  applyMotion();
  motionToggle.addEventListener('click', () => { reduceMotion = !reduceMotion; applyMotion(); });

  // ============================================
  // REVEAL ON SCROLL
  // ============================================
  const revealTargets = document.querySelectorAll('.reveal, .challenge-card, .pillar-card, .practice-card, .reflection-card, .timeline__step');
  revealTargets.forEach(el => el.classList.add('reveal'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => revealObserver.observe(el));

  // ============================================
  // HERO — contadores animados
  // ============================================
  const counters = document.querySelectorAll('.hero__stat-num');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      let current = 0;
      const step = Math.max(1, Math.round(target / 40));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
      }, 30);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countObserver.observe(c));

  document.getElementById('scrollCue').addEventListener('click', () => {
    document.getElementById('projeto').scrollIntoView({ behavior: 'smooth' });
  });

  // ============================================
  // PILARES DA SUSTENTABILIDADE — modal
  // ============================================
  const pillarData = {
    agua: { icon: 'fa-droplet', title: 'Água', text: 'Uso consciente, reaproveitamento e irrigação eficiente. Pequenas mudanças, como captar água da chuva ou irrigar no horário certo, reduzem muito o desperdício sem afetar a produção.' },
    solo: { icon: 'fa-mound', title: 'Solo', text: 'Rotação de culturas, cobertura do solo, compostagem e manejo adequado mantêm a terra fértil por mais tempo e reduzem a necessidade de insumos externos.' },
    biodiversidade: { icon: 'fa-leaf', title: 'Biodiversidade', text: 'Proteção de espécies, polinizadores e equilíbrio dos ecossistemas garantem que a produção continue sendo possível no longo prazo.' },
    tecnologia: { icon: 'fa-microchip', title: 'Tecnologia', text: 'Sensores, dados e automação ajudam a tomar decisões melhores — como saber exatamente quando irrigar ou adubar, evitando desperdício.' }
  };
  const pillarModal = document.getElementById('pillarModal');
  document.querySelectorAll('.pillar-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const data = pillarData[btn.dataset.pillar];
      document.getElementById('pillarModalIcon').innerHTML = `<i class="fa-solid ${data.icon}" aria-hidden="true"></i>`;
      document.getElementById('pillarModalTitle').textContent = data.title;
      document.getElementById('pillarModalText').textContent = data.text;
      openModal(pillarModal);
    });
  });

  function openModal(modal) {
    modal.removeAttribute('hidden');
    const box = modal.querySelector('.modal__box');
    box.querySelector('.modal__close, button, h3').focus?.();
  }
  function closeModal(modal) { modal.setAttribute('hidden', ''); }
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => el.closest('.modal').setAttribute('hidden', ''));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { document.querySelectorAll('.modal:not([hidden])').forEach(closeModal); }
  });

  // ============================================
  // CALCULADORA DE PEGADA ECOLÓGICA
  // ============================================
  const calcForm = document.getElementById('calcForm');
  const calcError = document.getElementById('calcError');
  const calcEmpty = document.getElementById('calcEmpty');
  const calcFilled = document.getElementById('calcFilled');

  calcForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const area = parseFloat(document.getElementById('areaProp').value);
    const agua = parseFloat(document.getElementById('consumoAgua').value);
    const residuos = parseFloat(document.getElementById('residuos').value);

    if (isNaN(area) || area <= 0 || isNaN(agua) || agua < 0 || isNaN(residuos) || residuos < 0) {
      calcError.textContent = 'Verifique os valores numéricos: eles precisam ser positivos.';
      calcError.hidden = false;
      return;
    }
    calcError.hidden = true;

    const freq = document.getElementById('freqIrrigacao').value;
    const energia = document.getElementById('energiaEletrica').value;
    const combustivel = document.getElementById('combustivel').value;
    const compostagem = document.getElementById('compostagem').checked;
    const reaproveitaAgua = document.getElementById('reaproveitaAgua').checked;
    const energiaRenovavel = document.getElementById('energiaRenovavel').checked;
    const conservacaoSolo = document.getElementById('conservacaoSolo').checked;

    // Cálculo educativo (não científico) por categoria, 0-100
    let scoreAgua = 100;
    scoreAgua -= Math.min(40, (agua / (area * 25)) * 20);
    scoreAgua -= freq === 'alta' ? 18 : freq === 'media' ? 8 : 0;
    scoreAgua += reaproveitaAgua ? 15 : 0;
    scoreAgua = clamp(scoreAgua);

    let scoreSolo = 100;
    scoreSolo -= conservacaoSolo ? 0 : 25;
    scoreSolo -= combustivel === 'muito' ? 15 : combustivel === 'pouco' ? 5 : 0;
    scoreSolo += conservacaoSolo ? 5 : 0;
    scoreSolo = clamp(scoreSolo);

    let scoreEnergia = 100;
    scoreEnergia -= energia === 'alto' ? 30 : energia === 'medio' ? 12 : 0;
    scoreEnergia -= combustivel === 'muito' ? 20 : combustivel === 'pouco' ? 8 : 0;
    scoreEnergia += energiaRenovavel ? 20 : 0;
    scoreEnergia = clamp(scoreEnergia);

    let scoreResiduos = 100;
    scoreResiduos -= Math.min(35, (residuos / (area * 10)) * 20);
    scoreResiduos += compostagem ? 20 : 0;
    scoreResiduos = clamp(scoreResiduos);

    const total = Math.round((scoreAgua + scoreSolo + scoreEnergia + scoreResiduos) / 4);

    calcEmpty.hidden = true;
    calcFilled.hidden = false;

    animateGauge(total);
    document.getElementById('gaugeValue').textContent = total;

    let classText = '';
    if (total >= 80) classText = '🟢 Excelente performance sustentável';
    else if (total >= 60) classText = '🟢 Boa performance sustentável';
    else if (total >= 40) classText = '🟡 Performance moderada — há espaço para melhorar';
    else classText = '🔴 Atenção — vários pontos podem ser melhorados';
    document.getElementById('calcClass').textContent = classText;

    setBar('barAgua', 'barAguaVal', scoreAgua);
    setBar('barSolo', 'barSoloVal', scoreSolo);
    setBar('barEnergia', 'barEnergiaVal', scoreEnergia);
    setBar('barResiduos', 'barResiduosVal', scoreResiduos);

    const categorias = [
      { nome: 'consumo de água', valor: scoreAgua, dica: 'avaliar sistemas de irrigação mais eficientes e reaproveitamento de água' },
      { nome: 'manejo do solo', valor: scoreSolo, dica: 'praticar rotação de culturas e cobertura do solo' },
      { nome: 'uso de energia', valor: scoreEnergia, dica: 'considerar fontes de energia renovável, como a solar' },
      { nome: 'gestão de resíduos', valor: scoreResiduos, dica: 'iniciar ou ampliar a compostagem de resíduos orgânicos' }
    ];
    const pior = categorias.reduce((a, b) => (a.valor < b.valor ? a : b));
    document.getElementById('calcRecommendation').innerHTML =
      `<strong>Seu maior ponto de atenção é ${pior.nome}.</strong><br>Experimente ${pior.dica}.`;

    addXp(15);
  });

  document.getElementById('calcReset').addEventListener('click', () => {
    calcFilled.hidden = true;
    calcEmpty.hidden = false;
    calcError.hidden = true;
  });

  function clamp(v) { return Math.max(0, Math.min(100, Math.round(v))); }
  function setBar(barId, valId, value) {
    document.getElementById(barId).style.width = value + '%';
    document.getElementById(valId).textContent = value + '%';
  }
  function animateGauge(value) {
    const fill = document.getElementById('gaugeFill');
    const circumference = 540;
    const offset = circumference - (circumference * value) / 100;
    requestAnimationFrame(() => { fill.style.strokeDashoffset = offset; });
  }

  // ============================================
  // MURAL DE BOAS PRÁTICAS
  // ============================================
  const boasPraticasBase = [
    { titulo: 'Compostagem', categoria: 'residuos', desc: 'Transforma restos orgânicos em adubo natural, reduzindo lixo e melhorando o solo.' },
    { titulo: 'Captação de água da chuva', categoria: 'agua', desc: 'Armazena água da chuva para uso em irrigação, reduzindo a dependência de outras fontes.' },
    { titulo: 'Irrigação eficiente', categoria: 'agua', desc: 'Sistemas por gotejamento entregam água direto na raiz, evitando desperdício por evaporação.' },
    { titulo: 'Cobertura do solo', categoria: 'solo', desc: 'Palhada ou plantas de cobertura protegem o solo da erosão e mantêm a umidade.' },
    { titulo: 'Rotação de culturas', categoria: 'solo', desc: 'Alternar espécies plantadas evita o esgotamento de nutrientes e reduz pragas.' },
    { titulo: 'Bioinsumos', categoria: 'tecnologia', desc: 'Produtos biológicos substituem parte dos defensivos químicos no controle de pragas.' },
    { titulo: 'Reaproveitamento de resíduos', categoria: 'residuos', desc: 'Restos de colheita podem virar ração, adubo ou matéria-prima para outros processos.' },
    { titulo: 'Energia solar', categoria: 'energia', desc: 'Painéis solares reduzem o custo de energia e a dependência de fontes não renováveis.' },
    { titulo: 'Proteção de nascentes', categoria: 'biodiversidade', desc: 'Manter mata ciliar preserva a qualidade e o volume de água disponível na propriedade.' },
    { titulo: 'Hortas escolares', categoria: 'biodiversidade', desc: 'Aproximam estudantes da produção de alimentos e ensinam sustentabilidade na prática.' },
    { titulo: 'Sensores de umidade', categoria: 'tecnologia', desc: 'Medem a umidade do solo em tempo real, indicando o momento certo de irrigar.' },
    { titulo: 'Poda e manejo florestal', categoria: 'biodiversidade', desc: 'Manejo correto de áreas de mata preserva espécies e serviços ambientais.' }
  ];

  const practicesGrid = document.getElementById('practicesGrid');
  const practiceModal = document.getElementById('practiceModal');
  let currentFilter = 'todos';

  function getCustomPractices() {
    return JSON.parse(storage.getItem('agro_customPractices') || '[]');
  }
  function saveCustomPractices(list) {
    storage.setItem('agro_customPractices', JSON.stringify(list));
  }

  function renderPractices() {
    const all = [...boasPraticasBase, ...getCustomPractices()];
    const filtered = currentFilter === 'todos' ? all : all.filter(p => p.categoria === currentFilter);
    practicesGrid.innerHTML = '';
    if (filtered.length === 0) {
      practicesGrid.innerHTML = '<p style="color:var(--ink-soft); grid-column:1/-1;">Nenhuma prática encontrada nesta categoria ainda.</p>';
      return;
    }
    filtered.forEach(p => {
      const card = document.createElement('button');
      card.className = 'practice-card reveal in-view';
      card.innerHTML = `
        <span class="practice-card__tag">${labelCategoria(p.categoria)}</span>
        <h3>${escapeHtml(p.titulo)}</h3>
        <p>${escapeHtml(p.desc)}</p>
        ${p.custom ? '<span class="practice-card__custom">✦ adicionada pela comunidade</span>' : ''}
      `;
      card.addEventListener('click', () => {
        document.getElementById('practiceModalTag').textContent = labelCategoria(p.categoria);
        document.getElementById('practiceModalTitle').textContent = p.titulo;
        document.getElementById('practiceModalText').textContent = p.desc;
        openModal(practiceModal);
      });
      practicesGrid.appendChild(card);
    });
  }

  function labelCategoria(cat) {
    const map = { agua: 'Água', solo: 'Solo', energia: 'Energia', residuos: 'Resíduos', biodiversidade: 'Biodiversidade', tecnologia: 'Tecnologia' };
    return map[cat] || cat;
  }
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderPractices();
    });
  });

  document.getElementById('practiceForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('practiceName').value.trim();
    const categoria = document.getElementById('practiceCategory').value;
    const desc = document.getElementById('practiceDesc').value.trim();
    if (!nome || !desc) return;

    const list = getCustomPractices();
    list.push({ titulo: nome, categoria, desc, custom: true });
    saveCustomPractices(list);
    renderPractices();

    document.getElementById('practiceFeedback').textContent = '✓ Prática adicionada ao mural!';
    e.target.reset();
    setTimeout(() => { document.getElementById('practiceFeedback').textContent = ''; }, 3500);
    addXp(10);
  });

  renderPractices();

  // ============================================
  // DASHBOARD IoT SIMULADO
  // ============================================
  const iotState = { solo: 67, temp: 24.8, ar: 71, lux: 823 };
  const iotHistory = Array.from({ length: 30 }, () => iotState.solo);
  const canvas = document.getElementById('iotChart');
  const ctx = canvas.getContext('2d');

  function statusFor(valor, min, max) {
    if (valor < min || valor > max) return 'critico';
    if (valor < min + (max - min) * 0.15 || valor > max - (max - min) * 0.15) return 'atencao';
    return 'normal';
  }

  function updateIot() {
    iotState.solo = clampNum(iotState.solo + (Math.random() * 6 - 3), 20, 95);
    iotState.temp = clampNum(iotState.temp + (Math.random() * 1 - 0.5), 15, 36);
    iotState.ar = clampNum(iotState.ar + (Math.random() * 5 - 2.5), 30, 95);
    iotState.lux = clampNum(iotState.lux + (Math.random() * 80 - 40), 200, 1400);

    document.getElementById('iotSolo').innerHTML = Math.round(iotState.solo) + '<small>%</small>';
    document.getElementById('iotTemp').innerHTML = iotState.temp.toFixed(1) + '<small>°C</small>';
    document.getElementById('iotAr').innerHTML = Math.round(iotState.ar) + '<small>%</small>';
    document.getElementById('iotLux').innerHTML = Math.round(iotState.lux) + '<small>lux</small>';

    setStatus('iotSoloStatus', statusFor(iotState.solo, 35, 85));
    setStatus('iotTempStatus', statusFor(iotState.temp, 18, 30));
    setStatus('iotArStatus', statusFor(iotState.ar, 40, 85));
    setStatus('iotLuxStatus', statusFor(iotState.lux, 300, 1200));

    iotHistory.push(iotState.solo);
    iotHistory.shift();
    drawChart();
  }
  function clampNum(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function setStatus(id, status) {
    const el = document.getElementById(id);
    el.textContent = status === 'normal' ? 'normal' : status === 'atencao' ? 'atenção' : 'crítico';
    el.closest('.iot-card').setAttribute('data-live-status', status);
  }

  function drawChart() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    // grade
    ctx.strokeStyle = 'rgba(247,249,244,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    // linha de dados
    const max = 100, min = 0;
    ctx.beginPath();
    iotHistory.forEach((v, i) => {
      const x = (w / (iotHistory.length - 1)) * i;
      const y = h - ((v - min) / (max - min)) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#B7E35B';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // preenchimento gradiente
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(183,227,91,0.28)');
    grad.addColorStop(1, 'rgba(183,227,91,0)');
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }
  updateIot();
  setInterval(updateIot, 3000);

  // ============================================
  // QUIZ
  // ============================================
  const quizData = [
    { q: 'Qual prática ajuda mais a evitar o desperdício de água na irrigação?', opts: ['Irrigar no meio do dia', 'Irrigação por gotejamento', 'Regar todos os dias sem medir', 'Deixar a torneira aberta'], correct: 1, exp: 'A irrigação por gotejamento entrega água direto na raiz, reduzindo perdas por evaporação.' },
    { q: 'O que é compostagem?', opts: ['Queima de resíduos', 'Transformação de resíduos orgânicos em adubo', 'Uso de agrotóxicos', 'Armazenamento de água'], correct: 1, exp: 'Compostagem transforma restos orgânicos em adubo natural, reduzindo lixo e melhorando o solo.' },
    { q: 'Qual prática ajuda a conservar o solo?', opts: ['Monocultura constante', 'Queimadas frequentes', 'Rotação de culturas', 'Solo sempre descoberto'], correct: 2, exp: 'A rotação de culturas evita o esgotamento de nutrientes e reduz pragas específicas.' },
    { q: 'O que caracteriza a agricultura de precisão?', opts: ['Uso de dados e sensores para decisões', 'Plantio sem nenhum planejamento', 'Uso exclusivo de mão de obra manual', 'Ausência total de tecnologia'], correct: 0, exp: 'Ela usa sensores, dados e automação para decisões mais eficientes no campo.' },
    { q: 'Qual é um benefício da biodiversidade em áreas agrícolas?', opts: ['Reduz a polinização', 'Aumenta pragas descontroladamente', 'Ajuda no equilíbrio dos ecossistemas', 'Não influencia a produção'], correct: 2, exp: 'Polinizadores e espécies nativas ajudam a manter o equilíbrio necessário para a produção.' },
    { q: 'Qual dessas é uma fonte de energia renovável usada no campo?', opts: ['Carvão', 'Energia solar', 'Óleo diesel', 'Gás natural'], correct: 1, exp: 'A energia solar é renovável e cada vez mais usada em propriedades rurais.' },
    { q: 'O que é mata ciliar?', opts: ['Um tipo de praga', 'Vegetação que protege nascentes e rios', 'Um equipamento agrícola', 'Um tipo de adubo'], correct: 1, exp: 'A mata ciliar protege nascentes e cursos d\'água, mantendo a qualidade da água.' },
    { q: 'Reaproveitar resíduos de colheita pode servir para:', opts: ['Somente ser descartado', 'Ração, adubo ou matéria-prima', 'Não tem nenhuma utilidade', 'Apenas queima'], correct: 1, exp: 'Resíduos de colheita podem virar ração animal, adubo orgânico ou insumo para outros processos.' },
    { q: 'Como as mudanças climáticas afetam a agricultura?', opts: ['Não têm nenhum efeito', 'Alteram chuvas, temperaturas e safras', 'Só afetam áreas urbanas', 'Melhoram sempre a produção'], correct: 1, exp: 'Mudanças no clima alteram o regime de chuvas e temperaturas, afetando diretamente as safras.' },
    { q: 'Sensores de umidade do solo ajudam principalmente a:', opts: ['Decorar a propriedade', 'Indicar o momento certo de irrigar', 'Substituir o produtor totalmente', 'Aumentar o consumo de água'], correct: 1, exp: 'Eles indicam quando o solo realmente precisa de água, evitando irrigação desnecessária.' }
  ];
  let quizIndex = 0, quizScore = 0;
  const quizStart = document.getElementById('quizStart');
  const quizPlaying = document.getElementById('quizPlaying');
  const quizResult = document.getElementById('quizResult');

  document.getElementById('quizStartBtn').addEventListener('click', startQuiz);
  document.getElementById('quizRestartBtn').addEventListener('click', startQuiz);

  function startQuiz() {
    quizIndex = 0; quizScore = 0;
    quizStart.hidden = true; quizResult.hidden = true; quizPlaying.hidden = false;
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const item = quizData[quizIndex];
    document.getElementById('quizProgressFill').style.width = `${(quizIndex / quizData.length) * 100}%`;
    document.getElementById('quizProgressText').textContent = `Pergunta ${quizIndex + 1} de ${quizData.length}`;
    document.getElementById('quizQuestion').textContent = item.q;
    document.getElementById('quizExplanation').hidden = true;
    document.getElementById('quizNextBtn').hidden = true;

    const optsWrap = document.getElementById('quizOptions');
    optsWrap.innerHTML = '';
    item.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz__option';
      btn.textContent = opt;
      btn.addEventListener('click', () => answerQuiz(i));
      optsWrap.appendChild(btn);
    });
  }

  function answerQuiz(selected) {
    const item = quizData[quizIndex];
    const buttons = document.querySelectorAll('#quizOptions .quiz__option');
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === item.correct) btn.classList.add('correct');
      else if (i === selected) btn.classList.add('wrong');
    });
    if (selected === item.correct) { quizScore++; registerAnswer(true); } else { registerAnswer(false); }

    const expEl = document.getElementById('quizExplanation');
    expEl.textContent = item.exp;
    expEl.hidden = false;
    document.getElementById('quizNextBtn').hidden = false;
  }

  document.getElementById('quizNextBtn').addEventListener('click', () => {
    quizIndex++;
    if (quizIndex >= quizData.length) { finishQuiz(); } else { renderQuizQuestion(); }
  });

  function finishQuiz() {
    quizPlaying.hidden = true;
    quizResult.hidden = false;
    document.getElementById('quizProgressFill').style.width = '100%';
    document.getElementById('quizResultScore').textContent = `${quizScore}/${quizData.length}`;
    let msg = '';
    if (quizScore >= 9) msg = 'Impressionante! Você domina o tema. 🌎';
    else if (quizScore >= 7) msg = 'Você está no caminho certo.';
    else if (quizScore >= 5) msg = 'Bom começo — vale revisar alguns pontos.';
    else msg = 'Continue estudando: o FlashLab pode ajudar bastante.';
    document.getElementById('quizResultMsg').textContent = msg;
    addXp(quizScore * 8);
    saveSession(Math.round((quizScore / quizData.length) * 100));
  }

  // ============================================
  // FLASHLAB — FLASHCARDS
  // ============================================
  const flashData = [
    { front: 'O que é agricultura sustentável?', back: 'É uma forma de produção que busca equilibrar produtividade, conservação ambiental e viabilidade econômica.' },
    { front: 'O que é compostagem?', back: 'Processo de decomposição controlada de resíduos orgânicos, que gera adubo natural para o solo.' },
    { front: 'O que é irrigação por gotejamento?', back: 'Sistema que entrega água diretamente na raiz das plantas, reduzindo o desperdício por evaporação.' },
    { front: 'O que é rotação de culturas?', back: 'Alternar diferentes espécies plantadas em uma mesma área ao longo do tempo, preservando os nutrientes do solo.' },
    { front: 'O que é agricultura de precisão?', back: 'Uso de sensores, dados e tecnologia para tomar decisões mais eficientes sobre irrigação, adubação e colheita.' },
    { front: 'O que são polinizadores?', back: 'Animais, como abelhas, que transportam pólen entre plantas, essenciais para a reprodução de muitas culturas.' },
    { front: 'O que é mata ciliar?', back: 'Vegetação nativa presente às margens de rios e nascentes, que protege a qualidade e o volume de água.' },
    { front: 'O que é pegada hídrica?', back: 'Indicador que mede o volume total de água usado, direta ou indiretamente, para produzir um bem ou serviço.' },
    { front: 'O que são bioinsumos?', back: 'Produtos de origem biológica usados no controle de pragas e na nutrição das plantas, alternativos aos químicos.' },
    { front: 'O que é energia renovável?', back: 'Energia proveniente de fontes que se renovam naturalmente, como sol, vento e biomassa.' },
    { front: 'O que é erosão do solo?', back: 'Processo de desgaste e perda da camada fértil do solo, causado principalmente por água, vento e manejo inadequado.' },
    { front: 'O que é um sensor de umidade do solo?', back: 'Dispositivo que mede a quantidade de água presente no solo, ajudando a decidir o momento certo de irrigar.' },
    { front: 'O que é biodiversidade?', back: 'A variedade de espécies de seres vivos e ecossistemas existentes em determinada região.' },
    { front: 'O que é reaproveitamento de água?', back: 'Prática de reutilizar água já usada (como da chuva ou de processos) em outras atividades, reduzindo o consumo total.' },
    { front: 'O que é manejo integrado de pragas?', back: 'Estratégia que combina métodos biológicos, culturais e químicos para controlar pragas de forma mais equilibrada.' }
  ];
  let flashOrder = flashData.map((_, i) => i);
  let flashIndex = 0;
  const flashStatus = JSON.parse(storage.getItem('agro_flashStatus') || '{}');

  function saveFlashStatus() { storage.setItem('agro_flashStatus', JSON.stringify(flashStatus)); }

  const flashcardEl = document.getElementById('flashcard');
  const flashcardInner = document.getElementById('flashcardInner');

  function renderFlash() {
    const idx = flashOrder[flashIndex];
    const item = flashData[idx];
    document.getElementById('flashFront').textContent = item.front;
    document.getElementById('flashBack').textContent = item.back;
    flashcardEl.classList.remove('flipped');
    document.getElementById('flashCounter').textContent = `Card ${flashIndex + 1} de ${flashData.length}`;
    const learnedCount = Object.values(flashStatus).filter(v => v === 'learned').length;
    document.getElementById('flashProgressFill').style.width = `${(learnedCount / flashData.length) * 100}%`;
  }

  function flipFlash() { flashcardEl.classList.toggle('flipped'); }
  flashcardEl.addEventListener('click', flipFlash);
  flashcardEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipFlash(); } });

  document.getElementById('flashPrev').addEventListener('click', () => {
    flashIndex = (flashIndex - 1 + flashOrder.length) % flashOrder.length;
    renderFlash();
  });
  document.getElementById('flashNext').addEventListener('click', () => {
    flashIndex = (flashIndex + 1) % flashOrder.length;
    renderFlash();
  });
  document.getElementById('flashShuffle').addEventListener('click', () => {
    for (let i = flashOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flashOrder[i], flashOrder[j]] = [flashOrder[j], flashOrder[i]];
    }
    flashIndex = 0;
    renderFlash();
    showToast('Cards embaralhados!');
  });
  document.getElementById('flashRestart').addEventListener('click', () => {
    flashOrder = flashData.map((_, i) => i);
    flashIndex = 0;
    Object.keys(flashStatus).forEach(k => delete flashStatus[k]);
    saveFlashStatus();
    renderFlash();
    showToast('Estudo reiniciado.');
  });
  document.getElementById('flashLearned').addEventListener('click', () => {
    flashStatus[flashOrder[flashIndex]] = 'learned';
    saveFlashStatus();
    addXp(4);
    renderFlash();
  });
  document.getElementById('flashReview').addEventListener('click', () => {
    flashStatus[flashOrder[flashIndex]] = 'review';
    saveFlashStatus();
    renderFlash();
  });
  renderFlash();

  // Modo desafio
  let challengeIdx = null;
  let challengeStats = JSON.parse(storage.getItem('agro_challengeStats') || '{"acertos":0,"erros":0}');
  function updateChallengeStatsText() {
    const total = challengeStats.acertos + challengeStats.erros;
    const pct = total > 0 ? Math.round((challengeStats.acertos / total) * 100) : 0;
    document.getElementById('challengeStats').textContent =
      `${challengeStats.acertos} acertos · ${challengeStats.erros} erros · ${total} respostas · ${pct}% de acerto`;
  }
  updateChallengeStatsText();

  document.getElementById('challengeNewBtn').addEventListener('click', () => {
    challengeIdx = Math.floor(Math.random() * flashData.length);
    document.getElementById('challengeQuestion').textContent = flashData[challengeIdx].front;
    document.getElementById('challengeAnswer').hidden = true;
    document.getElementById('challengeGrade').hidden = true;
    document.getElementById('challengeRevealBtn').hidden = false;
  });
  document.getElementById('challengeRevealBtn').addEventListener('click', () => {
    document.getElementById('challengeAnswer').textContent = flashData[challengeIdx].back;
    document.getElementById('challengeAnswer').hidden = false;
    document.getElementById('challengeGrade').hidden = false;
    document.getElementById('challengeRevealBtn').hidden = true;
  });
  document.getElementById('challengeRight').addEventListener('click', () => {
    challengeStats.acertos++;
    storage.setItem('agro_challengeStats', JSON.stringify(challengeStats));
    updateChallengeStatsText();
    registerAnswer(true);
    addXp(3);
  });
  document.getElementById('challengeWrong').addEventListener('click', () => {
    challengeStats.erros++;
    storage.setItem('agro_challengeStats', JSON.stringify(challengeStats));
    updateChallengeStatsText();
    registerAnswer(false);
  });

  // ============================================
  // DESAFIO DO DIA
  // ============================================
  const dailyQuestions = [
    { q: 'Você conseguiria economizar 20% de água na sua escola?', opts: ['Sim, com irrigação eficiente', 'Sim, reaproveitando água', 'Talvez, com mudanças de hábito', 'Seria difícil'] },
    { q: 'Qual prática sustentável você implementaria na sua comunidade?', opts: ['Compostagem', 'Horta comunitária', 'Coleta seletiva', 'Captação de água da chuva'] },
    { q: 'Quantos resíduos você acha que sua escola produz em uma semana?', opts: ['Menos do que imagino', 'Uma quantidade média', 'Mais do que deveria', 'Não sei, mas quero descobrir'] }
  ];
  const dayIndex = new Date().getDate() % dailyQuestions.length;
  const dailyItem = dailyQuestions[dayIndex];
  document.getElementById('dailyQuestion').textContent = dailyItem.q;
  const dailyOptsWrap = document.getElementById('dailyOptions');
  dailyItem.opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      dailyOptsWrap.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const reflectionEl = document.getElementById('dailyReflection');
      reflectionEl.textContent = 'Boa reflexão! Pequenas escolhas individuais, somadas, criam grande impacto coletivo.';
      reflectionEl.hidden = false;
      addXp(5);
    });
    dailyOptsWrap.appendChild(btn);
  });

  // ============================================
  // GAMIFICAÇÃO — XP, NÍVEL, HISTÓRICO
  // ============================================
  const levels = [
    { name: 'Semente', icon: '🌱', min: 0 },
    { name: 'Broto', icon: '🌿', min: 300 },
    { name: 'Cultivador', icon: '🌳', min: 700 },
    { name: 'Guardião do Futuro', icon: '🌎', min: 1200 }
  ];
  let xp = parseInt(storage.getItem('agro_xp') || '0', 10);
  let correctCount = parseInt(storage.getItem('agro_correct') || '0', 10);
  let wrongCount = parseInt(storage.getItem('agro_wrong') || '0', 10);

  function currentLevelInfo() {
    let levelIdx = 0;
    for (let i = 0; i < levels.length; i++) { if (xp >= levels[i].min) levelIdx = i; }
    const current = levels[levelIdx];
    const next = levels[levelIdx + 1];
    return { levelIdx, current, next };
  }

  function renderGamification() {
    const { levelIdx, current, next } = currentLevelInfo();
    document.getElementById('levelIcon').textContent = current.icon;
    document.getElementById('levelName').textContent = `Nível 0${levelIdx + 1} — ${current.name}`;
    const span = next ? next.min - current.min : 500;
    const progressInLevel = next ? xp - current.min : span;
    const pct = next ? Math.min(100, (progressInLevel / span) * 100) : 100;
    document.getElementById('xpBarFill').style.width = pct + '%';
    document.getElementById('xpText').textContent = next ? `${xp} / ${next.min} XP` : `${xp} XP · nível máximo`;

    document.getElementById('statCorrect').textContent = correctCount;
    document.getElementById('statWrong').textContent = wrongCount;
    const totalAnswers = correctCount + wrongCount;
    document.getElementById('statAvg').textContent = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) + '%' : '—';
  }

  function addXp(amount) {
    xp += amount;
    storage.setItem('agro_xp', xp);
    renderGamification();
  }
  function registerAnswer(correct) {
    if (correct) correctCount++; else wrongCount++;
    storage.setItem('agro_correct', correctCount);
    storage.setItem('agro_wrong', wrongCount);
    renderGamification();
  }

  function getSessions() { return JSON.parse(storage.getItem('agro_sessions') || '[]'); }
  function saveSession(pct) {
    const sessions = getSessions();
    sessions.push({ pct, date: new Date().toLocaleDateString('pt-BR') });
    storage.setItem('agro_sessions', JSON.stringify(sessions));
    renderSessions();
  }
  function renderSessions() {
    const sessions = getSessions();
    const list = document.getElementById('sessionHistory');
    list.innerHTML = '';
    if (sessions.length === 0) {
      list.innerHTML = '<li class="empty">Nenhuma sessão de quiz registrada ainda.</li>';
      return;
    }
    sessions.slice(-6).forEach((s, i, arr) => {
      const li = document.createElement('li');
      const label = i === arr.length - 1 ? 'Sessão atual' : `Sessão ${sessions.length - arr.length + i + 1}`;
      li.innerHTML = `<span>${label} (${s.date})</span><span>${s.pct}%</span>`;
      list.appendChild(li);
    });
  }

  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (!confirm('Isso vai apagar seu progresso, XP, quiz, flashcards e boas práticas adicionadas. Deseja continuar?')) return;
    ['agro_xp', 'agro_correct', 'agro_wrong', 'agro_sessions', 'agro_flashStatus', 'agro_challengeStats', 'agro_customPractices']
      .forEach(k => storage.removeItem(k));
    location.reload();
  });

  renderGamification();
  renderSessions();

  // ============================================
  // BOTÃO VOLTAR AO TOPO
  // ============================================
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 600);
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

});
