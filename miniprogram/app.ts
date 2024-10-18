// app.ts
App<IAppOption>({
  globalData: {
    open_id: "",  // 微信用户信息（可选）
  },
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.cloud.init()
    // 登录
  }
})