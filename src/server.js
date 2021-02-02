import logger from "morgan";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//------------SEO 서버-------------//
var express = require("express");
var seo_app = express();

seo_app.use(logger("dev"));
seo_app.get("/seo/post", async (req, res) => {
  const data = await prisma.post.findUnique({ where: { id: req.query.id } });

  res.render("index", {
    id: data.id,
    title: data.title,
    url: "http://api.realcitykr.com/seo/post?id=" + data.id,
    content: data.content.replace(/(<([^>]+)>)/gi, ""),
    thumbnail: data.thumbnail
      ? data.thumbnail
      : "https://realcitykr.com/logo.png",
  });
});
seo_app.engine("html", require("ejs").renderFile);
seo_app.set("view engine", "html");
var seo_server = require("http").createServer(seo_app);
seo_server.listen(80, function () {
  console.log("✅ SEO Server running on http://localhost:80");
});

//-----------node-cron-----------//

const conditionList = [
  { ban: "DAY1", day: 1 },
  { ban: "DAY3", day: 3 },
  { ban: "WEEK1", day: 7 },
  { ban: "WEEK2", day: 14 },
  { ban: "WEEK4", day: 28 },
];
var https = require("https");

//초 분 시 일 월 요일//
var cron = require("node-cron");
cron.schedule("* * 0 * * *", function () {
  console.log("매일 12시");

  console.log("모든게시글의 당일 조회수 좋아요수 초기화");
  prisma.post.updateMany({
    data: { viewToday: 0, likeToday: 0 },
  });

  console.log("벤유저관리");
  let today = new Date();
  let dateResult = new Date();
  for (var i = 0; i < conditionList.length; i++) {
    dateResult.setDate(today.getDate() - conditionList[i].day);
    prisma.banManager.updateMany({
      where: {
        blockedUntil: conditionList[i].ban,
        blockedDate: { lt: dateResult },
      },
      data: { blockedUntil: "NOPE", blockedReason: "NOPE", blockedDate: null },
    });
  }

  https
    .get("https://hc-ping.com/d7585c8f-7e36-47ba-96c4-eb4eb83a4ade")
    .on("error", (err) => {
      console.log("Ping failed: " + err);
    });
});

cron.schedule("* * 0 * * Saturday", function () {
  console.log("토요일자정");

  console.log("겜블찬스 5회");
  prisma.user.updateMany({
    data: { gambleChance: 5 },
  });

  https
    .get("https://hc-ping.com/5030d5c2-2fc7-434f-bc27-7cf206246068")
    .on("error", (err) => {
      console.log("Ping failed: " + err);
    });
});

cron.schedule("* * 0 * * Sunday", function () {
  console.log("일요일자정");

  console.log("겜블찬스 초기화");
  prisma.user.updateMany({
    data: { gambleChance: 0 },
  });

  https
    .get("https://hc-ping.com/2383d57a-466f-43f5-be9f-11c46a7478d8")
    .on("error", (err) => {
      console.log("Ping failed: " + err);
    });
});
