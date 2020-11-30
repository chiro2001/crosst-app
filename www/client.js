/*
 * ░█████╗░██████╗░░█████╗░░██████╗░██████╗████████╗░░░░█████╗░██╗░░██╗░█████╗░████████╗
 * ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝╚══██╔══╝░░░██╔══██╗██║░░██║██╔══██╗╚══██╔══╝
 * ██║░░╚═╝██████╔╝██║░░██║╚█████╗░╚█████╗░░░░██║░░░░░░██║░░╚═╝███████║███████║░░░██║░░░
 * ██║░░██╗██╔══██╗██║░░██║░╚═══██╗░╚═══██╗░░░██║░░░░░░██║░░██╗██╔══██║██╔══██║░░░██║░░░
 * ╚█████╔╝██║░░██║╚█████╔╝██████╔╝██████╔╝░░░██║░░░██╗╚█████╔╝██║░░██║██║░░██║░░░██║░░░
 * ░╚════╝░╚═╝░░╚═╝░╚════╝░╚═════╝░╚═════╝░░░░╚═╝░░░╚═╝░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░
 * 
 *                  Crosst.Chat Client Version 0.0.1 by Henrize Kim
 *
 *              A simple and minimal WebSocket client for crosst.chat, supports
 *         Code Highlight, LaTeX and Markdown.
 *
 *              The client and server-side code is mainly from hack.chat, with
 *         some interesting changes on it to supports crosst.chat. For security
 *         reasons, the code for the server-side and client is not open source
 *         yet. I will release the source code in the near future. Because the
 *         code here is based on hack.chat. You can download hack.chat source
 *         code on https://github.com/hack-chat/main and check it out.
 *
 *              If you have any questions or suggestions, please contact me via
 *         my E-mail: mail@to.henrize.kim
 *
 *         Credit---
 *
 *            Henrize Kim (https://henrize.kim/) provide server, domain name and
 *          website maintenance
 *            hack.chat (https://hack.chat/) provide base code and a interesting
 *          tech community
 *
 *         Special Thanks---
 *
 *            MinusGix (https://github.com/MinusGix/) provide technical supports
 *            Meodinger (meodinger@std.uestc.edu.cn) provide technical supports
 *            KaTeX (https://github.com/Khan/KaTeX/) provide LaTeX render
 *            highlight.js (https://github.com/isagalaev/highlight.js) provide
 *          codes highlight
 *
 *            Node.js and OpenJS Fundation.
 *            npm inc. and Node package authors.
 *            Alibaba Group provide server and fonts.
 *
 *         Have a nice chat!
 */

/*
 * The clientName and clientKey be used to show your client name when users join in channel.
 *
 *      To get a client key, please provide a brief introduction to your client and ensure
 *    that it does not steal any user information, and send your client name and url to my
 *    email: mail@to.henrize.kim
 *
 *      Thank you very much for developing the client for crosst.chat :)
 */

if (typeof clientName !== "string") {
	var clientName = "[十字街网页版](https://crosst.chat/)";
	var clientKey = "/bG0bpXTJVKgQ58";
}

// initialize markdown engine
var markdownOptions = {
	html: false,
	xhtmlOut: false,
	breaks: true,
	langPrefix: '',
	linkify: true,
	linkTarget: '_blank" rel="noreferrer',
	typographer: true,
	quotes: `""''`,

	doHighlight: true,
	highlight: function (str, lang) {
		if (!markdownOptions.doHighlight || !window.hljs) { return ''; }

		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(lang, str).value;
			} catch (__) { }
		}

		try {
			return hljs.highlightAuto(str).value;
		} catch (__) { }

		return '';
	}
};

var md = new Remarkable('full', markdownOptions);

// image handler
var allowImages = true;
var imgHostWhitelist = [
	'i.loli.net',							// sm.ms
	's1.ax1x.com',						// imgchr.com
	'bed-1254016670.cos.ap-guangzhou.myqcloud.com'
];

