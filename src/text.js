/*
 *  WeCanPlay : Library for html5 games
 *  http://www.wecanplay.fr/
 *  WCP.text: draw text and manager translation
 *
 *  Author: Pierrick PAUL
 *
 */

(function (WCP, window, document) {

    "use strict";

    var spanBuffer;
    
    // Private functions
    
    function getMetrics(that) {
        // A optimiser
        var spbDom = document.createElement("span");
        document.body.appendChild(spbDom);
        spbDom.setAttribute('id', 'spanBuffer');
        spanBuffer = document.getElementById("spanBuffer");
        spanBuffer.style.font = that.weight + " " + that.size + "px " + that.font;
        var n_child = document.createTextNode(that.text);
        spbDom.appendChild(n_child);
        var offsetHeight = spanBuffer.offsetHeight;
        //var width = WCP.ctx.measureText("qwertyploploutre").width;
        var width = spanBuffer.offsetWidth;
        //console.log(width)
        var descent = 0; //-BottomBaseline;
        var ascent = 0; //TopBaseline;
        document.body.removeChild(spanBuffer);
        return {height: offsetHeight, width:  width, descent: descent, ascent: ascent};
    }

    function traceWrite(txt, that) {
        WCP.ctx.save();
        WCP.ctx.rotate(WCP.Tools.degresToRadian(that.rotation));
        // GESTION BASELINE
        WCP.ctx.textBaseline = that.baseline;
        WCP.ctx.fillStyle = that.color;
        WCP.ctx.font = that.weight + " " + that.size + "px " + that.font;
        WCP.ctx.fillText(txt, that.x, that.y);
        WCP.ctx.restore();
    }

    // Class Text
    
    function Text(txt, x, y, width, color) {
        this.id = WCP.random(10, 99999); // ID RANDOM en attendant un solution pour les stack z-index !
        if (typeof txt === 'object') {
            this.txt = txt.text || "";
            this.x = txt.x || 0;
            this.y = txt.y || 0;
            this.width = txt.maxwidth || WCP.canvas.width;
            this.color = txt.color || "#333333";
            this.rotation = txt.rotation || 0;
            this.baseline = txt.baseline || "top";
            this.font = txt.font || "sans-serif";
            this.size = txt.size || 12;
            this.weight = txt.weight || "normal";
            this.wordwarp = txt.wordwarp || true;
        } else {
            this.txt = txt || "";
            this.x = x || 0;
            this.y = y || this.y;
            this.width = width || WCP.canvas.width;
            this.color = color || WCP.ctx.fillStyle;
            this.rotation = 0;
            this.baseline = "top";
            this.font = "sans-serif";
            this.size = 12;
            this.weight = "normal";
            this.wordwarp = true;
        }

        this.metrics = getMetrics(this);
        return this;
    }

    Text.prototype.draw = function () {
        if (this.txt !== "") {
            // VERIFIER COMPATIBILITE
            var mT = WCP.ctx.measureText(this.txt).width;
            if (mT + this.x > this.width && this.wordwarp) {
                // commencer le wrapping
                var words = this.txt.split(" ");
                var line = "";
                //this.lineHeight = getMetrics().height;

                for (var n = 0; n < words.length; n++) {
                    var testLine = line + words[n] + " ";
					var testWidth = WCP.ctx.measureText(testLine).width;
                    if (testWidth > (this.width - this.x)) {
                        traceWrite(line, this);
                        line = words[n] + " ";
                        this.y += this.metrics.height;
                    } else {
                        line = testLine;
                    }
                }
                traceWrite(line, this);
            } else {
                traceWrite(this.txt, this);
            }
            //this.y = this.y + this.metrics.height;
        }
    };
    
    
    Text.prototype.setFont = function (fnt, size, weight) {
        if (arguments.lenght !== 0) {
            this.size = size || this.size;
            this.weight = weight || this.weight;
            this.font = fnt;
        }
        return this.weight + " " + this.size + "px " + this.font;
    };
    
    Text.prototype.setSize = function (size) {
        if (arguments.lenght !== 0) {
            this.size = size;
            this.metrics = getMetrics(this);
        }
        return this.size;
    };

    Text.prototype.setColor = function (color) {
        if (arguments.lenght !== 0) {
            this.color = color;
        }
        return WCP.ctx.fillStyle;
    };
    
    Text.prototype.setText = function (txt) {
        if (arguments.lenght !== 0) {
            this.txt = txt;
            this.metrics = getMetrics(this);
        }
        return this.txt;
    };
    
    Text.prototype.setBaseline = function (baseline) {
        if (arguments.lenght !== 0) {
            this.baseline = baseline;
        }
        return this.baseline;
    };

    WCP.Text = Text;

})(WCP, window, document);
