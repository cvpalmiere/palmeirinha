import React, { useState, useMemo } from 'react';
import Icon from './Icon.jsx';

function formatDateBR(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function hojeISO() {
  const agora = new Date();
  const offset = agora.getTimezoneOffset() * 60000;
  const local = new Date(agora.getTime() - offset);
  return formatDateISO(local);
}

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getDisciplina(disciplinas, nome) {
  if (!disciplinas) return null;
  return disciplinas.find(d => d.nome === nome) || null;
}

function tipoLabel(tipo) {
  const map = { pre_aula: 'Pré-aula', prova: 'Revisão para prova', trabalho: 'Preparação de trabalho', seminario: 'Preparação de seminário', ead: 'EAD', livre: 'Estudo livre', ferias: 'Férias' };
  return map[tipo] || tipo;
}

function corBloco(tipo) {
  const map = { pre_aula: '#00B4FF', prova: '#FF6B6B', trabalho: '#FFB347', seminario: '#A29BFE', ead: '#66D4FF', livre: '#00D4AA', ferias: '#A29BFE' };
  return map[tipo] || '#00B4FF';
}

function gerarBlocoManha(dateStr, eventos, disciplinas, edicoes = {}, isFerias = false, atividades = []) {
  if (isFerias && atividades.length > 0) {
    const atv = atividades[0];
    return { tipo: 'ferias', conteudo: `${atv.nome}: ${atv.etapas?.[0] || 'Etapa pendente'}` };
  }

  if (edicoes[dateStr]) return edicoes[dateStr];

  const hoje = parseDate(dateStr);
  if (!hoje) return { tipo: 'livre', conteudo: 'Estudo livre' };
  const diaSemana = hoje.getDay();

  const provas = eventos.filter(e => {
    if (e.concluido || e.tipo !== 'prova') return false;
    const diff = Math.ceil((parseDate(e.data) - hoje) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  });

  if (provas.length > 0) {
    const ev = provas[0];
    const disc = getDisciplina(disciplinas, ev.disciplinaNome);
    return { tipo: 'prova', conteudo: `Revisão para ${ev.titulo} – ${disc?.nome || ev.disciplinaNome}` };
  }

  const trabalhos = eventos.filter(e => {
    if (e.concluido || e.tipo === 'prova') return false;
    const diff = Math.ceil((parseDate(e.data) - hoje) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  });

  if (trabalhos.length > 0) {
    const ev = trabalhos[0];
    const disc = getDisciplina(disciplinas, ev.disciplinaNome);
    return { tipo: 'trabalho', conteudo: `Preparação para ${ev.titulo} – ${disc?.nome || ev.disciplinaNome}` };
  }

  const aula = eventos.find(a => a.data === dateStr && !a.concluido);
  if (aula) {
    const disc = getDisciplina(disciplinas, aula.disciplinaNome);
    return { tipo: 'pre_aula', conteudo: `Pré-aula ${disc?.nome || aula.disciplinaNome}: ${aula.conteudo}` };
  }

  return { tipo: 'livre', conteudo: 'Estudo livre ou revisão' };
}

export default function PlanosEstudo({ planejamento, editarManha }) {
  const { eventos = [], aulas = [], disciplinas = [], progresso = {}, isFerias = false, atividades = [], periodo } = planejamento || {};
  const { edicoesManha = {} } = progresso || {};

  const semanas = useMemo(() => {
    const semanasArray = [];
    const inicio = periodo?.inicio ? parseDate(periodo.inicio) : new Date();
    const fim = periodo?.fim ? parseDate(periodo.fim) : new Date();
    const cur = new Date(inicio);
    const dow = cur.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    cur.setDate(cur.getDate() + diff);
    while (cur <= fim) {
      semanasArray.push(formatDateISO(cur));
      cur.setDate(cur.getDate() + 7);
    }
    return semanasArray.length > 0 ? semanasArray : [formatDateISO(new Date())];
  }, [periodo]);

  const [semanaSelecionada, setSemanaSelecionada] = useState(() => {
    const hoje = hojeISO();
    for (const s of semanas) {
      const inicio = parseDate(s);
      if (!inicio) continue;
      const fim = new Date(inicio);
      fim.setDate(fim.getDate() + 4);
      const hojeDate = parseDate(hoje);
      if (hojeDate && hojeDate >= inicio && hojeDate <= fim) return s;
    }
    return semanas[0] || formatDateISO(new Date());
  });

  const diasSemana = useMemo(() => {
    const dias = [];
    const cur = new Date(parseDate(semanaSelecionada));
    if (!cur || isNaN(cur.getTime())) return dias;
    for (let i = 0; i < 5; i++) {
      const dateStr = formatDateISO(cur);
      const aula = aulas.find(a => a.data === dateStr && !a.concluido) || null;
      const disc = aula ? getDisciplina(disciplinas, aula.disciplinaNome) : null;
      const manha = gerarBlocoManha(dateStr, eventos, disciplinas, edicoesManha, isFerias, atividades);
      const eventosNoDia = eventos.filter(e => e.data === dateStr && !e.concluido);
      dias.push({ index: i, date: dateStr, aula, disciplina: disc, manha, eventosNoDia });
      cur.setDate(cur.getDate() + 1);
    }
    return dias;
  }, [semanaSelecionada, aulas, eventos, disciplinas, edicoesManha, isFerias, atividades]);

  const hoje = hojeISO();

  function semanaLabel(iso) {
    const d = parseDate(iso);
    if (!d) return iso;
    const fim = new Date(d);
    fim.setDate(fim.getDate() + 4);
    return `${d.getDate()}/${d.getMonth() + 1} – ${fim.getDate()}/${fim.getMonth() + 1}`;
  }

  if (diasSemana.length === 0) {
    return (
      <div className="aba-container">
        <div className="aba-header">
          <h1 className="aba-titulo"><Icon name="GraduationCap" size={28} color="#00B4FF" style={{ marginRight: 10 }} /> Planos de Estudo</h1>
          <p className="aba-sub">Visualize e acompanhe seu plano semanal</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 60 }}><Icon name="Calendar" size={48} color="#2A4A5A" /> <p style={{ color: '#7FA8C4', marginTop: 16, fontSize: 16 }}>Nenhum plano de estudo disponível.</p></div>
      </div>
    );
  }

  const DIAS_LABELS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

  return (
    <div className="aba-container">
      <div className="aba-header">
        <h1 className="aba-titulo"><Icon name="GraduationCap" size={28} color="#00B4FF" style={{ marginRight: 10 }} /> Planos de Estudo</h1>
        <p className="aba-sub">{isFerias ? 'Plano de estudos para suas férias' : 'Plano gerado automaticamente com base nos prazos'}</p>
      </div>

      <div className="plano-controles">
        <label className="filtro-label"><Icon name="Calendar" size={14} /> Semana:</label>
        <select className="filtro-select" value={semanaSelecionada} onChange={e => setSemanaSelecionada(e.target.value)}>
          {semanas.map(s => <option key={s} value={s}>{semanaLabel(s)}</option>)}
        </select>
      </div>

      <div className="plano-semana">
        {diasSemana.map(dia => {
          const isHoje = dia.date === hoje;
          return (
            <div key={dia.date} className={`plano-card card ${isHoje ? 'plano-hoje' : ''}`}>
              <div className="plano-card-header">
                <span className="plano-dia-label">{DIAS_LABELS[dia.index]}</span>
                <span className="plano-data">{formatDateBR(dia.date)}</span>
                {isHoje && <span className="hoje-badge"><Icon name="Circle" size={10} fill="#00B4FF" /> Hoje</span>}
              </div>

              <div className="plano-bloco" style={{ borderLeft: `3px solid ${corBloco(dia.manha.tipo)}` }}>
                <div className="plano-bloco-header">
                  <span className="plano-bloco-label"><Icon name="Sun" size={12} /> {isFerias ? 'Manhã' : 'Manhã (2h)'}</span>
                  <span className="plano-tipo" style={{ color: corBloco(dia.manha.tipo) }}>{tipoLabel(dia.manha.tipo)}</span>
                </div>
                <p className="plano-conteudo">{dia.manha.conteudo}</p>
              </div>

              {dia.aula ? (
                <div className="plano-bloco" style={{ borderLeft: `3px solid ${dia.disciplina?.cor || '#00B4FF'}` }}>
                  <span className="plano-bloco-label"><Icon name="BookOpen" size={12} /> {isFerias ? 'Tarde' : 'Tarde (14h)'}</span>
                  <p className="plano-conteudo"><strong>{dia.disciplina?.nome || dia.aula.disciplinaNome}</strong> – {dia.aula.tema}</p>
                </div>
              ) : (
                <div className="plano-bloco plano-bloco-ead">
                  <span className="plano-bloco-label"><Icon name="Laptop" size={12} /> EAD</span>
                  <p className="plano-conteudo">Estudo autônomo</p>
                </div>
              )}

              {dia.eventosNoDia && dia.eventosNoDia.length > 0 && (
                <div className="plano-eventos">
                  {dia.eventosNoDia.map(ev => (
                    <span key={ev.id} className={`plano-ev-tag ${ev.tipo}`}><Icon name="AlertTriangle" size={12} /> {ev.titulo}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}