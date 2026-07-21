let zCounter = 100;
let selectedCardIds = new Set();
let boardDotNet = null;

window.setSelectedCards = function(ids) {
    selectedCardIds = new Set(ids);
};

window.setBoardDotNet = function(dotnet) {
    boardDotNet = dotnet;
};

window.setZCounter = function(value) {
    console.log('setZCounter called with:', value);
    zCounter = value;
};

window.dragDrop = {
    init: function (dotnet, cardId, element) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        element.addEventListener('mousedown', function (e) {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
            if (e.target.closest('button')) return;
            if (boardDotNet) boardDotNet.invokeMethodAsync('CerrarMenuDesdeJS');

            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(element.style.left) || 0;
            startTop = parseInt(element.style.top) || 0;
            zCounter++;
            element.style.zIndex = zCounter;
            e.preventDefault();

            const cardIdStr = cardId.toString();
            let selectedElements = [];
            if (selectedCardIds.has(cardIdStr)) {
                selectedCardIds.forEach(id => {
                    if (id !== cardIdStr) {
                        const el = document.getElementById('card-' + id);
                        if (el) {
                            selectedElements.push({
                                el,
                                startLeft: parseInt(el.style.left) || 0,
                                startTop: parseInt(el.style.top) || 0
                            });
                        }
                    }
                });
            }

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
                    selectedElements.forEach(s => {
                        s.el.style.left = (s.startLeft + dx) + 'px';
                        s.el.style.top = (s.startTop + dy) + 'px';
                    });
                    window.updateConnectors();
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
                    dotnet.invokeMethodAsync('OnCardMoved', cardIdStr, newX, newY, zCounter);

                    if (boardDotNet && selectedElements.length > 0) {
                        selectedElements.forEach(s => {
                            zCounter++;
                            s.el.style.zIndex = zCounter;
                            const id = s.el.id.replace('card-', '');
                            const x = parseInt(s.el.style.left);
                            const y = parseInt(s.el.style.top);
                            boardDotNet.invokeMethodAsync('OnGroupCardMoved', id, x, y, zCounter);
                        });
                        boardDotNet.invokeMethodAsync('LimpiarSeleccion');
                    }
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
        dotnet.invokeMethodAsync('CerrarMenuDesdeJS');
    });
};

window.createImageInput = function (inputId, dotnet) {
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
            window.updateConnectors();
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

window.drawConnectors = function(connections) {
    const svg = document.getElementById('connectors-svg');
    if (!svg) return;

    svg.querySelectorAll('line[data-conn]').forEach(l => l.remove());

    connections.forEach(conn => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('data-conn', 'true');
        line.setAttribute('data-source', conn.sourceCardId);
        line.setAttribute('data-target', conn.targetCardId);
        line.setAttribute('stroke', '#6366f1');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('opacity', '0.7');
        line.setAttribute('marker-end', 'url(#arrowhead)');
        svg.appendChild(line);
    });

    window.updateConnectors();
};

window.updateConnectors = function() {
    const svg = document.getElementById('connectors-svg');
    if (!svg) return;

    svg.querySelectorAll('line[data-conn]').forEach(line => {
        const sourceId = line.getAttribute('data-source');
        const targetId = line.getAttribute('data-target');

        const sourceEl = document.getElementById('card-' + sourceId);
        const targetEl = document.getElementById('card-' + targetId);
        if (!sourceEl || !targetEl) return;

        const sx = parseInt(sourceEl.style.left) + sourceEl.offsetWidth / 2;
        const sy = parseInt(sourceEl.style.top) + sourceEl.offsetHeight / 2;
        const tx = parseInt(targetEl.style.left) + targetEl.offsetWidth / 2;
        const ty = parseInt(targetEl.style.top) + targetEl.offsetHeight / 2;

        line.setAttribute('x1', sx);
        line.setAttribute('y1', sy);
        line.setAttribute('x2', tx);
        line.setAttribute('y2', ty);
    });
};

window.initKeyboard = function(dotnet) {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            dotnet.invokeMethodAsync('EliminarSeleccionados');
        }
    });
};

