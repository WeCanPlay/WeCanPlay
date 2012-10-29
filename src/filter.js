/*
 *  WeCanPlay : Library for html5 games
 *  http: //www.wecanplay.fr/
 *  WCP.filter : Apply filters on images
 *
 *  Authors : Kevin BOULONGNE, Mathieu HAMONIC
 */

(function (WCP) {
    "use strict";

    /**
    * Filter object
    */
    function Filter() {}

    Filter.blur = function (obj, param) {
        return this.applyFilter(obj, "blur", param);
    };
    
    Filter.brightness = function (obj, param) {
        return this.applyFilter(obj, "brightness", param);
    };
    
    Filter.colorAdjust = function (obj, params) {
        return this.applyFilter(obj, "colorAdjust", params[0], params[1], params[2]);
    };
    
    Filter.contrast = function (obj, param) {
        return this.applyFilter(obj, "contrast", param);
    };
    
    Filter.grayscale = function (obj) {
        return this.applyFilter(obj, "grayscale");
    };
    
    Filter.hue = function (obj, param) {
        return this.applyFilter(obj, "hue", param);
    };

    Filter.invert = function (obj) {
        return this.applyFilter(obj, "invert");
    };

    Filter.lightness = function (obj, param) {
        return this.applyFilter(obj, "lightness", param);
    };
    
    Filter.mosaic = function (obj, param) {
        return this.applyFilter(obj, "mosaic", param);
    };
    
    Filter.saturation = function (obj, param) {
        return this.applyFilter(obj, "saturation", param);
    };
    
    Filter.sepia = function (obj) {
        return this.applyFilter(obj, "sepia");
    };
    
    Filter.solarize = function (obj) {
        return this.applyFilter(obj, "solarize");
    };
    
    Filter.threshold = function (obj, param) {
        return this.applyFilter(obj, "threshold", param);
    };

    Filter.filter = function (obj, filterName, params) {
        return this.applyFilter(obj, params[0], params[1], params[2], params[3]);
    };

    Filter.applyFilter = function (obj, filterName, param1, param2, param3) {
        if (!obj) {
            WCP.log("filter: Unable to apply a filter on an inexisting object");
            return null;
        }

        var buffer = WCP.bufferCanvas(obj.width, obj.height);
        if (obj instanceof WCP.Sprite) {
            buffer.ctx.drawImage(obj.img, obj.sliceX, obj.sliceY, obj.sliceWidth,
                obj.sliceHeight, 0, 0, obj.width, obj.height);
        } else if (obj instanceof Image) {
            buffer.ctx.drawImage(obj, 0, 0, obj.width, obj.height);
        }
        var imageData = this.filterApplyFilter(buffer.ctx, obj, filterName, param1, param2, param3);
        buffer.ctx.putImageData(imageData, 0, 0);
        return buffer;
    };

    Filter.filterApplyFilter = function (ctx, obj, filterName, param1, param2, param3) {
        var filters = {
            blur: this.filterApplyBlur,
            brightness: this.filterApplyBrightness,
            colorAdjust: this.filterApplyColorAdjust,
            contrast: this.filterApplyContrast,
            grayscale: this.filterApplyGrayscale,
            hue: this.filterApplyHueOrSaturation,
            invert: this.filterApplyInvert,
            lightness: this.filterApplyLightness,
            mosaic: this.filterApplyMosaic,
            saturation: this.filterApplyHueOrSaturation,
            sepia: this.filterApplySepia,
            solarize: this.filterApplySolarize,
            threshold: this.filterApplyThreshold
        };

        var imageData = ctx.getImageData(0, 0, obj.width, obj.height);
        if (filterName === 'hue') {
            param2 = 0;
        }
        else if (filterName === 'saturation') {
            param2 = param1;
            param1 = 0;
        }
        if (filterName === 'colorAdjust' && typeof(param2) === "undefined" && typeof(param3) === "undefined") {
            param2 = param1[1];
            param3 = param1[2];
            param1 = param1[0];
        }
        if (filters[filterName]) {
            filters[filterName](imageData.data, imageData.width, imageData.height, param1, param2, param3);
        }
        return imageData;
    };

    Filter.filterApplyBlur = function (imageData, width, height, adjustment) { // from 1 to +infinity (6, it's already not bad)
        adjustment = Math.max(1, adjustment);
        var imageDataTmp = imageData;
        for (var count = 0; count < adjustment; count++) {
            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    var idx2 = (x + (y - 1) * width) * 4;
                    var r2 = imageData[idx2];
                    var g2 = imageData[idx2 + 1];
                    var b2 = imageData[idx2 + 2];
                    var idx4 = (x - 1 + y * width) * 4;
                    var r4 = imageData[idx4];
                    var g4 = imageData[idx4 + 1];
                    var b4 = imageData[idx4 + 2];
                    var idx5 = (x + y * width) * 4;
                    var r5 = imageData[idx5];
                    var g5 = imageData[idx5 + 1];
                    var b5 = imageData[idx5 + 2];
                    var idx6 = (x + 1 + y * width) * 4;
                    var r6 = imageData[idx6];
                    var g6 = imageData[idx6 + 1];
                    var b6 = imageData[idx6 + 2];
                    var idx8 = (x + (y + 1) * width) * 4;
                    var r8 = imageData[idx8];
                    var g8 = imageData[idx8 + 1];
                    var b8 = imageData[idx8 + 2];
                    if (y - 1 < 0) {
                        r2 = imageData[idx5];
                        g2 = imageData[idx5 + 1];
                        b2 = imageData[idx5 + 2];
                    }
                    if (x - 1 < 0) {
                        r4 = imageData[idx5];
                        g4 = imageData[idx5 + 1];
                        b4 = imageData[idx5 + 2];
                    }
                    if (x + 1 >= width) {
                        r6 = imageData[idx5];
                        g6 = imageData[idx5 + 1];
                        b6 = imageData[idx5 + 2];
                    }
                    if (y + 1 >= height) {
                        r8 = imageData[idx5];
                        g8 = imageData[idx5 + 1];
                        b8 = imageData[idx5 + 2];
                    }
                    imageDataTmp[idx5] = (r2 + r4 + r5 * 2 + r6 + r8) / 6;
                    imageDataTmp[idx5 + 1] = (g2 + g4 + g5 * 2 + g6 + g8) / 6;
                    imageDataTmp[idx5 + 2] = (b2 + b4 + b5 * 2 + b6 + b8) / 6;
                }
            }
            imageData = imageDataTmp;
        }
    };

    Filter.filterApplyBrightness = function (imageData, width, height, adjustment) { // from -150 to +150
        adjustment = (Math.max(-150, Math.min(150, adjustment))) * 100 / 150;
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var idx = (x + y * width) * 4;
                var r = imageData[idx];
                var g = imageData[idx + 1];
                var b = imageData[idx + 2];
                imageData[idx] = Math.round(r * (1 + adjustment / 100));
                imageData[idx + 1] = Math.round(g * (1 + adjustment / 100));
                imageData[idx + 2] = Math.round(b * (1 + adjustment / 100));
            }
        }
    };

    Filter.filterApplyColorAdjust = function (imageData, width, height, red, green, blue) { // from 0 to +255
        red = Math.round((Math.max(0, Math.min(255, red))) - 255);
        green = Math.round((Math.max(0, Math.min(255, green))) - 255);
        blue = Math.round((Math.max(0, Math.min(255, blue))) - 255);
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var idx = (x + y * width) * 4;
                var r = imageData[idx] + red;
                var g = imageData[idx + 1] + green;
                var b = imageData[idx + 2] + blue;
                if (r > 255) {
                    imageData[idx] = 255;
                } else if (r < 0) {
                    imageData[idx] = 0;
                } else {
                    imageData[idx] = r;
                }
                if (g > 255) {
                    imageData[idx + 1] = 255;
                } else if (g < 0) {
                    imageData[idx + 1] = 0;
                } else {
                    imageData[idx + 1] = g;
                }
                if (b > 255) {
                    imageData[idx + 2] = 255;
                } else if (b < 0) {
                    imageData[idx + 2] = 0;
                } else {
                    imageData[idx + 2] = b;
                }
            }
        }
    };

    Filter.filterApplyContrast = function (imageData, width, height, adjustment) { // from -1.0 to + infinity (+3.0, it's already not bad)
        adjustment = Math.max(-1.0, adjustment);
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var idx = (x + y * width) * 4;
                var r = imageData[idx];
                var g = imageData[idx + 1];
                var b = imageData[idx + 2];
                imageData[idx] = Math.round(r + adjustment * (r - 127));
                imageData[idx + 1] = Math.round(g + adjustment * (g - 127));
                imageData[idx + 2] = Math.round(b + adjustment * (b - 127));
            }
        }
    };

    Filter.filterApplyGrayscale = function (imageData, width, height) {
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var idx = (x + y * width) * 4;
                var r = imageData[idx];
                var g = imageData[idx + 1];
                var b = imageData[idx + 2];
                var v = 0.3 * r + 0.59 * g + 0.11 * b;
                imageData[idx] = v;
                imageData[idx + 1] = v;
                imageData[idx + 2] = v;
            }
        }
    };

    Filter.filterApplyHueOrSaturation = function (imageData, width, height, hue, saturation) { // from -180 to +180 for the Hue and from -100 to +100 for the Saturation
        hue = Math.max(-180, Math.min(180, hue));
        hue = (hue % 360) / 360;
        var hue6 = hue * 6;
        saturation = (Math.max(-100, Math.min(100, saturation))) / 100;
        if (saturation < 0) {
            saturation++;
        } else {
            saturation = saturation * 2 + 1;
        }
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var idx = (x + y * width) * 4;
                var r = imageData[idx];
                var g = imageData[idx + 1];
                var b = imageData[idx + 2];
                var vs = r;
                if (g > vs) {
                    vs = g;
                }
                if (b > vs) {
                    vs = b;
                }
                var ms = r;
                if (g < ms) {
                    ms = g;
                }
                if (b < ms) {
                    ms = b;
                }
                var vm = vs - ms;
                var l = (ms + vs) / 510;
                if (l > 0) {
                    if (vm > 0) {
                        var s = 0;
                        var v = 0;
                        var h = 0;
                        if (l <= 0.5) {
                            s = vm / (vs + ms) * saturation;
                            if (s > 1) {
                                s = 1;
                            }
                            v = (l * (1 + s));
                        } else {
                            s = vm / (510 - vs - ms) * saturation;
                            if (s > 1) {
                                s = 1;
                            }
                            v = (l + s - l * s);
                        }
                        if (r === vs) {
                            if (g === ms) {
                                h = 5 + ((vs - b) / vm) + hue6;
                            } else {
                                h = 1 - ((vs - g) / vm) + hue6;
                            }
                        } else if (g === vs) {
                            if (b === ms) {
                                h = 1 + ((vs - r) / vm) + hue6;
                            } else {
                                h = 3 - ((vs - b) / vm) + hue6;
                            }
                        } else {
                            if (r === ms) {
                                h = 3 + ((vs - g) / vm) + hue6;
                            } else {
                                h = 5 - ((vs - r) / vm) + hue6;
                            }
                        }
                        if (h < 0) {
                            h += 6;
                        }
                        if (h >= 6) {
                            h -= 6;
                        }
                        var m = (l + l - v);
                        var sextant = h >> 0;
                        if (sextant === 0) {
                            r = v * 255;
                            g = (m + ((v - m) * (h - sextant))) * 255;
                            b = m * 255;
                        } else if (sextant === 1) {
                            r = (v - ((v - m) * (h - sextant))) * 255;
                            g = v * 255;
                            b = m * 255;
                        } else if (sextant === 2) {
                            r = m * 255;
                            g = v * 255;
                            b = (m + ((v - m) * (h - sextant))) * 255;
                        } else if (sextant === 3) {
                            r = m * 255;
                            g = (v - ((v - m) * (h - sextant))) * 255;
                            b = v * 255;
                        } else if (sextant === 4) {
                            r = (m + ((v - m) * (h - sextant))) * 255;
                            g = m * 255;
                            b = v * 255;
                        } else if (sextant === 5) {
                            r = v * 255;
                            g = m * 255;
                            b = (v - ((v - m) * (h - sextant))) * 255;
                        }
                    }
                }
                if (r > 255) {
                    imageData[idx] = 255;
                } else if (r < 0) {
                    imageData[idx] = 0;
                } else {
                    imageData[idx] = r;
                }
                if (g > 255) {
                    imageData[idx + 1] = 255;
                } else if (g < 0) {
                    imageData[idx + 1] = 0;
                } else {
                    imageData[idx + 1] = g;
                }
                if (b > 255) {
                    imageData[idx + 2] = 255;
                } else if (b < 0) {
                    imageData[idx + 2] = 0;
                } else {
                    imageData[idx + 2] = b;
                }
            }
        }
    };

    Filter.filterApplyInvert = function (imageData, width, height) {
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var idx = (x + y * width) * 4;
                imageData[idx] = 255 - imageData[idx];
                imageData[idx + 1] = 255 - imageData[idx + 1];
                imageData[idx + 2] = 255 - imageData[idx + 2];
            }
        }
    };

    Filter.filterApplyLightness = function (imageData, width, height, lightness) { // from -100 to +100
        lightness = (Math.max(-100, Math.min(100, lightness))) / 100;
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var idx = (x + y * width) * 4;
                var r = imageData[idx];
                var g = imageData[idx + 1];
                var b = imageData[idx + 2];
                if (lightness < 0) {
                    r *= (lightness + 1);
                    g *= (lightness + 1);
                    b *= (lightness + 1);
                } else if (lightness > 0) {
                    r = r * (1 - lightness) + lightness * 255;
                    g = g * (1 - lightness) + lightness * 255;
                    b = b * (1 - lightness) + lightness * 255;
                }
                if (r > 255) {
                    imageData[idx] = 255;
                } else if (r < 0) {
                    imageData[idx] = 0;
                } else {
                    imageData[idx] = r;
                }
                if (g > 255) {
                    imageData[idx + 1] = 255;
                } else if (g < 0) {
                    imageData[idx + 1] = 0;
                } else {
                    imageData[idx + 1] = g;
                }
                if (b > 255) {
                    imageData[idx + 2] = 255;
                } else if (b < 0) {
                    imageData[idx + 2] = 0;
                } else {
                    imageData[idx + 2] = b;
                }
            }
        }
    };

    Filter.filterApplyMosaic = function (imageData, width, height, mosaic) { // from 2 to +infinity (+10 it's already not bad)
        mosaic = Math.max(2, mosaic);
        for (var x1 = 0; x1 < width; x1 += mosaic) {
            for (var y1 = 0; y1 < height; y1 += mosaic) {
                var idx1 = (x1 + y1 * width) * 4;
                var r = imageData[idx1];
                var g = imageData[idx1 + 1];
                var b = imageData[idx1 + 2];
                var mosaicX = mosaic;
                var mosaicY = mosaic;
                if (mosaicX + x1 > width) {
                    mosaicX = width - x1;
                }
                if (mosaicY + y1 > height) {
                    mosaicY = height - y1;
                }
                for (var x2 = x1; x2 < x1 + mosaicX; x2 ++) {
                    for (var y2 = y1; y2 < y1 + mosaicY; y2 ++) {
                        var idx2 = (x2 + y2 * width) * 4;
                        imageData[idx2] = r;
                        imageData[idx2 + 1] = g;
                        imageData[idx2 + 2] = b;
                    }
                }
            }
        }
    };

    Filter.filterApplySepia = function (imageData, width, height) {
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var idx = (x + y * width) * 4;
                var r = imageData[idx];
                var g = imageData[idx + 1];
                var b = imageData[idx + 2];
                var rTmp = r * 0.393 + g * 0.769 + b * 0.189;
                var gTmp = r * 0.349 + g * 0.686 + b * 0.168;
                var bTmp = r * 0.272 + g * 0.534 + b * 0.131;
                if (rTmp > 255) {
                    imageData[idx] = 255;
                } else if (rTmp < 0) {
                    imageData[idx] = 0;
                } else {
                    imageData[idx] = rTmp;
                }
                if (gTmp > 255) {
                    imageData[idx + 1] = 255;
                } else if (gTmp < 0) {
                    imageData[idx + 1] = 0;
                } else {
                    imageData[idx + 1] = gTmp;
                }
                if (bTmp > 255) {
                    imageData[idx + 2] = 255;
                } else if (bTmp < 0) {
                    imageData[idx + 2] = 0;
                } else {
                    imageData[idx + 2] = bTmp;
                }
            }
        }
    };

    Filter.filterApplySolarize = function (imageData, width, height) {
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var idx = (x + y * width) * 4;
                var r = imageData[idx];
                var g = imageData[idx + 1];
                var b = imageData[idx + 2];
                if (r > 127) {
                    r = 255 - r;
                }
                if (g > 127) {
                    g = 255 - g;
                }
                if (b > 127) {
                    b = 255 - b;
                }
                imageData[idx] = r;
                imageData[idx + 1] = g;
                imageData[idx + 2] = b;
            }
        }
    };

    Filter.filterApplyThreshold = function (imageData, width, height, threshold) { // from 0 to 254
        threshold = Math.max(0, Math.min(254, threshold));
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var idx = (x + y * width) * 4;
                var r = imageData[idx];
                var g = imageData[idx + 1];
                var b = imageData[idx + 2];
                var v = 0;
                if (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) {
                    v = 255;
                }
                imageData[idx] = v;
                imageData[idx + 1] = v;
                imageData[idx + 2] = v;
            }
        }
    };

    Filter.AQUA = [0, 255, 255];
    Filter.BLACK = [0, 0, 0];
    Filter.BLUE = [0, 0, 255];
    Filter.FUCHSIA = [255, 0, 255];
    Filter.GRAY = [128, 128, 128];
    Filter.GREEN = [0, 128, 0];
    Filter.LIME = [0, 255, 0];
    Filter.MAROON = [128, 0, 0];
    Filter.NAVY = [0, 0, 128];
    Filter.OLIVE = [128, 128, 0];
    Filter.PURPLE = [128, 0, 128];
    Filter.RED = [255, 0, 0];
    Filter.SILVER = [192, 192, 192];
    Filter.TEAL = [0, 128, 128];
    Filter.WHITE = [255, 255, 255];
    Filter.YELLOW = [255, 255, 0];

    WCP.Filter = Filter;
})(WCP);
