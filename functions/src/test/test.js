/* eslint-disable promise/always-return */
/* eslint-disable promise/always- */
/*********************************** import Database - Firestore ***********************************/
const db = require("../config/firestore");
var templace = require("../config/config-flexbox")["flexbox_prototypePlace"];
const googleapi = require("../services/google-api");
const _ = require("underscore");
const temp = require("../template/busdirection.json");
const express = require("express");
const Router = express.Router();

// functions/src/template/busdirection.json
/*********************************** import undercore js ***********************************/

/**
 * ! ห้ า ม ล บ
 * *Test only
 */
Router.get("/ohm", async (req, res) => {
  try {
    let bus_res = await googleapi.sortedBus({
      origin: `13.805207063673178,100.50962261751535`,
      destination: `เดอะมอลล์บางกะปิ`
    });
    let steps = bus_res.routes[0].legs[0].steps;
    let result = [];
    await steps.forEach((step, i) => {
      if (step.travel_mode === "WALKING") {
        console.log(step.html_instructions);
        let walking = {
          type: "text",
          text: `${step.html_instructions}`,
          wrap: true
        };
        result.push(walking);
      } else if (step.travel_mode === "TRANSIT") {
        console.log(`เป้าหมาย => `, step.transit_details.headsign);
        console.log(`หมายเลขรถ =>`, step.transit_details.line.short_name);
        console.log(`รถเมล์สาย =>`, step.transit_details.line.name);
        console.log(`นั่ง => `, step.html_instructions);
        let bus1 = {
          type: "text",
          text: `ปลายทาง: ${step.transit_details.headsign}`,
          wrap: true
        };
        let bus2 = {
          type: "text",
          text: `รถเมล์สาย: ${step.transit_details.line.short_name} (${step.transit_details.line.name})`,
          wrap: true
        };
        result.push(bus1, bus2);
      }
      let separator = {
        type: "separator",
        margin: "xs",
        color: "#3F3F3F"
      };
      result.push(separator);
    });
    console.log(result);
    temp.contents.body.content = result;
    res.status(200).json(temp);
  } catch (error) {
    res.status(500).json(JSON.stringify(error));
  }
});
Router.get(`/jay`, async (req, res) => {
  try {
    const prototype = {
      type: "flex",
      altText: "Flex Message",
      contents: {
        type: "carousel",
        contents: []
      }
    };
    const url_photo = await googleapi.placePhotoreFerence(
      "CmRaAAAA6Qh3ioRtyGpk0pJHlkKCbllhXh4sWtXRvW1VfrUnkFVzX0WE68GTudYw7BpTegJV6CCir39xgG5V-ACibNqhs81hw-r9U_Ne-H98F3ha8Ktfe39emdYhbSTueHuF98jnEhAPiBX08YhP1isw-L2qpTc6GhQKZcgK2MeU6RZHVClH1ypVB1x7Cw"
    );
    const getdetail = await googleapi.PlaceDetail(
      "ChIJ-_w0xw5r2TAR7Cfa96OG6rg"
    );
    const detail = getdetail.data.result;
    const review = detail.reviews;
    const time_open = detail.opening_hours;
    const flexDetail_result = await flexdetail(detail, url_photo.data);
    const flexTime_result = await flextime(time_open);
    const flexReview_result = await flexreview(review);
    console.log(flexTime_result.data, "flextime =>");
    console.log(flexReview_result.data[0], "flexreview=>");
    console.log(flexDetail_result.data, " flexDetail =>");

    if (!flexTime_result.data) {
      prototype.contents.contents = [flexDetail_result.data];
      flexReview_result.data.forEach(element => {
        prototype.contents.contents.push(element);
      });
    } else {
      prototype.contents.contents = [
        flexDetail_result.data,
        flexTime_result.data
      ];
      flexReview_result.data.forEach(element => {
        prototype.contents.contents.push(element);
      });
    }

    res.send(flexDetail_result.data);
  } catch (error) {
    res.send(error.message);
  }

  // eslint-disable-next-line promise/catch-or-return
});

