var GPIOsw=require('../index');
var test={
  pin:17,
  direction:'out',
  normal:true,
  label:'u',
  group:'gpio'
}
console.log(test)
var G=new GPIOsw()
console.log(G.pins)
G.set(test).then(function(a){
  console.log(G.pins)

  console.log('pass')
  console.log(a)
  setTimeout(function(){

    G.switch(17).then(function(a){
      console.log(a)

      setTimeout(function(){
        G.switch(17).then(function(a){
          console.log(a)
          G.unset(17).then(function(a){
            console.log(a)
            console.log('unset')
            console.log(G.pins)

          }).catch(function(err){
            console.log(err)
          })
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