function getDomain(link) {
	var a = document.createElement('a');
	a.href = link;
	return a.hostname;
}

function isWhiteListed(link) {
	return imgHostWhitelist.indexOf(getDomain(link)) !== -1;
}

md.renderer.rules.image = function (tokens, idx, options) {
	var src = Remarkable.utils.escapeHtml(tokens[idx].src);

	if (isWhiteListed(src) && allowImages || getDomain(src) == 'crosst.chat') {
		var imgSrc = ' src="' + Remarkable.utils.escapeHtml(tokens[idx].src) + '"';
		var title = tokens[idx].title ? (' title="' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(tokens[idx].title)) + '"') : '';
		var alt = ' alt="' + (tokens[idx].alt ? Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(Remarkable.utils.unescapeMd(tokens[idx].alt))) : '') + '"';
		var suffix = options.xhtmlOut ? ' /' : '';
		var scrollOnload = isAtBottom() ? ' onload="window.scrollTo(0, document.body.scrollHeight)"' : '';
		return '<a href="' + src + '" target="_blank" rel="noreferrer"><img' + scrollOnload + imgSrc + alt + title + suffix + '></a>';
	}

	return '<a href="' + src + '" target="_blank" rel="noreferrer">' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(src)) + '</a>';
};

md.renderer.rules.text = function (tokens, idx) {
	tokens[idx].content = Remarkable.utils.escapeHtml(tokens[idx].content);

	if (tokens[idx].content.indexOf('?') !== -1) {
		tokens[idx].content = tokens[idx].content.replace(/(^|\s)(\?)\S+?(?=[,.!?:)]?\s|$)/gm, function (match) {
			var channelLink = Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(match.trim()));
			var whiteSpace = '';
			if (match[0] !== '?') {
				whiteSpace = match[0];
			}
			return whiteSpace + '<a href="' + channelLink + '" target="_blank">' + channelLink + '</a>';
		});
	}

	return tokens[idx].content;
};

md.use(remarkableKatex);

var verifyNickname = function (nick) {
	return /^[a-zA-Z0-9\u4e00-\u9fa5_]{1,24}$/.test(nick);
};

// cookie set, get and delete.
function setAccountCookie(value) {
	var nowDate = new Date();
	nowDate.setTime(nowDate.getTime() + 1296000000);		// 15 days
	document.cookie = "CrosstAccount=" + value + "; expires=" + nowDate.toGMTString() + "; path=/";
}

function getAccountCookie() {
	var res = document.cookie;
	if (res.search("CrosstAccount=") == -1) {
		return false;
	}
	res = res.slice(res.search("CrosstAccount=") + 14);
	if (res.search(";") != -1) {
		res = res.slice(0, res.search(";"));
	}
	if (res.length < 22) {
		return false;
	}
	return res;
}

function delAccountCookie() {
	document.cookie = "CrosstAccount=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
	return;
}

// function to join channel
function getNickToJoin(channel) {
	input = window.prompt("请设置一个昵称");
	if (!input) {
		return false;
	}
	if (input.search("#") == -1) {
		send({ cmd: 'join', channel: channel, nick: input, clientName, clientKey });
		myNick = input;
	}
	else {
		input = input.split("#", 2);
		send({ cmd: 'join', channel: channel, nick: input[0], password: input[1], clientName, clientKey });
		myNick = input[0];
	}
	return true;
}

function $(query) {
	return document.querySelector(query);
}

function localStorageGet(key) {
	try {
		return window.localStorage[key];
	} catch (e) { }
}

function localStorageSet(key, val) {
	try {
		window.localStorage[key] = val;
	} catch (e) { }
}

var ws;
var myNick;
var myChannel = decodeURI(window.location.search.replace(/^\?/, ''));

var accountStr;
var lastSent = [""];
var lastSentPos = 0;

