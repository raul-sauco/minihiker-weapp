/**
 * Logger helper
 */
class Logger {

  url = null;
  env = 'dev';
  accessToken = 'guest';

  /** Initialize the Logger */
  constructor(url, env) {
    this.url = url;
    this.env = env;
  }

  /** Setter for API URL */
  setApiUrl(url) {
    this.url = url;
  }

  /** Setter for user's API access token */
  setAccessToken(token) {
    this.accessToken = token;
  }
  
  /** Sanitize the data to be sent to the server */
  sanitizeData(data) {
    const stringFields = ['message','res','req','extra','page','method','line'];
    stringFields.forEach(f => {
      if (typeof data[f] !== 'string') {
        data[f] = JSON.stringify(data[f], null, 2);
      }
    });
    if (typeof data.level !== 'number') {
      data.level = parseInt(data.level, 10);
    }
    return data;
  }

  /**
   * Send an error message to the server. Accepted parameters are: 
   * {
   *   message: string,
   *   res: string,
   *   req: string,
   *   extra: string,
   *   level: number,
   *   page: string,
   *   method: string,
   *   line: string,
   *   level: number,
   *   timestamp: string  (automatically added)
   * }
   */
  log (data) {
    data = this.sanitizeData(data);
    data.timestamp = '' + Date.now();
    const header = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + (this.accessToken || 'guest')
    };
    wx.request({
      url: this.url + 'weapp-logs',
      header,
      data,
      method: 'POST',
      success: res => {
        if (res.statusCode !== 201) {
          console.warn('Error sending log to server', res);
        }
      },
      fail: err => {
        console.warn('Error sending log to server', err);
      }
    });
  }
}

module.exports = Logger;
