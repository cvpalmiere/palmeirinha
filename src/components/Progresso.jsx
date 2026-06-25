import React, { useState, useMemo } from 'react';
import Icon from './Icon.jsx';

function getDisciplina(disciplinas, nome) {
  if (!disciplinas) return null;
  return disciplinas.find(d => d.nome === nome) || null;
}

function StatsGrid({ stats, isFerias }) {
  return (
    <div className="stats-grid">
      <div className="stat-card card"><span className={`stat-num ${isFerias ? 'ferias-stat' : ''}`}>{stats.diasEstudados || 0}</span><span className="stat-label"><Icon name="Calendar" size={14} style={{ marginRight: 4 }} /> Dias estudados</span></div>
      <div className="stat-card card"><span className={`stat-num ${isFerias ? 'ferias-stat' : ''}`}>{stats.prazosConcluidos || 0}</span><span className="stat-label"><Icon name="CheckCircle" size={14} style={{ marginRight: 4 }} /> Prazos concluídos</span></div>
      <div className="stat-card card" style={{ borderTop: stats.prazosPendentes > 0 ? '3px solid #FF6B6B' : '3px solid #00D4AA' }}>
        <span className="stat-num" style={{ color: stats.prazosPendentes > 0 ? '#FF6B6B' : '#00D4AA' }}>{stats.prazosPendentes || 0}</span>
        <span className="stat-label"><Icon name="AlertTriangle" size={14} style={{ marginRight: 4 }} /> {stats.prazosPendentes > 0 ? 'Em atraso' : 'Tudo em dia! 🎉'}</span>
      </div>
      <div className="stat-card card"><span className={`stat-num ${isFerias ? 'ferias-stat' : ''}`}>{stats.totalDias > 0 ? Math.round((stats.diasEstudados / stats.totalDias) * 100) : 0}%</span><span className="stat-label"><Icon name="TrendingUp" size={14} style={{ marginRight: 4 }} /> Aproveitamento</span></div>
    </div>
  );
}

function FrequenciaDisciplinas({ disciplinas, aulas, aulasAssistidas }) {
  const freqData = useMemo(() => {
    return disciplinas.map(disc => {
      const aulasDaDisc = aulas.filter(a => a.disciplinaNome === disc.nome);
      const total = aulasDaDisc.length;
      const assistidas = aulasDaDisc.filter(a => aulasAssistidas[a.id]).length;
      const pct = total > 0 ? (assistidas / total) * 100 : 0;
      return { disc, total, assistidas, pct };
    }).filter(d => d.total > 0).sort((a, b) => b.pct - a.pct);
  }, [disciplinas, aulas, aulasAssistidas]);

  if (freqData.length === 0) return <p style={{ textAlign: 'center', padding: 20, color: '#7FA8C4' }}>Nenhuma disciplina com aulas cadastradas.</p>;

  return freqData.map(({ disc, total, assistidas, pct }) => {
    const baixa = pct < 75;
    return (
      <div key={disc.id} className="freq-row">
        <div className="freq-nome"><span className="freq-dot" style={{ background: disc.cor || '#00B4FF' }} /> <span>{disc.nome}</span></div>
        <div className="freq-barra-cont"><div className="freq-barra" style={{ width: `${pct}%`, background: baixa ? '#FF6B6B' : (disc.cor || '#00B4FF') }} /></div>
        <span className="freq-num" style={{ color: baixa ? '#FF6B6B' : '#A8C8E0' }}>{assistidas}/{total} ({Math.round(pct)}%)</span>
      </div>
    );
  });
}

