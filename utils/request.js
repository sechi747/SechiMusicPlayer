/* 封装 request 请求函数 */
import config from './config'
export default (url, data = {}, method = 'GET') => {
  return new Promise((resovle, reject) => {
    wx.request({
      url: config.host + url,
      data,
      method,
      header: { //设置 cookie 请求头，如果还没有cookie的数据，请求头的内容为空
        cookie : wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1) : ' '
      },
      success: (res) => {
        // 判断是否为登录请求
        if (data.isLogin) {
          // 将 cookies 存储到本地
          wx.setStorage({
            key: "cookies",
            data: res.cookies
          })
        }
        resovle(res.data)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })

}