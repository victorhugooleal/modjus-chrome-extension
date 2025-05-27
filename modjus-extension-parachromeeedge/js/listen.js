// ====================
// Escuta mensagens do app externo
// ====================
window.addEventListener('message', (event) => {
  if (event.data.type !== 'UPDATE_EDITORS') return;

  const { id, html } = event.data.payload;

  // ====================
  // CKEditor 5 via inicializadorDll (SEI 5)
  // ====================
  const editor = window.inicializadorDll?.editores?.[0];

  if (!editor) {
    console.warn('⚠️ Nenhuma instância CKEditor 5 encontrada.');
    return;
  }

  const root = editor.model.document.getRoot("txaEditor_2811");

  if (!root) {
    console.warn("⚠️ Raiz  não encontrada no CKEditor 5.");
    return;
  }

  const nodes = Array.from(root.getChildren());

  // Localiza o nó com nome "htmlDivParagraf"
 // const targetNode = nodes.find(node => node.name === 'htmlDivParagraf');
 const targetNode = nodes[1]

  if (!targetNode) {
    console.warn('⚠️ Nenhum node com name "htmlDivParagraf" encontrado.');
    return;
  }

  try {
    editor.model.change(writer => {
      // Remove o conteúdo atual do node "htmlDivParagraf"
      writer.remove(targetNode);

      // Converte HTML para ViewFragment
      const viewFragment = editor.data.processor.toView(html);

      // Converte ViewFragment para ModelFragment
      const modelFragment = editor.data.toModel(viewFragment);

      // Insere o novo conteúdo na posição original
      writer.insert(modelFragment, root, targetNode.startOffset);
    });

    
  } catch (e) {
    console.error('⚠️ Erro ao atualizar o CKEditor 5:', e);
  }
});


// window.postMessage({
//   type: 'UPDATE_EDITORS',
//   payload: {
//     id: 'txaEditor_2811',
//     html: `<div id="modjus-document" modjus-data="{&quot;processo&quot;:&quot;0000074-44.2025.4.02.8000&quot;}" modjus-url="https://modjus-tst.trf2.jus.br/SolicitacaoDeslocamento">
//       <div class="scrollableContainer">
//         <h4>Dados do Proponente</h4>
//         <p><strong>Proponente:</strong> JOÃO LUIS MOREIRA DE OLIVEIRA</p>
//         <p><strong>Matrícula:</strong> T211817</p>
//         <p><strong>Cargo:</strong> ANALISTA JUDICIÁRIO(A)/TI</p>

//         <h4>Dados do Beneficiário</h4>
//         <p><strong>Tipo:</strong> Servidor</p>
//         <p><strong>Faixa:</strong> Nacional</p>

//         <h4>Dados da Atividade</h4>
//         <p><strong>Tipo de Diária:</strong> Integral</p>
//         <p><strong>Justificativa:</strong> Participação em evento técnico.</p>
//       </div>
//     </div>`
//   }
// }, '*');