window.addEventListener('message', async (event) => {
    if (event.data.type === 'UPDATE_EDITORS') {
        const payload = event.data.payload;
        console.log('CKEditor 5 listener:', payload);
        const editorElement = window.inicializadorDll?.editores[0].sourceElements.txaEditor_2811;
        console.log('Editor atualizado:', editorElement);
        if (!editorElement) {
            console.warn('Editor element not found');
            return;
        }
        // Try to find CKEditor 5 instance attached to the DOM element
        let ckeditorInstance = null;
        for (const prop in editorElement) {
            if (prop.startsWith('__ckeditor')) {
                ckeditorInstance = editorElement[prop];
                break;
            }
        }
        if (ckeditorInstance && typeof ckeditorInstance.setData === 'function') {
            ckeditorInstance.setData(payload.html);
            console.log('CKEditor 5 instance found and data set.');
        } else {
            console.warn('CKEditor 5 instance not found on element.');
        }
    }
});

injectScript(chrome.runtime.getURL('/js/ckeditor.js'), 'body');