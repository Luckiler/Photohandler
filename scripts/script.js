var filters = document.getElementById('filters');
// var ctx = canvas.getContext('2d');
var preview = document.getElementById('preview');
var $preview = $('#preview');
var $previewCanvas = $('#previewCanvas');
// preview.addEventListener('load', analysePhoto, false);

var $brightnessSlider = $('#brightness');
var $contrastSlider = $('#contrast');
var $saturationSlider = $('#saturation');

var editedPhoto = new Image();
var bckgr = new Image();
bckgr.src = 'images/bckgr.jpg';
// ctx.drawImage(bckgr, 0, 0, 700, 525);

var originalPhoto = {
    photo: new Image(), // As HTMLImageElement object
    orientation: 'none',
    ratio: 0,
    closestRatio: 0, // The closest standart format
    maxWidth: 0, // In mm
    maxHeight: 0, // In mm
    maxDivisionsV: -1,
    maxDivisionsH: -1
};

var currentLayout = 'normal';

const INCH = 25.4; // In mm
const DPI = 300;
const MAX_PREVIEW_SIZE = 500; // in px
const MM_TO_PX = 450 / 2000;

// Handles the image loading into the memory
function loadImage(input) {
    if (FileReader && input.files && input.files.length) {
        var fr = new FileReader();
        fr.onload = function() {
            originalPhoto.photo.src = fr.result;
            $(originalPhoto.photo).one('load', analysePhoto);
        };
        fr.readAsDataURL(input.files[0]);
    }
}

// Analyses the photo (dimentions, orientation, etc...)
function analysePhoto() {
    originalPhoto.ratio = originalPhoto.photo.naturalWidth / originalPhoto.photo.naturalHeight;
    var r = originalPhoto.ratio;

    if (r == 1)
        originalPhoto.orientation = 'square';
    else if (r < 1) {
        originalPhoto.orientation = 'portrait';
        originalPhoto.closestRatio = closestTo([1, 2 / 3, 1 / 2, 1 / 3], originalPhoto.ratio);
    } else {
        originalPhoto.orientation = 'landscape';
        originalPhoto.closestRatio = closestTo([1, 3 / 2, 2, 3], originalPhoto.ratio);
    }

    originalPhoto.maxHeight = Math.round((originalPhoto.photo.naturalHeight * INCH) / DPI);
    originalPhoto.maxWidth = Math.round((originalPhoto.photo.naturalWidth * INCH) / DPI);

    originalPhoto.maxDivisionsV = originalPhoto.maxWidth / 300 - 1;
    originalPhoto.maxDivisionsH = originalPhoto.maxHeight / 300 - 1;

    updateGUI();
}

