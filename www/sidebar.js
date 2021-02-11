if (typeof $ == 'undefined')
	function $(query) {
		return document.querySelector(query);
	}

if (typeof localStorageGet == 'undefined')
	function localStorageGet(key) {
		try {
			return window.localStorage[key];
		} catch (e) { }
	}

if (typeof localStorageSet == 'undefined')
	function localStorageSet(key, val) {
		try {
			window.localStorage[key] = val;
		} catch (e) { }
	}

if (typeof setScheme == 'undefined')
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
			case '拜年祭': setHighlight('zenburn');
				break;
			case '黑色系 - 晨雾': setHighlight('rainbow');
				break;
		}
		localStorageSet('scheme', scheme);
	}
if (typeof setHighlight == 'undefined')
	function setHighlight(scheme) {
		currentHighlight = scheme;
		$('#highlight-link').href = "./vendor/hljs/styles/" + scheme + ".min.css";
		localStorageSet('highlight', scheme);
	}

var sidebar = {
	init_event: function () {
		$('#sidebar').onmouseenter = $('#sidebar').ontouchstart = function (e) {
			if (window.onresize) setTimeout(window.onresize, 50);
			$('#sidebar-content').classList.remove('hidden');
			$('#sidebar').classList.add('expand');
			if (e)
				e.stopPropagation();
		}

		$('#sidebar').onmouseleave = document.ontouchstart = function (event) {
			if (window.onresize) setTimeout(window.onresize, 50);
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

		// Load sidebar configaration values from local storage if available
		console.log('scheme', localStorageGet('scheme'));
		if (localStorageGet('scheme')) {
			setScheme(localStorageGet('scheme'));
		}

		if (localStorageGet('highlight')) {
			setHighlight(localStorageGet('highlight'));
		}

		// appending: history-allow-imgur
		if (typeof historyAllowImages === "undefined")
			window['historyAllowImages'] = false;

		if (localStorageGet('history-allow-imgur') === undefined)
			localStorageSet('history-allow-imgur', false);
		if (localStorageGet('history-allow-imgur') == 'true' && $('#history-allow-imgur')) {
			$('#history-allow-imgur').checked = true;
			historyAllowImages = true;
		}

		if ($('#history-allow-imgur'))
			$('#history-allow-imgur').onchange = function (e) {
				var enabled = !!e.target.checked;
				localStorageSet('history-allow-imgur', enabled);
				historyAllowImages = enabled;

				if (typeof ct_history === 'undefined') return;
				if (historyAllowImages) {
					ct_history.query();
				} else {
					ct_history.query();
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

		if ($('#enable-fireworks')) {
			if (localStorageGet('enable-fireworks') == 'true') {
				$('#enable-fireworks').checked = true;
			} else if (localStorageGet('enable-fireworks') === undefined) {
				$('#enable-fireworks').checked = true;
				localStorageSet("enable-fireworks", 'true');
			} else {
				$('#enable-fireworks').checked = false;
			}
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
		if ($('#enable-fireworks')) {
			$('#enable-fireworks').onchange = function (e) {
				localStorageSet('enable-fireworks', !!e.target.checked);
			}
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

		if (localStorageGet('enable-history') == 'false') {
			$('#enable-history').checked = false;
			enableHistory = false;
		}

		if (localStorageGet('allow-notification') == 'false') {
			$('#allow-notification').checked = false;
			allowNotification = false;
		}

		$('#allow-imgur').onchange = function (e) {
			var enabled = !!e.target.checked;
			localStorageSet('allow-imgur', enabled);
			allowImages = enabled;
		}

		$('#allow-notification').onchange = function (e) {
			var enabled = !!e.target.checked;
			localStorageSet('allow-notification', enabled);
			allowNotification = enabled;
		}

		$('#enable-history').onchange = function (e) {
			var enabled = !!e.target.checked;
			localStorageSet('enable-history', enabled);
			enableHistory = enabled;

			if (enableHistory) {
				$("#history-div").classList.remove("hidden");
			} else {
				$("#history-div").classList.add("hidden");
			}
		}

		/* color scheme switcher */

		var schemes = [
			'黑色系 - 寒夜',
			'黑色系 - 都市',
			'黑色系 - 荧黄',
			'青色系 - 初夏',
			'黑色系 - 晨雾',
			'拜年祭',
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

		var currentScheme = localStorageGet('scheme');
		if (!currentScheme) currentScheme = '黑色系 - 寒夜';
		var currentHighlight = localStorageGet('highlight');
		if (!currentHighlight) currentHighlight = 'rainbow';

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
			if (frames['chat_history']) frames['chat_history'].location.reload();
		}

		$('#highlight-selector').onchange = function (e) {
			setHighlight(e.target.value);
			if (frames['chat_history']) frames['chat_history'].location.reload();
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
	hide: function () {
		$('#sidebar').classList.add('hidden');
	}
};