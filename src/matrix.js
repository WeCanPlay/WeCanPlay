/*
 *  WeCanPlay : Library for html5 games
 *  http://www.wecanplay.fr/
 *  WCP.scene : Vector2D operations
 *
 *  Author: Clement DEBIAUNE
 */

(function (WCP) {
    "use strict";

    function Matrix(matrix) {
        if (matrix.length < 2) {
            WCP.log('length too short');
            return (null);
        }
        for (var test = 1; test < matrix.length; test++) {
            if (matrix[0].length !== matrix[test].length) {
                WCP.log('Bad format');
                return (null);
            }
        }
        
        this.matrix = matrix;
        this.line = matrix.length;
        this.column = matrix[0].length;
        
        if (this.line === this.column) {
            this.square = this.line;
        } else {
            this.square = null;
        }
    }

    function MatrixDiagonal(elements) {
        if (elements.length < 2) {
            return (null);
        }
    
        var matrix = [];
        for (var i = 0; i < elements.length; i++) {
            matrix[i] = [];
            for (var j = 0; j < elements.length; j++) {
                matrix[i][j] = i === j ? elements[i] : 0;
            }
        }
        var m = new Matrix(matrix);
        return (m);
    }

    function MatrixIdentity(n) {
        if (n < 2) {
            return (null);
        }
        
        var elements = [];
        for (var i = 0; i < n; i++) {
            elements[i] = 1;
        }
        var m = new MatrixDiagonal(elements);
        return (m);
    }

    function MatrixRotation(angle) {
        var m = new Matrix([
                [Math.cos(angle), -Math.sin(angle)],
                [Math.sin(angle), Math.cos(angle)]
            ]);
        return m;
    }

    function MatrixRotationX(angle) {
        var m = new Matrix([
                [1, 0, 0],
                [0, Math.cos(angle), -Math.sin(angle)],
                [0, Math.sin(angle), Math.cos(angle)]
            ]);
        return m;
    }

    function MatrixRotationY(angle) {
        var m = new Matrix([
                [Math.cos(angle), 0, Math.sin(angle)],
                [0, 1, 0],
                [-Math.sin(angle), 0, Math.cos(angle)]
            ]);
        return m;
    }

    function MatrixRotationZ(angle) {
        var m = new Matrix([
                [Math.cos(angle), -Math.sin(angle), 0],
                [Math.sin(angle), Math.cos(angle), 0],
                [0, 0, 1]
            ]);
        return m;
    }

    function MatrixZero(c, l) {
        var matrix = [];
        for (var i = 0; i < c; i++) {
            matrix[i] = [];
            for (var j = 0; j < l; j++) {
                matrix[i][j] = 0;
            }
        }
        var m = new Matrix(matrix);
        return (m);
    }

    Matrix.prototype.add = function (matrix) {
        if ((this.column !== matrix.column) || (this.line !== matrix.line)) {
            return null;
        }
        
        var m = this.cpy();
        for (var y = 0; y < this.line; y++) {
            for (var x = 0; x < this.column; x++) {
                m.matrix[y][x] = m.matrix[y][x] + matrix.matrix[y][x];
            }
        }
        return m;
    };

    Matrix.prototype.at = function (line, col) {
        return (this.matrix[line][col]);
    };
    
    Matrix.prototype.cpy = function () {
        var cpyMatrix = [];
        for (var i = 0; i < this.line; i++) {
            cpyMatrix[i] = [];
            for (var j = 0; j < this.column; j++) {
                cpyMatrix[i][j] = this.at(i, j);
            }
        }

        var m = new Matrix(cpyMatrix);
        return m;
    };
    
    Matrix.prototype.determinant = function (n) {
        if (this.square === false) {
            return null;
        }
        if (arguments.length === 0) {
            n = this.column;
        }
        
        var d = 0;
        var m = new MatrixZero(3, 3);
        if (n === 2)
        {
            d = this.matrix[0][0] * this.matrix[1][1] - this.matrix[1][0] * this.matrix[0][1];
        } else {
            for (var col = 0; col < n; col++)
            {
                for (var i = 1; i < n; i++)
                {
                    var jm = 0;
                    for (var j = 0; j < n; j++)
                    {
                        if (j !== col) {
                            m.matrix[i - 1][jm] = this.matrix[i][j];
                            jm++;
                        }
                    }
                }
                
                d = d + Math.pow(-1.0, col) * this.matrix[0][col] * m.determinant(n - 1);
            }
        }

        return d;
    };

    Matrix.prototype.isSameSizeAs = function (matrix) {
        if (this.line === matrix.line && this.column === matrix.column) {
            return true;
        } else {
            return false;
        }
    };
    
    Matrix.prototype.mult = function (obj) {
        if (obj instanceof Matrix) {
            var matrix = [];
            for (var i = 0; i < this.line; i++) {
                matrix[i] = [];
                for (var jelem = 0; jelem < this.line; jelem++) {
                    var value = 0;
                    for (var j = 0; j < this.column; j++) {
                        value += this.at(i, j) * obj.at(j, jelem);
                    }
                    matrix[i][jelem] = value;
                }
            }
            
            var m = new Matrix(matrix);
            return m;
        }
    };
    
    Matrix.prototype.round = function () {
        var cpyMatrix = [];
        for (var i = 0; i < this.line; i++) {
            cpyMatrix[i] = [];
            for (var j = 0; j < this.column; j++) {
                cpyMatrix[i][j] = Math.round(this.at(i, j));
            }
        }

        var m = new Matrix(cpyMatrix);
        return m;
    };
    
    Matrix.prototype.show = function (name) {
        if (arguments.length === 1) {
            WCP.log('/-- ' + name + ' ---');
        } else {
            WCP.log('/----------');
        }
        for (var i = 0; i < this.column; i++) {
            console.log('[' + this.matrix[i].toString() + ']');
        }
        if (arguments.length === 1) {
            WCP.log('--- ' + name + ' --\\');
        } else {
            WCP.log('----------\\');
        }
    };
    
    Matrix.prototype.sub = function (matrix) {
        if ((this.column !== matrix.column) || (this.line !== matrix.line)) {
            return null;
        }
        
        var m = this.cpy();
        for (var y = 0; y < this.line; y++) {
            for (var x = 0; x < this.column; x++) {
                m.matrix[y][x] = m.matrix[y][x] - matrix.matrix[y][x];
            }
        }
        return m;
    };
    
    WCP.Matrix = Matrix;
    WCP.MatrixDiagonal = MatrixDiagonal;
    WCP.MatrixIdentity = MatrixIdentity;
    WCP.MatrixRotation = MatrixRotation;
    WCP.MatrixRotationX = MatrixRotationX;
    WCP.MatrixRotationY = MatrixRotationY;
    WCP.MatrixRotationZ = MatrixRotationZ;
    WCP.MatrixZero = MatrixZero;

})(WCP);
