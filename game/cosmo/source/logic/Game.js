
lychee.define('game.logic.Game').requires([
	'game.entity.game.Background',
	'game.entity.Foreground',
	'game.logic.Level',
	'lychee.game.Layer'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var _config = attachments["json"];
	var _sounds = {
		explosion:      attachments["explosion.snd"],
		lazer:          attachments["lazer.snd"],
		shield:         attachments["shield.snd"],
		transformation: attachments["transformation.snd"],
		warp:           attachments["warp.snd"]
	};


	var _level      = game.logic.Level;
	var _background = game.entity.Background;
	var _foreground = game.entity.Foreground;
	var _blackhole  = game.entity.Blackhole;
	var _enemy      = game.entity.Enemy;
	var _lazer      = game.entity.Lazer;
	var _meteor     = game.entity.Meteor;
	var _ship       = game.entity.Ship;



	/*
	 * HELPERS
	 */

	var _get_level_ship = function(ship) {

		var level = 0;

		var state = ship.state;
		if (state.substr(0, 5) === 'level') {

			var t = parseInt(state.substr(-1), 10);
			if (!isNaN(t)) {
				level = t;
			}

		}


		return level;

	};

	var _get_level_points = function(points) {

		var level = 0;

		for (var levelid in _config.level) {

			var current = parseInt(levelid, 10);
			var min     = _config.level[current];
			if (min <= points) {
				level = current;
			}

		}


		return level;

	};

	var _process_explosion = function(x, y) {

		var foreground = this.__foreground;
		if (foreground !== null) {

			foreground.setExplosion({
				x: x,
				y: y
			});

		}


		this.game.jukebox.play(_sounds.explosion);

	};

	var _process_success = function() {

		var renderer = this.renderer;
		var level    = this.level;
		var ship     = this.ship;
		if (
			   renderer !== null
			&& level !== null
			&& ship !== null
		) {

			var height = renderer.height;


			this.game.jukebox.play(_sounds.warp);


			ship.setCollision(lychee.game.Entity.COLLISION.none);
			ship.warp.setState('warp');


			this.loop.setTimeout(1000, function() {

				var foreground = this.__foreground;
				if (foreground !== null) {
					foreground.setFlash(3000);
				}



				ship.shield.setState('flicker');
				ship.setTween({
					type:     lychee.game.Entity.TWEEN.linear,
					duration: 500,
					position: {
						y: -1/2 * height - 256
					}
				});


				this.loop.setTimeout(1000, function() {
					this.trigger('success', this.data);
				}, level);

			}, this);

		} else if (level !== null) {

			level.trigger('success', level.data);

		}

	};

	var _process_update = function() {

		var level = this.level;
		if (level !== null) {

			for (var a = 0, al = arguments.length; a < al; a++) {

				var ship = level.ships[a];
				if (ship !== null) {

					_process_update_player.call(
						this,
						arguments[a],
						ship
					);

				}

			}

		}

	};

	var _process_update_player = function(data, ship) {

		var oldlevel = _get_level_ship(ship);
		var newlevel = _get_level_points(data.points);

		if (newlevel > oldlevel) {

			ship.setState('upgrade' + newlevel);
			data.health  = 100;
			data.points += 500;


			this.game.jukebox.play(_sounds.transformation);

		}


		this.loop.setTimeout(1000, function() {

			var state = this.state;
			if (state.substr(0, 7) === 'upgrade') {

				var level = parseInt(state.substr(-1), 10);
				this.setState('level' + level);

			} else if (state.substr(0, 9) === 'downgrade') {

				var level = parseInt(state.substr(-1), 10) - 1;
				if (level > 0) {
					this.setState('level' + level);
				} else {
					this.setState('default');
				}

			}

		}, ship);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game) {

		this.game     = game;
		this.jukebox  = game.jukebox;
		this.loop     = game.loop;
		this.renderer = game.renderer;
		this._config  = _config;

		this.level        = null;
		this.ship         = null;

		this.__animating  = false;
		this.__background = null;
		this.__config     = {
			distance: 0,
			minx:     0, maxx:     0,
			miny:     0, maxy:     0,
			scrollx:  0, scrolly:  0,
			entities: null,
			width:    0,
			height:   0
		};
		this.__foreground = null;
		this.__interval   = null;
		this.__session    = {
			ships:  [],
			level:  null,
			points: null
		};


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * LOGIC INTERACTION
		 */

		spawn: function(construct, posarray, velarray, owner) {

			posarray = posarray instanceof Array ? posarray : null;
			velarray = velarray instanceof Array ? velarray : null;
			owner    = owner !== undefined       ? owner    : null;


			if (
				   posarray !== null
				&& velarray !== null
				&& posarray.length === velarray.length
			) {

				if (construct === _lazer) {
					this.game.jukebox.play(_sounds.lazer);
				}


				for (var a = 0, al = posarray.length; a < al; a++) {

					var pos = posarray[a];
					var vel = velarray[a];


					this.level.spawn(
						construct,
						pos.x,
						pos.y,
						vel.x,
						vel.y,
						owner
					);

				}

			}

		},


		enter: function() {

			var renderer = this.renderer;
			if (renderer !== null) {

				var width  = renderer.width;
				var height = renderer.height;

				this.__background = new _background({
					width:  width,
					height: height
				});

				this.__foreground = new _foreground({
					buffer: renderer.createBuffer(width, height),
					width:  width,
					height: height
				});

				this.__foreground.setFlash(3000);


				var level = this.level;
				if (level !== null) {

					var ship = this.ship;

					var tween = {
						type:     lychee.game.Entity.TWEEN.linear,
						duration: 1000,
						position: {
							x: ship.position.x,
							y: ship.position.y
						}
					};

					ship.position.y = height / 2 + 256;

					ship.setBombs(3);
					ship.setCollision(lychee.game.Entity.COLLISION.none);
					ship.setTween(tween);


					this.__animating = true;

					this.loop.setTimeout(1000, function() {
						ship.setCollision(lychee.game.Entity.COLLISION.A);
						this.__animating = false;
					}, this);

				}

			}


			_process_update.apply(this, this.level.data);

		},

		leave: function() {

			this.__session.ships  = this.level.ships;
			this.__session.level  = this.level.stage;
			this.__session.points = this.level.data.points;

		},

		update: function(clock, delta) {

			var config = this.__config;
			var level  = this.level;
			var ship   = this.ship;


			var minx   = config.minx;
			var maxx   = config.maxx;
			var miny   = config.miny;
			var maxy   = config.maxy;


			config.scrollx    = (delta / 1000) * ship.speedx;
			config.scrolly    = (delta / 1000) * ship.speedy;
			config.distance  += config.scrolly;


 			var shiphits  = 0;
			var enemyhits = 0;

			var entities = config.entities;
			for (var e = 0; e < entities.length; e++) {

				var entity   = entities[e];
				var position = entity.position;
				var type     = entity.type;


				entity.update(clock, delta, config);


				if (type === 'ship') {

					for (var e2 = 0; e2 < entities.length; e2++) {

						var oentity = entities[e2];
						var otype   = oentity.type;

						if (otype === 'meteor') {

							if (entity.collidesWith(oentity) === true) {
								enemyhits += level.collide(oentity, entity);
								shiphits++;
								entity.shield.setState('flicker');
							}

						}

					}

				} else if (
					   type === 'lazer'
					|| type === 'bomb'
				) {

					if (
						   position.x < minx
						|| position.x > maxx
						|| position.y < miny
						|| position.y > maxy
					) {
						level.destroy(entity, null);
						continue;
					}


					var ownertype = entity.ownertype;

					for (var e2 = 0; e2 < entities.length; e2++) {

						var oentity = entities[e2];
						var otype   = oentity.type;
						if (ownertype === otype) continue;


						if (
							   otype === 'enemy'
							|| otype === 'meteor'
						) {

							if (entity.collidesWith(oentity) === true) {
								enemyhits += level.collide(entity, oentity);
							}

						} else if (
							otype === 'ship'
						) {

							if (entity.collidesWith(oentity) === true) {
								enemyhits += level.collide(entity, oentity);
								shiphits++;
								oentity.shield.setState('flicker');
							}

						}

					}


				} else if (
					   type === 'blackhole'
					|| type === 'enemy'
					|| type === 'meteor'
				) {

					if (position.y > maxy) {

						// TODO: Evaluate how to do this generically
						// Who gets data.missed in Multiplayer Mode?

						level.destroy(entity, null, level.data[0]);
						continue;

					}

				}

			}



			if (
				this.__animating === false
				&& config.distance > level.distance - config.maxy
			) {
				this.__animating = true;
				_process_success.call(this);
			}


			if (enemyhits !== 0) {
				// TODO: Evaluate if sound shall be played here
			}

			if (shiphits > 0) {
				this.game.jukebox.play(_sounds.shield);
			}


			var foreground = this.__foreground;
			if (foreground !== null) {
				foreground.update(clock, delta, config);
			}


			var background = this.__background;
			if (background !== null) {

				var origin = background.origin;

				background.setOrigin({
					x: origin.x - config.scrollx,
					y: origin.y + config.scrolly
				});

			}

		},

		render: function(clock, delta) {

			var renderer = this.renderer;
			var level    = this.level;
			if (
				renderer !== null
				&& level !== null
			) {

				var offsetX  = renderer.width  / 2;
				var offsetY  = renderer.height / 2;

				var entities = level.entities;
				var ships    = level.ships;


				var background = this.__background;
				if (background !== null) {

					background.render(
						renderer,
						offsetX,
						offsetY
					);

				}


				for (var e = 0, el = entities.length; e < el; e++) {

					var entity = entities[e];
					if (entity.type === 'ship') continue;

					entity.render(
						renderer,
						offsetX,
						offsetY
					);

				}


				if (lychee.debug === false) {

					var foreground = this.__foreground;
					if (foreground !== null) {

						foreground.render(
							renderer,
							offsetX,
							offsetY
						);

					}

				}


				for (var s = 0, sl = ships.length; s < sl; s++) {

					var ship = ships[s];
					if (ship !== null) {

						ship.render(
							renderer,
							offsetX,
							offsetY
						);

					}

				}

			}

		},



		/*
		 * GAME STATE INTERACTION
		 */

		createLevel: function(data) {

			var settings = {
				points: null,
				width:  data.width,
				height: data.height,
				ships:  data.players.length,
				level:  data.level
			};


			var newstage = settings.level;
			var oldstage = this.__session.level;
			if (oldstage !== null) {

				var oldstglvl = parseInt(oldstage.substr(-1), 10);
				var newstglvl = parseInt(newstage.substr(-1), 10);

				if (newstglvl > oldstglvl) {
					settings.ships  = this.__session.ships;
					settings.points = this.__session.points;
				}

			}


			return new game.logic.Level(this, settings);

		},

		setShip: function(ship) {

			if (ship instanceof _ship) {

				this.ship = ship;

				return true;

			}


			return false;

		},

		setLevel: function(level) {

			if (level instanceof _level) {

				if (this.level !== null) {
					this.level.unbind('explosion', _process_explosion, this);
					this.level.unbind('update',    _process_update,    this);
				}

				this.level = level;
				this.level.bind('update',    _process_update,    this);
				this.level.bind('explosion', _process_explosion, this);


				var config = this.__config;

				config.distance = 0;
				config.width    = level.width;
				config.height   = level.height;
				config.minx     = -1/2 * config.width;
				config.maxx     =  1/2 * config.width;
				config.miny     = -1/2 * config.height;
				config.maxy     =  1/2 * config.height;
				config.entities = level.entities;


				return true;

			}


			return false;

		}

	};


	return Class;

});

