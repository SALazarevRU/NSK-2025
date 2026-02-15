<!-- Футер. Аккордеон в футере(без скрипта на ПК аккор-н изначально закрыт) -->

    function toggleAccordionState() {
        const accordions = document.querySelectorAll('.footer-accordion');
        
        if (window.innerWidth > 768) {
            // На ПК — принудительно открыто
            accordions.forEach(acc => acc.setAttribute('open', ''));
        } else {
            // На мобиле — убираем open, чтобы было закрыто по умолчанию
            accordions.forEach(acc => acc.removeAttribute('open'));
        }
    }

    // Запуск при загрузке
    toggleAccordionState();

    // Запуск при изменении размера окна (поворот, ресайз)
    window.addEventListener('resize', toggleAccordionState);
