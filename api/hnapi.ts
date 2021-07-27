import { json } from "https://deno.land/x/sift@0.3.4/mod.ts";
import { Html5Entities } from "https://deno.land/x/html_entities@v1.0/mod.js";
import { moment } from "https://deno.land/x/deno_moment/mod.ts";

import {StoryObject, StoryItem, Item, Poll, Kids, Kid} from "./interface.ts";

const baseUrl: string = "https://hacker-news.firebaseio.com";
const version: string = "/v0";
const userAgent: string = "Deno Deploy";

let cleanText = function(html: string): string | undefined {
  if (!html) return;
  // yea yea regex to clean HTML is lame yada yada
  html = html.replace(/<\/p>/ig, ''); // remove trailing </p>s
  if (!html.match(/^<p>/i)) html = '<p>' + html; // prepend <p>
  return html;
}

export async function handleApi(base: string, options?: any) {
  let pageObj = {page: 1};
  let opts = {...pageObj, ...options};
  let page = opts.page;
  let limit: number = 30;
  let startIndex: number = (page-1) * limit;
  let endIndex: number = startIndex + limit;

  const response: Response = await fetch(
    `${baseUrl+version}/${base}.json`,
    {
      method: "GET",
      headers: {
        "User-Agent": userAgent,
      },
    },
  );

  // Handle if the response isn't successful.
  if (!response.ok) {
    // If the top stories is not found, reflect that with a message.
    if (response.status === 404) {
      return {
        code: "topStoriesNotFound",
        message: `top stories not found`,
      };
    } else {
      return {
        code: "serverError",
        message: `Failed to retrieve top stories from firebase. Try again.`,
      };
    }
  }
  const topstories: number[] = await response.json();
  let itemFetches: StoryItem[] = []
  itemFetches = await Promise.all(topstories.slice(startIndex, endIndex).map(async function(itemID: number){
      const response2 = await fetch(
        `${baseUrl+version}/item/${itemID}.json`,
        {
          method: "GET",
          headers: {
            "User-Agent": userAgent,
          },
        },
      );
      if (!response.ok) {
        if (response.status === 404) {
          return {
            code: "storyNotFound",
            message: `Story (${itemID}) not found`,
          };
        } else {
          return {
            code: "serverError",
            message: `Failed to retrieve story from firebase. Try again.`,
          };
        }
      }
      return await response2.json();
    }));


    let apiRes: StoryObject[] = await itemFetches.filter(Boolean).map(function(item: StoryItem){
      let commentsCount: number = item.descendants || 0;

      let output: StoryObject = {
        id: item.id,
        title: Html5Entities.decode(item.title),
        points: item.score,
        user: item.by,
        time: item.time, // Unix timestamp
        time_ago: moment(item.time*1000).fromNow(),
        comments_count: commentsCount,
        type: (item.type == "story") ? 'link' : item.type,
        url: ""
      }

      if (item.url){
        output.url = item.url;
        const { hostname } = new URL(item.url);
        output.domain = hostname.replace(/^www\./i, '');
      } else {
        output.url = 'item?id=' + item.id; // Simulate "local" links
      }

      // If it's a job, username and points are useless
      if (item.type == 'job'){
        output.user = output.points = undefined;
      }

      // Identify type=ask
      if (item.type == 'story' && output.url.match(/^item/i) && item.title.match(/^ask/i)){
        output.type = 'ask';
      }

      return output;
    });

    return apiRes
}

async function handleApiItem(base: string) {
  const response: Response = await fetch(
    `${baseUrl+version}/item/${base}.json`,
    {
      method: "GET",
      headers: {
        "User-Agent": userAgent,
      },
    },
  );

  // Handle if the response isn't successful.
  if (!response.ok) {
    // If the top stories is not found, reflect that with a message.
    if (response.status === 404) {
      return {
        code: "itemNotFound",
        message: `item not found`,
      };
    } else {
      return {
        code: "serverError",
        message: `Failed to retrieve item from firebase. Try again.`,
      };
    }
  }
  const item = await response.json();

  var kidsPromises: Kids[] = [];
  if (item.kids && item.kids.length) {
    kidsPromises = await Promise.all(item.kids.map(async function(kid: number){
      return await handleApiItem(kid.toString());
    }));
  }
  if (kidsPromises && item.kids && item.kids.length) item._kids = kidsPromises;

  let partsPromises: any = []
  if (item.type == "poll" && item.parts && item.parts.length) {
    partsPromises = await Promise.all(item.parts.map(async function(part: number){
        const response2 = await fetch(
          `${baseUrl+version}/item/${part}.json`,
          {
            method: "GET",
            headers: {
              "User-Agent": userAgent,
            },
          },
        );
        if (!response2.ok) {
          return Promise.reject(response2);
        }
        return await response2.json();
      }));
  }
  if (item.type == "poll" && item.parts && item.parts.length) item._parts = partsPromises;

  return item;
}

export async function handleItemBase(base: string) {
  const item = await handleApiItem(base);

  let itemRes: Item = {
    id: item.id,
    title: item.title ? Html5Entities.decode(item.title) : '',
    points: item.score,
    user: item.by,
    time: item.time,
    time_ago: moment(item.time*1000).fromNow(),
    type: (item.type == "story") ? 'link' : item.type,
    content: item.deleted ? '[deleted]' : cleanText(item.text),
    deleted: item.deleted,
    dead: item.dead,
    url: "",
    comments_count: 0,
    comments: []
  }

  if (item.url){
    itemRes.url = item.url;
    const { hostname } = new URL(item.url);
    itemRes.domain = hostname.replace(/^www\./i, '');
  } else {
    itemRes.url = 'item?id=' + item.id; // Simulate "local" links
  }

  // If it's a job, username and points are useless
  if (item.type == 'job'){
    itemRes.user = itemRes.points = undefined;
  }

  if (item._parts && item._parts.length){
    itemRes.poll = item._parts.map(function(part: Poll){
      return {
        item: part.title,
        points: part.score
      };
    });
  }

  let commentsCount: number = 0;
  var formatComments = async function(obj: Item, kids: Kids[], level: number){
    if (kids && kids.length){
      kids = kids.filter(function(kid: Kids){
        return !!kid;
      });
      if (!kids.length){
        obj.comments = [];
        return;
      }
      commentsCount += kids.length;
      obj.comments = kids.map(function (kid: Kids) {
        let res: any = {
          id: kid.id,
          level: level,
          user: kid.by,
          time: kid.time,
          time_ago: moment(kid.time * 1000).fromNow(),
          content: kid.deleted ? '[deleted]' : cleanText(kid.text),
          deleted: kid.deleted,
          dead: kid.dead,
          comments: kid.comments
        };
        formatComments(res, kid._kids, level + 1);
        return res;
      });
    } else {
      obj.comments = [];
    }
  };
  formatComments(itemRes, item._kids, 0);
  itemRes.comments_count = commentsCount;

  return itemRes;

}
