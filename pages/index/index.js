//index.js
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
//获取应用实例
const app = getApp()
const awx = wx.async('login', 'request')

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onTap: function (e) {
    //在这里不能用navigateTo或者redirectTo，官网文档，这两个指定跳转到一个页面，但是不能跳转到tabbar页面，
    // 这个项目app.json中，pages中首先显示的是welcome页面，但是在tabbar配置中，首个是posts页面， 不符合逻辑，
    //所以在首先显示的welcome页面中，不会显示tabbar，则这里就成了从无tabbar页面跳转到有tabbar页面，所以这两个路由跳转不可以用
    wx.reLaunch({
      url: '../home/home'
    })
  },
  onLoad: function () {

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        // console.log('index.js - userInfoReadyCallback:', res.userInfo)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        }),
        wx.reLaunch({
          url: '../home/home'
        })

        // (async () => {
        //   const res = await awx.request({ url: app.globalData.globalUrl + '/health' })
        //     .catch((error) => { console.log(error) })

        //   console.log('test health:', res.data)
        // })()

      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: async function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    if (!session_key) { return }
    
    let that = app
    const encryptedData = e.detail.encryptedData
    const iv = e.detail.iv
    const session_key = that.globalData.person.session_key
    // console.log(encryptedData, iv, session_key)
    // 解密&后台保存
    await getUserInfo(encryptedData, iv, session_key)

    wx.reLaunch({
      url: '../home/home'
    })

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
  getPhoneNumber(e) {
    Notify(e.detail.errMsg);
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
  }
})
