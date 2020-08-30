/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-case-declarations */
/* eslint-disable promise/always-return */
const googleApi = require("./google-api");
const flexService = require("./service-flex");
const userService = require("./user");
const lovService = require("./lov");
const transactionService = require("./transaction");
const reportIssueService = require("./report-issue");
const tempDirectionBus = require("../template/busdirection.json");
const _ = require("underscore");

module.exports.handleEvent = function (event, USER) {
  return new Promise(async (resolve, reject) => {
    let message = event.message;
    let replyToken = event.replyToken;
    let result = {};
    let userId = event.source.userId;
    let userDetail = USER;

    try {
      if (event.type === "postback") {
        let isDetail =
          event.postback.data.split(`^`)[3] === "detail" ? true : false;
        if (isDetail) {
          let resDetail = await checkDetail(event);
          result = resDetail;
          resolve([replyToken, result]);
        } else {
          let resPostback = await postbackHandle(event);
          result = resPostback;
          resolve([replyToken, result]);
        }
      } else {
        let isComplete = false; // เอาไว้ใช้ในกรณีที่ทำ action เสร็จ
        var temp = {
          type: "flex",
          altText: "Flex Message",
          contents: {
            type: "carousel",
            contents: []
          }
        };

        if (userDetail.action === "richmenu_hotel") {
          /**
           * !Search Hotel
           */
          if (message.type === "text") {
            userDetail.transaction.location = message.text;
            userDetail.transaction.timeStamp = new Date();
            await userService.updateUser(userDetail);
            let resProvice = await lovService.getLov(message.text);
            if (resProvice) {
              const dataApi = await googleApi.textSearch(
                `${resProvice.lovName}+โรงแรม`
              );
              const objectPlace = await flexService.getSeletedPlace(
                temp,
                dataApi.data,
                "placeId_hotel"
              );
              console.info(`Line response =>`, JSON.stringify(objectPlace));
              result = objectPlace;
              isComplete = true;
            } else {
              console.error("invalid provice");
              result = {
                type: "text",
                text: "กรุณาพิมพ์ชื่อจังหวัดให้ถูกต้อง"
              };
            }
          } else {
            let user_locate = message.latitude + "," + message.longitude;
            userDetail.transaction.location = user_locate;
            userDetail.transaction.timeStamp = new Date();
            await userService.updateUser(userDetail);
            let resNearby = await googleApi.nearBySearch(
              user_locate,
              "lodging"
            );
            if (resNearby.data.length === 0) {
              console.error(`not found`);
              result = {
                type: "text",
                text: "ไม่พบสิ่งที่ค้นหา"
              };
            } else {
              console.info(``, resNearby.data);
              // แก้ตัวแมพ
              let objectPlace = await flexService.getSeletedPlace(
                temp,
                resNearby.data,
                "placeId_hotel"
              );
              console.info(`Line response =>`, JSON.stringify(objectPlace));
              result = objectPlace;
              isComplete = true;
            }
          }
          if (isComplete) completeAction(userId);
          resolve([replyToken, result]);
        } else if (userDetail.action === "richmenu_bus") {
          /**
           * !Direction Bus
           */
          if (message.type !== `location`) {
            result = {
              type: "text",
              text: "กรุณาเลือกสถานที่ต้นทางด้วยครับ",
              quickReply: {
                items: [
                  {
                    type: "action",
                    action: {
                      type: "location",
                      label: "กรุณาเลือกสถานที่"
                    }
                  }
                ]
              }
            };
            resolve([replyToken, result]);
          } else if (!userDetail.transaction.origin) {
            let origin = message.latitude + "," + message.longitude;
            console.log(`User origin => ${origin}`);
            userDetail.transaction.origin = origin;
            userDetail.transaction.timeStamp = new Date();
            await userService.updateUser(userDetail);
            result = {
              type: "text",
              text: "กรุณาเลือกสถานที่ปลายทางด้วยครับ",
              quickReply: {
                items: [
                  {
                    type: "action",
                    action: {
                      type: "location",
                      label: "กรุณาเลือกสถานที่"
                    }
                  }
                ]
              }
            };
          } else if (!userDetail.transaction.destination) {
            let destination = message.latitude + "," + message.longitude;
            console.log(`userDetail destination => ${destination}`);
            userDetail.transaction.destination = destination;
            userDetail.transaction.timeStamp = new Date();
            console.log(`Sort by location`);
            //พอกำหนดเสร็จให้ทำการ search ทันที
            let resSort = await googleApi.sortedBus(userDetail.transaction);
            if (resSort.status !== "ZERO_RESULTS") {
              let steps = resSort.routes[0].legs[0].steps;
              let duration = resSort.routes[0].legs[0].duration.text;
              let distance = resSort.routes[0].legs[0].distance.text;
              let content = [];
              let temp = tempDirectionBus;
              let separator = {
                type: "separator",
                margin: "lg"
              };
              // set header
              let head1 = {},
                head2 = {},
                head3 = {},
                header = [];
              head1.type = "text";
              head1.text = `เส้นทาง`;
              head1.align = "center";
              head1.size = "lg";
              head1.weight = "bold";
              head2.type = "text";
              head2.text = `ระยะทาง ${distance}`;
              head2.align = "center";
              head3.type = "text";
              head3.text = `เวลาการเดินทาง ${duration}`;
              head3.align = "center";
              header.push(head1, head2, head3);
              temp.contents.header.contents = header;

              // set body
              content.push(separator);
              await steps.forEach((step, i) => {
                if (step.travel_mode === "WALKING") {
                  let walking = {
                    type: "text",
                    text: `${step.html_instructions}`,
                    margin: "lg",
                    wrap: true
                  };
                  content.push(walking);
                } else if (step.travel_mode === "TRANSIT") {
                  let bus1 = {
                    type: "text",
                    text: `ปลายทาง: ${step.transit_details.arrival_stop.name}`,
                    margin: "lg",
                    wrap: true
                  };
                  let bus2 = {
                    type: "text",
                    text: `รถเมล์สาย: ${step.transit_details.line.short_name} (${step.transit_details.line.name})`,
                    margin: "lg",
                    wrap: true
                  };
                  content.push(bus2, bus1);
                }

                content.push(separator);
              });
              temp.contents.body.contents = content;

              // set footer
              let uri = `https://www.google.com/maps/dir/?api=1&travelmode=transit&origin=${userDetail.transaction.origin}&destination=${destination}`;
              temp.contents.footer.contents[0].action.uri = uri;
              console.info(JSON.stringify(temp));
              result = temp;
              isComplete = true;
              userDetail.transaction.isComplete = true;
              await userService.updateUser(userDetail);
            } else {
              result = {
                type: "text",
                text: "ไม่พบเส้นทางการเดินทางด้วยรถเมล์"
              };
              isComplete = true;
              userDetail.transaction.isComplete = true;
              await userService.updateUser(userDetail);
            }
          }
          // Clear user action
          if (isComplete) completeAction(userId);
          resolve([replyToken, result]);
        } else if (userDetail.action === "richmenu_restaurant") {
          /**
           * !Search Restaurant
           */
          if (message.type === "text") {
            userDetail.transaction.location = message.text;
            userDetail.transaction.timeStamp = new Date();
            await userService.updateUser(userDetail);
            let resProvice = await lovService.getLov(message.text);
            if (resProvice) {
              const dataApi = await googleApi.textSearch(
                `${resProvice.lovName}+ร้านอาหาร`
              );
              const objectPlace = await flexService.getSeletedPlace(
                temp,
                dataApi.data,
                "placeId_restaurant"
              );
              console.info(`Line response =>`, JSON.stringify(objectPlace));
              result = objectPlace;
              isComplete = true;
            } else {
              console.error("invalid provice");
              result = {
                type: "text",
                text: "กรุณาพิมพ์ชื่อจังหวัดให้ถูกต้อง"
              };
            }
          } else {
            let user_locate = message.latitude + "," + message.longitude;
            userDetail.transaction.location = user_locate;
            userDetail.transaction.timeStamp = new Date();
            await userService.updateUser(userDetail);
            let resNearby = await googleApi.nearBySearch(
              user_locate,
              "restaurant"
            );
            if (resNearby.data.length === 0) {
              console.error(`not found`);
              result = {
                type: "text",
                text: "ไม่พบสิ่งที่ค้นหา"
              };
            } else {
              console.info(``, JSON.stringify(resNearby.data));
              let objectPlace = await flexService.getSeletedPlace(
                temp,
                resNearby.data,
                "placeId_restaurant"
              );
              console.info(`Line response =>`, JSON.stringify(objectPlace));
              result = objectPlace;
              isComplete = true;
            }
          }
          if (isComplete) completeAction(userId);
          resolve([replyToken, result]);
        } else if (userDetail.action === "richmenu_tourist") {
          /**
           * !Search Tourist_attraction
           */
          if (message.type === "text") {
            userDetail.transaction.location = message.text;
            userDetail.transaction.timeStamp = new Date();
            await userService.updateUser(userDetail);
            let resProvice = await lovService.getLov(message.text);
            if (resProvice) {
              const dataApi = await googleApi.textSearch(
                `${resProvice.lovName}+แหล่งท่องเที่ยว`
              );
              const objectPlace = await flexService.getSeletedPlace(
                temp,
                dataApi.data,
                "placeId_touristattraction" // แก้
              );
              console.info(`Line response =>`, JSON.stringify(objectPlace));
              result = objectPlace;
              isComplete = true;
            } else {
              console.error("invalid provice");
              result = {
                type: "text",
                text: "กรุณาพิมพ์ชื่อจังหวัดให้ถูกต้อง"
              };
            }
          } else {
            let user_locate = message.latitude + "," + message.longitude;
            userDetail.transaction.location = user_locate;
            userDetail.transaction.timeStamp = new Date();
            await userService.updateUser(userDetail);
            let resNearby = await googleApi.nearBySearch(
              user_locate,
              "tourist_attraction"
            );
            if (resNearby.data.length === 0) {
              console.error(`not found`);
              result.type = "text";
              result.text = "ไม่พบสิ่งที่ค้นหา";
            } else {
              console.info(``, JSON.stringify(resNearby.data));
              let objectPlace = await flexService.getSeletedPlace(
                temp,
                resNearby.data,
                "placeId_touristattraction"
              );
              console.info(`Line response =>`, JSON.stringify(objectPlace));
              result = objectPlace;

            }
            isComplete = true;
          }
          if (isComplete) completeAction(userId);
          resolve([replyToken, result]);
        } else if (userDetail.action === "report_issue") {
          let resReport = await reportIssueService.sendIssue(message.text);
          console.info("sendIssue:", resReport);
          result.type = "text";
          result.text = "รายงานปัญหาเรียบร้อย";
          isComplete = true;
          if (isComplete) completeAction(userId);
          resolve([replyToken, result]);
        } else {
          switch (message.type) {
            case "text":
              if (message.text === "รายงานปัญหา") {
                let issueTransaction = transactionService.addIssueTransaction();
                let userData = {};
                userData.userId = userId;
                userData.action = "report_issue";
                userData.lastedUse = new Date();
                userData.transaction = issueTransaction;
                console.log(`New user data`, JSON.stringify(userData));
                let user = await userService.updateUser(userData);
                result.type = "text";
                result.text = "กรุณาพิมพ์รายงานปัญหาได้เลยครับ";
                resolve([replyToken, result]);
              } else {
                result.type = "text";
                result.text = "กรุณาเลือกทำรายการด้วยน้า";
                resolve([replyToken, result]);
              }
              break;
            default:
              result.type = "text";
              result.text = "ไม่มีคำสั่งนี้ในระบบครับ";
              resolve([replyToken, result]);
              break;
          }
        }
      }
    } catch (err) {
      console.error(JSON.stringify(err));
      result.type = "text";
      result.text = err;
      reject([replyToken, result]);
    }
  });
};

