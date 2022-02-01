class Dm {
  TYPE_STATIC = "s";
  TYPE_ROLLING = "r";
  constructor(args) {
    // nick, trip, text, type, color, delay, line, id
    this.nick = args.nick, this.trip = args.trip, this.text = args.text, this.type = args.type, this.color = args.color, this.delay = args.delay;
    this.line = args.line;
    this.id = args.id;
    this.level = args.level;
    this.me = args.me;
  }
  createDom() {
    let el = undefined;
    let classNameList = {
      "2": "member",
      "4": "admin",
    };
    let className = classNameList['' + this.level];
    if (!className) className = "";
    if (this.me) className = "me";
    if (this.type == this.TYPE_ROLLING) {
      el = $$(`<div style="position: absolute; white-space: nowrap; -webkit-text-stroke: 0.2px black; 
    font-weight: 1200;" id="danmaku-id-${this.id}" class="${className}"><div><h5><span class="span">${this.trip ? ('' + this.trip + ' ') : ''}</span><span class="nick" style="float: none; margin-left: 0">${this.nick}</span></h5><h1 style="color: ${this.color || 'white'}; margin-top: -10px">${this.text}</h1></div></div>`);
    } else {
      el = $$(`<div style="white-space: nowrap; -webkit-text-stroke: 0.2px black; 
      font-weight: 1200; text-align: center; width: 100%" id="danmaku-id-${this.id}" class="${className}"><div><h5><span class="span">${this.trip ? ('' + this.trip + ' ') : ''}</span><span class="nick" style="float: none; margin-left: 0">${this.nick}</span></h5><h1 style="color: ${this.color || 'white'}; margin-top: -10px">${this.text}</h1></div></div>`);
    }
    console.log(this, el);
    return el;
  }
};

export class Danmaku {
  TYPE_STATIC = "s";
  TYPE_ROLLING = "r";
  colors = [
    "#FFFFFF", "#9B9B9B", "#CC0273", "#89D5FF", "#4266BE",
    "#019899", "#00CD00", "#A0EE00", "#FFFF00", "#FFD302", "#FFAA02", "#FE0302"
  ];
  constructor() {
    // 弹幕池
    // this.danmakus = [];
    // 现在右边的行数，从lineNow开始放弹幕
    this.lineRollingNow = 0;
    this.lineRollingStart = 3;
    this.lineRollingStop = 8;
    this.lineStaticNow = {};
    this.lineStaticStart = 2;
    // danmaku编号
    this.danmakuId = 0;
    this.getStaticLine = this.getStaticLine.bind(this);
    this.doneStaticLine = this.doneStaticLine.bind(this);
    this.addDanmaku = this.addDanmaku.bind(this);
    this.showDanmaku = this.showDanmaku.bind(this);
  }
  getStaticLine() {
    let i = 0;
    while (this.lineStaticNow[`_${i}`]) i++;
    this.lineStaticNow[`_${i}`] = true;
    return i;
  }
  doneStaticLine(line) {
    this.lineStaticNow[`_${line}`] = false;
  }
  async addDanmaku(args) {
    $$("#danmaku-pool").css({marginTop: 100});
    // nick, trip, text, type, color, delay
    let dm = undefined;
    let levelTime = [
      6000,	// guest
      8000, // user
      10000, // member
      10000, // bot
      10000, // admin
    ];
    let levelTimeDefault = levelTime[0];
    let time = levelTime[args.level];
    if (time === undefined) time = levelTimeDefault;
    args.delay = time;
    args.color = this.colors[args.color];
    args.id = this.danmakuId;

    if (args.type == this.TYPE_ROLLING) {
      args.line = this.lineRollingNow + this.lineRollingStart;
      dm = new Dm(args);
      this.lineRollingNow++;
      if (this.lineRollingStop === this.lineRollingNow) this.lineRollingNow = 0;
    } else {
      args.line = this.getStaticLine() + this.lineStaticStart;
      dm = new Dm(args);
    }
    this.danmakuId++;
    await this.showDanmaku(dm);
  }
  showDanmaku(dm) {
    return new Promise(resolve => {
      let el = dm.createDom();
      $$("#danmaku-pool").append(el);
      // console.log(el.height(), el.width(), el.position());
      if (dm.type == this.TYPE_ROLLING) {
        el.css({
          top: dm.line * el.height(),
          right: -el.width(),
        });
        el.animate({
          right: $$("html").width() + el.width(),
        }, dm.delay, "linear", () => {
          this.lineStaticStart--;
          el.remove();
          console.log('done!');
          resolve();
        });
      } else /* if (dm.type == this.TYPE_STATIC) */ {
        el.css({
          // marginTop: (dm.line - this.lineStaticStart) * el.height(),
        });
        setTimeout(() => {
          this.doneStaticLine(dm.line - this.lineStaticStart);
          el.remove();
          console.log('done');
          resolve();
        }, dm.delay);
      }
    })
  }
};