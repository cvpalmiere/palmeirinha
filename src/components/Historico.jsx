import React from 'react';
import Icon from './Icon.jsx';

function formatDateBR(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString('pt-BR');
}

function HistoricoCard({ item, onRemover }) {
  const isFerias = item.tipo === 'ferias';
  const stats = item.stats || {};

  return (
    <div className="historico-card card">
      <div className="hc-header">
        <span className={`hc-tipo ${isFerias ? 'ferias' : ''}`}>
          <Icon name={isFerias ? 'Palmtree' : 'GraduationCap'} size={14} color={isFerias ? '#A29BFE' : '#00B4FF'} style={{ marginRight: 4 }} />
          {isFerias ? 'Férias' : 'Semestre'}
        </span>
        {stats.porcentagemConcluido >= 80 && <span style={{ fontSize: 12, color: '#00D4AA' }}><Icon name="Star" size={14} fill="#00D4AA" color="#00D4AA" /> Ótimo!</span>}
      </div>
      <h3 className="hc-nome">{item.nome || 'Planejamento'}</h3>
      <p className="hc-periodo"><Icon name="Calendar" size={14} style={{ marginRight: 4 }} /> {item.periodo?.inicio && item.periodo?.fim ? `${formatDateBR(item.periodo.inicio)} — ${formatDateBR(item.periodo.fim)}` : 'Período não definido'}</p>
      <div className="hc-stats">
        <span className="hc-stat"><Icon name="CheckCircle" size={14} color="#00D4AA" /> <span className="hs-num">{stats.prazosConcluidos || 0}</span> prazos</span>
        <span className="hc-stat"><Icon name="BookOpen" size={14} color="#00B4FF" /> <span className="hs-num">{stats.aulasAssistidas || 0}</span> aulas</span>
        <span className="hc-stat"><Icon name="Calendar" size={14} color="#A29BFE" /> <span className="hs-num">{stats.diasEstudados || 0}</span> dias</span>
        <span className="hc-stat"><Icon name="TrendingUp" size={14} color="#FFB347" /> <span className="hs-num">{stats.porcentagemConcluido || 0}%</span></span>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button className="btn-danger btn-sm" onClick={() => onRemover(item.id)}><Icon name="Trash2" size={14} /> Remover</button>
      </div>
    </div>
  );
}

export default function Historico({ historico = [], removerDoHistorico, navegarPara, arquivarAtual, temPlanejamento, mostrarNotificacao }) {
  function handleRemover(id) {
    if (window.confirm('Tem certeza que deseja remover este item do histórico?')) {
      removerDoHistorico(id);
      mostrarNotificacao('🗑️ Item removido do histórico.');
    }
  }

  function handleArquivarAtual() {
    if (!temPlanejamento) {
      mostrarNotificacao('❌ Nenhum planejamento ativo para arquivar.');
      return;
    }
    if (window.confirm('📦 Arquivar o planejamento atual?')) {
      arquivarAtual();
      mostrarNotificacao('📦 Planejamento arquivado com sucesso!');
    }
  }

  return (
    <div className="aba-container">
      <div className="aba-header">
        <h1 className="aba-titulo"><Icon name="History" size={28} color="#00B4FF" style={{ marginRight: 10 }} /> Histórico</h1>
        <p className="aba-sub">Planejamentos anteriores arquivados</p>
      </div>

      {temPlanejamento && (
        <div style={{ marginBottom: 20 }}>
          <button className="btn-primario" onClick={handleArquivarAtual}><Icon name="Archive" size={18} /> Arquivar planejamento atual</button>
        </div>
      )}

      {historico.length === 0 ? (
        <div className="historico-vazio">
          <div className="hv-icone"><Icon name="Inbox" size={64} /></div>
          <p className="hv-texto">Nenhum planejamento arquivado</p>
          <p className="hv-sub">Quando você arquivar um planejamento, ele aparecerá aqui.</p>
        </div>
      ) : (
        <div className="historico-grid">
          {historico.map(item => <HistoricoCard key={item.id} item={item} onRemover={handleRemover} />)}
        </div>
      )}
    </div>
  );
}