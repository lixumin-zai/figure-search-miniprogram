/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    open_id?: string,
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}