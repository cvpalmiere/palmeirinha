import React, { useState, useRef } from 'react';
import Icon from './Icon.jsx';
import { extrairTextoPDF } from '../pdfReader.js';

const PROMPT_MODELO = `=== TIPO ===
ferias

=== PERÍODO ===
Início: 29/06/2026
Fim: 10/08/2026

=== HORÁRIOS ===
Bloco Manhã: 09:00-12:00 (3h)
Bloco Tarde: 13:00-16:00 (3h)

=== ATIVIDADES ===
[ATIVIDADE 1: Nome da Atividade] - Xh/dia
Item 1
Item 2
Item 3

=== DIAS ÚTEIS ===
Segunda, Terça, Quarta, Quinta, Sexta`;

export default function CriarPlanejamento({ onConfirm, onCancel, temPlanejamento }) {
  const [modo, setModo] = useState('texto');
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [progresso, setProgresso] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const fileInputRef = useRef(null);

  function handleCopiarPrompt() {
    navigator.clipboard.writeText(PROMPT_MODELO).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  function handleConfirm() {
    if (!texto.trim()) {
      setErro('⚠️ Por favor, cole o texto do planejamento.');
      return;
    }
    if (typeof onConfirm !== 'function') {
      setErro('❌ Erro interno: onConfirm não é uma função.');
      return;
    }
    try {
      onConfirm(texto);
    } catch (error) {
      setErro(`❌ ${error.message}`);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErro('⚠️ Por favor, selecione um arquivo PDF.');
      return;
    }

    setLoading(true);
    setErro(null);
    setProgresso(10);

    try {
      setProgresso(20);
      const textoExtraido = await extrairTextoPDF(file, (p) => setProgresso(20 + p * 0.7));
      setProgresso(90);

      if (!textoExtraido || textoExtraido.trim().length === 0) {
        throw new Error('O PDF está vazio ou não contém texto legível.');
      }

      if (!textoExtraido.includes('=== TIPO ===') || !textoExtraido.includes('=== ATIVIDADES ===')) {
        throw new Error('PDF não reconhecido. Certifique-se que está no formato correto do Palmeirinha.');
      }

      setTexto(textoExtraido);
      setProgresso(100);
      setErro(null);

      setTimeout(() => {
        if (typeof onConfirm === 'function') {
          onConfirm(textoExtraido);
        } else {
          setErro('❌ Erro: onConfirm não é uma função.');
        }
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error('Erro detalhado:', error);
      setErro(`❌ ${error.message}`);
      setProgresso(0);
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={temPlanejamento ? onCancel : undefined}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <h3><Icon name="Palmtree" size={24} color="#00B4FF" style={{ marginRight: 10 }} /> Criar Planejamento</h3>
        <p className="modal-sub">Escolha como deseja criar seu planejamento.</p>

        {temPlanejamento && (
          <div className="modal-aviso"><Icon name="AlertTriangle" size={18} color="#FFB347" /> Isso vai APAGAR seu planejamento atual.</div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className={`btn-${modo === 'texto' ? 'primario' : 'secundario'}`} onClick={() => setModo('texto')} style={{ flex: 1, justifyContent: 'center' }}>
            <Icon name="FileText" size={16} /> Colar Texto
          </button>
          <button className={`btn-${modo === 'pdf' ? 'primario' : 'secundario'}`} onClick={() => setModo('pdf')} style={{ flex: 1, justifyContent: 'center' }}>
            <Icon name="FileUp" size={16} /> Importar PDF
          </button>
        </div>

        {modo === 'texto' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#7FA8C4' }}><Icon name="FileText" size={14} /> Prompt modelo</span>
              <button className="btn-outline btn-sm" onClick={handleCopiarPrompt}><Icon name={copiado ? 'Check' : 'Copy'} size={14} /> {copiado ? 'Copiado!' : 'Copiar'}</button>
            </div>
            <div className="prompt-exemplo">{PROMPT_MODELO}</div>
            <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="Cole o texto do planejamento aqui..." rows={8} style={{ minHeight: 180, width: '100%', background: 'var(--azul-fundo-card-2)', color: 'var(--texto)', border: '1px solid var(--azul-borda)', borderRadius: 10, padding: 12 }} />
          </>
        )}

        {modo === 'pdf' && (
          <div style={{ border: '2px dashed var(--azul-borda)', borderRadius: 12, padding: 32, textAlign: 'center', position: 'relative' }}>
            {loading ? (
              <>
                <Icon name="Loader" size={40} color="#00B4FF" className="spinner" />
                <p style={{ color: '#7FA8C4', marginTop: 8 }}>Processando PDF... {Math.round(progresso)}%</p>
                <div style={{ height: 4, background: 'var(--azul-borda)', borderRadius: 2, marginTop: 12, maxWidth: 300, margin: '12px auto 0' }}>
                  <div style={{ width: `${progresso}%`, height: '100%', background: 'var(--azul-principal)', borderRadius: 2, transition: 'width 0.5s ease' }} />
                </div>
              </>
            ) : (
              <>
                <Icon name="FileUp" size={48} color="#7FA8C4" />
                <p style={{ color: '#7FA8C4', marginTop: 8 }}>Clique para selecionar um PDF</p>
                <p style={{ fontSize: 12, color: '#4A5A6A' }}>PDFs com texto selecionável funcionam melhor</p>
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
              </>
            )}
          </div>
        )}

        {erro && (
          <div style={{ color: '#FF6B6B', fontSize: 13, marginTop: 8, padding: 10, background: 'rgba(255,107,107,0.06)', borderRadius: 8 }}>
            <Icon name="XCircle" size={16} /> {erro}
          </div>
        )}

        <div className="modal-acoes">
          {temPlanejamento && <button className="btn-secundario" onClick={onCancel} disabled={loading}>Cancelar</button>}
          <button className="btn-primario" onClick={modo === 'texto' ? handleConfirm : () => fileInputRef.current?.click()} disabled={loading || (modo === 'texto' && !texto.trim())}>
            <Icon name="Check" size={16} /> {modo === 'texto' ? 'Criar Planejamento' : 'Selecionar PDF'}
          </button>
        </div>

        <div style={{ marginTop: 12, padding: 10, background: 'rgba(0, 212, 170, 0.04)', borderRadius: 8, border: '1px solid rgba(0, 212, 170, 0.08)' }}>
          <p style={{ fontSize: 12, color: '#7FA8C4', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="Info" size={14} color="#00D4AA" /> {modo === 'texto' ? 'Cole o texto gerado pelo ChatGPT no formato correto.' : 'Faça upload de um PDF com o planejamento no formato correto.'}
          </p>
        </div>
      </div>
    </div>
  );
}