<h1 align="center">
  <img src="./img/logo.png" width="250px"/><br/>
  HackerNews-API
</h1>
<p align="center">Hacker News API for serving your front-end. Written in TypeScript and compatible with <span href="https://deno.com/deploy">Deno Deploy</span>.

<p align="center"><a href="https://github.com/DiFronzo/hackernews-api/releases" target="_blank"><img src="https://img.shields.io/badge/version-v1.0.0-blue?style=for-the-badge&logo=none" alt="HN-API version" /></a>&nbsp;<a href="https://deno.land/x/hackernews-api@v1.0" target="_blank"><img src="https://img.shields.io/badge/Deno-1.10+-00ADD8?style=for-the-badge&logo=deno" alt="deno version" /></a>&nbsp;<img src="https://img.shields.io/badge/license-MIT-red?style=for-the-badge&logo=none" alt="license" />&nbsp;<img alt="code size" src="https://img.shields.io/github/languages/code-size/difronzo/hackernews-api?style=for-the-badge&logo=none">&nbsp;<a href="https://deno.com/deploy" target="_blank"><img src="https://img.shields.io/badge/Deno-0.3.0+-00ADD8?style=for-the-badge&logo=deno&label=deployctl" alt="deployctl version" /></a></p>


## ⚡️ Quick start

First of all, [download](https://deno.land/) and install **Deno**. Version `1.10` or higher is required.

Verify that the installation was successful by running the following command that should return the version number for Deno, v8 and TypeScript.

```bash
deno --version
```

Next install [Deno Deploy (deployctl)](https://deno.com/deploy) 0.3.0 or later for running offline.
```bash
deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -f https://deno.land/x/deploy/deployctl.ts
```

Last step is to run the code in the repo.
```bash
deployctl run --libs=ns,fetchevent https://raw.githubusercontent.com/DiFronzo/hackernews-api/main/mod.tsx
```
The API should now be running on [http://localhost:8080](http://localhost:8080).

That's all you need to know to start! 🎉

Running online on Deno Deploy:<br/>
[![Deploy this example](./img/deno-deploy-button.svg)](https://dash.deno.com/new?url=https://raw.githubusercontent.com/DiFronzo/hackernews-api/main/mod.tsx)

## ⚙️ Usage & Options

Demo at https://hackernews-api.deno.dev/.

## ⭐️ Project assistance

If you want to say **thank you** or/and support active development of `HackerNews-API`:

- Add a [GitHub Star](https://github.com/DiFronzo/hackernews-api) to the project.

## ⚠️ License
`HackerNews-API` is free and open-source software licensed under the [MIT](https://github.com/DiFronzo/hackernews-api/blob/main/LICENSE). This is not an offical release from [HackerNews](https://github.com/HackerNews/API). Use on your own risk. Logo is owned by Weiran Zhang. It does not meet the [threshold of originality](https://commons.wikimedia.org/wiki/Commons:Threshold_of_originality) needed for copyright protection, and is therefore in the [public domain](https://en.wikipedia.org/wiki/Public_domain).