function postbackHandle(event) {
  return new Promise(async (resolve, reject) => {
    let reply = {
      type: "text",
      text: event.postback.data
    };

    try {
      let userId = event.source.userId;
      let action = event.postback.data;
      console.info(`PostbackHandle Action =>`, action);
      let transaction = await transactionService.addTransaction(action);
      /************************************Start user data update action**********************************/
      let userData = {
        userId,
        action,
        lastedUse: new Date(),
        transaction
      };
      console.log(`New user data`, JSON.stringify(userData));
      await userService.updateUser(userData);
      switch (action) {
        case "richmenu_bus":
          reply = [
            {
              type: "text",
              text: "กรุณาเลือกสถานที่ต้นทางด้วยครับ",
              quickReply: {
                items: [
                  {
                    type: "action",
                    action: {
                      type: "location",
                      label: "กรุณาเลือกสถานที่"
                    }
                  }
                ]
              }
            }
          ];
          resolve(reply);
          break;
        case "richmenu_hotel":
          reply = {
            type: "text",
            text: "กรุณาเลือกสถานที่ปัจจุบันหรือพิมพ์ชื่อจังหวัด",
            quickReply: {
              items: [
                {
                  type: "action",
                  action: {
                    type: "location",
                    label: "กรุณาเลือกสถานที่"
                  }
                }
              ]
            }
          };
          resolve(reply);
          break;
        case "richmenu_restaurant":
          reply = {
            type: "text",
            text: "กรุณาเลือกสถานที่ปัจจุบันหรือพิมพ์ชื่อจังหวัด",
            quickReply: {
              items: [
                {
                  type: "action",
                  action: {
                    type: "location",
                    label: "กรุณาเลือกสถานที่"
                  }
                }
              ]
            }
          };
          resolve(reply);
          break;
        case "richmenu_tourist":
          reply = {
            type: "text",
            text: "กรุณาเลือกสถานที่ปัจจุบันหรือพิมพ์ชื่อจังหวัด",
            quickReply: {
              items: [
                {
                  type: "action",
                  action: {
                    type: "location",
                    label: "กรุณาเลือกสถานที่"
                  }
                }
              ]
            }
          };
          resolve(reply);
          break;
        default:
          reply = {
            type: "text",
            text: "เรายังไม่เปิดให้ใช้งานหรืออยู่ในการปรับปรุง"
          };
          resolve(reply);
          break;
      }
    } catch (error) {
      console.error("Error getting document", JSON.stringify(error));
      reply.text("Error");
      reject(reply);
    }
  });
}

