import React, { useState } from 'react';
import Icon from './Icon.jsx';

export default function Configuracoes({
  planejamento,
  isFerias,
  exportarDados,
  importarDados,
  mostrarNotificacao,
  navegarPara,
  abrirCriar,
  arquivarAtual,
  resetarAtual,
}) {
  const { config = {} } = planejamento || {};
  const [form, setForm] = useState({ ...config });

  function salvarConfig() {
    mostrarNotificacao('✅ Configurações salvas!');
  }

  function handleImportarJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const dados = JSON.parse(event.target.result);
          importarDados(dados);
          mostrarNotificacao('📥 Dados importados com sucesso!');
          navegarPara('hoje');
        } catch (error) {
          mostrarNotificacao(`❌ Erro ao importar: ${error.message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleResetar() {
    if (window.confirm('⚠️ Tem certeza? Todos os dados do planejamento atual serão perdidos.')) {
      resetarAtual();
      mostrarNotificacao('🔄 Dados resetados com sucesso!');
    }
  }

  const upd = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="aba-container">
      <div className="aba-header">
        <h1 className="aba-titulo"><Icon name="Settings" size={28} color="#00B4FF" style={{ marginRight: 10 }} /> Configurações</h1>
        <p className="aba-sub">Personalize sua experiência na Palmeirinha</p>
      </div>

      <div className="config-grid">
        <div className="card config-secao">
          <h3 className="config-titulo"><Icon name="User" size={18} color="#00B4FF" /> Perfil</h3>
          <label className="config-label">Nome</label>
          <input className="config-input" value={form.nomeUsuario || ''} onChange={e => upd('nomeUsuario', e.target.value)} placeholder="Seu nome" />
        </div>

        <div className="card config-secao">
          <h3 className="config-titulo"><Icon name="Book" size={18} color="#00B4FF" /> Estudo Livre</h3>
          <label className="config-label">Tópico</label>
          <input className="config-input" value={form.estudoLivre || ''} onChange={e => upd('estudoLivre', e.target.value)} placeholder="Ex: CC50 – Harvard" />
          <label className="config-label" style={{ marginTop: 12 }}>Módulo atual</label>
          <input className="config-input" value={form.moduloAtual || ''} onChange={e => upd('moduloAtual', e.target.value)} placeholder="Ex: Módulo 1 – C" />
        </div>

        <div className="card config-secao">
          <h3 className="config-titulo"><Icon name="Palette" size={18} color="#00B4FF" /> Aparência</h3>
          <label className="config-label">Tamanho da fonte</label>
          <div className="config-radio-group">
            {[14, 16, 18, 20].map(size => (
              <label key={size} className={`config-radio ${form.fontSize === size ? 'ativo' : ''}`}>
                <input type="radio" name="fontSize" value={size} checked={form.fontSize === size} onChange={() => upd('fontSize', size)} /> {size}px
              </label>
            ))}
          </div>
        </div>

        <div className="card config-secao">
          <h3 className="config-titulo"><Icon name="Folder" size={18} color="#00B4FF" /> Gerenciar Planejamento</h3>
          <div className="gerenciar-box">
            <div className="gb-atual">
              <Icon name="FileText" size={20} color="#00B4FF" />
              <div>
                <div className="gb-nome">{planejamento ? planejamento.nome || 'Planejamento atual' : 'Nenhum planejamento'}</div>
                <div className="gb-tipo">{planejamento ? (isFerias ? '🏖️ Férias' : '📚 Semestre') : 'Clique em "Criar" para começar'}</div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#7FA8C4' }}>{planejamento?.stats?.porcentagemConcluido || 0}% concluído</span>
            </div>
            <div className="gb-botoes">
              <button className="btn-primario" onClick={abrirCriar}><Icon name="Plus" size={16} /> {planejamento ? 'Novo Planejamento' : 'Criar Planejamento'}</button>
              {planejamento && (
                <>
                  <button className="btn-secundario" onClick={arquivarAtual}><Icon name="Archive" size={16} /> Arquivar</button>
                  <button className="btn-danger" onClick={handleResetar}><Icon name="Trash2" size={16} /> Resetar</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card config-secao" style={{ gridColumn: '1 / -1' }}>
          <h3 className="config-titulo"><Icon name="Database" size={18} color="#00B4FF" /> Dados</h3>
          <div className="config-acoes">
            <button className="btn-outline" onClick={exportarDados}><Icon name="Download" size={16} /> Exportar dados (JSON)</button>
            <button className="btn-outline" onClick={handleImportarJSON}><Icon name="Upload" size={16} /> Importar dados (JSON)</button>
          </div>
          <p className="config-aviso"><Icon name="Info" size={14} style={{ marginRight: 4 }} /> O reset apaga todo o progresso do planejamento atual. Os dados base e o histórico permanecem.</p>
        </div>
      </div>

      <button className="btn-primario" style={{ marginTop: 24 }} onClick={salvarConfig}><Icon name="Check" size={16} /> Salvar configurações</button>
    </div>
  );
}