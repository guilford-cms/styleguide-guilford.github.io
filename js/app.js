// Helpers
function gulHide(el) {
  el.classList.add('hidden');
}

function gulShow(el) {
  el.classList.remove('hidden');
}

function toggleClass(el, _class){
  if(el.classList.contains(_class)){
    el.classList.remove(_class);
  }else{
    el.classList.add(_class);
  }
}

function findAncestor(el, cls) {
  while ((el = el.parentElement) && !el.classList.contains(cls));
  return el;
}

function findAncestorByTag(el, tag) {
  while ((el = el.parentElement) && el.tagName != tag);
  return el;
}

function getElementIndex(currentNode){
  var index = 0;
  while ((currentNode = currentNode.previousElementSibling) != null) {
    index++;
  }
  return index;
}

function getPointerEvent(event) {
    if (event.originalEvent && event.originalEvent.targetTouches && event.originalEvent.targetTouches[0]) {
      return event.originalEvent.targetTouches[0];
    }
    return event;
};


function isRetina(){
   var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
            (min--moz-device-pixel-ratio: 1.5),\
            (-o-min-device-pixel-ratio: 3/2),\
            (min-resolution: 1.5dppx)";
    return ((window.devicePixelRatio > 1) || (window.matchMedia && window.matchMedia(mediaQuery).matches));
}

var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
var resize;

function resizedw() {
  windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}
window.addEventListener("resize", function(event) {
  windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  clearTimeout(resize);
  resize = setTimeout(resizedw, 100);
});

function isMobileLayout() {
  return (windowWidth < 1024);
}

// #### BEGIN: Detect iOS devices and set html class if detected
(function() {
  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if(iOS){
    document.documentElement.classList.add("ios-device");
  }
})();
// #### END: Detect iOs

(function() {

    function toggleButton(event){
      event.preventDefault();
      this.classList.toggle('active');
    }

    var toggleBtns = document.getElementsByClassName('btn-toggle');
    [].forEach.call(toggleBtns, function(el) {
      for (var i = el.children.length - 1; i >= 0; i--) {
        if(!el.children[i].classList.contains('btn-unbind')){
            el.children[i].addEventListener('click', toggleButton);
            el.children[i].addEventListener('touchstart', toggleButton);
        }
      }
    });
}());

// #### BEGIN: Modal

var gulModal = (function() {
    var modal = {},
        showModalButtons = document.getElementsByClassName('gul-modal-btn'),
        closeSidebarOpenModal = document.getElementById('close-sidebar-open-modal');
    modal.init = function() {
        var touchStarted = false, // detect if a touch event is sarted
            currX = 0,
            currY = 0,
            cachedX = 0,
            cachedY = 0;

        for (var i = 0; i < showModalButtons.length; i++) {
            (function(showModalButtons, i) {
                showModalButtons[i].addEventListener('click', function(event) {
                    modal.displayModal(event, showModalButtons[i].getAttribute('data-target'));
                });

                showModalButtons[i].addEventListener('touchstart', function(event) {
                    var pointer = getPointerEvent(event);
                    // caching the current x
                    cachedX = currX = pointer.pageX;
                    // caching the current y
                    cachedY = currY = pointer.pageY;
                    // a touch event is detected
                    touchStarted = true;
                    // detecting if after 200ms the finger is still in the same position
                    setTimeout(function (){
                        if ((cachedX === currX) && !touchStarted && (cachedY === currY) && isMobileLayout()) {
                            modal.displayModal(event, showModalButtons[i].getAttribute('data-target'));
                        }
                    },200);
                    if(closeSidebarOpenModal && isMobileLayout()){
                        modal.displayModal(event, showModalButtons[i].getAttribute('data-target'));
                    }
                });
            })(showModalButtons, i)
        }
    }

    if (showModalButtons) {
        modal.init();
    }

    modal.displayModal = function(event, modalContentId) {
        event.preventDefault();

        var dialog = document.getElementById(modalContentId);

        if (!dialog) {
            console.error('Modal Content #' + modalContentId + ' doesn\'t exist');
            return;
        }

        liteModal.open(modalContentId);
        this.initializeGallery(dialog);
    }

    // #### END: Modal

    // ### BEGIN: Initialize Gallery in modal

    modal.initializeGallery = function(dialog) {

        var gallery = dialog.getElementsByClassName('gul-gallery')[0];

        if (gallery != null) {

            var slider = gallery.getElementsByClassName('gallery-top')[0];
            var thumbs = gallery.getElementsByClassName('gallery-thumbs')[0];
            var nextSlide = slider.getElementsByClassName('swiper-button-next')[0];
            var prevSlide = slider.getElementsByClassName('swiper-button-prev')[0];
            var pagination = gallery.getElementsByClassName('swiper-pagination')[0];

            var description = slider.getElementsByClassName('gul-gallery-description');
            for (var i = 0; i < description.length; i++) {
                description[i].addEventListener('click', modal.showSlideDescription);
            }

            var galleryTop = new Swiper(slider, {
                nextButton: nextSlide,
                prevButton: prevSlide,
                pagination: pagination,
                paginationType: 'fraction',
                spaceBetween: 0,
                // autoplay: 5000,
                // loop: true
            });

            var galleryThumbs = new Swiper(thumbs, {
                spaceBetween: 1,
                centeredSlides: true,
                grabCursor: true,
                slidesPerView: 10,
                slideToClickedSlide: true
            });

            galleryTop.params.control = galleryThumbs;
            galleryThumbs.params.control = galleryTop;
        }
    }

    modal.showSlideDescription = function(event) {
        event.preventDefault();
        if (isMobileLayout()) {
            var parent = event.target.parentElement;
            if (parent.classList.contains('expanded')) {
                parent.classList.add('collapsed');
                parent.classList.remove('expanded');
            } else {
                parent.classList.add('expanded');
                parent.classList.remove('collapsed');
            }
        }
    }

    // ### END: Initialize Gallery in modal

    return modal;

}());

