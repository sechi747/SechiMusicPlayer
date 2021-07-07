import request from '../../utils/request'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}, //用户信息
    recentPlayList: [], //最近播放
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo : JSON.parse(userInfo)
      })
      this.getRecentPlayList(this.data.userInfo.userId)
    }
  },
  // 请求最近播放数据的功能函数
  async getRecentPlayList(userId) {
    let recentPlayData = await request('/user/record', {uid: userId, type:1})
    let index = 0
    let recentPlayList = recentPlayData.weekData.map(item => {
      item.id = index++
      return item
    })
    this.setData({
      recentPlayList
    })
  },
  // 跳转到登录界面
  toLogin() {
    if (this.data.userInfo.nickname) {
      return
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
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