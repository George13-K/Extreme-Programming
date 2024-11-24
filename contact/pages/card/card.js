wx.cloud.init({
  env: 'george-8gktege9596a5ba5'  // 替换为你的云开发环境 ID
});

const db = wx.cloud.database();  
const contactsCollection = db.collection('contacts');  

Page({
  data: {
    contact: {},  
    contactId: "",  
    isEditing: false  
  },

  onLoad: function (options) {
    const self = this;

    const contactId = options.id;
    self.setData({ contactId: contactId });

    contactsCollection.doc(contactId).get({
      success: function (res) {
        console.log("数据库返回的数据:", res.data); 

        self.setData({
          contact: res.data  
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
onSelectPhoto: function () {
  wx.chooseImage({
    count: 1,
    success: res => {
      const tempFilePath = res.tempFilePaths[0];
      this.uploadImage(tempFilePath, 'avatar');
    }
  });
},

uploadImage: function (tempFilePath, type) {
  const cloudPath = `${type}s/${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;
  wx.cloud.uploadFile({
    cloudPath,
    filePath: tempFilePath,
    success: res => {
      const fileID = res.fileID;
      this.updateContactAvatar(fileID);
    }
  });
},

updateContactAvatar: function (fileID) {
  contactsCollection.doc(this.data.contactId).update({
    data: {
      avatar: fileID  
    },
    success: () => {
      this.setData({
        'contact.avatar': fileID  
      });
      wx.showToast({
        title: '头像已更新',
        icon: 'success'
      });
    }
  });
},

  onEditContact: function () {
    this.setData({
      isEditing: true  
    });
  },

  onNameInput: function (e) {
    this.setData({
      'contact.name': e.detail.value
    });
  },

  onPhoneInput: function (e) {
    this.setData({
      'contact.phone': e.detail.value
    });
  },

  onEmailInput: function (e) {
    this.setData({
      'contact.email': e.detail.value
    });
  },

  onAddressInput: function (e) {
    this.setData({
      'contact.address': e.detail.value
    });
  },
  associationslist:function(){
    wx.navigateTo({
      url: '/pages/associationslist/associationslist?id='+this.data.contactId  
    });
  },
  onSaveContact: function () {
    const self = this;
    const updatedContact = self.data.contact;

    contactsCollection.doc(self.data.contactId).update({
      data: {
        name: updatedContact.name,
        phone: updatedContact.phone,
        email: updatedContact.email,
        address: updatedContact.address
      },
      success: function () {
        wx.showToast({
          title: '联系人已更新',
          icon: 'success'
        });

        self.setData({
          isEditing: false
        });
      },
      fail: function (err) {
        wx.showToast({
          title: '更新失败',
          icon: 'none'
        });
        console.error("更新联系人失败: ", err);
      }
    });
  },

  onDeleteContact: function () {
    const self = this;
    wx.showModal({
      title: '删除确认',
      content: '你确定要删除这个联系人吗？',
      success: function (res) {
        if (res.confirm) {
          contactsCollection.doc(self.data.contactId).remove({
            success: function () {
              wx.showToast({
                title: '联系人已删除',
                icon: 'success'
              });

              wx.redirectTo({
                url: '/pages/index/index',  
              });
            },
            fail: function (err) {
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              });
              console.error("删除联系人失败: ", err);
            }
          });
        }
      }
    });
  }
});

