// 历史记录功能
// 需要在url中的参数：房间名字(room)、自己的昵称(myNick)
// 功能：根据起止时间查找记录、高亮某些人的记录、分房间查找

// import InDB from './vendor/indb/indb.js';

// initialize markdown engine
var history_markdown_options = {
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

function get_default(val, def) {
  if (!val) return def;
  return val;
}

function update_title(title) {
  $("#title").innerText = title;
}

var history_md = new Remarkable('full', history_markdown_options);

let default_room = '公共聊天室';
let default_trip = '';
var ct_history = {
  room: default_room,
  myNick: 'Chiro',
  highlight_user: 'Henrize',

  db: null,

  make_query: function (query, args = []) {
    return new Promise((resolve, reject) => {
      try {
        this.db.transaction(tx => {
          tx.executeSql(query,
            args,
            (tx2, result) => resolve(result), (tx2, err) => reject(err));
        });
      } catch (err) { reject(err) }
    })
  },
  // 初始化函数
  init: function (room = default_room, myNick = 'Chiro', highlight_user = undefined) {
    this.room = room, this.myNick = myNick, this.highlight_user = highlight_user;
    // 建立数据库，大小2MB
    this.db = openDatabase('crosst', '1.0', 'Crosst chat\'s local Database!', 2 * 1024 * 1024);
    // console.log('db', this.db);
    window['ct_history'] = this;
    if ($("#button-query"))
      $("#button-query").onclick = this.query;
    if ($("#button-clear"))
      $("#button-clear").onclick = () => {
        ct_history.clear_message_all();
        ct_history.init();
        ct_history.query();
      };
    if ($("#input-hightlight"))
      $("#input-hightlight").oninput = () => {
        ct_history.highlight_user = $("#input-hightlight").value;
      }
    // 建立表结构
    return this.make_query("create table if not exists messages (time int, room varchar(255), nick varchar(255), trip varchar(32), text varchar(10240))");
  },


  insert_message: function (message) {
    // console.log('insert_message:', message);
    if (!message.nick) message.nick = '';
    if (message.time === undefined) message.time = new Date().getTime();
    if (!message.text) message.text = '';
    if (!message.room) message.room = default_room;
    if (!message.trip) message.trip = default_trip;
    return this.make_query("insert into messages (time, room, nick, trip, text) values (?, ?, ?, ?, ?)",
      [message.time, message.room, message.nick, message.trip, message.text]);
  },
  find_messages: function (start = 0, stop = new Date().getTime(), room = '%', nick = '%', trip = '%', text = '%') {
    // console.log('find_messages:', start, stop, room, nick, text);
    return this.make_query("select time, room, nick, trip, text from messages " +
      " where time >= ? and time <= ? and room like ? and nick like ? and trip like ? and text like ?",
      [start, stop, room, nick, trip, text]).then(result => {
        // console.log(result);
        return Array(result.rows)[0];
      })
  },
  clear_message_room: function (room = default_room) {
    // console.log('clear_message_room:', room);
    return this.make_query("delete from messages where room = ?", [room]);
  },
  clear_message_nick: function (nick = myNick) { },
  clear_message_time: function (start = 0, stop = new Date().getTime()) { },
  clear_message_all: function () {
    // console.log('clear_message_all');
    return this.make_query("drop table messages");
  },

  query: function () {
    let start_datetime = get_default($("#input-time-start").value, '1970-01-01T00:00');
    let stop_datetime = get_default($("#input-time-stop").value, '2070-01-01T00:00');
    let room = get_default($("#input-room").value, '%');
    let nick = get_default($("#input-nick").value, '%');
    let trip = get_default($("#input-trip").value, '%');
    let text = get_default($("#input-text").value, '%');
    let start_time = new Date(start_datetime).getTime();
    let stop_time = new Date(stop_datetime).getTime();
    if (room == '%') update_title("历史记录 - 全部房间");
    else update_title(`历史记录 - ${room}`);
    (async function () {
      try {
        $('#messages').innerHTML = '';
        let data = await ct_history.find_messages(start_time, stop_time, room, nick, trip, text);
        // console.log(data);
        for (let d of data) {
          ct_history.push_message(d);
        }
        $("#notice-query").classList.remove("warn");
        $("#notice-query").innerText = "查找完成";
        setTimeout(() => {
          $("#notice-query").innerText = "";
        }, 1000);
        setTimeout(() => {
          window.scrollTo(0, document.body.scrollHeight);
        }, 50)
      } catch (err) {
        console.error(err);
        $("#notice-query").classList.add("warn");
        $("#notice-query").innerText = "发生错误: " + err;
      }
    })();
  },

  // DOM操作部分
  push_message: function (args, push = true) {
    // Message container
    var messageEl = document.createElement('div');

    messageEl.classList.add('message');


    if (args.nick == this.highlight_user) {
      messageEl.classList.add('warn');
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
    if (args.trip && args.room) args.trip = `[${args.room}] ${args.trip}`;
    else if (!args.trip && args.room) args.trip = `[${args.room}]`;
    if (args.trip) {
      var tripEl = document.createElement('span');
      tripEl.textContent = args.trip + " ";
      tripEl.classList.add('trip');
      nickSpanEl.appendChild(tripEl);
    }
    if (args.nick) {
      var nickLinkEl = document.createElement('a');
      nickLinkEl.textContent = args.nick;

      var date = new Date(args.time || Date.now());
      nickLinkEl.title = date.toLocaleString();
      nickSpanEl.appendChild(nickLinkEl);
    }

    // Text
    var textEl = document.createElement('p');
    textEl.classList.add('text');
    textEl.innerHTML = history_md.render(args.text);

    messageEl.appendChild(textEl);

    // Scroll to bottom
    // var atBottom = isAtBottom();
    if (push)
      $('#messages').appendChild(messageEl);
    // if (atBottom) {
    //   window.scrollTo(0, document.body.scrollHeight);
    // }
  },
};

async function history_main() {
  sidebar.init_event();
  // 设置结束时间为当前
  // 只适合中文地区...
  // let date_str = new Date().toLocaleString().replaceAll('/', '-').split(' ');
  // let month = date_str[0].split('-')[1];
  // let day = date_str[0].split('-')[2];
  // if (month.length == 1) month = '0' + month;
  // if (day.length == 1) day = '0' + day;
  // date_str[0] = date_str[0].split('-')[0] + '-' + month + '-' + day;
  // let hour = parseInt(date_str[1].slice(2, 4));
  // if (date_str[1][0] == '下') hour += 12;
  // let time = '' + hour + date_str[1].slice(4, 7);
  // let val_now = date_str[0] + 'T' + time;
  // console.log(val_now);
  // $("#input-time-stop").value = val_now;

  // ct_history.find_messages().then(function(d) {
  //   console.log(d)
  // })
  await ct_history.init();
  // await ct_history.clear_message_all();
  // await ct_history.init();

  await (async function () {
    try {
      // ct_history.insert_message({ time: 0, nick: 'Chiro1', text: 'sfda' });
      // ct_history.insert_message({ time: 1, nick: 'Chiro2', text: 'sfda' });
      // ct_history.insert_message({ time: 2, nick: 'Chiro3', text: 'sfda' });
      // ct_history.insert_message({ time: 10, nick: 'Chiro4', text: 'sfda', trip: "5SHI" });

      // let data = await ct_history.find_messages(0, 3);
      // let data = await ct_history.find_messages();
      // console.log(data);
      // for (let d of data) {
      //   ct_history.push_message(d);
      // }
    } catch (err) { console.error(err); }
  })();
  ct_history.query();
}
