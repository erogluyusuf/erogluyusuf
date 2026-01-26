const fs = require("fs");
const https = require("https");

const username = "erogluyusuf"; 
const maxRepos = 6; 

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
    console.log("No repositories found.");
    return;
  }

  // --- OYUN HARİTASI TASARIMI ALGORİTMASI ---
  
  let content = `<div align="center" style="font-family: monospace;">\n`;
  content += `<h3>🗺️ QUEST MAP: Latest Projects</h3>\n`;

  const validRepos = repos.slice(0, maxRepos);

  validRepos.forEach((repo, index) => {
    const isEven = index % 2 === 0; // Çift sayılar (0, 2, 4) -> SOLA
    
    // 1. ADIM: "Level" Başlığı (Oyun Havası Katmak İçin)
    const levelBadge = `<b>🏰 LEVEL ${index + 1}</b>`;

    // 2. ADIM: Repo Kartı
    const repoCard = `
      <a href="${repo.html_url}">
        <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name}&theme=radical&hide_border=true" width="350" alt="${repo.name}" />
      </a>
    `;

    // 3. ADIM: Yönlendirme ve Hizalama (Zikzak Mantığı)
    if (isEven) {
        // --- SOLDA GÖSTER ---
        content += `
        <div align="left" style="margin-left: 10%;">
            ${levelBadge}<br/>
            ${repoCard}
        </div>`;
        
        // Eğer bu son eleman değilse, aşağı sağa giden bir ok/yol ekle
        if (index < validRepos.length - 1) {
            content += `<div align="center"><img src="https://raw.githubusercontent.com/erogluyusuf/erogluyusuf/main/assets/path-down-right.png" width="50" alt="↘️" /> <br/></div>\n`;
        }

    } else {
        // --- SAĞDA GÖSTER ---
        content += `
        <div align="right" style="margin-right: 10%;">
            ${levelBadge}<br/>
            ${repoCard}
        </div>`;

        // Eğer bu son eleman değilse, aşağı sola giden bir ok/yol ekle
        if (index < validRepos.length - 1) {
            content += `<div align="center"><img src="https://raw.githubusercontent.com/erogluyusuf/erogluyusuf/main/assets/path-down-left.png" width="50" alt="↙️" /> <br/></div>\n`;
        }
    }
  });

  content += `</div>`;

  // --- HTML GÜNCELLEME ---

  const readme = fs.readFileSync("README.md", "utf-8");
  const updated = readme.replace(
    /[\s\S]*/,
    `\n${content}\n`
  );

  fs.writeFileSync("README.md", updated, "utf-8");
  console.log("Map style updated successfully!");
});
