// pages/searchDetail/searchDetail.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotList: [], // 热搜榜列表数据 
    searchSongList: [], //搜索歌曲列表
    keyWords: '', //用户搜索的关键词
    historyList: [], //保存用户的历史搜索记录
    defaultKeyWords: '', //默认搜索关键词
    searchShowList: [], // 搜索展示列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取热搜榜数据
    this.getHotList()
    // 获取搜索历史
    this.getHistoryList()
    // 获取默认搜索关键词
    this.getDefaultKeyWords()
  },

  // 获取本地搜索记录
  getHistoryList() {
    let historyList = wx.getStorageSync('historyListData')
    if (historyList) {
      this.setData({
        historyList
      })
    }
  },

  // 得到搜索列表数据
  async getSearchListData() {
    let {
      keyWords
    } = this.data
    let res = await request('/search/suggest?keywords=' + keyWords)
    this.setData({
      searchShowList: res.result.songs
    })
  },

  // 获取热搜榜列表
  async getHotList() {
    let res = await request('/search/hot/detail')
    let index = 0
    this.setData({
      hotList: res.data.map(item => {
        item.index = index++
        return item
      })
    })
  },

  // 搜索歌曲
  async searchSong() {
    let {
      keyWords,
      historyList
    } = this.data
    let res = await request('/cloudsearch?keywords=' + keyWords)
    if (res.code == 200) {
      this.setData({
        searchSongList: res.result.songs
      })
    }
    // 将搜索关键字添加到搜索历史中
    if (historyList.indexOf(keyWords) !== -1) {
      historyList.splice(historyList.indexOf(keyWords), 1)
    }
    historyList.unshift(keyWords)
    this.setData({
      historyList
    })
    wx.setStorageSync('historyListData', historyList)
  },

  // 点击当前渲染出的推荐信息列表前往搜索的歌曲详情页
  toSearchSong(e) {
    let keyWords = e.currentTarget.dataset.keywords
    this.setData({
      keyWords
    })
    this.searchSong()

  },
  haha(e) {
    console.log(e);
  },
  // 监听表单项发生变化的回调函数
  handleInputChange(e) {
    let keyWords = e.detail.value
    this.setData({
      keyWords
    })
    this.getSearchListData()
  },

  // 获取默认搜索关键词
  async getDefaultKeyWords() {
    let res = await request('/search/default')
    this.setData({
      defaultKeyWords: res.data.showKeyword
    })
  },

  // 点击清除表单项的关键字
  deleteKeywords() {
    this.setData({
      keyWords: ''
    })
  },
  // 点击跳转至当前歌曲播放详情页
  toSongDetail(e) {
    let id = e.currentTarget.id
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?songId=' + id,
    })
  },

  // 点击搜索热搜内容
  searchHotContent(e) {
    // console.log(e.currentTarget.dataset.hotcontent);
    // 将所点击的热搜榜的关键字赋值给data中的keyWords
    this.setData({
      keyWords: e.currentTarget.dataset.hotcontent
    })
    this.searchSong()
  },

  // 点击清空历史记录
  deleteHistory() {
    wx.showModal({
      content: '是否清空历史记录？',
      success: (res) => {
        if (res.confirm) {
          // 清空data中historyList
          this.setData({
            historyList: []
          })
          // 移除本地的历史记录缓存
          wx.removeStorageSync('historyListData')
        }
      }
    })
  },

  // 搜索多重匹配
  async searchMultimatch() {
    let {
      keyWords
    } = this.data
    let res = await request('/search/multimatch', {
      keywords: keyWords
    })
    console.log(res);
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