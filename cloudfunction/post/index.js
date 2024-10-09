// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

exports.main = async (event, context) => {
  try {
    const data = event.data;

    const response = await axios({
      method: 'post',
      url: "https://lismin.online:23333/search-mini",
      data: data,
      headers: {'Content-Type': 'application/json'}, // 设置默认的请求头
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    // 捕获错误并返回
    return {
      success: false,
      error: error.message
    };
  }
}