// #### END: Modal

// #### START: Gallery
(function() {
    // Get all galleries on the page
    var galleries = document.getElementsByClassName('gul-gallery-wrapper');
    if (galleries.length) {
        for (var i = 0; i < galleries.length; i++) {
            // Skip gallery initialization if it's in modal, no need for that until modal is triggered
            if (!galleries[i].parentElement.classList.contains('gul-modal-content')) {
                gulModal.initializeGallery(galleries[i]);
            }
        }
    }
})();
// #### END: Gallery

// #### START: Slider

(function() {

    var sliders = document.getElementsByClassName('gul-slider');
    for (var i = 0; i < sliders.length; i++) {
        var children = sliders[i].children[0].children[0].children;
        var parent = sliders[i];
        var navSlides = parent.getElementsByClassName('gul-slider-indicators')[0];
        if (children.length) {
            // Set default active slide
            var active = (children.length > 2) ? 1 : 0;
            children[active].classList.add('active');
            if (children[active].previousElementSibling != null) {
                children[active].previousElementSibling.classList.add('pre-active');
            }
            if (children[active].nextElementSibling != null) {
                children[active].nextElementSibling.classList.add('post-active');
            }
            navSlides.children[active].classList.add('active');

            for (var j = 0; j < children.length; j++) {
                children[j].addEventListener('click', function(event) {
                    if (event.target.tagName.toLowerCase() == 'img') {
                        event.preventDefault();
                        var index = getSlideIndex(event.target.parentElement);
                        toggleSlider(index, parent, navSlides, false);
                    }
                })
            }
            if (children.length > 1) {
                initilizePagination(parent, navSlides, active);
            } else {
                parent.getElementsByClassName('gul-slider-pagination')[0].classList.add('hidden');
            }
        }
    }

    function toggleSlider(index, parent, navSlides, isPagination) {
        var outerWrapper = parent.children[0].children[0];
        var el = (isPagination) ? outerWrapper.querySelectorAll("[data-index='" + index + "']")[0] : outerWrapper.children[index];

        if (el.classList.contains('active')) {
            return;
        }

        for (var i = 0; i < el.parentElement.children.length; i++) {
            el.parentElement.children[i].classList.remove('active', 'pre-active', 'post-active');
        }

        adjustDOM(el);

        for (var i = 0; i < navSlides.children.length; i++) {
            navSlides.children[i].classList.remove('active');
        }
        navSlides.children[el.getAttribute('data-index')].classList.add('active');
    }

    function adjustDOM(el) {
        var parent = el.parentElement;
        var newEl = parent.children[0];
        if (el == newEl) {
            newEl = parent.children[parent.children.length - 1];
            parent.removeChild(parent.children[parent.children.length - 1]);
            parent.insertBefore(newEl, el);
        } else {
            var toAppend = [];
            while ((prev = el.previousElementSibling.previousElementSibling) != null) {
                toAppend.push(prev);
                parent.removeChild(prev);
            }
            for (var i = toAppend.length - 1; i >= 0; i--) {
                parent.appendChild(toAppend[i]);
            }
        }
        setTimeout(function() {
            setActiveClasses(el);
        }, 10);
    }

    function setActiveClasses(el) {
        el.classList.add('active');
        if (el.previousElementSibling != null) {
            el.previousElementSibling.classList.add('pre-active');
        }
        if (el.nextElementSibling != null) {
            el.nextElementSibling.classList.add('post-active');
        }
    }

    // ## BEGIN: Slider Pagination Controls

    function initilizePagination(slider, navSlides, active) {
        var pagination = slider.getElementsByClassName('gul-slider-pagination')[0];
        // Controls
        var navPrev = pagination.getElementsByClassName('gul-slider-prev')[0];
        var navNext = pagination.getElementsByClassName('gul-slider-next')[0];

        navPrev.addEventListener('click', function(event) {
            event.preventDefault();
            sliderGoToIndex(slider, navSlides, -1);
        });
        navNext.addEventListener('click', function(event) {
            event.preventDefault();
            sliderGoToIndex(slider, navSlides, 1);
        });
        if (navSlides.children.length) {
            for (var i = 0; i < navSlides.children.length; i++) {
                navSlides.children[i].addEventListener('click', function(event) {
                    var index = getSlideIndex(event.target);
                    toggleSlider(index, slider, navSlides, true);
                });
            }
            navSlides.children[active].classList.add('active');
        }
    }

    // Handle Prev/Next Pagination clicks
    function sliderGoToIndex(slider, navSlides, shift) {
        var current = navSlides.getElementsByClassName('active')[0];
        var index = getSlideIndex(current);
        index += shift;
        if (index >= 0 && index < navSlides.children.length) {
            toggleSlider(index, slider, navSlides, true);
        }
    }
    // ## END: Slider Pagination Controls

})();

