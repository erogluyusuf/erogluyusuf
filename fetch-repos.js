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

  // --- ZİKZAK HARİTA TASARIMI ---
  
  let content = `<div align="center" style="font-family: monospace;">\n`;
  
  const validRepos = repos.slice(0, maxRepos);

  validRepos.forEach((repo, index) => {
    const isEven = index % 2 === 0; // Çift sayılar (0, 2, 4) -> SOLA
    
    // Level Başlığı
    const levelBadge = `<b>🏰 LEVEL ${index + 1}</b>`;

    // Repo Kartı (Border kaldırıldı, sadeleştirildi)
    const repoCard = `
      <a href="${repo.html_url}">
        <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name}&theme=radical&hide_border=true" width="350" alt="${repo.name}" />
      </a>
    `;

    // Yönlendirme (Zikzak Mantığı)
    if (isEven) {
        // --- SOLA YASLA ---
        content += `
        <div align="left" style="margin-left: 5%;">
            ${levelBadge}<br/>
            ${repoCard}
        </div>`;
        
        // Ok İşareti (Aşağı Sağa)
        if (index < validRepos.length - 1) {
            content += `<div align="center" style="font-size: 30px; margin: -20px 0;">↘️ . . . . . </div>\n`;
        }

    } else {
        // --- SAĞA YASLA ---
        content += `
        <div align="right" style="margin-right: 5%;">
            ${levelBadge}<br/>
            ${repoCard}
        </div>`;

        // Ok İşareti (Aşağı Sola)
        if (index < validRepos.length - 1) {
            content += `<div align="center" style="font-size: 30px; margin: -20px 0;">. . . . . ↙️</div>\n`;
        }
    }
  });

  content += `</div>`;

  // --- DOSYAYA YAZMA ---

  const readme = fs.readFileSync("README.md", "utf-8");
  
  // ⚠️ DÜZELTME: Sadece START ve END etiketlerinin arasını bulur ve değiştirir.
  // Sayfanın en üstüne dokunmaz.
  const updated = readme.replace(
    /[\s\S]*?/,
    `\n${content}\n`
  );

  fs.writeFileSync("README.md", updated, "utf-8");
  console.log("Map style updated successfully inside the correct section!");
});
