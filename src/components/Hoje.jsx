import React, { useMemo } from "react";
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

function getDisciplina(disciplinas, nome) {
  if (!disciplinas) return null;
  return disciplinas.find(d => d.nome === nome) || null;
}

function diasRestantes(dataStr) {
  const hoje = new Date();
  const hojeStr = hojeISO();
  const hojeDate = new Date(hojeStr);
  const alvo = new Date(dataStr);
  return Math.ceil((alvo - hojeDate) / (1000 * 60 * 60 * 24));
}

export default function Hoje({ planejamento, isFerias, mostrarNotificacao, marcarEstudoConcluido, reorganizar, forcarReorganizar }) {
  const hoje = hojeISO();
  const { config, disciplinas, aulas, eventos, progresso } = planejamento || {};
  const { estudosConcluidos } = progresso || {};

  const aulasNaoConcluidas = aulas?.filter(a => a.concluido === false) || [];
  const eventosNaoConcluidos = eventos?.filter(e => e.concluido === false) || [];

  const aula = aulasNaoConcluidas.find(a => a.data === hoje) || null;

  const manha = useMemo(() => {
    if (isFerias) {
      const atvs = planejamento?.atividades || [];
      return {
        tipo: "ferias",
        conteudo: atvs[0]?.nome || "Atividade de férias",
      };
    }

    const evsHoje = eventosNaoConcluidos.filter(e => e.data === hoje);
    if (evsHoje.length > 0) {
      const ev = evsHoje[0];
      const disc = getDisciplina(disciplinas, ev.disciplinaNome);
      return {
        tipo: ev.tipo === "prova" ? "prova" : "trabalho",
        conteudo: (ev.tipo === "prova" ? "Revisão" : "Preparação") + " para " + ev.titulo + (disc ? " – " + disc.nome : ""),
      };
    }

    if (aula) {
      const disc = getDisciplina(disciplinas, aula.disciplinaNome);
      return {
        tipo: "pre_aula",
        conteudo: "Pré-aula " + (disc?.nome || aula.disciplinaNome) + ": " + aula.conteudo,
      };
    }

    return {
      tipo: "livre",
      conteudo: config?.estudoLivre || "Estudo livre",
    };
  }, [hoje, eventosNaoConcluidos, disciplinas, config, isFerias, planejamento, aula]);

  const estudouHoje = estudosConcluidos?.[hoje] || false;

  function handleMarcarEstudo() {
    marcarEstudoConcluido(hoje, !estudouHoje);
  }

  function handleIniciarEstudo() {
    mostrarNotificacao("Modo foco ativado! Bons estudos!");
  }

  function handleReorganizar() {
    if (forcarReorganizar) {
      const resultado = forcarReorganizar(hoje);
      if (resultado !== planejamento) {
        mostrarNotificacao("Plano reorganizado!");
      } else {
        mostrarNotificacao("Plano já está organizado.");
      }
    } else if (reorganizar) {
      const resultado = reorganizar(hoje);
      if (resultado !== planejamento) {
        mostrarNotificacao("Plano reorganizado!");
      } else {
        mostrarNotificacao("Plano já está organizado.");
      }
    }
  }

  const totalPendentesHoje = aulasNaoConcluidas.filter(a => a.data === hoje).length +
                             eventosNaoConcluidos.filter(e => e.data === hoje).length;

  return (
    <div className="aba-container">
      <div className="hoje-header">
        <h1 className="saudacao">
          Boa tarde, <span className="destaque-nome">{config?.nomeUsuario || "Carla"}!</span>
        </h1>
        <p className="data-hoje">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
          <button className="btn-outline btn-sm" onClick={handleReorganizar}>
            <Icon name="RefreshCw" size={14} /> Reorganizar plano
          </button>
          {totalPendentesHoje > 0 ? (
            <span style={{ fontSize: 12, color: "#7FA8C4", alignSelf: "center" }}>
              {totalPendentesHoje} item{totalPendentesHoje > 1 ? "s" : ""} pendente{totalPendentesHoje > 1 ? "s" : ""} hoje
            </span>
          ) : (
            <span style={{ fontSize: 12, color: "#00D4AA", alignSelf: "center" }}>Tudo concluído hoje!</span>
          )}
        </div>
      </div>

      {isFerias && (
        <div className="ferias-progresso" style={{ marginBottom: 20 }}>
          <Icon name="Palmtree" size={24} color="#A29BFE" />
          <span className="fp-label">Modo Férias</span>
          <span className="fp-num">{planejamento?.nome || "Férias"}</span>
          <div className="ferias-barra">
            <div className="fb-preenchida" style={{ width: (planejamento?.stats?.porcentagemConcluido || 0) + "%" }} />
          </div>
          <span className="fp-label" style={{ fontSize: 12 }}>{planejamento?.stats?.porcentagemConcluido || 0}% concluído</span>
        </div>
      )}

      <div className="hoje-grid">
        <div className="hoje-principal">
          {aula ? (
            <div className="card card-aula" style={{ borderLeft: "4px solid " + (getDisciplina(disciplinas, aula.disciplinaNome)?.cor || "#00B4FF") }}>
              <div className="card-header">
                <span className="card-tag" style={{ background: getDisciplina(disciplinas, aula.disciplinaNome)?.cor || "#00B4FF" }}>
                  <Icon name="Clock" size={14} /> Aula pendente
                </span>
              </div>
              <h2 className="card-titulo">{getDisciplina(disciplinas, aula.disciplinaNome)?.nome || aula.disciplinaNome}</h2>
              <p className="card-conteudo">{aula.tema}</p>
              <p className="card-desc">{aula.conteudo}</p>
            </div>
          ) : (
            <div className="card card-aula" style={{ borderLeft: "4px solid #00D4AA" }}>
              <div className="card-header">
                <span className="card-tag card-tag-success"><Icon name="CheckCircle" size={14} /> Nenhuma aula pendente hoje</span>
              </div>
              <h2 className="card-titulo">Dia livre!</h2>
              <p className="card-desc">Aproveite para revisar ou descansar.</p>
            </div>
          )}

          <div className="card card-manha" style={{ borderLeft: "4px solid " + (manha.tipo === "livre" ? "#00D4AA" : "#FFB347") }}>
            <div className="card-header">
              <span className="card-tag" style={{ background: isFerias ? "#A29BFE" : "#00B4FF" }}>
                <Icon name="Sun" size={14} /> {isFerias ? "Sua manhã" : "Sua manhã"}
              </span>
            </div>
            <p className="card-conteudo">{manha.conteudo}</p>
            <div className="card-acoes">
              <button className="btn-primario" onClick={handleIniciarEstudo}><Icon name="Play" size={16} /> Iniciar estudo</button>
              <button className={"btn-secundario " + (estudouHoje ? "concluido" : "")} onClick={handleMarcarEstudo}>
                {estudouHoje ? <><Icon name="CheckCircle" size={16} /> Estudei hoje</> : <><Icon name="Circle" size={16} /> Marcar como estudado</>}
              </button>
            </div>
          </div>

          <div className="card card-livre">
            <div className="card-header">
              <span className="card-tag card-tag-success"><Icon name="Book" size={14} /> 30min livres</span>
            </div>
            <p className="card-conteudo">{config?.estudoLivre || "Estudo livre"}</p>
            <p className="card-sub">{config?.moduloAtual || "Módulo 1"}</p>
            <button className="btn-outline" onClick={handleIniciarEstudo}><Icon name="Play" size={16} /> Iniciar (30 min)</button>
          </div>
        </div>

        <aside className="hoje-lateral">
          <div className="card card-prazos">
            <h3 className="lateral-titulo"><Icon name="Clock" size={16} /> Próximos prazos</h3>
            {eventosNaoConcluidos.length === 0 ? (
              <p className="vazio">Nenhum prazo pendente!</p>
            ) : (
              <ul className="lista-prazos">
                {eventosNaoConcluidos.filter(e => e.data >= hoje).sort((a, b) => a.data.localeCompare(b.data)).slice(0, 3).map(ev => {
                  const disc = getDisciplina(disciplinas, ev.disciplinaNome);
                  const restam = diasRestantes(ev.data);
                  const urgente = restam <= 3 && restam >= 0;
                  return (
                    <li key={ev.id} className={"prazo-item " + (urgente ? "urgente" : "")}>
                      <div className="prazo-dot" style={{ background: disc?.cor || "#FF6B6B" }} />
                      <div className="prazo-info">
                        <span className="prazo-titulo">{ev.titulo}</span>
                        <span className="prazo-sub">{disc?.nome || ev.disciplinaNome}</span>
                        <span className="prazo-data">{formatDateBR(ev.data)}</span>
                      </div>
                      <div className={"prazo-dias " + (urgente ? "urgente" : "")}>
                        {restam === 0 ? "Hoje" : restam < 0 ? "Atrasado" : restam + "d"}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
