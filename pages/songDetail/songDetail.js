// pages/songDetail/songDetail.js
import request from '../../utils/request'
import PubSub from 'pubsub-js'
import Dayjs from 'dayjs'
// 获取全局实例
const appInstance = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, // 控制歌曲的播放
    songId: '', // 当前歌曲ID
    songData: [],
    songPlayPercent: 0, // 歌曲实时播放进度条
    currentTime: '00:00', //当前歌曲播放进度
    allTime: '00:00', // 当前歌曲总时长
    userId: '', // 用户id
    myLikeList: [], // 我喜欢歌曲列表
    musicLink: '' // 音乐播放链接
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    let songId = wx.getStorageSync('songId')
    songId = options.songId ? options.songId : songId
    let userId = wx.getStorageSync('userId')
    this.setData({
      songId,
      userId
    })
    // this.contorlMusicPlay(true, songId)

    this.getSongInfo(songId)
    this.getMyLike()

    // 如果全局有正在播放的音乐 且 音乐的id与当前页面播放的音乐id相同
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === songId) {
      this.setData({
        isPlay: true
      })
    }
    this.BackgroundAudioManager = wx.getBackgroundAudioManager()

    // 监听背景音频播放事件
    this.BackgroundAudioManager.onPlay(() => {
      this.changeMusicPlay(true, songId)
      appInstance.globalData.musicId = songId
    })
    // 监听背景音频暂停事件
    this.BackgroundAudioManager.onPause(() =>
      this.changeMusicPlay(false, songId)
    )
    // 监听背景音频停止事件
    this.BackgroundAudioManager.onStop(() =>
      this.changeMusicPlay(false, songId)
    )
    // 监听背景音乐实时播放事件
    this.BackgroundAudioManager.onTimeUpdate(() => {
      // 歌曲实时进度条
      this.songPlayPercent()
      // 歌曲实时播放的回调函数
      this.wtachSongPlay()
    })
    // 监听背景音乐自然播放结束事件
    this.BackgroundAudioManager.onEnded(() => {
      // 向recommendSong发布消息  自动播放下一首歌
      PubSub.publish('switch', 'next')
      // 重置数据
      this.setData({
        isPlay: false, // 控制歌曲的播放
        songPlayPercent: 0, // 歌曲实时播放进度条
        currentTime: '00:00', //当前歌曲播放进度
        allTime: '00:00', // 当前歌曲总时长
      })
      // 接收来自recommendSong的消息
      PubSub.subscribe('songId', (msg, songId) => {
        // 获取当前音乐信息
        this.getSongInfo(songId)
        // 自动播放当前音乐
        this.contorlMusicPlay(true, songId)
        PubSub.unsubscribe('songId')
      })
    })
    // 在此调用控制歌曲播放函数,即可进入页面自动播放改歌曲
    this.handelMusicPlay()
  },
  // 歌曲实时进度条的功能函数
  songPlayPercent() {
    // 歌曲实时播放进度条
    // 进度条: 当前播放进度时间/总时间 = 当前进度百分比/总的进度条长度
    let songPlayPercent = (this.BackgroundAudioManager.currentTime / this.BackgroundAudioManager.duration) * 490 // 490 是总进度条的宽度

    this.setData({
      songPlayPercent
    })

  },
  // 获取歌曲详情数据
  async getSongInfo(ids) {
    let res = await request('/song/detail', {
      ids
    })
    // 使用日期格式化工具将歌曲的时长进行转换
    let allTime = Dayjs(res.songs[0].dt).format('mm:ss')
    this.setData({
      songData: res.songs[0],
      allTime
    })
  },

  // 控制歌曲的播放
  handelMusicPlay() {
    let isPlay = !this.data.isPlay
    setTimeout(() => {
      this.contorlMusicPlay(isPlay, this.data.songId, this.data.musicLink)
    }, 200)
  },

  // 控制音乐播放和暂停的功能回调函数
  async contorlMusicPlay(isPlay, songId, musicLink) {
    if (isPlay) {
      // 获取音乐播放链接
      if (!musicLink) {
        let res = await request('/song/url', {
          id: songId
        })
        musicLink = res.data[0].url
        this.setData({
          musicLink
        })
      }
      if (musicLink === null) {
        wx.showToast({
          title: '由于版权或会员问题暂获取不到此资源',
          icon: 'none'
        })
        return;
      }
      let musicName = this.data.songData.name
      this.BackgroundAudioManager.src = musicLink // 音乐的播放地址
      this.BackgroundAudioManager.title = musicName // 音乐名称(必填)

    } else {
      this.BackgroundAudioManager.pause() // 暂停音乐
    }
  },

  // 修改音乐的播放状态
  changeMusicPlay(isPlay) {
    this.setData({
      isPlay
    })
    // 设置全局音乐的播放状态
    appInstance.globalData.isMusicPlay = isPlay
  },

  // 获取我喜欢列表
  async getMyLike() {
    let res = await request('/likelist', {
      uid: this.data.userId
    })
    let myLikeList = res.ids.slice(0, 27)
    this.setData({
      myLikeList
    })
  },

  // 点击切换歌曲
  handelSwitch(e) {
    // 获取当前歌曲的类型(上一曲/下一曲)(type)
    const type = e.currentTarget.id
    //关闭当前播放音乐
    this.BackgroundAudioManager.stop();
    // 接收来自recommendSong的消息
    PubSub.subscribe('songId', (msg, songId) => {
      // 获取当前音乐信息
      this.getSongInfo(songId)
      // 自动播放当前音乐
      this.contorlMusicPlay(true, songId)
      PubSub.unsubscribe('songId')
    })

    // 发布消息
    PubSub.publish('switch', type)
  },

  // 监听歌曲实时播放的回调函数
  wtachSongPlay() {
    // 注意:Dayjs()括号内传入的值必须为毫秒
    // 歌曲的实时播放进度的时间
    this.currentTime = Dayjs(this.BackgroundAudioManager.currentTime * 1000).format('mm:ss')
    this.setData({
      currentTime: this.currentTime
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