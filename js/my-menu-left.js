
//  -- Выезжающее меню --

// Получаем элементы
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

// Обработчик клика по кнопке меню
menuToggle.addEventListener('click', function() {
    // Переключаем класс active для кнопки
    menuToggle.classList.toggle('active');
    
    // Переключаем класс active для меню
    sidebar.classList.toggle('active');
});

// Закрываем меню при клике вне его области
document.addEventListener('click', function(event) {
    const isClickInsideMenu = sidebar.contains(event.target);
    const isClickOnToggle = menuToggle.contains(event.target);
    
    if (!isClickInsideMenu && !isClickOnToggle && sidebar.classList.contains('active')) {
        menuToggle.classList.remove('active');
        sidebar.classList.remove('active');
    }
});