// #### END: Slider

function throttle(delay, fn) {
    var last, deferTimer;
    return function() {
        var context = this,
            args = arguments,
            now = +new Date;
        if (last && now < last + delay) {
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function() {
                last = now;
                fn.apply(context, args);
            }, delay);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
};

var navOffset = 0;

// BEGIN: Sticky Navigation
(function(document, window, index) {

    'use strict';
    var elSelector = '.gul-navigation',
        elClassHidden = 'gul-navigation--hidden',
        throttleTimeout = 200,
        element = document.querySelector(elSelector),
        tray = document.querySelector('.gul-tray'),
        alert = document.getElementById('gul-alert'),
        drupalToolbar = document.getElementById('toolbar-item-administration-tray'),
        breadcrumbs = document.querySelector('.gul-breadcrumbs');

    if (!element) return true;

    var dHeight = 0,
        wHeight = 0,
        wScrollCurrent = 0,
        wScrollBefore = 0,
        wScrollDiff = 0,
        collapsedAlertHeight = 40,

        hasElementClass = function(element, className) {
            return element.classList ? element.classList.contains(className) : new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
        },
        addElementClass = function(element, className) {
            element.classList ? element.classList.add(className) : element.className += ' ' + className;
        },
        removeElementClass = function(element, className) {
            element.classList ? element.classList.remove(className) : element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        };

    navOffset = element.offsetHeight;

    if(tray) {
        navOffset = navOffset + tray.offsetHeight;
    }

    window.addEventListener("resize", throttle(throttleTimeout, function() {
        navOffset = ( element.getBoundingClientRect().top + element.offsetHeight );
        element.parentElement.style.paddingTop = 0;
    }));

    window.addEventListener('scroll', throttle(throttleTimeout, function() {
        dHeight = document.body.offsetHeight;
        wHeight = window.innerHeight;
        wScrollCurrent = window.pageYOffset;
        wScrollDiff = wScrollBefore - wScrollCurrent;

        // scrolled to the very top; element sticks to the top
        if (wScrollCurrent <= navOffset) {
            if(element.classList.contains('gul-navigation-sticky')) {
                element.classList.remove('gul-navigation-sticky');
                element.parentElement.classList.remove('gul-navigation-placeholder-active');
                element.parentElement.style.paddingTop = 0;
                element.style.top = 0;
            }
            removeElementClass(element, elClassHidden);
        } else if (wScrollDiff > 0 && hasElementClass(element, elClassHidden)) { // scrolled up; element slides in
            removeElementClass(element, elClassHidden);
        }
        // scrolled down
        else if (wScrollDiff < 0) {
            if(!element.classList.contains('gul-navigation-sticky')){
                element.classList.add('no-transition');
                setTimeout(function() {
                    element.classList.remove('no-transition');
                }, 100);
                element.classList.add('gul-navigation-sticky');
                element.parentElement.classList.add('gul-navigation-placeholder-active');
                if(tray) {
                    element.parentElement.style.paddingTop = navOffset - tray.offsetHeight + 'px';
                }
                else{
                    element.parentElement.style.paddingTop = navOffset +'px';
                }
                if(drupalToolbar){
                  element.style.top = drupalToolbar.offsetHeight + 40 +'px';
                }
            }
            addElementClass(element, elClassHidden);
        }
        wScrollBefore = wScrollCurrent;
    }));

}(document, window, 0));
// END: Sticky Navigation

// BEGIN: Menu
(function() {

var nav = document.getElementById('gul-navigation');

if (nav != null) {
    var mainNav = document.getElementById('main-nav-wrapper');
    var mainNavInner = document.getElementById('main-nav-inner');

    var overlay = document.getElementById('gul-navigation-overlay');
    overlay.addEventListener("click", openMobileMenu);
    overlay.addEventListener("touchstart", openMobileMenu);

    // var mobileMenu = document.getElementById('gul-mobile-menu');
    // mobileMenu.addEventListener("click", openMobileMenu);
    // mobileMenu.addEventListener("touchstart", openMobileMenu);
}

function openMobileMenu(event) {
  event.preventDefault();
  if (isMobileLayout()) {
    overlay.classList.toggle('active');
    document.body.classList.toggle('noscroll');
  }
}

})();
// END: Menu


// BEGIN: Side Menu and on mobile/ipad open navigation in side menu
(function() {
    if(document.getElementById('cbp-spmenu-s2')) {
        var menuRight = document.getElementById('cbp-spmenu-s2'),
            closeSidebarOpenModal = document.getElementById('close-sidebar-open-modal'),
            close = document.getElementById('showRightPushClose'),
            body = document.body,
            sidebarStickyMenuItem = document.getElementsByClassName("sidebar-sticky-menu"),
            openMobileNavBtn = document.getElementsByClassName("open"),
            closeMobileNavBtn = document.getElementsByClassName("close"),
            stickySidebar = document.getElementById('sticky-sidebar'),
            outsideCloseIcon = document.getElementById('outsideCloseIcon');

        function openSidebarMenu(event) {
            event.preventDefault();

            removeActive();
            this.classList.add('active');
            document.getElementById(this.getAttribute('href').slice(1)).style.display = "block";
            body.classList.add('cbp-spmenu-push-toleft');
            menuRight.classList.add('cbp-spmenu-open');

            if(windowWidth > 1023) {
                menuRight.addEventListener("mouseleave", closeIcon);
                menuRight.addEventListener("mouseover", removeCloseIcon);

                stickySidebar.addEventListener("mouseleave", closeIcon);
                stickySidebar.addEventListener("mouseover", removeCloseIcon);
            }
        }

        function closeSidebarMenu(event) {

            event.preventDefault();

            gulHide(outsideCloseIcon);

            removeActive();
            this.classList.remove('active');
            body.classList.remove('cbp-spmenu-push-toleft');
            menuRight.classList.remove('cbp-spmenu-open');

            if(windowWidth > 1023) {
                menuRight.removeEventListener("mouseleave", closeIcon);
                menuRight.removeEventListener("mouseover", removeCloseIcon);

                stickySidebar.removeEventListener("mouseleave", closeIcon);
                stickySidebar.removeEventListener("mouseover", removeCloseIcon);
            }
        }
        function removeActive() {
            for (var i = 0; i < sidebarStickyMenuItem.length; i++) {
                if(sidebarStickyMenuItem[i].classList.contains('active')) {
                    sidebarStickyMenuItem[i].classList.remove('active');
                    var hideSidebarText = sidebarStickyMenuItem[i].getAttribute('href');
                    document.getElementById(hideSidebarText.slice(1)).style.display = "none";
                }
            }
        }

        window.addEventListener("resize", function(event) {
            if(windowWidth > 1024) {
                close.click();
            }
        });


        function closeIcon(event) {
            event.stopPropagation();

            gulShow(outsideCloseIcon);
            window.addEventListener("mousemove", moveIcon);
        }
        function removeCloseIcon(event) {
             event.stopPropagation();
             gulHide(outsideCloseIcon);
             window.removeEventListener("mousemove", moveIcon);
             outsideCloseIcon.style = "";
        }
        function moveIcon(e) {
            outsideCloseIcon.style.top = e.clientY + 'px';
            outsideCloseIcon.style.left = e.clientX  + 'px';
        }
        function clickOutsideClose(event) {
            removeCloseIcon(event);
            close.click();
        }

        outsideCloseIcon.addEventListener("click", clickOutsideClose);
        outsideCloseIcon.addEventListener("touchstart", clickOutsideClose);

        close.addEventListener("click", closeSidebarMenu);
        close.addEventListener("touchstart", closeSidebarMenu);

        if (closeSidebarOpenModal) {
            closeSidebarOpenModal.addEventListener("click", closeSidebarMenu);
            closeSidebarOpenModal.addEventListener("touchstart", closeSidebarMenu);
        }


        if(sidebarStickyMenuItem.length) {
            for (var i = 0; i < sidebarStickyMenuItem.length; i++) {
                sidebarStickyMenuItem[i].addEventListener('click', openSidebarMenu, false);
                sidebarStickyMenuItem[i].addEventListener('touchstart', openSidebarMenu, false);
            }
        }


         if(openMobileNavBtn.length) {
            for (var i = 0; i < openMobileNavBtn.length; i++) {
                openMobileNavBtn[i].addEventListener('click', openMobileNav, false);
                openMobileNavBtn[i].addEventListener('touchstart', openMobileNav, false);
            }
        }
        if(closeMobileNavBtn.length) {
            for (var i = 0; i < closeMobileNavBtn.length; i++) {
                closeMobileNavBtn[i].addEventListener('click', closeMobileNav, false);
                closeMobileNavBtn[i].addEventListener('touchstart', closeMobileNav, false);
            }
        }


        function openMobileNav(event) {
            event.preventDefault();

            var parent = this.parentNode.parentNode;
            closeActive(parent);
            parent.classList.add("active");

        }
        function closeMobileNav(event) {
            event.preventDefault();

            var parent = this.parentNode.parentNode;
            if(parent.classList.contains('active'))
                parent.classList.remove("active");
        }

        function closeActive(wrapper) {
            var items = wrapper.parentNode.children;
            for (i = 0; i < items.length; i++) {
                if(items[i].classList.contains('active')) {
                    items[i].classList.remove("active");
                }
            }
        }
    }
})();
// END: Side Menu

// #### START: Alert
(function() {

  // Get Alert Component
  var alert = document.getElementById('gul-alert');
  if(alert != null){
    var closeAlert = document.getElementById('gul-alert-close-btn');
    var alertType = document.getElementById('gul-alert-type');
    var alertContent = document.getElementById('gul-alert-content');

    var nav = document.getElementById('gul-navigation');

    // Trigger close Alert
    var triggerClose = function(){
      alert.classList.add('gul-alert-closed');
      if(nav != null){
        navOffset = nav.offsetHeight;
        if(nav.parentElement.classList.contains('gul-navigation-placeholder-active')){
          nav.parentElement.style.paddingTop = navOffset+'px';
        }
      }
    }
    // Get Alert node ID
    var alertID = alert.getAttribute('data-node');
    // If set cookie that user closed alert with that ID before, initially close it
    var isCollapsed = Cookies.get('gul-alert-'+alertID);
    if(isCollapsed){
      triggerClose();
    }

    closeAlert.addEventListener('click', function(event){
      event.preventDefault();
      event.stopPropagation();
      // When user close specific alert, set cookie so on reload that alert will start as collapsed
      Cookies.set('gul-alert-'+alertID, 1, { expires: 7 });
      triggerClose();
    });

    alert.addEventListener('mouseup', function(event){
      event.stopPropagation();
      // Only if alert is collapsed
      if(alert.classList.contains('gul-alert-closed')){
        alert.classList.remove('gul-alert-closed');
        // When user expands alert, remove cookie that says it's collapsed
        Cookies.remove('gul-alert-'+alertID);
        if(nav != null){
          navOffset = nav.offsetHeight;
          if(nav.parentElement.classList.contains('gul-navigation-placeholder-active')){
              nav.parentElement.style.paddingTop = nav.offsetHeight+'px';
          }
        }
      }
    });
  }
})();
// #### END: Alert

// #### BEGIN: Object Fit css selector polyfill for IE (mostly)
if (typeof objectFitImages == 'function') {
  objectFitImages();
}
// #### END: Object Fit css selector polyfill for IE (mostly)

// #### Start Accordian
(function() {
    var acc = document.getElementsByClassName("accordion");

    if(acc.length) {
      for (var i = 0; i < acc.length; i++) {
        acc[i].addEventListener('click', openAccordion, false);
      }
    }
    function openAccordion() {
        var panel = this.nextElementSibling;
        var parent = this.parentNode.parentNode;
        if(parent.classList.contains('active')) {
            parent.classList.remove("active");
            panel.style.maxHeight = null;
        } else {
            closeActive(parent);
            parent.classList.add("active");
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    }

    // if user resize remove active and on click recalculate height of panel
    window.addEventListener("resize", throttle(200, function() {
        recalculateAccordionHeight();
    }));

    function closeActive(wrapper) {
      var items = wrapper.parentNode.children;
      for (i = 0; i < items.length; i++) {
        if(items[i].classList.contains('active')) {
          items[i].classList.remove("active");
          var child = items[i].children[0].children[0];
          var panel = child.nextElementSibling;
          panel.style.maxHeight = null;
        }
      }
    }

    function recalculateAccordionHeight() {
      var accordion = document.getElementsByClassName('accordion-wrapper active');
      for (var i = accordion.length - 1; i >= 0; i--) {
        var panel = accordion[i].getElementsByClassName('panel');
        if(panel.length){
          panel[0].style.maxHeight = panel[0].scrollHeight + "px";
        }
      }
    }
})();
// #### End: Accordian

// BEGIN: Stack
(function() {
    var throttleTimeout = 200;
    var swiper = [];
    var stacks = document.getElementsByClassName('gul-stack-inner');

    function startSwiper(){
      for (var i = 0; i < stacks.length; i++) {
        var instance = new Swiper(stacks[i], {
          slidesPerView: 'auto',
          slideClass: 'gul-card',
          spaceBetween: 0
        });
        swiper.push(instance);
      }
    }

    function destroySwiper(){
      if(swiper && swiper.length){
        for (var i = 0; i < swiper.length; i++) {
          swiper[i].destroy(true, true);
          swiper.splice(i, 1);
        }
      }
    }

    if(stacks && stacks.length){

      startSwiper();

      window.addEventListener("resize", throttle(throttleTimeout, function() {
        if(windowWidth < 768){
            destroySwiper();
        }else if(!swiper || !swiper.length){
          startSwiper();
        }
      }));
    }
})();
// END: Stack

// BEGIN: Related Content - Isotope
(function() {

  var isActive = false,
      throttleTimeout = 200,
      iso = null,
      fitTextElements = [];

  var isoOptions = {
    itemSelector: '.gul-related-card',
    layoutMode: 'packery',
    packery: {
      gutter: 1
    },
    percentPosition: true,
    transitionDuration: throttleTimeout
  };

  var isOverflowed = function (element){
    return element.parentNode.clientHeight > (element.parentNode.parentNode.clientHeight);
  }

  var fitText = function (el) {
    el.style = "";
    while(isOverflowed(el)){
      var style = window.getComputedStyle(el, null).getPropertyValue('font-size').slice(0, -2);
      elNewFontSize = (parseInt(style) - 3) + 'px';
      el.style.fontSize = elNewFontSize;
    }
  };

  function startFitText(){
    if(!fitTextElements || !fitTextElements.length){
      fitTextElements = document.querySelectorAll(".fit-text");
    }
    for(var i=0; i<fitTextElements.length; i++){
      fitText(fitTextElements[i]);
    }
  }

  var elements = document.getElementsByClassName('gul-related-content');

  for (var i = 0; i < elements.length; i++) {
    var elem = elements[i];
    if(windowWidth >= 768){
      iso = new Isotope( elem, isoOptions);
      // iso.on( 'layoutComplete', startFitText );
      isActive = true;
    }

    setTimeout(function(){
      startFitText();
    }, throttleTimeout);

    window.addEventListener("resize", throttle(throttleTimeout, function() {
      startFitText();
      if(windowWidth < 768 && isActive){
        iso.destroy()
        isActive = false;
      }else if(windowWidth >= 768 && !isActive){
        iso = new Isotope( elem, isoOptions);
        // iso.on( 'layoutComplete', startFitText );
        isActive = true;
      }
    }));
  }
})();
// END: Related Content - Isotope

// BEGIN: Google Map
(function() {

    var maps = document.getElementsByClassName('gul-map');
    // maps[0].innerHTML = "<iframe width='425' height='350' frameborder='0' scrolling='no' marginheight='0' marginwidth='0' src='https://maps.google.com/maps?&amp;q="+ encodeURIComponent( maps[0].getAttribute('data-address') ) +"&amp;output=embed'></iframe>";

    for (var i = maps.length - 1; i >= 0; i--) {
      var location = {
        lat: parseInt(maps[i].getAttribute('data-lat')),
        lng: parseInt(maps[i].getAttribute('data-lng'))
      };

      var map = new google.maps.Map(maps[i], {
        zoom: 14,
        center: location
      });

      var marker = new google.maps.Marker({
        position: location,
        map: map
      });
    }
})();
// END: Google map

// BEGIN: Secondary Navigation
(function(){
  var secondaryNav = document.getElementById('gul-secondary-nav'),
      showSecondaryNav = document.getElementById('gul-show-secondary-nav'),
    //  secondaryNavOverlay = document.getElementById('gul-secondary-nav-overlay'),
      itemsWrapper = document.getElementById('gul-secondary-nav-items');

  function toggleNavClasses(event){
    if(event){
      event.preventDefault();
    }
    toggleClass(secondaryNav, 'cbp-spmenu-open');
    //toggleClass(secondaryNavOverlay, 'active');
  }

  if(secondaryNav != null){
    showSecondaryNav.addEventListener("click", toggleNavClasses);
    showSecondaryNav.addEventListener("touchstart", toggleNavClasses);

    if(windowWidth >= 768){
      toggleNavClasses.call(showSecondaryNav);
    }

    // secondaryNavOverlay.addEventListener("click", function(){
    //   if(this.classList.contains('active')){
    //     toggleNavClasses.call(secondaryNavOverlay);
    //   }
    // });
    // secondaryNavOverlay.addEventListener("touchstart", function(){
    //   if(this.classList.contains('active')){
    //     toggleNavClasses.call(secondaryNavOverlay);
    //   }
    // });

    function expandMenu(){
        var liTag = this.parentNode.parentNode;
      if(liTag.children.length > 1) {
          if (liTag.classList == "active") {
              liTag.classList.remove('active');
          }
          else {
              for (var i = liTag.parentNode.children.length - 1; i >= 0; i--) {
                  var item = liTag.parentNode.children[i];
                  if (item.classList.contains('active')) {
                      item.classList.remove('active');
                  }
              }
              liTag.classList.add('active');
          }
      }
    }

    var items = itemsWrapper.getElementsByTagName('span');

    var hasActive = false;
    if(items && items.length){
      for (var i = items.length - 1; i >= 0; i--) {
        if(items[i].parentNode.parentNode.classList.contains('active')){
          hasActive = true;
        }
        items[i].addEventListener('click', expandMenu);
      }
    }

    if(!hasActive && items[0]){
      items[0].children[0].classList.add('active');
    }

    var isInitialLoad = true;
    window.addEventListener('scroll', throttle(300, function() {
      if (secondaryNav.classList.contains('cbp-spmenu-open') && isInitialLoad) {
        isInitialLoad = false;
        toggleNavClasses.call(showSecondaryNav);
      }
    }));
  }
})();
// END: Secondary Navigation

// START: Sharing
(function(){
  var share = document.getElementById('gul-sharing');
  if(share != null){
    var button = share.getElementsByClassName('bonfire-share-activate-button')[0],
      wrapper = share.getElementsByClassName('social-share-wrapper')[0],
      tooltip = share.getElementsByClassName('bonfire-share-tooltip')[0],
      items = wrapper.getElementsByTagName('A');

    button.addEventListener('click', shareButtonInteract);
    button.addEventListener('touchstart', shareButtonInteract);

    button.addEventListener('mouseover', shareButtonMouseOver);
    button.addEventListener('mouseout', shareButtonMouseOut);

    for (var i = 0; i < items.length; i++) {
        items[i].addEventListener('click', shareButtonInteract);
        items[i].addEventListener('touchstart', shareButtonInteract);
    }
  }

  function shareButtonInteract(event){
    // event.preventDefault();

    if(wrapper.classList.contains("social-share-wrapper-active")){
      /* hide share buttons */
      wrapper.classList.remove("social-share-wrapper-active");
      /* remove shadow */
      wrapper.classList.remove("social-share-wrapper-shadow");
      /* hide tooltip */
      tooltip.classList.remove("bonfire-share-tooltip-active");
      /* hide menu button active colors */
      button.classList.remove("bonfire-share-activate-button-active");
      button.classList.toggle("bonfire-share-activate-button-hover");
      button.classList.remove("bonfire-share-activate-button-hover-touch");
    } else {
      /* show share buttons */
      wrapper.classList.add("social-share-wrapper-active");
      /* show shadow */
      setTimeout(function(){
        wrapper.classList.add("social-share-wrapper-shadow");
      },150);
      /* show tooltip */
      tooltip.classList.add("bonfire-share-tooltip-active");
      /* show menu button active colors */
      button.classList.add("bonfire-share-activate-button-active");
      button.classList.toggle("bonfire-share-activate-button-hover");
      button.classList.remove("bonfire-share-activate-button-hover-touch");
    }
  }

  function shareButtonMouseOver(){
    this.classList.add("bonfire-share-activate-button-hover-touch");
  }

  function shareButtonMouseOut(){
    this.classList.remove("bonfire-share-activate-button-hover-touch");
  }
})();
// END: Sharing

// START: Drupal Contextual Menu
(function(){
  var showPageMenu = document.getElementById('show-page-menu');
  var contextualMenu = document.getElementById('gul-contextual-menu');

  if(showPageMenu != null && contextualMenu != null){
    showPageMenu.addEventListener('click', toggleContextualMenu);
    showPageMenu.addEventListener('touchstart', toggleContextualMenu);
  }

  function toggleContextualMenu(event){
    event.preventDefault();
    this.classList.toggle('active');
    contextualMenu.classList.toggle('gul-hidden');
  }
})();
// END: Drupal Contextual Menu

// START: Calendar
(function(){
    var filters = [];
    var hasActive = false;
    var calendar = document.getElementById('gul-calendar');
    if(calendar != null){
        var filterToggle = calendar.getElementsByClassName('calendar-toggle');
        var viewAllBtn = calendar.getElementsByClassName('btn-unbind')[0];
        for (var i = 0; i < filterToggle.length; i++) {
            filterToggle[i].addEventListener('click', toggleCalendarFilter);
            filterToggle[i].addEventListener('touchstart', toggleCalendarFilter);
            if(filterToggle[i].classList.contains('active')){
                filters.push(filterToggle[i].getAttribute('data-id'));
                hasActive = true;
            }
        }
        if(hasActive){
            viewAllBtn.classList.remove('active');
        }
        viewAllBtn.addEventListener('click', viewAllFilter);
        viewAllBtn.addEventListener('touchstart', viewAllFilter);
    }
    // Filters
    function viewAllFilter(){
        filters = [];
        if(this.classList.contains('active')){
            return;
        }
        this.classList.add('active');
        for (var i = 0; i < filterToggle.length; i++) {
            if(filterToggle[i].classList.contains('active')){
                filterToggle[i].classList.remove('active')
            }
        }
        queryEvents();
    }

    function toggleCalendarFilter(){
        var id = this.getAttribute('data-id');
        if(this.classList.contains('active')){
            if(id > 0){
                filters.push(id);
            }
        }else {
            var index = filters.indexOf(id);
            if(index > -1) {
                filters.splice(index, 1);
            }
        }

        if(!filters.length){
            viewAllBtn.classList.add('active');
        }else {
            if(viewAllBtn.classList.contains('active')){
                viewAllBtn.classList.remove('active');
            }
        }

        queryEvents();
    }
    // Filters

    // Date
        // var dateElement = calendar.getElementsByClassName('calendar-picker')[0],
        //     datePicker = dateElement.selectInstance;
    // Date

    function queryEvents(){
        console.log(filters);
    }
})();
// END: Calendar


function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this,
            args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    };
}

