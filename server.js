const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const app = express();

const OWNER = "SaravanaKumarVM";
const REPO = "money-tracker";
const FILE_PATH = "moneyData.json";
const TOKEN = process.env.GITHUB_TOKEN;

app.use(express.json());
app.use(express.static("."));

app.get("/load", async (req, res) => {
  const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`);
  const j = await r.json();
  const data = Buffer.from(j.content, "base64").toString();
  res.json(JSON.parse(data || "[]"));
});

app.post("/save", async (req, res) => {
  const get = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`);
  const file = await get.json();

  await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Auto save money tracker",
      content: Buffer.from(JSON.stringify(req.body,null,2)).toString("base64"),
      sha: file.sha
    })
  });
  res.json({status:"saved"});
});

app.listen(3000,()=>console.log("Server running on http://localhost:3000"));
