/*
 *  WeCanPlay : Library for html5 games
 *  http://www.wecanplay.fr/
 *  WCP.scene : Vector2D operations
 *
 *  Author: Clement DEBIAUNE
 */

(function (WCP) {
    "use strict";

    function Vector(x, y, x2, y2) {
        if (arguments.length === 1 && typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
        } else {
            if (arguments.length === 4) {
                this.x = x2 - x;
                this.y = y2 - y;
            } else {
                this.x = x;
                this.y = y;
            }
        }
    }

    Vector.prototype.get = function () {
        return ({
            x: this.x,
            y: this.y
        });
    };


    Vector.prototype.norm = function () {
        return (Math.sqrt(this.x * this.x + this.y * this.y));
    };


    Vector.prototype.normalize = function () {
        var norm = this.norm();

        return (new Vector(this.x / norm, this.y / norm));
    };

    Vector.prototype.add = function (v) {
        return (new Vector(this.x + v.x, this.y + v.y));
    };

    Vector.prototype.sub = function (v) {
        return (new Vector(this.x - v.y, this.y - v.y));
    };

    Vector.prototype.mult = function (value) {
        return (new Vector(this.x * value, this.y * value));
    };

    Vector.prototype.dot = function (v) {
        return (this.x * v.x + this.y * v.y);
    };

    Vector.prototype.cross = function (v) {
        return (this.x * v.y + this.y * v.x);
    };

    Vector.prototype.tangent = function () {
        return (new Vector(-this.y, this.x));
    };
    
    Vector.prototype.angleTo = function (v) {
        return (Math.atan2(this.cross(v) / (this.norm() * v.norm()), this.dot(v)));
    };
    
    Vector.prototype.absoluteAngle = function () {
        return (Math.atan2(this.cross(new Vector(1, 0)), this.dot(new Vector(1, 0))));
    };

    /** static methods **/
    Vector.norm = function (x, y) {
        return (Math.sqrt(x * x + y * y));
    };

    Vector.normalize = function (x, y) {
        var norm = Vector.norm(x, y);

        return ({
            x: x / norm,
            y: y / norm
        });
    };

    Vector.add = function (x1, y1, x2, y2) {
        return ({
            x: x1 + x2,
            y: y1 + y2
        });
    };

    Vector.sub = function (x1, y1, x2, y2) {
        return ({
            x: x1 - x2,
            y: y1 - y2
        });
    };

    WCP.Vector = Vector;
})(WCP);