// BEGIN: Search Page triggering on submit because of url and facet/filters
(function($) {
  $('#views-exposed-form-acquia-search-page').submit(function() {
    $(this).submit();
  });

  $('#edit-submit-acquia-search').on('click touchstart', function() {
    $('#views-exposed-form-acquia-search-page').submit();
  });
})(jQuery);
// END: Search Page

// BEGIN: Search Bar
(function() {
    var searchApiUrl = '/api/search';

    var nav = document.getElementById('gul-navigation');

    if (nav != null) {

        var search = document.getElementById('gul-search'),
            searchBtn = document.getElementById('gul-search-btn'),
            searchResultsWrapper = document.getElementById("gul-live-search"),
            searchViewAll = document.getElementById('gul-search-all'),
            formId = document.getElementById('gul-search-form');

            gulHide(searchResultsWrapper);

            searchBtn.addEventListener("click",  debounce(function () {
                doSearch(search.value);
            }, 500));
            searchBtn.addEventListener("touchstart",  debounce(function () {
                doSearch(search.value);
            }, 500));

            if(formId) {
                formId.addEventListener("submit",  function(event) {
                    event.preventDefault();
                    setTimeout(function (){
                        doSearch(search.value);
                    }, 500);
                });
            }
    }

    function loadSearchResults() {
        if (search.value) {
            var searchResults = document.getElementById("gul-live-search-results");
            var spinnerHtml = '<div class="gul-loading-spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>';

            searchResults.innerHTML = spinnerHtml;
            searchApiUrlWithKeys = searchApiUrl + "?keys=" + search.value;

            var xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function () {
                var searchResultsHtml = '';

                if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                    if (xmlhttp.status === 200) {
                        var responseJson = JSON.parse(xmlhttp.responseText);
                        var additionalClasses = '';

                        if (responseJson.length) {
                            for (var i = 0; i < responseJson.length; i++) {
                                additionalClasses = (i >= 3 ? 'gul-hidden gul-show-gt-sm' : '');

                                searchResultsHtml += '<div class="gul-search-result-item ' + additionalClasses + '">\n';
                                searchResultsHtml += responseJson[i].item + '\n';
                                searchResultsHtml += '</div>\n';
                            }
                        } else {
                            searchResultsHtml = '<p>No results.</p>';
                        }

                        searchResults.innerHTML = searchResultsHtml;
                    } else if (xmlhttp.status === 400) {
                        console.error('Error', xmlhttp.statusText);
                    } else {
                        console.error('Error:', xmlhttp.statusText);
                    }
                }
            };

            if (searchApiUrl === '/api/search.json') {
                setTimeout(function () {
                    xmlhttp.open("GET", searchApiUrlWithKeys, true);
                    xmlhttp.send();
                }, 500);
            } else {
                xmlhttp.open("GET", searchApiUrlWithKeys, true);
                xmlhttp.send();
            }
        }
    }

    function doSearch(search) {
        if (!search) {
            gulHide(searchResultsWrapper);
        } else {
            var searchHref = searchViewAll.href.replace(/(keys=)[^\&]+/, '$1' + search);
            searchViewAll.href = searchHref;
            gulShow(searchResultsWrapper);
            loadSearchResults();
        }
    }
})();
// END: Search Bar


