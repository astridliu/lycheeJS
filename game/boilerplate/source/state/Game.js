
lychee.define('game.state.Game').requires([
	'game.entity.Button',
	'game.entity.Circle'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _fonts = {
		headline: attachments["headline.fnt"],
		normal:   attachments["normal.fnt"]
	};

	var _button = game.entity.Button;
	var _circle = game.entity.Circle;


	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.reset();

	};


	Class.prototype = {

		reset: function() {

			lychee.game.State.prototype.reset.call(this);


			var renderer = this.renderer;
			if (renderer !== null) {

				var width  = renderer.width;
				var height = renderer.height;


				this.removeLayer('ui');


				var layer = new lychee.game.Layer();


				layer.addEntity(new _button({
					font:   _fonts.headline,
					label: 'Game State active',
					position: {
						x: 0, y: -50
					}
				}));

				layer.addEntity(new _button({
					font:  _fonts.normal,
					label: 'Touch the circle to make Noise',
					position: {
						x: 0, y: 0
					}
				}));



				/*
				 * Entities with event bindings
				 *
				 * IMPORTANT: Only lychee.ui.Entity
				 * instances can bind/trigger events
				 *
				 */

				var circle = new _circle({
					position: {
						x: 0,
						y: 100
					}
				}, this.game);

				layer.setEntity('circle', circle);


				var exit = new _button({
					font:  _fonts.normal,
					label: 'Exit to Menu',
					position: {
						x: 0,
						y: height / 2 - 42
					}
				}, this.game);

				layer.addEntity(exit);


				this.setLayer('ui', layer);

			}

		},

		enter: function() {

			var circle = this.queryLayer('ui', 'circle');
			if (circle !== null) {
				circle.setColor('#888888', true);
			}


			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});
