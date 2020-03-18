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
    adultSummary: '',
    resUrl: app.globalData.resUrl,
    hasUnselected: true
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    wx.showLoading({
      title: '下载中',
    });

    // We need to find the program group Id based on the program id
    // This could require an asyncronous call if we don't have it already
    app.globalData.programProvider.getProgramGroupIdByProgramId(options.p).then(res => {

      const pg = res,
        program = pg.programs.find( p => +p.id === +options.p),
        price = program.prices.find( pr => pr.id === +options.price);

      this.setData({
        programGroup: pg,
        program: program,
        price: price
      });

      wx.hideLoading();

      this.fetchParticipants();

    }, err => {

      console.warn('Error asynch fetching program group');
      console.warn(err);

    });

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
    const clients = [];
    app.globalData.accountInfoProvider.clients.forEach(client => {

      let c = {};
      c.id = client.id;
      c.name = client.nickname || client.name_zh || client.name_en || client.name_pinyin || client.id;
      c.is_kid = client.is_kid;
      clients.push(c);

    });

    const url = app.globalData.url + 'participants/' + this.data.program.id;

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
          adultSummary: this.generateSummaryMessage(totalAdults, false),
          hasUnselected: this.hasUnselected(totalAdults, totalKids)
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

  },

  /**
   * Check if the user can still select participants
   */
  hasUnselected: function (adults, kids) {

    return adults < this.data.price.adults || kids < this.data.price.kids;

  },
  
  /**
   * Conclude participant selection and navigate to my-account page
   */
  confirm: function () {
    wx.switchTab({
      url: '/pages/me/me',
    });
  }
  
})
