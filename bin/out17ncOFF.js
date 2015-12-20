var GPIOsw=require('../index');
var test={
  pin:17,
  direction:'out',
  normal:false,
  group:'gpio'
}
console.log(test)
var G=new GPIOsw()
console.log(G.pins)
G.set(test).then(function(a){
  console.log(G.pins)

  console.log('pass')
  console.log(a)


  G.off(17).then(function(a){
    console.log(a)


    G.unset(17,true).then(function(a){
      console.log(a)
      console.log('unset')
      console.log(G.pins)

    }).catch(function(err){
      console.log(err)
    })


  }).catch(function(err){
    console.log(err)
  })




}).catch(function(err){
  throw Error(err)


})
