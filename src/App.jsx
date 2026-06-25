import React, { useState, useEffect } from 'react';
import { usePlanejamento } from './usePlanejamento.jsx';

import Sidebar from './components/Sidebar.jsx';
import Hoje from './components/Hoje.jsx';
import Prazos from './components/Prazos.jsx';
import Calendario from './components/Calendario.jsx';
import PlanosAula from './components/PlanosAula.jsx';
import PlanosEstudo from './components/PlanosEstudo.jsx';
import Progresso from './components/Progresso.jsx';
import Historico from './components/Historico.jsx';
import Configuracoes from './components/Configuracoes.jsx';
import CriarPlanejamento from './components/CriarPlanejamento.jsx';
import Icon from './components/Icon.jsx';

export default function App() {
  const [aba, setAba] = useState('hoje');
  const [mostrarCriar, setMostrarCriar] = useState(false);

  const {
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
    exportarDados,
    importarDados,
    mostrarNotificacao,
    reorganizar,
  } = usePlanejamento();

  useEffect(() => {
    if (!temPlanejamento && !mostrarCriar) {
      setMostrarCriar(true);
    }
  }, [temPlanejamento]);

  const handleCriarPlanejamento = (texto) => {
    try {
      const novo = criarDoPrompt(texto);
      setMostrarCriar(false);
      setAba('hoje');
      mostrarNotificacao('✅ Planejamento criado com sucesso!');
      return novo;
    } catch (error) {
      mostrarNotificacao(`❌ ${error.message}`);
      throw error;
    }
  };

  const handleArquivar = () => {
    if (window.confirm('📦 Arquivar planejamento atual? Ele será salvo no histórico.')) {
      arquivarAtual();
      setAba('historico');
    }
  };

  const handleResetar = () => {
    if (window.confirm('⚠️ Tem certeza? Todos os dados atuais serão perdidos.')) {
      resetarAtual();
      setMostrarCriar(true);
    }
  };

  const props = {
    planejamento,
    historico,
    isFerias,
    isSemestre,
    loading,
    notificacao,
    concluirEvento,
    reabrirEvento,
    marcarAulaAssistida,
    marcarEstudoConcluido,
    editarManha,
    removerDoHistorico,
    exportarDados,
    importarDados,
    mostrarNotificacao,
    navegarPara: setAba,
    abrirCriar: () => setMostrarCriar(true),
    arquivarAtual: handleArquivar,
    resetarAtual: handleResetar,
    criarDoPrompt,
    reorganizar,
  };

  function renderizarConteudo() {
    if (!temPlanejamento) {
      return (
        <div className="aba-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ marginBottom: 24 }}>
            <Icon name="Palmtree" size={64} color="#00B4FF" />
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, marginBottom: 12 }}>
            Bem-vinda à <span style={{ color: '#00B4FF' }}>Palmeirinha</span>! 🌴
          </h2>
          <p style={{ color: '#7FA8C4', fontSize: 16, marginBottom: 24 }}>
            Comece criando seu primeiro planejamento de estudos.
          </p>
          <button className="btn-primario" onClick={() => setMostrarCriar(true)}>
            <Icon name="Plus" size={18} />
            Criar Planejamento
          </button>
        </div>
      );
    }

    switch (aba) {
      case 'hoje': return <Hoje {...props} />;
      case 'prazos': return <Prazos {...props} />;
      case 'calendario': return <Calendario {...props} />;
      case 'planos-aula': return <PlanosAula {...props} />;
      case 'planos-estudo': return <PlanosEstudo {...props} />;
      case 'progresso': return <Progresso {...props} />;
      case 'historico': return <Historico {...props} />;
      case 'config': return <Configuracoes {...props} />;
      default: return <Hoje {...props} />;
    }
  }

  return (
    <div className="app">
      <Sidebar
        abaAtiva={aba}
        onChange={setAba}
        temPlanejamento={temPlanejamento}
        isFerias={isFerias}
        planejamentoNome={planejamento?.nome}
      />

      <main className="main-content">
        {notificacao && (
          <div className="notificacao" onClick={() => mostrarNotificacao(null)}>
            <span className="notif-icone">
              {notificacao.includes('✅') ? <Icon name="CheckCircle" size={18} color="#00D4AA" /> :
               notificacao.includes('❌') ? <Icon name="XCircle" size={18} color="#FF6B6B" /> :
               notificacao.includes('📦') ? <Icon name="Archive" size={18} color="#FFB347" /> :
               notificacao.includes('📤') ? <Icon name="Download" size={18} color="#00B4FF" /> :
               <Icon name="Info" size={18} color="#00B4FF" />}
            </span>
            {notificacao}
          </div>
        )}
        {renderizarConteudo()}
      </main>

      {mostrarCriar && (
        <CriarPlanejamento
          onConfirm={handleCriarPlanejamento}
          onCancel={() => {
            if (temPlanejamento) {
              setMostrarCriar(false);
            } else {
              mostrarNotificacao('⚠️ Você precisa criar um planejamento para continuar.');
            }
          }}
          temPlanejamento={temPlanejamento}
        />
      )}
    </div>
  );
}