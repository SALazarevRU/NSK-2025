let qrok = false;

$('#qr-trigger').on('click', function(e) {
  e.preventDefault();

  if (!qrok) {
    qrok = true;

    $('body').append(
      '<div class="qrcodebg"></div>' +
      '<div class="qrcodedata">' +
        '<div class="qrcodeexit">&#10006;</div>' +
        '<div class="qrcodetext-container">' +
          '<div class="qrcodetext">' +
            '<p>Для перехода на эту страницу<br>в браузере телефона<br>отсканируйте QR-код</p>' +
            '<div class="qrcodeloader"><div class="qrcodeload"></div></div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );

     $('.qrcodebg')
    .fadeIn()
    .css('pointer-events', 'auto');
    $('.qrcodedata').css('top', '0');

    var image = new Image();
    var nric = document.location.href;
    image.src = 'https://api.qrserver.com/v1/create-qr-code/?' +
      'data=' + encodeURIComponent(nric) +
      '&size=250x250' +
      '&bgcolor=FFFFFF' +
      '&color=000000';

    setTimeout(function() {
      if (image.width === 0) {
        $('.qrcodeloader').html('Ошибка при создании QR-кода');
      } else {
        $('.qrcodeloader').html('<img src="' + image.src + '" />');
      }
    }, 1000);
  }
});

$(document).on('click', '.qrcodebg', function() {
  $('.qrcodebg').fadeOut();
  $('.qrcodedata').css('top', '-120vh');
  qrok = false;
});

$(document).keyup(function(e) {
  if (e.key === 'Escape' || e.keyCode === 27) {
    $('.qrcodebg').fadeOut();
    $('.qrcodedata').css('top', '-120vh');
    qrok = false;
  }
});

$(document).on('click', '.qrcodeexit', function() {
  $('.qrcodebg').fadeOut();
  $('.qrcodedata').css('top', '-120vh');
  qrok = false;
  $('body').css('overflow', 'auto');
});


