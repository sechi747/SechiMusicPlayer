import PubSub from 'pubsub-js'
import moment from 'moment'
import request from '../../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: '', //日
    month: '', //月
    recommendList: [], //推荐歌曲列表 
    index: 0, //当前点击的歌曲的下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断用户是否已经登录
    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
        success: () => {
          wx.reLaunch({
            url: '../../../pages/login/login',
          })
        }
      })
    }
    // 更新日期
    let day = moment().format('DD')
    let month = moment().format('MM')
    this.setData({
      day,
      month
    })
    //获取列表数据
    this.getRecommendList()

    //订阅来自play页面的数据
    PubSub.subscribe('switchType', (msg,type) => {
      let {recommendList, index} = this.data
      if (type === 'pre') {
        (index === 0) && (index = recommendList.length)
        index -= 1
      } else {
        (index === recommendList.length - 1) && (index = -1)
        index += 1
      }
      this.setData({
        index
      })
      let musicId = recommendList[index].id //拿到需要的歌曲id
      PubSub.publish('musicId', musicId)
    })
  },
  
  //获取列表数据的功能函数
  async getRecommendList() {
    let recommendListData = await request('/recommend/songs')
    this.setData({
      recommendList : recommendListData.data.dailySongs
    })
  },

  //路由跳转传参
  toPlay(event) {
    let {song, index} = event.currentTarget.dataset
    this.setData({
      index
    })
    wx.navigateTo({
      url: '../play/play?musicId=' + song.id,
    })
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