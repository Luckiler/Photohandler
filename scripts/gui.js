var GUI = {
    update: function() {

        setLayout('N', 0);

        // Displays the theorical maximum dimentions of the photo
        $('#maxSize').text(originalPhoto.maxWidth + 'x' + originalPhoto.maxHeight + 'mm');

        // Displays the vertical splits options
        if((originalPhoto.maxWidth / 300 - 1) < 1) {
            $('#dipV').css('display', 'none');
            $('#triV').css('display', 'none');
        } else if((originalPhoto.maxWidth / 300 - 1) < 2) {
            $('#dipV').css('display', 'inline-block');
            $('#triV').css('display', 'none');
        } else {
            $('#dipV').css('display', 'inline-block');
            $('#triV').css('display', 'inline-block');
        }
        // Displays de horizontal splits options
        if((originalPhoto.maxHeight / 300 - 1) < 1) {
            $('#dipH').css('display', 'none');
            $('#triH').css('display', 'none');
        } else if((originalPhoto.maxHeight / 300 - 1) < 2) {
            $('#dipH').css('display', 'inline-block');
            $('#triH').css('display', 'none');
        } else {
            $('#dipH').css('display', 'inline-block');
            $('#triH').css('display', 'inline-block');
        }
        // Displays the name of the recomended ratio
        var $formatText = $('#format');
        switch(originalPhoto.closestRatio) {
            case 1:
                $formatText.text('Quadrado');
                break;
            case 3 / 2:
                $formatText.text('Retangular');
                break;
            case 2:
                $formatText.text('Semi Panoramico');
                break;
            case 3:
                $formatText.text('Panoramico');
                break;
            case 2 / 3:
                $formatText.text('Retrato');
                break;
        }

        // Resets the size selector buttons
        $('.formatButton').removeClass('w3-card-4').css("transform", "scale(1)");
        var selector = '#f' + preview.layout.width + '' + preview.layout.height;
        $(selector).addClass('w3-card-4').css("transform", "scale(1.05)");
    },
    recommendSize: function() {
        $rz = $('#recommendedSizes');
        $rz.empty();
        var color, w, h, display;
        
        for(var format of ['EDIÇAO ESPECIAL', 'P', 'M', 'G', 'GG', 'COLECIONADOR']) {
            display = true;

            switch(format) {
                case 'EDIÇAO ESPECIAL':
                    h = 300;
                    break;
                case 'P':
                    h = 450;
                    break;
                case 'M':
                    h = 600;
                    break;
                case 'G':
                    if(originalPhoto.closestRatio === 2 / 3 || originalPhoto.closestRatio === 3 / 2)
                        h = 800;
                    else if(originalPhoto.closestRatio === 1 / 3 || originalPhoto.closestRatio === 3)
                        display = false;
                    else
                        h = 900;
                    break;
                case 'GG':
                    if(originalPhoto.closestRatio !== 2 / 3 || originalPhoto.closestRatio !== 3 / 2)
                        display = false;
                    h = 1000;
                    break;
                case 'COLECIONADOR':
                    if(originalPhoto.closestRatio === 2 / 3 || originalPhoto.closestRatio === 3 / 2 || originalPhoto.closestRatio === 1)
                        h = 1200;
                    else if(originalPhoto.closestRatio === 1 / 2 || originalPhoto.closestRatio === 2)
                        h = 1050;
                    else if(originalPhoto.closestRatio === 1 / 3 || originalPhoto.closestRatio === 3)
                        h = 700;
                    break;
            }

            if(display) {
                var text;
                var funcValues;
                var idValues;
                if(originalPhoto.closestRatio >= 1) {
                    w = h * originalPhoto.closestRatio;
                    if(originalPhoto.maxHeight >= h && originalPhoto.maxWidth >= w) {
                        color = 'green';
                        setFormat(w, h);
                    } else if(originalPhoto.maxHeight >= h || originalPhoto.maxWidth >= w)
                        color = 'orange';
                    else
                        color = 'red';
                    text = w / 10 + 'x' + h / 10 + 'cm';
                    funcValues = w + ',' + h;
                    idValues = w + '' + h;
                } else {
                    w = h / originalPhoto.closestRatio;
                    if(originalPhoto.maxWidth >= h && originalPhoto.maxHeight >= w) {
                        color = 'green';
                        setFormat(h, w);
                    } else if(originalPhoto.maxWidth >= h || originalPhoto.maxHeight >= w)
                        color = 'orange';
                    else
                        color = 'red';
                    text = h / 10 + 'x' + w / 10 + 'cm';
                    funcValues = h + ',' + w;
                    idValues = h + '' + w;
                }
                $rz.append('<div class = "w3-container w3-margin w3-' + color + ' w3-border-theme formatButton" id="f' + idValues + '" onclick="selectFormat(' + funcValues + ')"><p><b>' + format + '</b></p><p>' + text + '</div>');
            }
        }
    }
};
