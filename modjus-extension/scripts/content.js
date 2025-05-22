console.log('Content script loaded');
// console.log('CKEDITOR', CKEDITOR);


function unescapeHtmlB(escapedHtmlB) {
    const doc = new DOMParser().parseFromString(escapedHtmlB, 'text/html');
    return doc.documentElement.textContent || doc.body.textContent;
}

function unescapeHtml(string) {
    var htmlUnescapes = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'"
    };

    function basePropertyOf(object) {
        return function(key) {
            return object == null ? undefined : object[key];
        };
    }
    const reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g
    const reUnescapedHtml = /[&<>"']/g
    return string.replace(reEscapedHtml, basePropertyOf(htmlUnescapes))
}

// scripts/content.js

// Função para mostrar a modal de erro
function showErrorModal(message, details) {
    // Verifica se a modal já existe no DOM, caso contrário, cria ela
    let modal = document.getElementById('error-modal');
    if (!modal) {
        // Cria a modal e insere no corpo da página
        modal = document.createElement('div');
        modal.id = 'error-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Ocorreu um erro!</h2>
                <p id="error-message">Um erro aconteceu, por favor tente novamente mais tarde.</p>
                <button id="close-btn">Fechar</button>
                <button id="details-btn">Mais detalhes</button>
                <div id="error-details" class="error-details" style="display: none;">
                    <pre id="detailed-message"></pre>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const messageElem = document.getElementById('error-message');
    const detailsBtn = document.getElementById('details-btn');
    const closeBtn = document.getElementById('close-btn');
    const errorDetails = document.getElementById('error-details');
    const detailedMessageElem = document.getElementById('detailed-message');

    // Atualiza a mensagem principal da modal
    messageElem.textContent = message;

    // Se houver detalhes do erro, prepara para exibir quando clicado
    detailsBtn.onclick = () => {
        errorDetails.style.display = 'block';
        detailedMessageElem.textContent = details;
    };

    // Fecha a modal
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    // Exibe a modal
    modal.style.display = 'flex';
}

function modjusStart(url, data) {
    // Cria uma instância de URL para poder acessar facilmente o protocolo, host e porta (se houver)
    const urlObj = new URL(url);
    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.port ? ':' + urlObj.port : ''}`;

    fetch(`${baseUrl}/api/data-store`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log('Success:', result);

        const form = document.querySelector("form");
        const hundredpercent = "border:0;margin:0;padding:0;height:100%;width:100%;overflow:hidden";
        const iframe = document.createElement("iframe");

        // Adiciona o src ao iframe
        iframe.src = `${url}?dataKey=${result.key}&url=${encodeURIComponent(url)}`;
        iframe.frameborder = "0";
        iframe.style = "border:0;margin:0;padding:0;height:100%;width:100%;overflow:hidden";
        
        // Modifica os estilos da página
        document.documentElement.style = hundredpercent;
        const body = document.querySelector("body");
        body.style = hundredpercent;
        
        // Insere o iframe na página
        form.insertAdjacentElement("beforebegin", iframe);

        // Tratamento de erro no iframe (caso falhe ao carregar)
        iframe.onerror = function (error) {
            showErrorModal(
                "Ocorreu um erro ao tentar carregar o conteúdo.",
                `Erro ao carregar o iframe com o src: ${iframe.src} \nDetalhes: ${error.message}`
            );
        };
    })
    .catch(error => {
        // Se o erro for no fetch, mostra a modal com a URL de base
        showErrorModal(
            "Ocorreu um erro ao tentar carregar os dados.",
            `Erro ao tentar acessar a URL para carregar os dados do documento : ${baseUrl}/api/data-store \nDetalhes: ${error.message}`
        );
    });
}



function modjusStop(html) {
    const iframe = document.querySelector("iframe");
    iframe.style.display = "none";
    const form = document.querySelector("form");
    // form.style.display = _original_form_style_display;
    for (const textarea of textareas) {
        const text = textarea.value;
        if (text && text.includes("modjus-url=\"")) {
            console.log('textarea', textarea);
            textarea.innerText = html
            console.log('textarea', textarea);
            window.postMessage({ type: 'UPDATE_EDITORS', payload: { id: textarea.name, html: html } }, '*')
                // window.CKEDITOR.instances[textarea.id].setData(html);
            break
        }
    }
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'SAVE_DATA') {
        console.log('Dados recebidos no parent frame:', event.data.payload);
        modjusStop(event.data.payload);
    }
});

const textareas = document.querySelectorAll("textarea");

for (const textarea of textareas) {
    const text = textarea.value;
    if (text && text.includes("modjus-url=\"")) {
        const url = text.match(/modjus-url="([^"]+)"/)[1];
        const jsonenc = text.match(/modjus-data="([^"]+)"/)[1];
        const json = unescapeHtml(jsonenc);
        const data = json ? JSON.parse(json) : undefined
        console.log('url', url);
        console.log('data', data);
        // modjusStart(`${url}?data=${encodeURIComponent(json)}&url=${encodeURIComponent(url)}`, data);
        modjusStart(url, data);
    }
}

(function injectScriptInPageContext() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('js/listen.js');
    script.onload = function () {
        this.remove(); // remove o script após executar
    };
    (document.head || document.documentElement).appendChild(script);
})();
