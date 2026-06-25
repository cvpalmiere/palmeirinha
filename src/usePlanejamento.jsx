// ============================================================
// PALMEIRINHA – Gerenciamento de Planejamentos
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { PLANEJAMENTO_VAZIO } from './dados.js';
import { parsePrompt } from './parser.js';
import { verificarEReorganizar } from './inteligencia.js';

export function usePlanejamento() {
  const [planejamento, setPlanejamento] = useLocalStorage('palmeirinha_planejamento', null);
  const [historico, setHistorico] = useLocalStorage('palmeirinha_historico', []);
  const [loading, setLoading] = useState(false);
  const [notificacao, setNotificacao] = useState(null);

  const mostrarNotificacao = useCallback((msg) => {
    setNotificacao(msg);
    setTimeout(() => setNotificacao(null), 5000);
  }, []);

  const criarDoPrompt = useCallback((textoPrompt) => {
    setLoading(true);
    try {
      const novo = parsePrompt(textoPrompt);
      if (!novo.atividades || novo.atividades.length === 0) {
        throw new Error('Nenhuma atividade encontrada no prompt.');
      }
      setPlanejamento(novo);
      mostrarNotificacao('✅ Planejamento criado com sucesso!');
      return novo;
    } catch (error) {
      mostrarNotificacao(`❌ Erro ao criar planejamento: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setPlanejamento, mostrarNotificacao]);

  const arquivarAtual = useCallback(() => {
    if (!planejamento) {
      mostrarNotificacao('❌ Nenhum planejamento ativo para arquivar.');
      return null;
    }

    const itemHistorico = {
      id: planejamento.id || `hist_${Date.now()}`,
      nome: planejamento.nome || 'Planejamento',
      tipo: planejamento.tipo || 'semestre',
      periodo: planejamento.periodo || { inicio: '', fim: '' },
      stats: {
        totalDias: planejamento.stats?.totalDias || 0,
        diasEstudados: planejamento.stats?.diasEstudados || 0,
        prazosConcluidos: planejamento.stats?.prazosConcluidos || 0,
        totalPrazos: planejamento.eventos?.length || 0,
        aulasAssistidas: planejamento.stats?.aulasAssistidas || 0,
        totalAulas: planejamento.aulas?.length || 0,
        porcentagemConcluido: planejamento.stats?.porcentagemConcluido || 0,
      },
      dataArquivamento: new Date().toISOString(),
    };

    setHistorico(prev => [itemHistorico, ...prev]);
    setPlanejamento(null);
    mostrarNotificacao(`📦 "${itemHistorico.nome}" arquivado com sucesso!`);
    return itemHistorico;
  }, [planejamento, setHistorico, setPlanejamento, mostrarNotificacao]);

  const resetarAtual = useCallback(() => {
    if (!planejamento) {
      mostrarNotificacao('❌ Nenhum planejamento ativo para resetar.');
      return;
    }
    setPlanejamento(null);
    mostrarNotificacao('🔄 Planejamento resetado com sucesso!');
  }, [planejamento, setPlanejamento, mostrarNotificacao]);

  const concluirEvento = useCallback((eventoId) => {
    if (!planejamento) return;

    setPlanejamento(prev => {
      const novo = { ...prev };
      const evento = novo.eventos.find(e => e.id === eventoId);
      if (!evento) return prev;
      evento.concluido = true;
      return novo;
    });

    mostrarNotificacao('✅ Evento concluído com sucesso!');

    setTimeout(() => {
      const hoje = new Date().toISOString().split('T')[0];
      reorganizar(hoje);
    }, 300);
  }, [planejamento, setPlanejamento, mostrarNotificacao]);

  const reabrirEvento = useCallback((eventoId) => {
    if (!planejamento) return;

    setPlanejamento(prev => {
      const novo = { ...prev };
      const evento = novo.eventos.find(e => e.id === eventoId);
      if (!evento) return prev;
      evento.concluido = false;
      return novo;
    });

    mostrarNotificacao('🔄 Evento reaberto!');

    setTimeout(() => {
      const hoje = new Date().toISOString().split('T')[0];
      reorganizar(hoje);
    }, 300);
  }, [planejamento, setPlanejamento, mostrarNotificacao]);

  const marcarAulaAssistida = useCallback((aulaId, concluido) => {
    if (!planejamento) return;

    setPlanejamento(prev => {
      const novo = { ...prev };
      novo.progresso.aulasAssistidas = {
        ...novo.progresso.aulasAssistidas,
        [aulaId]: concluido,
      };
      return novo;
    });

    if (concluido) {
      setTimeout(() => {
        const hoje = new Date().toISOString().split('T')[0];
        reorganizar(hoje);
      }, 300);
    }
  }, [planejamento, setPlanejamento]);

  const marcarEstudoConcluido = useCallback((dateStr, concluido) => {
    if (!planejamento) return;

    setPlanejamento(prev => {
      const novo = { ...prev };
      novo.progresso.estudosConcluidos = {
        ...novo.progresso.estudosConcluidos,
        [dateStr]: concluido,
      };
      return novo;
    });
  }, [planejamento, setPlanejamento]);

  const editarManha = useCallback((dateStr, conteudo) => {
    if (!planejamento) return;

    setPlanejamento(prev => {
      const novo = { ...prev };
      novo.progresso.edicoesManha = {
        ...novo.progresso.edicoesManha,
        [dateStr]: conteudo,
      };
      return novo;
    });
  }, [planejamento, setPlanejamento]);

  const removerDoHistorico = useCallback((id) => {
    setHistorico(prev => prev.filter(item => item.id !== id));
    mostrarNotificacao('🗑️ Item removido do histórico.');
  }, [setHistorico, mostrarNotificacao]);

  const reorganizar = useCallback((dataHoje) => {
    if (!planejamento) {
      mostrarNotificacao('❌ Nenhum planejamento para reorganizar.');
      return null;
    }

    const data = dataHoje || new Date().toISOString().split('T')[0];
    const novo = verificarEReorganizar(planejamento, data);

    if (novo !== planejamento) {
      setPlanejamento(novo);
      mostrarNotificacao('🔄 Plano reorganizado automaticamente!');
      return novo;
    }

    return planejamento;
  }, [planejamento, setPlanejamento, mostrarNotificacao]);

  const exportarDados = useCallback(() => {
    if (!planejamento) {
      mostrarNotificacao('❌ Nenhum planejamento para exportar.');
      return null;
    }

    const dados = {
      planejamento,
      historico,
      dataExportacao: new Date().toISOString(),
      versao: '2.0',
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palmeirinha_${planejamento.nome || 'backup'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    mostrarNotificacao('📤 Dados exportados com sucesso!');
    return dados;
  }, [planejamento, historico, mostrarNotificacao]);

  const importarDados = useCallback((dadosJSON) => {
    try {
      const dados = typeof dadosJSON === 'string' ? JSON.parse(dadosJSON) : dadosJSON;
      if (!dados.planejamento) {
        throw new Error('Arquivo inválido: não contém planejamento.');
      }
      setPlanejamento(dados.planejamento);
      if (dados.historico) {
        setHistorico(dados.historico);
      }
      mostrarNotificacao('📥 Dados importados com sucesso!');
      return dados;
    } catch (error) {
      mostrarNotificacao(`❌ Erro ao importar: ${error.message}`);
      throw error;
    }
  }, [setPlanejamento, setHistorico, mostrarNotificacao]);

  const temPlanejamento = !!planejamento;
  const isFerias = planejamento?.tipo === 'ferias';
  const isSemestre = planejamento?.tipo === 'semestre';

  return {
    planejamento,
    historico,
    loading,
    notificacao,
    temPlanejamento,
    isFerias,
    isSemestre,
    criarDoPrompt,
    arquivarAtual,
    resetarAtual,
    concluirEvento,
    reabrirEvento,
    marcarAulaAssistida,
    marcarEstudoConcluido,
    editarManha,
    removerDoHistorico,
    reorganizar,
    exportarDados,
    importarDados,
    mostrarNotificacao,
  };
}