function notify(args) {
	if (localStorageGet("sound-switch") == "true") {
		var soundPromise = document.getElementById("notify-sound").play();
		if (soundPromise) {
			soundPromise.catch(function (error) {
				console.error("Problem playing sound:\n" + error);
			});
		}
	}
}

function getHomepage() {

	ws = new WebSocket('wss://ws.crosst.chat:35197/');
	// ws = new WebSocket('ws://localhost:8080/');

	ws.onerror = function (event) {
		pushMessage({ text: "# dx_xb\n连接聊天室服务器失败，请稍候重试。\n**如果这个问题持续出现，请立刻联系 mail@to.henrize.kim 感谢您的理解和支持**", nick: '!' });
	}

	var reqSent = false;

	ws.onopen = function () {
		if (!reqSent) {
			send({ cmd: 'getinfo' });
			reqSent = true;
		}
		return;
	}

	ws.onmessage = function (message) {
		var args = JSON.parse(message.data);
		if (args.ver == undefined) {
			args.ver = "获取失败";
			args.online = "获取失败";
		}
		var homeText = "# 十字街\n##### " + args.ver + " 在线人数：" + args.online + "\n-----\n欢迎来到十字街，这是一个简洁轻小的聊天室网站。\n预设聊天室列表：\n**[公共聊天室](./index.html?公共聊天室)**\n \n你也可以**[点击这里](./jump.html)**创建自己的聊天室或者加入其它聊天室。\n聊天室支持Markdown和LaTeX，丰富你的表达。\n站长邮箱：mail@to.henrize.kim\n-----\n在使用本网站时，您应当遵守中华人民共和国的相关规定。\n如果您不在中国大陆范围内居住，您还应当同时遵守当地的法律规定。\nHenrize Kim & Crosst.Chat Dev Team\n2020/02/29\nHave a nice chat!";
		pushMessage({ text: homeText });
	}
}

function join(channel) {

	ws = new WebSocket('wss://ws.crosst.chat:35197/');
	// ws = new WebSocket('ws://localhost:8080/');

	ws.onerror = function (event) {
		pushMessage({ text: "# dx_xb\n连接聊天室服务器失败，请稍候重试。\n**如果这个问题持续出现，请立刻联系 mail@to.henrize.kim 感谢您的理解和支持**", nick: '!' });
	}

	var wasConnected = false;

	ws.onopen = function () {
		var loginCookie = getAccountCookie();
		if (loginCookie) {
			accountStr = loginCookie.slice(21);
			if (!loginCookie.startsWith("nopassword-nopassword")) {
				accountStr = "[" + loginCookie.slice(0, 6) + "] " + accountStr;
			}
			if (localStorageGet("auto-login") == "true") {
				send({ cmd: 'join', channel: channel, cookie: loginCookie, clientName, clientKey });
				myNick = loginCookie.slice(21);
				wasConnected = true;
			}
			else {
				if (window.confirm("以上次的昵称登录？\n" + accountStr)) {
					send({ cmd: 'join', channel: channel, cookie: loginCookie, clientName, clientKey });
					myNick = loginCookie.slice(21);
					wasConnected = true;
				}
				else {
					wasConnected = getNickToJoin(channel);
				}
			}
		}
		else {
			wasConnected = getNickToJoin(channel);
		}
	}

	ws.onclose = function () {
		if (wasConnected) {
			pushMessage({ nick: '!', text: "与服务器的连接已断开，请刷新重试。" });
		}
	}

	ws.onmessage = function (message) {
		var args = JSON.parse(message.data);
		var cmd = args.cmd;
		var command = COMMANDS[cmd];
		command.call(null, args);
	}
}

