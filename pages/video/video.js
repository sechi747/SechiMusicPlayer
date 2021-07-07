import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], //视频导航栏标题
    navId: '', //视频导航栏id
    videoList: [], //视频列表
    videoId: '', //正在播放的视频id
    pid: '', //视频id
    videoUrl: '', //视频url
    videoUpdateTime: [], //video 播放的时长
    isTriggered: false, //显示下拉刷新
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getVideoGroupListData()
  },

  // 获取视频导航栏的数据
  async getVideoGroupListData() {
    let videoGroupListData = await request('/video/group/list')
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 14),
      navId: videoGroupListData.data[0].id //给 navId 设置一个初始值，使得导航栏的第一项被选中
    })
    this.getVideoList(this.data.navId, 0)
  },

  // 获取视频列表的数据
  async getVideoList(navId, offset) {
    let videoListData = await request('/video/group', {
      id: navId,
      offset: offset
    })
    wx.hideLoading() // 关闭加载提示框
    let index = 0
    let videoList = videoListData.datas.map(item => {
      item.id = index++
      return item
    })
    this.setData({
      videoList,
      isTriggered: false //关闭下拉刷新
    })
  },

  // 点击切换导航的 callback
  changeNav(event) {
    let navId = event.currentTarget.id // 使用id方法获取数据的时候会将数据自动转换为 string，所以需要在下面更新数据的时候重新将其转换为 num
    // let navId = event.currentTarget.dataset.id
    this.setData({
      navId: navId >>> 0, // >>> 是位移运算符，它先将数据转换为二进制，然后进行位移。>>>0则会强制将数据的类型转换为 num
      videoList: []
    })
    // 加载页面提示框
    wx.showLoading({
      title: '正在加载',
    })
    // 动态切换视频列表
    this.getVideoList(this.data.navId, 0)
  },

  // 播放或继续播放视频的 callback
  handlePlay(event) {
    let pid = event.currentTarget.id;
    pid !== this.data.pid && this.videoContext && this.videoContext.stop();
    this.videoContext = wx.createVideoContext(pid)
    let {videoUpdateTime} = this.data
    let videoItem = videoUpdateTime.find(item => item.vid === pid)
    if (videoItem) {
      this.videoContext.seek(videoItem.currentTime)
    }
    this.videoContext.play();
    this.setData({
      pid
    })
  },
  
  // 点击播放的 callback
  async play(event) {
    let videoId = event.currentTarget.id;
    let index = event.currentTarget.dataset.index //获取当前视频在videoList中的index
    this.setData({
      videoId
    })
    let videoUrlData = await request('/video/url', {id: videoId}) //获取当前视频的url
    let urlInfo = "videoList["+index+"].data.urlInfo"; //提前把对象字符串存储到变量中
    this.setData({
      [urlInfo] : videoUrlData.urls[0].url //访问对象属性有两种方法：点（.）方法和中括号（[]）方法，比如 obj 对象下有一个 name 属性，点方法：obj.name；中括号方法 obj ['name']; 这里的中括号的字符串也可以用变量代替；
    })
  },

  // 监听视频播放进度的 callback
  handleTimeUpdate(event) {
    //videoTimeObj是存储在videoUpdateTime中的数组
    let videoTimeObj = {
      vid: event.currentTarget.id,
      currentTime: event.detail.currentTime
    }
    let {videoUpdateTime} = this.data //es6解构赋值写法
    //找到当前监视的视频 
    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid)
    //判断当前这个视频的进度是否已经被存储了，如果是，那就只修改进度；如果不是，那就保存为一个新的对象放到数组中
    if (videoItem) {
      videoItem.currentTime = event.detail.currentTime
    } else {
      videoUpdateTime.push(videoTimeObj)
    }
    this.setData({
      videoUpdateTime
    })
  },

  // 视频播放结束时的 callback
  handleEnded(event) {
    let {
      videoUpdateTime
    } = this.data
    //找到播放结束的视频，并把它的进度信息删除
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id), 1)
    this.setData({
      videoUpdateTime
    })
  },

  //下拉刷新的 callback
  handleRefresher() {
    this.getVideoList(this.data.navId, 0)
  },

  //划到底端加载新内容(有缺陷，offset是固定的)
  async handleLoader() {
    let newVideoListData = await request('/video/group', {
      id: this.data.navId,
      offset: 8
    })
    let videoList = this.data.videoList
    videoList.push(...newVideoListData.datas)
    this.setData({
      videoList
    })
  },

  //跳转到搜索页面
  toSearch() {
    wx.navigateTo({
      url: '/searchPackage/pages/search/search',
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
  onShareAppMessage: function ({
    from
  }) {
    let userInfo = JSON.parse(wx.getStorageSync('userInfo'))
    if (from === 'button') {
      return {
        title: userInfo.nickname + '向您分享了这个视频',
        path: '/pages/video/video',
        imageUrl: '/static/img/守望.jpg'
      }
    } else {
      return {
        title: userInfo.nickname + '向您分享了这个小程序',
        path: '/pages/video/video',
        imageUrl: '/static/img/守望.jpg'
      }
    }
  }
})