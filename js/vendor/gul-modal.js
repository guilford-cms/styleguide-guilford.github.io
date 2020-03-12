// Gul Modal, based on Lite Modal: https://github.com/DarylPinto/lite-modal

(function(){

    // Decrease character count with some handy aliases
    var wait = window.setTimeout;
    var qs = document.querySelector.bind(document);

    // Run callback on every element matched by selector
    function qsaEach(selector, callback) {
        [].slice.call(document.querySelectorAll(selector)).forEach(callback);
    }

    // On content load
    document.addEventListener('DOMContentLoaded', function(){

        // Create modal background
        var bg = document.createElement('div');
        bg.id = 'modal-bg';
        // bg.className = 'bg-fade';
        document.body.appendChild(bg);

        // Escape key closes modal
        document.addEventListener('keydown', function(e) {
            if(e.keyCode == 27) {
                liteModal.close();
            }
        });
    });

    // Modal open/close functions
    this.liteModal = {
        container: null,
        modal: null,
        open: function(selector){

            var _modal;

            if(!this.container){
                this.container = document.getElementById('modal-bg');
            }

            var isInWrapper = false;
            [].slice.call(this.container.getElementsByClassName('gul-modal')).forEach(function(_el) {
                if(_el.id == selector){
                    _modal = _el;
                    isInWrapper = true;
                    return;
                }
            });

            if(!isInWrapper){
                _modal = document.getElementById(selector);
                this.container.appendChild(_modal);
                var close = _modal.getElementsByClassName('close')[0];
                close.addEventListener('click', liteModal.close.bind(this), false);
            }

            this.container.classList.add('modal-on');
            _modal.classList.add('modal-on');

            if(typeof Select === 'function'){
                [].slice.call(_modal.getElementsByTagName('select')).forEach(function(_el) {
                    if (typeof _el.selectInstance === 'undefined') {
                        new Select({
                            el: _el,
                            className: 'select-theme-default'
                        })
                    }
                });
            }

            [].slice.call(_modal.getElementsByTagName('iframe')).forEach(function(iframe) {
                if (iframe) {
                    if (iframe.classList.contains('youtube')) {
                        iframe.onload = function() {
                            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                            iframe.classList.add('opened');
                        };

                        if (iframe.classList.contains('opened')) {
                            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                        }
                    }
                    if (iframe.classList.contains('vimeo')) {
                        var player = new Vimeo.Player(iframe);
                        iframe.onload = function() {
                            player.play();
                            iframe.classList.add('opened');
                        };

                        if (iframe.classList.contains('opened')) {
                            player.play();
                        }
                    }
                }
            });

            this.modal = _modal;
        },
        close: function(){
            this.modal.classList.remove('modal-on');
            this.container.classList.remove('modal-on');
            [].slice.call(this.modal.getElementsByTagName('iframe')).forEach(function(iframe) {
                if (iframe) {
                    if (iframe.classList.contains('youtube')) {
                        iframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
                    }
                    if (iframe.classList.contains('vimeo')) {
                        var player = new Vimeo.Player(iframe);

                        player.unload().then(function() {
                            console.log('unloaded');
                        }).catch(function(error) {
                            console.log('fail unloaded');
                        });
                    }
                }
            });
        }
    }
})();