function Mencoes({ disciplinas }) {
  const MENCAO_OPTIONS = ['SS', 'MS', 'MM', 'MI', 'II', 'SR'];
  const [mencoes, setMencoes] = useState({});
  const isAprovado = (mencao) => ['SS', 'MS', 'MM'].includes(mencao);

  return (
    <div className="mencoes-grid">
      {disciplinas.filter(d => !d.ferias).map(disc => {
        const mencao = mencoes[disc.id] || '';
        const aprovado = isAprovado(mencao);
        return (
          <div key={disc.id} className="mencao-item">
            <span className="mencao-disc" style={{ color: disc.cor || '#00B4FF' }}>{disc.nome}</span>
            <select className="filtro-select mencao-select" value={mencao} onChange={e => setMencoes(prev => ({ ...prev, [disc.id]: e.target.value }))}>
              <option value="">— Sem nota —</option>
              {MENCAO_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {mencao && <span className={`mencao-status ${aprovado ? 'aprovado' : 'atencao'}`}><Icon name={aprovado ? 'CheckCircle' : 'AlertTriangle'} size={14} color={aprovado ? '#00D4AA' : '#FFB347'} /> {aprovado ? 'Aprovado' : 'Atenção'}</span>}
          </div>
        );
      })}
    </div>
  );
}

export default function Progresso({ planejamento }) {
  const { disciplinas = [], aulas = [], eventos = [], progresso = {}, isFerias = false, stats = {} } = planejamento || {};
  const { aulasAssistidas = {}, estudosConcluidos = {} } = progresso || {};

  const diasEstudados = Object.values(estudosConcluidos).filter(Boolean).length;
  const prazosConcluidos = eventos.filter(e => e.concluido).length;
  const prazosPendentes = eventos.filter(e => !e.concluido).length;
  const totalDias = stats?.totalDias || 0;
  const aulasAssistidasCount = Object.values(aulasAssistidas).filter(Boolean).length;
  const totalAulas = aulas.length;

  const statsConsolidados = { diasEstudados, prazosConcluidos, prazosPendentes, totalDias: totalDias || 1, aulasAssistidas: aulasAssistidasCount, totalAulas };

  return (
    <div className="aba-container">
      <div className="aba-header">
        <h1 className="aba-titulo"><Icon name="BarChart3" size={28} color="#00B4FF" style={{ marginRight: 10 }} /> Progresso</h1>
        <p className="aba-sub">{isFerias ? '🏖️ Acompanhe sua evolução nas férias' : 'Acompanhe sua evolução no semestre'}</p>
      </div>

      <StatsGrid stats={statsConsolidados} isFerias={isFerias} />

      <div className="card" style={{ marginTop: 24 }}>
        <h3 className="card-titulo" style={{ marginBottom: 16, fontSize: 16 }}><Icon name="BarChart2" size={18} color="#00B4FF" style={{ marginRight: 8 }} /> Frequência por disciplina</h3>
        <FrequenciaDisciplinas disciplinas={disciplinas} aulas={aulas} aulasAssistidas={aulasAssistidas} />
      </div>

      {!isFerias && disciplinas.filter(d => !d.ferias).length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 className="card-titulo" style={{ marginBottom: 16, fontSize: 16 }}><Icon name="Award" size={18} color="#00B4FF" style={{ marginRight: 8 }} /> Menções por disciplina</h3>
          <p className="card-desc" style={{ marginBottom: 16, color: '#7FA8C4', fontSize: 13 }}>Insira suas notas para acompanhar a situação de aprovação.</p>
          <Mencoes disciplinas={disciplinas} />
        </div>
      )}

      {isFerias && (
        <div className="card" style={{ marginTop: 24, borderColor: 'rgba(162, 155, 254, 0.2)' }}>
          <h3 className="card-titulo" style={{ marginBottom: 16, fontSize: 16 }}><Icon name="Palmtree" size={18} color="#A29BFE" style={{ marginRight: 8 }} /> Resumo das Férias</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            <div style={{ background: 'rgba(162, 155, 254, 0.06)', padding: 12, borderRadius: 10 }}><span style={{ color: '#7FA8C4', fontSize: 12 }}>Etapas concluídas</span><p style={{ fontSize: 24, fontWeight: 700, color: '#A29BFE' }}>{Object.values(aulasAssistidas).filter(Boolean).length}</p></div>
            <div style={{ background: 'rgba(162, 155, 254, 0.06)', padding: 12, borderRadius: 10 }}><span style={{ color: '#7FA8C4', fontSize: 12 }}>Total de etapas</span><p style={{ fontSize: 24, fontWeight: 700, color: '#A29BFE' }}>{aulas.length}</p></div>
            <div style={{ background: 'rgba(162, 155, 254, 0.06)', padding: 12, borderRadius: 10 }}><span style={{ color: '#7FA8C4', fontSize: 12 }}>Dias de estudo</span><p style={{ fontSize: 24, fontWeight: 700, color: '#A29BFE' }}>{diasEstudados}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}