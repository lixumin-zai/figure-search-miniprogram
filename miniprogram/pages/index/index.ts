// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

Page({
  data: {
    times: 1,
    showModal: false,
    photoSrc: '',       // 拍照后的本地图片路径
    resultImageSrc: '', // 服务器返回的处理后图片Base64
    inputValue: '',
  },
  bindKeyInput: function (e: any) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  // 拍照功能
  takePhoto() {
    const ctx = wx.createCameraContext();
    ctx.takePhoto({
      quality: 'normal',
      success: (res) => {
        const tempImagePath = res.tempImagePath
        console.log(tempImagePath)
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
  // 图片上传函数
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
        const base64Image = res.data;

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
              
              this.setData({
                resultImageSrc: 'data:image/png;base64,' + uploadRes.data.image,
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
            console.log(324)
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
  previewResult() {
    wx.previewImage({
      current: this.data.resultImageSrc, // URL of the image currently displayed
      urls: [this.data.resultImageSrc] // Array of images to preview
    });
  },
  backCamera(){
    this.setData({
      resultImageSrc: ''
    });
  },
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
      path: 'pages/index/index'
    }
  },
  onLoad: function () {
  },
  onShow: function() {
  }
})
