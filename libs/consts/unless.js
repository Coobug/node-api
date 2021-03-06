module.exports = [
  '/blogapi/login',
  '/blogapi/reg',
  '/blogapi/reg/check/account',
  '/blogapi/service/captcha',
  '/blogapi/service/renewal',
  '/blogapi/articles',
  '/blogapi/upload',
  '/blogapi/banner',
  '/blogapi/article/hot',
  '/blogapi/article/recommend',
  '/blogapi/article/search',
  /^\/blogapi\/action\/checklike\//,
  /^\/blogapi\/user\/.*\/center/,
  /^\/blogapi\/user\/.*\/article/,
  /^\/blogapi\/user\/.*\/like/,
  /^\/blogapi\/action\/.*\/comments/,
  /^\/blogapi\/select\//,
  /^\/blogapi\/article\/detail\//,

  // admin
  /^\/blogadmin\//
]
