/**
 * Program provider deals with fetching program information
 * from the server
 */
class ProgramProvider {

  /**
   * Reorder the programs of a ProgramGroup based on their 
   * start date.
   */
  reorderPrograms(pg) {
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
  }

}

module.exports = ProgramProvider;