<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Live site][live-shield]][live-url]
[![Next.js][next-shield]][next-url]
[![Cloudflare Workers][workers-shield]][workers-url]
[![TypeScript][typescript-shield]][typescript-url]

<br />
<div align="center">
  <a href="https://debopam-portfolio.dsjzcjmsh6.workers.dev/">
    <img src="public/icon.svg" alt="Debopam Das monogram" width="80" height="80">
  </a>

<h3 align="center">Debopam Das — Portfolio</h3>

  <p align="center">
    A cinematic, single-page portfolio that indexes every public GitHub repository automatically — forks included.
    <br />
    <a href="https://debopam-portfolio.dsjzcjmsh6.workers.dev/"><strong>Explore the live site »</strong></a>
    <br />
    <br />
    <a href="#usage">Usage</a>
    &middot;
    <a href="#roadmap">Roadmap</a>
    &middot;
    <a href="#contact">Contact</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#project-sync">Project Sync</a></li>
        <li><a href="#portfoliojson-overrides">portfolio.json Overrides</a></li>
        <li><a href="#commands">Commands</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

[![Portfolio preview][product-screenshot]](https://debopam-portfolio.dsjzcjmsh6.workers.dev/)

This is the personal portfolio of **Debopam Das** — a student and developer who learns by building. The site is a single long editorial page: a hero, a prologue, a live index of repositories, an experiments rail, an info section, and a contact page. Motion is used deliberately, and the whole experience falls back gracefully when JavaScript or animation is unavailable.

The project index is not hand-maintained. A Cloudflare Worker reads the public GitHub API every ten minutes, turns repositories into portfolio entries, and writes the result to Workers KV. New public repositories appear on the site without editing or redeploying it.

Forks are included by default. Every repository gets a prettified name, a description from GitHub or its README, a language label, topics, and a visual identity built from its favicon and cover image.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Next.js][next-shield]][next-url]
* [![React][react-shield]][react-url]
* [![TypeScript][typescript-shield]][typescript-url]
* [![Cloudflare Workers][workers-shield]][workers-url]
* [![Cloudflare KV][kv-shield]][kv-url]
* [![Wrangler][wrangler-shield]][wrangler-url]
* Hand-written CSS, Google Fonts, and a small amount of client-side JavaScript

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->
## Usage

