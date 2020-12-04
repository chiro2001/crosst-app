if (!$)
	function $(query) {
		return document.querySelector(query);
	}

if (!localStorageGet)
	function localStorageGet(key) {
		try {
			return window.localStorage[key];
		} catch (e) { }
	}

if (!localStorageSet)
	function localStorageSet(key, val) {
		try {
			window.localStorage[key] = val;
		} catch (e) { }
	}

var sidebar = {
	init_event: function() {
		$('#sidebar').onmouseenter = $('#sidebar').ontouchstart = function (e) {
			$('#sidebar-content').classList.remove('hidden');
			$('#sidebar').classList.add('expand');
			if (e)
				e.stopPropagation();
		}

		$('#sidebar').onmouseleave = document.ontouchstart = function (event) {
			if (event) {
				var e = event.toElement || event.relatedTarget;
				try {
					if (e.parentNode == this || e == this) {
						return;
					}
				} catch (e) { return; }
			}

			if (!$('#pin-sidebar') || !$('#pin-sidebar').checked) {
				$('#sidebar-content').classList.add('hidden');
				$('#sidebar').classList.remove('expand');
			}
		}
	},
	init: function () {
		this.init_event();

		$('#clear-messages').onclick = function () {
			// Delete children elements
			var messages = $('#messages');
			messages.innerHTML = '';
		}

		// Restore settings from localStorage

		if (localStorageGet('auto-login') == 'true') {
			$('#auto-login').checked = true;
		}

		if (localStorageGet('pin-sidebar') == 'true') {
			$('#pin-sidebar').checked = true;
			$('#sidebar-content').classList.remove('hidden');
		}

		if (localStorageGet('sound-switch') == 'true') {
			$('#sound-switch').checked = true;
		}

		if (localStorageGet('joined-left') == 'false') {
			$('#joined-left').checked = false;
		}

		if (localStorageGet('parse-latex') == 'false') {
			$('#parse-latex').checked = false;
			md.inline.ruler.disable(['katex']);
			md.block.ruler.disable(['katex']);
		}

		$('#pin-sidebar').onchange = function (e) {
			localStorageSet('pin-sidebar', !!e.target.checked);
		}

		$('#joined-left').onchange = function (e) {
			localStorageSet('joined-left', !!e.target.checked);
		}

		$('#parse-latex').onchange = function (e) {
			var enabled = !!e.target.checked;
			localStorageSet('parse-latex', enabled);
			if (enabled) {
				md.inline.ruler.enable(['katex']);
				md.block.ruler.enable(['katex']);
			} else {
				md.inline.ruler.disable(['katex']);
				md.block.ruler.disable(['katex']);
			}
		}

		if (localStorageGet('syntax-highlight') == 'false') {
			$('#syntax-highlight').checked = false;
			markdownOptions.doHighlight = false;
		}

		$('#syntax-highlight').onchange = function (e) {
			var enabled = !!e.target.checked;
			localStorageSet('syntax-highlight', enabled);
			markdownOptions.doHighlight = enabled;
		}

		if (localStorageGet('allow-imgur') == 'false') {
			$('#allow-imgur').checked = false;
			allowImages = false;
		}

		$('#allow-imgur').onchange = function (e) {
			var enabled = !!e.target.checked;
			localStorageSet('allow-imgur', enabled);
			allowImages = enabled;
		}

		// User list
		var onlineUsers = [];
		var ignoredUsers = [];

		function userAdd(nick) {
			var user = document.createElement('a');
			user.textContent = nick;

			user.onclick = function (e) {
				userInvite(nick)
			}

			var userLi = document.createElement('li');
			userLi.appendChild(user);
			$('#users').appendChild(userLi);
			onlineUsers.push(nick);
		}

		function userRemove(nick) {
			var users = $('#users');
			var children = users.children;

			for (var i = 0; i < children.length; i++) {
				var user = children[i];
				if (user.textContent == nick) {
					users.removeChild(user);
				}
			}

			var index = onlineUsers.indexOf(nick);
			if (index >= 0) {
				onlineUsers.splice(index, 1);
			}
		}

		function usersClear() {
			var users = $('#users');

			while (users.firstChild) {
				users.removeChild(users.firstChild);
			}

			onlineUsers.length = 0;
		}

		function userInvite(nick) {
			send({ cmd: 'invite', nick: nick });
		}

		function userIgnore(nick) {
			ignoredUsers.push(nick);
		}

		/* color scheme switcher */

		var schemes = [
			'黑色系 - 寒夜',
			'黑色系 - 都市',
			'黑色系 - 荧黄',
			'青色系 - 初夏'
		];

		var highlights = [
			'agate',
			'androidstudio',
			'atom-one-dark',
			'darcula',
			'github',
			'rainbow',
			'tomorrow',
			'xcode',
			'zenburn'
		]

		var currentScheme = '黑色系 - 寒夜';
		var currentHighlight = 'rainbow';

		function setScheme(scheme) {
			currentScheme = scheme;
			$('#scheme-link').href = "./schemes/" + scheme + ".css";
			switch (scheme) {
				case '黑色系 - 寒夜': setHighlight('rainbow');
					break;
				case '青色系 - 初夏': setHighlight('tomorrow');
					break;
				case '黑色系 - 都市': setHighlight('atom-one-dark');
					break;
				case '黑色系 - 荧黄': setHighlight('zenburn');
					break;
			}
			localStorageSet('scheme', scheme);
		}

		function setHighlight(scheme) {
			currentHighlight = scheme;
			$('#highlight-link').href = "./vendor/hljs/styles/" + scheme + ".min.css";
			localStorageSet('highlight', scheme);
		}

		// Add scheme options to dropdown selector
		schemes.forEach(function (scheme) {
			var option = document.createElement('option');
			option.textContent = scheme;
			option.value = scheme;
			$('#scheme-selector').appendChild(option);
		});

		highlights.forEach(function (scheme) {
			var option = document.createElement('option');
			option.textContent = scheme;
			option.value = scheme;
			$('#highlight-selector').appendChild(option);
		});

		$('#sound-switch').onchange = function (e) {
			localStorageSet('sound-switch', !!e.target.checked);
		}

		$('#scheme-selector').onchange = function (e) {
			setScheme(e.target.value);
		}

		$('#highlight-selector').onchange = function (e) {
			setHighlight(e.target.value);
		}

		// Load sidebar configaration values from local storage if available
		if (localStorageGet('scheme')) {
			setScheme(localStorageGet('scheme'));
		}

		if (localStorageGet('highlight')) {
			setHighlight(localStorageGet('highlight'));
		}

		$('#scheme-selector').value = currentScheme;
		$('#highlight-selector').value = currentHighlight;
	},
	hide: function() {
		$('#sidebar').classList.add('hidden');
	}
};