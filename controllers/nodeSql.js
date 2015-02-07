var   sql= require('mssql')
    , parallel= require('paralleljs')
    , _= require('underscore')
    , q= require('q')
    , md5= require('MD5');

var configSql = {
 user: 'afeliz',
 password: 'carlos',
 server: 'afeliz', // You can use 'localhost\\instance' to connect to named instance
// user: 'josm',
// password: 'josm',
// server: 'cdelacruz', // You can use 'localhost\\instance' to connect to named instance
 database: 'CRM',
 //stream: true, // You can enable streaming globally
 options: {
  encrypt: true, // Use this if you're on Windows Azure
  connecTimeout: 300000,
  requestTimeout: 600000
 }
}

exports.executeQueryInsertCustomerCampaignQueries = function(db, queryList, mongoTable){
 return function(req,res){
  var mongoTable = req.body.mongoTable;  
  var queryList = req.body.queryList;  
  var customerCampaign = getCustomerCampaignQueriesInfo(queryList, mongoTable, db, res);
 }
}

var getCustomerCampaignQueriesInfo = function(queryList, mongoTable, db, res){
 var functions = [];
 queryList.forEach(function(query){ functions.push(executeQuery(query, res))});//Para las campañas de la base de datos SQL
 functions.push(getMongoInfo(db,'CAMPANA',{campanaId: 1},res));// Para obetner las campañas que existen en mongo.
 functions.push(getMongoInfo(db,'CLIENTE',{clienteId: 1},res));// Para obetner los clientes que existen en mongo.
 functions.push(getMongoInfo(db,'USUARIO', {usuarioId: 1},res));// Para obetner los oficiales que existen en mongo.
 return q.all(functions).then(function(result){
  var customersCampaign = result[0];
  var customersOfferCampaign = result[1];
  var campaingns = result[2];
  var clients = result[3];
  var officials = result[4];
  var index = {
   offerIndex: 0,
   campaingnIndex: 0,
   clientIndex: 0,
   officialIndex: 0
  };
  var clientLenght = clients.length;
  var officialLenght = officials.length;
  var offerLenght = customersOfferCampaign.length;
  var campaingnsLenght = campaingns.length;
  console.log('Preparando las camañas', new Date());
  
  for(var x in customersCampaign){
   customersCampaign[x].oferta = [];
   customersCampaign[x].estatusVenta = 'Pendiente';
   joinCustomerAndOffer(customersCampaign[x], customersOfferCampaign);
   //index.offerIndex = joinCustomerAndOffer(customersCampaign[x], customersOfferCampaign, index.offerIndex, offerLenght);
   index.campaingnIndex = joinCustomersCampaignAndCampaingns(customersCampaign[x], campaingns, 0,campaingnsLenght)
   index.clientIndex = joinCampaignAndClients(customersCampaign[x], index.clientIndex, clients, clientLenght);
   index.officialIndex = joinCampaignAndOfficial(customersCampaign[x], 0, officials, officialLenght);
   index.campaingnIndex = (x != 0 && customersCampaign[x].clienteId != customersCampaign[x - 1].clienteId)? 0 : index.campaingnIndex;
   index.offerIndex = (x != 0 && customersCampaign[x].clienteId != customersCampaign[x - 1].clienteId)? 0 : index.offerIndex;
  }
  console.log('Insertando campañas');
  insertInMongo(customersCampaign, mongoTable.customersOfferCampaign, db, res);
  console.log('Campañas insertados');
  res.json({done: 'ok'});
 })
}

var joinCustomersCampaignAndCampaingns = function(customersCampaign, campaingns, index, campaingnsLenght){
 index = (index == 0)? index : index - 1;
 for(var y = index; y < campaingnsLenght; y++){
  if(customersCampaign.campanaId < campaingns[y].campanaId){
   index++;
   return index;
  }
  if(customersCampaign.campanaId == campaingns[y].campanaId){
   customersCampaign.campana = campaingns[y];
  }
 }
}

var joinCampaignAndOfficial = function(customersCampaign, index, officials, officialLenght){
 index = (index == 0)? index : index - 1;
 for(var y = index; y < officialLenght; y++){
  if(customersCampaign.oficialId < officials[y].usuarioId){
   index++;
   return index;
  }
  if(customersCampaign.oficialId == officials[y].usuarioId){
   customersCampaign.oficial = officials[y];
  }
 }
}

var joinCampaignAndClients = function(customersCampaign, index, clients, clientLenght){
 index = (index == 0)? index : index - 1;
 for(var y = index; y < clientLenght; y++){
  if(customersCampaign.clienteId < clients[y].clienteId){
   index++;
   return index;
  }
  if(customersCampaign.clienteId == clients[y].clienteId){
   customersCampaign.cliente = clients[y];
  }
 }
}