//START TIPS
(function($){

    var tooltips = document.getElementsByClassName("gul-tips");
    if(tooltips.length) {
        for (var i = 0; i < tooltips.length; i++) {
            tooltips[i].addEventListener('click', openToolTip, false);
            tooltips[i].addEventListener('touchstart', openToolTip, false);
        }

        $('.tooltip').tooltipster({
            multiple: true,
            contentAsHTML: true,
            contentCloning: true,
            repositionOnScroll: true,
            trigger: 'click',
            interactive: true,
            minIntersection: 50,
            distance: 17,
            minWidth: 300,
            animation: 'grow',
            side: ['top', 'bottom', 'left', 'right'],
            functionBefore:function(instance, helper) {
                instance.content($(helper.origin).parent().first().find('.content'));
                $(helper.origin).addClass('open');
            },
            functionAfter:function(instance, helper) {
                $(helper.origin).removeClass('open');
            }
        });
    }

    function openToolTip (e) {
        e.stopPropagation();
        e.preventDefault();
    }

})(jQuery);

// BEGIN: Login/Cas Login
(function() {

    var casLink = document.getElementById('cas-link');
    var uncasLink = document.getElementById('uncas-link');

    var casLoginFields = document.querySelectorAll('.cas-login');
    var classicLoginFields = document.querySelectorAll('.classic-login');
if(casLink) {
    casLink.addEventListener("click", casLogin);
    casLink.addEventListener("touchstart", casLogin);
}

if(uncasLink) {
    uncasLink.addEventListener("click", classicLogin);
    uncasLink.addEventListener("touchstart", classicLogin);
}


    function casLogin(e) {
        e.preventDefault();
        for (var i = 0; i < casLoginFields.length; i++) {
            casLoginFields[i].classList.remove('gul-hidden');
        }
        for (var i = 0; i < classicLoginFields.length; i++) {
            classicLoginFields[i].classList.add('gul-hidden');
        }
        casLink.classList.add('gul-hidden');
        uncasLink.classList.remove('gul-hidden');
    }
    function classicLogin(e) {
        e.preventDefault();
        for (var i = 0; i < casLoginFields.length; i++) {
            casLoginFields[i].classList.add('gul-hidden');
        }
        for (var i = 0; i < classicLoginFields.length; i++) {
            classicLoginFields[i].classList.remove('gul-hidden');
        }
        casLink.classList.remove('gul-hidden');
        uncasLink.classList.add('gul-hidden');
    }
})();

