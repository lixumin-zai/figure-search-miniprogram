
// components/modal/modal.ts
Component({
  properties: {
    times: {
      type: Number,
      value: 0
    },
    image: {
      type: String,
      value: ''
    },
    show: {
      type: Boolean,
      value: true
    },
    originImage: {
      type: String,
      value: ''
    },
    verification_code:{
      type: String,
      value: ''
    }
  },
  data: {

  },
  methods: {
    close() {
      this.setData({ show: false });
      this.triggerEvent('close');
    },
    confirm() {
      this.triggerEvent('confirm');
      this.close();
    },
    feedback() {
      wx.cloud.callFunction({
        name: 'feedback', // 云函数名称
        data: {
          data: {
            image: this.properties.originImage, // 发送Base64格式的图片数据
            verification_code: this.properties.verification_code
          },
        },
        success: (resp:any) => {
          const result = resp.result;
          console.log(result.data.code)
          if (result.data.code == "0") {
            // 将返回的Base64图片设置到页面
            console.log(result)
            wx.showToast({
              title: '反馈成功',
              icon: 'success',
            });
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '反馈失败',
            icon: 'none',
          });
          console.error('上传失败: ', err);
        },
        complete: () => {
          // 隐藏加载动画
          wx.hideLoading();
          this.close();
        },
      });
    }
  }
})