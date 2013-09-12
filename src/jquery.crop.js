(function($) {
    $.fn.crop = function crop(options) {

        var settings = $.extend({
            gradientFrom: '#149BDF',
            gradientTo: '#0480BE',
            target: {
                height: 120,
                width: 120
            }
        }, options);

        return this.each(function() {
            var $object = $(this);
            $object.addClass('crop');

            //Create data object for internal reference
            var data = {};

            //Create internal reference to all hidden inputs so we don't (ever) have to look for them again.
            var $inputs = $object.find('input[type=hidden][name^="crp_"]');
            $inputs.each(function() {
                var $current = $(this);
                data[$current.attr('name')] = $(this);
            });

            data.image = $object.find('img');

            //Store the data object them with the data() function on the main node
            $object.data('crop', data);
        });
    };
}(jQuery));

var original = {height: 120, width: 120};

var scale = 1.0;
var ratio = 1.0;

$('.crop img').one('load', function() {
    original.height = $('input[name=w]').val();
    original.width = $('input[name=h]').val();

    if (original.width > original.height) {
        ratio = (target.width / original.width);
        minScale = (target.height / original.height) / ratio;
    } else {
        ratio = (target.height / original.height);
        minScale = (target.width / original.width) / ratio;
    }

    width = (parseInt($('input[name=x2]').val()) - parseInt($('input[name=x1]').val()));
    height = (parseInt($('input[name=y2]').val()) - parseInt($('input[name=y1]').val()));

    var elem = $('.crop');
    scale = (target.width / width) / ratio;

    // set left / top
    var newLeft = Math.ceil(0 - (parseInt($('input[name=x1]').val()) * (ratio * scale)));
    ;
    var newTop = Math.ceil(0 - (parseInt($('input[name=y1]').val()) * (ratio * scale)));
    ;

    $('img', elem).width(ratio * (original.width) * scale);
    $('img', elem).height(ratio * (original.height) * scale);

    $('.crop img').css({'left': (newLeft.toString() + 'px'), 'top': (newTop.toString() + 'px')});

    $('input.slider').slider({min: minScale, max: minScale + 10, value: scale}).on('slide', function(ev) {
        scale = ev.value;
        var elem = $(this).closest('.crop');

        // maintain ratio!
        $('img', elem).width(ratio * (original.width) * scale);
        $('img', elem).height(ratio * (original.height) * scale);

        var newLeft = 0 - (((original.width * ratio * scale) / 2) - (target.width / 2));
        var newTop = 0 - (((original.height * ratio * scale) / 2) - (target.height / 2));

        var x1 = Math.ceil(0 - (newLeft / (ratio * scale)));
        var x2 = x1 + Math.ceil(target.width / (ratio * scale));
        var y1 = Math.ceil(0 - (newTop / (ratio * scale)));
        var y2 = y1 + Math.ceil(target.height / (ratio * scale));

        $('input[name=x1]').val(x1);
        $('input[name=x2]').val(x2);
        $('input[name=y1]').val(y1);
        $('input[name=y2]').val(y2);

        $('.crop img').css({'left': (newLeft + 'px'), 'top': (newTop + 'px')});
    });
});

$('.crop img').on('mousedown', handleMouseDown);
$(document).on('mousemove', handleMouseMove);
$(document).on('mouseup', handleMouseUp);

var isDragging = false;

