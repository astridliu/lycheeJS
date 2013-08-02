
lychee.define('sorbet.module.Welcome').requires([
	'sorbet.data.Template'
]).exports(function(lychee, game, global, attachments) {

	var _template = new sorbet.data.Template(attachments['html']);



	/*
	 * HELPERS
	 */

	var _generate_internal_projects = function(data) {

		var projects = [];

		var fs   = this.fs;
		var root = this.root;

		var files = fs.filter(
			root + '/game',
			'index.html',
			sorbet.data.Filesystem.TYPE.file
		);


		for (var f = 0, fl = files.length; f < fl; f++) {

			var url = files[f].substr(root.length);
			var tmp = url.split('/');

			projects.push({
				url:   url,
				title: tmp[tmp.length - 2]
			});

		}


		return projects;

	};

	var _generate_external_projects = function(data) {

		var projects = [];

		var fs   = this.fs;
		var root = this.root;

		var files = fs.filter(
			root + '/external',
			'index.html',
			sorbet.data.Filesystem.TYPE.file
		);


		for (var f = 0, fl = files.length; f < fl; f++) {

			var url = files[f].substr(root.length);
			var tmp = url.split('/');

			projects.push({
				url:   url,
				title: tmp[tmp.length - 2]
			});

		}


		return projects;

	};

	var _generate_sockets = function(data) {

		var sockets = [];


		sockets.push({
			url:  'http://' + data.host + ':' + data.port,
			host: data.host,
			port: data.port,
			services: 'WebService'
		});


		return sockets;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function() {

	};


	Class.prototype = {

		process: function(host, response, data) {

			var content = '';
			var version = sorbet.Main.VERSION;

			try {

				content = _template.render({
					internal_projects: _generate_internal_projects.call(host, data),
					external_projects: _generate_external_projects.call(host, data),
					sockets:           _generate_sockets.call(host, data),
					version:           version
				});

			} catch(e) {

				content = '';


				var _error = this.main.modules.get('error');
				if (_error !== null) {

					_error.process(host, response, {
						status:   500,
						host:     data.host || null,
						url:      url,
						resolved: null
					});

					return false;

				}

			}


			response.status                 = 200;
			response.header['Content-Type'] = 'text/html';
			response.content                = content;


			return true;

		}

	};


	return Class;

});

