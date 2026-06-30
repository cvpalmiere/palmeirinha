// ============================================================
// PALMEIRINHA – Parser do texto do prompt
// ============================================================

import { PLANEJAMENTO_VAZIO } from './dados.js';

function converterDataBRparaISO(dataStr) {
  if (!dataStr) return '';
  if (dataStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dataStr;
  const partes = dataStr.split('/');
  if (partes.length === 3) {
    const dia = partes[0].padStart(2, '0');
    const mes = partes[1].padStart(2, '0');
    const ano = partes[2];
    return `${ano}-${mes}-${dia}`;
  }
  return dataStr;
}

function parseDate(str) {
  if (!str) return null;
  const iso = converterDataBRparaISO(str);
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getCorAtividade(index) {
  const cores = ['#4A9EFF', '#F2994A', '#6FCF97', '#BB6BD9', '#FF6B6B', '#56CCF2', '#FDCB6E'];
  return cores[index % cores.length];
}

function limparTexto(texto) {
  let limpo = texto
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const linhas = limpo.split('\n');
  const linhasJuntas = [];

  for (let i = 0; i < linhas.length; i++) {
    let linha = linhas[i].trim();
    if (linha.startsWith('=== ') && !linha.endsWith(' ===')) {
      let linhaCompleta = linha;
      for (let j = i + 1; j < linhas.length; j++) {
        const prox = linhas[j].trim();
        if (prox.includes(' ===') || prox.includes('===')) {
          linhaCompleta += ' ' + prox;
          i = j;
          break;
        } else if (prox.length > 0 && !prox.startsWith('[')) {
          linhaCompleta += ' ' + prox;
          i = j;
        } else {
          break;
        }
      }
      linhasJuntas.push(linhaCompleta);
    } else if (linha.length > 0) {
      linhasJuntas.push(linha);
    }
  }
  return linhasJuntas.join('\n');
}

function normalizarAtividades(texto) {
  let normalizado = texto;
  normalizado = normalizado.replace(/ATIVIDADE\s*\n\s*(\d+)\s*:/g, 'ATIVIDADE $1:');
  normalizado = normalizado.replace(/ATIVIDADE\s*(\d+)\s*:\s*\n\s*([^\n]+)/g, 'ATIVIDADE $1: $2');
  normalizado = normalizado.replace(/([^\n]+)\s*\n\s*-\s*\n\s*(\d+[.,]?\d*h?\/dia)/g, '$1 - $2');
  normalizado = normalizado.replace(/([^\n]+)\s*\n\s*-\s*\n\s*(\d+[.,]?\d*h)/g, '$1 - $2');

  const linhas = normalizado.split('\n');
  const resultado = [];

  for (let i = 0; i < linhas.length; i++) {
    let linha = linhas[i].trim();
    if (linha.startsWith('[') && !linha.includes(']')) {
      let completa = linha;
      for (let j = i + 1; j < linhas.length; j++) {
        const prox = linhas[j].trim();
        completa += ' ' + prox;
        if (prox.includes(']')) {
          i = j;
          break;
        }
      }
      resultado.push(completa);
    } else if (linha.length > 0) {
      resultado.push(linha);
    }
  }
  return resultado.join('\n');
}

function gerarFerias(planejamento) {
  const { atividades, periodo, config } = planejamento;
  const diasUteis = config.diasUteis || [1, 2, 3, 4, 5];

  const inicio = parseDate(periodo.inicio);
  const fim = parseDate(periodo.fim);

  if (!inicio || !fim) {
    console.warn('⚠️ Datas inválidas');
    return { aulas: [], eventos: [] };
  }

  const dias = [];
  const cur = new Date(inicio);
  while (cur <= fim) {
    if (diasUteis.includes(cur.getDay())) dias.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  const aulas = [];
  const eventos = [];

  atividades.forEach((atividade) => {
    const etapas = atividade.etapas || [];
    const totalEtapas = etapas.length;
    const totalDias = dias.length;

    if (totalEtapas === 0 || totalDias === 0) return;

    const etapasPorDia = Math.ceil(totalEtapas / totalDias);
    let etapaIndex = 0;

    for (let d = 0; d < totalDias && etapaIndex < totalEtapas; d++) {
      const dia = dias[d];
      const dataStr = formatDateISO(dia);
      const numEtapas = Math.min(etapasPorDia, totalEtapas - etapaIndex);

      for (let e = 0; e < numEtapas && etapaIndex < totalEtapas; e++) {
        const etapa = etapas[etapaIndex];

        aulas.push({
          id: `aula_${Date.now()}_${atividade.nome.replace(/\s/g, '_')}_${etapaIndex}`,
          disciplinaNome: atividade.nome,
          data: dataStr,
          tema: etapa.length > 50 ? etapa.substring(0, 50) + '...' : etapa,
          conteudo: etapa,
          estrategia: 'Estudo autônomo',
          preparacao: '',
          avaliacao: '',
          ferias: true,
          concluido: false,
        });

        eventos.push({
          id: `ev_${Date.now()}_${atividade.nome.replace(/\s/g, '_')}_${etapaIndex}`,
          disciplinaNome: atividade.nome,
          tipo: 'trabalho',
          titulo: etapa.length > 60 ? etapa.substring(0, 60) + '...' : etapa,
          data: dataStr,
          prioridadeEstudo: null,
          concluido: false,
          ferias: true,
        });

        etapaIndex++;
      }
    }
  });

  return { aulas, eventos };
}

function gerarNome(planejamento) {
  const tipo = planejamento.tipo === 'ferias' ? '🏖️ Férias' : '📚 Semestre';
  const inicio = planejamento.periodo.inicio ? parseDate(planejamento.periodo.inicio) : null;
  const fim = planejamento.periodo.fim ? parseDate(planejamento.periodo.fim) : null;

  if (inicio && fim && !isNaN(inicio.getTime()) && !isNaN(fim.getTime())) {
    const mesInicio = inicio.toLocaleString('pt-BR', { month: 'long' });
    const anoInicio = inicio.getFullYear();
    const mesFim = fim.toLocaleString('pt-BR', { month: 'long' });
    return `${tipo} ${mesInicio} - ${mesFim} ${anoInicio}`;
  }
  return `${tipo} ${new Date().getFullYear()}`;
}

function calcularStats(plan) {
  const stats = {
    totalDias: 0,
    diasEstudados: 0,
    prazosConcluidos: 0,
    prazosPendentes: 0,
    aulasAssistidas: 0,
    totalAulas: plan.aulas?.length || 0,
    porcentagemConcluido: 0,
  };

  const estudos = plan.progresso?.estudosConcluidos || {};
  stats.diasEstudados = Object.values(estudos).filter(Boolean).length;

  const eventos = plan.eventos || [];
  stats.prazosConcluidos = eventos.filter(e => e.concluido).length;
  stats.prazosPendentes = eventos.filter(e => !e.concluido).length;

  const aulas = plan.progresso?.aulasAssistidas || {};
  stats.aulasAssistidas = Object.values(aulas).filter(Boolean).length;

  const totalItems = stats.totalAulas + eventos.length;
  const concluidos = stats.aulasAssistidas + stats.prazosConcluidos;
  stats.porcentagemConcluido = totalItems > 0 ? Math.round((concluidos / totalItems) * 100) : 0;

  return stats;
}

export function parsePrompt(texto) {
  console.log('📄 Iniciando parse do texto...');

  const textoLimpo = limparTexto(texto);
  const textoNormalizado = normalizarAtividades(textoLimpo);

  const linhas = textoNormalizado.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const resultado = {
    ...PLANEJAMENTO_VAZIO,
    disciplinas: [],
    aulas: [],
    eventos: [],
    atividades: [],
  };

  let secaoAtual = '';
  let atividadeAtual = null;

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];

    if (linha.includes('=== TIPO ===') || linha.includes('TIPO')) {
      const tipo = linhas[i + 1]?.toLowerCase().trim() || '';
      if (tipo.includes('ferias') || tipo.includes('férias')) {
        resultado.tipo = 'ferias';
      } else {
        resultado.tipo = 'semestre';
      }
      i++;
      continue;
    }

    if (linha.includes('=== PERÍODO ===') || linha.includes('PERÍODO')) {
  for (let j = i + 1; j < linhas.length; j++) {
    const l = linhas[j];
    if (l.includes('===')) break;
    if (l.includes('Início:')) {
      const dataRaw = l.replace('Início:', '').trim();
      resultado.periodo.inicio = converterDataBRparaISO(dataRaw);
    }
    if (l.includes('Fim:')) {
      const dataRaw = l.replace('Fim:', '').trim();
      resultado.periodo.fim = converterDataBRparaISO(dataRaw);
    }
    i = j;
  }
  continue;
}

    if (linha.includes('=== HORÁRIOS ===') || linha.includes('HORÁRIOS')) {
      for (let j = i + 1; j < linhas.length; j++) {
        const l = linhas[j];
        if (l.includes('===')) break;
        const match = l.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
        if (match) {
          const [_, inicio, fim] = match;
          if (parseInt(inicio) < 12) {
            resultado.config.blocos.manha.inicio = inicio;
            resultado.config.blocos.manha.fim = fim;
          } else {
            resultado.config.blocos.tarde.inicio = inicio;
            resultado.config.blocos.tarde.fim = fim;
          }
        }
        i = j;
      }
      continue;
    }

    if (linha.includes('=== ATIVIDADES ===') || (linha.includes('ATIVIDADES') && linha.includes('==='))) {
      secaoAtual = 'atividades';
      continue;
    }

    if (linha.match(/\[ATIVIDADE\s*\d+:/i) || linha.match(/ATIVIDADE\s*\d+:/i)) {
      let nome = '';
      let tempo = 2;

      const matchCompleto = linha.match(/ATIVIDADE\s*\d+\s*:\s*([^\]]+?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*h/i);
      if (matchCompleto) {
        nome = matchCompleto[1].trim();
        tempo = parseFloat(matchCompleto[2]) || 2;
      } else {
        const matchNome = linha.match(/ATIVIDADE\s*\d+\s*:\s*([^\]]+)/i);
        if (matchNome) {
          nome = matchNome[1].trim();
        } else {
          nome = linha.replace(/\[ATIVIDADE\s*\d+:/i, '').replace(/\]/, '').trim();
        }
      }

      atividadeAtual = {
        nome: nome,
        tempoPorDia: tempo,
        etapas: [],
        cor: getCorAtividade(resultado.atividades.length),
      };
      resultado.atividades.push(atividadeAtual);
      continue;
    }

    if (secaoAtual === 'atividades' && atividadeAtual && !linha.includes('===')) {
      if (linha.includes('Bloco') || linha.includes('Total:') || linha.includes('h/dia')) continue;
      if (linha.startsWith('---') || linha.startsWith('===')) continue;
      if (linha.match(/^ATIVIDADE\s*\d+:/i)) continue;
      if (linha.length > 0) {
        atividadeAtual.etapas.push(linha);
      }
      continue;
    }

    if (linha.includes('=== DIAS ÚTEIS ===') || linha.includes('DIAS ÚTEIS')) {
      for (let j = i + 1; j < linhas.length; j++) {
        const l = linhas[j];
        if (l.includes('===')) break;
        const dias = l.split(',').map(d => d.trim().toLowerCase());
        const mapa = {
          'segunda': 1, 'terça': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5,
          'sábado': 6, 'domingo': 0,
        };
        resultado.config.diasUteis = dias.map(d => mapa[d]).filter(d => d !== undefined);
        i = j;
      }
      continue;
    }
  }

  console.log('📊 Atividades encontradas:', resultado.atividades.length);

  if (resultado.tipo === 'ferias' && resultado.atividades.length > 0) {
    const { aulas, eventos } = gerarFerias(resultado);
    resultado.aulas = aulas;
    resultado.eventos = eventos;

    resultado.disciplinas = resultado.atividades.map((atv, idx) => ({
      id: `ferias_${idx + 1}`,
      nome: atv.nome,
      professor: '—',
      diaSemana: null,
      horario: resultado.config.blocos.manha.inicio || '09:00',
      cor: atv.cor || getCorAtividade(idx),
      ead: true,
      ferias: true,
    }));
  }

  resultado.id = `planejamento_${Date.now()}`;
  resultado.dataCriacao = new Date().toISOString();
  resultado.nome = gerarNome(resultado);

  if (resultado.periodo.inicio && resultado.periodo.fim) {
    const inicio = parseDate(resultado.periodo.inicio);
    const fim = parseDate(resultado.periodo.fim);
    const diasUteis = resultado.config.diasUteis || [1, 2, 3, 4, 5];
    let count = 0;
    if (inicio && fim) {
      const cur = new Date(inicio);
      while (cur <= fim) {
        if (diasUteis.includes(cur.getDay())) count++;
        cur.setDate(cur.getDate() + 1);
      }
    }
    resultado.stats.totalDias = count;
  }

  resultado.stats = calcularStats(resultado);

  console.log('📊 Total de aulas geradas:', resultado.aulas.length);
  console.log('📊 Total de eventos gerados:', resultado.eventos.length);

  return resultado;
}