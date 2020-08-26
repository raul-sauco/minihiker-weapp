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

  /**
   * Send an error message to the server. Accepted parameters are: 
   * {
   *   message: string,
   *   res: string,
   *   extra: string,
   *   page: string,
   *   method: string,
   *   line: string,
   *   level: number,
   *   timestamp: string  (automatically added)
   * }
   */
  log (data) {
    data.timestamp = '' + Date.now();
    const header = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.accessToken
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