var joinCustomerAndOffer = function (customersCampaign, offers){
	customersCampaign.oferta = _.filter (offers, function (offer) {return customersCampaign.clienteId == offer.clienteId && customersCampaign.campanaId == offer.campanaId});
}
/*var joinCustomerAndOffer = function(customersCampaign, offers, index, offerLenght){
 for(var y = index; y < offerLenght; y++){
  if (customersCampaign.clienteId < offers[y].clienteId){
   return index;
  }
  if (customersCampaign.clienteId == offers[y].clienteId && customersCampaign.campanaId == offers[y].campanaId){
   customersCampaign.oferta.push(offers[y]);
  }
  index++;
 }
}*/

var getMongoInfo = function(db, mongoTable, sort,res){
 var deferred = q.defer();
 db.get(mongoTable).find({}, {sort: sort},function(err, obj){
  if(err){
   res.json({mongoError: err});
   return;
  }
  deferred.resolve(obj);
 });
 return deferred.promise;
}

exports.executeQueryInsertOfficial = function(db, queryList, mongoTable){
 return function(req,res){
  var mongoTable = req.body.mongoTable;  
  var queryList = req.body.queryList;  
  var oficial = getOfficialInfo(queryList, mongoTable, db, res);
 }
}

var getOfficialInfo = function(queryList, mongoTable, db, res){
 var functions = [];
 queryList.forEach(function(query){ functions.push(executeQuery(query, res))});
 return q.all(functions).then(function(result){
  var official = result[0];
  console.log('Organizando data de los oficiales');
  for(var x in official){
   //usuario.usuarioRed = usuario.oficial.split(' ')
   official[x] = {
    usuarioId : official[x].usuarioId || official[x].oficialId,
    nombre: official[x].nombre,
    apellido: official[x].apellido,
    nombreCompleto: official[x].nombre + ' ' + official[x].apellido,
    usuarioRed: official[x].usuario.toLowerCase(),
    zona: official[x].zona.toUpperCase(),
    sucursal: official[x].sucursal.toUpperCase(),
    activo: true,
    manager: {
     usuarioId: (official[x].supervisor) ?  official[x].supervisor : null,
     nombre: official[x].supervisorNombre,
     apellido: official[x].supervisorApellido,
     nombreCompleto: official[x].supervisorNombre + ' ' + official[x].supervisorApellido,
    },
    rol: official[x].rol,
    password: md5(official[x].usuario.toLowerCase()),
   }
   if(official[x].rol.toLowerCase() == 'administrador'){
    official[x].oficiales = [];
   }
  }
  console.log('Insertando oficiales');
  insertInMongo(official, mongoTable, db, res);
  console.log('Oficiales insertados');
  res.json({done: 'ok'});
 })
}

exports.executeQueryInsertClient = function(db){
 return function(req,res){
  var mongoTable = req.body.mongoTable;  
  var queryList = req.body.queryList;  
  var cliente = getClientInfo(queryList, mongoTable, db, res);
 }
}

var getClientInfo = function(queryList, mongoTable, db, res){
 var data = {};
 var functions = [];
 queryList.forEach(function(query){ functions.push(executeQuery(query, res))});
 return q.all(functions)
 .then(function (results){
  console.log('Recibi Clientes',results[0].length);
   console.log('Recibi telefonos',results[1].length);
   console.log('Recibi productos',results[2].length);
   console.log('Recibi productos sugeridos',results[3].length);
  console.log('Start:' , new Date(), new Date().getMilliseconds())
  data.clients = results[0];
  data.phones = results[1];
  data.products = results[2];
  data.suggestedProducts = results[3];
  console.log('JOIN Start:', new Date(), new Date().getMilliseconds())
  joinProfile(data.clients, data.phones, data.products, data.suggestedProducts, mongoTable, db, res);
 }) 
 .done(function(results){
 })
}

