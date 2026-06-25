🌴 Palmeirinha

### O sistema organiza seus estudos por você

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?logo=vite)](https://vitejs.dev/)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-222222?logo=github)](https://pages.github.com/)

---

## 📋 Sobre o Projeto

**Palmeirinha** é um sistema de planejamento de estudos inteligente e adaptativo que organiza automaticamente sua rotina com base nos seus prazos, disponibilidade de tempo e objetivos acadêmicos.

O sistema foi projetado para eliminar a sobrecarga mental de decidir "o que estudar hoje" e maximizar seu tempo de aprendizado com técnicas baseadas em ciência cognitiva.

---

## 🎯 O Problema que Resolve

| Problema | Solução |
|----------|---------|
| ❌ "Não sei o que estudar hoje" | ✅ O sistema te mostra exatamente o que estudar a cada dia |
| ❌ "Esqueço o que estudei" | ✅ Revisão espaçada baseada na curva do esquecimento de Ebbinghaus |
| ❌ "Tenho múltiplos objetivos" | ✅ Sincroniza escola, vestibular, faculdade e concurso |
| ❌ "Nunca consigo cumprir o plano" | ✅ Respeita seu tempo disponível e reorganiza automaticamente |
| ❌ "Deixo tudo pra última hora" | ✅ Prazos sinalizados com 7 dias de antecedência |
| ❌ "Perco tempo decidindo o que fazer" | ✅ O sistema já decidiu tudo por você |

---

## ✨ Funcionalidades

### 📅 Calendário Inteligente
- Visualização mensal com todos os seus compromissos e prazos
- Clique em um dia para ver detalhes (aulas, eventos, estudo programado)
- Itens concluídos desaparecem automaticamente

### 📋 Gerenciamento de Prazos
- Lista completa de eventos avaliativos
- Filtros por disciplina, tipo e status (pendente/concluído)
- Botão "Reabrir" para corrigir conclusões acidentais

### 📚 Planos de Aula
- Cronograma completo de cada disciplina
- Checklist de aulas assistidas com barra de progresso
- Accordion expansível para organizar por disciplina

### 📖 Plano de Estudos Semanal
- Visualização semanal gerada automaticamente
- Distribuição inteligente de conteúdos
- Identificação de dias com prazos próximos

### 📊 Dashboard de Progresso
- Dias estudados, prazos concluídos e em atraso
- Frequência por disciplina com gráficos
- Menções/notas por disciplina (SS, MS, MM, MI, II, SR)

### 🏖️ Modo Férias
- Planejamento para cursos e projetos pessoais
- Distribuição automática de etapas
- Suporte a múltiplas atividades com cargas horárias diferentes

### 🔄 Reorganização Automática
- Se você atrasa um item, o sistema redistribui tudo
- Se você conclui antes do prazo, o sistema puxa os próximos itens
- Botão "Reorganizar plano" para forçar a atualização

### 📄 Importação Inteligente
- **Importar PDF:** Faça upload de um PDF com seu planejamento
- **Colar Texto:** Cole o texto gerado pelo ChatGPT no formato correto

---

## 🧠 A Ciência por Trás do Sistema

| Teoria | Aplicação |
|--------|-----------|
| **Curva do Esquecimento** (Ebbinghaus) | Revisões no momento exato antes de você esquecer |
| **Repetição Espaçada** (Wozniak) | Intervalos adaptativos conforme seu desempenho |
| **Carga Cognitiva** (Sweller) | Distribuição de conteúdos em blocos que o cérebro consegue digerir |
| **Primazia e Recenticidade** (Ebbinghaus) | Conteúdos difíceis no início e fim da sessão |
| **Prática de Recuperação** (Karpicke & Roediger) | Simulados de 6 perguntas para testar ativamente |
| **Aprendizado Distribuído** (Dempster) | Distribuição de conteúdos ao longo do calendário |
| **Estado de Fluxo** (Csikszentmihalyi) | Equilíbrio entre desafio e habilidade |

---

## 🚀 Tecnologias Utilizadas

- **React 18** — Biblioteca para construção de interfaces
- **Vite 5** — Build tool e servidor de desenvolvimento
- **Lucide React** — Ícones vetoriais modernos
- **pdfjs-dist** — Leitura de PDF no navegador
- **LocalStorage** — Persistência de dados offline
- **GitHub Pages** — Hospedagem gratuita

---

## 🛠️ Como Executar Localmente

### 1. Clone o repositório

```bash
git clone https://github.com/cvpalmiere/palmeirinha.git
cd palmeirinha
2. Instale as dependências
bash
npm install
3. Rode o servidor de desenvolvimento
bash
npm run dev
4. Acesse no navegador
text
http://localhost:5173/
📦 Comandos Disponíveis
Comando	Descrição
npm run dev	Roda o servidor de desenvolvimento
npm run build	Gera os arquivos para produção
npm run preview	Visualiza o build localmente
npm run deploy	Deploy para o GitHub Pages
📁 Estrutura do Projeto
text
palmeirinha/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── styles.css
│   ├── useLocalStorage.js
│   ├── usePlanejamento.jsx
│   ├── parser.js
│   ├── dados.js
│   ├── inteligencia.js
│   ├── pdfReader.js
│   └── components/
│       ├── Sidebar.jsx
│       ├── Hoje.jsx
│       ├── Prazos.jsx
│       ├── Calendario.jsx
│       ├── PlanosAula.jsx
│       ├── PlanosEstudo.jsx
│       ├── Progresso.jsx
│       ├── Historico.jsx
│       ├── Configuracoes.jsx
│       ├── CriarPlanejamento.jsx
│       └── Icon.jsx
└── dist/ (gerado pelo build)
🌐 Acesse o Sistema Online
O sistema está disponível em:

text
https://cvpalmiere.github.io/palmeirinha/
📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

👩‍💻 Desenvolvido por
Carla Vick — GitHub

🙏 Agradecimentos
Aos professores, colegas e a todos que acreditam que a tecnologia pode transformar a educação.

"O Palmeirinha não foi criado por achismo. Cada comportamento do algoritmo — quando revisar, quanto estudar, o que priorizar — é sustentado por décadas de pesquisa científica sobre aprendizagem e memória." 🌴

text

---

## 📋 ONDE SALVAR:

1. **Crie o arquivo `README.md`** na raiz do projeto
2. **Cole o conteúdo acima**
3. **Commit e push:**

```bash
git add README.md
git commit -m "Adiciona README completo do projeto"
git push origin main
