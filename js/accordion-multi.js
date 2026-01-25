//test.js

(function ($, window, document, undefined) {
    "use strict";
    var pluginName = 'simpleAccordion',
    defaults = {
        multiple: false,
        speedOpen: 300,
        speedClose: 150,
        easingOpen: null,
        easingClose: null,
        headClass: 'accordion-header',
        bodyClass: 'accordion-body',
        openClass: 'open',
        defaultOpenClass: 'default-open',
        cbClose: null, //function (e, $this) {},
        cbOpen: null //function (e, $this) {}
    };
    function Accordion(element, options) {
        this.$el = $(element);
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        if (typeof this.$el.data('multiple') !== 'undefined') {
            this.options.multiple = this.$el.data('multiple');
            } else {
            this.options.multiple = this._defaults.multiple;
        }
        this.init();
    }
    Accordion.prototype = {
        init: function () {
            var o = this.options,
            $headings = this.$el.children('.' + o.headClass);
            $headings.on('click', {_t:this}, this.headingClick);
            $headings.filter('.' + o.defaultOpenClass).first().click();
        },
        headingClick: function (e) {
            var $this = $(this),
            _t = e.data._t,
            o = _t.options,
            $headings = _t.$el.children('.' + o.headClass),
            $currentOpen = $headings.filter('.' + o.openClass);
            if (!$this.hasClass(o.openClass)) {
                if ($currentOpen.length && o.multiple === false) {
                    $currentOpen.removeClass(o.openClass).next('.' + o.bodyClass).slideUp(o.speedClose, o.easingClose, function () {
                        if ($.isFunction(o.cbClose)) {
                            o.cbClose(e, $currentOpen);
                        }
                        $this.addClass(o.openClass).next('.' + o.bodyClass).slideDown(o.speedOpen, o.easingOpen, function () {
                            if ($.isFunction(o.cbOpen)) {
                                o.cbOpen(e, $this);
                            }
                        });
                    });
                    } else {
                    $this.addClass(o.openClass).next('.' + o.bodyClass).slideDown(o.speedOpen, o.easingOpen, function () {
                        $this.removeClass(o.defaultOpenClass);
                        if ($.isFunction(o.cbOpen)) {
                            o.cbOpen(e, $this);
                        }
                    });
                }
                } else {
                $this.removeClass(o.openClass).next('.' + o.bodyClass).slideUp(o.speedClose, o.easingClose, function () {
                    if ($.isFunction(o.cbClose)) {
                        o.cbClose(e, $this);
                    }
                });
            }
        }
    };
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new Accordion(this, options));
            }
         });
        };
    } (jQuery, window, document)
);

(function ($) {
  // Инициализация аккордеона
  $('.accordion-group').simpleAccordion({
    multiple: false,
    speedOpen: 300,
    speedClose: 150,
    headClass: 'accordion-header',
    bodyClass: 'accordion-body',
    openClass: 'open',
    defaultOpenClass: 'default-open',
    cbClose: null,
    cbOpen: null
  });

  // Обработчик клика для защищённых вкладок
  $('.accordion-group').on('click', '.requires-password', function(e) {
    const $header = $(this);
    const $body = $header.next('.accordion-body');

    // Если уже открыт — закрываем без пароля
    if ($header.hasClass('open')) {
      $header.removeClass('open');
      $body.slideUp(150);
      return;
    }

    // Блокируем стандартное поведение плагина
    e.stopImmediatePropagation();

    // Проверяем попытки
    if (window.passwordAttempts >= 3) {
      alert('Превышено число попыток. Доступ заблокирован.');
      return;
    }

    // Открываем модальное окно
    $('#passwordModal').css('display', 'flex');
    $('#passwordInput').focus();
  });

  // Функция проверки пароля (вынесена наружу)
  window.checkPassword = function() {
    const password = $('#passwordInput').val();

    if (password === '123') {
      // Открываем вкладку
      const $header = $('.requires-password.open').length 
        ? $('.requires-password.open')
        : $('.requires-password');
      const $body = $header.next('.accordion-body');

      $header.addClass('open');
      $body.slideDown(300);

      window.passwordAttempts = 0;
      $('#passwordModal').fadeOut(500);  // Плавное исчезновение за 200 мс
     
    } else {
      window.passwordAttempts++;
      const remaining = 3 - window.passwordAttempts;
      alert(`Неверный пароль! Осталось попыток: ${remaining}`);

      if (window.passwordAttempts >= 3) {
        
        $('#passwordModal').hide();
      }
    }
  };

  // Закрытие модального окна по клику вне его
  $(document).on('click', '#passwordModal', function(e) {
    if (e.target === this) {
      $(this).hide();
    }
  });

  // Инициализация счётчика попыток
  window.passwordAttempts = 0;

  // Сброс при перезагрузке страницы
  $(window).on('beforeunload', function() {
    window.passwordAttempts = 0;
  });

})(jQuery);

