/*
 *  Copyright 2006 - 2011 by Jens Boje
 *  Name    : Imago Loaders
 *  Version : 0.9
 *  Author  : Jens Boje (azarai@codeboje.de)
              http://codeboje.de/contact/
	License:
			The Imago code is available under the AGPL or a Commercial license (Contact author)
*/

var SmugmugLoader = new Class({
    Extends: GalleryLoader,
    initialize: function(albumId, showCaptions){
	    this.albumId = albumId;
	    this.showCaptions = showCaptions;
    },
    specialLoading: function() {
	    new MooSmug().callSmugmug({ method: 'smugmug.login.anonymously' });
		jsonSmugmugApi = function(rsp){
				if (rsp.stat == 'ok' ){
					if (rsp.Login){
						gallery.loader.sessionId = rsp.Login.Session.id;
						new MooSmug().callSmugmug({ method: 'smugmug.albums.getInfo', AlbumID: gallery.loader.albumId, SessionID: gallery.loader.sessionId });
					} else if (rsp.Album) {
						gallery.title = rsp.Album.Title;
						new MooSmug().callSmugmug({ method: 'smugmug.images.get', AlbumID: gallery.loader.albumId, Heavy : gallery.loader.showCaptions, SessionID: gallery.loader.sessionId });
					} else if (rsp.Images) {
						for(var i=0;i <rsp.Images.length; i++) {
							var url ='http://smugmug.com/photos/' + rsp.Images[i].id;
							var caption = "";
							if (gallery.loader.showCaptions) {
								caption =rsp.Images[i].Caption;
							}
							gallery.addImage(new GalleryImage(rsp.Images[i].id, caption, url + '-75x75.jpg', url+ '-M.jpg'));
						}					
						gallery.loader.finished();						
					}
				} else {
					gallery.loader.error("Can't load photos from smugmug");
				}
		}

    }
});


var FlickrLoader = GalleryLoader.extend({
    initialize: function(){
    },
    specialLoading: function() {
    	new MooPix().callFlickrUrl({ method: 'flickr.photos.getRecent', per_page: '15' });
		jsonFlickrApi = function(rsp){
			if (rsp.stat == 'ok' ){
				if (rsp.photos){
					for(var i=0;i <rsp.photos.photo.length; i++) {
						var url = 'http://static.flickr.com/'+rsp.photos.photo[i].server+'/'+rsp.photos.photo[i].id+'_'+rsp.photos.photo[i].secret; 
						gallery.addImage(new GalleryImage(rsp.photos.photo[i].id,rsp.photos.photo[i].title, url +'_s.jpg', url+'.jpg'));
					}
					gallery.title = 'Latest Flickr Photos';
					gallery.loader.finished();
				}
			} else {
				gallery.loader.error("Can't load photos from flickr");
			}
		}
    }
});
