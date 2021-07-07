import PubSub from 'pubsub-js'
import moment from 'moment'
import request from '../../../utils/request'
let appInstance = getApp() //获取全局app实例
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, //是否正在播放
    musicInfo: {}, //歌曲信息
    musicId: '', //歌曲id
    musicUrl: '', //歌曲url
    currentTime: '00:00', //歌曲的进度时长
    durationTime: '00:00', //歌曲的总时长
    currentWidth: 0, //实时进度条长度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let musicId = options.musicId// options 里面是路由跳转传递的参数
    this.getMusicInfo(musicId) //获取歌曲信息
    //判断当前页面的歌曲是否正在播放，如果是，则将isPlay设为true
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      this.setData({
        isPlay : true
      })
    }
    this.backgroundAudioManager = wx.getBackgroundAudioManager() //创建背景音频实例
    this.backgroundAudioManager.onPlay(() => { //监视音乐播放
      this.changePlayState(true)
      appInstance.globalData.musicId = musicId
    })
    this.backgroundAudioManager.onPause(() => { //监视音乐暂停
      this.changePlayState(false)
    })
    this.backgroundAudioManager.onStop(() => { //监视音乐停止
      this.changePlayState(false)
    })
    this.backgroundAudioManager.onTimeUpdate(() => { //监视音乐播放进度
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
      let currentWidth = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 540
      this.setData({
        currentTime,
        currentWidth
      })
    })
    this.backgroundAudioManager.onEnded(() => { //监视音乐结束
      PubSub.publish('switchType', 'next') //当前歌曲结束时自动切换到下一首歌曲
      this.setData({
        currentWidth : 0,
        currentTime : '00:00'
      })
    })
  },

  // 改变播放状态
  changePlayState(isPlay) {
    this.setData({
      isPlay
    })
    appInstance.globalData.isMusicPlay = isPlay //修改全局音乐播放状态
  },

  //获得歌曲信息
  async getMusicInfo(musicId){
    let musicInfo = await request('/song/detail', {ids:musicId})
    let durationTime = moment(musicInfo.songs[0].dt).format('mm:ss')
    this.setData({
      musicInfo : musicInfo.songs[0],
      musicId,
      durationTime
    })
  },

  // 播放/暂停音乐播放的 callback
  handleMusicPlay() {
    let isPlay = !this.data.isPlay
    this.controlMusic(isPlay, this.data.musicId, this.data.musicUrl)
  },

  // 控制音乐播放/暂停的功能函数
  async controlMusic(isPlay, musicId, musicUrl) {
    if (isPlay) {//播放歌曲
      //判断是否已经请求过歌曲url，如果是，则不再重复发起请求
      if (!musicUrl) {
        let musicData = await request('/song/url', {id:musicId}) //获取歌曲url播放地址
        musicUrl = musicData.data[0].url
        this.setData({
          musicUrl
        })
      }

      this.backgroundAudioManager.title = this.data.musicInfo.name //歌曲名
      this.backgroundAudioManager.singer = this.data.musicInfo.ar[0].name //演唱者
      this.backgroundAudioManager.epname = this.data.musicInfo.al.name //专辑名
      this.backgroundAudioManager.coverImgUrl = this.data.musicInfo.al.picUrl //专辑封面
      setTimeout(() => { // 防止出现 The play () request was interrupted by a call to pause (). 原因是调用接口是有延迟的
        this.backgroundAudioManager.src = musicUrl //歌曲播放地址
      },50)
      
    } else { //暂停歌曲
      this.backgroundAudioManager.pause()
    }
  },

  // 切换歌曲的 callback
  handleSwitch(event) {
    let type = event.currentTarget.id
    this.backgroundAudioManager.stop() //切歌的时候先把当前正在播放的歌曲停止
    //订阅recommend页面发布的musicId
    PubSub.subscribe('musicId', (msg,musicId) => {
      this.getMusicInfo(musicId) //拿到切换的歌曲的信息
      this.controlMusic(true, musicId) //切换歌曲后自动播放
      PubSub.unsubscribe('musicId')//取消订阅
    })
    //发布消息数据传到recommend页面
    PubSub.publish('switchType', type)
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