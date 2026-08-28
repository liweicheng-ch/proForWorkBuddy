/* ============================================================
 * 奇妙脑力岛 · 主逻辑 (js/app.js)
 * 导航 / 语音 / 学习中心 / 能力详情 / 阅读理解中心 / PIN / 家长
 * ============================================================ */

/* ---------- 用户状态 ---------- */
var state = {
  age: 4,
  readLevel: 'B',   // 按 getReadingLevel() 自动分级
  theme: 'all'
};
function getReadingLevel(){
  var age = state.age;
  if(age <= 3) return 'A';
  if(age <= 4) return 'B';
  if(age <= 5) return 'C';
  return 'D';
}

/* ---------- 导航 ---------- */
function showPage(id){
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  $('page-'+id).classList.add('active');
}
function nav(id){
  if(id==='home'||id==='learn'||id==='story'||id==='me'){
    $('bottom-nav').classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(function(n){
      n.classList.toggle('active', n.dataset.nav===id);
    });
    if(id==='story') renderReading();
    showPage(id);
  }
}
function showToast(msg){
  var t = $('toast');
  t.innerHTML = msg;
  t.classList.add('show');
  clearTimeout(t._tm);
  t._tm = setTimeout(function(){ t.classList.remove('show'); }, 2400);
}

/* ---------- 语音（Web Speech API · 语速0.85 · 音调1.2，PRD V2.1） ---------- */
var soundOn = true;
function speak(text){
  if(!soundOn) return;
  if(!('speechSynthesis' in window)){ showToast('🔇 当前环境不支持语音'); return; }
  speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN'; u.rate = 0.85; u.pitch = 1.2;
  speechSynthesis.speak(u);
}
function toggleSound(){
  soundOn = !soundOn;
  document.querySelector('.sound-badge').textContent = soundOn ? '🔊 语音已开启' : '🔇 语音已关闭';
}

/* ---------- 状态栏时间 ---------- */
(function(){
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  $('sb-time').textContent = (h<10?'0':'')+h + ':' + (m<10?'0':'')+m;
})();

/* ---------- 奖励 ---------- */
function showRewards(){ showToast('🛍️ 星星商店原型：可用星星兑换角色装饰与家园装饰'); }

/* ---------- 学习中心渲染 ---------- */
function renderLearn(){
  var box = $('learn-ability-list');
  var html = ABILITIES.map(function(a, i){
    var games = GAMES_BY_ABILITY[a.key].map(function(g){ return GAME_LIST[g]; });
    return '<div class="card ability-card" onclick="goAbility('+i+')">' +
      '<div class="a-ico aico-'+a.cls+'">'+a.icon+'</div>' +
      '<div class="a-body">' +
        '<div class="a-top"><span class="a-name">'+a.name+'</span><span class="pill lv-'+a.cls+'">'+a.lv+'</span></div>' +
        '<div class="a-bar"><i class="aico-'+a.cls+'" style="width:'+a.score+'%"></i></div>' +
        '<div class="a-meta"><span>得分 '+a.score+'</span><span style="color:'+(a.trendCls==='trend-up'?'#E74C3C':(a.trendCls==='trend-down'?'#27AE60':'#95A5A6'))+'">'+a.trend+'</span></div>' +
        '<div class="a-games">' + games.map(function(g){ return '<span class="g-chip">'+g.icon+' '+g.name+'</span>'; }).join('') + '</div>' +
      '</div></div>';
  }).join('');
  box.innerHTML = html;
}

/* ---------- 能力详情页 ---------- */
function goAbility(idx){
  var a = ABILITIES[idx];
  var games = GAMES_BY_ABILITY[a.key].map(function(g){ return GAME_LIST[g]; });
  var heroBg = {
    att:'linear-gradient(140deg,#FF9E5E,#FF6B35)',
    mem:'linear-gradient(140deg,#7FD6FF,#3AA0F5)',
    log:'linear-gradient(140deg,#C9A2FF,#8A4FE8)',
    rea:'linear-gradient(140deg,#7DE8A8,#38C172)'
  }[a.cls];
  var html =
    '<div class="learn-top"><div><h2 class="page-title">'+a.icon+' '+a.name+'</h2>' +
    '<div class="page-sub">'+a.place+' · 5 个游戏 · 难度自动调整</div></div>' +
    '<button class="icon-btn" onclick="speak(\''+a.name+'，这里有五个好玩的游戏！\')">🔊</button></div>' +
    '<div class="abil-hero" style="background:'+heroBg+'">' +
      '<span class="ah-emoji">'+a.icon+'</span>' +
      '<div class="ah-info"><h3>'+a.name+'</h3><p>'+a.desc+'</p>' +
      '<div class="ah-score">当前得分 <b>'+a.score+'</b> '+a.trend+'</div></div>' +
      '<span class="ah-lv">'+a.lv+'</span></div>' +
    '<div class="sec-h">🎮 游戏列表 <span class="sh-count">'+a.gameCount+' 个</span></div>' +
    '<div class="game-list">' + games.map(function(g){
      return '<div class="card game-card" onclick="startGame(\''+g.id+'\')">' +
        '<div class="gc-ico aico-'+a.cls+'">'+g.icon+'</div>' +
        '<div class="gc-body"><div class="gc-name">'+g.name+' <span class="gc-diff">★ 难度递进</span></div>' +
        '<div class="gc-desc">'+g.desc+'</div></div>' +
        '<span class="gc-go aico-'+a.cls+'">开始 ▶</span></div>';
    }).join('') + '</div>';
  $('ability-content').innerHTML = html;
  $('bottom-nav').classList.add('hidden');
  showPage('ability');
}

