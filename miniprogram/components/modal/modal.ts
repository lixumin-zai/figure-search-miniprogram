
// components/modal/modal.ts
Component({
  properties: {
    times: {
      type: Number,
      value: 0
    },
    image: {
      type: Array,
      value: []
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
    },
  },
  data: {
    showIndex: -1,
    showImage: "",
    images: [] as string[]
  },
  lifetimes: {
    attached(){
      this.nextImage();
    }
  },
  methods: {
    close() {
      this.setData({ 
        show: false,
        showImage: "",
        showIndex: -1,
      });
      this.triggerEvent('close');
    },
    confirm() {
      this.triggerEvent('confirm');
      this.close();
    },
    nextImage(){
      // let images = this.properties.image.split('||');
      // this.setData({
      //   images: images
      // })
      let idx;
      if (this.data.showIndex === -1){
        idx = 0;
      } else {
        idx = (this.data.showIndex + 1) % this.properties.image.length;
      }
      this.setData({
        showIndex: idx,
        showImage: this.properties.image[idx]
      })
    },
    feedback2() {
      wx.showToast({
        title: '感谢提交',
        icon: 'success',
        duration: 1000
      });
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
            wx.showToast({
                title: '反馈成功',
                icon: 'success',
                duration: 1000
              });
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '反馈失败',
            icon: 'none',
            duration: 500
          });
          console.error('上传失败: ', err);
        },
        complete: () => {
          // 隐藏加载动画
          // 
          this.close();
        },
      });
    },
    feedback() {
      wx.showToast({
        title: '感谢提交',
        icon: 'success',
        duration: 1000
      });
      wx.request({
        method : 'POST', // 云函数名称
        url: "https://lismin.online:23333/feedback",
        data: {
            image: this.properties.originImage, // 发送Base64格式的图片数据
            verification_code: this.properties.verification_code
        },
        success: (resp:any) => {
          const result = resp;
          console.log(result.data.code)
          if (result.data.code == "0") {
            // 将返回的Base64图片设置到页面
            wx.showToast({
                title: '反馈成功',
                icon: 'success',
                duration: 1000
              });
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '反馈失败',
            icon: 'none',
            duration: 500
          });
          console.error('上传失败: ', err);
        },
        complete: () => {
          // 隐藏加载动画
          // 
          this.close();
        },
      });
    }
  }
})