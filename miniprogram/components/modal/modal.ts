import { Image } from "XrFrame/kanata/lib/index";

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
    }
  }
})