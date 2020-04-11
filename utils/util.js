const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * Return a formatted version of the date.
 */
const formatDate = dateString => {
  const currentYear = new Date().getFullYear();

  let dates = dateString.split("-");
  let formattedDate = '';

  if (currentYear !== parseInt(dates[0])) {

    formattedDate += dates[0] + '年';

  }

  formattedDate += dates[1] + '月';
  formattedDate += dates[2] + '日';

  return formattedDate;

}

/**
 * Generate a random string of a required length
 * TODO unused function, move to /utils
 */
const generateRandomString = length => {

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i<length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate
}
