/**
 * Program provider deals with fetching program information
 * from the server
 */
class ProgramProvider {

  programGroups = {};

  /**
   * Fetch from the server the image data related to one
   * programGroup and save it into the programGroup.
   */
  fetchProgramGroupImages(id) {

    var programGroup = this.programGroups.id;

    if (programGroup === null || programGroup === undefined) {
      console.warn('No programGroup found for id ' + id);
    } else if(programGroup.images === undefined) {

      var endpoint = 'images?program_group_id=' + id;

      wx.request({
        url: app.globalData + endpoint,
        header: {
          'Content-Type': 'application/json',
          'Authorization': app.globalData.authToken
        },
        success: (res) => {
          // If the request is successful we should get programgroup images back
          programGroup.images = res.data;
        },
        fail: (res) => {
          console.warn('Request failed. ' + this.url + endpoint);
        },
        complete: (res) => {
          console.trace('Request completed. ' + this.url + endpoint);
        }
      });

    }
  }

  /**
   * Reorder the programs of a ProgramGroup based on their 
   * start date.
   */
  reorderPrograms(pg) {

    console.log("Reordering programs for ProgramGroup " + pg.id);

    pg.programs.sort((p1, p2) => {
      let date1 = new Date(p1.start_date);
      let date2 = new Date(p2.start_date);

      if (date1 < date2) {
        return -1;
      } else if (date2 < date1) {
        return 1;
      } else {
        return 0;
      }
    });
    console.log(pg.programs);
  }

}

module.exports = ProgramProvider;