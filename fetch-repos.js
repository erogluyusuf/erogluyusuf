const fs = require("fs");
const https = require("https");

const username = "erogluyusuf"; // GitHub kullanıcı adın
const maxRepos = 5; // En fazla kaç proje gösterilsin

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
const list = repos
  .slice(0, maxRepos)
  .reduce((acc, repo, index) => {
    const card = `
      <td style="padding: 10px;">
        <a href="${repo.html_url}">
          <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name}&theme=radical" />
        </a>
      </td>
    `;

    if (index % 2 === 0) {
      acc += `<tr>${card}`;
    } else {
      acc += `${card}</tr>\n`;
    }

    return acc;
  }, '<table style="width:100%; table-layout: fixed;">') + '</table>';





  const readme = fs.readFileSync("README.md", "utf-8");
  const updated = readme.replace(
    /<!--START_SECTION:repos-->[\s\S]*<!--END_SECTION:repos-->/,
    `<!--START_SECTION:repos-->\n${list}\n<!--END_SECTION:repos-->`
  );

  fs.writeFileSync("README.md", updated);
});