/* ---------- 阅读理解中心 ---------- */
function renderReading(){
  state.readLevel = getReadingLevel();
  $('story-sub').textContent = '级别 '+state.readLevel+'（'+state.age+' 岁）· 自动分级 · 6 大主题';
  $('level-hint').textContent = '当前 '+state.age+' 岁 → Level '+state.readLevel;
  /* 级别 tabs */
  var lv = $('level-tabs');
  lv.innerHTML = LEVELS.map(function(L){
    return '<div class="level-tab'+(L.key===state.readLevel?' on':'')+'" onclick="setReadingLevel(\''+L.key+'\')">' +
      '<div class="lt-name">'+L.name+'</div><div class="lt-age">'+L.desc+'</div></div>';
  }).join('');
  /* 引擎 */
  var eg = $('engine-grid');
  eg.innerHTML = READING_ENGINES.map(function(en){
    return '<div class="engine-card '+en.cls+'" onclick="startGame(\''+en.id+'\')">' +
      '<span class="ec-ico">'+en.icon+'</span><span class="ec-name">'+en.name+'</span>' +
      '<span class="ec-desc">'+en.desc+'</span></div>';
  }).join('');
  /* 主题 chips */
  var tc = $('theme-chips');
  tc.innerHTML = THEMES.map(function(t){
    return '<span class="tchip'+(t.key===state.theme?' on':'')+'" onclick="setTheme(\''+t.key+'\')">'+t.icon+' '+t.name+'</span>';
  }).join('');
  renderArticleList();
}
function setReadingLevel(key){
  state.readLevel = key;
  renderReading();
}
function setTheme(key){
  state.theme = key;
  renderReading();
}
function renderArticleList(){
  var arts = getReadingArticles(state.readLevel, state.theme);
  $('article-count').textContent = arts.length + ' / ' + READING_CONTENT.length + ' 篇（完整版 100 篇）';
  var list = $('reading-list');
  if(arts.length === 0){
    list.innerHTML = '<div class="card" style="padding:20px;text-align:center;color:var(--ink-l);font-size:13px">这个级别暂时没有这个主题的文章，换个主题看看～</div>';
    return;
  }
  var thumbBg = { animal:'aico-att', nature:'aico-mem', science:'aico-log', adventure:'aico-rea', daily:'aico-att', emotion:'aico-rea' };
  list.innerHTML = arts.map(function(a){
    return '<div class="card reading-item" onclick="openArticle(\''+a.id+'\')">' +
      '<div class="ri-thumb '+thumbBg[a.theme]+'">'+THEME_EMOJI[a.theme]+'</div>' +
      '<div class="ri-body">' +
        '<div class="ri-title">'+a.title+'</div>' +
        '<div class="ri-meta"><span class="ri-badge aico-rea">'+a.level+' 级</span>' +
        '<span class="ri-badge aico-mem">'+THEME_NAME[a.theme]+'</span>' +
        a.questions.length+' 道题 · '+a.text.split('').length+' 字</div></div>' +
      '<span class="ri-go">▶</span></div>';
  }).join('');
}
function openArticle(id){
  var a = getArticleById(id);
  startGame('story_quiz', { articleId: id });
}

/* ---------- 家长 PIN ---------- */
var pinInput = '';
function openPin(){ pinInput=''; renderPin(); $('ov-pin').classList.add('show'); }
function pinKey(k){
  if(pinInput.length>=4) return;
  pinInput += k;
  renderPin();
  if(pinInput.length===4) setTimeout(pinOk, 180);
}
function pinBack(){ pinInput = pinInput.slice(0,-1); renderPin(); }
function renderPin(){
  var dots = document.querySelectorAll('#ov-pin .pin-dots i');
  for(var i=0;i<4;i++) dots[i].classList.toggle('filled', i<pinInput.length);
}
function pinOk(){
  if(pinInput === '1234'){
    $('ov-pin').classList.remove('show');
    enterParent();
  } else {
    var card = $('pin-card');
    card.classList.remove('pin-shake');
    void card.offsetWidth;
    card.classList.add('pin-shake');
    showToast('❌ 密码不对，再试一次');
    pinInput = ''; renderPin();
  }
}
function enterParent(){
  $('bottom-nav').classList.add('hidden');
  showPage('parent');
  showToast('👨‍👩‍👧 欢迎来到家长中心');
}
function exitParent(){ nav('home'); }

/* ---------- 初始化 ---------- */
function init(){
  state.readLevel = getReadingLevel();
  renderLearn();
}
init();
