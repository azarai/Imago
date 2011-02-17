/*
 *  Copyright 2006 - 2011 by Jens Boje
 *  Name    : Imago 
 *  Version : 0.9
 *  Author  : Jens Boje (azarai@codeboje.de)
              http://codeboje.de/contact/
	License:
			The Imago code is available under the AGPL or a Commercial license (Contact author)
*/

var GalleryImage = new Class({
    initialize: function(fileName, title, thumbURL, imageURL){
        this.fileName = fileName;
        this.title = title;
        this.thumbURL = thumbURL;
        this.imageURL = imageURL;
    },
    getFileName: function(){
        return this.fileName;
    },
    getTitle: function(){
        return this.title;
    },
    getID: function(){
        return 'id_' + this.getFileName();
    },
    getThumbURL: function(){
        return this.thumbURL;
    },
    getImageURL: function(){
        return this.imageURL;
    }
});

var Gallery = new Class({
    initialize: function(){
        this.prefetching = null;
        this.thumbnailColumns = "3";
        this.thumbnailRows = "3";
        this.images = new Array();
        
        this.lastThumbImageIndex = 0;
        this.lastThumbsOnCurrentPage = 0;
        this.thumbsPerPage = this.thumbnailRows * this.thumbnailColumns;
        this.title = '';
        this.indexCurrentImage = 0;
        this.debug = false;
    },
    addImage: function(img){
        var counter = 0;
        if (this.images.length != 0) {
            counter = this.images.length;
        }
        this.images[counter] = img;
    },
    getThumbImage: function(index){
        if (this.images != null && this.images.length != 0 && index <= this.images.length) {
            if (this.images[index] != null) {
                var img = new Element("img");
                img.setProperty('src', this.images[index].getThumbURL());
                img.addClass('imago_thumbImg');
                img.setProperty('alt', this.images[index].getTitle());
                img.setProperty('id', this.images[index].getID());
                img.onclick = this.switchImage.bind(this.images[index]);
                return img;
            }
        }
        return null;
    },
    getCurrentThumbTable: function(){
        var thumbTable = new Element("table");
        var thumbTableBody = new Element("TBODY");
        
        thumbTable.setProperty('id', 'imagoCurrentThumbTable');
        var counter = this.lastThumbImageIndex;
        if (this.lastThumbImageIndex == 0) {
            ElementHelper.hide('imagoMenuPrevLink');
        }
        else {
            ElementHelper.show('imagoMenuPrevLink');
        }
        this.lastThumbsOnCurrentPage = 0;
        for (i = 0; i < this.thumbnailRows; i++) {
            var tr = new Element("tr");
            for (j = 0; j < this.thumbnailColumns; j++) {
                var td = new Element("td");
                if (this.getThumbImage(counter) != null) {
                    td.appendChild(this.getThumbImage(counter));
                    counter++;
                    this.lastThumbsOnCurrentPage++;
                    if (this.images.length > this.thumbsPerPage) {
                        ElementHelper.show('imagoMenuNextLink');
                    }
                }
                else {
                    ElementHelper.hide('imagoMenuNextLink');
                }
                tr.appendChild(td);
            }
            thumbTableBody.appendChild(tr);
        }
        thumbTable.appendChild(thumbTableBody);
        this.lastThumbImageIndex = counter;
        return thumbTable;
    },
    thumbMenuNext: function(){
        if (this.images.length > this.lastThumbImageIndex) {
            $('imagoCurrentThumbTable').dispose();
            var table = this.getCurrentThumbTable();
            table.injectAfter('imagoGalleryTitle');
			
			selected = $(this.getCurrentSelection());
            if ($chk(selected)) {
				selected.addClass('imago_selectedThumb');
			}
        }
    },
    thumbMenuPrev: function(){
        if (this.lastThumbImageIndex > this.thumbsPerPage) {
            this.lastThumbImageIndex -= (this.lastThumbsOnCurrentPage + this.thumbsPerPage);
            if (this.lastThumbImageIndex < 0) {
                this.lastThumbImageIndex = 0;
            }
            $('imagoCurrentThumbTable').dispose();
            var table = this.getCurrentThumbTable();
            table.injectAfter('imagoGalleryTitle');
			selected = $(this.getCurrentSelection());
            if ($chk(selected)) {
				selected.addClass('imago_selectedThumb');
			}
        }
    },
    nextImage: function(){
        if (this.indexCurrentImage + 1 < this.images.length) {
            if (this.indexCurrentImage + 1 >= this.lastThumbImageIndex) {
                this.thumbMenuNext(this);
            }
            doSwitchImage = this.switchImage.bind(this.images[this.indexCurrentImage + 1]);
            doSwitchImage();
        }
    },
    previousImage: function(){
        if (this.indexCurrentImage - 1 >= 0) {
            if (this.indexCurrentImage - 1 < (this.lastThumbImageIndex - this.lastThumbsOnCurrentPage)) {
                this.thumbMenuPrev(this);
            }
            doSwitchImage = this.switchImage.bind(this.images[this.indexCurrentImage - 1]);
            doSwitchImage();
        }
    },
    showGallery: function(){
        if ($chk($('imagoMenuPrevLink'))) {
            var navPrevLink = $('imagoMenuPrevLink');
            navPrevLink.onclick = this.thumbMenuPrev.bind(this);
            ElementHelper.hide('imagoMenuPrevLink');
        }
        if ($chk($('imagoMenuNextLink'))) {
            var navNextLink = $('imagoMenuNextLink');
            navNextLink.onclick = this.thumbMenuNext.bind(this);
            ElementHelper.hide('imagoMenuNextLink');
        }
        
        if (this.images.length > this.thumbsPerPage) {
            ElementHelper.show('imagoMenuNextLink');
        }
        var table = this.getCurrentThumbTable();
        table.injectAfter('imagoGalleryTitle');
        
        if ($chk($('imagoNextImageLink'))) {
            var nextImageLink = $('imagoNextImageLink');
            nextImageLink.setProperty('href', '#');
            nextImageLink.setProperty('accesskey', 'n');
            nextImageLink.onclick = this.nextImage.bind(this);
            ElementHelper.hide('imagoNextImageLink');
        }
        
        if ($chk($('imagoPreviousImageLink'))) {
            var prevImageLink = $('imagoPreviousImageLink');
            prevImageLink.setProperty('href', '#');
            prevImageLink.setProperty('accesskey', 'n');
            prevImageLink.onclick = this.previousImage.bind(this);
            ElementHelper.hide('imagoPreviousImageLink');
        }
        ElementHelper.hide('imagoPreviousImageLink');
        ElementHelper.hide('imagoCurrentImageLoading');
        
        document.addEvent('keydown', gallery.handleKey.bind(this));
        
        ElementHelper.setInnerHTML('imagoGalleryTitle', this.title);
        this.prefetchImages();
    },
    handleKey: function(event){
        var keycode = event.keyCode;
        switch (keycode) {
            // left arrow
            case 37: // firefox
            case 63234: // safari
                prv = gallery.previousImage.bind(this);
                prv();
                break;
            // right arrow
            case 39: // firefox
            case 63235: // safari
                nxt = gallery.nextImage.bind(this);
                nxt();
                break;
        }
    },
    switchImage: function(){
        ElementHelper.show('imagoCurrentImageLoading');
        ElementHelper.hide('imagoNextImageLink');
        ElementHelper.hide('imagoPreviousImageLink');
        file = this.getImageURL();
        if ($(gallery.getCurrentSelection()) != null) {
            $(gallery.getCurrentSelection()).removeClass('imago_selectedThumb');
        }
        cimage = this;
        var myFx = new Fx.Morph('imagoCurrentImg', {
            duration: 500,
            transition: Fx.Transitions.linear,
            onComplete: function(){
                doChangeImage = gallery.showImage.bind(cimage);
                doChangeImage();
            },
            onStart: function(){
                $('imagoCurrentImg').removeEvents('load');
                cimage.img = new Image();
                cimage.img.src = file;
            }
        }).start({
            'opacity': [1, 0]
        });
    },
    showImage: function(){
        gallery.setCurrentSelection(this.getID());
        cimage = this;
        file = this.getImageURL();
        title = this.getTitle();
        $('imagoCurrentImg').addEvent('load', gallery.fadeIn.bind(cimage));
        $('imagoCurrentImg').setProperty('src', file);
        $('imagoCurrentImg').setProperty('alt', title);
        $('imagoCurrentImg').setProperty('title', title);
        
        ElementHelper.setInnerHTML('imagoCurrentImageTitle', title);
        if (window.opera) {
            $('imagoCurrentImg').removeEvents('load');
            fireFadein = gallery.fadeIn.bind(cimage);
            fireFadein();
        }
    },
    fadeIn: function(){
        i = this.img;
        ElementHelper.hide('imagoCurrentImageLoading');
        $('imagoCurrentImg').setStyles({
            width: i.width + 'px',
            height: i.height + 'px'
        });
        gallery.applyLayoutFixes();
        
        var myFx = new Fx.Morph('imagoCurrentImg', {
            duration: 500,
            transition: Fx.Transitions.linear
        }).start({
            'opacity': [0, 1]
        });
        if (gallery.indexCurrentImage + 1 == gallery.images.length) {
            ElementHelper.hide('imagoNextImageLink');
        }
        else {
            ElementHelper.show('imagoNextImageLink');
        }
        if (gallery.indexCurrentImage == 0) {
            ElementHelper.hide('imagoPreviousImageLink');
        }
        else {
            ElementHelper.show('imagoPreviousImageLink');
        }
    },
    applyLayoutFixes: function(){
        $('imagoFrame').setStyle('width', $('imagoCurrentImg').getSize().x);
        
        if ($chk($('imagoNextImageLink'))) {
            $('imagoNextImageLink').setStyle('height', $('imagoCurrentImg').getSize().y);
        }
        if ($chk($('imagoPreviousImageLink'))) {
            $('imagoPreviousImageLink').setStyle('height', $('imagoCurrentImg').getSize().y);
        }
        ElementHelper.show('imagoCurrentImg');
    },
    getCurrentSelection: function(){
        return this.selection;
    },
    setCurrentSelection: function(selection){
        this.selection = selection;
        $(this.selection).addClass('imago_selectedThumb');
        for (var i = 0; i < this.images.length; i++) {
            if (this.images[i].getID() == this.selection) {
                this.indexCurrentImage = i;
            }
        }
    },
    prefetchImages: function(){
        var thumbURLs = new Array();
        var imageURLs = new Array();
        for (var i = 0; i < this.images.length; i++) {
            if (i == 0) {
                thumbURLs.push(this.images[i].getImageURL());
            }
            thumbURLs.push(this.images[i].getThumbURL());
            imageURLs.push(this.images[i].getImageURL());
        }
        new Asset.images(thumbURLs, {
            onComplete: function(){
                ElementHelper.hide('imagoLoading');
                gallery.images[0].img = new Image();
                gallery.images[0].img.src = gallery.images[0].getImageURL();
                doShowImage = gallery.showImage.bind(gallery.images[0]);
                doShowImage();
                window.fireEvent('imagoReady', 'yes');
                if (gallery.prefetching == 'all') {
                    new Asset.images(imageURLs, {
                        onComplete: function(){
                        }
                    });
                }
            }
        });
        
    }
});

