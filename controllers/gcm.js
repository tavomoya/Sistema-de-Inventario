var http = require('http');

exports.notifyPhone = function(accion, mensaje, device){
        var body = JSON.stringify({
        "registration_ids": [device],
        data: {
            accion: accion
         ,  cita: mensaje
        }
    })
    var options = {
        host: 'android.googleapis.com',
        port: 80,
        path: '/gcm/send',
        method: 'POST',
        headers: {
            Authorization: "key=AIzaSyD2tJsfW8VkIfkemtLsDoWFYlidvt5v_aE",
            "Content-Type": "application/json",
            "Content-Length": body.length
        }
    }

    var req = http.request(options, function (res) {
        console.log("check your phone");
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    });

    req.on('error', function (e) {
        console.log(e);
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(body);
    //req.write('data\n');
    req.end();
};
