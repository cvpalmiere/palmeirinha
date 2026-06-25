import React, { useState, useMemo } from 'react';
import Icon from './Icon.jsx';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_SEMANA = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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

export default function Calendario({ planejamento }) {
  const { eventos = [], aulas = [], disciplinas = [], progresso = {} } = planejamento || {};
  const { edicoesManha = {} } = progresso;

  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  const eventosNaoConcluidos = eventos.filter(e => e.concluido === false);
  const aulasNaoConcluidas = aulas.filter(a => a.concluido === false);

  const diasDoMes = useMemo(() => {
    const resultado = [];
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    let dowInicio = primeiroDia.getDay();
    if (dowInicio === 0) dowInicio = 7;
    dowInicio -= 1;

    for (let i = 0; i < dowInicio; i++) resultado.push(null);

    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const date = new Date(ano, mes, d);
      const iso = formatDateISO(date);
      const evsDia = eventosNaoConcluidos.filter(e => e.data === iso);
      const aulasDia = aulasNaoConcluidas.filter(a => a.data === iso);
      resultado.push({ dia: d, iso, dow: date.getDay(), evsDia, aulasDia });
    }

    return resultado;
  }, [ano, mes, eventosNaoConcluidos, aulasNaoConcluidas]);

  function navMes(delta) {
    let m = mes + delta;
    let a = ano;
    if (m < 0) { m = 11; a--; }
    if (m > 11) { m = 0; a++; }
    setMes(m);
    setAno(a);
  }

  const diaInfo = useMemo(() => {
    if (!diaSelecionado) return null;
    const evs = eventosNaoConcluidos.filter(e => e.data === diaSelecionado);
    const aus = aulasNaoConcluidas.filter(a => a.data === diaSelecionado);
    let manha = { tipo: 'livre', conteudo: 'Estudo livre' };
    if (evs.length > 0) {
      const ev = evs[0];
      const disc = getDisciplina(disciplinas, ev.disciplinaNome);
      manha = { tipo: ev.tipo === 'prova' ? 'prova' : 'trabalho', conteudo: `${ev.tipo === 'prova' ? 'Revisão' : 'Preparação'} para ${ev.titulo}${disc ? ` – ${disc.nome}` : ''}` };
    } else if (aus.length > 0) {
      const a = aus[0];
      const disc = getDisciplina(disciplinas, a.disciplinaNome);
      manha = { tipo: 'pre_aula', conteudo: `Pré-aula ${disc?.nome || a.disciplinaNome}: ${a.conteudo}` };
    }
    return { evs, aulas: aus, manha };
  }, [diaSelecionado, eventosNaoConcluidos, aulasNaoConcluidas, disciplinas]);

  const hojIso = formatDateISO(hoje);

  return (
    <div className="aba-container">
      <div className="aba-header">
        <h1 className="aba-titulo"><Icon name="Calendar" size={28} color="#00B4FF" style={{ marginRight: 10 }} /> Calendário</h1>
        <p className="aba-sub">Visualize seus compromissos e prazos pendentes</p>
      </div>

      <div className="cal-layout">
        <div className="cal-principal">
          <div className="cal-nav">
            <button className="btn-outline" onClick={() => navMes(-1)}><Icon name="ChevronLeft" size={18} /></button>
            <h2 className="cal-mes-titulo">{MESES[mes]} {ano}</h2>
            <button className="btn-outline" onClick={() => navMes(1)}><Icon name="ChevronRight" size={18} /></button>
          </div>

          <div className="cal-grid">
            {DIAS_SEMANA.map(d => <div key={d} className="cal-header-dia">{d}</div>)}
            {diasDoMes.map((item, i) => {
              if (!item) return <div key={`vazio-${i}`} />;
              const isHoje = item.iso === hojIso;
              const isSelecionado = item.iso === diaSelecionado;
              const isWeekend = item.dow === 0 || item.dow === 6;
              return (
                <div key={item.iso} className={`cal-dia ${isHoje ? 'cal-hoje' : ''} ${isSelecionado ? 'cal-selecionado' : ''} ${isWeekend ? 'cal-weekend' : ''}`} onClick={() => setDiaSelecionado(isSelecionado ? null : item.iso)}>
                  <span className="cal-num">{item.dia}</span>
                  <div className="cal-pontos">
                    {item.evsDia.slice(0, 3).map(ev => {
                      const disc = getDisciplina(disciplinas, ev.disciplinaNome);
                      return <span key={ev.id} className="cal-ponto" style={{ background: disc?.cor || '#FF6B6B' }} title={ev.titulo} />;
                    })}
                    {item.aulasDia.slice(0, 2).map(a => {
                      const disc = getDisciplina(disciplinas, a.disciplinaNome);
                      return <span key={a.id} className="cal-ponto cal-ponto-aula" style={{ background: (disc?.cor || '#00B4FF') + '88' }} title={`Aula: ${a.tema}`} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cal-legenda">
            <span className="legenda-item"><span className="cal-ponto" style={{ background: '#FF6B6B' }} /> Evento avaliativo pendente</span>
            <span className="legenda-item"><span className="cal-ponto" style={{ background: '#00B4FF88' }} /> Aula pendente</span>
            <span className="legenda-item" style={{ color: '#00D4AA' }}><Icon name="CheckCircle" size={14} color="#00D4AA" /> Concluídos não aparecem</span>
          </div>
        </div>

        {diaSelecionado && diaInfo && (
          <div className="card cal-detalhe">
            <h3 className="cal-detalhe-titulo"><Icon name="Calendar" size={18} color="#00B4FF" style={{ marginRight: 8 }} /> {new Date(diaSelecionado + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>

            {diaInfo.aulas.length > 0 && (
              <div className="cal-secao">
                <p className="cal-secao-label"><Icon name="BookOpen" size={14} /> Aulas pendentes</p>
                {diaInfo.aulas.map(a => {
                  const disc = getDisciplina(disciplinas, a.disciplinaNome);
                  return <div key={a.id} className="cal-item-aula" style={{ borderLeft: `3px solid ${disc?.cor || '#00B4FF'}` }}>
                    <strong>{disc?.nome || a.disciplinaNome}</strong> – {a.tema}
                    <p style={{ fontSize: 13, color: '#7FA8C4', margin: '4px 0 0' }}>{a.conteudo}</p>
                  </div>;
                })}
              </div>
            )}

            {diaInfo.evs.length > 0 && (
              <div className="cal-secao">
                <p className="cal-secao-label"><Icon name="AlertTriangle" size={14} color="#FFB347" /> Eventos avaliativos pendentes</p>
                {diaInfo.evs.map(ev => {
                  const disc = getDisciplina(disciplinas, ev.disciplinaNome);
                  return <div key={ev.id} className="cal-item-ev"><span className="cal-ponto" style={{ background: disc?.cor || '#FF6B6B' }} /> <span>{ev.titulo}</span></div>;
                })}
              </div>
            )}

            {diaInfo.aulas.length === 0 && diaInfo.evs.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: '#7FA8C4' }}><Icon name="CheckCircle" size={32} color="#00D4AA" /> <p style={{ marginTop: 8 }}>Tudo concluído neste dia! 🎉</p></div>
            )}

            <div className="cal-secao">
              <p className="cal-secao-label"><Icon name="Sun" size={14} /> Estudo da manhã</p>
              <div className="cal-item-manha" style={{ borderLeft: `3px solid ${corBloco(diaInfo.manha.tipo)}` }}>
                <strong style={{ color: corBloco(diaInfo.manha.tipo) }}>{tipoLabel(diaInfo.manha.tipo)}</strong>
                <p style={{ margin: '4px 0 0', color: '#7FA8C4', fontSize: 13 }}>{diaInfo.manha.conteudo}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}