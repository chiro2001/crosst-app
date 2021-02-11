var utils = {
  exec: function (func) {
    return new Promise(resolve => {
      cv['onRuntimeInitialized'] = () => {
        func();
        resolve();
      }
    })
  },
  sleep: function(time) {
    return new Promise(resolve => {
      setTimeout(resolve, time);
    });
  }
};
if (!window['utils']) window['utils'] = utils;
