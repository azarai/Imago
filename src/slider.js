/*
 *  Copyright 2009 by Jens Boje
 *  Name    : Simple sidebar
 *  Version : 0.1pre
 *  Author  : Jens Boje (azarai@codeboje.de)
 *  URL		: http://codeboje.de
 *  Terms of Use:  BSD
 */
var isExtended = 0;
var height = 450;
var width = 0;
var slideDuration = 1000;
var opacityDuration = 1500;
var defaultLeft = 0;
var defaultOpacity = 0;

function extendContract(){
    if (isExtended == 0) {
        $('sideBarTab').removeClass('sideBarTabClosed');
        $('sideBarTab').addClass('sideBarTabOpen');
        sideBarSlide(0, height, defaultLeft, width);
        sideBarOpacity(defaultOpacity, 1);
        isExtended = 1;
    }
    else {
        $('sideBarTab').removeClass('sideBarTabOpen');
        $('sideBarTab').addClass('sideBarTabClosed');
        
        sideBarSlide(height, 0, width, defaultLeft);
        sideBarOpacity(1, defaultOpacity);
        isExtended = 0;
    }
}

function sideBarSlide(fromHeight, toHeight, fromWidth, toWidth){
    var myEffects = new Fx.Morph('sideBarMenu', {
        duration: slideDuration,
        transition: Fx.Transitions.linear
    });
    myEffects.start({
        'left': [fromWidth, toWidth]
    });
}

function sideBarOpacity(from, to){
    var myEffects = new Fx.Morph('sideBarContent', {
        duration: opacityDuration,
        transition: Fx.Transitions.linear
    });
    myEffects.start({
        'opacity': [from, to]
    });
}

function init(){
    defaultWidth = $('sideBarMenu').getSize().x;
    $('sideBarMenu').setStyle('left', "-" + defaultWidth + "px");
    defaultLeft = $('sideBarMenu').getStyle('left');
    defaultOpacity = $('sideBarContent').getStyle('opacity');
    $('sideBarTab').addEvent('click', function(){
        extendContract()
    });
}

window.addEvent('imagoReady', function(){
    $('sideBarContent').style.display = 'block';
    init();
});
