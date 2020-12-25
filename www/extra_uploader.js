

cbase = new CBase();


function b64Encode(str) {
  return btoa(encodeURIComponent(str));
}

function b64Decode(str) {
  return decodeURIComponent(atob(str));
}

function randomString(len) {
  len = len || 32;
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  var maxPos = $chars.length;
  var pwd = '';
  for (i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

//imgToken = 'PP8y8OFkPv17aBTnsy1KAuQqqvAP48VW';
function uploadImage(data, filename, callback) {
  if (!filename) {
    filename = randomString(6) + '.jpg';
  }
  rand_str = randomString(6);
  // filename = randomString(6) + '_' + filename;
  console.log('upload file:', filename)

  if (!cbase) {
    console.log("CBase error!");
    return;
  }
  return (async function (rand_str2) {
    await cbase.write('files/' + rand_str2 + '/' + filename, data).then(function (d) {
      callback({
        'success': true,
        'message': undefined,
        'cos_url': 'https://bed-1254016670.cos.ap-guangzhou.myqcloud.com/files/' + rand_str2 + '/' + filename
      })
    });
  })(rand_str);
}

function figurebedUpload() {
  if (typeof pushMessage === 'undefined') return;
  if (!$('#file').files.length === 0) {
    pushMessage({
      nick: '!',
      text: '请先选择文件。'
    });
    return;
  }
  pushMessage({
    nick: '*',
    text: '文件开始上传。'
  });
  let promises = [];
  for (file of $('#file').files) {
    promises.push(uploadImage(file, file.name, function (r) {
      // console.log(r.message)
      if (r.success && !r.cos_url) {
        url = r.data.url;
      } else {
        if (r.cos_url) {
          url = r.cos_url;
        } else
          return;
      }
      url = encodeURI(url);
      // console.log(url);
      if (typeof insertAtCursor !== 'undefined')
        insertAtCursor('![img](' + url + ')\n')
    }));
  }
  Promise.all(promises).then(() => {
    pushMessage({
      nick: '*',
      text: '文件全部上传完成。'
    });
  })
}
