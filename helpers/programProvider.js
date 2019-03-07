/**
 * Program provider deals with fetching program information
 * from the server
 */
class ProgramProvider {

  programGroups = Map;

  /**
   * Initialize the ProgramProvider by creating an empty
   * programGroup Map.
   * 
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
   */
  constructor () {
    this.programGroups = new Map();
  }

  /**
   * Add a ProgramGroup to the Provider's Map.
   */
  add(pg) {
    // Reorder the programs when the ProgramGroup is first added.
    this.reorderPrograms(pg);

    // Then add it to the Map
    this.programGroups.set(pg.id, pg);
  }

  /**
   * Add all ProgramGroups from the given Array to the Map.
   */
  addFromArray(array) {
    array.forEach(pg => {
      this.add(pg);
    });
  }

  /**
   * Get a ProgramGroup by id. 
   * It will log a warning if the ProgramGroup is not in the Map.
   */
  get(id) {

    // Parse id in case it is a string
    id = parseInt(id, 10);
    
    if (this.programGroups.has(id)) {
      return this.programGroups.get(id);
    } else {
      console.warn(`ProgramProvider does not have ProgramGroup ${id}`);
      return null;
    }
  }

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