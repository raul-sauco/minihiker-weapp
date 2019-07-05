// pages/select-participants/select-participants.js
const app = getApp();

Page({

  /**
   * Page initial data
   */
  data: {
    programGroup: null,
    program: null,
    price: null,
    clients: null,
    kidParticipants: 0,
    adultParticipants: 0,
    kidSummary: '',
    adultSummary: ''
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    console.debug('Select participants for ProgramGroup ' + options.pg + ' program ' + options.p + ' price ' + options.price);

    // Fetch the programGroup and program from the global programProvider
    let pg = app.globalData.programProvider.get(options.pg);
    let p = pg.programs.find(program => {
      return program.id == options.p;
    });
    let price = p.prices.find(price => price.id == options.price);

    this.setData({
      programGroup: pg,
      program: p,
      price: price
    });

    wx.setNavigationBarTitle({
      title: '选择参与者'
    });

    this.fetchParticipants();

  },

  /**
   * Fetch the family members that are participating in the
   * program.
   */
  fetchParticipants: function () {

    wx.showLoading({
      title: '下载中',
    });

    // Iterate over the provider client collection and copy wanted data
    let clients = [];
    app.globalData.accountInfoProvider.clients.forEach(client => {

      let c = {};
      c.id = client.id;
      c.name = client.nickname || client.name_zh || client.name_en || client.name_pinyin || client.id;
      c.is_kid = client.is_kid;
      clients.push(c);

    });

    let url = app.globalData.url + 'participants/' + this.data.program.id;

    wx.request({
      url: url,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.accessToken
      },
      success: res => {

        let totalKids = 0;
        let totalAdults = 0;

        res.data.forEach(participant => {

          console.debug('Got participant ' + participant.id);
          // Add it to the number of participants
          if (participant.is_kid) {
            console.debug('Got participant ' + participant.id + ', kid');
            totalKids ++;
          } else {
            totalAdults++;
            console.debug('Got participant ' + participant.id + ', adult');
          }

          // Check if the clients are already participants
          clients.forEach(client => {
            if (client.id == participant.id) {
              client.isParticipant = true;
              console.debug('  Participant id ' + participant.id + ' matches client id ' + client.id);
            } else {
              console.debug('  Participant id ' + participant.id + ' does not match client id ' + client.id);
            }
          });

        });

        console.debug(clients);

        this.setData({
          clients: clients,
          kidParticipants: totalKids,
          adultParticipants: totalAdults,
          kidSummary: this.generateSummaryMessage(totalKids, true),
          adultSummary: this.generateSummaryMessage(totalAdults, false)
        });

      },
      fail: res => {
        console.warn("Request failed: " + url);
      },
      complete: res => {
        console.debug("Request completed: " + url);
        wx.hideLoading();
      }
    });

  },

  /**
   * Toggle a client's selected status for the program.
   */
  selectClient: function (event) {

    console.debug(event);

    let clientId = event.currentTarget.dataset.id;
    let programId = this.data.program.id;
    let add = event.detail.value;

    if (add) {
      console.debug('Adding ' + clientId + ' to program ' + programId);
    } else {
      console.debug('Removing ' + clientId + ' from program ' + programId);
    }

    wx.showLoading({
      title: '上传更新',
    });

    let url = app.globalData.url + 'participants/' + clientId + '/' + programId;

    wx.request({
      url: url,
      method: add ? 'POST' : 'DELETE',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.accessToken
      },
      success: res => {
        this.fetchParticipants();
      },
      fail: res => {
        console.warn("Request failed: " + url);
      },
      complete: res => {
        console.debug("Request completed: " + url);
      }
    });

  },

  /**
   * Generate a summary message for either kids or adults.
   */
  generateSummaryMessage: function (current, forKid) {

    let limit = forKid ? this.data.price.kids : this.data.price.adults;
    let c = forKid ? '小' : '大';
    let message;

    if (current < limit) {
      message = '您仍然可以从总共' + limit + '个中选择' + (limit - current) + (forKid ? '小' : '大');
    } else {
      message = '目前,所有' + (forKid ? '宝贝' : '成人') + '名额已全部填补'
    }

    return message;

  }
  
})