var GPIOsw=require('../index');

var G=new GPIOsw()
console.log(G.pins)
G.set({
  pin:17,
  direction:'out',
  normal:true,
  group:'gpio'
}).then(function(a){
  console.log('pass')
  console.log(G.pins)


}).catch(function(err){
  throw Error(err)


})
