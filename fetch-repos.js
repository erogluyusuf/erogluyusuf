const fs = require("fs");
const https = require("https");

const username = "erogluyusuf"; // GitHub kullanıcı adın
const maxRepos = 6; // En fazla kaç proje gösterilsin

function fetchRepos(callback) {
  const options = {
    hostname: "api.github.com",
    path: `/users/${username}/repos?sort=updated`,
    method: "GET",
    headers: { "User-Agent": "Node.js" }
  };

  const req = https.request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => callback(JSON.parse(body)));
  });

  req.on("error", (e) => console.error(e));
  req.end();
}

fetchRepos((repos) => {
  const list = `
  <style>
    .repo-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      padding: 20px;
    }
    .repo-card {
      border: 2px solid #f2f2f2;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      background-color: #fff;
      transition: transform 0.2s ease-in-out;
    }
    .repo-card:hover {
      transform: translateY(-10px);
    }
    .repo-card img {
      width: 100%;
      border-bottom: 2px solid #f2f2f2;
    }
    .repo-card a {
      display: block;
      padding: 10px;
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      color: #333;
      text-decoration: none;
    }
  </style>

  <div class="repo-container">
    ${repos.slice(0, maxRepos).map(repo => `
      <div class="repo-card">
        <a href="${repo.html_url}">
          <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name}&theme=radical" />
          ${repo.name}
        </a>
      </div>
    `).join('')}
  </div>
  `;

  const readme = fs.readFileSync("README.md", "utf-8");
  const updated = readme.replace(
    /<!--START_SECTION:repos-->[\s\S]*<!--END_SECTION:repos-->/,
    `<!--START_SECTION:repos-->\n${list}\n<!--END_SECTION:repos-->`
  );

  fs.writeFileSync("README.md", updated);
});
