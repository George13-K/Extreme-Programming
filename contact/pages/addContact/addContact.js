wx.cloud.init({
  env: 'george-8gktege9596a5ba5'
});

const db = wx.cloud.database();
const contactsCollection = db.collection('contacts');

Page({
  data: {
    contactId: '', // 当前联系人 ID
    name: '',
    phone: '',
    email: '',
    address: '',
    avatar: '',
    note: '',
    extraInfoList: [], // 动态其他信息列表
    isEditing: false // 是否处于编辑模式
  },

  // 页面加载时获取联系人数据
  onLoad(options) {
    const contactId = options.id; // 获取联系人 ID
    this.setData({ contactId });

    // 从数据库加载联系人信息
    contactsCollection.doc(contactId).get({
      success: res => {
        const data = res.data;
        this.setData({
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          avatar: data.avatar || '',
          note: data.note || '',
          extraInfoList: data.extraInfoList || [] // 初始化额外信息列表
        });
      },
      fail: err => {
        console.error('获取联系人失败：', err);
        wx.showToast({
          title: '加载联系人失败',
          icon: 'none'
        });
      }
    });
  },

  // 姓名输入处理
  onNameInput(e) {
    this.setData({
      name: e.detail.value
    });
  },

  // 电话输入处理
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  // 邮箱输入处理
  onEmailInput(e) {
    this.setData({
      email: e.detail.value
    });
  },

  // 地址输入处理
  onAddressInput(e) {
    this.setData({
      address: e.detail.value
    });
  },

  // 备注输入处理
  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    });
  },

  // 动态其他信息类型输入处理
  onExtraInfoTypeInput(e) {
    const { index } = e.currentTarget.dataset; // 获取当前输入框的索引
    const value = e.detail.value; // 获取输入的值
    const extraInfoList = this.data.extraInfoList;
    extraInfoList[index].type = value; // 更新对应索引的类型
    this.setData({ extraInfoList });
  },

  // 动态其他信息内容输入处理
  onExtraInfoContentInput(e) {
    const { index } = e.currentTarget.dataset;
    const value = e.detail.value;
    const extraInfoList = this.data.extraInfoList;
    extraInfoList[index].content = value; // 更新对应索引的内容
    this.setData({ extraInfoList });
  },

  // 添加其他信息
  addExtraInfo() {
    const extraInfoList = this.data.extraInfoList;
    extraInfoList.push({ type: '', content: '' }); // 添加一条空的其他信息项
    this.setData({ extraInfoList });
  },

  // 上传头像
  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      success: res => {
        const tempFilePath = res.tempFilePaths[0];
        this.uploadAvatar(tempFilePath);
      }
    });
  },

  // 上传头像到云存储
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

  // 进入编辑模式
  enterEditMode() {
    this.setData({
      isEditing: true
    });
  },

  // 保存联系人信息
  saveContact() {
    const { name, phone, email, address, avatar, note, extraInfoList, contactId } = this.data;

    if (!name || !phone) {
      wx.showToast({
        title: '请填写必要的联系人信息',
        icon: 'none'
      });
      return;
    }

    contactsCollection.doc(contactId).update({
      data: {
        name,
        phone,
        email,
        address,
        avatar,
        note,
        extraInfoList // 保存动态添加的其他信息
      },
      success: res => {
        wx.showToast({
          title: '联系人已更新',
          icon: 'success'
        });
        this.setData({
          isEditing: false // 退出编辑模式
        });
      },
      fail: err => {
        wx.showToast({
          title: '更新失败',
          icon: 'none'
        });
        console.error('更新联系人失败：', err);
      }
    });
  }
});
