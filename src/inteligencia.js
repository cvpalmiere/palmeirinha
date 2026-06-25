// ============================================================
// PALMEIRINHA – Inteligência de Reprogramação Automática
// ============================================================

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function calcularStats(aulas, eventos) {
  const totalAulas = aulas.length;
  const concluidas = aulas.filter(a => a.concluido).length;
  const eventosConcluidos = eventos.filter(e => e.concluido).length;
  const totalEventos = eventos.length;
  const totalItems = totalAulas + totalEventos;
  const concluidos = concluidas + eventosConcluidos;

  return {
    totalAulas,
    aulasAssistidas: concluidas,
    totalEventos,
    eventosConcluidos,
    porcentagemConcluido: totalItems > 0 ? Math.round((concluidos / totalItems) * 100) : 0,
  };
}

function puxarProximoItem(planejamento, dataHoje) {
  const hoje = new Date(dataHoje);
  hoje.setHours(0, 0, 0, 0);
  const hojeStr = formatDateISO(hoje);

  const aulas = planejamento.aulas || [];

  const proximo = aulas
    .filter(a => !a.concluido)
    .sort((a, b) => {
      const dateA = parseDate(a.data);
      const dateB = parseDate(b.data);
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    })[0];

  if (!proximo) return planejamento;

  const novasAulas = aulas.map(a => {
    if (a.id === proximo.id) {
      return { ...a, data: hojeStr };
    }
    return a;
  });

  return {
    ...planejamento,
    aulas: novasAulas,
    ultimaReorganizacao: new Date().toISOString(),
  };
}

export function reorganizarPlanejamento(planejamento, dataHoje) {
  if (!planejamento || !planejamento.aulas) return planejamento;

  const hoje = new Date(dataHoje);
  hoje.setHours(0, 0, 0, 0);
  const hojeStr = formatDateISO(hoje);

  const aulas = planejamento.aulas || [];
  const eventos = planejamento.eventos || [];
  const config = planejamento.config || {};
  const diasUteis = config.diasUteis || [1, 2, 3, 4, 5];

  const aulasPendentes = aulas.filter(a => !a.concluido);
  const eventosPendentes = eventos.filter(e => !e.concluido);
  const todosPendentes = [...aulasPendentes, ...eventosPendentes];

  if (todosPendentes.length === 0) {
    console.log('✅ Todos os itens já foram concluídos!');
    return planejamento;
  }

  const atrasados = todosPendentes.filter(item => {
    const dataItem = parseDate(item.data);
    if (!dataItem) return false;
    dataItem.setHours(0, 0, 0, 0);
    return dataItem < hoje;
  });

  const hojeItems = todosPendentes.filter(item => {
    const dataItem = parseDate(item.data);
    if (!dataItem) return false;
    dataItem.setHours(0, 0, 0, 0);
    return dataItem.getTime() === hoje.getTime();
  });

  const futuros = todosPendentes.filter(item => {
    const dataItem = parseDate(item.data);
    if (!dataItem) return false;
    dataItem.setHours(0, 0, 0, 0);
    return dataItem > hoje;
  });

  console.log(`📊 Reorganização: ${atrasados.length} atrasados, ${hojeItems.length} hoje, ${futuros.length} futuros`);

  if (atrasados.length === 0 && hojeItems.length > 0) {
    console.log('✅ Plano OK - tem itens para hoje');
    return planejamento;
  }

  const ordenados = [...atrasados, ...hojeItems, ...futuros];

  const diasDisponiveis = [];
  const cur = new Date(hoje);
  const fim = planejamento.periodo?.fim ? parseDate(planejamento.periodo.fim) : new Date(hoje);
  fim.setMonth(fim.getMonth() + 2);

  while (cur <= fim) {
    if (diasUteis.includes(cur.getDay())) {
      diasDisponiveis.push(new Date(cur));
    }
    cur.setDate(cur.getDate() + 1);
  }

  if (diasDisponiveis.length === 0) {
    console.warn('⚠️ Nenhum dia disponível para reorganizar');
    return planejamento;
  }

  const totalItens = ordenados.length;
  const totalDias = diasDisponiveis.length;
  const itensPorDia = Math.ceil(totalItens / totalDias);

  const novaDistribuicao = {};
  let itemIndex = 0;

  for (let d = 0; d < totalDias && itemIndex < totalItens; d++) {
    const dia = diasDisponiveis[d];
    const dataStr = formatDateISO(dia);
    novaDistribuicao[dataStr] = [];

    for (let i = 0; i < itensPorDia && itemIndex < totalItens; i++) {
      novaDistribuicao[dataStr].push(ordenados[itemIndex].id);
      itemIndex++;
    }
  }

  console.log(`📊 Distribuição: ${totalItens} itens em ${totalDias} dias (${itensPorDia} por dia)`);

  const novasAulas = aulas.map(aula => {
    if (aula.concluido) return aula;
    for (const [dataStr, ids] of Object.entries(novaDistribuicao)) {
      if (ids.includes(aula.id)) {
        return { ...aula, data: dataStr };
      }
    }
    return aula;
  });

  const novosEventos = eventos.map(evento => {
    if (evento.concluido) return evento;
    for (const [dataStr, ids] of Object.entries(novaDistribuicao)) {
      if (ids.includes(evento.id)) {
        return { ...evento, data: dataStr };
      }
    }
    return evento;
  });

  return {
    ...planejamento,
    aulas: novasAulas,
    eventos: novosEventos,
    stats: calcularStats(novasAulas, novosEventos),
    ultimaReorganizacao: new Date().toISOString(),
  };
}

export function verificarEReorganizar(planejamento, dataHoje) {
  if (!planejamento) return planejamento;

  const hoje = new Date(dataHoje);
  hoje.setHours(0, 0, 0, 0);

  const aulas = planejamento.aulas || [];

  const temAtrasados = aulas.some(a => {
    if (a.concluido) return false;
    const dataItem = parseDate(a.data);
    if (!dataItem) return false;
    dataItem.setHours(0, 0, 0, 0);
    return dataItem < hoje;
  });

  const temHoje = aulas.some(a => {
    if (a.concluido) return false;
    const dataItem = parseDate(a.data);
    if (!dataItem) return false;
    dataItem.setHours(0, 0, 0, 0);
    return dataItem.getTime() === hoje.getTime();
  });

  if (!temAtrasados && temHoje) {
    return planejamento;
  }

  if (!temAtrasados && !temHoje) {
    return puxarProximoItem(planejamento, dataHoje);
  }

  return reorganizarPlanejamento(planejamento, dataHoje);
}