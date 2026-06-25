import React, { useState, useMemo } from 'react';
import Icon from './Icon.jsx';

function formatDateBR(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function getDisciplina(disciplinas, nome) {
  if (!disciplinas) return null;
  return disciplinas.find(d => d.nome === nome) || null;
}

function AulaTabela({ aulas, disciplinas, aulasAssistidas, onMarcarAula }) {
  const discId = aulas[0]?.disciplinaNome;
  const disc = getDisciplina(disciplinas, discId);
  const total = aulas.length;
  const assistidas = aulas.filter(a => aulasAssistidas[a.id]).length;
  const pct = total > 0 ? Math.round((assistidas / total) * 100) : 0;

  return (
    <div>
      <div className="progresso-mini">
        <div className="progresso-barra-cont">
          <div className="progresso-barra" style={{ width: `${pct}%`, background: disc?.cor || '#00B4FF' }} />
        </div>
        <span className="progresso-label">{assistidas}/{total} aulas assistidas ({pct}%)</span>
      </div>

      <div className="tabela-container">
        <table className="tabela-aulas">
          <thead>
            <tr><th style={{ width: 40 }}>✓</th><th>Data</th><th>Tema</th><th>Conteúdo</th><th>Preparação</th><th>Avaliação</th></tr>
          </thead>
          <tbody>
            {aulas.map(aula => {
              const isAssistida = !!aulasAssistidas[aula.id];
              return (
                <tr key={aula.id} className={isAssistida ? 'aula-assistida' : ''}>
                  <td><input type="checkbox" checked={isAssistida} onChange={e => onMarcarAula(aula.id, e.target.checked)} className="checkbox-aula" /></td>
                  <td style={{ whiteSpace: 'nowrap', color: '#7FA8C4' }}>{formatDateBR(aula.data)}</td>
                  <td style={{ fontWeight: 500 }}>{aula.tema}</td>
                  <td style={{ color: '#A8C8E0', fontSize: 13 }}>{aula.conteudo}</td>
                  <td style={{ color: '#A8C8E0', fontSize: 13 }}>{aula.preparacao || '—'}</td>
                  <td>{aula.avaliacao ? <span className="tag-avaliacao"><Icon name="Award" size={12} /> {aula.avaliacao}</span> : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AcordeonItem({ disciplina, aulas, aulasAssistidas, onMarcarAula, isOpen, onToggle }) {
  const total = aulas.length;
  const assistidas = aulas.filter(a => aulasAssistidas[a.id]).length;
  const pct = total > 0 ? Math.round((assistidas / total) * 100) : 0;
  const isFerias = disciplina?.ferias || false;

  return (
    <div className="acordeon-item">
      <button className={`acordeon-header ${isOpen ? 'aberto' : ''}`} style={{ borderLeft: `4px solid ${disciplina?.cor || '#00B4FF'}` }} onClick={onToggle}>
        <div>
          <span className="acordeon-titulo">{isFerias && <Icon name="Palmtree" size={16} color="#A29BFE" style={{ marginRight: 8 }} />} {disciplina?.nome || 'Disciplina'}</span>
          <span className="acordeon-sub">{isFerias ? `🌴 ${aulas.length} etapas · ${pct}% concluído` : `Prof. ${disciplina?.professor || '—'} · ${pct}% concluído`}</span>
        </div>
        <span className="acordeon-seta">{isOpen ? <Icon name="ChevronUp" size={18} /> : <Icon name="ChevronDown" size={18} />}</span>
      </button>
      {isOpen && (
        <div className="acordeon-body">
          <AulaTabela aulas={aulas} disciplinas={[disciplina].filter(Boolean)} aulasAssistidas={aulasAssistidas} onMarcarAula={onMarcarAula} />
        </div>
      )}
    </div>
  );
}

export default function PlanosAula({ planejamento, marcarAulaAssistida }) {
  const { disciplinas = [], aulas = [], progresso = {} } = planejamento || {};
  const { aulasAssistidas = {} } = progresso;
  const [disciplinaAberta, setDisciplinaAberta] = useState(null);

  const aulasPorDisciplina = useMemo(() => {
    const grouped = {};
    disciplinas.forEach(disc => {
      const aulasDaDisc = aulas.filter(a => a.disciplinaNome === disc.nome).sort((a, b) => a.data.localeCompare(b.data));
      if (aulasDaDisc.length > 0) grouped[disc.nome] = { disciplina: disc, aulas: aulasDaDisc };
    });
    aulas.forEach(aula => {
      if (!grouped[aula.disciplinaNome]) {
        const disc = disciplinas.find(d => d.nome === aula.disciplinaNome);
        grouped[aula.disciplinaNome] = {
          disciplina: disc || { nome: aula.disciplinaNome, professor: '—', cor: '#00B4FF', ferias: aula.ferias || false },
          aulas: aulas.filter(a => a.disciplinaNome === aula.disciplinaNome).sort((a, b) => a.data.localeCompare(b.data)),
        };
      }
    });
    return grouped;
  }, [disciplinas, aulas]);

  const nomes = Object.keys(aulasPorDisciplina);
  React.useEffect(() => {
    if (nomes.length > 0 && !disciplinaAberta) setDisciplinaAberta(nomes[0]);
  }, [nomes, disciplinaAberta]);

  if (nomes.length === 0) {
    return (
      <div className="aba-container">
        <div className="aba-header">
          <h1 className="aba-titulo"><Icon name="BookOpen" size={28} color="#00B4FF" style={{ marginRight: 10 }} /> Planos de Aula</h1>
          <p className="aba-sub">Cronograma completo de cada disciplina</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 60 }}><Icon name="BookOpen" size={48} color="#2A4A5A" /> <p style={{ color: '#7FA8C4', marginTop: 16, fontSize: 16 }}>Nenhuma aula cadastrada neste planejamento.</p></div>
      </div>
    );
  }

  return (
    <div className="aba-container">
      <div className="aba-header">
        <h1 className="aba-titulo"><Icon name="BookOpen" size={28} color="#00B4FF" style={{ marginRight: 10 }} /> Planos de Aula</h1>
        <p className="aba-sub">Cronograma completo de cada disciplina</p>
      </div>
      <div className="acordeon">
        {Object.entries(aulasPorDisciplina).map(([nome, { disciplina, aulas: aulasDaDisc }]) => (
          <AcordeonItem key={nome} disciplina={disciplina} aulas={aulasDaDisc} aulasAssistidas={aulasAssistidas} onMarcarAula={marcarAulaAssistida} isOpen={disciplinaAberta === nome} onToggle={() => setDisciplinaAberta(disciplinaAberta === nome ? null : nome)} />
        ))}
      </div>
    </div>
  );
}