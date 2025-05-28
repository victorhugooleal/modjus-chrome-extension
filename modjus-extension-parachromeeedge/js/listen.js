// ====================
// Escuta mensagens do app externo
// ====================
window.addEventListener('message', (event) => {
    if (event.data.type !== 'UPDATE_EDITORS') return;

    const { id, html } = event.data.payload;

    // ====================
    // CKEditor 4 via inicializadorDll (SEI 4)
    // ====================
    console.log('CKEDITOR listener:', event.data.payload);
    console.log('CKEDITOR listener id:', id);
    console.log('CKEDITOR listener html:', html);   
    if (window.CKEDITOR && CKEDITOR.instances[id]) {
        CKEDITOR.instances[id].setData(html);
        console.log('CKEditor 4 encontrado e atualizado.');
        return;
    } else if (window.inicializadorDll && window.inicializadorDll.editores) {
        console.warn('⚠️ CKEditor 4 não encontrado, tentando CKEditor 5.');

        // ====================
        // CKEditor 5 via inicializadorDll (SEI 5)
        // ====================
        const editor = window.inicializadorDll?.editores?.[0];

        if (!editor) {
            console.warn('⚠️ Nenhuma instância CKEditor 5 encontrada.');
            return;
        }

        const root = editor.model.document.getRoot(id);

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
  }
});