// index.ts

import { debugPrint } from "XrFrame/kanata/lib/index";

// 获取应用实例
const app = getApp<IAppOption>()
let rewardedVideoAd:any = null
Page({
  data: {
    times: 1,
    showModal: false,
    photoSrc: '',       // 拍照后的本地图片路径
    photoImageSrc: '',
    verification_code: '',
    resultImageSrc: [] as string[], // 服务器返回的处理后图片Base64
    inputValue: "",
    clipboardText: '',
    openidCode: "",
    adViewTimes: 0,
    showAnnouncement: true
  },
  bindKeyInput: function (e: any) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  modalClose(){
    this.setData({
      showModal: false
    });
  },
  // 复制功能
  copyText(){
    wx.setClipboardData({
      data: this.data.inputValue,
      success: function() {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },
  copyID(){
    wx.setClipboardData({
      data: "antibsurl",
      success: function() {
        wx.showToast({
          title: '已复制： antibsurl 直接去微信搜索框黏贴',
          icon: "none",
          duration: 4000
        });
      }
    });
  },
  copyMyID(){
    wx.setClipboardData({
      data: "15016649205",
      success: function() {
        wx.showToast({
          title: '已复制：15016649205 直接去微信搜索框黏贴',
          icon: "none",
          duration: 4000
        });
      }
    });
  },
  activateCode(){
    wx.getClipboardData({
      success: (res)  => {
        this.setData({
          clipboardText: res.data,
        })
        // const recharge_code_match = this.data.clipboardText.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
        // if (this.data.clipboardText.includes("图推搜索") && recharge_code_match) {
        const recharge_code = this.data.clipboardText;
        wx.request({
          url: 'https://lismin.online:23333/activateCode',
          method: 'GET',
          data: {
            openidCode: this.data.openidCode,
            recharge_code: recharge_code
          },
          success: (response:Record<string, any>) => {
            console.log(response.data)
            if (response.data.code === 0){
              console.log("激活成功")
              this.updataCost();
              wx.showToast({
                title: '增加次数成功',
                icon: 'success',
                duration: 3000
              }); // 图推搜索
            } else if (response.data.code === 1){
              this.updataCost();
              wx.showToast({
                title: '激活码已失效',
                icon: 'error',
                duration: 3000})
            } else {
              this.updataCost();
              wx.showToast({
                title: '增加次数失败，请添加antibsurl获取添加次数方法',
                icon: 'none',
                duration: 3000})
            }
          }
        })
      }
    })
  },
  takePhoto() {
    const ctx = wx.createCameraContext();
    ctx.takePhoto({
      quality: 'normal',
      success: (res) => {
        const tempImagePath = res.tempImagePath
        wx.showToast({
          title: '拍照成功',
          icon: 'success',
        });
        this.setData({
          photoSrc: tempImagePath
        });
        this.uploadImage(tempImagePath);
      },
    });
  },
  // 云服务器图片上传函数
  uploadImage2(filePath: string) {
    const fileManager = wx.getFileSystemManager();
    wx.showLoading({
      title: '处理中...',
    });
    // 读取文件并将其转换为 Base64 编码
    fileManager.readFile({
      filePath: filePath, // 图片文件路径
      encoding: 'base64', // 编码格式
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: filePath, //图片文件路径
        })
        const base64Image = String(res.data);
        this.setData({
          photoImageSrc: base64Image,
          verification_code: this.data.inputValue
        });
        // 发送POST请求，将图片以Base64格式上传
        wx.cloud.callFunction({
          name: 'post', // 云函数名称
          data: {
            data: {
              image: base64Image, // 发送Base64格式的图片数据
              verification_code: this.data.inputValue
            },
          },
          success: (resp:any) => {
            const uploadRes = resp.result;
            if (uploadRes.data && uploadRes.data.code === "0") {
              // 将返回的Base64图片设置到页面
              let resultImage;
              if (typeof uploadRes.data.image === 'string') {
                // 如果是字符串，将其转换为数组
                resultImage = ['data:image/png;base64,' + uploadRes.data.image];
              } else if (Array.isArray(uploadRes.data.image)) {
                // 如果是数组，处理每个元素
                resultImage = uploadRes.data.image.map((element: any) => {
                    return 'data:image/png;base64,' + element;
                });
              }
              this.setData({
                resultImageSrc: resultImage,
                times: uploadRes.data.times,
                showModal: true
              });
            }
          },
          fail: (err) => {
            wx.showToast({
              title: '上传失败',
              icon: 'none',
            });
            console.error('上传失败: ', err);
          },
          complete: () => {
            // 隐藏加载动画
            wx.hideLoading();
          },
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '文件读取失败',
          icon: 'none',
        });
        console.error('文件读取失败: ', err);
      }
    });
  },
  uploadImage(filePath: string) {
    const fileManager = wx.getFileSystemManager();
    wx.showLoading({
      title: '处理中...',
    });
    // 读取文件并将其转换为 Base64 编码
    fileManager.readFile({
      filePath: filePath, // 图片文件路径
      encoding: 'base64', // 编码格式
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: filePath, //图片文件路径
        })
        const base64Image = String(res.data);
        this.setData({
          photoImageSrc: base64Image,
          verification_code: this.data.inputValue
        });
        // 发送POST请求，将图片以Base64格式上传
        wx.request({
          method : 'POST', // 云函数名称
          url: "https://lismin.online:23333/search-mini",
          data: {
              image: base64Image, // 发送Base64格式的图片数据
              verification_code: this.data.inputValue
          },
          header: {
            'Content-Type': 'application/json' // 设置请求头为JSON格式
          },
          success: (resp:any) => {
            const uploadRes = resp;
            if (uploadRes.data && uploadRes.data.code === "0") {
              // 将返回的Base64图片设置到页面
              let resultImage;
              if (typeof uploadRes.data.image === 'string') {
                // 如果是字符串，将其转换为数组
                resultImage = ['data:image/png;base64,' + uploadRes.data.image];
              } else if (Array.isArray(uploadRes.data.image)) {
                // 如果是数组，处理每个元素
                resultImage = uploadRes.data.image.map((element: any) => {
                    return 'data:image/png;base64,' + element;
                });
              }
              this.setData({
                resultImageSrc: resultImage,
                times: uploadRes.data.times,
                showModal: true
              });
            }
          },
          fail: (err) => {
            wx.showToast({
              title: '上传失败',
              icon: 'none',
            });
            console.error('上传失败: ', err);
          },
          complete: () => {
            // 隐藏加载动画
            wx.hideLoading();
          },
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '文件读取失败',
          icon: 'none',
        });
        console.error('文件读取失败: ', err);
      }
    });
  },
  previewPhoto() {
    wx.previewImage({
      current: this.data.photoSrc, // URL of the image currently displayed
      urls: [this.data.photoSrc] // Array of images to preview
    });
  },

  // Function to preview the result image in full screen
  // previewResult() {
  //   wx.previewImage({
  //     current: this.data.resultImageSrc, // URL of the image currently displayed
  //     urls: [this.data.resultImageSrc] // Array of images to preview
  //   });
  // },
  // backCamera(){
  //   this.setData({
  //     resultImageSrc: ''
  //   });
  // },
  // 本地上传图片功能
  // 本地上传图片功能（使用 wx.chooseMedia）
  chooseMedia() {
    wx.chooseMedia({
      count: 1, // 限制上传一张图片
      mediaType: ['image'], // 仅允许选择图片
      sourceType: ['album'], // 仅允许从相册选择
      success: (res) => {
        const tempImagePath = res.tempFiles[0].tempFilePath; // 获取选中的图片临时路径
        wx.showToast({
          title: '上传成功',
          icon: 'success',
        });
        this.setData({
          photoSrc: tempImagePath
        });
        this.uploadImage(tempImagePath);
      },
      fail: (err) => {
        console.log('选择图片失败', err);
      }
    });
  },
  onShareAppMessage: function () {
    return {
      title: '图推搜索',
      path: 'pages/index/index',
      imageUrl: "/pages/index/share.png"
    }
  },
  updataCost: function () {
    const that = this;
    wx.request({
      url: 'https://lismin.online:23333/get_cost_time',
      method: 'GET',
      data: {
        verification_code: this.data.inputValue
      },
      success: function(response:Record<string, any>) {
        // 处理成功响应
        that.setData({
          times: response.data.cost_time
        })
      },
      fail: function(error) {
        // 处理请求失败
        console.log('请求失败:', error);
      }
    })
  },
  updataADViewCost: function () {
    const that = this;
    wx.request({
      url: 'https://lismin.online:23333/get_view_time',
      method: 'GET',
      data: {
        verification_code: this.data.inputValue
      },
      success: function(response:Record<string, any>) {
        // 处理成功响应
        that.setData({
          adViewTimes: response.data.ad_view_time
        })
      },
      fail: function(error) {
        // 处理请求失败
        console.log('请求失败:', error);
      }
    })
  },
  assitant: function(){
    
  },
  onShow: function () {
    const that = this;
    wx.login({
      success: res => {
        wx.request({
            url: 'https://lismin.online:23333/login',
            method: 'GET',
            data: {
              code: res.code
            },
            success: function(response:Record<string, any>) {
              // 处理成功响应
              if (response.data.code === 0){
                that.setData({
                  openidCode: response.data.verification_code,
                  inputValue: response.data.verification_code,
                  verification_code: response.data.verification_code,
                  times: response.data.cost_time,
                  adViewTimes: response.data.ad_view_count
                })
                console.log('登录成功:', that.data.openidCode);
              } else {
                console.log('登录失败:', response.data.verification_code);
              }
            },
            fail: function(error) {
              // 处理请求失败
              console.log('请求失败:', error);
            }
          })
      },
    });
  },
  ShowAD() {
    rewardedVideoAd.onLoad(() => {
      console.log('激励视频 广告加载成功')
    })
    rewardedVideoAd.show()
    .then(() => console.log('激励视频 广告显示'))
  },
  isShowAD() {
    if (this.data.adViewTimes >= 3){
      wx.showModal({
        title: '提示',
        content: '今天观看已经超过3次，明天观看才能添加次数哦',
        success: (res) => {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '观看30秒广告可以获得机会\r\n今天还可以看广告'+ Math.max((3 - this.data.adViewTimes), 0) + '次\r\n第一次给1次机会\r\n第二次给2次机会\r\n第三次给3次机会',
        success: (res) => {
          if (res.confirm) {
            this.ShowAD();
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  onLoad() {
    if(wx.createRewardedVideoAd){
      rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: 'adunit-140bbb8a99b57a09' })
      rewardedVideoAd.onLoad(() => {
        console.log('onLoad event emit')
      })
      rewardedVideoAd.onError((err:any) => {
        console.log('onError event emit', err)
      })
      rewardedVideoAd.onClose((res:any) => {
        console.log('onClose event emit', res)
        if (res.isEnded){
          wx.request({
            url: 'https://lismin.online:23333/reward',
            method: 'GET',
            data: {
              verification_code: this.data.verification_code
            },
            success: (response:Record<string, any>) => {
              // 处理成功响应
              if (response.data.code === 0){
                let old_cost_time = this.data.times
                this.updataCost();
                wx.showModal({
                  title: '提示',
                  content: '添加次数成功: '+ old_cost_time+ "+" + response.data.add_times,
                  success: (res) => {
                    if (res.confirm) {
                      console.log('用户点击确定')
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
                this.updataADViewCost();
                console.log('添加成功:');
              } else if (response.data.code === 1){
                wx.showModal({
                  title: '提示',
                  content: '今天观看已经超过3次，明天观看才能添加次数哦',
                  success: (res) => {
                    if (res.confirm) {
                      console.log('用户点击确定')
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              } else {
                console.log('失败:', response.data.msg)
              }
            },
            fail: function(error) {
              // 处理请求失败
              console.log('请求失败:', error);
            }
          })
        }
      })
    }
  },
  adLoad() {
    console.log('原生模板广告加载成功')
  },
  adError(err:any) {
    console.error('原生模板广告加载失败', err)
  },
  adClose() {
    console.log('原生模板广告关闭')
  },
  // 显示公告模态框
  showAnnouncementModal: function() {
    this.setData({
      showAnnouncement: true
    });
  },

  // 关闭公告（内部调用）
  closeAnnouncement: function() {
    this.setData({
      showAnnouncement: false
    });
  },

  // "Got it" 按钮的点击事件
  handleAcknowledge: function() {
    console.log("User has acknowledged the announcement.");
    // 关闭公告
    this.closeAnnouncement();
  },
  isShowAnnouncement: function () {
    const that = this;
    wx.request({
      url: 'https://lismin.online:23333/show-announcement',
      method: 'GET',
      success: function(response:Record<string, any>) {
        // 处理成功响应
        that.setData({
          showAnnouncement: response.data.showAnnouncement
        })
      },
      fail: function(error) {
        that.setData({
          showAnnouncement: true
        })
      }
    })
  }
})
