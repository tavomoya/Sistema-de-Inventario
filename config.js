
var config = {
  development: {
       MAIL_USR: 'mail_user'
     , MAIL_PASS: 'mail_pass"'
     , DB_URL: 'localhost:27017/inventarioWeb' 
     , CONFIRM_ACCOUNT_LINK: ''// 'http://sim.malaniz.com.ar/confirm/email' //URL Comun
     , CHANGE_PASSWORD_LINK: ''// 'http://localhost:8081/public/app/#/changepassword' //URL Comun
     , WS_URL:  'http://192.168.1.202/Proveedor03/SimetricaWS.asmx?wsdl' //URL Comun 
     , APP_PORT: process.env.PORT || 8085
  },
  
  production: {
       MAIL_USR: 'mail_user'
     , MAIL_PASS: 'mail_pass"'
     , DB_URL: 'ip:port/db' 
     , CONFIRM_ACCOUNT_LINK: ''
     , CHANGE_PASSWORD_LINK: '/#/changepassword'
     , WS_URL: ''
     , APP_PORT: process.env.PORT || 80
  }
}

function init(app){
  var mode = app.get('env');
  return config[mode];
}

exports.init = init;
 