var COMMANDS = {
	chat: function (args) {
		if (ignoredUsers.indexOf(args.nick) >= 0) {
			return;
		}
		pushMessage(args);
	},

	info: function (args) {
		args.nick = '*';
		pushMessage(args);
	},

	warn: function (args) {
		args.nick = '!';
		pushMessage(args);
	},

	onlineSet: function (args) {
		var nicks = args.nicks;

		usersClear();

		nicks.forEach(function (nick) {
			userAdd(nick);
		});

		userAdd(myNick);
		nicks.push(myNick);

		if (args.cookie != null) {
			accountStr = args.cookie.slice(21);
			if (!args.cookie.startsWith("nopassword-nopassword")) {
				accountStr = "[" + args.cookie.slice(0, 6) + "] " + accountStr;
			}
			document.getElementById("account-name").innerHTML = accountStr;
			setAccountCookie(args.cookie);
		}
		else {
			document.getElementById("account-name").innerHTML = accountStr;
		}

		document.getElementById("version-text").innerHTML = args.ver;

		pushMessage({ nick: '*', text: "在线的用户：" + nicks.join(", ") })
	},

	onlineAdd: function (args) {
		if (args.nick != myNick) {
			userAdd(args.nick);

			if ($('#joined-left').checked) {
				if (args.client == 'null') {
					pushMessage({ nick: '*', trip: args.trip, text: args.nick + " 加入聊天室" });
				}
				else {
					pushMessage({ nick: '*', trip: args.trip, text: args.nick + " 加入聊天室\n###### 来自 " + args.client });
				}
			}
		}
	},

	onlineRemove: function (args) {
		var nick = args.nick;

		userRemove(nick);

		if ($('#joined-left').checked) {
			pushMessage({ nick: '*', text: nick + " 退出聊天室" });
		}
	},

	delCookie: function (args) {
		delAccountCookie();
		args.nick = '!';
		args.text = '账号信息验证失败，请重新填写昵称。';
		pushMessage(args);
		localStorageSet('auto-login', 'false');
	}
}

function pushMessage(args) {
	// Message container
	var messageEl = document.createElement('div');

	if (
		typeof (myNick) === 'string' && (
			args.text.match(new RegExp('@' + myNick + '\\b', "gi")) ||
			((args.type === "whisper" || args.type === "invite") && args.from)
		)
	) {
		notify();
	}

	messageEl.classList.add('message');

	if (verifyNickname(myNick) && args.nick == myNick) {
		messageEl.classList.add('me');
	} else if (args.nick == '!') {
		messageEl.classList.add('warn');
	} else if (args.nick == '*') {
		messageEl.classList.add('info');
	} else if (args.admin) {
		messageEl.classList.add('admin');
	} else if (args.member) {
		messageEl.classList.add('member');
	}

	// Nickname
	var nickSpanEl = document.createElement('span');
	nickSpanEl.classList.add('nick');
	messageEl.appendChild(nickSpanEl);

	if (args.trip) {
		var tripEl = document.createElement('span');
		tripEl.textContent = args.trip + " ";
		tripEl.classList.add('trip');
		nickSpanEl.appendChild(tripEl);
	}

	if (args.nick) {
		var nickLinkEl = document.createElement('a');
		nickLinkEl.textContent = args.nick;

		nickLinkEl.onclick = function () {
			var reText = "";
			for (const reply of args.text.split("\n"))
				reText = reText + ">" + reply + "\n";

			if (args.trip != undefined)
				insertAtCursor(">" + args.trip + " " + args.nick + "：\n" + reText + "\n@" + args.nick + " ");
			else
				insertAtCursor(">" + args.nick + "：\n" + reText + "\n@" + args.nick + " ");

			$('#chatinput').focus();
		}

		var date = new Date(args.time || Date.now());
		nickLinkEl.title = date.toLocaleString();
		nickSpanEl.appendChild(nickLinkEl);
	}

	// Text
	var textEl = document.createElement('p');
	textEl.classList.add('text');
	textEl.innerHTML = md.render(args.text);

	messageEl.appendChild(textEl);

	// Scroll to bottom
	var atBottom = isAtBottom();
	$('#messages').appendChild(messageEl);
	if (atBottom) {
		window.scrollTo(0, document.body.scrollHeight);
	}

	if (args.trip != "/Time/") {
		unread += 1;
	}

	updateTitle();
	updateNotice(args);
}

