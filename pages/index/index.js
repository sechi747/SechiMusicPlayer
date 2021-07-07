// pages/index/index.js
import request from '../../utils/request.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList:[],  //轮播图数据
    recommendList:[],   //推荐歌单数据
    topList:[],   //排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    //加载banner
    let bannerListData = await request('/banner', {type: 2})
    this.setData({
      bannerList : bannerListData.banners,
    })
    //加载推荐歌单
    let recommendListData = await request('/personalized', {limit: 10})
    this.setData({
      recommendList : recommendListData.result
    })
    //加载排行榜
    let index = 0
    let resultArr = []
    while (index < 5) {
      let listData = await request('/toplist')
      let listId = listData.list[index].id
      let topListData = await request('/playlist/detail', {id: listId})
      let topListItem = {name: topListData.playlist.name, tracks: topListData.playlist.tracks.slice(0,3)}
      resultArr.push(topListItem)
      this.setData({
        topList : resultArr
      })
      index++
    }
  },

  // 跳转到每日推荐页面
  toRecommend() {
    wx.redirectTo({
      url: '/recommendPackage/pages/recommend/recommend',
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