var GalleryLoader = new Class({
    initialize: function(galleryFileName, baseURL, albumName){
        this.galleryFileName = galleryFileName;
        this.baseURL = baseURL;
        this.albumName = albumName;
    },
    load: function(){
        try {
            ElementHelper.show('imagoLoading');
            ElementHelper.setOpacity('imagoLoading', 0.5);
            this.specialLoading();
        } 
        catch (e) {
            this.error("gallery.xml could not be loaded");
        }
    },
    finished: function(){
        gallery.showGallery();
    },
    error: function(msg){
        if (gallery.debug) {
            $('imagoErrorDebug').set('text', msg);
        }
        ElementHelper.show('imagoError');
        ElementHelper.hide('imagoLoading');
    },
    specialLoading: function(){
        this.albumBaseURL = "";
        if (this.baseURL != null) {
            this.albumBaseURL = this.baseURL + "/";
        }
        if (this.albumName != null) {
            this.albumBaseURL = this.albumBaseURL + this.albumName + "/";
        }
        var myAjax = new Request({
            method: 'get',
            url: this.albumBaseURL + this.galleryFileName,
            onSuccess: function(){
                if (this.response.xml != null) {
                    gallery.loader.readGalleryXML(this.response.xml);
                }
                else {
                    gallery.loader.error("Retrieved an empty gallery.xml");
                }
            },
            onFailure: function(){
                if (this.xhr.status == 0 && this.xhr.responseXML) {
                    //assume we are running local                
                    if (window.ie) {
                        // strange workaround for ie
                        var result = this.transport.responseXML;
                        if (!result.documentElement && this.transport.responseStream) {
                            result.load(this.transport.responseStream);
                        }
                    }
                    gallery.loader.readGalleryXML(this.xhr.responseXML);
                }
                else {
                    gallery.loader.error("Can't connect to server and retrieve the gallery.xml");
                }
            }
        }).send();
    },
    readGalleryXML: function(galleryXML){
        gallery.thumbnailColumns = getAttributeValue(galleryXML, 'simpleviewerGallery', 'thumbnailColumns');
        gallery.thumbnailRows = getAttributeValue(galleryXML, 'simpleviewerGallery', 'thumbnailRows');
        thumbnailPath = getAttributeValue(galleryXML, 'simpleviewerGallery', 'thumbPath');
        imagePath = getAttributeValue(galleryXML, 'simpleviewerGallery', 'imagePath');
        gallery.thumbsPerPage = gallery.thumbnailRows * gallery.thumbnailColumns;
        gallery.title = getAttributeValue(galleryXML, 'simpleviewerGallery', 'title');
        
        var images = galleryXML.getElementsByTagName('image');
        for (var i = 0; i < images.length; i++) {
            caption = getNodeValue(images[i], 'caption');
            if (caption == null) {
                caption = "";
            }
            var fileName = getNodeValue(images[i], 'filename');
            gallery.addImage(new GalleryImage(fileName, caption, this.albumBaseURL + thumbnailPath + fileName, this.albumBaseURL + imagePath + fileName));
        }
        gallery.loader.finished();
    }
});

var ImagoElement = new Class({
    initialize: function(){
    
    },
    getWidth: function(element){
        element = $(element);
        return element.offsetWidth;
    },
    getHeight: function(element){
        element = $(element);
        return element.offsetHeight;
    },
    setInnerHTML: function(element, content){
        element = $(element);
        element.innerHTML = content;
    },
    hide: function(element){
        element = $(element);
        if ($chk(element)) {
            element.style.display = 'none';
        }
    },
    show: function(element){
        element = $(element);
        if ($chk(element)) {
            element.style.display = 'inline';
        }
    },
    setOpacity: function(element, opacity){
        element = $(element);
        if ($chk(element)) {
            element.style.opacity = opacity;
        }
    }
});

var ElementHelper = new ImagoElement();

function getNodeValue(obj, tag){
    child = obj.getElementsByTagName(tag)[0].firstChild;
    if (child != null) {
        return child.nodeValue;
    }
    return null;
}

function getAttributeValue(obj, tag, attr){
    return obj.getElementsByTagName(tag)[0].getAttribute(attr);
}