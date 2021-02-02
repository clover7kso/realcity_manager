import "./env";
import { GraphQLServer, PubSub } from "graphql-yoga";
import logger from "morgan";
import schema from "./schema";
import { uploadController, uploadSignleMiddleware } from "./upload";
import { PrismaClient } from "@prisma/client";

const PORT = process.env.PORT || 4000;

const prisma = new PrismaClient();
const pubsub = new PubSub();

const server = new GraphQLServer({
  schema,
  context: ({ request }) => ({ request, prisma, pubsub }),
});

server.express.use(logger("dev"));
server.express.post("/api/upload", uploadSignleMiddleware, uploadController);

server.start({ port: PORT }, () =>
  console.log(`✅ API Server running on https://localhost:${PORT}`)
);

//------------SEO 서버-------------//
var express = require("express");
var seo_app = express();
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
