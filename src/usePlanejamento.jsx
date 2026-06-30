import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage.js";
import { PLANEJAMENTO_VAZIO } from "./dados.js";
import { parsePrompt } from "./parser.js";
import { verificarEReorganizar, forcarReorganizacao } from "./inteligencia.js";

export function usePlanejamento() {
  const [planejamento, setPlanejamento] = useLocalStorage("palmeirinha_planejamento", null);
  const [historico, setHistorico] = useLocalStorage("palmeirinha_historico", []);
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
        throw new Error("Nenhuma atividade encontrada no prompt.");
      }
      setPlanejamento(novo);
      mostrarNotificacao("Planejamento criado com sucesso!");
      return novo;
    } catch (error) {
      mostrarNotificacao("Erro: " + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setPlanejamento, mostrarNotificacao]);

  const arquivarAtual = useCallback(() => {
    if (!planejamento) {
      mostrarNotificacao("Nenhum planejamento ativo para arquivar.");
      return null;
    }

    const itemHistorico = {
      id: planejamento.id || "hist_" + Date.now(),
      nome: planejamento.nome || "Planejamento",
      tipo: planejamento.tipo || "semestre",
      periodo: planejamento.periodo || { inicio: "", fim: "" },
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
    mostrarNotificacao("\"" + itemHistorico.nome + "\" arquivado com sucesso!");
    return itemHistorico;
  }, [planejamento, setHistorico, setPlanejamento, mostrarNotificacao]);

  const resetarAtual = useCallback(() => {
    if (!planejamento) {
      mostrarNotificacao("Nenhum planejamento ativo para resetar.");
      return;
    }
    setPlanejamento(null);
    mostrarNotificacao("Planejamento resetado com sucesso!");
  }, [planejamento, setPlanejamento, mostrarNotificacao]);

  const hojeISO = () => {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    return ano + "-" + mes + "-" + dia;
  };

  const aplicarEReorganizar = useCallback((mutador, msgSucesso) => {
    let mudou = false;

    setPlanejamento(prev => {
      if (!prev) return prev;
      const mutado = mutador(prev);
      const reorganizado = verificarEReorganizar(mutado, hojeISO());
      mudou = reorganizado !== mutado || reorganizado !== prev;
      return reorganizado;
    });

    if (msgSucesso) {
      mostrarNotificacao(mudou ? msgSucesso + " Plano reorganizado!" : msgSucesso);
    }
  }, [setPlanejamento, mostrarNotificacao]);

  const concluirEvento = useCallback((eventoId) => {
    if (!planejamento) return;
    aplicarEReorganizar(prev => ({
      ...prev,
      eventos: prev.eventos.map(e => e.id === eventoId ? { ...e, concluido: true } : e),
    }), "Evento concluído!");
  }, [planejamento, aplicarEReorganizar]);

  const reabrirEvento = useCallback((eventoId) => {
    if (!planejamento) return;
    aplicarEReorganizar(prev => ({
      ...prev,
      eventos: prev.eventos.map(e => e.id === eventoId ? { ...e, concluido: false } : e),
    }), "Evento reaberto!");
  }, [planejamento, aplicarEReorganizar]);

  const marcarAulaAssistida = useCallback((aulaId, concluido) => {
    if (!planejamento) return;
    aplicarEReorganizar(prev => ({
      ...prev,
      progresso: {
        ...prev.progresso,
        aulasAssistidas: { ...prev.progresso.aulasAssistidas, [aulaId]: concluido },
      },
      aulas: prev.aulas.map(a => a.id === aulaId ? { ...a, concluido } : a),
    }), concluido ? "Aula marcada como assistida!" : null);
  }, [planejamento, aplicarEReorganizar]);

  const marcarEstudoConcluido = useCallback((dateStr, concluido) => {
    if (!planejamento) return;
    aplicarEReorganizar(prev => ({
      ...prev,
      progresso: {
        ...prev.progresso,
        estudosConcluidos: { ...prev.progresso.estudosConcluidos, [dateStr]: concluido },
      },
    }), null);
  }, [planejamento, aplicarEReorganizar]);

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
    mostrarNotificacao("Item removido do histórico.");
  }, [setHistorico, mostrarNotificacao]);

  const reorganizar = useCallback((dataHoje) => {
    if (!planejamento) {
      mostrarNotificacao("Nenhum planejamento para reorganizar.");
      return null;
    }

    let resultado = null;
    let mudou = false;

    setPlanejamento(prev => {
      if (!prev) return prev;
      const data = dataHoje || hojeISO();
      const novo = verificarEReorganizar(prev, data);
      mudou = novo !== prev;
      resultado = novo;
      return novo;
    });

    mostrarNotificacao(mudou ? "Plano reorganizado!" : "Plano já está organizado.");
    return resultado;
  }, [planejamento, setPlanejamento, mostrarNotificacao]);

  const forcarReorganizar = useCallback((dataHoje) => {
    if (!planejamento) {
      mostrarNotificacao("Nenhum planejamento para reorganizar.");
      return null;
    }

    let resultado = null;
    let mudou = false;

    setPlanejamento(prev => {
      if (!prev) return prev;
      const data = dataHoje || hojeISO();
      const novo = forcarReorganizacao(prev, data);
      mudou = novo !== prev;
      resultado = novo;
      return novo;
    });

    mostrarNotificacao(mudou ? "Plano reorganizado!" : "Plano já está organizado.");
    return resultado;
  }, [planejamento, setPlanejamento, mostrarNotificacao]);

  const exportarDados = useCallback(() => {
    if (!planejamento) {
      mostrarNotificacao("Nenhum planejamento para exportar.");
      return null;
    }

    const dados = {
      planejamento,
      historico,
      dataExportacao: new Date().toISOString(),
      versao: "2.0",
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "palmeirinha_" + (planejamento.nome || "backup") + "_" + Date.now() + ".json";
    a.click();
    URL.revokeObjectURL(url);

    mostrarNotificacao("Dados exportados com sucesso!");
    return dados;
  }, [planejamento, historico, mostrarNotificacao]);

  const importarDados = useCallback((dadosJSON) => {
    try {
      const dados = typeof dadosJSON === "string" ? JSON.parse(dadosJSON) : dadosJSON;
      if (!dados.planejamento) {
        throw new Error("Arquivo inválido: não contém planejamento.");
      }
      setPlanejamento(dados.planejamento);
      if (dados.historico) {
        setHistorico(dados.historico);
      }
      mostrarNotificacao("Dados importados com sucesso!");
      return dados;
    } catch (error) {
      mostrarNotificacao("Erro ao importar: " + error.message);
      throw error;
    }
  }, [setPlanejamento, setHistorico, mostrarNotificacao]);

  const temPlanejamento = !!planejamento;
  const isFerias = planejamento?.tipo === "ferias";
  const isSemestre = planejamento?.tipo === "semestre";

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
    forcarReorganizar,
    exportarDados,
    importarDados,
    mostrarNotificacao,
  };
}
