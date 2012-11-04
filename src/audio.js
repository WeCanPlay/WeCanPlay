/*
 *  WeCanPlay : Library for html5 games
 *  http://www.wecanplay.fr/
 *  WCP.sound : sound manager
 *
 *  @author: Thomas FLORELLI
 */

(function (WCP) {
    "use strict";
    
    /**
    * Class SoundEntity
    * Provides some facilities to manipulate an Audio type
    * @param audio, can be the source of the audio file or an Audio object
    * @param params (optional), some parameters for the Audio object
    *
    */
    
    function SoundEntity(audio, params) {
        this.sound = audio;
        this.sound.volume = 0.5;
        this.param(params);
    }


    SoundEntity.prototype.param = function (params) {
        var i;
        for (i in params) {
            if (i === 'volume') {
                this.sound[i] = params[i] / 100;
            } else {
                this.sound[i] = params[i];
            }
        }
    };

    /**
    * Uses Audio.play()
    * No effect if the sound is already playing
    */

    SoundEntity.prototype.play = function () {
        this.sound.play();
    };

    /**
    * Uses Audio.pause()
    * No effect if the sound is already paused
    */
    SoundEntity.prototype.pause = function () {
        this.sound.pause();
    };

    /**
    * Uses Audio.plaused
    * @returns true if the sound is paused
    */
    SoundEntity.prototype.paused = function () {
        return this.sound.paused || this.sound.currentTime === 0 || this.sound.currentTime === this.sound.duration;
    };

    /**
    * Calls play() if paused
    * Calls pause() if playing()
    */
    SoundEntity.prototype.togglePlay = function () {
        if (this.sound.paused || this.sound.currentTime === 0) {
            this.sound.play();
        } else {
            this.sound.pause();
        }
    };

    /**
    * Uses Audio.muted
    * When Audio.muted is set to true, mutes the sound.
    */
    SoundEntity.prototype.mute = function () {
        this.sound.muted = true;
    };

    /**
    * Unmutes the sound
    * @see mute()
    */
    SoundEntity.prototype.unmute = function () {
        this.sound.muted = false;
    };

    /**
    * Unmutes if muted
    * Mutes if not muted
    */
    SoundEntity.prototype.toggleMute = function () {
        if (!this.sound.muted) {
            this.mute();
        } else {
            this.unmute();
        }
    };

    /**
    * Returns the state of the sound (muted or not muted)
    * @returns true if muted
    */
    SoundEntity.prototype.muted = function () {
        return this.sound.muted;
    };


    /**
    * Set the volume to vol
    * @param vol, the new volume to set
    * If no param given, returns the actual volume
    * @returns the sound's volume
    */
    SoundEntity.prototype.volume = function (vol) {
        if (vol) {
            if (vol > 100) {
                vol = 100;
            }
            if (vol < 0) {
                vol = 0;
            }
            this.sound.volume = vol / 100;
        }
        return this.sound.volume * 100;
    };

    /**
    * Returns the sounds duration
    * @return Audio.duration
    */
    SoundEntity.prototype.duration = function (dur) {
        return this.sound.duration;
    };

    /**
    * If no time given, returns the currentTime
    * Else, set the currentTime to t and returns the new currentTime
    * @param t, the new time to be set
    * @return Audio.currentTime
    */
    SoundEntity.prototype.time = function (t) {
        if (t >= 0) {
            this.sound.currentTime = t;
        }
        return this.sound.currentTime;
    };

    /**
    * Moves back by seconds second in the sound
    * @param seconds, if not given, moves by 1 second
    */
    SoundEntity.prototype.rearward = function (seconds) {
        this.sound.currentTime -= seconds || 1;
        if (this.sound.currentTime <= 0) {
            this.sound.currentTime = 0;
            this.sound.play();
        }
    };

    /**
    * Moves toward by seconds second in the sound
    * @param seconds, if not given, moves by 1 second
    */
    SoundEntity.prototype.forward = function (seconds) {
        this.sound.currentTime += seconds || 1;
    };




    /** @Prototype
    * Channel
    * Multiple identical sounds management
    * Use it for a short sound that you may play multi times simultaneously (exemple : laser firing)
    * USE : call Channel.play() whenever you want to play the sound, a new clone will be created automatically
    * @param : uses SoundEntity
    */
    function Channel(audio, params) {
        this.sounds = [];
        this.audio = audio;
        this.params = params;
        this.sounds.push(new SoundEntity(audio, params));
        this.clonable = false;
        this.setLimit(10);
    }


    Channel.prototype.setLimit = function (limit) {
        this.limit = limit;
        while (this.sounds.length < this.limit) {
            this.clone();
        }
    };

    Channel.prototype.getNew = function () {
        if (this.audio.src) {
            return new SoundEntity(this.audio.src, this.params);
        } else {
            return false;
        }
    };

    /**
    * Clones the original sound and push it to the array IF the sound is ready
    */
    Channel.prototype.clone = function () {
        this.sounds.push(this.getNew());
    };

    /**
    * Creates a new clone and plays it
    */
    Channel.prototype.play = function () {
        var i;
        for (i = 0; i < this.sounds.length - 1;   i++) {
            if (this.sounds[i].time() === this.sounds[i].duration()) {
                this.sounds[i].time(0);
            }
            if (this.sounds[i].paused()) {
                this.sounds[i].play();
                return;
            }
        }
    };

    Channel.prototype.pause = function () {
    };

    /**
    * Sound manager
    * Allows to load, store and manage sounds.
    */

    function SoundManager() {
        this.sounds = [];
        this.testFormats();
    }

    /**
    * Creates and stores a sound
    * @param audio, Audio file or src of the sound file
    * @param params (optional), parameters for the Audio file
    *         fill params.id to give and id to the sound so that you can find it again.
    *         if no id given, the sound can be found by its source location.
    */

    SoundManager.prototype.sound = function (audio, params) {
        var snd = new SoundEntity(audio, params);
        if (params && params.id) {
            this.sounds[params.id] = snd;
        } else if (snd.src) {
            this.sounds[snd.src] = snd;
        }
        return snd;
    };


    SoundManager.prototype.channel = function (audio, params) {
        var chan = new Channel(audio, params);
        if (params.id) {
            this.sounds[params.id] = chan;
        } else if (chan.src) {
            this.sounds[chan.src] = chan;
        }
        return chan;
    };

    SoundManager.prototype.availableFormats = function () {
    };

    /**
    * Returns the element of the array sounds correpsonding to the key given in argument
    * @params id, the key of the wanted element
    */

    SoundManager.prototype.get = function (id) {
        var i;
        for (i in this.sounds) {
            if (i === id) {
                return (this.sounds[i]);
            }
        }
    };
    
    SoundManager.prototype.play = function(audio) {
        var snd = new SoundEntity(audio, params);
        snd.play();
        return snd;
    }

    SoundManager.prototype.shutDown = function () {
        var i;
        for (i in this.sounds) {
            this.sounds[i].pause();
        }
    };

    SoundManager.prototype.testFormats = function () {
        var audio = document.createElement("audio");
        if (typeof audio.canPlayType === "function") {
            this.mp3 = (audio.canPlayType("audio/mpeg") !== "");
            this.ogg = (audio.canPlayType('audio/ogg; codecs="vorbis"') !== "");
            this.mp4 = (audio.canPlayType('audio/mp4; codecs="mp4a.40.5"') !== "");
        }
    };
    
    WCP.SoundManager = SoundManager;
}) (WCP);

