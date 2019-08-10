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

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate
}
