var exec=require('promised-exec');
var Promise=require('promise');
var merge=require('json-add');
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
function switcher(p,bool){
  console.log('put '+bool)
  console.log('expect '+normalize(p.normal,bool))

  return new Promise(function(resolve, reject) {
    var value=booltoval(bool)
    get(p.pin).then(function(val){
      if(valtobool(val)!=bool){
        putvalue(booltoval(bool),pin).then(function(){
          console.log('done')

          resolve({value:value,normal:p.normal,status:normalize(p.normal,bool)})

        }).catch(function(err){
          reject(err)
        })

      } else {
        console.log('okk')
        resolve(true)

      }

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
          putvalue(0,pin).then(function(val){
            resolve(true)
          }).catch(function(err){
            reject(err)
          })
        } else{
          resolve(true)

        }



      } else {

        if(NC){
          putvalue(1,pin).then(function(val){
            resolve(true)
          }).catch(function(err){
            reject(err)
          })
        } else{
          resolve(true)

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
    if(pins[p]==pin.pin){
      noexist=false;
      pins[p]=pin;
    }

  }
  if(noexist){
    console.log('add')
    pins.push(pin)
  }
  console.log('update')

  return pins
}

function switchon(pin,NC){
  return new Promise(function(resolve, reject) {
    get(pin).then(function(val){
      if(val==0){
        if(NC){
          putvalue(1,pin).then(function(val){
            resolve(true)
          }).catch(function(err){
            reject(err)
          })
        } else{
          resolve(true)

        }



      } else {

        if(NC){
          putvalue(1,pin).then(function(val){
            resolve(true)
          }).catch(function(err){
            reject(err)
          })
        } else{
          resolve(true)

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

GPIOsw.prototype.set = function (conf) {

  var pins=this.pins

  return new Promise(function(resolve, reject) {

    console.log('set')
    var config={
      group:'gpio',
      normal:true
    }
    merge(config,conf)



    if (config.pin&&config.direction){


      if(pathExists.sync('/sys/class/gpio/gpio'+config.pin+'/direction')){




        get(config.pin).then(function(val){

          var p=jsonfromval(config.pin,val,config.normal)

          pins=dbpin(pins,p)

          resolve(p)


        }).catch(function(err){
          console.log(err)
          console.log('err')

          reject(err)
        })

      }else {

        exec('echo '+config.pin+' > /sys/class/gpio/export').then(function(){
          console.log('exec0ok')
          exec('echo "'+config.direction+'" > /sys/class/gpio/gpio'+config.pin+'/direction').then(function(){
            var p=jsonfromval(config.pin,0,config.normal)
            pins=dbpin(pins,p)
            resolve(p)


          }).catch(function(err){
            console.log(err)

            reject(err)
          })
        }).catch(function(err){
          reject(err)
          console.log(err)
        })
      }
    } else{


        reject('invalid params')

    }


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

  var p=pininfo(this.pins,pin);


  return new Promise(function(resolve, reject) {
    getvalue(p).then(function(answer){
      resolve(answer)
    }).catch(function(err){
      reject(err)
    })

  })

};

GPIOsw.prototype.on = function (pin,NC) {


  var thep=true;
  if(pininfo(this.pins,pin)){

    for(var p=0;p<this.pins.length;p++){
      if(this.pins[p].pin==pin){
        this.pins[p].status=true
        this.pins[p].value=normalize(this.pins[p].normal,this.pins[p].status)
      }
    }

    thep= this.pins[p]



  }
  return new Promise(function(resolve, reject) {


    switchon(pin,NC).then(function(){
      resolve(thep)
    }).catch(function(err){
      reject(err)
    })

  })


}
GPIOsw.prototype.off = function (pin,NC) {
  var thep=true;

  if(pininfo(this.pins,pin)){

    for(var p=0;p<this.pins.length;p++){
      if(this.pins[p].pin==pin){
        this.pins[p].status=false
        this.pins[p].value=normalize(this.pins[p].normal,this.pins[p].status)
      }
    }
    thep= this.pins[p]

  }

  return new Promise(function(resolve, reject) {


    switchoff(pin,NC).then(function(){
      resolve(thep)
    }).catch(function(err){
      reject(err)
    })

  })




}
GPIOsw.prototype.turn = function (pin,bool) {
  var thep=true;




  if(bool&&bool!='off'){
    if(pininfo(this.pins,pin)){

      for(var p=0;p<this.pins.length;p++){
        if(this.pins[p].pin==pin){
          this.pins[p].status=false
          this.pins[p].value=normalize(this.pins[p].normal,this.pins[p].status)
        }
      }
      thep= this.pins[p]

    }
    return new Promise(function(resolve, reject) {

      switchoff(pin,!thep.normal).then(function(){
        resolve(thep)
      }).catch(function(err){
        reject(err)
      })
    })
  } else {
    if(pininfo(this.pins,pin)){

      for(var p=0;p<this.pins.length;p++){
        if(this.pins[p].pin==pin){
          this.pins[p].status=true
          this.pins[p].value=normalize(this.pins[p].normal,this.pins[p].status)
        }
      }

      thep= this.pins[p]



    }

    return new Promise(function(resolve, reject) {


      switchon(pin,!thep.normal).then(function(){
        resolve(thep)
      }).catch(function(err){
        reject(err)
      })
    })




  }
}

GPIOsw.prototype.switch = function (pin) {



  return new Promise(function(resolve, reject) {
    getvalue(p).then(function(answer){
      console.log('status '+answer.status)
      console.log('value '+answer.value)
      var value=valtobool(answer.value)

      console.log('newvalue '+!valu)
      switcher(p,!value).then(function(a){
        resolve(a)
      }).catch(function(err){
        reject(err)
      })
    }).catch(function(err){
      reject(err)
    })
  })

};

module.exports=GPIOsw
