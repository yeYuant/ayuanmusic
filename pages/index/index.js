// pages/index/index.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], // 轮播图数据
    recommendList: [], // 推荐歌单数据
    musicTopList: [], // 音乐排行榜数据

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getBannerList()
    this.getRecommendList()
    this.getTopList()
  },
  // 点击跳转至搜索详情页
  toSearchDetail() {
    wx.navigateTo({
      url: '/pages/searchDetail/searchDetail',
    })
  },

  // 获取轮播图数据
  async getBannerList() {
    // 轮播图数据
    let bannerData = await request('/banner', {
      type: 2
    })
    this.setData({
      bannerList: bannerData.banners
    })
  },

  // 获取推荐歌单数据
  async getRecommendList() {
    // 推荐歌单数据
    let recommendData = await request('/personalized', {
      limit: 17
    })
    this.setData({
      recommendList: recommendData.result
    })
  },

  // 获取音乐排行榜数据
  async getTopList() {
    // 音乐排行榜数据
    let toptData = await request('/toplist')
    let resultArr = []
    for (let i = 0; i < 5; i++) {
      let toplistId = toptData.list[i].id
      let topListData = await request('/playlist/detail', {
        id: toplistId
      })
      let topListItem = {
        name: topListData.playlist.name,
        tracks: topListData.playlist.tracks.slice(0, 3)
      }
      resultArr.push(topListItem)
      this.setData({
        musicTopList: resultArr
      })
    }
  },

  // 点击按钮跳转至每日推荐列表
  toRecommend() {
    wx.navigateTo({
      url: '/pages/recommendSong/recommendSong'
    })
  },

  // 点击按钮跳转至当前歌曲详细列表
  toSongDetail(e) {
    // console.log(e);
    let id = e.currentTarget.id
    wx.setStorageSync('songId', id)
    wx.navigateTo({
      url: `/pages/songDetail/songDetail`
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