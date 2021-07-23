import { json } from "https://deno.land/x/sift@0.3.4/mod.ts";
import { Html5Entities } from "https://deno.land/x/html_entities@v1.0/mod.js";
import { moment } from "https://deno.land/x/deno_moment/mod.ts";

import {StoryObject, StoryItem} from "./interface.ts";

export async function handleApi(base: string, agent: string, options?: any) {
  let pageObj = {page: 1};
  let opts = {...pageObj, ...options};
  let page = opts.page;
  let limit = 30;
  let startIndex = (page-1) * limit;
  let endIndex = startIndex + limit;

  const response = await fetch(
    `${base}/topstories.json`,
    {
      method: "GET",
      headers: {
        "User-Agent": agent,
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
  const topstories = await response.json();
  let itemFetches: StoryItem[] = []
  itemFetches = await Promise.all(topstories.slice(startIndex, endIndex).map(async function(itemID: number){
      const response2 = await fetch(
        `${base}/item/${itemID}.json`,
        {
          method: "GET",
          headers: {
            "User-Agent": agent,
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
      let commentsCount = item.descendants || 0;

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
