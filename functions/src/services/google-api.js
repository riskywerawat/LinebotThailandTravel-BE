/* eslint-disable promise/always-return */
const restPromise = require("request-promise");
const configGoogle = require("../config/config.json")["google"];
const _ = require("underscore");
module.exports.findLocation = function () {
  // https://maps.googleapis.com/maps/api/directions/json?departure_time=now&mode=transit&origin=มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ แขวง วงศ์สว่าง เขตบางซื่อ กรุงเทพมหานคร 10800&destination=อนุสาวรีย์ชัยสมรภูมิ ถนน พหลโยธิน แขวง ถนนพญาไท เขตราชเทวี กรุงเทพมหานคร 10400&key=AIzaSyAAm6Jci_ckEgvGkb98Q15R1h8RtIsjt_8
};

/**
 * @param element User transaction
 * @resolve direction data
 */
module.exports.sortedBus = function (element) {
  return new Promise(async (resolve, reject) => {
    let rt = {};
    let option = {
      uri: "https://maps.googleapis.com/maps/api/directions/json",
      qs: {
        key: configGoogle.key_place,
        origin: element.origin,
        destination: element.destination,
        mode: "transit",
        transit_mode: "bus",
        language: "th"
      }
    };
    console.info("Request:", JSON.stringify(option));
    try {
      let resRest = await restPromise(option);
      rt = JSON.parse(resRest);
      console.info(JSON.stringify(rt));
      resolve(rt);
    } catch (err) {
      rt.massage = err;
      console.error(rt);
      reject(rt);
    }
  });
};

/**
 * @param user_locate latitude,longtitude
 * @param type type for searching
 */
module.exports.nearBySearch = function (user_locate, type) {
  return new Promise((resolve, reject) => {
    var rt = {};
    /** URL และ query ที่ต้องการ */
    var option = {
      uri: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      qs: {
        key: configGoogle.key_place,
        radius: 1000,
        location: user_locate,
        language: "th",
        opennow:true,
        type: type
      }
    };

    console.info("Request:", JSON.stringify(option));
    restPromise(option)
      .then(res => {
        data = JSON.parse(res);
        console.info(JSON.stringify(data));
        for (let i = 0; i < data.results.length; i++) {
          if (!data.results[i].opening_hours) {
            data.results[i].opening_hours = "ไม่มีข้อมูล";
          } 
          else if(data.results[i].opening_hours===false){
            data.results[i].opening_hours = "ปิด";
          }else {
            data.results[i].opening_hours = "เปิดอยู่";
          }
        }
        var results = data.results.map(result => {
          return {
            status: result.opening_hours,
            name: result.name,
            place_id: result.place_id,
            rating: result.rating ? result.rating : 'ยังไม่มีการให้คะแนน',
            address: result.vicinity,
            photo: result.photos ? result.photos[0].photo_reference : []
          };
        });
        rt.status = true;
        rt.data = results;
        resolve(rt);
      })
      .catch(err => {
        rt.massage = err;
        reject(rt);
      });
  });
};

module.exports.textSearch = keyword => {
  /* eslint-disable promise/always-return */
  return new Promise(async (res, rej) => {
    var ret = {};
    var option = {
      uri: "https://maps.googleapis.com/maps/api/place/textsearch/json",
      qs: {
        key: configGoogle.key_place,
        query: keyword,
        language: "th",
        opennow:true,
        rankby: "prominence"
      }
    };
    console.info("Request:", JSON.stringify(option));
    restPromise(option)
      .then(result => {
        var data = JSON.parse(result);
        console.info(JSON.stringify(data));
        for (let i = 0; i < data.results.length; i++) {
          if (!data.results[i].opening_hours) {
            data.results[i].opening_hours = "ไม่มีข้อมูล";
          } else if(data.results[i].opening_hours===false){
            data.results[i].opening_hours = "ปิด";
          } else {
            data.results[i].opening_hours = "เปิดอยู่";
          }
        }
        var results = data.results.map(result => {
          return {
            status: result.opening_hours,
            name: result.name,
            place_id: result.place_id,
            rating: result.rating ? result.rating : 'ยังไม่มีการให้คะแนน',
            address: result.formatted_address,
            //ดักกรณีที่ไม่ม่รูปด้วย
            photo: result.photos ? result.photos[0].photo_reference : []
          };
        });
        ret.status = true;
        ret.data = results;
        res(ret);
      })
      .catch(error => {
        console.log(error);
        ret.status = false;
        ret.massage = error.massage;
        rej(ret);
      });
  });
};

module.exports.PlaceDetail = place_id => {
  return new Promise((res, rej) => {
    var ret = {};
    const option = {
      uri: "https://maps.googleapis.com/maps/api/place/details/json",
      qs: {
        place_id: place_id,
        fields: "name,formatted_address,user_ratings_total,formatted_phone_number,website,opening_hours,website,review,rating,place_id,geometry",
        language: "th",
        key: configGoogle.key_place
      }
    };
    console.info("Request:", JSON.stringify(option));
    restPromise(option)
      .then(result => {
        ret.status = true;
        ret.data = JSON.parse(result);
        JSON.stringify(result)
        res(ret);
      })
      .catch(error => {
        console.log(error);
        ret.status = false;
        ret.massage = error.massage;
        rej(ret);
      });
  });
};

module.exports.placePhotoreFerence = photo_code => {
  return new Promise((res, rej) => {
    var ret = {};
    // eslint-disable-next-line promise/catch-or-return
    fetch(
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&photoreference=${photo_code}
      &key=${configGoogle.key_place}`
      )
      .then(result => {
        const data = _.clone(result);
        ret.status = true;
        ret.data = data.url;
        JSON.stringify(result)
        res(ret);
      })
      .catch(error => {
        console.log(error);
        ret.status = false;
        ret.massage = error.massage;
        rej(ret);
      });
  });
};