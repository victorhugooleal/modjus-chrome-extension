window.addEventListener('message', (event) => {
    if (event.data.type === 'UPDATE_EDITORS') {
        const payload = event.data.payload;
        //console.log('Atualizando CKEDITORs', payload);

        // Verifica se o CKEditor está inicializado corretamente
        const el = document.getElementById('txaEditor_2811');
        if (el) {
            // Verifica se o ClassicEditor está definido
            if (typeof ClassicEditor === 'undefined') {
                console.warn('ClassicEditor não está definido. Carregando dinamicamente...');
                const script = document.createElement('script');
                script.src = 'https://cdn.ckeditor.com/ckeditor5/35.0.1/classic/ckeditor.js';
                script.onload = () => {
                    console.log('ClassicEditor carregado com sucesso.');
                    // Reinicializa o CKEditor após carregar o script
                    ClassicEditor.create(el)
                        .then(editor => {
                            el.ckeditorInstance = editor;
                            console.log('CKEditor inicializado com sucesso após carregamento dinâmico.');
                            editor.setData(payload.html);
                        })
                        .catch(error => {
                            console.error('Erro ao inicializar o CKEditor após carregamento dinâmico:', error);
                        });
                };
                script.onerror = () => {
                    console.error('Erro ao carregar o script do ClassicEditor.');
                };
                document.head.appendChild(script);
            } else {
                console.log('ClassicEditor já está definido.');
            }

            if (!el.ckeditorInstance) {
                ClassicEditor.create(el)
                    .then(editor => {
                        el.ckeditorInstance = editor;
                        console.log('CKEditor inicializado com sucesso para txaEditor_2811');
                        editor.setData(payload.html); // Define os dados após a inicialização
                    })
                    .catch(error => {
                        console.error('Erro ao inicializar o CKEditor:', error);
                    });
            } else {
                console.log('CKEditor já está inicializado para txaEditor_2811');
                // Verifica se o payload.html é válido antes de definir os dados
                if (payload && payload.html) {
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(payload.html, 'text/html');
                        if (doc.body) {
                            // Verifica se o CKEditor possui uma raiz válida
                            if (el.ckeditorInstance.editing.view.document.roots.size > 0) {
                                el.ckeditorInstance.setData(payload.html);
                            } else {
                                console.warn('CKEditor não possui uma raiz válida. Tentando reinicializar...');
                                el.ckeditorInstance.destroy()
                                    .then(() => {
                                        return ClassicEditor.create(el);
                                    })
                                    .then(editor => {
                                        el.ckeditorInstance = editor;
                                        console.log('CKEditor reinicializado com sucesso.');
                                        editor.setData(payload.html);
                                    })
                                    .catch(error => {
                                        console.error('Erro ao reinicializar o CKEditor:', error);
                                    });
                            }
                        } else {
                            console.error('HTML malformado no payload.');
                        }
                    } catch (error) {
                        console.error('Erro ao validar o HTML do payload:', error);
                    }
                } else {
                    console.error('Payload inválido ou vazio.');
                }
            }
        } else {
            console.error('Elemento DOM com ID txaEditor_2811 não encontrado.');
        }
    }
});