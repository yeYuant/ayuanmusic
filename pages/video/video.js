// pages/video/video.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], //视频分类数据列表
    videoList: [], // 视频数据列表
    navId: '', // 视频列表的ID
    videoId: '', // 当前点击的视频的id
    videoUpdataTime: [], // 视频的播放进度
    isTriggered: false, // 控制视频列表刷新
    arr: [1, 2],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getVideoGroupList()
  },

  // 获取视频分类列表
  async getVideoGroupList() {
    let res = await request('/video/group/list')
    this.setData({
      videoGroupList: res.data.slice(0, 12),
      navId: res.data[0].id
    })
    this.getVideoList(this.data.navId)
  },

  // 获取视频数据
  async getVideoList(navId) {
    let index = 0
    let videoListData = await request('/video/group', {
      id: navId,
      offset: 1
    })
    let videoList = videoListData.datas.map(item => {
      item.id = index++;
      return item
    })
    // 视频的url
    let videoUrlList = []
    // 获取视频的url
    for (let i = 0; i < videoList.length; i++) {
      let videoUrlItem = await request('/video/url', {
        id: videoList[i].data.vid
      })
      videoUrlList.push(videoUrlItem.urls)
    }
    // 将视频的url导入到videoList中
    for (let i = 0; i < videoUrlList.length; i++) {
      videoList[i].data.urlInfo = videoUrlList[i]
    }
    this.setData({
      videoList,
      isTriggered: false
    })
    wx.hideLoading()
  },

  // 点击按钮切换导航分类
  changeNav(e) {
    let navId = e.currentTarget.id
    this.setData({
      navId,
      videoList: []
    })
    wx.showLoading({
      title: '正在加载',
    })
    // 动态获取当前导航对应的视频数据
    this.getVideoList(this.data.navId)

  },

  // 控制视频的播放
  handelPlay(e) {
    // 解决的问题: 多个视频可以同时播放的问题
    // 需求: 1、在点击播放的时间中需要找到上一个播放的视频 2、在播放新的视频之前关闭上一个正在播放的视频
    // 关键  1、如何找到上一个视频的实例对象 2、如何确定当前点击播放的视频和站在播放的视频 不是同一个视频 （通过视频的id值区分）

    //  单例模式：需要创建多个对象的场景下，通过一个变量接收的方式，始终只创建一个对象
    // 节省内存空间
    let vid = e.currentTarget.id
    // 要实现将上一个视频停止,我们需要将当前视频 符合条件的 变成上一个视频

    // 当我们第一次在this身上访问videoContext时, this 身上并没有videoContext(也就是还没有存储当前视频的id)
    // 而当我们点击下一个视频时,this身上就会出现一个videoContext属性,因为我们在下面给this加了一个videoContext  而这时候this身上就有了我们刚才点击的第一个视频的id唯一值,我们只需要停止当前id对应的视频,就完成了关闭上一个视频的操作 (但还有问题)
    // 当前这种操作识别不出我们下一次所点击的视频是当前的视频还是不同id的下一个视频,所有我们还需要判断点击视频的id是否是我们上次所点击的视频的id

    // 关闭上一个播放的视频 && 关闭的视频id不属于当前正在观看的视频的id
    // this.vid !== vid && this.videoContext && this.videoContext.stop()
    // this.vid = vid
    this.setData({
      videoId: vid
    })
    // 创建一个wx.createVideoContext属性 赋值给this (看上面代码)
    this.videoContext = wx.createVideoContext(vid)

    // 从this身上抓取 videoUpdataTime
    let {
      videoUpdataTime
    } = this.data
    // 判断当前 videoUpdataTime,也就是videoUpdataTime的id是否等于等当前正在播放的视频的id   并赋值给一个新的变量
    let videoItem = videoUpdataTime.find(item => item.vid === vid)
    if (videoItem) {
      // 如果存在这个已经播放过的视频,则再次点击该视频时继续之前的播放进度
      this.videoContext.seek(videoItem.currentTime)
    }
  },

  // 获取视频的播放进度
  handelUpdataTime(e) {
    // 当前视频的播放进度
    let currentTime = e.detail.currentTime
    // 当前播放的视频的id
    let vid = e.currentTarget.id
    // 定义一个对象用于接收当前播放视频的id和播放进度
    let videoTimeObj = {
      vid,
      currentTime
    }
    // 从this身上抓取 videoUpdataTime
    let {
      videoUpdataTime
    } = this.data
    // 下面代码的含义: 从videoUpdataTime身上遍历,寻找哪一个视频是正在播放的视频,并赋值给一个新的变量  find方法:只有里面的条件去阿奴为真才会有返回值
    let videoItem = videoUpdataTime.find(item => item.vid === videoTimeObj.vid)
    // 如果这个视频存在,就给这个视频的播放进度设置为当前鼠标事件对象(当前视频)的播放进度
    if (videoItem) {
      videoItem.currentTime = currentTime
    } else {
      // 如果这个视频不存在,则向videoUpdataTime 内push当前鼠标事件对象(当前播放的视频)
      videoUpdataTime.push(videoTimeObj)
    }

    this.setData({
      videoUpdataTime
    })
  },

  // 视频播放结束触发的回调
  handelEnd(e) {
    console.log('视频播放结束', e);
    let vid = e.currentTarget.id
    let {
      videoUpdataTime
    } = this.data
    // videoUpdataTime.map(item => item.vid !== vid)

    videoUpdataTime.splice(videoUpdataTime.findIndex(item => item.vid === vid), 1)
    this.setData({
      videoUpdataTime
    })
  },

  // 下拉刷新视频列表
  handelRefresher() {
    // 发送请求 获取最新视频列表数据
    this.getVideoList(this.data.navId)
  },

  // 上拉滚动到视频列表底部触发的回调
  async handelToLower() {
    let arr = this.data.arr
    let id = this.data.navId
    let start = 0
    for (let i = 0; i < arr.length; i++) {
      start++
    }
    let moreVideoDataList = await request('/video/group', {
      id,
      offset: start
    })
    let index = 0
    let moreVideoList = moreVideoDataList.datas.map(item => {
      item.id = index++
      return item
    })
    let videoList = this.data.videoList
    videoList.push(...moreVideoList)
    this.setData({
      videoList
    })
  },

  // 点击分享

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