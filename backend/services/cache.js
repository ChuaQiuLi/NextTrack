const cache = new Map();

function set(key,data){

  cache.set(key, {data, expiry:Date.now()+600000});

}

function get(key){

  const item=cache.get(key);

  if(!item) return null;

  if(Date.now()>item.expiry) {

    cache.delete(key);
    return null;

  }

  return item.data;

}

module.exports = { get, set };


// const cache = {};

// function set(key, value) {
//   cache[key] = {
//     data: value,
//     expiry: Date.now() + 1000 * 60 * 10 
//   };
// }

// function get(key) {
//   const item = cache[key];
//   if (!item) return null;

//   if (Date.now() > item.expiry) {
//     delete cache[key];
//     return null;
//   }

//   return item.data;
// }

// module.exports = { get, set };