let a=[{id:1,parent:null},{id:2,parent:null},{id:3,parent:1},{id:4,parent:1},{id:5,parent:2},{id:6,parent:3},{id:7,parent:6},{id:8,parent:5}]
let x=[]
let b = a.forEach(el => {
  if(el.parent==null){
    x.push(el)
  }
});

// function asd(a) {
//   console.log('---------');
//   console.log(a);
//   for (let i = 0; i < x.length; i++) {  
//     for(let j=0;j<a.length;j++){
//       if(x[i].child==null){
//         x[i].child=[]
//       }
//       if(x[i].id==a[j].parent){
//         a[j].flag=true
//         x[i].child.push(a[j])
//       }
//     }
//   }
//   let sisa=false
//   // console.log(a);
//   a.forEach(el => {
//     if(el.flag==undefined){
//       sisa=true
//     }
//   });

//   // console.log(sisa);

//   if(sisa==true){
//     // console.log(sisa);
//     // for (let i = 0; i < x.length; i++) {
//       // console.log(x.length);
//       // console.log(x[i].child);
//       asd(x[0].child)
//     // }
//   }
//   return x
  
// }

// // console.log(asd(a));
// console.log(JSON.stringify(asd(a)));


for (let i = 0; i < x.length; i++) {
  if(x[i].child==null){
    x[i].child=[]
  }
  for (let j = 0; j < a.length; j++) {
        if(x[i].id==a[j].parent){
        x[i].child.push(a[j])
      }
  }
}


for (let i = 0; i < x.length; i++) {
  for(let j=0;j<x[i].child.length;j++){
    if(x[i].child[j].child==null){
      x[i].child[j].child=[]
    }
    for (let k = 0; k < a.length; k++) {
      if(x[i].child[j].id==a[k].parent){
        x[i].child[j].child.push(a[k])
      }
      
    }
  }
  
}

console.log(JSON.stringify(x));