let qrok = false;     
$('.qrcodebtn').on('click',function() {
    if (qrok === false) {
        qrok = true;    
        $('body').append('\
            <div class="qrcodebg"><div class="qrcodeexit">&#10006;</div></div>\
            <div class="qrcodedata">\
            <div class="qrcodetext">\
            <p>Для перехода на эту страницу<br>в браузере телефона<br>отсканируйте QR-код</p>\
            <div class="qrcodeloader"><div class="qrcodeload"></div></div>\
            </div>\
            </div>\
        '); 
    }
    $('.qrcodebg').fadeIn();
    $('.qrcodedata').css('top', '0');
    var image = new Image(); 
    var nric = document.location.href;
    image.src = 'https://api.qrserver.com/v1/create-qr-code/?data=' + nric + '&amp;size=250x250';
    setTimeout(function () {
        if (image.width === 0) {
            $('.qrcodeloader').html('Ошибка при создании QR-кода');
            } else {
            $('.qrcodeloader').html('<img src="'+ image.src +'" />'); 
        }  
    }, 1000);
});
$(document).on('click','.qrcodebg',function() {
    $('.qrcodebg').fadeOut();
    $('.qrcodedata').css('top', '-120vh');
});
$(document).keyup(function(e) {
    if (e.key === "Escape" || e.keyCode === 27) {
        $('.qrcodebg').fadeOut();
        $('.qrcodedata').css('top', '-120vh');
    }
}); 