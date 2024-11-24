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
    searchTerm: ""  ,
    name:"",
    associations_ids:[],
    contactId:0
  },

  onBack: function () {
    wx.navigateBack(); 
  },
  loadContactsFromDatabase() {
    let self = this;
    var associations_ids = self.data.associations_ids;
    if(associations_ids.length>0){
      const _ = db.command
      contactsCollection.field({
        name: true,  
        _id: true,
        status:true    
      }).where({
        _id:_.in(associations_ids)
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

    }
   
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

  onLoad: function (options) {
   let  contactId = options.id;
    let that = this;
    contactsCollection.doc(contactId).get({
      success: function (res) {
        console.log("数据库返回的数据asss:", res.data); 
        that.setData({
          name:res.data.name,
          associations_ids:res.data.associations,
          contactId:contactId
        })
        that.loadContactsFromDatabase(); 
      },
      fail: function (err) {
        console.error("数据库读取失败: ", err);
        wx.showToast({
          title: '获取联系人失败',
          icon: 'none'
        });
      }
    });





  
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
      url: '/pages/selectassociations/selectassociations?id='+this.data.contactId  
    });
  }
});