(function($) {
    if($('form')) {
        $('form').each(function (index, _el) {

            var formId = $(_el).attr('id');
            if(formId){
                $('#'+ formId).validate({
                        onfocusin: function(element) { $(element).valid(); },
                        onfocusout: function(element) { $(element).valid(); },
                        errorPlacement: $.noop,
                        ignore: ":hidden:not('select'), .ignore",
                        highlight: function(element, errorClass) {
                            console.log(element);
                            if ($(element).attr('type') == 'radio') {
                                $(element).closest("fieldset").addClass(errorClass);
                            }
                            else if ($(element).attr('type') == 'checkbox') {
                                $(element).closest("fieldset").addClass(errorClass);
                            }
                            else {
                                $(element).addClass(errorClass);
                                if ($(element).hasClass('form-select')) {
                                    $(element).parent().find('.select-theme-default').addClass(errorClass);

                                }
                            }
                        },
                        unhighlight: function(element, errorClass) {
                            console.log(element);
                            if ($(element).attr('type') == 'radio') {
                                $(element).closest("fieldset").removeClass(errorClass);
                            }
                            else if ($(element).attr('type') == 'checkbox') {
                                $(element).closest("fieldset").removeClass(errorClass);
                            }
                            else {
                                $(element).removeClass(errorClass);

                                if ($(element).hasClass('form-select')){
                                    $(element).parent().find('.select-theme-default').removeClass(errorClass);
                                }
                            }
                        }
                    }
                );

                $('fieldset.required').each(function() {
                    $(this).find('input[type="checkbox"]').each(function(){
                        var newName = $(this).attr('name').substring(0 , $(this).attr('name').indexOf('['));
                        $(this).attr('name', newName + '[]');
                    });
                    $(this).find('.form-item:first-child input[type="checkbox"]').addClass('required');
                });
            }
        });
    }
})(jQuery);
