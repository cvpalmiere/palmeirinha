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

function getDiasUteis(inicio, fim, diasUteis) {
  const dias = [];
  const cur = new Date(inicio);
  while (cur <= fim) {
    if (diasUteis.includes(cur.getDay())) {
      dias.push(new Date(cur));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return dias;
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

function reorganizarPlanejamento(planejamento, dataHoje) {
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

  if (atrasados.length === 0 && hojeItems.length > 0) {
    return planejamento;
  }

  const ordenados = [...atrasados, ...hojeItems, ...futuros];

  const inicioRedistribuicao = new Date(hoje);
  inicioRedistribuicao.setDate(inicioRedistribuicao.getDate() + 1);
  const inicioStr = formatDateISO(inicioRedistribuicao);

  const fim = planejamento.periodo?.fim ? parseDate(planejamento.periodo.fim) : new Date(hoje);
  fim.setMonth(fim.getMonth() + 2);

  const diasDisponiveis = getDiasUteis(inicioRedistribuicao, fim, diasUteis);

  if (diasDisponiveis.length === 0) {
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

function adiantarAtividade(planejamento, dataHoje) {
  if (!planejamento || !planejamento.aulas) return planejamento;

  const hoje = new Date(dataHoje);
  hoje.setHours(0, 0, 0, 0);
  const hojeStr = formatDateISO(hoje);

  const aulas = planejamento.aulas || [];
  const aulasPorDisciplina = {};

  aulas.forEach(aula => {
    if (!aulasPorDisciplina[aula.disciplinaNome]) {
      aulasPorDisciplina[aula.disciplinaNome] = [];
    }
    aulasPorDisciplina[aula.disciplinaNome].push(aula);
  });

  let modificado = false;
  const novasAulas = [...aulas];

  for (const [nomeDisciplina, aulasDaDisciplina] of Object.entries(aulasPorDisciplina)) {
    const naoConcluidas = aulasDaDisciplina.filter(a => !a.concluido);
    if (naoConcluidas.length === 0) continue;

    const aulasHoje = naoConcluidas.filter(a => a.data === hojeStr);
    if (aulasHoje.length === 0) continue;

    const todasConcluidas = aulasHoje.every(a => a.concluido === true);
    if (!todasConcluidas) continue;

    const proximas = naoConcluidas
      .filter(a => a.data > hojeStr)
      .sort((a, b) => a.data.localeCompare(b.data));

    if (proximas.length === 0) continue;

    const proxima = proximas[0];
    const index = novasAulas.findIndex(a => a.id === proxima.id);
    if (index !== -1) {
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);
      const amanhaStr = formatDateISO(amanha);
      novasAulas[index] = { ...novasAulas[index], data: amanhaStr };
      modificado = true;
    }
  }

  if (modificado) {
    return {
      ...planejamento,
      aulas: novasAulas,
      ultimaReorganizacao: new Date().toISOString(),
    };
  }

  return planejamento;
}

export function verificarEReorganizar(planejamento, dataHoje) {
  if (!planejamento) return planejamento;

  const hoje = new Date(dataHoje);
  hoje.setHours(0, 0, 0, 0);

  let novoPlanejamento = adiantarAtividade(planejamento, dataHoje);

  const aulas = novoPlanejamento.aulas || [];
  const eventos = novoPlanejamento.eventos || [];

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

  if (temAtrasados || !temHoje) {
    return reorganizarPlanejamento(novoPlanejamento, dataHoje);
  }

  return novoPlanejamento;
}
