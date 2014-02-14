
lychee.define('game.net.client.Multiplayer').includes([
	'lychee.net.client.Session'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _on_start = function(data) {

		if (this.game.isState('menu') === true) {

			this.game.changeState('game', {
				type:    'multiplayer',
				players: data.tunnels,
				player:  data.tid,
				width:   this.env.width,
				height:  this.env.height
			});

		}

	};

	var _on_stop = function(data) {

		if (this.game.isState('game') === true) {
			this.game.changeState('menu');
		}

	};

	var _update_env = function() {

		var renderer = this.game.renderer;
		if (renderer !== null) {

			this.env.width  = renderer.width;
			this.env.height = renderer.height;

		}

	};

	var _on_syncenv = function(data) {

		data.width  = typeof data.width === 'number'  ? data.width  : null;
		data.height = typeof data.height === 'number' ? data.height : null;


console.log('Env Sync', data.width, data.height);


		if (
			   data.width !== null
			&& data.height !== null
		) {

			this.env.width  = Math.min(this.env.width,  data.width);
			this.env.height = Math.min(this.env.height, data.height);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		this.game = client.game;
		this.env  = {
			width:  0,
			height: 0
		};


		lychee.net.client.Session.call(this, 'multiplayer', client, {
			autolock:  true,
			autostart: true,
			min:       2,
			max:       2
		});

		_update_env.call(this);



		/*
		 * INITIALIZATION
		 */

		this.bind('start',   _on_start,   this);
		this.bind('stop',    _on_stop,    this);
		this.bind('syncenv', _on_syncenv, this);

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		join: function() {

			lychee.net.client.Session.prototype.join.call(this);


			var renderer = this.game.renderer;
			if (renderer !== null) {

				this.multicast({
					width:  renderer.width,
					height: renderer.height
				},{
					id:    this.id,
					event: 'syncenv'
				});

			}

		},

		leave: function() {

			lychee.net.client.Session.prototype.leave.call(this);

			_update_env.call(this);

		},



		/*
		 * CUSTOM API: CONTROLLER
		 */

		sync: function(data) {

			this.multicast(data, {
				id:    this.id,
				event: 'sync'
			});

		},

		control: function(data) {

			this.multicast(data, {
				id:    this.id,
				event: 'control'
			});

		}

	};


	return Class;

});

