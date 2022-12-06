// pages/recommendSong/recommendSong.js
import request from '../../utils/request'
import PubSub from 'pubsub-js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: {
      years: '',
      month: ''
    },
    recommendList: [],
    index: 0, // 当前歌曲的索引
    songSwitchType: '' //歌曲上下曲切换类型
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getDate()
    this.getRecommendList()

    // 订阅来自songDetail的消息
    PubSub.subscribe('switch', (msg, type) => {
      let {
        recommendList,
        index
      } = this.data
      if (type === 'pre') {
        (index === 0) && (index = recommendList.length - 1)
        index -= 1

      } else {
        (index === recommendList.length - 1) && (index = -1)
        index += 1
      }

      // 更新下标
      this.setData({
        index
      })
      let songId = recommendList[index].id
      // 发布消息给songDetail
      PubSub.publish('songId', songId)
    })
  },

  // 获取当前日期时间
  getDate() {
    const date = new Date()
    const years = date.getFullYear()
    const month = date.getMonth() + 1
    this.setData({
      date: {
        years,
        month
      }
    })
  },

  // 获取每日推荐列表
  async getRecommendList() {
    let res = await request('/recommend/songs')
    let index = 0
    this.setData({
      recommendList: res.data.dailySongs.map(item => {
        item.index = index++
        return item
      })
    })

  },

  // 点击按钮跳转至当前歌曲详细列表
  // toSongDetail(e) {
  //   let {
  //     recommendList,
  //     songSwitchType,
  //     songIndex
  //   } = this.data
  //   let id = e.currentTarget.id
  //   let index = e.currentTarget.dataset.index // 当前点击歌曲的索引
  //   this.setData({
  //     songIndex: index
  //   })
  //   wx.setStorageSync('songId', id)
  //   if (songSwitchType === 'pre') {
  //     songIndex -= 1
  //   } else {
  //     songIndex += 1
  //   }
  //   this.setData({
  //     songIndex
  //   })
  //   let songId = recommendList[songIndex].id
  //   // console.log(songId);
  //   wx.navigateTo({
  //     url: `/pages/songDetail/songDetail`,
  //     events: {
  //       switch: (type) => {
  //         this.setData({
  //           songSwitchType: type
  //         })
  //       }
  //     },
  //     success: (res) => {
  //       res.eventChannel.emit('songId', songId)
  //     }
  //   })
  // },


  /*
  跳转至当前歌曲详细列表
  */
  toSongDetail(e) {
    let id = e.currentTarget.id
    let {
      song,
      index
    } = e.currentTarget.dataset
    this.setData({
      index
    })
    // wx.setStorageSync('songId', id)
    wx.navigateTo({
      url: `/pages/songDetail/songDetail?songId=` + song.id,
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