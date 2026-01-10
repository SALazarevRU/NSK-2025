document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('.map-container');
  const draggable = document.querySelector('.map-draggable');
  
  let isDragging = false;
  let startX, startY, currentX, currentY;

  // Начало перетаскивания
  draggable.addEventListener('mousedown', function(e) {
    isDragging = true;
    startX = e.clientX - draggable.offsetLeft;
    startY = e.clientY - draggable.offsetTop;
    draggable.style.transition = 'none'; // Отключаем плавность во время drag
  });

  // Перемещение
  container.addEventListener('mousemove', function(e) {
    if (!isDragging) return;

    currentX = e.clientX - startX;
    currentY = e.clientY - startY;

    // Ограничиваем перемещение внутри контейнера
    const maxLeft = 0;
    const maxTop = 0;
    const minLeft = container.offsetWidth - draggable.offsetWidth;
    const minTop = container.offsetHeight - draggable.offsetHeight;

    draggable.style.left = Math.max(Math.min(currentX, maxLeft), minLeft) + 'px';
    draggable.style.top = Math.max(Math.min(currentY, maxTop), minTop) + 'px';
  });

  // Завершение перетаскивания
  document.addEventListener('mouseup', function() {
    isDragging = false;
    draggable.style.transition = 'left 0.3s ease, top 0.3s ease'; // Включаем плавность
  });

  // Отменяем стандартное поведение (чтобы не выделялся текст)
  container.addEventListener('selectstart', function(e) { e.preventDefault(); });
});
