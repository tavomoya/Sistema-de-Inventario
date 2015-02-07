var jLinq = require('jlinq'),
    md5 = require('MD5');


exports.getSecuencia = function(db) {
 return function(req,res){
  db.get('SECUENCIA').find({idSecuencia: req.body.idSecuencia},function(err,obj){
   db.get('SECUENCIA').update({idSecuencia: req.body.idSecuencia}, { $inc: {secuencia: 1}});
   res.json(obj[0].secuencia);
  })
 }
}

exports.getListas = function (db) {
    return function (req, res) {
        var listas = req.body.listas;
        db.get('LISTAS').findOne({}, function (err, obj) {
            var output = {};
            for (var i in listas) {
                output[req.body.listas[i]] = obj[req.body.listas[i]] || [];
            }
            // Para la compatibilidad
            output = (listas) ? output : [obj];
            res.json(output);
        });
    };
};

exports.getCredentialsFilter = function (req) {
	if (!req.user) return {};

    where = {};

    if (req.user.rol == "Administrador")
        where["usuarioId"] = { $in: req.user.oficiales }
    else
        where["usuarioId"] = req.user.usuarioId;
        
    return where;
}