function flexreview(review) {
  const arrayReivew = review;
  return new Promise((res, rej) => {
    const ret = {};
    if (!review) {
      ret.status = false;
      ret.message = "error";
      rej(ret);
    } else {
      var arr = [];
      const flexreview = {
        type: "flex",
        altText: "Flex Message",
        contents: {
          type: "bubble",
          header: {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "REVIEW",
                size: "sm",
                weight: "bold",
                color: "#AAAAAA"
              }
            ]
          },
          hero: {
            type: "image",
            url:
              "https://lh6.ggpht.com/-G4Ww6palWT8/AAAAAAAAAAI/AAAAAAAAAAA/GL4_WgqxtYI/s128-c0x00000000-cc-rp-mo-ba3/photo.jpg",
            size: "xl",
            aspectRatio: "20:13",
            action: {
              type: "uri",
              label: "Action",
              uri: "https://linecorp.com/"
            }
          },
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "jintanan kangwankiatichai",
                    flex: 8,
                    size: "lg",
                    align: "center",
                    gravity: "bottom",
                    weight: "bold",
                    wrap: true
                  },
                  {
                    type: "separator"
                  }
                ]
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
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
                    text:
                      "อาหารเหนือและอาหารตามสั่ง อาหารเหนือจะมีทำไว้อยู่แล้ว เลือกจากในหม้อเอา น้ำพริกอ่องอร่อยดี",
                    flex: 1,
                    size: "md",
                    align: "start",
                    wrap: true
                  }
                ]
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "การให้คะแนน:",
                    flex: 0,
                    margin: "sm",
                    size: "sm",
                    align: "start",
                    weight: "bold"
                  },
                  {
                    type: "icon",
                    url:
                      "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
                    size: "xs"
                  },
                  {
                    type: "text",
                    text: " 4.4"
                  }
                ]
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "แสดงความคิดเห็นเมื่อ",
                    flex: 6,
                    margin: "sm",
                    size: "sm",
                    align: "start",
                    weight: "bold"
                  },
                  {
                    type: "text",
                    text: "2 เดือนที่แล้ว",
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
            contents: [
              {
                type: "button",
                action: {
                  type: "uri",
                  label: "ดูรายละเอียดผู้รีวิว",
                  uri:
                    "https://www.google.com/maps/contrib/112186095773426382645/reviews"
                },
                color: "#04A4B6",
                style: "primary"
              }
            ]
          }
        }
      };
      arr = [flexreview, flexreview];
      ret.status = true;
      ret.data = arr;
      res(ret);
    }
  });
}
function flextime(timedata) {
  return new Promise((res, rej) => {
    const ret = {};
    var weekday_array = timedata.weekday_text;
    var opening = timedata.open_now;
    if (!timedata && !weekday_array.length === 7) {
      res(ret);
    } else {
      const flextime = {
        type: "flex",
        altText: "Flex Message",
        contents: {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "vertical",
                spacing: "xl",
                contents: [
                  {
                    type: "text",
                    text: "วันเวลาที่เปิดทำการ",
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
                    text: "วันอาทิตย์ 8:00–18:00",
                    align: "center"
                  },
                  {
                    type: "separator"
                  },
                  {
                    type: "text",
                    text: "วันจันทร์ 8:00–18:00",
                    align: "center"
                  },
                  {
                    type: "separator"
                  },
                  {
                    type: "text",
                    text: "วันอังคาร 8:00–18:00",
                    align: "center"
                  },
                  {
                    type: "separator"
                  },
                  {
                    type: "text",
                    text: "วันพุธ 8:00–18:00",
                    align: "center"
                  },
                  {
                    type: "separator"
                  },
                  {
                    type: "text",
                    text: "วันพฤหัสบดี 8:00–18:00",
                    align: "center"
                  },
                  {
                    type: "separator"
                  },
                  {
                    type: "text",
                    text: "วันศุกร์ 8:00–18:00",
                    align: "center"
                  },
                  {
                    type: "separator"
                  },
                  {
                    type: "text",
                    text: "วันเสาร์ 8:00–18:00",
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
                contents: [
                  {
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
                    text: "เปิดอยู่",
                    flex: 1,
                    margin: "sm",
                    size: "lg",
                    align: "start",
                    weight: "bold",
                    color: "#0CF929"
                  }
                ]
              }
            ]
          }
        }
      };
      for (let i = 0, j = 2; i < weekday_array.length; i++, j = j + 2) {
        flextime.contents.body.contents[0].contents[j].text = weekday_array[i];
      }
      flextime.contents.body.contents[1].contents[1].text = opening;
      ret.status = true;
      ret.data = flextime;
      res(ret);
    }
  });
}
function flexdetail(detail, url_photo) {
  return new Promise((res, rej) => {
    var ret = {};
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
          aspectMode: "cover"
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: `${detail.name}`,
              size: "lg",
              weight: "bold",
              wrap: true
            },
            {
              type: "box",
              layout: "baseline",
              contents: [
                {
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
              contents: [
                {
                  type: "text",
                  text: "เรตติ้ง",
                  flex: 3,
                  size: "sm",
                  align: "start",
                  weight: "bold"
                },
                {
                  type: "icon",
                  url:
                    "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
                  size: "xs"
                },
                {
                  type: "text",
                  text: `${detail.rating}`,
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
              contents: [
                {
                  type: "text",
                  text: "จำนวนการรีวิว:",
                  flex: 3,
                  margin: "sm",
                  size: "sm",
                  align: "start",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: `${detail.user_ratings_total}`,
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
              contents: [
                {
                  type: "text",
                  text: "เบอร์โทร:",
                  flex: 3,
                  margin: "sm",
                  size: "sm",
                  align: "start",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: `${detail.formatted_phone_number}`,
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
              contents: [
                {
                  type: "text",
                  text: "เว็บไซต์:",
                  flex: 3,
                  size: "md",
                  gravity: "bottom",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: `${detail.website}`,
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
          contents: [
            {
              type: "button",
              action: {
                type: "uri",
                label: "โทร",
                uri: `tel:+${detail.formatted_phone_number.split(" ").join("")}`
              },
              flex: 3,
              color: "#03B037",
              style: "primary"
            },
            {
              type: "button",
              action: {
                type: "uri",
                label: "เว็บไซต์",
                uri: `${detail.website}`
              },
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
}
module.exports = Router;
// eslint-dis
module.exports = Router;
