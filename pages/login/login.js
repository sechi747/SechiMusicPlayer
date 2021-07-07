import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '', //保存用户输入的手机号
    password: '', //保存用户输入的密码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  // 表单内容发生改变时的 callback
  handleInput(event) {
    let type = event.currentTarget.dataset.type // 拿到提前设置好的type属性来判断用户输入的信息是什么
    // let type = event.currentTarget.id   使用设置 id 的方法来拿到type
    this.setData({
      [type]: event.detail.value //对象中的属性是个变量时需要加 [], 后面传入的值为用户输入的值
    })
  },
  // 点击登录后的 callback
  async login () {
    let {phone, password} = this.data

    if (!phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'error'
      })
      return
    }
    // 定义一个正则表达式，用它的 test 方法来检验手机号格式
    let phoneReg = /^1(3|4|5||7|8|9)\d{9}$/
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'error'
      })
      return
    }

    if (!password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'error'
      })
      return
    }

    let result = await request('/login/cellphone', {phone, password, isLogin:true})

    if (result.code === 200) {
      wx.showToast({
        title: '登录成功',
      })
      // 存储用户信息
      wx.setStorageSync('userInfo', JSON.stringify(result.profile))
      wx.reLaunch({
        url: '/pages/personal/personal',
      })
    } else if (result.code === 502) {
      wx.showToast({
        title: '密码错误',
        icon: 'error'
      })
    } else if (result.code === 400) {
      wx.showToast({
        title: '手机号错误',
        icon: 'error'
      })
    } else {
      wx.showToast({
        title: '登录失败，请尝试重新登录',
        icon: 'error'
      })
    }
   
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