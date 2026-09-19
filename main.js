/* =========================================================
   Panificadora Ki-Pão · scripts do site
   ========================================================= */
(() => {
  'use strict';
  document.documentElement.classList.add('js');

  /* ---------------------------------------------------------
     CONFIGURAÇÃO: telefone, horários e regras de retirada.
     Horários em minutos desde a meia-noite. Índice 0 = domingo.
     --------------------------------------------------------- */
  const CONFIG = {
    whatsapp: '551636252619',
    fuso: 'America/Sao_Paulo',
    horarios: [
      [360, 780],  // domingo  6h às 13h
      [360, 1170], // segunda  6h às 19h30
      [360, 1170], // terça
      [360, 1170], // quarta
      [360, 1170], // quinta
      [360, 1170], // sexta
      [360, 1080], // sábado   6h às 18h
    ],
    retirada: {
      primeira: 420,        // primeira retirada às 7h
      intervalo: 30,        // um horário a cada 30 minutos
      antesDeFechar: 30,    // última retirada 30 min antes de fechar
    },
    diasNaAgenda: 14,
  };

  /* ---------------------------------------------------------
     ENCOMENDAS: o que aparece em cada ocasião.
     porPessoa = quanto a calculadora sugere por adulto
     passo     = de quanto em quanto o botão +/- muda
     minimo    = pedido mínimo daquele item
     --------------------------------------------------------- */
  const OCASIOES = {
    festa: {
      nome: 'Festa ou aniversário',
      pessoas: true,
      antecedenciaDias: 2,
      regra: 'A conta usa 10 salgados, 2 mini lanches, 4 docinhos e 100 g de bolo por adulto.',
      itens: [
        { id: 'salgados', nome: 'Salgados sortidos', detalhe: 'sabores a combinar', unid: 'un', porPessoa: 10, passo: 25, minimo: 50 },
        { id: 'minilanches', nome: 'Mini lanches', detalhe: 'presunto, queijo e alface', unid: 'un', porPessoa: 2, passo: 10, minimo: 20 },
        { id: 'docinhos', nome: 'Docinhos', detalhe: 'brigadeiro e beijinho', unid: 'un', porPessoa: 4, passo: 25, minimo: 25 },
        { id: 'bolo', nome: 'Bolo', detalhe: 'sabor e recheio a combinar', unid: 'kg', porPessoa: 0.1, passo: 0.5, minimo: 1 },
      ],
      extras: [
        { id: 'paodequeijo', nome: 'Pão de queijo', unid: 'un', qtd: 50, passo: 10 },
        { id: 'sonhos', nome: 'Sonhos', unid: 'un', qtd: 12, passo: 6 },
        { id: 'bombas', nome: 'Bombas com morango', unid: 'un', qtd: 12, passo: 6 },
        { id: 'mono', nome: 'Mono porções', detalhe: 'Ninho com morango, chocolate, limão', unid: 'un', qtd: 10, passo: 5 },
      ],
    },
    equipe: {
      nome: 'Café da equipe ou reunião',
      pessoas: true,
      antecedenciaDias: 1,
      regra: 'A conta usa 3 pães de queijo, 2 mini lanches e 60 g de bolo por pessoa.',
      itens: [
        { id: 'paodequeijo', nome: 'Pão de queijo', unid: 'un', porPessoa: 3, passo: 10, minimo: 20 },
        { id: 'minilanches', nome: 'Mini lanches', detalhe: 'presunto, queijo e alface', unid: 'un', porPessoa: 2, passo: 10, minimo: 10 },
        { id: 'bolo', nome: 'Bolo', detalhe: 'sabor a combinar', unid: 'kg', porPessoa: 0.06, passo: 0.5, minimo: 1 },
      ],
      extras: [
        { id: 'paofrances', nome: 'Pão francês', unid: 'un', qtd: 20, passo: 5 },
        { id: 'sonhos', nome: 'Sonhos', unid: 'un', qtd: 12, passo: 6 },
        { id: 'rocambole', nome: 'Rocambole de chocolate', unid: 'un', qtd: 1, passo: 1 },
        { id: 'docinhos', nome: 'Docinhos', detalhe: 'brigadeiro e beijinho', unid: 'un', qtd: 25, passo: 25 },
      ],
    },
    dia: {
      nome: 'Pães e doces do dia',
      pessoas: false,
      antecedenciaHoras: 3,
      regra: 'Escolha o que quer levar. A padaria separa e deixa pronto no horário.',
      itens: [
        { id: 'paofrances', nome: 'Pão francês', unid: 'un', qtd: 10, passo: 5 },
        { id: 'paodequeijo', nome: 'Pão de queijo', unid: 'un', qtd: 10, passo: 5 },
      ],
      extras: [
        { id: 'sonhos', nome: 'Sonhos', unid: 'un', qtd: 4, passo: 1 },
        { id: 'bombas', nome: 'Bombas com morango', unid: 'un', qtd: 4, passo: 1 },
        { id: 'baguete', nome: 'Baguete recheada', detalhe: 'recheio a combinar', unid: 'un', qtd: 2, passo: 1 },
        { id: 'rocambole', nome: 'Rocambole de chocolate', unid: 'un', qtd: 1, passo: 1 },
        { id: 'mono', nome: 'Mono porções', unid: 'un', qtd: 2, passo: 1 },
      ],
    },
  };

  /* ---------- utilidades ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const DIA_MS = 864e5;

  const fmtHora = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
  };
  const fmtNum = (n) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  const arred = (n) => Math.round(n * 10) / 10;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // Data e hora de Ribeirão Preto, independente do fuso do aparelho
  function agora() {
    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: CONFIG.fuso, year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
    }).formatToParts(new Date());
    const v = (t) => Number(partes.find((p) => p.type === t).value);
    const data = new Date(Date.UTC(v('year'), v('month') - 1, v('day')));
    return { data, dow: data.getUTCDay(), min: (v('hour') % 24) * 60 + v('minute') };
  }
  const somaDias = (d, n) => new Date(d.getTime() + n * DIA_MS);
  const chaveData = (d) => d.toISOString().slice(0, 10);
  const dataDaChave = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const ddmm = (d) => `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

  /* ---------- aberto agora ---------- */
  function atualizaStatus() {
    const a = agora();
    const [abre, fecha] = CONFIG.horarios[a.dow];
    const aberto = a.min >= abre && a.min < fecha;
    let texto;
    if (aberto) texto = `Aberto agora · fecha às ${fmtHora(fecha)}`;
    else if (a.min < abre) texto = `Fechado agora · abre às ${fmtHora(abre)}`;
    else texto = `Fechado agora · abre amanhã às ${fmtHora(CONFIG.horarios[(a.dow + 1) % 7][0])}`;

    $$('[data-status]').forEach((el) => {
      el.classList.toggle('status--aberto', aberto);
      el.classList.toggle('status--fechado', !aberto);
      const alvo = $('[data-status-texto]', el);
      if (alvo) alvo.textContent = texto;
    });
    $$('[data-hoje]').forEach((el) => { el.textContent = `Hoje, das ${fmtHora(abre)} às ${fmtHora(fecha)}`; });
    $$('.horarios tr[data-dia]').forEach((tr) => tr.classList.toggle('hoje', Number(tr.dataset.dia) === a.dow));
  }
  atualizaStatus();
  setInterval(atualizaStatus, 60 * 1000);

  /* ---------- menu do celular ---------- */
  const menuBtn = $('.menu-btn');
  const menu = $('#menu');
  if (menuBtn && menu) {
    const abreMenu = (abrir) => {
      menu.classList.toggle('aberto', abrir);
      menuBtn.setAttribute('aria-expanded', String(abrir));
      menuBtn.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    };
    menuBtn.addEventListener('click', () => abreMenu(!menu.classList.contains('aberto')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) abreMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('aberto')) { abreMenu(false); menuBtn.focus(); }
    });
  }

  /* ---------- animação de entrada ---------- */
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !semMovimento) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('visivel'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    $$('.revela').forEach((el) => io.observe(el));
  } else {
    $$('.revela').forEach((el) => el.classList.add('visivel'));
  }

  $$('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* =========================================================
     ENCOMENDA COM HORA MARCADA
     ========================================================= */
  const form = $('#form-encomenda');
  if (!form) return;

  const est = { ocasiao: 'festa', adultos: 20, criancas: 0, itens: [], dia: null, hora: null };
  const el = {
    passoPessoas: $('#passo-pessoas'),
    adultos: $('#adultos'),
    criancas: $('#criancas'),
    dica: $('[data-dica]'),
    itens: $('[data-itens]'),
    extrasBox: $('[data-extras-box]'),
    extras: $('[data-extras]'),
    prazo: $('[data-prazo]'),
    dias: $('[data-dias]'),
    horas: $('[data-horas]'),
    nome: $('#nome'),
    obs: $('#obs'),
    rOcasiao: $('[data-r-ocasiao]'),
    rPessoasBox: $('[data-r-pessoas-box]'),
    rPessoas: $('[data-r-pessoas]'),
    rItens: $('[data-r-itens]'),
    rRetirada: $('[data-r-retirada]'),
    enviar: $('[data-enviar]'),
    aviso: $('[data-aviso]'),
  };
  const oc = () => OCASIOES[est.ocasiao];
  const erroEl = (campo) => $(`[data-erro="${campo}"]`, form);

  const descrevePessoas = () => {
    const a = `${est.adultos} ${est.adultos === 1 ? 'adulto' : 'adultos'}`;
    if (!est.criancas) return a;
    return `${a} e ${est.criancas} ${est.criancas === 1 ? 'criança' : 'crianças'}`;
  };
  const fmtQtd = (i) => (i.unid === 'kg' ? `${fmtNum(i.qtd)} kg` : `${i.qtd}`);

  function sugestao(item) {
    const pessoas = est.adultos + est.criancas * 0.5;
    if (pessoas <= 0) return 0;
    const q = Math.ceil((pessoas * item.porPessoa) / item.passo - 1e-9) * item.passo;
    return Math.max(item.minimo || 0, arred(q));
  }

  /* itens */
  function montaItens() {
    const o = oc();
    el.passoPessoas.hidden = !o.pessoas;
    est.itens = o.itens.map((i) => ({ ...i, qtd: o.pessoas ? sugestao(i) : i.qtd }));
    renderItens();
    renderExtras();
  }

  function recalcula() {
    if (!oc().pessoas) return;
    est.itens.forEach((i) => { if (!i.extra) i.qtd = sugestao(i); });
    renderItens();
  }

  function renderItens() {
    const o = oc();
    el.dica.textContent = o.pessoas ? `Sugestão para ${descrevePessoas()}. ${o.regra} Ajuste como quiser.` : o.regra;
    el.itens.innerHTML = est.itens.map((i) => `
      <li class="item${i.qtd ? '' : ' item--vazio'}">
        <div class="item__txt"><b>${esc(i.nome)}</b>${i.detalhe ? `<small>${esc(i.detalhe)}</small>` : ''}</div>
        <div class="stepper" role="group" aria-label="Quantidade de ${esc(i.nome)}">
          <button type="button" data-item="${i.id}" data-delta="-1" aria-label="Diminuir ${esc(i.nome)}"><svg aria-hidden="true"><use href="#i-menos"/></svg></button>
          <output aria-live="polite">${fmtQtd(i)}</output>
          <button type="button" data-item="${i.id}" data-delta="1" aria-label="Aumentar ${esc(i.nome)}"><svg aria-hidden="true"><use href="#i-mais"/></svg></button>
        </div>
        ${i.extra ? `<button type="button" class="item__rm" data-remover="${i.id}" aria-label="Remover ${esc(i.nome)}"><svg aria-hidden="true"><use href="#i-x"/></svg></button>` : '<span aria-hidden="true"></span>'}
      </li>`).join('');
  }

  function renderExtras() {
    const livres = oc().extras.filter((x) => !est.itens.some((i) => i.id === x.id));
    el.extras.innerHTML = livres.map((x) => `<button type="button" class="chip" data-extra="${x.id}"><svg aria-hidden="true"><use href="#i-mais"/></svg>${esc(x.nome)}</button>`).join('');
    el.extrasBox.hidden = livres.length === 0;
  }

  el.itens.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.remover) {
      est.itens = est.itens.filter((i) => i.id !== b.dataset.remover);
      renderItens(); renderExtras(); resumo();
      return;
    }
    const item = est.itens.find((i) => i.id === b.dataset.item);
    if (!item) return;
    item.qtd = Math.max(0, arred(item.qtd + Number(b.dataset.delta) * item.passo));
    const li = b.closest('.item');
    $('output', li).textContent = fmtQtd(item);
    li.classList.toggle('item--vazio', !item.qtd);
    if (item.qtd) erroEl('itens').textContent = '';
    resumo();
  });

  el.extras.addEventListener('click', (e) => {
    const b = e.target.closest('[data-extra]');
    if (!b) return;
    const x = oc().extras.find((i) => i.id === b.dataset.extra);
    est.itens.push({ ...x, extra: true });
    renderItens(); renderExtras(); resumo();
    erroEl('itens').textContent = '';
    const novo = $(`[data-item="${x.id}"][data-delta="1"]`, el.itens);
    if (novo) novo.focus();
  });

  /* pessoas */
  const limita = (n) => Math.max(0, Math.min(500, n));
  function lePessoas() {
    est.adultos = limita(parseInt(el.adultos.value, 10) || 0);
    est.criancas = limita(parseInt(el.criancas.value, 10) || 0);
    $$('[data-atalho]', form).forEach((c) => c.setAttribute('aria-pressed', String(Number(c.dataset.atalho) === est.adultos)));
    recalcula(); resumo();
  }
  [el.adultos, el.criancas].forEach((inp) => {
    inp.addEventListener('input', lePessoas);
    inp.addEventListener('blur', () => { inp.value = limita(parseInt(inp.value, 10) || 0); });
  });
  $$('[data-pessoas]', form).forEach((b) => b.addEventListener('click', () => {
    const inp = $(`#${b.dataset.pessoas}`);
    inp.value = limita((parseInt(inp.value, 10) || 0) + Number(b.dataset.delta));
    lePessoas();
  }));
  $$('[data-atalho]', form).forEach((b) => b.addEventListener('click', () => {
    el.adultos.value = b.dataset.atalho;
    lePessoas();
  }));

  /* dias e horários */
  function horariosDoDia(data, a) {
    const o = oc();
    const [abre, fecha] = CONFIG.horarios[data.getUTCDay()];
    const inicio = Math.max(CONFIG.retirada.primeira, abre);
    const fim = fecha - CONFIG.retirada.antesDeFechar;
    const distancia = Math.round((data - a.data) / DIA_MS);
    const lista = [];
    for (let m = inicio; m <= fim; m += CONFIG.retirada.intervalo) {
      let ok;
      if (o.antecedenciaDias) ok = distancia >= o.antecedenciaDias;
      else ok = distancia > 0 || m >= a.min + o.antecedenciaHoras * 60;
      if (ok) lista.push(m);
    }
    return lista;
  }

  function montaDias() {
    const a = agora();
    const o = oc();
    el.prazo.textContent = o.antecedenciaDias
      ? `Pedidos de ${o.nome.toLowerCase()} precisam de ${o.antecedenciaDias} ${o.antecedenciaDias > 1 ? 'dias' : 'dia'} de antecedência. Retirada no balcão.`
      : `Retirada a partir de ${o.antecedenciaHoras} horas depois do pedido, no balcão.`;

    let html = '';
    let primeiroLivre = null;
    let atualSegueLivre = false;
    for (let i = 0; i < CONFIG.diasNaAgenda; i += 1) {
      const d = somaDias(a.data, i);
      const k = chaveData(d);
      const livre = horariosDoDia(d, a).length > 0;
      if (livre && !primeiroLivre) primeiroLivre = k;
      if (livre && k === est.dia) atualSegueLivre = true;
      const rotulo = i === 0 ? 'hoje' : i === 1 ? 'amanhã' : DIAS_CURTOS[d.getUTCDay()];
      const nomeCompleto = `${DIAS[d.getUTCDay()]}, ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`;
      html += `<label class="dia"><input type="radio" name="dia" value="${k}" ${livre ? '' : 'disabled'} aria-label="${nomeCompleto}${livre ? '' : ', sem horário'}"><span aria-hidden="true">${rotulo}<b>${d.getUTCDate()}</b>${MESES[d.getUTCMonth()]}</span></label>`;
    }
    el.dias.innerHTML = html;
    if (!atualSegueLivre) { est.dia = primeiroLivre; est.hora = null; }
    const marcado = est.dia && $(`input[value="${est.dia}"]`, el.dias);
    if (marcado) marcado.checked = true;
    montaHoras();
  }

  function montaHoras() {
    if (!est.dia) {
      el.horas.innerHTML = '<p class="dica">Sem horários livres nos próximos dias. Chame a padaria no WhatsApp.</p>';
      return;
    }
    const lista = horariosDoDia(dataDaChave(est.dia), agora());
    if (est.hora !== null && !lista.includes(est.hora)) est.hora = null;
    const grupos = [
      ['Manhã', lista.filter((m) => m < 720)],
      ['Tarde', lista.filter((m) => m >= 720 && m < 1080)],
      ['Noite', lista.filter((m) => m >= 1080)],
    ].filter(([, ms]) => ms.length);
    el.horas.innerHTML = grupos.map(([titulo, ms]) => `
      <div class="horas__grupo" role="radiogroup" aria-label="Horários da ${titulo.toLowerCase()}">
        <h4>${titulo}</h4>
        <div class="horas__lista">${ms.map((m) => `<label class="hora"><input type="radio" name="hora" value="${m}" ${m === est.hora ? 'checked' : ''}><span>${fmtHora(m)}</span></label>`).join('')}</div>
      </div>`).join('');
  }

  el.dias.addEventListener('change', (e) => {
    if (e.target.name !== 'dia') return;
    est.dia = e.target.value;
    est.hora = null;
    montaHoras(); resumo();
  });
  el.horas.addEventListener('change', (e) => {
    if (e.target.name !== 'hora') return;
    est.hora = Number(e.target.value);
    erroEl('hora').textContent = '';
    resumo();
  });

  /* ocasião */
  $$('input[name="ocasiao"]', form).forEach((r) => r.addEventListener('change', () => {
    if (!r.checked) return;
    est.ocasiao = r.value;
    montaItens(); montaDias(); resumo();
  }));

  el.nome.addEventListener('input', () => {
    if (el.nome.value.trim()) { erroEl('nome').textContent = ''; el.nome.removeAttribute('aria-invalid'); }
    resumo();
  });

  /* comanda */
  function textoRetirada() {
    if (!est.dia || est.hora === null) return null;
    const d = dataDaChave(est.dia);
    return `${DIAS[d.getUTCDay()]}, ${ddmm(d)} às ${fmtHora(est.hora)}`;
  }

  function resumo() {
    const o = oc();
    const itens = est.itens.filter((i) => i.qtd > 0);
    el.rOcasiao.textContent = o.nome;
    el.rPessoasBox.hidden = !o.pessoas;
    el.rPessoas.textContent = descrevePessoas();
    el.rItens.innerHTML = itens.length
      ? itens.map((i) => `<li><span>${esc(i.nome)}</span><b>${i.unid === 'kg' ? `${fmtNum(i.qtd)} kg` : `${i.qtd} un`}</b></li>`).join('')
      : '<li class="vazio">Nenhum item ainda</li>';
    el.rRetirada.textContent = textoRetirada() || 'Escolha o dia e o horário';
    if (el.aviso.classList.contains('aviso--erro') && !valida().length) {
      el.aviso.textContent = '';
      el.aviso.className = 'aviso';
    }
  }

  function valida() {
    const erros = [];
    if (!est.itens.some((i) => i.qtd > 0)) erros.push(['itens', 'Adicione pelo menos um item.']);
    if (!est.dia || est.hora === null) erros.push(['hora', 'Escolha o dia e o horário da retirada.']);
    if (!el.nome.value.trim()) erros.push(['nome', 'Diga o seu nome para a padaria.']);
    return erros;
  }

  function mensagem() {
    const o = oc();
    const linhas = [
      'Olá, Ki-Pão! Quero fazer uma encomenda pelo site.',
      '',
      `*Ocasião:* ${o.nome}${o.pessoas ? ` (${descrevePessoas()})` : ''}`,
      '*Itens:*',
    ];
    est.itens.filter((i) => i.qtd > 0).forEach((i) => {
      const qtd = i.unid === 'kg' ? `${fmtNum(i.qtd)} kg de` : `${i.qtd}`;
      linhas.push(`• ${qtd} ${i.nome.charAt(0).toLowerCase()}${i.nome.slice(1)}${i.detalhe ? ` (${i.detalhe})` : ''}`);
    });
    linhas.push('', `*Retirada:* ${textoRetirada()}`, `*Nome:* ${el.nome.value.trim()}`);
    const obs = el.obs.value.trim();
    if (obs) linhas.push(`*Observações:* ${obs}`);
    linhas.push('', 'Pode me confirmar o valor e a disponibilidade? Aguardo a confirmação.');
    return linhas.join('\n');
  }

  el.enviar.addEventListener('click', (e) => {
    $$('.erro', form).forEach((p) => { p.textContent = ''; });
    el.nome.removeAttribute('aria-invalid');
    const erros = valida();
    if (erros.length) {
      e.preventDefault();
      erros.forEach(([campo, msg]) => { erroEl(campo).textContent = msg; });
      el.aviso.textContent = `Falta pouco: ${erros.map(([, m]) => m.replace(/\.$/, '').toLowerCase()).join('; ')}.`;
      el.aviso.className = 'aviso aviso--erro';
      const [primeiro] = erros[0];
      if (primeiro === 'nome') { el.nome.setAttribute('aria-invalid', 'true'); el.nome.focus(); }
      else if (primeiro === 'hora') { const alvo = $('input[name="hora"]', el.horas) || $('input[name="dia"]:not(:disabled)', el.dias); if (alvo) alvo.focus(); }
      else { const alvo = $('[data-delta="1"]', el.itens) || $('[data-extra]', el.extras); if (alvo) alvo.focus(); }
      if (erros.some(([c]) => c === 'nome')) el.nome.setAttribute('aria-invalid', 'true');
      return;
    }
    el.enviar.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem())}`;
    el.aviso.textContent = 'Pronto! O WhatsApp abriu com o pedido escrito. É só tocar em enviar.';
    el.aviso.className = 'aviso aviso--ok';
  });

  /* início */
  const inicial = $('input[name="ocasiao"]:checked', form);
  if (inicial) est.ocasiao = inicial.value;
  lePessoas();
  montaItens();
  montaDias();
  resumo();
})();
