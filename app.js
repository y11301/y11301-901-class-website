const SUPABASE_URL="https://dvqmogzkpdulbwwqtobs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_3s7-BfCgJXGHPJtSYptiUg_ru4JlUR4";
const PHOTO_BUCKET="class-photos";
const sb=window.supabase?.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const fmtDate=v=>v?new Date(v+"T00:00:00").toLocaleDateString("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}):"";
function toast(msg){const t=$("#toast");if(!t)return;t.textContent=msg;t.classList.add("show");clearTimeout(window.__tt);window.__tt=setTimeout(()=>t.classList.remove("show"),2800)}
function observeReveals(){if(!("IntersectionObserver" in window)){document.querySelectorAll(".reveal").forEach(x=>x.classList.add("visible"));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll(".reveal:not(.visible)").forEach(x=>io.observe(x))}
function initUI(){
 const nav=$(".nav"),menu=$(".menu");menu?.addEventListener("click",()=>nav.classList.toggle("open"));
 document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
 const theme=$("#themeBtn"),saved=localStorage.getItem("901-theme");if(saved==="light")document.body.classList.add("light");
 theme?.addEventListener("click",()=>{document.body.classList.toggle("light");localStorage.setItem("901-theme",document.body.classList.contains("light")?"light":"dark")});
 if($("#year"))$("#year").textContent=new Date().getFullYear();
 let clicks=0,timer;
 $("#brandLogo")?.addEventListener("click",e=>{e.preventDefault();clicks++;clearTimeout(timer);timer=setTimeout(()=>clicks=0,1100);if(clicks===3){clicks=0;openAdmin()}});
 observeReveals();
}
async function loadHome(){
 if(!sb)return;
 const [news,members,site]=await Promise.all([
  sb.from("class901_news").select("*").order("sort_order"),
  sb.from("class901_members").select("*").order("sort_order"),
  sb.from("class901_site").select("*").eq("id",1).maybeSingle()
 ]);
 if(!news.error&&news.data?.length&&$("#newsGrid"))$("#newsGrid").innerHTML=news.data.map(n=>`<article class="card announcement reveal"><span class="pin">${esc(n.icon||"📌")}</span><div class="date">${esc(n.date_text||"")}</div><h4>${esc(n.title)}</h4><p class="sub">${esc(n.body)}</p></article>`).join("");
 if(!members.error&&members.data?.length&&$("#membersPreview"))$("#membersPreview").innerHTML=members.data.slice(0,6).map(m=>`<a href="members.html" class="card member reveal"><div class="avatar">${esc(m.avatar||m.name?.[0]||"9")}</div><h4>${esc(m.name)}</h4><span class="tag">${esc(m.tag||"901 同學")}</span></a>`).join("");
 if(!site.error&&site.data){if($("#heroSubtitle"))$("#heroSubtitle").textContent=site.data.subtitle;if($("#heroText"))$("#heroText").textContent=site.data.hero_text;if($("#quoteText"))$("#quoteText").textContent=site.data.quote_text;if($("#quoteCite"))$("#quoteCite").textContent=site.data.quote_cite}
 observeReveals();
}
async function loadMembers(){
 const box=$("#membersGrid");if(!box||!sb)return;
 const {data,error}=await sb.from("class901_members").select("*").order("sort_order");
 if(error){box.innerHTML='<div class="status">成員資料暫時無法連線，請確認 Supabase。</div>';return}
 box.innerHTML=(data||[]).map(m=>`<article class="card member member-detail reveal"><div class="avatar avatar-lg">${esc(m.avatar||m.name?.[0]||"9")}</div><h4>${esc(m.name)}</h4><span class="tag">${esc(m.tag||"901 同學")}</span>${m.bio?`<p class="sub">${esc(m.bio)}</p>`:`<p class="sub">901 的一份珍貴回憶。</p>`}</article>`).join("")||'<div class="status">還沒有成員資料。</div>';
 observeReveals();
}
async function loadEvents(){
 const box=$("#eventsGrid");if(!box||!sb)return;
 const {data,error}=await sb.from("class901_events").select("*").order("event_date");
 if(error){box.innerHTML='<div class="status">活動資料暫時無法連線。</div>';return}
 box.innerHTML=(data||[]).map(e=>`<article class="card event-card reveal"><div class="event-date">${esc(e.month_day||fmtDate(e.event_date))}</div><div><div class="date">${esc(fmtDate(e.event_date)||"活動")}</div><h4>${esc(e.title)}</h4><p class="sub">${esc(e.body||"")}</p></div><span class="tag">${esc(e.location||"901")}</span></article>`).join("")||'<div class="status">目前還沒有活動。</div>';
 observeReveals();
}
async function loadAlbums(){
 const box=$("#albumGrid");if(!box||!sb)return;
 const {data,error}=await sb.from("class901_albums").select("*").order("album_date",{ascending:false});
 if(error){box.innerHTML='<div class="status">相簿資料暫時無法連線。</div>';return}
 box.innerHTML=(data||[]).map(a=>`<a class="card album reveal" href="#album-${a.id}" data-album-link="${a.id}"><div class="album-cover">${esc(a.cover_emoji||"📸")}</div><div class="album-info"><strong>${esc(a.title)}</strong><div class="sub">${esc(fmtDate(a.album_date))} · ${esc(a.description||"")}</div></div></a>`).join("")||'<div class="status">還沒有活動相簿。</div>';
 document.querySelectorAll("[data-album-link]").forEach(a=>a.addEventListener("click",()=>setTimeout(()=>focusAlbum(a.dataset.albumLink),0)));
 observeReveals();
}
async function loadAlbumPhotos(){
 const box=$("#photoGrid");if(!box||!sb)return;
 const {data,error}=await sb.from("class901_photos").select("*").order("created_at",{ascending:false});
 if(error){box.innerHTML='<div class="status">照片資料暫時無法連線。請確認 Supabase 設定。</div>';return}
 box.innerHTML=(data||[]).map(p=>`<figure class="photo reveal" data-album="${esc(p.album_id)}"><img loading="lazy" src="${esc(p.public_url)}" alt="${esc(p.caption||"901 回憶")}"><figcaption>${esc(p.caption||"901 回憶")}</figcaption></figure>`).join("")||'<div class="status">還沒有上傳照片。</div>';
 document.querySelectorAll(".photo img").forEach(img=>img.addEventListener("click",()=>openLightbox(img.src,img.alt)));
 observeReveals();
}
function focusAlbum(id){document.querySelectorAll(".album").forEach(x=>x.classList.remove("selected"));document.querySelector(`.album[data-album-link="${CSS.escape(id)}"]`)?.classList.add("selected");const photos=document.querySelectorAll(`.photo[data-album="${CSS.escape(id)}"]`);if(photos.length)photos[0].scrollIntoView({behavior:"smooth",block:"center"});}
function openLightbox(src,alt){let l=$("#lightbox");if(!l){l=document.createElement("div");l.id="lightbox";l.className="lightbox";l.innerHTML='<button class="close-lightbox" aria-label="關閉">✕</button><img alt="">';document.body.appendChild(l);l.addEventListener("click",e=>{if(e.target===l||e.target.classList.contains("close-lightbox"))l.classList.remove("open")})}l.querySelector("img").src=src;l.querySelector("img").alt=alt;l.classList.add("open")}
async function loadCapsules(){
 const box=$("#capsules");if(!box||!sb)return;
 const {data,error}=await sb.from("class901_capsules").select("*").order("created_at",{ascending:false});
 if(error){box.innerHTML=`<div class="status">時光膠囊目前無法連線。<br><small>其他功能不受影響。</small></div>`;return}
 box.innerHTML=(data||[]).map(x=>`<div class="capsule-item"><strong>${esc(x.name||"匿名同學")}</strong><span>${x.created_at?new Date(x.created_at).toLocaleString("zh-TW"):""}</span><p>${esc(x.message)}</p></div>`).join("")||'<p class="sub">還沒有留言，成為第一個留下回憶的人吧！</p>';
}
async function submitCapsule(e){e.preventDefault();if(!sb)return;const fd=new FormData(e.currentTarget);const {error}=await sb.from("class901_capsules").insert({name:String(fd.get("name")||"匿名同學").slice(0,40),message:String(fd.get("message")||"").slice(0,1000)});if(error){toast("留言失敗，請稍後再試");return}e.currentTarget.reset();await loadCapsules();toast("回憶已送上雲端 ☁️")}
async function uploadPhotos(files){
 if(!sb||!files?.length)return;
 const session=(await sb.auth.getSession()).data.session;
 if(!session){toast("請先用左上角 901 標誌連點三次並登入後台");openAdmin();return}
 const album=$("#uploadAlbum")?.value;if(!album){toast("請先選擇要加入的相簿");return}
 const st=$("#uploadStatus");if(st)st.textContent=`正在上傳 ${files.length} 張照片…`;
 let ok=0;
 for(const file of files){
  if(!file.type.startsWith("image/"))continue;
  const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_"),path=`public/${Date.now()}_${crypto.randomUUID()}_${safe}`;
  const up=await sb.storage.from(PHOTO_BUCKET).upload(path,file,{upsert:false});
  if(up.error)continue;
  const pub=sb.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
  const ins=await sb.from("class901_photos").insert({album_id:Number(album),storage_path:path,public_url:pub,caption:file.name.replace(/\.[^.]+$/,"")});
  if(!ins.error)ok++;
 }
 if(st)st.textContent=`已完成 ${ok} / ${files.length} 張照片上傳`;
 await loadAlbumPhotos();toast(`完成 ${ok} 張照片上傳`);
}
async function fillAlbumSelect(){
 const s=$("#uploadAlbum");if(!s||!sb)return;
 const {data,error}=await sb.from("class901_albums").select("id,title").order("album_date",{ascending:false});
 if(error)return;
 s.innerHTML='<option value="">選擇相簿</option>'+(data||[]).map(a=>`<option value="${a.id}">${esc(a.title)}</option>`).join("");
}
function openAdmin(){const o=$("#adminOverlay");if(!o)return;o.classList.add("open");document.body.style.overflow="hidden";sb?.auth.getSession().then(r=>r.data.session?showDashboard():showLogin())}
function closeAdmin(){const o=$("#adminOverlay");o?.classList.remove("open");document.body.style.overflow=""}
function showLogin(){$("#loginView")?.style.setProperty("display","block");$("#dashboardView")?.style.setProperty("display","none")}
function showDashboard(){$("#loginView")?.style.setProperty("display","none");$("#dashboardView")?.style.setProperty("display","block");loadAdminData()}
async function loginAdmin(){if(!sb)return;const {error}=await sb.auth.signInWithPassword({email:$("#adminEmail").value.trim(),password:$("#adminPassword").value});if(error){toast("登入失敗：Email 或密碼不正確");return}showDashboard();toast("管理員登入成功")}
async function logoutAdmin(){await sb?.auth.signOut();showLogin();toast("已登出")}
async function loadAdminData(){
 if(!sb)return;
 const [n,m,e,a]=await Promise.all([sb.from("class901_news").select("*").order("sort_order"),sb.from("class901_members").select("*").order("sort_order"),sb.from("class901_events").select("*").order("event_date"),sb.from("class901_albums").select("*").order("album_date",{ascending:false})]);
 const fill=(id,data,table)=>{const b=$(id);if(!b)return;b.innerHTML=(data||[]).map(x=>`<div class="admin-row"><span>${esc(x.title||x.name)}</span><button class="danger" data-table="${table}" data-id="${x.id}">刪除</button></div>`).join("")||"<div class='sub'>目前沒有資料</div>"};
 fill("#adminNewsList",n.data,"class901_news");fill("#adminMembersList",m.data,"class901_members");fill("#adminEventsList",e.data,"class901_events");fill("#adminAlbumsList",a.data,"class901_albums");
 document.querySelectorAll(".admin-row .danger").forEach(b=>b.onclick=async()=>{if(!confirm("確定要刪除這筆資料嗎？"))return;const {error}=await sb.from(b.dataset.table).delete().eq("id",b.dataset.id);if(error)toast("刪除失敗");else{toast("已刪除");await loadAdminData();loadHome();loadMembers();loadEvents();loadAlbums();fillAlbumSelect()}});
}
async function adminInsert(table,payload){
 if(!sb)return;
 const {error}=await sb.from(table).insert(payload);
 if(error)toast("儲存失敗："+error.message);else{toast("已同步到雲端");await loadAdminData();loadHome();loadMembers();loadEvents();loadAlbums();fillAlbumSelect()}
}
function initAdmin(){
 $("#closeAdmin")?.addEventListener("click",closeAdmin);$("#adminOverlay")?.addEventListener("click",e=>{if(e.target.id==="adminOverlay")closeAdmin()});
 $("#loginBtn")?.addEventListener("click",loginAdmin);$("#logoutBtn")?.addEventListener("click",logoutAdmin);
 document.querySelectorAll(".admin-tabs button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".admin-tabs button").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".admin-section").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#admin-"+b.dataset.tab)?.classList.add("active")});
 $("#addNews")?.addEventListener("click",()=>adminInsert("class901_news",{date_text:$("#nDate").value,title:$("#nTitle").value,body:$("#nBody").value,icon:$("#nIcon").value||"📌",sort_order:Date.now()}));
 $("#addMember")?.addEventListener("click",()=>adminInsert("class901_members",{name:$("#mName").value,tag:$("#mTag").value,avatar:$("#mAvatar").value||"9",bio:$("#mBio").value,sort_order:Date.now()}));
 $("#addEvent")?.addEventListener("click",()=>adminInsert("class901_events",{event_date:$("#eDate").value,month_day:$("#eDate").value.slice(5),title:$("#eTitle").value,body:$("#eBody").value,location:$("#eLocation").value,sort_order:Date.now()}));
 $("#addAlbum")?.addEventListener("click",()=>adminInsert("class901_albums",{album_date:$("#aDate").value||new Date().toISOString().slice(0,10),title:$("#aTitle").value,description:$("#aDesc").value,cover_emoji:$("#aEmoji").value||"📸"}));
}
document.addEventListener("DOMContentLoaded",async()=>{initUI();initAdmin();loadHome();loadMembers();loadEvents();loadAlbums();loadAlbumPhotos();loadCapsules();fillAlbumSelect();$("#capsuleForm")?.addEventListener("submit",submitCapsule);$("#photoInput")?.addEventListener("change",e=>uploadPhotos([...e.target.files]));});
