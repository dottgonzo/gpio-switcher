var GPIOsw=require('../index');

var G=new GPIOsw()
console.log(G.pins)
G.load([{
  pin:17,
  direction:'out',
  normal:false,
  group:'gpio'
}])

  setTimeout(function(){
    console.log(G.pins)

  G.off(17)
  setTimeout(function(){
    console.log(G.pins)

  G.on(17)
  setTimeout(function(){
    console.log(G.pins)

    G.off(17)

  },5000)
  },5000)
},5000)
