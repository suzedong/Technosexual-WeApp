//app.js
import Notify from './miniprogram_npm/@vant/weapp/toast/toast';
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    Promise.prototype.ignoreError = function () {
      return this.catch(() => { })
    }

    wx.async = toAsync
    const awx = toAsync('getSetting', 'login', 'request', 'getStorage', 'getUserInfo')
    const that = this;

    (async () => {
      // const p = await new Promise(resolve => {
      //   setTimeout(() => resolve("hello async/await"), 1000)
      // });
      // console.log(p)

      // const res = await awx.getStorage({ key: "blabla" }).catch((error) => { console.log(error) })

      try {
        // const res = await awx.getStorage({ key: "blabla" })

        // 登录
        const { code } = await awx.login();
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('wx.login - code:', code);

        const { session_key } = await loginByOpenid(code);
        console.log('loginByOpenid - session_key:', session_key);
        if (!session_key) { return }

        // 获取用户信息
        const settings = await awx.getSetting();
        if (settings.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          const userInfo = await awx.getUserInfo({ code });
          // 可以将 res 发送给后台解码出 unionId
          console.log('wx.getUserInfo - userInfo:', userInfo)
          this.globalData.userInfo = userInfo.userInfo

          // 解密&后台保存，todo:这里不一定有必要
          await getUserInfo(userInfo.encryptedData, userInfo.iv, session_key)

          // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(userInfo)
          }
        }

      } catch (err) {
        // 处理错误吧
        console.log(err)
      }
    })()

    function promisify(fn) {
      // promisify() 返回的是一个函数，
      // 这个函数跟传入的 fn（即 wx.abcd） 签名相同（或兼容）
      return async function (args) {
        // 接受一个单一参数对象
        return new Promise((resolve, reject) => {
          // 返回一个 Promise 对象
          fn({
            // 调用原函数并使用改造过的新的参数对象
            ...(args || {}),
            // 这个新参数对象得有原本传入的参数，
            // 当然得兼容没有传入参数的情况
            success: res => resolve(res),
            // 注入 success 回调，resovle 它
            fail: err => reject(err)
            // 注入 fail 回调，reject 它
          });
        });
      };
    }

    function toAsync(...names) {    // 这里 names 期望是一个数组
      return (names || [])
        .map(name => (
          {
            name,
            member: wx[name]
          }
        ))
        .filter(t => typeof t.member === "function")
        .reduce((r, t) => {
          r[t.name] = promisify(wx[t.name]);
          return r;
        }, {});
    }

    async function loginByOpenid(code) {
      const res = await awx.request({ url: that.globalData.globalUrl + '/weapp/login?code=' + code })
        .catch((error) => {
          // 网络级错误
          console.log('Error:', error)
          wx.showToast({
            title: '登录错误:' + error.errMsg,
            icon: 'none',
            duration: 2000
          })
        })
        
      console.log('loginByOpenid - res:', res)
      
      if (!res) return { session_key: null }
      
      // 业务级错误
      if (res.data.errmsg) {
        wx.showToast({
          title: '登录错误:' + res.data.errmsg,
          icon: 'none',
          duration: 2000
        })
      }

      console.log('loginByOpenid - res.data:', res.data)
      that.globalData.person = res.data
      return res.data
    }

    async function getUserInfo(encryptedData, iv, session_key) {
      const data = {}
      data.iv = iv
      data.encryptedData = encryptedData
      data.session_key = session_key
      const res = await awx.request({
        method: 'POST',
        url: that.globalData.globalUrl + '/weapp/getUserInfo',
        data: data
      }).catch((error) => { console.log(error) })

      console.log('getUserInfo - res.data:', res.data)
      that.globalData.userInfo = res.data

      const res1 = await awx.request({
        method: 'PUT',
        url: that.globalData.globalUrl + '/api/v1/person/' + that.globalData.person.id,
        data: res.data
      }).catch((error) => { console.log(error) })
      console.log('updateUserInfo - res.data:', res1.data)
    }
  },
  globalData: {
    userInfo: null,
    person: null,
    globalUrl: 'http://localhost:8080'
  }
})