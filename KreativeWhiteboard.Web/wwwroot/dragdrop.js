let zCounter = 100;
window.dragDrop = {
    init: function (dotnet, cardId, element) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        element.addEventListener('mousedown', function (e) {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(element.style.left) || 0;
            startTop = parseInt(element.style.top) || 0;
            zCounter++;
            element.style.zIndex = zCounter;  // sube y nunca baja
            e.preventDefault();

            function onMouseMove(e) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                if (!isDragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
                    isDragging = true;
                    dotnet.invokeMethodAsync('SetDragging', true);
                }
                if (isDragging) {
                    element.style.left = (startLeft + dx) + 'px';
                    element.style.top = (startTop + dy) + 'px';
                }
            }

            function onMouseUp(e) {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                if (isDragging) {
                    isDragging = false;
                    dotnet.invokeMethodAsync('SetDragging', false);
                    const newX = parseInt(element.style.left);
                    const newY = parseInt(element.style.top);
                    const newZ = parseInt(element.style.zIndex) || 0;
                    dotnet.invokeMethodAsync('OnCardMoved', cardId.toString(), newX, newY, newZ);
                }
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }
};
window.preventContextMenu = function (dotnet) {
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        // Si el click fue en espacio vacío (no en una card), cierra el menu
        if (!e.target.closest('.board-card-element')) {
            dotnet.invokeMethodAsync('CerrarMenuDesdeJS');
        }
    });
};
window.uploadImageFromInput = async function (inputId, dotnet) {
    const input = document.getElementById(inputId);
    if (!input || !input.files || input.files.length === 0) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:5122/api/storage/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        dotnet.invokeMethodAsync('OnImageUploaded', data.url);
    } catch (err) {
        console.error('Upload failed:', err);
    }
};
window.initImageInput = async function (inputId, dotnet) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    input.addEventListener('change', async function () {
        const file = input.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5122/api/storage/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            dotnet.invokeMethodAsync('OnImageUploaded', data.url);
        } catch (err) {
            console.error('Upload failed:', err);
        }
    });
};
window.createImageInput = function (inputId, dotnet) {
    // Remover si ya existe
    const existing = document.getElementById(inputId);
    if (existing) existing.remove();

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.id = inputId;
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', async function () {
        const file = input.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5122/api/storage/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            dotnet.invokeMethodAsync('OnImageUploaded', data.url);
        } catch (err) {
            console.error('Upload failed:', err);
        }
    });
};

window.triggerImageInput = function (inputId) {
    const input = document.getElementById(inputId);
    if (input) input.click();
};

window.resizeCard = function (dotnet, cardId, element) {
    const handle = document.createElement('div');
    handle.style.cssText = `
        position: absolute;
        bottom: 0;
        right: 0;
        width: 16px;
        height: 16px;
        cursor: se-resize;
        z-index: 10;
    `;
    handle.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" style="position:absolute;bottom:3px;right:3px;opacity:0.3">
        <path d="M9 1L1 9M5 1L1 5M9 5L5 9" stroke="white" stroke-width="1.5"/>
    </svg>`;
    element.appendChild(handle);

    let isResizing = false;

    handle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        zCounter++;
        element.style.zIndex = zCounter;
        dotnet.invokeMethodAsync('SetResizing', true);

        const startX = e.clientX;
        const startY = e.clientY;
        const startW = element.offsetWidth;
        const startH = element.offsetHeight;

        function onMouseMove(e) {
            const newW = Math.max(100, startW + (e.clientX - startX));
            const newH = Math.max(80, startH + (e.clientY - startY));
            element.style.width = newW + 'px';
            element.style.height = newH + 'px';
            element.style.minHeight = 'unset';
        }

        function onMouseUp(e) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            isResizing = false;
            dotnet.invokeMethodAsync('SetResizing', false);
            const newW = parseInt(element.style.width);
            const newH = parseInt(element.style.height);
            dotnet.invokeMethodAsync('OnCardResized', cardId.toString(), newW, newH);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // Exponer isResizing para que BoardCard pueda consultarlo
    element._isResizing = () => isResizing;
};

window.isCardResizing = function (element) {
    return element._isResizing ? element._isResizing() : false;
};
window.getBoundingRect = function(element) {
    const rect = element.getBoundingClientRect();
    return {
        width: element.clientWidth,
        height: element.clientHeight,
        left: rect.left,
        top: rect.top,
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop
    };
};