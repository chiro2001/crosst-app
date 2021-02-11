(function () {
  window["$$"] = jQuery;
  var screeWidth;
  var screeHeight;
  // var img;
  var my_canvas;
  var context;

  var size = 3;
  //弧度常量
  var radis = Math.PI / 180;
  //精灵粒子,全局的
  var spriteArray = new Array();
  //创建烟花队列
  var gloablYanhuaArray = new Array();
  // gloablYanhuaArray.push(YANHUAOBJ(800, 400, 50, size, 0));
  // gloablYanhuaArray.push(YANHUAOBJ(200, 400, 50, size, 1));
  //gloablYanhuaArray.push( YANHUAOBJ(400,400,50,size));

  function onWindowResize() {
    // alert(1);
    screeWidth = window.innerWidth;
    screeHeight = window.innerHeight;
    $$("#fireworks-ground").attr("width", screeWidth);                                                  
    $$("#fireworks-ground").attr("height", screeHeight);
  }
  function clearg() {
    for (var i = 0; i < gloablYanhuaArray.length; i++) {
      if (gloablYanhuaArray[i].dead) {
        gloablYanhuaArray.splice(i, 1);
      }
    }
  }
  function draw() {
    //console.log("精灵总数："+spriteArray.length+",大烟花："+gloablYanhuaArray.length);
    clearg();
    context.clearRect(0, 0, my_canvas.width, my_canvas.height);
    context.fillStyle = "#fff";;
    if (spriteArray.length) {
      // context.fillText("Fireworks:" + gloablYanhuaArray.length + ",particles:" + spriteArray.length, 0, 15);
      // context.fillText("" + gloablYanhuaArray.length + "," + spriteArray.length, 0, 10);
    }
    context.drawImage(getCatcheCanvas(), 0, 0, screeWidth, screeHeight);

  }
  //缓存绘图
  function getCatcheCanvas() {
    var canvas = document.createElement('canvas');
    canvas.width = screeWidth;
    canvas.height = screeHeight;
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height)
    //绘制粒子
    for (var j = 0; j < spriteArray.length; j++) {

      var bb = spriteArray[j].color;
      var color = bb.substring(0, bb.lastIndexOf(",")) + "," + spriteArray[j].alpha + ")";
      //var color = "rgba(255,255,255,"+spriteArray[j].alpha+")";
      //color=spriteArray[j].color;
      context.fillStyle = color
      var csize = spriteArray[j].size;
      context.beginPath();
      context.fillRect(spriteArray[j].x - csize / 2, spriteArray[j].y - csize / 2, spriteArray[j].size, spriteArray[j].size);
      //context.arc(spriteArray[j].x,spriteArray[j].y,spriteArray[j].size,0,Math.PI*2,true);
      //context.drawImage(generateSprite(color,spriteArray[j].alpha),spriteArray[j].x,spriteArray[j].y,spriteArray[j].size,spriteArray[j].size)
      //context.drawImage(document.getElementById("tulip"),spriteArray[j].x,spriteArray[j].y,25,25);
      context.closePath();
      context.fill();;
      if (spriteArray[j].deaded) {
        spriteArray.splice(j, 1);;
      }
    }

    //绘制烟花
    for (var j = 0; j < gloablYanhuaArray.length; j++)//烟花队列
    {
      for (var i = 0; i < gloablYanhuaArray[j].yanhuaArray.length; i++)//每个烟花
      {
        var bb = gloablYanhuaArray[j].yanhuaArray[i].color;
        var color = bb.substring(0, bb.lastIndexOf(",")) + "," + gloablYanhuaArray[j].yanhuaArray[i].alpha + ")";

        context.fillStyle = "rgba(255,255,255,1)";
        context.beginPath();
        //context.arc(gloablYanhuaArray[j].yanhuaArray[i].x,gloablYanhuaArray[j].yanhuaArray[i].y,gloablYanhuaArray[j].yanhuaArray[i].size,0,Math.PI*2,true);
        var csize = gloablYanhuaArray[j].yanhuaArray[i].size * 5;
        //context.fillRect(gloablYanhuaArray[j].yanhuaArray[i].x-csize/2,gloablYanhuaArray[j].yanhuaArray[i].y - csize/2,gloablYanhuaArray[j].yanhuaArray[i].size,gloablYanhuaArray[j].yanhuaArray[i].size);
        //context.drawImage(img,gloablYanhuaArray[j].yanhuaArray[i].x,gloablYanhuaArray[j].yanhuaArray[i].y,25,25);

        context.drawImage(generateSprite(color, 1), gloablYanhuaArray[j].yanhuaArray[i].x - csize / 2, gloablYanhuaArray[j].yanhuaArray[i].y - csize / 2, csize, csize);
        context.closePath();
        context.fill();;
        //context.arc(yanhuaArray[i].x, yanhuaArray[i].y, yanhuaArray[i].size, 0, Math.PI * 2, true);
        //yanhuaArray[i].dirY+=0.5;
        gloablYanhuaArray[j].yanhuaArray[i].update();

      }
      if (gloablYanhuaArray[j].deaded) {
        gloablYanhuaArray[j].splice(j, 1);;
      }
    }

    return canvas;
  }
  //生成烟花贴图
  function generateSprite(colorStr, alpha) {

    var canvas = document.createElement('canvas');
    canvas.width = 5;
    canvas.height = 5;
    //var color =  colorStr.substring(0,colorStr.lastIndexOf(","))+","+alpha+")";
    var color = colorStr;
    var context = canvas.getContext('2d');
    var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;

  }
  //烟花对象
  function YANHUAOBJ(x, y, count, size, colormain) {

    var yanhua = new Object();
    yanhua.x = x;
    yanhua.y = y;
    yanhua.size = size;
    yanhua.childCount = count;
    yanhua.dead = false;
    yanhua.yanhuaArray = new Array();
    yanhua.alpha = 1;

    yanhua.r = 255;
    yanhua.g = 255;
    yanhua.b = 255;
    /*
      var rand =  Math.floor(Math.random()*3);
        if(rand ==0){
        yanhua.r = Math.floor(Math.random()*255);
      }else if(rand ==1){
        yanhua.g = Math.floor(Math.random()*255);
      }else if(rand ==2){
        yanhua.b = Math.floor(Math.random()*255);
      }
      */
    yanhua.color = "rgba(" + yanhua.r + "," + yanhua.g + "," + yanhua.b + "," + yanhua.alpha + ")";
    for (var i = 0; i < yanhua.childCount; i++) {
      yanhua.yanhuaArray.push(YANHUA(yanhua.x, yanhua.y, yanhua.size, yanhua.color, colormain));
    }
    yanhua.update = setInterval(function () {
      if (yanhua.alpha > 0) {
        yanhua.alpha -= 0.1;
      }
      for (var j = 0; j < yanhua.yanhuaArray.length; j++) {
        if (yanhua.yanhuaArray[j].dead) {
          yanhua.yanhuaArray.splice(j, 1);
        }
      }
      if (yanhua.yanhuaArray.length == 0) {
        yanhua.dead = true;
        clearInterval(yanhua.update);
      }
    }, 200);

    return yanhua;
  }
  function YANHUA(x, y, size, color, colormain) {
    var yanhuaObj = new Object();
    yanhuaObj.x = x,
      yanhuaObj.y = y;
    yanhuaObj.orgX = x;
    yanhuaObj.orgY = y;
    yanhuaObj.size = size;
    yanhuaObj.v = (Math.random() * 10); //爆炸初速度
    yanhuaObj.a = 0.07;//爆炸加速度
    yanhuaObj.angle = Math.floor(Math.random() * 360) * radis;//随机弧度
    yanhuaObj.vx = yanhuaObj.v * Math.cos(yanhuaObj.angle); //水平分速度
    yanhuaObj.vy = yanhuaObj.v * Math.sin(yanhuaObj.angle);//垂直分速度

    yanhuaObj.dirX = (Math.random() * 10 - 5);
    yanhuaObj.dirY = (Math.random() * 10 - 5);
    yanhuaObj.alpha = 1;
    yanhuaObj.dead = false;

    yanhuaObj.color = color;
    yanhuaObj.flag = false;

    yanhuaObj.r = 255;
    yanhuaObj.g = 255;
    yanhuaObj.b = 255;
    yanhuaObj.colormain = colormain;
    var step = 10;
    var step1 = 20;
    yanhuaObj.update = function () {
      if (yanhuaObj.colormain == 0) {
        yanhuaObj.g -= step;
        yanhuaObj.b -= step;
      } else if (yanhuaObj.colormain == 1) {
        yanhuaObj.r -= step;
        yanhuaObj.b -= step;
      } else if (yanhuaObj.colormain == 2) {
        yanhuaObj.r -= step;
        yanhuaObj.g -= step;
      } else if (yanhuaObj.colormain == 3) {
        var rand = Math.floor(Math.random() * 3);
        if (rand == 0) {
          yanhuaObj.g -= step;
          yanhuaObj.b -= step;
        } else if (rand == 1) {
          yanhuaObj.r -= step;
          yanhuaObj.b -= step;
        } else if (rand == 2) {
          yanhuaObj.r -= step;
          yanhuaObj.g -= step;
        }
      }

      yanhuaObj.color = "rgba(" + yanhuaObj.r + "," + yanhuaObj.g + "," + yanhuaObj.b + "," + yanhuaObj.alpha + ")";
      if (yanhuaObj.size <= 0) {
        yanhuaObj.flag = true;
      }
      if (yanhuaObj.size > 0 && !yanhuaObj.flag) {
        yanhuaObj.size = yanhuaObj.size - 0.5;
      } else {
        if (yanhuaObj.size < 5) {
          yanhuaObj.size = yanhuaObj.size + 0.4;
        }
      }
      yanhuaObj.y += 0.4;
      if (yanhuaObj.v >= 0) {
        yanhuaObj.v += yanhuaObj.a -= 0.02;
        yanhuaObj.vx = yanhuaObj.v * Math.cos(yanhuaObj.angle); //水平分速度
        yanhuaObj.vy = yanhuaObj.v * Math.sin(yanhuaObj.angle);//垂直分速度
        var disR = (yanhuaObj.x - yanhuaObj.orgX) * (yanhuaObj.x - yanhuaObj.orgX) + (yanhuaObj.y - yanhuaObj.orgY) * (yanhuaObj.y - yanhuaObj.orgY);
        if (disR < 56000) {
          //yanhuaObj.dirX=yanhuaObj.dirX*2;
          //yanhuaObj.dirY=yanhuaObj.dirY*2;
          yanhuaObj.x += yanhuaObj.vx;
          yanhuaObj.y += yanhuaObj.vy;

        } else if (disR > 56000) {
          yanhuaObj.x = yanhuaObj.orgX,
            yanhuaObj.y = yanhuaObj.orgY;

          yanhuaObj.UPDATE();
        }
      } else {
        yanhuaObj.dead = true;
        if (yanhuaObj.alpha > 0) {
          //yanhuaObj.alpha-=0.001;

        } else {
          yanhuaObj.alpha = 0;
        }

      }

    }
    //实现拖尾，每100毫秒产生一个尾巴

    yanhuaObj.tail = setInterval(function () {

      if (!yanhuaObj.dead) {
        spriteArray.push(sprite(yanhuaObj.x, yanhuaObj.y, yanhuaObj.size, yanhuaObj.color));
      } else {
        clearInterval(yanhuaObj.tail);
      }
    }, 50);
    yanhuaObj.UPDATE = function () {
      yanhuaObj.dirX = (Math.random() * 10 - 5);
      yanhuaObj.dirY = (Math.random() * 10 - 5);
      yanhuaObj.r = 255;
      yanhuaObj.g = 255;
      yanhuaObj.b = 255;

      var rand = Math.floor(Math.random() * 3);
      if (rand == 0) {
        yanhuaObj.r = Math.floor(Math.random() * 255);
      } else if (rand == 1) {
        yanhuaObj.g = Math.floor(Math.random() * 255);
      } else if (rand == 2) {
        yanhuaObj.b = Math.floor(Math.random() * 255);
      }
      yanhuaObj.color = "rgba(" + yanhuaObj.r + "," + yanhuaObj.g + "," + yanhuaObj.b + "," + yanhuaObj.alpha + ")";
    }

    return yanhuaObj;
  }

  var mouseX;
  var mouseY;
  function mousemove(e) {
    e = e ? e : window.event;
    mouseY = e.clientY;
    mouseX = e.clientX;
    // gloablYanhuaArray.push( YANHUAOBJ(mouseX,mouseY,10,size));
    //spriteArray.push(sprite(mouseX,mouseY,50,"rgba(255,0,0,1)"));
    //console.log("gloablYanhuaArray.length:"+gloablYanhuaArray.length);
    //draw();
  }
  function mousedown(e) {
    e = e ? e : window.event;
    mouseY = e.clientY;
    mouseX = e.clientX;
    gloablYanhuaArray.push(YANHUAOBJ(mouseX, mouseY, 50, size));
  }
  function explod(colormain = undefined, size2 = 50) {
    var border = 300;
    var x = Math.random() * (screeWidth);
    var y = Math.random() * (screeHeight);
    if (colormain === undefined)
      colormain = Math.floor(Math.random() * 4);
    gloablYanhuaArray.push(YANHUAOBJ(x, y, size2, size, colormain));
  }
  function sprite(x, y, size, color) {
    var sprite = new Object();
    sprite.g = 5;
    sprite.x = x,
      sprite.y = y;
    sprite.orgX = x;
    sprite.orgY = y;
    sprite.size = size;
    sprite.color = color;
    sprite.deaded = false;
    sprite.alpha = 1;
    sprite.r = 255;
    sprite.g = 255;
    sprite.b = 255;
    var rand = Math.floor(Math.random() * 3);



    sprite.dead = setInterval(function () {
      sprite.alpha = sprite.alpha - 0.06;
      sprite.size = sprite.size - 0.1;
      sprite.alpha = sprite.alpha.toFixed(1);
      if (sprite.alpha == 0) {
        sprite.deaded = true;
        //console.log(sprite.deaded);
        clearInterval(sprite.dead);
      }
    }, 120);

    return sprite;
  }

  // main
  // img = document.getElementById("tulip");
  my_canvas = $$("#fireworks-ground");
  //screeWidth = window.innerWidth;
  //screeHeight = window.innerHeight;
  //$$("#fireworks-ground").attr("width", screeWidth);
  //$$("#fireworks-ground").attr("height", screeHeight);
  onWindowResize();
  my_canvas = my_canvas[0];
  context = my_canvas.getContext("2d");
  // setInterval("draw()", 80);
  // setInterval("explod()", 500);
  function loopDraw() {
    draw();
    setTimeout(loopDraw, 0);
  }
  function loopExplod() {
    explod();
    setTimeout(loopExplod, 10000);
  }
  loopDraw();
  // loopExplod();
  // 暴露接口
  window['explod'] = explod;
  window.addEventListener('resize', onWindowResize, false);
})();
