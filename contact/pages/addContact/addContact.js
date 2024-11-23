wx.cloud.init({
  env: 'george-8gktege9596a5ba5'  
});

const db = wx.cloud.database(); 
const contactsCollection = db.collection('contacts');  

Page({
  data: {
    name: '',
    phone: '',
    email: '',
    address: '',
    avatar: '',  
    note: ''  
  },

  onNameInput(e) {
    this.setData({
      name: e.detail.value
    });
  },

  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  onEmailInput(e) {
    this.setData({
      email: e.detail.value
    });
  },

  onAddressInput(e) {
    this.setData({
      address: e.detail.value
    });
  },

  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    });
  },

  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      success: res => {
        const tempFilePath = res.tempFilePaths[0];
        this.uploadAvatar(tempFilePath); 
      }
    });
  },

  uploadAvatar(tempFilePath) {
    const cloudPath = `avatars/${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;  
    wx.cloud.uploadFile({
      cloudPath: cloudPath,  
      filePath: tempFilePath,  
      success: res => {
        this.setData({
          avatar: res.fileID  
        });
      },
      fail: err => {
        console.error('上传头像失败:', err);
      }
    });
  },

  saveContact() {
    const { name, phone, email, address, avatar, note } = this.data;

    if (!name || !phone) {
      wx.showToast({
        title: '请填写必要的联系人信息',
        icon: 'none'
      });
      return;
    }

    contactsCollection.add({
      data: {
        name: name,
        phone: phone,
        email: email,
        address: address,
        avatar: avatar || '',  
        note: note || ''  
      },
      success: res => {
        wx.showToast({
          title: '联系人已保存',
        });

        wx.redirectTo({
          url: '/pages/index/index',  
        });
      },
      fail: err => {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
        console.error('数据库添加失败：', err);
      }
    });
  }
});
