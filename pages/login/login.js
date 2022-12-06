import request from '../../utils/request'
// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '', // 用户的登录手机号
    password: '' // 用户的登录密码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  // 用户登录验证的回调函数
  handelInput(e) {
    let type = e.currentTarget.id
    this.setData({
      [type]: e.detail.value
    })
  },

  // 登录的回调函数
  async login() {
    const {
      phone,
      password
    } = this.data
    // 进行前端验证
    // 验证 手机号不能为空
    if (!phone) {
      wx.showToast({
        title: '手机号不能为空!',
        icon: 'error'
      })
      return;
    }
    // 正则: 手机号的正则表达式验证
    const phoneReg = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '手机号格式错误!',
        icon: 'error'
      })
      return;
    }
    // 验证 密码不能为空
    if (!password) {
      wx.showToast({
        title: '密码不能为空!',
        icon: 'error'
      })
      return;
    }
    let res = await request('/login/cellphone', {
      phone,
      password,
      isLogin: true
    })
    // 进行后端验证
    if (res.code == 200) {
      wx.showToast({
        title: '登录成功!',
        icon: 'success'
      })

      // 将用户信息存储到本地
      wx.setStorageSync('userInfo', JSON.stringify(res.profile))
      // 跳转至个人中心页面
      wx.reLaunch({
        url: '/pages/personal/personal'
      })
    } else if (res.code == 400) {
      wx.showToast({
        title: '手机号错误!',
        icon: 'error'
      })
      return
    } else if (res.code == 502) {
      wx.showToast({
        title: '密码错误!',
        icon: 'error'
      })
      return
    } else {
      wx.showToast({
        title: '登录失败,请重试后在登录!',
        icon: 'none'
      })
      return
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})