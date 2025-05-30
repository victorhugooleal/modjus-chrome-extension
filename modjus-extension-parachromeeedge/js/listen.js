// ====================
// Escuta mensagens do app externo
// ====================
window.addEventListener('message', (event) => {
    if (event.data.type !== 'UPDATE_EDITORS') return;

    const { id, html } = event.data.payload;

    // ====================
    // CKEditor 4 via inicializadorDll (SEI 4)
    // ====================
    if (window.CKEDITOR && CKEDITOR.instances[id]) {
        CKEDITOR.instances[id].setData(html);
        return;
    } else if (window.inicializadorDll && window.inicializadorDll.editores) {

        // ====================
        // CKEditor 5 via inicializadorDll (SEI 5)
        // ====================
        const editor = window.inicializadorDll?.editores?.[0];

        if (!editor) {
            return;
        }

        const root = editor.model.document.getRoot(id);

        if (!root) {
            return;
        }

        const nodes = Array.from(root.getChildren());

        // Localiza o nó com nome "htmlDivParagraph" ou "htmlDiv"
        const targetNode = nodes.find(node => {
            const nodeName = node.name.toString();
            if (nodeName === 'htmlDivParagraph' || nodeName === 'htmlDiv') {
                return node;
            }
        });


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