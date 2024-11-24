import * as XLSX from '../../utils/xlsx.full.min.js';

wx.cloud.init({
  env: 'george-8gktege9596a5ba5' 
});

const db = wx.cloud.database();  
const contactsCollection = db.collection('contacts');  

Page({
  data: {
    letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ#",  
    contact: [],  
    filteredContacts: [],  
    loc: "",
    screenHeight: 0,
    searchTerm: ""  
  },

  loadContactsFromDatabase() {
    let self = this;
    contactsCollection.field({
      name: true,  
      _id: true,
      status:true    
    }).get({
      success: res => {
        let contacts = res.data;  
        console.log("contacts",contacts)
        self.arrangeContact(contacts);  
      },
      fail: err => {
        console.error('从数据库获取联系人失败：', err);
      }
    });
  },

  arrangeContact(contacts) {
    var self = this;
    var contact = [];

    for (var i = 0; i < self.data.letters.length; i++) {
      var letter = self.data.letters[i];
      var group = [];

      for (var j = 0; j < contacts.length; j++) {
        let contactItem = contacts[j];
        let contactName = contactItem.name;
        let contactLetter = /^[\u4e00-\u9fa5]+$/.test(contactName[0]) 
          ? "#"  
          : contactName[0].toUpperCase();  

        if (contactLetter === letter) {
          group.push(contactItem);  
        }
      }

      contact.push({
        letter: letter,
        group: group
      });
     // console.log("contact",contact)
    }

    self.setData({
      contact: contact,
      filteredContacts: contact  
    });
  },
  collect(e){
    //收藏联系人
    let self = this;
    console.log("collect",e)
    var _id = e.currentTarget.dataset.id;
    console.log(_id)
    var oldstatus = e.currentTarget.dataset.status
    const _ = db.command
    if(oldstatus==1){
      contactsCollection.doc(_id).update({
        data:{
          status: 2
        },
        success: function(res) {
          console.log("update",res)
          self.loadContactsFromDatabase()
          wx.showToast({
            title: '成功收藏',
            icon: 'none'
          });
        }
      })
    }else{
      contactsCollection.doc(_id).update({
        data:{
          status:1
        },
        success: function(res) {
          console.log(res)
          self.loadContactsFromDatabase()
          wx.showToast({
            title: '取消收藏',
            icon: 'none'
          });
        }
      })
    }
  
    
  },

  onSearchInput: function (e) {
    const searchTerm = e.detail.value.toLowerCase();  
    this.setData({
      searchTerm: searchTerm
    });

    this.filterContacts();
  },

  filterContacts: function () {
    const self = this;
    const searchTerm = self.data.searchTerm;

    if (!searchTerm) {
      self.setData({
        filteredContacts: self.data.contact
      });
      return;
    }

    const filteredContacts = self.data.contact.map(group => {
      const filteredGroup = group.group.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm)
      );
      return {
        letter: group.letter,
        group: filteredGroup
      };
    }).filter(group => group.group.length > 0);  

    self.setData({
      filteredContacts: filteredContacts
    });
  },

  onLoad: function () {
    this.loadContactsFromDatabase(); 
    var screenHeight = wx.getSystemInfoSync().screenHeight;
    this.setData({
      screenHeight: screenHeight * 2,
    });
  },

  onTapScroll: function (e) {
    var loc = e.currentTarget.dataset.loc;  
    this.setData({
      loc: loc  
    });
  },

  onAddContact() {
    wx.navigateTo({
      url: '/pages/addContact/addContact'  
    });
  },
  base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  },
  importData(){
    let that = this
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: function (res) {
        const filePath = res.tempFiles[0].path;
        wx.getFileSystemManager().readFile({
          filePath: filePath,
          encoding: 'base64',
          success: function (res) {
            const data = that.base64ToArrayBuffer(res.data);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            json.forEach((row, rowIndex) => {
              if(rowIndex>0){
                contactsCollection.add({
                  data: {
                    name: row[0],
                    phone: row[1],
                    email: row[2],
                    address: row[3],
                    avatar: '',  
                    note:row[4],
                    status:1,
                    associations:[]
                  },
                  success: res => {
                  
                  },
                  fail: err => {
                   
                    console.error('数据库添加失败：', err);
                  }
                });
              }
            });
            that.loadContactsFromDatabase()
            console.log("excel",json);
            wx.showToast({
              title: '操作成功',
              icon: 'none'
            });
          },
          fail: function (err) {
            console.error('读取文件失败', err);
          }
        });
      },
      fail: function (err) {
        console.error('选择文件失败', err);
      }
    });

  },
  exportData(){
    wx.showToast({
      title: '操作成功',
      icon: 'none'
    });
    //return;

    const data = [
      ['姓名', '电话', '邮箱','地址','备注'],
    ];
    contactsCollection.field({
      name: true,  
      phone: true,
      email:true,
      address:true,
      note:true

    }).get({
      success: res => {
        data.push(res.data)
       // let contacts = res.data;  
       const worksheet = XLSX.utils.aoa_to_sheet(data);
       const workbook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
       const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
       const fs = wx.getFileSystemManager();
       const filePath = `${wx.env.USER_DATA_PATH}/exported_file.xlsx`;
       const arrayBuffer = excelBuffer.buffer;
       console.log("filePath",filePath)
       var r =  fs.writeFileSync(filePath,arrayBuffer,'binary');
       fs.open(filePath)
      },
      fail: err => {
        console.error('从数据库获取联系人失败：', err);
      }
    });
   
    return;
    fs.writeFileSync({
      filePath: filePath,
      data: arrayBuffer,
      encoding: 'binary',
      success: function (res) {
        console.log(res)
        // wx.saveFile({
        //   tempFilePath: filePath,
        //   success: function (res) {
        //     const savedFilePath = res.savedFilePath;
        //     wx.showToast({
        //       title: '文件已保存',
        //       icon: 'success'
        //     });
        //   },
        //   fail: function (err) {
        //     console.error('保存文件失败', err);
        //   }
        // });
      },
      fail: function (err) {
        console.error('写入文件失败', err);
      }
    });
  }

});


