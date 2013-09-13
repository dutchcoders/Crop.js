(function($) {
    $cropIsDragging = false;
    $cropBeingDragged = {};
    $dragMouseCoords = {};
    $dragImageCoords = {};

    $(document).on('mousemove', function(e) {
        if ($cropIsDragging) {
            var $data = $cropBeingDragged.parent().parent().data('cropData');
            var $settings = $cropBeingDragged.parent().parent().data('cropSettings');

            var $xDif = e.pageX - $dragMouseCoords.x;
            var $yDif = e.pageY - $dragMouseCoords.y;

            $settings.styles.newLeft = $dragImageCoords.x + $xDif;

            if ($settings.styles.newLeft + (($settings.ratio * ($settings.original.width) * $settings.scale)) < ($settings.target.width + parseInt($settings.styles.frameWidth))) {
                $settings.styles.newLeft = ($settings.target.width + parseInt($settings.styles.frameWidth)) - (($settings.ratio * ($settings.original.width) * $settings.scale));
            }

            if ($settings.styles.newLeft > (0 + parseInt($settings.styles.frameWidth))) {
                $settings.styles.newLeft = 0 + parseInt($settings.styles.frameWidth);
            }

            $settings.styles.newTop = $dragImageCoords.y + $yDif;

            if ($settings.styles.newTop > (0 + parseInt($settings.styles.frameWidth))) {
                $settings.styles.newTop = 0 + parseInt($settings.styles.frameWidth);
            }

            if ($settings.styles.newTop + (($settings.ratio * ($settings.original.height) * $settings.scale)) < ($settings.target.height + parseInt($settings.styles.frameWidth))) {
                $settings.styles.newTop = ($settings.target.height + parseInt($settings.styles.frameWidth)) - (($settings.ratio * ($settings.original.height) * $settings.scale));
            }

            var $x1 = Math.ceil(0 - ($settings.styles.newLeft / ($settings.ratio * $settings.scale)));
            var $x2 = $x1 + Math.ceil($settings.target.width / ($settings.ratio * $settings.scale));
            var $y1 = Math.ceil(0 - ($settings.styles.newTop / ($settings.ratio * $settings.scale)));
            var $y2 = $y1 + Math.ceil($settings.target.height / ($settings.ratio * $settings.scale));

            $data.crp_x1.val($x1);
            $data.crp_x2.val($x2);
            $data.crp_y1.val($y1);
            $data.crp_y2.val($y2);

            $data.image.css(
                    {
                        'left': ($settings.styles.newLeft.toString() + 'px'),
                        'top': ($settings.styles.newTop.toString() + 'px')
                    }
            );
        }
    });

    $(document).on('mouseup', function() {
        $cropIsDragging = false;
        $cropBeingDragged = {};
        $dragMouseCoords = {};
        $dragImageCoords = {};
    });

    $.fn.crop = function crop(options) {
        var settings = $.extend({
            styles: {
                gradientFrom: '#149BDF',
                gradientTo: '#0480BE',
                frameRgba: '0,0,0,0.75',
                frameWidth: '10',
                newLeft: 0,
                newTop: 0
            },
            handleUpload: true,
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

                    //Done here, trigger event.
                    object.trigger('dimensionsCaptured', {cropData: $data, cropSettings: $settings});
                });
            } else {
                //Store variables
                $settings.original.height = $data.crp_h.val();
                $settings.original.width = $data.crp_w.val();

                //Done here, trigger event.
                object.trigger('dimensionsCaptured', {cropData: $data, cropSettings: $settings});
            }
        };

        var calculateVariables = function calculateVariables(object) {
            var $data = object.data('cropData');
            var $settings = object.data('cropSettings');

            //Calculate ratio and minimal scale
            if ($settings.original.width > $settings.original.height) {
                $settings.ratio = ($settings.target.width / $settings.original.width);
                $settings.minScale = ($settings.target.height / $settings.original.height) / $settings.ratio;
            } else {
                $settings.ratio = ($settings.target.height / $settings.original.height);
                $settings.minScale = ($settings.target.width / $settings.original.width) / $settings.ratio;
            }

            object.trigger('calculationsCompleted', {cropData: $data, cropSettings: $settings});
        };

        var applyCalculations = function applyCalculations(object) {
            var $data = object.data('cropData');
            var $settings = object.data('cropSettings');

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
            $settings.styles.newLeft = (Math.ceil(0 - (parseInt($x1) * ($settings.ratio * $settings.scale))) + parseInt($settings.styles.frameWidth));
            $settings.styles.newTop = (Math.ceil(0 - (parseInt($y1) * ($settings.ratio * $settings.scale))) + parseInt($settings.styles.frameWidth));


            $data.image.width($settings.ratio * ($settings.original.width) * $settings.scale);
            $data.image.height($settings.ratio * ($settings.original.height) * $settings.scale);

            $data.image.css(
                    {
                        'left': ($settings.styles.newLeft.toString() + 'px'),
                        'top': ($settings.styles.newTop.toString() + 'px')
                    }
            );

            object.trigger('calculationsApplied', {cropData: $data, cropSettings: $settings});
        };

        var createElements = function createElements(object) {
            //Get basic data
            var $data = object.data('cropData');
            var $settings = object.data('cropSettings');

            var $cropHolder = $('<div/>')
                    .addClass('cropHolder');

            var $cropMask = $('<div/>')
                    .addClass('cropMask')
                    .css('width', (parseInt($settings.target.width) + (parseInt($settings.styles.frameWidth) * 2)) + 'px')
                    .css('height', (parseInt($settings.target.height) + (parseInt($settings.styles.frameWidth)) * 2) + 'px')
                    .appendTo($cropHolder);


            var $cropSlider = $('<div/>')
                    .addClass('cropSlider')
                    .appendTo($cropHolder);

            var $cropSliderInput = $('<input type="text" style="display: none;" data-slider-step="0.1" data-slider-orientation="horizontal" data-slider-selection="after" data-slider-tooltip="hide">')
                    .addClass('cropSliderInput')
                    .appendTo($cropSlider);

            if ($settings.handleUpload) {
                var $cropActionHolder = $('<div/>')
                        .addClass('cropActions');

                var $cropHiddenUpload = $('<input/>')
                        .addClass('cropUpload')
                        .attr('type', 'file')
                        .attr('style', 'height: 0px; visibility: hidden; position: absolute;')
                        .appendTo($cropActionHolder);

                var $cropUploadButton = $('<input/>')
                        .addClass('cropUploadButton')
                        .attr('type', 'button')
                        .appendTo($cropActionHolder);

                $cropActionHolder.appendTo($cropHolder);
            }

            $data.image.addClass('cropImg');
            $data.image.appendTo($cropMask);

            $cropHolder.appendTo(object);

            object.trigger('elementsCreated', {cropData: $data, cropSettings: $settings});
        };


        var addSlider = function addSlider(object) {
            //Get basic data
            var $data = object.data('cropData');
            var $settings = object.data('cropSettings');

            //Find slider element, must be somewhere in here ;)
            var $slider = object.find('.cropSlider input');

            //Apply bootstrap-slider.js, see their project for documentation
            $slider.slider({min: $settings.minScale, max: $settings.minScale + 10, value: $settings.scale}).on('slide', function(ev) {
                $settings.scale = ev.value;

                var $img = $data.image;

                // maintain ratio!
                $img.width($settings.ratio * ($settings.original.width) * $settings.scale);
                $img.height($settings.ratio * ($settings.original.height) * $settings.scale);

                $settings.styles.newLeft = (0 - ((($settings.original.width * $settings.ratio * $settings.scale) / 2) - ($settings.target.width / 2))) + (parseInt($settings.styles.frameWidth));
                $settings.styles.newTop = (0 - ((($settings.original.height * $settings.ratio * $settings.scale) / 2) - ($settings.target.height / 2))) + (parseInt($settings.styles.frameWidth));

                var $x1 = Math.ceil(0 - ($settings.styles.newLeft / ($settings.ratio * $settings.scale)));
                var $x2 = $x1 + Math.ceil($settings.target.width / ($settings.ratio * $settings.scale));
                var $y1 = Math.ceil(0 - ($settings.styles.newTop / ($settings.ratio * $settings.scale)));
                var $y2 = $y1 + Math.ceil($settings.target.height / ($settings.ratio * $settings.scale));

                $data.crp_x1.val($x1);
                $data.crp_x2.val($x2);
                $data.crp_y1.val($y1);
                $data.crp_x2.val($y2);

                $img.css(
                        {
                            'left': ($settings.styles.newLeft + 'px'),
                            'top': ($settings.styles.newTop + 'px')
                        }
                );
            });
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
            getDimensions($object);

            $object.on('dimensionsCaptured', function(e, data) {
                //Return data to the object
                $object.data(data);

                //Make some calculations
                calculateVariables($object);
            });

            $object.on('calculationsCompleted', function(e, data) {
                $object.data(data);

                //Apply them
                applyCalculations($object);
            });


            $object.on('calculationsApplied', function(e, data) {
                $object.data(data);

                //Create new elements
                createElements($object);
            });


            $object.on('elementsCreated', function(e, data) {
                $object.data(data);

                $object.find('.cropMask').on('mousedown', function(e) {
                    e.preventDefault(); //some browsers do image dragging themselves

                    $cropBeingDragged = $(this);

                    $cropIsDragging = true;
                    $dragMouseCoords = {
                        x: e.pageX,
                        y: e.pageY
                    };
                    $dragImageCoords = {
                        x: parseInt($object.data('cropData').image.css('left')),
                        y: parseInt($object.data('cropData').image.css('top'))
                    };
                });

                //Add a slider
                addSlider($object);
            });
        });
    };
}(jQuery));

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
