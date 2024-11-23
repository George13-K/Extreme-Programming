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
      _id: true    
    }).get({
      success: res => {
        let contacts = res.data;  
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
  }
});