window.initSelection = function (dotnet) {
    const tryInit = (attempts) => {
        const canvas = document.querySelector('.canvas-bg');
        if (!canvas) {
            if (attempts > 0) setTimeout(() => tryInit(attempts - 1), 100);
            return;
        }

        let isSelecting = false;
        let startX, startY;
        let rect = null;

        document.addEventListener('mousedown', function (e) {
            if (e.target.id?.startsWith('card-') || e.target.closest('[id^="card-"]')) return;
            if (!canvas.contains(e.target)) return;
            if (e.button !== 0) return;

            isSelecting = true;
            const canvasRect = canvas.getBoundingClientRect();
            startX = e.clientX - canvasRect.left + canvas.scrollLeft;
            startY = e.clientY - canvasRect.top + canvas.scrollTop;

            rect = document.createElement('div');
            rect.style.cssText = `
                position: absolute;
                border: 1.5px solid #6366f1;
                background: rgba(99, 102, 241, 0.08);
                pointer-events: none;
                z-index: 99998;
                left: ${startX}px;
                top: ${startY}px;
                width: 0;
                height: 0;
            `;
            canvas.appendChild(rect);
            e.preventDefault();
        });

        document.addEventListener('mousemove', function (e) {
            if (!isSelecting || !rect) return;
            const canvasRect = canvas.getBoundingClientRect();
            const currentX = e.clientX - canvasRect.left + canvas.scrollLeft;
            const currentY = e.clientY - canvasRect.top + canvas.scrollTop;

            rect.style.left = Math.min(startX, currentX) + 'px';
            rect.style.top = Math.min(startY, currentY) + 'px';
            rect.style.width = Math.abs(currentX - startX) + 'px';
            rect.style.height = Math.abs(currentY - startY) + 'px';
        });

        document.addEventListener('mouseup', function (e) {
            if (!isSelecting || !rect) return;
            isSelecting = false;

            const canvasRect = canvas.getBoundingClientRect();
            const currentX = e.clientX - canvasRect.left + canvas.scrollLeft;
            const currentY = e.clientY - canvasRect.top + canvas.scrollTop;

            const selX = Math.min(startX, currentX);
            const selY = Math.min(startY, currentY);
            const selW = Math.abs(currentX - startX);
            const selH = Math.abs(currentY - startY);

            rect.remove();
            rect = null;

            if (selW < 5 && selH < 5) {
                dotnet.invokeMethodAsync('LimpiarSeleccion');
                return;
            }

            const selectedIds = [];
            canvas.querySelectorAll('[id^="card-"]').forEach(el => {
                const id = el.id.replace('card-', '');
                const elLeft = parseInt(el.style.left) || 0;
                const elTop = parseInt(el.style.top) || 0;
                const elRight = elLeft + el.offsetWidth;
                const elBottom = elTop + el.offsetHeight;

                if (elLeft < selX + selW && elRight > selX &&
                    elTop < selY + selH && elBottom > selY) {
                    selectedIds.push(id);
                }
            });

            dotnet.invokeMethodAsync('SetSeleccion', selectedIds);
        });
    };

    tryInit(20);
};

document.addEventListener('mousedown', function(e) {
    if (!boardDotNet) return;
    if (e.target.closest('.board-context-menu')) return;
    if (e.target.closest('button')) return;
    if (e.target.tagName === 'INPUT') return;
    if (e.target.tagName === 'LABEL') return;
    boardDotNet.invokeMethodAsync('CerrarMenuDesdeJS');
});
window.updatePreviewConnector = function(sourceId, mouseX, mouseY) {
    const svg = document.getElementById('connectors-svg');
    if (!svg) return;

    let preview = svg.querySelector('line[data-preview]');
    if (!preview) {
        preview = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        preview.setAttribute('data-preview', 'true');
        preview.setAttribute('stroke', '#6366f1');
        preview.setAttribute('stroke-width', '2');
        preview.setAttribute('opacity', '0.4');
        preview.setAttribute('stroke-dasharray', '6,4');
        preview.setAttribute('marker-end', 'url(#arrowhead)');
        svg.appendChild(preview);
    }

    const sourceEl = document.getElementById('card-' + sourceId);
    if (!sourceEl) return;

    const sx = parseInt(sourceEl.style.left) + sourceEl.offsetWidth / 2;
    const sy = parseInt(sourceEl.style.top) + sourceEl.offsetHeight / 2;

    preview.setAttribute('x1', sx);
    preview.setAttribute('y1', sy);
    preview.setAttribute('x2', mouseX);
    preview.setAttribute('y2', mouseY);
};
window.removePreviewConnector = function() {
    const svg = document.getElementById('connectors-svg');
    if (!svg) return;
    const preview = svg.querySelector('line[data-preview]');
    if (preview) preview.remove();
};