var exec=require('promised-exec');
var Promise=require('promise');
var merge=require('json-add');
var async=require('async');
var pathExists=require('path-exists');

function pininfo(pins,pin){
  for(var p=0;p<pins.length;p++){
    if(pins[p].pin==pin){
      return pins[p]
    }
  }
  return false
}
function booltoval(bool){
  if(bool){
    return 1
  }
  return 0
}
function valtobool(val){
  if(val==1){
    return true
  }
  return false
}
function normalize(normal,value){
  if (normal){
    return !value
  }else {
    return value

  }
}

function statusswitcher(p,bool){
  console.log('put '+bool)
  console.log('expect '+normalize(p.normal,bool))

  return new Promise(function(resolve, reject) {
    var value=booltoval(normalize(p.normal,bool))
    exec('echo '+val+' > /sys/class/gpio/gpio'+p.pin+'/value'  ).then(function(){
      console.log('done')

      resolve({value:value,normal:p.normal,status:bool})

    }).catch(function(err){
      reject(err)
    })


  });
}
function switcher(pin){


  return new Promise(function(resolve, reject) {
    get(pin).then(function(val){
      putvalue(booltoval(!valtobool(val)),pin).then(function(){
        resolve(booltoval(!valtobool(val)))
      }).catch(function(err){
        reject(err)
      })
    }).catch(function(err){
      reject(err)
    })
  });
}
function get(pin){
  return new Promise(function(resolve, reject) {
    exec('cat /sys/class/gpio/gpio'+pin+'/value').then(function(val){
      console.log('val='+val)
      resolve(parseInt(val))
    }).catch(function(err){
      console.log(err)
      reject(err)
    })

  })
}
function getvalue(p){
  return new Promise(function(resolve, reject) {
    get(pin).then(function(val){
      console.log('value='+val)

      var boolvalue=valtobool(val)



      resolve({value:val,normal:p.normal,status:normalize(p.normal,boolvalue)})

    }).catch(function(err){
      reject(err)
    })


  })
}


function jsonfromval(pin,val,normal){

  return {pin:pin,value:val,normal:normal,status:normalize(valtobool(val),normal)}

}
function jsonfromstatus(bool,normal){
  console.log('normal'+booltoval(normalize(bool,normal)))
  return {pin:pin,value:booltoval(normalize(bool,normal)),normal:normal,status:bool}

}

function putvalue(value,pin){
  return new Promise(function(resolve, reject) {

    exec('echo '+value+' > /sys/class/gpio/gpio'+pin+'/value'  ).then(function(){


      resolve(true)

    }).catch(function(err){
      reject(err)
    })
  })

}

function switchoff(pin,NC){
  return new Promise(function(resolve, reject) {
    get(pin).then(function(val){
      if(val==1){
        if(!NC){
          putvalue(0,pin).then(function(){
            resolve(0)
          }).catch(function(err){
            reject(err)
          })
        } else{
          resolve(1)

        }



      } else {

        if(NC){
          putvalue(1,pin).then(function(){
            resolve(1)
          }).catch(function(err){
            reject(err)
          })
        } else{
          resolve(0)

        }



      }
    }).catch(function(err){
      reject(err)
    })


  })

}


function dbpin(pins,pin){
  var noexist=true
  for(var p=0;p<pins.length;p++){
    if(pins[p].pin==pin.pin){
      noexist=false;
      pins[p]=pin;
    }
  }
  if(noexist){
    pins.push(pin)
  }
  return pins
}

function switchon(pin,NC){
  return new Promise(function(resolve, reject) {
    get(pin).then(function(val){
      if(val==0){
        if(!NC){
          putvalue(1,pin).then(function(){
            resolve(1)
          }).catch(function(err){
            reject(err)
          })
        } else{
          resolve(0)
        }
      } else {
        if(NC){
          putvalue(0,pin).then(function(){
            resolve(0)
          }).catch(function(err){
            reject(err)
          })
        } else{
          resolve(1)
        }
      }
    }).catch(function(err){
      reject(err)
    })
  })
}
function GPIOsw(conf){
  this.pins=[]

}


