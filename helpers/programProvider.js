/**
 * Program provider deals with fetching program information
 * from the server
 */
class ProgramProvider {

  programGroups = Map;
  accessToken;
  url;

  /**
   * Initialize the ProgramProvider by creating an empty
   * programGroup Map.
   */
  constructor () {
    this.programGroups = new Map();
    this.accessToken = 'guest';
  }

  setApiUrl (url) {
    this.url = url;
  }

  setAccessToken (token) {
    this.accessToken = token;
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

    // Only sort if the Program Group has programs
    if (pg.programs) {

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

    } else {

      // If pg.programs is empty, assign a value to it
      pg.programs = [];

    }
  }

  /**
   * Find a program
   * 
   * returns a ProgramGroup or fails if not found in server.
   */
  getProgramGroupIdByProgramId (id) {

    return new Promise ((resolve, reject) => {

      let parent;

      // Inside arrow functions this is the Provider
      this.programGroups.forEach(pg => {
        
        pg.programs.forEach(p => {
          
          console.debug("Checking p ID " + p.id + " against ID " + id);

          if (p.id === id) {

            console.debug("Found match, returning ProgramGroup " + pg.id);
            parent = pg;

           }

        });

      });

      if (parent) {

        resolve(parent);

      } else {

        console.debug("No ProgramGroup found for Program " + id + " fetching from server");
        
        // We don't have the program locally, find it on the server
        const url = this.url + 'programs/' + id + 
          '?expand=programGroup.location,programGroup.programs,programGroup.type,' + 
          'programGroup.programs.registrations,programGroup.programs.period,programGroup.programs.prices';
          
        wx.request({
          url: url,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.accessToken
          },
          success: res => {

            console.log(res);
            
            if (res.statusCode == 200) {

              console.debug('Got program ' + id + ' from the server');
              this.add(res.data.programGroup);
              resolve(res.data.programGroup);

            } else {

              console.warn("Request successful but no programGroup");
              reject(res);

            }

          },
          fail: res => {
            console.warn("Request failed: " + url);
          },
          complete: res => {
            console.debug("Request completed: " + url);
          }
        });
      }

    });
  }

  /**
   * Query the server for program groups
   */
  fetchProgramGroups(params) {

    let url = this.url + 'wxps?expand=location,type,registration_open';

    // Add the parameters to the endpoint
    Object.keys(params).forEach(key => {

      url += '&' + key + '=' + params[key];

    });

    return this.sendRequest(url);

  }

  /**
   * Query the server for program groups that the current user has visited
   */
  fetchVisitedProgramGroups(params) {

    let url = this.url + 'wxvh?expand=location,type,registration_open';

    // Add the parameters to the endpoint
    Object.keys(params).forEach(key => {

      url += '&' + key + '=' + params[key];

    });

    return this.sendRequest(url);

  }

  /**
   * Query the server for program groups recommended for the current user
   */
  fetchRecommendedProgramGroups(params) {

    let url = this.url + 'wxrp?expand=location,type.registration_open';

    Object.keys(params).forEach(key => {

      url += '&' + key + '=' + params[key];

    });

    return this.sendRequest(url);

  }

  /**
   * Send a GET request to the server at the given URL
   * 
   * @return Promise that resolves in the requested data or an object 
   * with information on the error.
   * 
   * It will add the response data to the program provider object.
   */
  sendRequest(url) {

    return new Promise((resolve, reject) => {

      wx.request({
        url: url,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (this.accessToken ? this.accessToken : 'guest')
        },
        success: res => {

          if (res.statusCode === 200) {

            // res.data contains a programGroup[] even if legth = 0
            this.addFromArray(res.data);

            // Return an object with the data that the page needs
            resolve({
              programGroups: res.data,
              hasNextPage: this.hasNextPage(res),
              nextPageNumber: this.nextPageNumber(res)
            });

          } else {

            console.warn("Request successful but no programGroup");
            reject({
              error: true,
              msg: '服务器错误'
            });

          }

        },
        fail: res => {
          console.warn("Request failed: " + url);
          reject({
            error: true,
            msg: '服务器错误'
          });
        },
        complete: res => {
          console.debug("Request completed: " + url);
        }
      });
    });

  }


  /**
   * Query the server for complete data for one program group.
   * It will add the response data to the program provider object.
   */
  fetchProgramGroup(id) {

    return new Promise((resolve, reject) => {

      const url = `${this.url}program-groups/${id}?` +
      'expand=location,programs,type,programs.registrations,programs.period,programs.prices,programs.selfRegistered,arraywad,arraywap,arraywar,registration_open';

      wx.request({
        url: url,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (this.accessToken ? this.accessToken : 'guest')
        },
        success: res => {

          console.debug('Request successful, got Program Group ' + id);

          if (res.statusCode === 200) {

            // res.data contains a programGroup
            this.add(res.data);

            // return directly the program group
            resolve(res.data);

          } else {

            console.warn("Request successful but no programGroup");
            reject({
              error: true,
              msg: '服务器错误'
            });

          }

        },
        fail: res => {
          console.warn("Request failed: " + url);
          reject({
            error: true,
            msg: '服务器错误'
          });
        },
        complete: res => {
          console.debug("Request completed: " + url);
        }
      });
    });
  }

  /**
   * Check if the response pagination info informs that there are more pages
   */
  hasNextPage (res) {

    const currentPage = res.header['X-Pagination-Current-Page'],
      totalPages = res.header['X-Pagination-Page-Count'];

    return currentPage < totalPages;
  }

  /**
   * Find the page number for the next page of items if it exists.
   */
  nextPageNumber (res) {

    if (this.hasNextPage(res)) {

      return +res.header['X-Pagination-Current-Page'] + 1;

    }

    return null;

  }

}

module.exports = ProgramProvider;
