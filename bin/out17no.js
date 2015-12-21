var GPIOsw=require('../index');
var test={
  pin:17,
  direction:'out',
  normal:false,
  label:'u',
  group:'gpio'
}

var G=new GPIOsw()
console.log(G.pins)
G.set(test).then(function(a){
  console.log(G.pins)


  setTimeout(function(){

    G.on(17,false).then(function(){
      console.log('on')
      console.log(G.pins)


      setTimeout(function(){
        G.off(17,false).then(function(){
console.log('off')
console.log(G.pins)

          setTimeout(function(){

          G.on(17,false).then(function(){


            console.log('on')
            console.log(G.pins)

          }).catch(function(err){
            console.log(err)
          })
        },5000)

        }).catch(function(err){
          console.log(err)
        })
      },5000)

    }).catch(function(err){
      console.log(err)
    })
  },5000)


}).catch(function(err){
  throw Error(err)


})
