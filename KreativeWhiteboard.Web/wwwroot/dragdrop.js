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
            element.style.zIndex = 1000;
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
                element.style.zIndex = '';
                if (isDragging) {
                    isDragging = false;
                    dotnet.invokeMethodAsync('SetDragging', false);
                    const newX = parseInt(element.style.left);
                    const newY = parseInt(element.style.top);
                    dotnet.invokeMethodAsync('OnCardMoved', cardId.toString(), newX, newY);
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