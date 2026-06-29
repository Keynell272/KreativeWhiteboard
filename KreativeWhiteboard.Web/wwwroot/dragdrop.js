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