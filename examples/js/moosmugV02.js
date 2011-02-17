/*
 *  Name    : MooSmug
 *  Version : 0.2
 *  Author  : Jens Boje (azarai@codeboje.de)
              http://codeboje.de/contact/
    
    This code is highly based on MooPix (http://www.moopix.org/) and therefor uses the same licence
              
 *  This work is licensed under a Creative Commons License Attribution-ShareAlike 2.0
 *  http://creativecommons.org/licenses/by-sa/2.0/
 *  Associated frameworks copyright their respective owners
*/

var MooSmug = new Class({
    initialize: function(){
		// You must supply your own API key to use Flickr Services
		this.fApiKey		= '5PWp93tfq5TMoKnz9FBzo5nGG2IahVOx';
		
		// You'll probably want to leave these alone
		this.fBaseUrl		= 'http://api.smugmug.com/services/api/json/1.2.1/';
		this.fArgs		= {};
    },
	setSmugmugUrl: function(args){
		// Be sure to pass api key and request format in arguments
		this.fArgs.APIKey = this.fApiKey;
		this.fArgs.JSONCallback= 'jsonSmugmugApi'
	
		// Combine args in this call with those in the object instance already
		$extend(this.fArgs, args);
		
		// Build final, signed URL
		this.fUrl = this.fBaseUrl+'?'+Hash.toQueryString(this.fArgs);
		return this.fUrl;
	},
	callSmugmug: function(args){
		// Create script element and append to DOM
		var script = new Element('script');
		script.setProperties({type: 'text/javascript', src: this.setSmugmugUrl(args)});
		script.injectInside($$('head')[0]);
	}
});