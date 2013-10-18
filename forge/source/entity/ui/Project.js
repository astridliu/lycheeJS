
lychee.define('game.entity.ui.Project').requires([
	'lychee.ui.Button',
	'lychee.ui.Select'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var _default_projects = attachments['json'];



	/*
	 * HELPERS
	 */

	var _process_update = function(data) {

		var filtered = [];
		var options  = [];

		var projects = data.projects || null;
		if (projects !== null) {

			for (var p = 0, pl = projects.length; p < pl; p++) {

				var project = projects[p];

				filtered.push(project);
				options.push(project.title);

			}

		}


		this.__projects = filtered;
		this.__options  = options;


		var entity = this.getEntity('select');
		if (entity !== null) {

			entity.setOptions(this.__options);


			var value = entity.value;
			if (this.__options.indexOf(value) === -1) {
				entity.setValue(this.__options[0]);
			}

		}

	};

	var _process_change = function(value) {

		var found = null;

		var projects = this.__projects;
		for (var p = 0, pl = projects.length; p < pl; p++) {

			var project = projects[p];
			if (project.title === value) {
				found = project;
				break;
			}

		}


		if (found !== null) {
			this.trigger('change', [ found ]);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game, settings) {

	};


	Class.prototype = {

		/*
		 * LAYER API
		 */

		reset: function() {

			lychee.ui.Layer.prototype.reset.call(this);


			var entity = null;
			var width  = this.width;
			var height = this.height;


			entity = new lychee.ui.Button({
				label: 'Project:',
				font:  this.game.fonts.normal,
				position: {
					x: -1/2 * width + 96,
					y:  0
				}
			});

			this.addEntity(entity);


			entity = new lychee.ui.Select({
				font:    this.game.fonts.normal,
				options: [ 'no project found' ],
				value:   'no project found',
				width:   256,
				position: {
					x: -1/2 * width + 96 + 256,
					y: 0
				}
			});

			entity.bind('change', _process_change, this);

			this.setEntity('select', entity);

		},



		/*
		 * SERVICE INTEGRATION API
		 */

		init: function(service) {

			service.bind('update', function(data) {
				_process_update.call(this, data);
			}, this);


			service.update();

		}

	};


	return Class;

});

