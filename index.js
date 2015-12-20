var exec=require('promised-exec');
var Promise=require('promise');
var merge=require('json-add');

function pininfo(pins,pin){
  for(var p=0;p<pins.length;p++){
    if(pins[p].pin==pin){
      return pins[p]
    }
  }
  return false
}

function normalize(normal,value){
  if (normal){
    return value
  }else {
    return !value

  }
}

function switcher(p,bool){
  console.log('put '+bool)
  console.log('expect '+normalize(p.normal,bool))

  return new Promise(function(resolve, reject) {

    if(bool){
      val=1
    } else{
      val=0

    }
    exec('echo '+val+' > /sys/class/gpio/gpio'+p.pin+'/value'  ).then(function(){
      console.log('done')

      resolve({value:val,normal:p.normal,status:normalize(p.normal,bool)})

    }).catch(function(err){
      reject(err)
    })


  });
}
function getvalue(p){
  return new Promise(function(resolve, reject) {

    exec('cat /sys/class/gpio/gpio'+p.pin+'/value && sleep 1').then(function(val){
      console.log('value='+val)
      if(val==0){
        var valu=false
      }else {
        var valu=true

      }

      resolve({value:val,normal:p.normal,status:normalize(p.normal,valu)})

    }).catch(function(err){
      reject(err)
    })

  })
}
function GPIOsw(conf){
  this.pins=[]

}

GPIOsw.prototype.set = function (conf) {
  console.log('set')
  var config={
    group:'gpio',
    normal:true
  }
  merge(config,conf)
  config.status=config.normal

  if(config.status){
    config.value=1
  } else{
    config.value=0
  }


  if(!pininfo(this.pins,config.pin)){



    if (config.pin&&config.direction){

      this.pins.push(config)

      console.log('befprom')

      return new Promise(function(resolve, reject) {
        console.log('echo '+config.pin+' > /sys/class/gpio/export')

        exec('echo '+config.pin+' > /sys/class/gpio/export').then(function(){
          console.log('exec0ok')
          exec('echo "'+config.direction+'" > /sys/class/gpio/gpio'+config.pin+'/direction').then(function(){
            switcher(config,false).then(function(a){
              console.log('switch')

              resolve(a)
              console.log('pin '+config.pin+' configured')
            }).catch(function(err){
              console.log(err)

              reject(err)
            })
          }).catch(function(err){
            console.log(err)

            reject(err)
          })
        }).catch(function(err){
          console.log('just activated')




          switcher(config,false).then(function(a){
            console.log('switch')

            resolve(a)
            console.log('pin '+config.pin+' configured')

          }).catch(function(err){
            console.log(err)

            reject(err)
          })
        })
      })

    } else{
      return new Promise(function(resolve, reject) {

        reject('invalid params')
      })
    }
  } else{
    return new Promise(function(resolve, reject) {

      resolve('exists')
    })
  }


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



GPIOsw.prototype.switch = function (pin,bool) {
  var p=pininfo(this.pins,pin);


  return new Promise(function(resolve, reject) {
    if (!bool) {
      getvalue(p).then(function(answer){
        console.log('status '+answer.status)
        console.log('value '+answer.value)

        if(answer.value==0){
          var valu=false
        }else {
          var valu=true

        }
        console.log('newvalue '+!valu)
        switcher(p,!valu).then(function(a){
          resolve(a)
        }).catch(function(err){
          reject(err)
        })


      }).catch(function(err){
        reject(err)
      })
    } else if(bool=='on'){
      switcher(p,true).then(function(a){
        resolve(a)
      }).catch(function(err){
        reject(err)
      })
    } else if (bool=='off') {
      switcher(p).then(function(a){
        resolve(a)
      }).catch(function(err){
        reject(err)
      })
    } else {
      throw('wrong value')
    }
  })

};

module.exports=GPIOsw
