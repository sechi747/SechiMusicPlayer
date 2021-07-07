import request from '../../../utils/request'
import Dialog from '@vant/weapp/dialog/dialog'
let isSend = false //函数节流参数
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderDefault: '', //placeholder的默认值
    hotList: [], //热搜榜数据
    recommendSearch: [], //推荐搜索数据
    searchContent: '', //用户在搜索框输入的内容
    searchList: [], //搜索模糊匹配的列表
    isFold: true, //搜索历史的折叠与展开
    historyList: [], //搜索历史记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInitData()
    this.getHistoryList()
  },

  // 请求默认搜索&热搜榜数据&推荐搜索数据
  async getInitData() {
    let placeholderData = await request('/search/default')
    let hotListData = await request('/search/hot/detail')
    let recommendSearchData = await request('/personalized/newsong')
    this.setData({
      placeholderDefault : placeholderData.data.showKeyword,
      hotList : hotListData.data,
      recommendSearch : recommendSearchData.result.slice(0,4)
    })
  },

  //搜索框内容模糊匹配
  handleInput(event) {
    let searchContent = event.detail.value.trim()
    this.setData({
      searchContent
    })
    if (isSend) {
      return
    }
    isSend = true
    this.getSearchList()
    //函数节流
    setTimeout(() => {
      isSend = false
    }, 300)
  },

  //请求搜索模糊匹配的内容
  async getSearchList() {
    if (!this.data.searchContent) {
      this.setData({
        searchList : []
      })
      return
    }
    let {searchContent} = this.data
    let searchListData = await request('/search', {keywords: searchContent, limit: 10})
    this.setData({
      searchList : searchListData.result.songs
    })

  },

  //确认搜索后的 callback
  handleConfirm() {
    let {searchContent, historyList} = this.data
    if (!searchContent.length) {
      return
    }
    if (historyList.indexOf(searchContent) !== -1) {
      historyList.splice(historyList.indexOf(searchContent), 1)
    }
    historyList.unshift(searchContent)
    this.setData({
      historyList
    })
    wx.setStorageSync('historyList', historyList)
  },

  //读取本地的historyList
  getHistoryList() {
    let historyList = wx.getStorageSync('historyList')
    if (historyList) {
      this.setData({
        historyList
      })
    }
  },

  //搜索历史折叠与展开
  handleUnfold() {
    let isFold = !this.data.isFold
    this.setData({
      isFold
    })
  },

  //清空搜索栏内容
  clearSearchContent() {
    this.setData({
      searchContent : '',
      searchList : []
    })
  },

  //清空搜索历史
  clearHistory() {
    Dialog.confirm({
      title: '提示',
      message: '是否清空所有搜索历史？',
      confirmButtonText: '清空',
      cancelButtonText: '取消'
    })
      .then(() => {
        // on confirm
        this.setData({
          historyList : [],
          isFold : true
        })
        wx.removeStorageSync('historyList')
      })
      .catch(() => {
        // on cancel
        return
      });
  },

  //回退到视频页
  backToVideo() {
    wx.navigateBack()
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