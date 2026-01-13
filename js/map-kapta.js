document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('.map-container');
  const draggable = document.querySelector('.map-draggable');

  let isDragging = false;
  let startX = 0, startY = 0;
  let currentX = 0, currentY = 0;

  // Начало перетаскивания
  draggable.addEventListener('mousedown', function(e) {
    e.preventDefault(); // Блокируем стандартное drag&drop
    isDragging = true;
    
    const rect = draggable.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    
    draggable.style.transition = 'none';
  });

  // Перемещение
  container.addEventListener('mousemove', function(e) {
    if (!isDragging) return;

    currentX = e.clientX - startX;
    currentY = e.clientY - startY;

    // Вычисляем границы
    const containerRect = container.getBoundingClientRect();
    const draggableRect = draggable.getBoundingClientRect();

    const maxLeft = 0; // Нельзя уходить вправо за край контейнера
    const minLeft = containerRect.width - draggableRect.width; // Отрицательное число!
    const maxTop = 0;  // Нельзя уходить вниз
    const minTop = containerRect.height - draggableRect.height; // Отрицательное число

    // Ограничиваем координаты
    const finalX = Math.max(Math.min(currentX, maxLeft), minLeft);
    const finalY = Math.max(Math.min(currentY, maxTop), minTop);

    draggable.style.left = `${finalX}px`;
    draggable.style.top = `${finalY}px`;
  });

  // Завершение перетаскивания
  function stopDrag() {
    isDragging = false;
    draggable.style.transition = 'left 0.3s ease, top 0.3s ease';
  }

  container.addEventListener('mouseup', stopDrag);
  container.addEventListener('mouseleave', stopDrag); // Если мышь вышла из контейнера
  document.addEventListener('mouseup', stopDrag); // На всякий случай

  // Поддержка тач-устройств
  draggable.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    isDragging = true;
    
    const rect = draggable.getBoundingClientRect();
    startX = touch.clientX - rect.left;
    startY = touch.clientY - rect.top;
    
    draggable.style.transition = 'none';
  });

  container.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    const touch = e.touches[0];

    currentX = touch.clientX - startX;
    currentY = touch.clientY - startY;

    const containerRect = container.getBoundingClientRect();
    const draggableRect = draggable.getBoundingClientRect();

    const maxLeft = 0;
    const minLeft = containerRect.width - draggableRect.width;
    const maxTop = 0;
    const minTop = containerRect.height - draggableRect.height;

    const finalX = Math.max(Math.min(currentX, maxLeft), minLeft);
    const finalY = Math.max(Math.min(currentY, maxTop), minTop);

    draggable.style.left = `${finalX}px`;
    draggable.style.top = `${finalY}px`;
  });

  container.addEventListener('touchend', stopDrag);

  // Блокируем выделение текста
  container.style.userSelect = 'none';
});
