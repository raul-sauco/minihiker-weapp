// pages/authentication/authentication.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
     code:'获取验证码',
     codeDis:false, //是否禁用button
     name:'', //姓名
     idCard:'',//身份证
     iphone:'',//手机号
     ipcode:'', //验证码
  },

// 倒计时
btn_codetime:function(){
   var that = this;
   let time =60;
   var endpointa = 'sms'
  //  console.log(that.data.iphone)
   if(that.data.iphone==""){
     wx.showToast({
       title: '请输入手机号',
       icon:"none"
     })
     return
   }
  //  console.log(app.globalData.url + endpointa)
   wx.request({
    url: app.globalData.url + endpointa,
    method:'POST',
    header: {
     'Content-Type': 'application/json',
     'Authorization': 'Bearer ' + app.globalData.accessToken
   },
   data:{
     phone_number :that.data.iphone
   },
   success(res){
     console.log(res)
   }
  })

   clearInterval(codeTime)
   var codeTime = setInterval(() => {
       this.setData({
         code:time-- + '秒后重发',
         codeDis:true
       })
      //  console.log(time)
       if(time == -1){
        //  console.log('你好')
         clearInterval(codeTime)
         that.setData({
           code:'获取验证码',
           codeDis:false
         })
       }
   }, 1000);

},

// 姓名
btn_name:function(e){
   var that = this;
  //  console.log(e.detail.value)
   that.setData({
    name:e.detail.value
   })
},

// 身份证 
btn_idcard:function(e){
   var that = this;
   that.setData({
    idCard:e.detail.value
   })
},

// 手机号
btn_code:function(e){
   var that = this;
   that.setData({
    iphone:e.detail.value
   })
  //  console.log(that.data.iphone)
},

// 验证码
btn_vercode:function(e){
   var that = this;
   that.setData({
    ipcode:e.detail.value
   })
},


// 开始认证
btn_begign:function(e){
   var that = this;



   if(that.data.name=="" || that.data.idCard=="" || that.data.iphone==""||that.data.ipcode==""){
      wx.showToast({
        title: '数据内容请勿为空',
        icon:"none"
      })
      return
   }
   
   let userid = wx.getStorageSync('userId')
   const endpointb = 'authentics/'+userid
   wx.request({
     url: app.globalData.url+endpointb,
     method:"PUT",
     header: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + app.globalData.accessToken
    },
     data:{
      name_zh:that.data.name,
      id_card_number:that.data.idCard,
      phone_number:that.data.iphone,
      code:that.data.ipcode
    },
    success(res){
      console.log(res)
      if(res.statusCode ==200){
        wx.showToast({
          title: '认证成功',
        })
        setTimeout(() => {
          wx.navigateBack({
            
          })
      }, 1500);
      }else if(res.statusCode!==200){
        wx.showToast({
          title: res.data.message,
          icon:'none'
        })
      }

    },
    fail(res){
      console.log(res)
    }
   })

},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})