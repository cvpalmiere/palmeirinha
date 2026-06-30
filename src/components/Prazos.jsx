import React, { useState, useMemo } from "react";
import Icon from "./Icon.jsx";

function hojeISO() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

function formatDateBR(str) {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return d + "/" + m + "/" + y;
}

function diasRestantes(dataStr) {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const dia = hoje.getDate();
  const hojeMeiaNoite = new Date(ano, mes, dia);
  hojeMeiaNoite.setHours(0, 0, 0, 0);
  const alvo = new Date(dataStr);
  alvo.setHours(0, 0, 0, 0);
  const diff = Math.ceil((alvo - hojeMeiaNoite) / (1000 * 60 * 60 * 24));
  return diff;
}

function getDisciplina(disciplinas, nome) {
  if (!disciplinas) return null;
  return disciplinas.find(d => d.nome === nome) || null;
}

function tipoEventoLabel(tipo) {
  const map = { prova: "Prova", trabalho: "Trabalho", seminario: "Seminário", ace: "ACE" };
  return map[tipo] || tipo;
}

export default function Prazos({ planejamento, concluirEvento, reabrirEvento, mostrarNotificacao }) {
  const { eventos = [], disciplinas = [] } = planejamento || {};

  const [filtroDisciplina, setFiltroDisciplina] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("pendente");
  const [confirmando, setConfirmando] = useState(null);

  const eventosFiltrados = useMemo(() => {
    return [...eventos]
      .filter(e => !filtroDisciplina || e.disciplinaNome === filtroDisciplina)
      .filter(e => !filtroTipo || e.tipo === filtroTipo)
      .filter(e => {
        if (filtroStatus === "pendente") return !e.concluido;
        if (filtroStatus === "concluido") return e.concluido;
        return true;
      })
      .sort((a, b) => a.data.localeCompare(b.data));
  }, [eventos, filtroDisciplina, filtroTipo, filtroStatus]);

  function handleConfirmar(ev) {
    setConfirmando(ev);
  }

  function handleConfirmarConclusao() {
    if (confirmando) {
      concluirEvento(confirmando.id);
      setConfirmando(null);
      mostrarNotificacao("\"" + confirmando.titulo + "\" concluído!");
    }
  }

  function handleReabrir(id) {
    reabrirEvento(id);
    mostrarNotificacao("Evento reaberto!");
  }

  const tipos = ["prova", "trabalho", "seminario"];
  const status = ["pendente", "concluido"];

  return (
    <div className="aba-container">
      <div className="aba-header">
        <h1 className="aba-titulo"><Icon name="ClipboardList" size={28} color="#00B4FF" style={{ marginRight: 10 }} /> Prazos</h1>
        <p className="aba-sub">Todos os eventos avaliativos do planejamento</p>
      </div>

      <div className="filtros">
        <select className="filtro-select" value={filtroDisciplina} onChange={e => setFiltroDisciplina(e.target.value)}>
          <option value="">Todas as disciplinas</option>
          {disciplinas.map(d => <option key={d.id} value={d.nome}>{d.nome}</option>)}
        </select>
        <select className="filtro-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          {tipos.map(t => <option key={t} value={t}>{tipoEventoLabel(t)}</option>)}
        </select>
        <select className="filtro-select" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="pendente">Pendentes</option>
          <option value="concluido">Concluídos</option>
        </select>
      </div>

      <div className="tabela-container">
        <table className="tabela-prazos">
          <thead>
            <tr><th>Disciplina</th><th>Evento</th><th>Tipo</th><th>Data</th><th>Dias restantes</th><th>Status</th><th>Ação</th></tr>
          </thead>
          <tbody>
            {eventosFiltrados.length === 0 && (
              <tr><td colSpan={7} className="tabela-vazio">Nenhum evento encontrado.</td></tr>
            )}
            {eventosFiltrados.map(ev => {
              const disc = getDisciplina(disciplinas, ev.disciplinaNome);
              const restam = diasRestantes(ev.data);
              const urgente = !ev.concluido && restam <= 3 && restam >= 0;
              const atrasado = !ev.concluido && restam < 0;
              const hoje = restam === 0;
              return (
                <tr key={ev.id} className={ev.concluido ? "concluido-row" : urgente ? "urgente-row" : ""}>
                  <td>
                    <span className="disc-badge" style={{ background: (disc?.cor || "#00B4FF") + "22", color: disc?.cor || "#00B4FF", border: "1px solid " + (disc?.cor || "#00B4FF") }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: disc?.cor || "#00B4FF", marginRight: 6 }} />
                      {disc?.nome || ev.disciplinaNome}
                    </span>
                  </td>
                  <td className="ev-titulo">{ev.titulo}</td>
                  <td><span className={"tipo-tag tipo-" + ev.tipo}>{tipoEventoLabel(ev.tipo)}</span></td>
                  <td>{formatDateBR(ev.data)}</td>
                  <td>
                    {ev.concluido ? (
                      <span className="tag-concluido"><Icon name="CheckCircle" size={14} /> Concluído</span>
                    ) : atrasado ? (
                      <span className="tag-atrasado"><Icon name="AlertCircle" size={14} /> Atrasado</span>
                    ) : hoje ? (
                      <span className="tag-urgente"><Icon name="AlertTriangle" size={14} /> Hoje!</span>
                    ) : (
                      <span style={{ color: urgente ? "#FFB347" : "#7FA8C4" }}>{restam} dia{restam !== 1 ? "s" : ""}</span>
                    )}
                  </td>
                  <td>
                    <span className={"status-dot " + (ev.concluido ? "done" : "pending")}>
                      <Icon name={ev.concluido ? "CheckCircle" : "Circle"} size={14} color={ev.concluido ? "#00D4AA" : "#7FA8C4"} />
                      {ev.concluido ? "Concluído" : "Pendente"}
                    </span>
                  </td>
                  <td>
                    {ev.concluido ? (
                      <button className="btn-outline btn-sm" onClick={() => handleReabrir(ev.id)}><Icon name="RotateCcw" size={14} /> Reabrir</button>
                    ) : (
                      <button className="btn-primario btn-sm" onClick={() => handleConfirmar(ev)}><Icon name="Check" size={14} /> Concluir</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirmando && (
        <div className="modal-overlay" onClick={() => setConfirmando(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Confirmar conclusão</h3>
            <p>Marcar <strong>"{confirmando.titulo}"</strong> como concluído?</p>
            {diasRestantes(confirmando.data) > 0 && (
              <div className="modal-aviso"><Icon name="AlertTriangle" size={18} color="#FFB347" /> Como ainda faltam {diasRestantes(confirmando.data)} dias, o plano será reorganizado automaticamente.</div>
            )}
            <div className="modal-acoes">
              <button className="btn-secundario" onClick={() => setConfirmando(null)}>Cancelar</button>
              <button className="btn-primario" onClick={handleConfirmarConclusao}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
