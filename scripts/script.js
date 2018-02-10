var filters = document.getElementById('filters');
// var ctx = canvas.getContext('2d');

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

var preview = {
    currentLayout: 'normal',
    preview: document.getElementById('preview'),
    $preview: $('#preview'),
    $canvas: $('#previewCanvas'),

    photoPositionX: 250,
    photoPositionY: 175,

    layout: {
        orientation: 'none',
        divs: 0,
        width: 0,
        height: 0,
    }
};

var $smallPhoto = $('#smallPhoto');

const INCH = 25.4; // In mm
const DPI = 300;
const MAX_PREVIEW_SIZE = 500; // in px
const MM_TO_PX = 450 / 2000;

// Handles the image loading into the memory
function loadImage(input) {
    $('#loading').removeClass('hidden');
    preview.$canvas.addClass('hidden');
    if (FileReader && input.files && input.files.length) {
        var fr = new FileReader();
        fr.onload = function() {
            originalPhoto.photo.src = fr.result;
            $(originalPhoto.photo).one('load', function() {
                analysePhoto();
                resize();
                GUI.recommendSize();
                GUI.update();
            });
        };
        fr.readAsDataURL(input.files[0]);
    }
}

// Analyses the photo (dimentions, orientation, etc...)
function analysePhoto() {
    originalPhoto.ratio = originalPhoto.photo.naturalWidth / originalPhoto.photo.naturalHeight;
    var r = originalPhoto.ratio;

    if (r === 1)
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
}

// Resizes the photo for faster preview rendering
function resize() {
    var resizeCanvas = document.getElementById('resize');
    var $resizeCanvas = $('#resize');

    $resizeCanvas.clearCanvas();

    if (originalPhoto.orientation === 'portrait') {
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
    } else if (originalPhoto.orientation === 'landscape') {
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
    var src = $resizeCanvas.getCanvasImage();
    $smallPhoto
        .attr('src', src)
        .one('load', drawPreview);

    $('#loading').addClass('hidden');
    preview.$canvas.removeClass('hidden');
}

function setFormat(width, height) {
    preview.layout.width = width;
    preview.layout.height = height;
}

function selectFormat(width, height) {
    setFormat(width, height);
    drawPreview();
    updateGUI();
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

// TODO Crop picture, not deform
function drawPreview() {
    preview.$canvas.drawImage({
        source: 'images/bckgr.jpg',
        x: 0,
        y: 0,
        fromCenter: false
    });
    if (preview.layout.divs === 0) {
        preview.$canvas.drawImage({
            source: smallPhoto.src,
            x: preview.photoPositionX,
            y: preview.photoPositionY,
            width: preview.layout.width * MM_TO_PX,
            height: preview.layout.height * MM_TO_PX,
            shadowColor: '#1a1a1a',
            shadowBlur: 3,
            shadowY: 2
        });
    } else {
        var totalWidth;
        var totalHeight;
        var startPoint;
        if (preview.layout.orientation === 'V') {
            totalWidth = preview.layout.width * MM_TO_PX + preview.layout.divs * 10;
            startPoint = preview.photoPositionX - totalWidth / 2 + totalWidth / (preview.layout.divs * 2);
            for (var i = 0; i < preview.layout.divs; i++) {
                preview.$canvas.drawImage({
                    source: smallPhoto.src,
                    x: startPoint + totalWidth * (i / preview.layout.divs),
                    y: preview.photoPositionY,
                    width: preview.layout.width * MM_TO_PX / preview.layout.divs,
                    height: preview.layout.height * MM_TO_PX,
                    sWidth: smallPhoto.width / preview.layout.divs,
                    sHeight: smallPhoto.height,
                    sx: (smallPhoto.width / (preview.layout.divs)) * i,
                    sy: smallPhoto.height / 2,
                    shadowColor: '#1a1a1a',
                    shadowBlur: 3,
                    shadowY: 2
                });
            }
        } else if (preview.layout.orientation === 'H') {
            totalHeight = preview.layout.height * MM_TO_PX + preview.layout.divs * 10;
            startPoint = preview.photoPositionY - totalHeight / 2 + totalHeight / (preview.layout.divs * 2);
            for (var i = 0; i < preview.layout.divs; i++) {
                preview.$canvas.drawImage({
                    source: smallPhoto.src,
                    y: startPoint + totalHeight * (i / preview.layout.divs),
                    x: preview.photoPositionX,
                    width: preview.layout.width * MM_TO_PX,
                    height: preview.layout.height * MM_TO_PX / preview.layout.divs,
                    sWidth: smallPhoto.width,
                    sHeight: smallPhoto.height / preview.layout.divs,
                    sx: smallPhoto.width / 2,
                    sy: (smallPhoto.height / (preview.layout.divs)) * i,
                    shadowColor: '#1a1a1a',
                    shadowBlur: 3,
                    shadowY: 2
                });
            }
        }
    }
}

function setLayout(orientation, divs) {
    preview.layout.divs = divs;
    preview.layout.orientation = orientation;
    drawPreview();
}



/*$('#previewDiv').tilt({
    perspective: 1000,
    glare: true,
    maxGlare: 0.2,
    maxTilt: 10
});*/
