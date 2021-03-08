// pages/mine/mine.js
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
const app = getApp()
const awx = wx.async('login', 'request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    person: {},
    show: false,
    value: '',
    hasUserInfo: false
  },

  openFamilyCreate() {
    this.setData({ show: true });
  },
  okFamilyCreate: async function (event) {
    // console.log(event.detail);
    console.log(this.data.value);
    let newFamily = {}
    newFamily.name = this.data.value
    // console.log(app.globalData.person)
    let person = app.globalData.person.person;
    let userInfo = app.globalData.userInfo;
    // person.id = 123

    const res = await awx.request({
      method: 'POST',
      url: app.globalData.globalUrl + '/api/v1/person/' + person.id + '/family',
      data: newFamily
    }).catch((error) => { console.log('/api/v1/person/' + person.id + '/family', error) })
    console.log('request:', res)
    if (res.statusCode!=200) {
      Notify(res.data.msg);
      return fasle
    }
    const family = res.data
    let newFamilyItem = {}
    newFamilyItem.isFamilyCreater = 1 // 建立者
    newFamilyItem.name = userInfo.nickName
    newFamilyItem.person_id = family.person_id
    newFamilyItem.familyrole_id = 1 // 户主
    const res1 = await awx.request({
      method: 'POST',
      url: app.globalData.globalUrl + '/api/v1/family/'+family.id+'/familyitem',
      data: newFamilyItem
    }).catch((error) => { console.log('Error:', error) })
    console.log('request:', res1)
    if (res1.statusCode!=200) {
      Notify(res1.data.msg);
      return fasle
    }

    Notify({ type: 'success', message: '成功：建立新家庭！' });
  },
  onClose() {
    this.setData({ show: false });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }

    // console.log(app.globalData.person)
    if (app.globalData.person) {
      this.setData({
        person: app.globalData.person
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getTabBar().init();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})