/* eslint-disable no-implicit-coercion */
module.exports.flexdetail = function (detail, url_photo) {
  console.log(detail);
  return new Promise(async (res, rej) => {
    var ret = {};
    var rattt = '0';
    var rat_total = '0';
    var phone = "ไม่มีข้อมูล";
    var website = "ไม่มีข้อมูล";
    var lat = detail.geometry.location.lat;
    var long = detail.geometry.location.long;
    var place_id = detail.place_id;
    console.log(detail.rating);
    if (detail.rating) {
      rattt = detail.rating;
    }
    if (detail.user_ratings_total) {
      rat_total = detail.user_ratings_total
    }

    console.log(detail.rating, detail.user_ratings_totals);
    let action_phone = {
      type: "postback",
      label: "โทร",
      data: "error_tel"
    };
    let action_website = {
      type: "postback",
      label: "เว็บไซต์",
      data: "error_web"
    };

    if (detail.formatted_phone_number) {
      phone = detail.formatted_phone_number;
      url_phone = `tel:${detail.formatted_phone_number.split(" ").join("")}`;
      action_phone = {
        type: "uri",
        label: "โทร",
        uri: url_phone
      };
    }

    if (detail.website) {
      website = detail.website;
      url_website = detail.website;
      action_website = {
        type: "uri",
        label: "เว็บไซต์",
        uri: url_website
      };
    }
    if (!detail && !url_photo) {
      ret.status = false;
      ret.message = "error";
      // eslint-disable-next-line prefer-promise-reject-errors
      rej(ret);
    } else {
      const temp = {
        type: "bubble",
        hero: {
          type: "image",
          url: `${url_photo}`,
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover",
          "action": {
            "type": "uri",
            "uri": `https://www.google.com/maps/search/?api=1&query=${lat,long}&query_place_id=${place_id}`
          }
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [{
              type: "text",
              text: `${detail.name}`,
              size: "lg",
              weight: "bold",
              wrap: true
            },
            {
              type: "box",
              layout: "baseline",
              contents: [{
                  type: "text",
                  text: "สถานที่ตั้ง:",
                  flex: 4,
                  size: "md",
                  gravity: "bottom",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: `${detail.formatted_address}`,
                  flex: 8,
                  size: "sm",
                  align: "start",
                  weight: "regular",
                  wrap: true
                }
              ]
            },
            {
              type: "box",
              layout: "baseline",
              contents: [{
                  type: "text",
                  text: "เรตติ้ง",
                  flex: 3,
                  size: "xs",
                  align: "start",
                  weight: "bold"
                },
                {
                  type: "icon",
                  url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
                  size: "xs"
                },
                {
                  type: "text",
                  text: `${rattt}`,
                  flex: 5,
                  margin: "sm",
                  size: "sm",
                  align: "start",
                  gravity: "center",
                  weight: "regular"
                }
              ]
            },
            {
              type: "box",
              layout: "baseline",
              contents: [{
                  type: "text",
                  text: "จำนวนการรีวิว:",
                  flex: 3,
                  margin: "sm",
                  size: "xs",
                  align: "start",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: `${rat_total}`,
                  flex: 4,
                  margin: "sm",
                  size: "sm",
                  align: "start",
                  weight: "regular"
                }
              ]
            },
            {
              type: "box",
              layout: "baseline",
              contents: [{
                  type: "text",
                  text: "เบอร์โทร:",
                  flex: 3,
                  margin: "sm",
                  size: "xs",
                  align: "start",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: `${phone}`,
                  flex: 8,
                  margin: "sm",
                  size: "sm",
                  align: "start",
                  weight: "regular"
                }
              ]
            },
            {
              type: "box",
              layout: "baseline",
              contents: [{
                  type: "text",
                  text: "เว็บไซต์:",
                  flex: 3,
                  size: "xs",
                  gravity: "bottom",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: `${website}`,
                  flex: 8,
                  size: "sm",
                  align: "start",
                  weight: "regular",
                  wrap: true
                }
              ]
            }
          ]
        },
        footer: {
          type: "box",
          layout: "horizontal",
          spacing: "sm",
          contents: [{
              type: "button",
              action: action_phone,
              flex: 3,
              color: "#03B037",
              style: "primary"
            },
            {
              type: "button",
              action: action_website,
              flex: 3,
              color: "#028E7D",
              height: "md",
              style: "primary"
            }
          ]
        }
      };
      ret.status = true;
      ret.data = temp;
      res(ret);
    }
  });
};
module.exports.flextime = function (timedata) {
  return new Promise((res, rej) => {
    const ret = {};

    if (!timedata) {
      res(ret);
    } else {
      var weekday_array = timedata.weekday_text;
      var opening;
      var color_status;
      if (timedata.open_now) {
        opening = "เปิดอยู่";
        color_status = "#21bf73";
      } else {
        opening = "ปิดทำการ";
        color_status = "#fd5e53";
      }
      var i = new Date().getUTCDay();
      var flex = [2, 4, 6, 8, 10, 12, 14];
      var b = [
        "วันอาทิตย์",
        "วันจันทร์",
        "วันอังคาร",
        "วันพุธ",
        "วันพฤหัสบดี",
        "วันศุกร์",
        "วันเสาร์"
      ];
      const index = weekday_array.findIndex(day => b[i] === day.split(":")[0]);
      console.log(flex[index]);
      var flextime = {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [{
              type: "box",
              layout: "vertical",
              spacing: "xl",
              contents: [{
                  type: "text",
                  text: "วันเวลาเปิดทำการ",
                  margin: "sm",
                  size: "lg",
                  align: "center",
                  weight: "bold"
                },
                {
                  type: "separator"
                },
                {
                  type: "text",
                  text: weekday_array[0],
                  align: "center"
                },
                {
                  type: "separator"
                },
                {
                  type: "text",
                  text: weekday_array[1],
                  align: "center"
                },
                {
                  type: "separator"
                },
                {
                  type: "text",
                  text: weekday_array[2],
                  align: "center"
                },
                {
                  type: "separator"
                },
                {
                  type: "text",
                  text: weekday_array[3],
                  align: "center"
                },
                {
                  type: "separator"
                },
                {
                  type: "text",
                  text: weekday_array[4],
                  align: "center"
                },
                {
                  type: "separator"
                },
                {
                  type: "text",
                  text: weekday_array[5],
                  align: "center"
                },
                {
                  type: "separator"
                },
                {
                  type: "text",
                  text: weekday_array[6],
                  align: "center"
                },
                {
                  type: "separator"
                }
              ]
            },
            {
              type: "box",
              layout: "baseline",
              spacing: "xl",
              contents: [{
                  type: "text",
                  text: "สถานะการให้บริการ:",
                  flex: 3,
                  margin: "sm",
                  size: "lg",
                  align: "start",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: opening,
                  flex: 1,
                  margin: "sm",
                  size: "sm",
                  align: "start",
                  weight: "bold",
                  color: color_status
                }
              ]
            }
          ]
        }
      };
      flextime.body.contents[0].contents[flex[index]] = {
        type: "text",
        text: weekday_array[index],
        align: "center",
        weight: "bold",
        color: color_status
      };
      ret.status = true;
      ret.data = flextime;
      res(ret);
    }
  });
};
module.exports.flexreview = function (arrreview) {
  return new Promise((res, rej) => {
    var ret = {};
    if (!arrreview) {
      ret.status = false;
      ret.message = "error";
      rej(ert);
    }
    var arr = arrreview;
    var temp = [];
    arr.forEach(element => {
      var text;
      console.log(`review`, element);
      if (element.text === '') {
        text = 'ไม่ได้แสดงความคิดเห็น'
      } else {
        text = element.text;
      }
      let flex = {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
              type: "text",
              text: "REVIEW",
              margin: "none",
              size: "sm",
              align: "start",
              gravity: "top",
              weight: "bold",
              color: "#AAAAAA"
            },
            {
              type: "image",
              url: element.profile_photo_url,
              align: "center",
              aspectRatio: "4:3",
              aspectMode: "fit"
            }
          ]
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [{
              type: "box",
              layout: "vertical",
              contents: [{
                  type: "text",
                  text: element.author_name,
                  flex: 8,
                  size: "md",
                  align: "center",
                  gravity: "center",
                  weight: "bold",
                  wrap: true
                },
                {
                  type: "separator",
                  margin: "lg"
                }
              ]
            },
            {
              type: "box",
              layout: "vertical",
              contents: [{
                  type: "text",
                  text: "ความคิดเห็น:",
                  flex: 8,
                  size: "md",
                  align: "start",
                  gravity: "center",
                  weight: "bold",
                  wrap: true
                },
                {
                  type: "text",
                  text: text.length > 250 ?
                    text.substring(0, 250) + "..." : text,
                  flex: 0,
                  size: "xs",
                  align: "start",
                  wrap: true
                }
              ]
            },
            {
              type: "box",
              layout: "baseline",
              contents: [{
                  type: "text",
                  text: "การให้คะแนน:",
                  flex: 0,
                  margin: "xs",
                  size: "sm",
                  align: "start",
                  weight: "bold"
                },
                {
                  type: "icon",
                  url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
                  size: "xs"
                },
                {
                  type: "text",
                  text: ` ${element.rating}`
                }
              ]
            },
            {
              type: "box",
              layout: "baseline",
              contents: [{
                  type: "text",
                  text: "แสดงความคิดเห็นเมื่อ",
                  flex: 6,
                  margin: "xs",
                  size: "sm",
                  align: "start",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: element.relative_time_description,
                  flex: 4,
                  margin: "sm",
                  size: "sm",
                  align: "start",
                  weight: "bold",
                  color: "#EA7F7F"
                }
              ]
            }
          ]
        },
        footer: {
          type: "box",
          layout: "horizontal",
          contents: [{
            type: "button",
            action: {
              type: "uri",
              label: "ดูรายละเอียดผู้รีวิว",
              uri: element.author_url
            },
            color: "#04A4B6",
            style: "primary"
          }]
        }
      };
      temp.push(flex);
    });
    ret.status = true;
    ret.data = temp;
    res(ret);
  });
};
module.exports.getSeletedPlace = function (temp, arr, type) {
  var temp1 = temp;
  return new Promise((res, rej) => {
    var results = arr;
    if (results.length > 10) {
      for (let i = 0; i < 10; i++) {
        const flex = {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [{
                type: "text",
                text: "ครัวเมืองลำปาง",
                size: "lg",
                align: "start",
                weight: "bold",
                wrap: true
              },
              {
                type: "separator"
              },
              {
                type: "box",
                layout: "baseline",
                contents: [{
                    type: "text",
                    text: "สถานที่ตั้ง:",
                    flex: 4,
                    size: "md",
                    gravity: "bottom",
                    weight: "bold"
                  },
                  {
                    type: "text",
                    text: "100 ถนน ห้วยแก้ว ตำบลสุเทพ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50200",
                    flex: 8,
                    size: "sm",
                    align: "start",
                    weight: "regular",
                    wrap: true
                  },
                  {
                    type: "spacer"
                  }
                ]
              },
              {
                type: "separator"
              },
              {
                type: "box",
                layout: "baseline",
                contents: [{
                    type: "text",
                    text: "สถานะการให้บริการ:",
                    flex: 3,
                    margin: "sm",
                    size: "sm",
                    align: "start",
                    weight: "bold"
                  },
                  {
                    type: "text",
                    text: "เปิดอยู่",
                    flex: 2,
                    margin: "sm",
                    size: "sm",
                    align: "start",
                    weight: "bold",
                    color: "#0CF929"
                  }
                ]
              },
              {
                type: "box",
                layout: "baseline",
                contents: [{
                    type: "text",
                    text: "คะแนนเฉลี่ย",
                    flex: 3,
                    size: "sm",
                    align: "start",
                    weight: "bold"
                  },
                  {
                    type: "icon",
                    url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
                    size: "xs"
                  },
                  {
                    type: "text",
                    text: "4.0",
                    flex: 5,
                    margin: "sm",
                    size: "sm",
                    align: "start",
                    gravity: "center",
                    weight: "regular"
                  }
                ]
              }
            ]
          },
          footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [{
              type: "button",
              action: {
                type: "postback",
                label: "ดูรายละเอียด",
                data: ""
              },
              color: "#459950",
              style: "primary"
            }]
          }
        };
        flex.body.contents[0].text = results[i].name;
        flex.body.contents[2].contents[1].text = results[i].address;
        flex.body.contents[4].contents[1].text = results[i].status;
        results[i].status === "เปิดอยู่" ?
          (flex.body.contents[4].contents[1].color = "#459950") :
          (flex.body.contents[4].contents[1].color = "#cccccc");
        flex.body.contents[5].contents[2].text = results[i].rating + "";
        flex.footer.contents[0].action.data = `${type}^${results[i].place_id}^${results[i].photo}^detail`;
        temp1.contents.contents.push(flex);
      }
    } else if (results.length < 10) {
      results.forEach((result, i) => {
        const flex = {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [{
                type: "text",
                text: "ครัวเมืองลำปาง",
                size: "lg",
                align: "start",
                weight: "bold",
                wrap: true
              },
              {
                type: "separator"
              },
              {
                type: "box",
                layout: "baseline",
                contents: [{
                    type: "text",
                    text: "สถานที่ตั้ง:",
                    flex: 4,
                    size: "md",
                    gravity: "bottom",
                    weight: "bold"
                  },
                  {
                    type: "text",
                    text: "100 ถนน ห้วยแก้ว ตำบลสุเทพ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50200",
                    flex: 8,
                    size: "sm",
                    align: "start",
                    weight: "regular",
                    wrap: true
                  },
                  {
                    type: "spacer"
                  }
                ]
              },
              {
                type: "separator"
              },
              {
                type: "box",
                layout: "baseline",
                contents: [{
                    type: "text",
                    text: "สถานะการให้บริการ:",
                    flex: 3,
                    margin: "sm",
                    size: "sm",
                    align: "start",
                    weight: "bold"
                  },
                  {
                    type: "text",
                    text: "เปิดอยู่",
                    flex: 2,
                    margin: "sm",
                    size: "sm",
                    align: "start",
                    weight: "bold",
                    color: "#0CF929"
                  }
                ]
              },
              {
                type: "box",
                layout: "baseline",
                contents: [{
                    type: "text",
                    text: "คะแนนเฉลี่ย",
                    flex: 3,
                    size: "sm",
                    align: "start",
                    weight: "bold"
                  },
                  {
                    type: "icon",
                    url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
                    size: "xs"
                  },
                  {
                    type: "text",
                    text: "4.0",
                    flex: 5,
                    margin: "sm",
                    size: "sm",
                    align: "start",
                    gravity: "center",
                    weight: "regular"
                  }
                ]
              }
            ]
          },
          footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [{
              type: "button",
              action: {
                type: "postback",
                label: "ดูรายละเอียด",
                data: ""
              },
              color: "#459950",
              style: "primary"
            }]
          }
        };
        flex.body.contents[0].text = result.name;
        flex.body.contents[2].contents[1].text = result.address;
        flex.body.contents[4].contents[1].text = result.status;
        result.status === "เปิดอยู่" ?
          (flex.body.contents[4].contents[1].color = "#459950") :
          (flex.body.contents[4].contents[1].color = "#cccccc");
        flex.body.contents[5].contents[2].text = results[i].rating + "";
        flex.footer.contents[0].action.data = `${type}^${results[i].place_id}^${result.photo}^detail`;
        temp1.contents.contents.push(flex);
      });
    } else {
      rej(error);
    }
    var obj = temp1;
    res(obj);
  });
};