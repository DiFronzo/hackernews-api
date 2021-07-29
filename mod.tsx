import { h, jsx, serve, validateRequest, PathParams, json } from "./deps.ts";
// deployctl run --libs=ns,fetchevent --watch mod.tsx

import {QueryString, StoryObject} from "./api/interface.ts";
import {handleApi, handleItemBase} from "./api/hnapi.ts";
import {style, App, Doc, NotFound} from "./public/index.tsx";

// interface Story {
//   news: string,
//   newest: string,
//   best: string,
//   ask: string,
//   show: string,
//   jobs: string
// }

const STORIES: any = {
  news: "topstories",
  newest: "newstories",
  best: "beststories",
  ask: "askstories",
  show: "showstories",
  jobs: "jobstories"
}

const getQueryStringParam = (url: string, param: string): QueryString | undefined => {
  const searchParams = new URLSearchParams(new URL(url).search.slice(1));
  const queryParam = searchParams.get(param);
  return queryParam ? {[param]: queryParam} : undefined;
};

async function handleReq (request: Request, params?: PathParams) {
  const { error } = await validateRequest(request, {
    GET: {},
  });
  if (error) {
    return json({ error: error.message }, { status: error.status });
  }
  const { slug = "" } = params as { slug: string };

  if (slug != "" && !(slug in STORIES)) {
    return jsx(<NotFound />, { status: 404 });
  }

  const getValueQ: QueryString | undefined = getQueryStringParam(request.url, "page");

  const story: StoryObject[] | { code: string; message: string; } = await handleApi(STORIES[slug], getValueQ);

  if (Array.isArray(story) && story.length === 0) {
    return json({code: "pageNotFound", message: "Failed to retrieve the page!"},{status: 200});
  }

  return json(story,{status: 200});
}

function isNumeric(value: string): boolean {
    return /^-?\d+$/.test(value);
}

async function handleItem (request: Request, params?: PathParams) {
  const { error } = await validateRequest(request, {
    GET: {},
  });
  if (error) {
    return json({ error: error.message }, { status: error.status });
  }
  const { id = "" } = params as { id: string };

  if (id == "" || !isNumeric(id)) {
    return jsx(<NotFound />, { status: 404 });
  }

  const item = await handleItemBase(id);

  return json(item,{ status: 200 });

}

serve({
  "/": () => jsx(<App />),
  "/doc": () => jsx(<Doc />),
  "/:slug": handleReq,
  "/item/:id": handleItem,
  // The route handler of 404 will be invoked when a route handler
  // for the requested path is not found.
  404: () => jsx(<NotFound />, { status: 404 })
});
