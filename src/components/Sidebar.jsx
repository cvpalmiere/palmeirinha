import React from 'react';
import Icon from './Icon.jsx';

const ABAS = [
  { id: 'hoje', label: 'Hoje', icone: 'LayoutDashboard' },
  { id: 'prazos', label: 'Prazos', icone: 'ClipboardList' },
  { id: 'calendario', label: 'Calendário', icone: 'Calendar' },
  { id: 'planos-aula', label: 'Planos de Aula', icone: 'BookOpen' },
  { id: 'planos-estudo', label: 'Planos de Estudo', icone: 'GraduationCap' },
  { id: 'progresso', label: 'Progresso', icone: 'BarChart3' },
  { id: 'historico', label: 'Histórico', icone: 'History' },
  { id: 'config', label: 'Configurações', icone: 'Settings' },
];

export default function Sidebar({ abaAtiva, onChange, temPlanejamento, isFerias, planejamentoNome }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Icon name="Palmtree" size={28} color="#00B4FF" />
        <span className="logo-text">Palmei<span>rinha</span></span>
      </div>

      <nav className="sidebar-nav">
        {ABAS.map(aba => {
          const isActive = abaAtiva === aba.id;
          const isDisabled = !temPlanejamento && aba.id !== 'config' && aba.id !== 'historico';

          return (
            <button
              key={aba.id}
              className={`sidebar-item ${isActive ? 'ativo' : ''}`}
              onClick={() => !isDisabled && onChange(aba.id)}
              disabled={isDisabled}
            >
              <Icon name={aba.icone} size={18} color={isActive ? '#00B4FF' : '#7FA8C4'} />
              <span className="sidebar-label">{aba.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {temPlanejamento && planejamentoNome ? (
          <>
            <span className="modo-label">{isFerias ? '🏖️ Modo Férias' : '📚 Modo Semestre'}</span>
            <span className="modo-nome">{planejamentoNome}</span>
          </>
        ) : (
          <>
            <span className="modo-label">📭 Sem planejamento</span>
            <span className="modo-nome" style={{ color: '#2A4A5A' }}>Crie um para começar</span>
          </>
        )}
      </div>
    </aside>
  );
}