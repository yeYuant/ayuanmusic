import request from '../../utils/request'

// pages/personal/personal.js
let startY = 0
let moveY = 0
let moveDistance = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTranslate: '', // 移动距离
    coverTransition: 'all 0.7s linear', // 过渡动画
    userInfo: {}, // 登录的用户信息
    recentPlayList: [] // 最近播放列表数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: JSON.parse(userInfo)
      })
      let userId = this.data.userInfo.userId
      wx.setStorageSync('userId', userId)

      this.getUserRecentPlay(this.data.userInfo.userId)
    }

    // this.getUserLikeList(this.data.userInfo.userId)
  },
  // 获取用户  最近播放 列表id
  // async getUserLikeList(uid) {
  //   let res = await request('/likelist', {
  //     uid
  //   })
  //   console.log(res);
  // },


  // 获取用户最近播放列表数据
  async getUserRecentPlay(userId) {
    let recentPlay = await request('/user/record', {
      uid: userId,
      type: 1
    })
    let index = 0
    let recentPlayList = recentPlay.weekData.slice(0, 27).map(item => {
      item.id = index++
      return item
    })
    this.setData({
      recentPlayList: recentPlayList
    })
    // let result = await request('/likelist', {
    //   uid: userId
    // })
    // console.log(result);
  },

  // 跳转到登录页面的回调
  toLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 手指点击事件
  handelTouchStart(e) {
    // 手指初始的位置
    startY = e.touches[0].clientY
    this.setData({
      coverTransition: ''
    })
  },
  // 手指移动事件
  handelTouchMove(e) {
    // 手指移动之后的位置
    moveY = e.touches[0].clientY
    // 移动的距离等于 移动之后的位置-初始位置
    moveDistance = moveY - startY

    if (moveDistance <= 0) {
      return
    }
    if (moveDistance >= 80) {
      moveDistance = 80
    }
    this.setData({
      coverTranslate: `translateY(${moveDistance}rpx)`
    })
  },
  // 手指离开事件
  handelTouchEnd() {
    moveDistance = 0
    this.setData({
      coverTranslate: `translateY(${moveDistance}rpx)`,
      coverTransition: 'all 0.5s linear'
    })
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