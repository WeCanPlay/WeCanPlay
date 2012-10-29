/*
 *  WeCanPlay : Library for html5 games
 *  http://www.wecanplay.fr/
 *  WCP.asset : load assets
 *
 *  Author: Pierrick PAUL
 */

(function (WCP) {
    'use strict';

    /**
    * AssetManager handle images and sound.
    */
    function AssetManager() {
        this._assetsCollection = [];
        this._assetPath = '';
        this._progressInterval = 100;
    }

    /**
    * Private method for loading music
    */
    function _loadMusic(asset) {
        var test = new Audio();
        for (var j = 0; j < asset.path.length; j++) {
            var type = asset.path[j].match(/\.[0-9a-z]+$/);
            if (type.length) {
                type = type[0];
                var mime = (type === '.mp3') ? 'audio/mp3' : (type === '.ogg') ? 'audio/mp3' : undefined;
                if (mime) {
                    if (test.canPlayType(mime) !== "") {
                        var a  = new Audio();
                        a.src = asset.path[j];
                        a.preload = 'auto';
                        asset.status = 1;
                        a.addEventListener("canplaythrough", (function (asset) {
                                return function () {
                                    asset.status = 2;
                                };
                            })(asset)
                        );
                        a.addEventListener('readystatechange', (function (asset) {
                                return function () {
                                    console.log("!! je sais pas quand survient cette evenement cette asset est chargé", asset.id);
                                    asset.status = 2;
                                };
                            })(asset)
                        );
                        a.addEventListener('error', (function (asset) {
                                return function () {
                                    asset.status = 3;
                                };
                            })(asset)
                        );
                        asset.asset = a;
                        break;
                    }
                } else {
                    console.error('Extension not compatible');
                }
            }
        }
    }

    /**
    * Private method for loading images
    */
    function _loadImage(asset) {
        var type = asset.path.match(/\.[0-9a-z]+$/);
        if (type.length) {
            type = type[0];
            if (type === '.jpg' || type === '.png' || type === '.gif') {
                var a = new Image();
                a.src = asset.path;
                asset.status = 1;
                a.addEventListener('load', (function (asset) {
                        return function () {
                            asset.status = 2;
                        };
                    })(asset)
                );
                a.addEventListener('readystatechange', (function (asset) {
                        return function () {
                            console.log("!! je sais pas quand survient cette evenement cette asset est chargé", asset.id);
                            asset.status = 2;
                        };
                    })(asset)
                );
                a.addEventListener('error', (function (asset) {
                        return function () {
                            asset.status = 3;
                        };
                    })(asset)
                );
                asset.asset = a;
            }  else {
                console.error('Extension not compatible', asset);
            }
        }
    }

    /**
    * Add an asset to the collection
    */
    AssetManager.prototype.add = function () {
        var self = this;
        var arg = arguments.length;

        if (arg === 1 && typeof arguments[0] === 'object') {
            var assets = arguments[0];
            var group = assets.group || null;
            var path = assets.path || "";
            for (var i in assets.assets) {
                if (Array.isArray(assets.assets[i])) {
                    for (var j = 0; j < assets.assets[i].length; j++) {
                        assets.assets[i][j] = path + assets.assets[i][j];
                    }
                    if (group) {
                        this.add(group, i, assets.assets[i]);
                    } else {
                        this.add(i, assets.assets[i]);
                    }
                } else {
                    if (group) {
                        this.add(group, i, path + assets.assets[i]);
                    } else {
                        this.add(i, path + assets.assets[i]);
                    }
                }
            }
        } else if (arg === 2) {
            this.add(null, arguments[0], arguments[1]);
        } else if (arg === 3) {
            var p;
            if (Array.isArray(arguments[2])) {
                p = [];
                arguments[2].forEach(function (a) {
                    p.push(self._assetPath + a);
                });
            } else {
                p = self._assetPath + arguments[2];
            }
            this._assetsCollection.push({
                id: arguments[1],
                group: arguments[0],
                status: 0,
                path: p
            });
        }
    };

    AssetManager.prototype.load = function (group, progressCb, completeCb) {
        var self = this;

        if (arguments.length === 2) {
            completeCb = progressCb;
            progressCb = group;
            group = '*';
        }
        for (var i = 0; i < this._assetsCollection.length; i++) {
            var asset = this._assetsCollection[i];
            if ((asset.group === group) || (group === 'all' || group === '*')) {
                if (Array.isArray(asset.path)) {
                    _loadMusic(asset);
                } else {
                    _loadImage(asset);
                }
            }
        }

        var loadingloop = setInterval(function () {
            function _getStatus(group) {
                var loaded = 0,
                loading = 0,
                error = 0;

                for (var i = 0; i < self._assetsCollection.length; i++) {
                    var asset = self._assetsCollection[i];
                    if ((asset.group === group) || (group === 'all' || group === '*')) {
                        if (self._assetsCollection[i].status === 2) {
                            loaded++;
                        } else if (self._assetsCollection[i].status === 3) {
                            error++;
                        } else if (self._assetsCollection[i].status === 1) {
                            loading++;
                        }
                    }
                }
                return {
                    loaded: loaded,
                    loading: loading,
                    error: error,
                    total: loaded + loading + error
                };
            }
            
            var status = _getStatus(group);
            if (progressCb) {
                progressCb(group, status.total, status.loaded, status.error);
            }

            if ((status.loaded + status.error) === self.size(group)) {
                clearInterval(loadingloop);
                completeCb(group, status.total, status.loaded, status.error);
            }
        }, self._progressInterval);
    };

    /**
    * Return the HTML element depended of assetName
    * @param assetName the Asset's  id
    */
    AssetManager.prototype.get = function (assetName) {
        for (var i = 0; i < this._assetsCollection.length; i++) {
            if (this._assetsCollection[i].id === assetName) {
                return this._assetsCollection[i].asset;
            }
        }
    };

    /**
    * Set a global path for asset
    * and return it
    * @param path (optional)
    */
    AssetManager.prototype.path = function (path) {
        return (this._assetPath = (path !== undefined) ? path : "");
    };

    /**
    * Return the number of assets of all manager or just one group
    * @param group (optional) the group name
    */
    AssetManager.prototype.size = function (group) {
        if (group !== undefined && group !== 'all' && group !== '*') {
            var l = 0;
            for (var i = 0; i < this._assetsCollection.length; i++) {
                if (this._assetsCollection[i].group === group) {
                    l++;
                }
            }
            return l;
        } else {
            return (this._assetsCollection.length);
        }
    };

    /**
    * Initialize AssetManager under WCP.Assets
    */
    WCP.Assets = new AssetManager();

})(WCP);