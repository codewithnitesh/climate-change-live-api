const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();

const newspapers = [
  {
    name: "cityam",
    address:
      "https://www.cityam.com/london-must-become-a-world-leader-on-climate-change-action/",
    base: "",
  },
  {
    name: "thetimes",
    address: "https://www.thetimes.co.uk/environment/climate-change",
    base: "",
  },
  {
    name: "guardian",
    address: "https://www.theguardian.com/environment/climate-crisis",
    base: "",
  },
  {
    name: "telegraph",
    address: "https://www.telegraph.co.uk/climate-change",
    base: "https://www.telegraph.co.uk",
  },
  {
    name: "nyt",
    address: "https://www.nytimes.com/international/section/climate",
    base: "",
  },
  {
    name: "latimes",
    address: "https://www.latimes.com/environment",
    base: "",
  },
  {
    name: "smh",
    address: "https://www.smh.com.au/environment/climate-change",
    base: "https://www.smh.com.au",
  },
  {
    name: "bbc",
    address: "https://www.bbc.co.uk/news/science_and_environment",
    base: "https://www.bbc.co.uk",
  },
  {
    name: "es",
    address: "https://www.standard.co.uk/topic/climate-change",
    base: "https://www.standard.co.uk",
  },
  {
    name: "sun",
    address: "https://www.thesun.co.uk/topic/climate-change-environment/",
    base: "",
  },
  {
    name: "dm",
    address:
      "https://www.dailymail.co.uk/news/climate_change_global_warming/index.html",
    base: "",
  },
  {
    name: "nyp",
    address: "https://nypost.com/tag/climate-change/",
    base: "",
  },
];

let articles = {};

const fetchNews = () => {
  newspapers.forEach((newspaper) => {
    try {
      axios.get(newspaper.address).then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);

        $('a:contains("climate")', html).each(function () {
          const title = format($(this)?.text());
          const url = $(this).attr("href");

          if (!articles[newspaper.name]) {
            articles[newspaper.name] = [];
          }

          articles[newspaper.name].push({
            title,
            url: newspaper.base + url,
          });
        });
      });
    } catch (err) {
      console.log(err);
    }
  });
};

const format = (text = "") => {
  try {
    if (text) {
        return text.replaceAll("\n", "").replaceAll("\t", "");
    }
  } catch (err) {
    console.log(err);
  }

  return "";
};

app.get("/", (req, res) => {
  res.json("Welcome to my Climate Change News API");
});

app.get("/news", (req, res) => {
  let news = [];
  Object.keys(articles).forEach((key) => {
    news = [...news, ...articles[key]];
  });

  res.json({
    success: true,
    message: `News fetched successfully!`,
    news: news,
  });
});

app.get("/news/:newspaperId", (req, res) => {
  try {
    const { newspaperId } = req.params;

    if (!articles[newspaperId]?.length) {
      res.json({
        success: false,
        message: `Newspaper with id ${newspaperId} not found!`,
      });
      return;
    }

    res.json({
      success: true,
      message: `News fetched successfully for ${newspaperId}!`,
      news: articles[newspaperId],
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/actions/:action", async (req, res) => {
  try {
    const { action } = req.params;

    if (action === "fetch") {
      await fetchNews();

      res.json({
        success: true,
        message: `News fetched successfully!`,
      });
    }
    if (action === "empty") {
      articles = {};

      res.json({
        success: true,
        message: `News cleared successfully!`,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