function updateGUI() {

    $('#maxSize').text(originalPhoto.maxWidth + 'x' + originalPhoto.maxHeight + 'mm');

    if (originalPhoto.maxDivisionsV < 1) {
        $('#dipV').css('display', 'none');
        $('#triV').css('display', 'none');
    } else if (originalPhoto.maxDivisionsV < 2) {
        $('#dipV').css('display', 'inline-block');
        $('#triV').css('display', 'none');
    } else {
        $('#dipV').css('display', 'inline-block');
        $('#triV').css('display', 'inline-block');
    }

    if (originalPhoto.maxDivisionsH < 1) {
        $('#dipH').css('display', 'none');
        $('#triH').css('display', 'none');
    } else if (originalPhoto.maxDivisionsH < 2) {
        $('#dipH').css('display', 'inline-block');
        $('#triH').css('display', 'none');
    } else {
        $('#dipH').css('display', 'inline-block');
        $('#triH').css('display', 'inline-block');
    }

    var $formatText = $('#format');
    switch (originalPhoto.closestRatio) {
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

    recomendSize();
    resize();
}

function recomendSize() {
    $rz = $('#recommendedSizes');
    $rz.empty();

    for (var s of ['EDIÇAO ESPECIAL', 'P', 'M', 'G', 'GG', 'COLECIONADOR']) {
        var color, w, h, display;
        display = true;

        switch (s) {
            case 'EDIÇAO ESPECIAL':
                h = 30;
                break;
            case 'P':
                h = 45;
                break;
            case 'M':
                h = 60;
                break;
            case 'G':
                if (originalPhoto.closestRatio == 2 / 3 || originalPhoto.closestRatio == 3 / 2)
                    h = 80;
                else
                    h = 90;
                break;
            case 'GG':
                if (originalPhoto.closestRatio != 2 / 3 || originalPhoto.closestRatio != 3 / 2)
                    display = false;
                h = 100;
                break;
            case 'COLECIONADOR':
                if (originalPhoto.closestRatio == 2 / 3 || originalPhoto.closestRatio == 3 / 2 || originalPhoto.closestRatio == 1)
                    h = 120;
                else if (originalPhoto.closestRatio == 1 / 2 || originalPhoto.closestRatio == 2)
                    h = 105;
                else if (originalPhoto.closestRatio == 1 / 3 || originalPhoto.closestRatio == 3)
                    h = 70;
                break;
        }

        if (display) {
            if (originalPhoto.closestRatio >= 1) {
                w = h * originalPhoto.closestRatio;
                if (originalPhoto.maxHeight / 10 >= h && originalPhoto.maxWidth / 10 >= w)
                    color = 'green';
                else if (originalPhoto.maxHeight / 10 >= h || originalPhoto.maxWidth / 10 >= w)
                    color = 'orange';
                else
                    color = 'red';
                $rz.append('<div class="w3-cell"><div class = "w3-container w3-margin w3-' + color + '">' + s + ' ' + w + 'x' + h + 'cm</div></div>');
            } else {
                w = h / originalPhoto.closestRatio;
                if (originalPhoto.maxWidth / 10 >= h && originalPhoto.maxHeight / 10 >= w)
                    color = 'green';
                else if (originalPhoto.maxWidth / 10 >= h || originalPhoto.maxHeight / 10 >= w)
                    color = 'orange';
                else
                    color = 'red';
                $rz.append('<div class="w3-cell"><div class = "w3-container w3-margin w3-' + color + '">' + s + ' ' + h + 'x' + w + 'cm</div></div>');
            }
        }
    }
}

// Resizes the photo for faster preview rendering
function resize() {
    var resizeCanvas = document.getElementById('resize');
    var $resizeCanvas = $('#resize');

    $resizeCanvas.clearCanvas();

    if (originalPhoto.orientation == 'portrait') {
        resizeCanvas.width = MAX_PREVIEW_SIZE * originalPhoto.ratio;
        resizeCanvas.height = MAX_PREVIEW_SIZE;
        $resizeCanvas
            .drawImage({
                source: originalPhoto.photo.src,
                x: 0,
                y: 0,
                width: MAX_PREVIEW_SIZE * originalPhoto.ratio,
                height: MAX_PREVIEW_SIZE,
                fromCenter: false
            });
    } else if (originalPhoto.orientation == 'landscape') {
        resizeCanvas.width = MAX_PREVIEW_SIZE;
        resizeCanvas.height = MAX_PREVIEW_SIZE / originalPhoto.ratio;
        $resizeCanvas
            .drawImage({
                source: originalPhoto.photo.src,
                x: 0,
                y: 0,
                width: MAX_PREVIEW_SIZE,
                height: MAX_PREVIEW_SIZE / originalPhoto.ratio,
                fromCenter: false
            });
    } else {
        resizeCanvas.width = MAX_PREVIEW_SIZE;
        resizeCanvas.height = MAX_PREVIEW_SIZE;
        $resizeCanvas
            .drawImage({
                source: originalPhoto.photo.src,
                x: 0,
                y: 0,
                width: MAX_PREVIEW_SIZE,
                height: MAX_PREVIEW_SIZE,
                fromCenter: false
            });
    }

    editedPhoto.src = $resizeCanvas.getCanvasImage();
    $preview
        .attr('src', editedPhoto.src)
        .one('load', function() {
            $preview
                .width(preview.naturalWidth)
                .height(preview.naturalHeight)
                .css({ 'margin-top': 200 - (preview.naturalHeight / 2) + 'px' });
        });

    drawPreview();
}

// Applies filters to the preview image
function filter(event) {
    Caman(filters, editedPhoto.src, function() {
        this.revert(false);
        this.brightness($brightnessSlider.val());
        this.contrast($contrastSlider.val());
        this.saturation($saturationSlider.val());
        this.render(function() {
            preview.src = filters.toDataURL();
        });
    });
}

function drawPreview() {
    $previewCanvas
        .drawImage({
            source: 'images/bckgr.jpg',
            x: 0,
            y: 0,
            fromCenter: false
        })
        .drawImage({
            source: editedPhoto.src,
            x: 250,
            y: 175,
            width: originalPhoto.maxWidth * MM_TO_PX,
            height: originalPhoto.maxHeight * MM_TO_PX,
            shadowColor: '#1a1a1a',
            shadowBlur: 3,
            shadowY: 2
        });
}

function setLayout(orientation, numberOfDivs = 0) {
    if (orientation == 'V') {
        // if(maxWidth / 2 > )
    }
}

/*$('#previewDiv').tilt({
    perspective: 1000,
    glare: true,
    maxGlare: 0.2,
    maxTilt: 10
});*/
