
lychee.define('game.entity.menu.Button').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _config  = attachments["json"];
	var _texture = attachments["png"];


	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		settings.texture = _texture;
		settings.map     = _config.map;
		settings.states  = _config.states;

		settings.width  = _config.width;
		settings.height = _config.height;
		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;


		lychee.ui.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

	};


	return Class;

});

