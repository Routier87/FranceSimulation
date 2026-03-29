
const FARMS = ["La centrale agricole", "Thomas et Arthur", "Rollplay", "Routier", "Julien", "Oxi", "Champion", "Événement", "Vignoble d'hyrion", "La Mumu", "Supercat"];
const DEFAULT_STOCKS = ["Blé", "Orge", "Colza", "Maïs", "Tournesol", "Soja", "Pomme de terre", "Betterave", "Coton", "Canne à sucre", "Ensilage", "Herbe", "Paille", "Foin", "Lait", "Fumier", "Lisier", "Bois", "Planches", "Copeaux"];
const FARM_PASSWORD = "12345";

function read(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){ return fallback; }
}
function write(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function slugify(v){
  return String(v).normalize("NFD").replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'').toLowerCase();
}
function initData(){
  let farms = read("fs_farms", null);
  if(!farms){
    farms = {};
    FARMS.forEach(name => farms[name] = { password: FARM_PASSWORD, stocks: {} });
    write("fs_farms", farms);
  }
  let custom = read("fs_custom_stocks", null);
  if(!custom) write("fs_custom_stocks", []);
}
function allStocks(){
  return [...new Set([...DEFAULT_STOCKS, ...read("fs_custom_stocks", [])])];
}
function showNav(){
  const nav = document.getElementById("sessionNav");
  if(!nav) return;
  nav.innerHTML = '<a href="index.html">Accueil</a><a href="fermes.html">Fermes</a><a href="catalogue.html">Catalogue</a><a href="admin.html">Panel Admin</a>';
}
function renderFarmsPage(){
  const wrap = document.getElementById("farmsWrap");
  if(!wrap) return;
  wrap.innerHTML = FARMS.map(name => `
    <div class="farm-card">
      <h3>${name}</h3>
      <p class="muted">Mot de passe de base : 12345</p>
      <button data-farm="${name}">Ouvrir cette ferme</button>
    </div>
  `).join('');
  wrap.querySelectorAll('button[data-farm]').forEach(btn => {
    btn.onclick = () => openFarmLogin(btn.getAttribute('data-farm'));
  });
}
function openFarmLogin(name){
  const box = document.getElementById("farmLoginBox");
  if(!box) return;
  box.classList.remove("hidden");
  document.getElementById("farmLoginName").value = name;
  document.getElementById("farmLoginLabel").innerText = name;
  document.getElementById("farmLoginPassword").value = "";
}
function loginFarm(){
  const name = document.getElementById("farmLoginName").value;
  const pass = document.getElementById("farmLoginPassword").value;
  const farms = read("fs_farms", {});
  if(!farms[name]) return alert("Ferme introuvable");
  if(pass !== farms[name].password) return alert("Mot de passe incorrect");
  localStorage.setItem("fs_current_farm", name);
  window.location.href = "ferme.html";
}
function renderFarmPage(){
  const title = document.getElementById("farmTitle");
  if(!title) return;
  const current = localStorage.getItem("fs_current_farm");
  if(!current){ window.location.href = "fermes.html"; return; }
  title.innerText = current;
  renderStocks();
}
function renderStocks(){
  const wrap = document.getElementById("stocksWrap");
  if(!wrap) return;
  const current = localStorage.getItem("fs_current_farm");
  const farms = read("fs_farms", {});
  if(!farms[current]) return;
  const store = farms[current].stocks || {};
  wrap.innerHTML = allStocks().map(name => {
    const key = slugify(name);
    const value = store[key] || "";
    return `<div class="stock-row"><label for="${key}">${name}</label><input id="${key}" type="number" value="${value}" onchange="saveStock('${key}')"></div>`;
  }).join('');
}
function saveStock(key){
  const current = localStorage.getItem("fs_current_farm");
  const farms = read("fs_farms", {});
  if(!farms[current]) return;
  farms[current].stocks[key] = document.getElementById(key).value;
  write("fs_farms", farms);
}
function changePassword(){
  const current = localStorage.getItem("fs_current_farm");
  const farms = read("fs_farms", {});
  const oldPwd = document.getElementById("oldPwd").value;
  const newPwd = document.getElementById("newPwd").value;
  const confirmPwd = document.getElementById("confirmPwd").value;
  if(!farms[current]) return;
  if(oldPwd !== farms[current].password) return alert("Ancien mot de passe incorrect");
  if(!newPwd) return alert("Entre un nouveau mot de passe");
  if(newPwd !== confirmPwd) return alert("La confirmation ne correspond pas");
  farms[current].password = newPwd;
  write("fs_farms", farms);
  document.getElementById("oldPwd").value = "";
  document.getElementById("newPwd").value = "";
  document.getElementById("confirmPwd").value = "";
  alert("Mot de passe changé");
}
function addCustomStock(){
  const input = document.getElementById("newStockName");
  if(!input) return;
  const name = input.value.trim();
  if(!name) return alert("Entre un nom de stock");
  const list = read("fs_custom_stocks", []);
  if(!list.includes(name)) list.push(name);
  write("fs_custom_stocks", list);
  input.value = "";
  renderAdminPage();
  alert("Nouveau stock ajouté");
}
function renderAdminPage(){
  const wrap = document.getElementById("stockListAdmin");
  if(!wrap) return;
  const custom = read("fs_custom_stocks", []);
  wrap.innerHTML = `
    <div class="item"><strong>Stocks de base</strong><div class="muted">${DEFAULT_STOCKS.join(", ")}</div></div>
    <div class="item"><strong>Stocks ajoutés</strong><div class="muted">${custom.length ? custom.join(", ") : "Aucun stock personnalisé"}</div></div>
  `;
}
window.addEventListener("DOMContentLoaded", function(){
  initData();
  showNav();
  renderFarmsPage();
  renderFarmPage();
  renderAdminPage();
});