function set(pins,conf){

  console.log(conf)


  return new Promise(function(resolve, reject) {
    var config={
      group:'gpio',
      normal:true
    }
    merge(config,conf)
    if (config.pin&&config.direction){

      if(pininfo(pins,config.pin)){


        resolve(pininfo(pins,config.pin))

      } else{



        if(pathExists.sync('/sys/class/gpio/gpio'+config.pin+'/direction')){
          get(config.pin).then(function(val){
            var p=jsonfromval(config.pin,val,config.normal)
            resolve(p)
          }).catch(function(err){
            console.log(err)
            reject(err)
          })

        }else {

          exec('echo '+config.pin+' > /sys/class/gpio/export').then(function(){
            console.log('exec0ok')
            exec('echo "'+config.direction+'" > /sys/class/gpio/gpio'+config.pin+'/direction').then(function(){
              var p=jsonfromval(config.pin,0,config.normal)
              resolve(p)
            }).catch(function(err){
              reject(err)
            })
          }).catch(function(err){
            reject(err)
            console.log(err)
          })
        }


      }

    } else{
      reject('invalid params')
    }

  })
}


GPIOsw.prototype.set = function (conf) {
  var pins=this.pins
    return new Promise(function(resolve, reject) {

  set(pins,conf).then(function(p){
    pins=dbpin(pins,p)
    resolve(p)
  }).catch(function(err){
    reject(p)

  })
})
}

GPIOsw.prototype.unset = function (pin) {
  if(pininfo(this.pins,pin)){
    var pins=[]
    for(var p=0;p<this.pins.length;p++){
      if(this.pins[p].pin!=pin){
        pins.push(pins[p])
      }
    }
    this.pins=pins;
    return new Promise(function(resolve, reject) {

      exec('echo '+pin+' > /sys/class/gpio/unexport').then(function(){
        console.log('pin '+pin+' removed')
        resolve(true)
      }).catch(function(err){
        reject(err)
      })
    })

  } else{
    return new Promise(function(resolve, reject) {
      resolve('not exists')
    })
  }
}
GPIOsw.prototype.get = function (pin) {
  normal=false
  if(pininfo(this.pins,pin)){
    normal=true
    NC=pininfo(this.pins,pin).normal
  }

  return new Promise(function(resolve, reject) {
    get(pin).then(function(v){

      if(normal){
        resolve(jsonfromval(pin,v,NC))

      }else{
        resolve({value:v,pin:pin})
      }


    }).catch(function(err){
      reject(err)
    })

  })

};




GPIOsw.prototype.load = function (configs) {
  var pins=this.pins;



  return new Promise(function(resolve, reject) {

async.forEach(configs,function(conf,cb){
  set(pins,conf).then(function(p){
    console.log('set'+p.pin)
    pins=dbpin(pins,p)
    cb()
  }).catch(function(err){
    cb(err)
  })
}, function (err) {
  if (err) {
  reject(err)
  } else{
    resolve(pins)
  };
  // configs is now a map of JSON data
})


})

}



GPIOsw.prototype.on = function (pin,NC) {

  if(pininfo(this.pins,pin)){
    NC=pininfo(this.pins,pin).normal
  }

  var pins=this.pins;

  return new Promise(function(resolve, reject) {


    switchon(pin,NC).then(function(v){
      var p=jsonfromval(pin,v,NC)

      pins=dbpin(pins,p)

      resolve(p)

    }).catch(function(err){
      console.log(err)
      reject(err)
    })

  })


}
GPIOsw.prototype.off = function (pin,NC) {

  if(pininfo(this.pins,pin)){
    NC=pininfo(this.pins,pin).normal
  }

  var pins=this.pins;

  return new Promise(function(resolve, reject) {


    switchoff(pin,NC).then(function(v){
      var p=jsonfromval(pin,v,NC)

      pins=dbpin(pins,p)
      resolve(p)

    }).catch(function(err){
      reject(err)
    })
  })




}
GPIOsw.prototype.turn = function (pin,bool,NC) {

  if(pininfo(this.pins,pin)){
    NC=pininfo(this.pins,pin).normal
  }

  var pins=this.pins;

  return new Promise(function(resolve, reject) {



    if(bool&&bool!='off'){
      switchon(pin,NC).then(function(v){
        var p=jsonfromval(pin,v,NC)

        pins=dbpin(pins,p)
        resolve(p)

      }).catch(function(err){
        reject(err)
      })

    } else {

      switchoff(pin,NC).then(function(v){
        var p=jsonfromval(pin,v,NC)

        pins=dbpin(pins,p)
        resolve(p)

      }).catch(function(err){
        reject(err)
      })

    }
  })
}

GPIOsw.prototype.switch = function (pin) {

  var normal=false
  if(pininfo(this.pins,pin)){
    normal=true
    NC=pininfo(this.pins,pin).normal
  }

  return new Promise(function(resolve, reject) {
    switcher(pin).then(function(v){
      if(normal){
        resolve(jsonfromval(pin,v,NC))

      }else{
        resolve({value:v,pin:pin})
      }

    }).catch(function(err){
      reject(err)
    })
  })

};

module.exports=GPIOsw