var joinProfile = function(clients, phones, products, suggestedProducts, mongoTable, db, res){ 
 var phoneIndex = 0 ;
 var productIndex = 0 ;
 var suggestedProductIndex = 0 ;
 var phonesLength = phones.length;
 var productsLength = products.length;
 var suggestedProductsLength = suggestedProducts.length;
 var clientsUpdated = [];
 
 console.log('Preparando clientes', new Date())
 for(var x in clients){ 
  clients[x] = {
    clienteId: clients[x].clienteId,
    oficial:{
     oficialId: clients[x].oficialId,
     nombre: clients[x].oficialNombre,
     apellido: clients[x].oficialApellido,
     nombreCompleto: clients[x].oficialNombre + ' ' + clients[x].oficialApellido,
    },
    nombre: clients[x].nombre,
    apellido: clients[x].apellido,
    nombreCompleto: clients[x].nombre + ' ' +clients[x].apellido,
    tipoIdentificacion: clients[x].tipoIdentificacion,
    codigoIdentificacion: clients[x].codigoIdentificacion,
    fechaNacimiento: clients[x].fechaNacimiento,
    direccion: clients[x].direccion,
    email: clients[x].email,
    sexo: clients[x].sexo,
    estadoCivil: clients[x].estadoCivil,
    educacion: clients[x].educacion,
    ingresos: clients[x].ingresos || 0,
    educacion: clients[x].educacion,
    tieneHijos: clients[x].tieneHijos,
    cantidadHijos: clients[x].cantidadHijos || 0,
    telefono: [],
    estatus: clients[x].estatus,
    segmento: clients[x].segmento,
    sucursal: clients[x].sucursal,
    rentabilidad: clients[x].rentabilidad,
    productos: [],
    productosSugeridos: [],
   }
  clients[x].tieneHijos = (clients[x].tieneHijos && clients[x].tieneHijos.toLowerCase() == 'si')? true : false;
 }
 console.log('Insertando: telefonos, productos y productos sugeridos', new Date())
 for(var x in clients){ 
  // console.log('Phones start:', new Date(), new Date().getMilliseconds());
  phoneIndex = joinPhones(clients[x], phones, phoneIndex,phonesLength);
  
//  console.log('Products start:', new Date(), new Date().getMilliseconds())
  productIndex = joinProducts(clients[x], products, productIndex,productsLength);
  
//  console.log('Suggested Products start:', new Date(), new Date().getMilliseconds())
  suggestedProductIndex = joinSuggestedProducts(clients[x], suggestedProducts, suggestedProductIndex,suggestedProductsLength);
 }
 console.log('Done:', new Date(), new Date().getMilliseconds());
 insertInMongo(clients, mongoTable, db, res);
 console.log('Inserted:', new Date(), new Date().getMilliseconds());
 res.json({done: 'ok'});
}

var joinPhones = function(client, phones, phoneIndex, phonesLength){ 
  for(var y = phoneIndex; y < phonesLength; y++){
   
   if(client.clienteId < phones[y].clienteId){
    break;
   }
   if(client.clienteId == phones[y].clienteId){
    
   
    client.telefono.push({
     tipo: phones[y].tipo,
     numero: phones[y].numero
    })
   }
    phoneIndex++;
  } 
  
 return phoneIndex;
}

var joinProducts = function (client, products, productIndex, productsLength){
   for(var y = productIndex; y < productsLength; y++){
    
    if(client.clienteId < products[y].clienteId){
     break;
    }
    if(client.clienteId == products[y].clienteId){
     client.productos.push({
      tipo: products[y].tipo,
      producto: products[y].producto,
      productoId: products[y].productoId,
      balance: products[y].balance,
      vencimiento: products[y].vencimiento,
      fechaUltimoAjuste: products[y].fechaUltimoAjuste,
     })
     
    }
    productIndex++;
   }
 
 return productIndex;
}

var joinSuggestedProducts = function(client, suggestedProducts, suggestedProductIndex, suggestedProductsLength){
   for(var y = suggestedProductIndex; y < suggestedProductsLength; y++){
    
    if(client.clienteId < suggestedProducts[y].clienteId){
     break;
    }

    if(client.clienteId == suggestedProducts[y].clienteId){
     client.productosSugeridos.push({
      tipo: suggestedProducts[y].tipo,
      producto: suggestedProducts[y].producto,
      productoId: suggestedProducts[y].productoId,
      balance: suggestedProducts[y].balance,
      vencimiento: suggestedProducts[y].vencimiento,
      fechaUltimoAjuste: suggestedProducts[y].fechaUltimoAjuste,
     });
     
    }
    suggestedProductIndex++;
   }
 
 return suggestedProductIndex;
}

var insertInMongo = function(objectArray, mongoTable, db, res){
 /*db.get(mongoTable).insert(object, function(err, obj){
   if(err){
    console.log(err);
    return;
   }
  })*/
 var subArray = [];
 var end = 200;
 do{
  subArray.push(objectArray.slice(0,end));
  objectArray.splice(0,end);
 }
while(objectArray.length != 0);
 subArray.forEach(function(array){
  //array.forEach(function(obj){
   db.get(mongoTable).insert(array, function(err, obj){
   if(err){
    res.json({mongoError: err});
    return;
   }
  })
  //})
 })
}

var executeQuery = function(query, res){
 var deferred = q.defer();
    
 var array = [];

 console.log('Ejecutando Query: ', query)
 var connection = new sql.Connection(configSql, function(err) {
  if(err){
   res.json('error', { errorSqlConnection: err });
   return;
  }
  var request = new sql.Request(connection);
  request.stream = true; // You can set streaming differently for each request
  request.query(query); // or request.execute(procedure);

  request.on('row', function(row) {
    array.push(row);
  });

  request.on('done', function(returnValue) {
   deferred.resolve(array);
  })
 })
 
 return deferred.promise;
 
}