The live site is deployed at [debopam-portfolio.dsjzcjmsh6.workers.dev](https://debopam-portfolio.dsjzcjmsh6.workers.dev/). It is served from Cloudflare Workers Static Assets, with the Worker API and cron trigger running alongside it.

### Project Sync

The Worker lists every public repository owned by [`@idk4whatamiusing`](https://github.com/idk4whatamiusing) and applies these rules:

| Topic        | Effect                            |
| ------------ | --------------------------------- |
| `featured`   | Pins the project above other rows |
| `experiment` | Moves it to the Experiments rail  |
| `hide`       | Removes it from the site          |

These repositories are excluded automatically:

- the portfolio repository itself,
- the profile README repository,
- `.github`.

Forks are always included and receive a `FORK` tag.

The site renders from a committed snapshot first, then refreshes from `GET /api/projects` after about 900 ms and every five minutes while the tab is visible. `GET /api/status` reports the latest sync, and an authenticated `POST /api/sync` forces a refresh.

### portfolio.json Overrides

Add a `portfolio.json` at a repository root to override generated metadata:

```json
{
  "title": "My Cool App",
  "description": "A short description for the portfolio.",
  "icon": "https://example.com/icon.png",
  "cover": "https://example.com/cover.jpg",
  "link": "https://my-cool-app.example.com",
  "featured": true,
  "section": "work",
  "order": 1,
  "hide": false
}
```

All fields are optional. Image and link overrides must be absolute HTTPS URLs.

### Commands

| Command             | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `npm run dev`       | Run the Next.js development server                         |
| `npm run build`     | Export the static site to `out/`                           |
| `npm run preview`   | Build and serve the site with `wrangler dev`               |
| `npm run sync`      | Regenerate `src/data/projects.generated.json` from GitHub  |
| `npm run seed`      | Copy the committed snapshot into the remote KV namespace   |
| `npm run deploy`    | Build and deploy the Worker                                |
| `npm run typecheck` | Type-check the Next.js app and the Worker                  |
| `npm run lint`      | Run ESLint                                                 |

Deployment is automated by `.github/workflows/deploy.yml` on pushes to `main`. The workflow expects `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets. After the first deploy, `npm run seed` primes KV so the first request has data before the cron runs.

`SYNC_SECRET` is stored as a Worker secret. To force a sync:

```bash
curl -X POST https://debopam-portfolio.dsjzcjmsh6.workers.dev/api/sync \
  -H "Authorization: Bearer $SYNC_SECRET"
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Editorial single-page redesign with cinematic motion
- [x] Automatic GitHub repository sync, including forks
- [x] Cloudflare Worker, KV cache, and ten-minute cron
- [x] Responsive layout, reduced-motion support, and keyboard navigation
- [ ] Add real hero, about, and project imagery
- [ ] Enable R2 favicon mirroring (R2 is currently disabled on the account)
- [ ] Add a custom domain
- [ ] Add optional GitHub token support for larger repository counts

See the [open issues](https://github.com/idk4whatamiusing/portfolio/issues) for a full list of proposed features and known issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

This is a personal portfolio, so content and personal details are maintained by Debopam. Bug reports, accessibility fixes, and code suggestions are welcome.

1. Open an issue describing the change.
2. Fork the repository.
3. Create a branch (`git checkout -b feature/AmazingFeature`).
4. Commit your changes.
5. Open a pull request.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

No open-source license is currently included. The code and content are published for reference; please ask before reusing them. © Debopam Das.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

**Debopam Das**

- Email: [kyahifarakpdtahein@gmail.com](mailto:kyahifarakpdtahein@gmail.com)
- GitHub: [@idk4whatamiusing](https://github.com/idk4whatamiusing)
- Live site: [debopam-portfolio.dsjzcjmsh6.workers.dev](https://debopam-portfolio.dsjzcjmsh6.workers.dev/)

Project Link: [github.com/idk4whatamiusing/portfolio](https://github.com/idk4whatamiusing/portfolio)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

- [Next.js](https://nextjs.org/) for the static export and font pipeline.
- [Cloudflare Workers](https://workers.cloudflare.com/) for hosting, KV, and cron.
- [Google Fonts](https://fonts.google.com/) for Instrument Serif, Big Shoulders Stencil, and Space Mono.
- [sondaven.com](https://sondaven.com/) for editorial pacing and motion inspiration. No content, imagery, or commercial fonts were copied.
- [Shields.io](https://shields.io/) for the README badges.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[live-shield]: https://img.shields.io/badge/Live_Site-debopam--portfolio-a89474?style=for-the-badge
[live-url]: https://debopam-portfolio.dsjzcjmsh6.workers.dev/
[next-shield]: https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[next-url]: https://nextjs.org/
[react-shield]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[react-url]: https://react.dev/
[typescript-shield]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[typescript-url]: https://www.typescriptlang.org/
[workers-shield]: https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflareworkers&logoColor=white
[workers-url]: https://workers.cloudflare.com/
[kv-shield]: https://img.shields.io/badge/Cloudflare_KV-F38020?style=for-the-badge&logo=cloudflare&logoColor=white
[kv-url]: https://developers.cloudflare.com/kv/
[wrangler-shield]: https://img.shields.io/badge/Wrangler-2C2824?style=for-the-badge&logo=cloudflare&logoColor=white
[wrangler-url]: https://developers.cloudflare.com/workers/wrangler/
[product-screenshot]: docs/preview.jpg