async function completeAction(userId) {
  let actionChange = {
    userId,
    lastedUse: new Date(),
    action: "non"
  };
  await userService.updateUser(actionChange);
}

async function checkDetail(element) {
  return new Promise(async (resolve, reject) => {
    /**
     * !จับ error case
     * *เว็บและเบอร์โทรไม่มีข้อมูล
     */
    switch (element.postback.data) {
      case "error_web":
        resolve({
          type: "text",
          text: "ขออภัยด้วยครับเราไม่ข้อมูลเว็บดังกล่าว :("
        });
        break;
      case "error_tel":
        resolve({
          type: "text",
          text: "ขออภัยด้วยครับเราไม่ข้อมูลเบอร์โทรดังกล่าว :("
        });
        break;
      // eslint-disable-next-line no-fallthrough
      default:
        break;
    }

    var details = element.postback.data.split("^")[0];
    var place_id = element.postback.data.split("^")[1];
    var photo_ref = element.postback.data.split("^")[2];

    var flexTime_result;
    var flexReivew_result;

    /**
     * !จับ เคส detail
     */
    var url_photo;
    var review;
    var time_open;
    var flexDetail_result;
    var getdetail;
    var detail;
    console.log(photo_ref, "=>");
    if (photo_ref === "") {
      url_photo = "https://i.ibb.co/t4BKmmv/no-image.png";
      getdetail = await googleApi.PlaceDetail(place_id);
      detail = getdetail.data.result;
      console.log(url_photo);
      review = detail.reviews;
      time_open = detail.opening_hours;
      flexDetail_result = await flexService.flexdetail(detail, url_photo);
    } else {
      url_photo = await googleApi.placePhotoreFerence(photo_ref);
      getdetail = await googleApi.PlaceDetail(place_id);
      detail = getdetail.data.result;
      console.log(url_photo);
      review = detail.reviews;
      time_open = detail.opening_hours;
      flexDetail_result = await flexService.flexdetail(detail, url_photo.data);
    }
    let prototype = {
      type: "flex",
      altText: "Flex Message",
      contents: {
        type: "carousel",
        contents: []
      }
    };

    time_open ? (flexTime_result = await flexService.flextime(time_open)) : "";
    review ? (flexReivew_result = await flexService.flexreview(review)) : "";

    prototype.contents.contents.push(flexDetail_result.data);
    flexTime_result
      ? prototype.contents.contents.push(flexTime_result.data)
      : "";
    review
      ? flexReivew_result.data.forEach(e => {
        prototype.contents.contents.push(e);
      })
      : "";
    console.log(JSON.stringify(flexReivew_result));

    resolve(prototype, {
      type: "text",
      text: "คุณต้องการจะสอบถามเรื่องอื่นอีกหรือไม่"
    });
  });
}
