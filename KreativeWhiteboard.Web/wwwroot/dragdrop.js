window.dragDrop = {
    init: function (dotnet, cardId, element) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        element.addEventListener('mousedown', function (e) {
            if (e.target.tagName === 'TEXTAREA') return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(element.style.left) || 0;
            startTop = parseInt(element.style.top) || 0;
            element.style.zIndex = 1000;
            e.preventDefault();
        });

        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            element.style.left = (startLeft + dx) + 'px';
            element.style.top = (startTop + dy) + 'px';
        });

        document.addEventListener('mouseup', function (e) {
            if (!isDragging) return;
            isDragging = false;
            element.style.zIndex = '';
            const newX = parseInt(element.style.left);
            const newY = parseInt(element.style.top);
            dotnet.invokeMethodAsync('OnCardMoved', cardId.toString(), newX, newY);
        });
    }
};