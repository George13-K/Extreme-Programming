// pages/selectassociations/selectassociations.js
wx.cloud.init({
  env: 'george-8gktege9596a5ba5' 
});

const db = wx.cloud.database();  
const contactsCollection = db.collection('contacts');  

Page({

  /**
   * 页面的初始数据
   */
  data: {
    associations_ids:[],
    contacts:[],
    contactId:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
   let contactId = options.id;
   console.log(options)
    let that = this;
    const _ = db.command
    contactsCollection.doc(contactId).get({
      success: function (res) {
        console.log("数据库返回的数据asss:", res.data); 
        let associations_ids = res.data.associations
        that.setData({
          associations_ids:associations_ids,
          contactId:contactId
        })
        contactsCollection.where({
          _id:_.nin(associations_ids)
        }).get({
          success: res => {
            let contacts = res.data;  
            console.log("contacts",contacts)
            that.setData({
              contacts:contacts
            })
          },
          fail: err => {
            console.error('从数据库获取联系人失败：', err);
          }
        });


      },
      fail: function (err) {
        console.error("数据库读取失败: ", err);
        wx.showToast({
          title: '获取联系人失败',
          icon: 'none'
        });
      }
    });
  },
  checkboxChange(e){
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    this.setData({
      associations_ids:e.detail.value
    })
  },
  submitcontact(){
    console.log("submitcontact",this.data.contacts)
    var contactId = this.data.contactId
    let that = this
    contactsCollection.doc(contactId).update({
      data:{
        associations:that.data.associations_ids
      },success: function(res) {
        console.log("tiaoz")
        wx.navigateTo({
          url: '/pages/associationslist/associationslist?id='+that.data.contactId  
        });
      }
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