var messageTemp = Array();
const messageTempLen = 4;

function updateNotice(args) {
	if (args.cmd != 'chat' || args.nick == myNick) return;
	messageTemp.push(args);
	if (messageTemp.length > messageTempLen)
		messageTemp = messageTemp.slice(1);
	if (windowActive) return;
	var texts = [];
	for (message of messageTemp) {
		let m = {};
		if (!message.nick) m.person = 'User';
		else m.person = message.nick;
		m.message = message.text;
		texts.push(m);
	}
	cordova.plugins.notification.local.schedule({
		id: 1,
		title: 'room',
		// icon: 'http://climberindonesia.com/assets/icon/ionicons-2.0.1/png/512/android-chat.png',
		text: texts,
		actions: [{
			id: 'reply',
			type: 'input',
			title: '回复',
			emptyText: '输入回复',
		}]
	});
}

function insertAtCursor(text) {
	var input = $('#chatinput');
	var start = input.selectionStart || 0;
	var before = input.value.substr(0, start);
	var after = input.value.substr(start);

	before += text;
	input.value = before + after;
	input.selectionStart = input.selectionEnd = before.length;

	updateInputSize();
}

function send(data) {
	if (ws && ws.readyState == ws.OPEN) {
		ws.send(JSON.stringify(data));
	}
}

var windowActive = true;
var unread = 0;

function my_onfocus() {
	windowActive = true;
	messageTemp = Array();
	updateTitle();
	cordova.plugins.notification.local.cancelAll();
	cordova.plugins.notification.local.setDefaults({
		vibrate: true
	});
}
window.onfocus = my_onfocus;

function my_onblur() {
	windowActive = false;
}
window.onblur = my_onblur();
// 注册Cordova的组件
document.addEventListener('deviceready', my_onfocus, false);
document.addEventListener('pause', my_onblur, false);
document.addEventListener('resume', my_onfocus, false);
setTimeout(function () {
	cordova.plugins.notification.local.on('reply', function (notification, eopts) {
		// console.log(notification, eopts);
		let text = '...';
		if (eopts.text) text = eopts.text;
		send({ cmd: 'chat', text: text });
		lastSent[0] = text;
		lastSent.unshift("");
		lastSentPos = 0;
	});
}, 300);


window.onscroll = function () {
	if (isAtBottom()) {
		updateTitle();
	}
}

function isAtBottom() {
	return (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 1);
}

function updateTitle() {
	if (windowActive && isAtBottom()) {
		unread = 0;
	}

	var title;
	if (myChannel) {
		if (myChannel.startsWith("Pri_")) {
			title = "随机生成的聊天室 - 十字街";
		}
		else {
			title = myChannel + " - 十字街";
		}
	} else {
		title = "十字街";
	}

	if (unread > 0) {
		title = '[' + unread + '] ' + title;
	}

	document.title = title;
	$('#title').innerText = title;
}

$('#auto-login').onchange = function (e) {
	localStorageSet('auto-login', !!e.target.checked);
}

$('#clear-account').onclick = function () {
	delAccountCookie();
	$('#auto-login').checked = false;
	localStorageSet('auto-login', false);
	document.getElementById("auto-login").disabled = true;
	let message = { nick: "*", text: "记录的账号信息已删除。" };
	pushMessage(message);
}

$('#footer').onclick = function () {
	$('#chatinput').focus();
}

// 切换上传文件那个窗口的状态
var uploader_open = true;
$('#uploader-button').onclick = function () {
	let iframe = $('#uploader-iframe')
	if (!iframe) return;
	if (uploader_open)
		iframe.classList.add('hidden');
	else
		iframe.classList.remove('hidden');
	uploader_open = !uploader_open;
}

