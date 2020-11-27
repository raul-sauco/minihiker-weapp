// pages/program-group/program-group.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    programGroup: null,
    selectedProgram: null,
    resUrl: app.globalData.staticUrl,
    isScrollToTopVisible: false,
    scrollTop: 0,
    nextRequestTimeout: 3000,
    loading: false,
    selectProgramWarningVisible: false,
    selectProgramWarningMessage: '请先选择您要报名的项目'
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    const programGroup = app.globalData.programProvider.get(options.id);
    if (programGroup) {
      // Initial set data to display whatever the provider has
      this.setData({ programGroup });
      wx.setNavigationBarTitle({
        title: programGroup.weapp_display_name
      });
    } else {
      wx.setNavigationBarTitle({ title: '正在下载' });
    }
    // Fetch full program group data
    this.fetchProgramGroupData(options.id);
  },

  /**
   * Ask the program provider to fetch more comprehensive data.
   * This will include the programs[] data and the 
   * textual descriptions as an array of nodes.
   */
  fetchProgramGroupData: function (id) {
    // Loading status feedback can be subtle
    wx.showNavigationBarLoading();
    this.setData({
      loading: true
    });
    app.globalData.programProvider.fetchProgramGroup(id).then( pg => {
      // If there were no errors, we have a program group
      this.setData({
        programGroup: pg,
        loading: false
      });
      wx.setNavigationBarTitle({
        title: pg.weapp_display_name
      });
    }).catch(err => {
      console.error(err);
      wx.showToast({
        icon: 'none',
        title: err.msg,
      });
      setTimeout(this.fetchProgramGroupData, this.data.nextRequestTimeout, id);
      // Increase the delay time each time we request
      this.setData({
        nextRequestTimeout: this.data.nextRequestTimeout * 1.5
      });
    }).finally( () => {
      wx.hideNavigationBarLoading();
    });
  },

  /** 
   * Change the selected program and refresh the UI.
   */
  selectProgram: function (event) {
    const program = this.data.programGroup.programs.find(
      p => p.id === event.currentTarget.dataset.programId
    );
    const spotsLeft = program.client_limit - program.registrations;
    if (!program.selfRegistered && program.registration_open && spotsLeft > 0) {
      this.setData({
        selectedProgram: program
      });
      // Hide the select program warning if currently visible.
      if (this.data.selectProgramWarningVisible) {
        this.hideSelectProgramWarning();
      }
    }
  },

  /**
   * Display the Q/A section related to this ProgramGroup.
   */
  showQA: function (event) {
    wx.navigateTo({
      url: '/pages/program-group-qa/program-group-qa?id=' + this.data.programGroup.id,
    });
  },

  /**
   * Generate the share information for the page.
   */
  onShareAppMessage: function (e) {
    return {
      title: '童行者.' + this.data.programGroup.weapp_display_name,
      path: '/pages/program-group/program-group?id=' + this.data.programGroup.id
    };
  },

  /**
   * Register for the currently selected program of this ProgramGroup.
   */
  register: function (event) {
    if (this.data.selectedProgram) {
      wx.navigateTo({
        url: '/pages/program-registration/program-registration?pg=' +
          this.data.programGroup.id + '&p=' + this.data.selectedProgram.id,
      });
    } else {
      // Display a warning with the details of why you can't register.
      // Right now a visible program group could have no programs, that may change
      // later and the message could become hardcoded into the wxml.
      const data = {
        selectProgramWarningVisible: true
      };
      if (this.data.programGroup.programs.length < 1) {
        data.selectProgramWarningMessage = '目前暂无可选的活动';
      }
      this.setData( data );
      setTimeout(this.hideSelectProgramWarning, 3000);
    }
  },

  /** Hide the select program warning */
  hideSelectProgramWarning: function () {
    if (this.data.selectProgramWarningVisible) {
      this.setData({
        selectProgramWarningVisible: false
      });
    }
  },

  /** Navigate home */
  goHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  backToTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },

  /** 
   * Handle page scrolling event
   */
  onPageScroll: function (e) {
    const top = e.scrollTop;
    // Scrolling down, hide the scroll button if visible
    if (top < 400 || (this.data.scrollTop < top && this.data.isScrollToTopVisible)) {
      this.setData({
        isScrollToTopVisible: false
      });
    }
    // Scrolling up, display the scroll button if hidden
    if (top > 400 && this.data.scrollTop > top && !this.data.isScrollToTopVisible) {
      this.setData({
        isScrollToTopVisible: true
      });
    }    
    this.data.scrollTop = top;
  }
})