function handleMouseDown(event) {
    event.preventDefault(); //some browsers do image dragging themselves
    isDragging = true;
    dragMouseCoords = {x: event.pageX, y: event.pageY};
    dragImageCoords = {x: parseInt($('.crop img').css('left')), y: parseInt($('.crop img').css('top'))}
}
function handleMouseUp() {
    isDragging = false;
}
function handleMouseMove(event) {
    if (isDragging) {
        var xDif = event.pageX - dragMouseCoords.x;
        var yDif = event.pageY - dragMouseCoords.y;

        var newLeft = dragImageCoords.x + xDif;

        if (newLeft + ((ratio * (original.width) * scale)) < target.width) {
            newLeft = target.width - ((ratio * (original.width) * scale));
        }

        if (newLeft > 0) {
            newLeft = 0;
        }

        var newTop = dragImageCoords.y + yDif;

        if (newTop > 0) {
            newTop = 0;
        }

        if (newTop + ((ratio * (original.height) * scale)) < target.height) {
            newTop = target.height - ((ratio * (original.height) * scale));
        }

        var x1 = Math.ceil(0 - (newLeft / (ratio * scale)));
        var x2 = x1 + Math.ceil(target.width / (ratio * scale));
        var y1 = Math.ceil(0 - (newTop / (ratio * scale)));
        var y2 = y1 + Math.ceil(target.height / (ratio * scale));

        $('input[name=x1]').val(x1);
        $('input[name=x2]').val(x2);
        $('input[name=y1]').val(y1);
        $('input[name=y2]').val(y2);

        $('.crop img').css({'left': (newLeft.toString() + 'px'), 'top': (newTop.toString() + 'px')});
    }
}

function upload(file) {
    if (!file.type.match('image.*'))
        return;

    // upload file
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function(e) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                data = JSON.parse(xhr.responseText);

                var elem = $('.crop');

                $('.crop img').attr('src', data.url).one('load', function() {
                    original = {height: data.height, width: data.width};

                    scale = 1

                    if (original.width > original.height) {
                        ratio = (target.width / original.width);
                        scale = (target.height / original.height) / ratio;
                    } else {
                        ratio = (target.height / original.height);
                        scale = (target.width / original.width) / ratio;
                    }

                    minScale = scale;

                    // maintain ratio!
                    $('img', elem).width(ratio * (original.width) * scale);
                    $('img', elem).height(ratio * (original.height) * scale);

                    // remove old slider
                    var elem1 = $('<input type="text" class="span2 slider" style="width: 120px; display: none;" data-slider-step="0.1" data-slider-orientation="horizontal" data-slider-selection="after" data-slider-tooltip="hide">');
                    $('div.slider').replaceWith(elem1);

                    $('input.slider').slider({min: minScale, max: minScale + 10, value: scale}).on('slide', function(ev) {
                        scale = ev.value;
                        var elem = $(this).closest('.crop');

                        // maintain ratio!
                        $('img', elem).width(ratio * (original.width) * scale);
                        $('img', elem).height(ratio * (original.height) * scale);

                        var newLeft = 0 - (((original.width * ratio * scale) / 2) - (target.width / 2));
                        var newTop = 0 - (((original.height * ratio * scale) / 2) - (target.height / 2));

                        var x1 = Math.ceil(0 - (newLeft / (ratio * scale)));
                        var x2 = x1 + Math.ceil(target.width / (ratio * scale));
                        var y1 = Math.ceil(0 - (newTop / (ratio * scale)));
                        var y2 = y1 + Math.ceil(target.height / (ratio * scale));

                        $('input[name=x1]').val(x1);
                        $('input[name=x2]').val(x2);
                        $('input[name=y1]').val(y1);
                        $('input[name=y2]').val(y2);

                        $('.crop img').css({'left': (newLeft + 'px'), 'top': (newTop + 'px')});
                    });

                    var newLeft = 0 - (((original.width * ratio * scale) / 2) - (target.width / 2));
                    var newTop = 0 - (((original.height * ratio * scale) / 2) - (target.height / 2));

                    var x1 = Math.ceil(0 - (newLeft / (ratio * scale)));
                    var x2 = x1 + Math.ceil(target.width / (ratio * scale));
                    var y1 = Math.ceil(0 - (newTop / (ratio * scale)));
                    var y2 = y1 + Math.ceil(target.height / (ratio * scale));

                    $('input[name=x1]').val(x1);
                    $('input[name=x2]').val(x2);
                    $('input[name=y1]').val(y1);
                    $('input[name=y2]').val(y2);

                    $('input[name=w]').val(original.width);
                    $('input[name=h]').val(original.height);

                    $("input[name=photo]").val(data.mediaid);

                    $('.crop img').css({'left': (newLeft + 'px'), 'top': (newTop + 'px')});
                });

            } else {
            }
        }
    };

    // start upload
    xhr.open("POST", '/media/upload', true);
    xhr.setRequestHeader("X-File-Name", file.name);
    xhr.send(file);
}
;
