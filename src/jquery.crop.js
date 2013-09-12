(function($) {
    $.fn.crop = function crop(options) {
        var settings = $.extend({
            styles: {
                gradientFrom: '#149BDF',
                gradientTo: '#0480BE',
                frameRgba: '0,0,0,0.75',
                frameWidth: '10px',
                framePosisition: 'inside',
                newLeft: 0,
                newTop: 0
            },
            target: {
                height: 120,
                width: 120
            },
            original: {
                height: 0,
                width: 0
            },
            ratio: 0,
            scale: 0,
            minScale: 0
        }, options);

        var getDimensions = function getDimensions(object) {
            var $data = object.data('cropData');
            var $settings = object.data('cropSettings');

            var $w = $data.crp_w.val();
            var $h = $data.crp_h.val();

            //Check for any non-imaginable values
            if ((parseInt($w) < 0 || parseInt($h) < 0) || ($w === '' || $h === '')) {

                //Something is not set, better check.
                var $temp = $("<img/>").attr("src", $data.image.attr("src")).load(function() {
                    var $inMemory = this;

                    //Update dimensions inputs
                    $data.crp_w.val($inMemory.width);
                    $data.crp_h.val($inMemory.height);

                    //Update size inputs
                    $data.crp_x2.val($inMemory.width);
                    $data.crp_y2.val($inMemory.height);

                    //Store variables
                    $settings.original.height = $inMemory.height;
                    $settings.original.width = $inMemory.width;

                    //We're done with that, chuck it.
                    $temp = null;

                    //Update passed object
                    calculateVariables($data, $settings);
                });
            } else {
                //Store variables
                $settings.original.height = $data.crp_h.val();
                $settings.original.width = $data.crp_w.val();

                //Update passed object
                calculateVariables($data, $settings);
            }
        };

        var calculateVariables = function calculateVariables(data, settings) {
            var $data = data;
            var $settings = settings;

            //Calculate ratio and minimal scale
            if ($settings.original.width > $settings.original.height) {
                $settings.ratio = ($settings.target.width / $settings.original.width);
                $settings.minScale = ($settings.target.height / $settings.original.height) / $settings.ratio;
            } else {
                $settings.ratio = ($settings.target.height / $settings.original.height);
                $settings.minScale = ($settings.target.width / $settings.original.width) / $settings.ratio;
            }

            applyCalculations($data, $settings);
        };

        var applyCalculations = function applyCalculations(data, settings) {
            var $data = data;
            var $settings = settings;

            //For easy access
            var $x1 = $data.crp_x1.val();
            var $x2 = $data.crp_x2.val();

            var $y1 = $data.crp_y1.val();
            var $y2 = $data.crp_y2.val();


            //Calculate width for scale
            var $width = (parseInt($x2) - parseInt($x1));
            var $height = (parseInt($y2) - parseInt($y1));

            //Get current scale
            $settings.scale = ($settings.target.width / $width) / $settings.ratio;

            //It might to small ini
            if ($settings.scale < $settings.minScale) {
                $settings.scale = $settings.minScale;
            }

            //Calculate newLeft and newTop and store for later reference
            $settings.styles.newLeft = Math.ceil(0 - (parseInt($x1) * ($settings.ratio * $settings.scale)));
            $settings.styles.newTop = Math.ceil(0 - (parseInt($y1) * ($settings.ratio * $settings.scale)));


            $data.image.width($settings.ratio * ($settings.original.width) * $settings.scale);
            $data.image.height($settings.ratio * ($settings.original.height) * $settings.scale);

            $data.image.css(
                    {
                        'left': ($settings.styles.newLeft.toString() + 'px'),
                        'top': ($settings.styles.newTop.toString() + 'px')
                    }
            );

            var $return = {
                cropData: $data,
                cropSettings: $settings
            };

            return $return;
        };

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
            $object.data('cropData', data);

            //Store cropsettings inside the object
            $object.data('cropSettings', settings);

            //Get dimension info from inputs, calculate all variables and apply first run positioning
            $object.data(getDimensions($object));




        });
    };
}(jQuery));

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