function uploaderLoadDone(height) {
	height = 350;
	$('#uploader-iframe').height = height;
	if ($('#uploader-button').onclick)
		$('#uploader-button').onclick();
}

$('#emote').onchange = function () {
	el = $('#emote');
	insertAtCursor(el.options[el.selectedIndex].value);
	$('#chatinput').focus();
}

$('#chatinput').onkeydown = function (e) {
	if (e.keyCode == 13 /* ENTER */ && !e.shiftKey) {
		e.preventDefault();

		// Submit message
		if (e.target.value != '') {
			var text = e.target.value;
			e.target.value = '';

			send({ cmd: 'chat', text: text });

			lastSent[0] = text;
			lastSent.unshift("");
			lastSentPos = 0;

			updateInputSize();
		}
	} else if (e.keyCode == 38 /* UP */) {
		// Restore previous sent messages
		if (e.target.selectionStart === 0 && lastSentPos < lastSent.length - 1) {
			e.preventDefault();

			if (lastSentPos == 0) {
				lastSent[0] = e.target.value;
			}

			lastSentPos += 1;
			e.target.value = lastSent[lastSentPos];
			e.target.selectionStart = e.target.selectionEnd = e.target.value.length;

			updateInputSize();
		}
	} else if (e.keyCode == 40 /* DOWN */) {
		if (e.target.selectionStart === e.target.value.length && lastSentPos > 0) {
			e.preventDefault();

			lastSentPos -= 1;
			e.target.value = lastSent[lastSentPos];
			e.target.selectionStart = e.target.selectionEnd = 0;

			updateInputSize();
		}
	} else if (e.keyCode == 27 /* ESC */) {
		e.preventDefault();

		// Clear input field
		e.target.value = "";
		lastSentPos = 0;
		lastSent[lastSentPos] = "";

		updateInputSize();
	} else if (e.keyCode == 9 /* TAB */) {
		// Tab complete nicknames starting with @

		if (e.ctrlKey) {
			// Skip autocompletion and tab insertion if user is pressing ctrl
			// ctrl-tab is used by browsers to cycle through tabs
			return;
		}
		e.preventDefault();

		var pos = e.target.selectionStart || 0;
		var text = e.target.value;
		var index = text.lastIndexOf('@', pos);

		var autocompletedNick = false;

		if (index >= 0) {
			var stub = text.substring(index + 1, pos).toLowerCase();
			// Search for nick beginning with stub
			var nicks = onlineUsers.filter(function (nick) {
				return nick.toLowerCase().indexOf(stub) == 0
			});

			if (nicks.length > 0) {
				autocompletedNick = true;
				if (nicks.length == 1) {
					insertAtCursor(nicks[0].substr(stub.length) + " ");
				}
			}
		}

		// Since we did not insert a nick, we insert a tab character
		if (!autocompletedNick) {
			insertAtCursor('\t');
		}
	}
}

function updateInputSize() {
	var atBottom = isAtBottom();

	var input = $('#chatinput');
	input.style.height = 0;
	input.style.height = input.scrollHeight + 'px';
	document.body.style.marginBottom = $('#footer').offsetHeight + 'px';

	if (atBottom) {
		window.scrollTo(0, document.body.scrollHeight);
	}
}

$('#chatinput').oninput = function () {
	updateInputSize();
}

updateInputSize();

/* sidebar */

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

	if (!$('#pin-sidebar').checked) {
		$('#sidebar-content').classList.add('hidden');
		$('#sidebar').classList.remove('expand');
	}
}

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

/* main */

if (myChannel == '') {
	getHomepage();
	$('#footer').classList.add('hidden');
	$('#sidebar').classList.add('hidden');
	$('#header').classList.add('hidden');
	$('.container').setAttribute('style', 'margin-top: 0px;');
} else {
	join(myChannel);
}
