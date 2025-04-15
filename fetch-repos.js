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
    res.on("end", () => {
      try {
        const repos = JSON.parse(body);
        callback(repos);
      } catch (error) {
        console.error("JSON parse error:", error);
      }
    });
  });

  req.on("error", (e) => console.error("Request error:", e));
  req.end();
}

fetchRepos((repos) => {
  if (!repos || repos.length === 0) {
    console.log("No repositories found or failed to fetch data.");
    return;
  }

  const list = `
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; padding: 20px;">
    ${repos.slice(0, maxRepos).map(repo => `
      <div style="border: 2px solid #f2f2f2; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background-color: #fff; transition: transform 0.2s ease-in-out;">
        <a href="${repo.html_url}" style="display: block; padding: 10px; text-align: center; font-size: 14px; font-weight: bold; color: #333; text-decoration: none;">
          <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name}&theme=radical" style="width: 100%; border-bottom: 2px solid #f2f2f2;" />
          <span style="display: block; padding-top: 10px;">${repo.name}</span>
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

  fs.writeFileSync("README.md", updated, "utf-8");
  console.log("README.md updated successfully with repositories.");
});
