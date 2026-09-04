/* ============================================================
 * 奇妙脑力岛 · 主逻辑 (js/app.js) —— V3 融合版
 * 导航 / 语音 / 首页岛屿 / 学习中心 / 能力详情 / 阅读中心(六层)
 * 冒险任务编排 / 家长中心(雷达+阅读画像) / PIN
 * ============================================================ */

/* ---------- 用户状态 ---------- */
var state = {
  age: 4,
  readLevel: 'B',    // getReadingLevel() 自动分级
  theme: 'all',
  engine: null        // 阅读六层当前选中引擎 key（L1~L6）
};
function getReadingLevel(){
  var age = state.age;
  if(age <= 3) return 'A';
  if(age <= 4) return 'B';
  if(age <= 5) return 'C';
  return 'D';
}
function getMissionById(id){
  for(var i=0;i<MISSIONS.length;i++) if(MISSIONS[i].id === id) return MISSIONS[i];
  return MISSIONS[0];
}

/* ---------- 冒险任务运行时状态 ----------
 * MState.current = { id, step }，step = 下一步要玩的序号（0 起）
 * MState.next = 刚通关后待进入的下一步（或 null=全部完成）
 */
var MState = { current:null, next:null, results:null };
var missionRecords = {};   // id -> { doneSteps, total }

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
    if(id==='home') renderHome();
    if(id==='learn') renderLearn();
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

/* ---------- 语音 ---------- */
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
function goMeBadges(){ nav('me'); setTimeout(function(){ showToast('🎖️ 已解锁 6/12 枚徽章，继续加油！'); }, 260); }

/* ============================================================
 * 首页 · 中央岛
 * ============================================================ */
function missionProgress(m){
  var rec = missionRecords[m.id];
  return rec ? rec.doneSteps : 0;
}
function activeMission(){
  for(var i=0;i<MISSIONS.length;i++){ if(!MISSIONS[i].done) return MISSIONS[i]; }
  return MISSIONS[0];
}
function renderHome(){
  var m = activeMission();
  /* 冒险任务横幅 */
  $('adv-ico').textContent = m.icon;
  $('adv-tag').textContent = m.done ? '🎖️ 本周冒险已完成' : (m.day ? '⚔️ 今日冒险任务' : '⚔️ 冒险任务');
  $('adv-title').textContent = m.title;
  var done = missionProgress(m);
  $('adv-steps').innerHTML = m.steps.map(function(s,i){
    return '<i class="'+(i<done?'done':'')+'">'+ (i<done?'✓':s.icon) +'</i>';
  }).join('');
  $('adv-sub').textContent = m.done
    ? '已完成全部 ' + m.steps.length + ' 关，宝箱里的奖励等你领取！'
    : (done>0 ? '已完成 '+done+'/'+m.steps.length+' 关，继续闯关开宝箱！' : '完成一整条连环闯关，开宝箱拿大奖');
  $('adv-go').textContent = (done>0 && !m.done) ? '继续' : (m.done ? '再玩一次' : '去冒险');
  /* 岛屿世界 */
  $('zone-count').textContent = '已解锁 ' + ABILITIES.filter(function(a){ return !a.building; }).length + ' / ' + ABILITIES.length + ' 座';
  $('zone-grid').innerHTML = ABILITIES.map(function(a,i){
    var locked = a.building;
    return '<div class="zone'+(locked?' locked':'')+'" style="background:'+a.grad+'" onclick="goAbility('+i+')">' +
      (locked?'<span class="z-lock">🔧</span>':'') +
      '<span class="z-emoji">'+a.icon+'</span>' +
      '<span class="z-name">'+a.place+'</span>' +
      '<span class="z-sub">'+(locked?'建设中 · 敬请期待':a.name+' · '+a.sub.split(' · ')[0])+'</span>' +
      '<div class="z-prog"><i style="width:'+a.score+'%"></i></div></div>';
  }).join('');
}

/* ============================================================
 * 学习中心 / 能力详情
 * ============================================================ */
function renderLearn(){
  var box = $('learn-ability-list');
  var html = ABILITIES.map(function(a, i){
    var gids = GAMES_BY_ABILITY[a.key] || [];
    var games = gids.map(function(g){ return GAME_LIST[g]; });
    var count = games.length;
    var chips = games.map(function(g){
      return '<span class="g-chip'+(g.premium?' hot':'')+'">'+g.icon+' '+g.name+(g.premium?' ✦':'')+'</span>';
    }).join('');
    if(a.building) chips += '<span class="g-chip soon">🔧 建设中</span>';
    return '<div class="card ability-card" onclick="goAbility('+i+')">' +
      '<div class="a-ico" style="background:'+a.grad+'">'+a.icon+'</div>' +
      '<div class="a-body">' +
        '<div class="a-top"><span class="a-name">'+a.name+'</span><span class="pill" style="background:'+a.grad+'">'+a.lv+'</span></div>' +
        '<div class="a-bar"><i style="width:'+a.score+'%;background:'+a.grad+'"></i></div>' +
        '<div class="a-meta"><span>得分 '+a.score+'</span><span style="color:'+(a.trendCls==='trend-up'?'#E74C3C':(a.trendCls==='trend-down'?'#27AE60':'#95A5A6'))+'">'+a.trend+'</span><span>'+a.place+'</span></div>' +
        '<div class="a-games">' + chips + (count?'':'') + '</div>' +
      '</div></div>';
  }).join('');
  box.innerHTML = html;
}

function goAbility(idx){
  var a = ABILITIES[idx];
  var gids = (GAMES_BY_ABILITY[a.key] || []);
  var games = gids.map(function(g){ return GAME_LIST[g]; });
  var html =
    '<div class="learn-top"><div><h2 class="page-title">'+a.icon+' '+a.name+'</h2>' +
    '<div class="page-sub">'+a.place+' · '+(games.length?games.length+' 个游戏':'建设中')+' · 难度自动调整</div></div>' +
    '<button class="icon-btn" onclick="speak(\''+a.name+'，今天想玩哪个游戏呀？\')">🔊</button></div>' +
    '<div class="abil-hero" style="background:'+a.grad+'">' +
      '<span class="ah-emoji">'+a.icon+'</span>' +
      '<div class="ah-info"><h3>'+a.place+'</h3><p>'+a.desc+'</p>' +
      '<div class="ah-score">当前得分 <b>'+a.score+'</b> '+a.trend+'</div></div>' +
      '<span class="ah-lv">'+a.lv+'</span></div>';

  if(a.building){
    html += '<div class="plan-panel card"><span class="pp-emoji">🚧</span>' +
      '「'+a.place+'」正在建设中！<br><span style="font-size:11px">'+a.sub+' 玩法即将上线</span>' +
      '<div class="plan-chips">' + a.sub.split(' · ').map(function(s){
        return '<span class="plan-chip">'+s+'</span>';
      }).join('') + '</div></div>';
  } else {
    html += '<div class="sec-h">🎮 游戏列表 <span class="sh-count">'+games.length+' 个</span><span class="sh-right" style="cursor:default">✦ 精品玩法</span></div>';
    html += '<div class="game-list">' + games.map(function(g){
      return '<div class="card game-card" onclick="startGame(\''+g.id+'\')">' +
        '<div class="gc-ico" style="background:'+abilityGrad(g.ability)+'">'+g.icon+'</div>' +
        '<div class="gc-body"><div class="gc-name">'+g.name+' ' +
          (g.premium?'<span class="tag-mini" style="background:'+getAbility('reac').grad+'">精品</span>':'<span class="tag-mini" style="background:#C9A2FF">经典</span>') +
          '</div><div class="gc-desc">'+g.desc+'</div>' +
          '<div class="gc-desc" style="color:#B08A3E">'+g.diff+'</div></div>' +
        '<span class="gc-go" style="background:'+abilityGrad(g.ability)+'">开始 ▶</span></div>';
    }).join('') + '</div>';
  }
  $('ability-content').innerHTML = html;
  $('bottom-nav').classList.add('hidden');
  showPage('ability');
}

/* ============================================================
 * 阅读中心 · 六层引擎
 * ============================================================ */
function renderReading(){
  state.readLevel = getReadingLevel();
  $('story-sub').textContent = '级别 '+state.readLevel+'（'+state.age+' 岁）· 自动分级 · 6 大主题 · 六层引擎';
  $('level-hint').textContent = '当前 '+state.age+' 岁 → Level '+state.readLevel;
  /* 级别 tabs */
  var lv = $('level-tabs');
  lv.innerHTML = LEVELS.map(function(L){
    return '<div class="level-tab'+(L.key===state.readLevel?' on':'')+'" onclick="setReadingLevel(\''+L.key+'\')">' +
      '<div class="lt-name">'+L.name+'</div><div class="lt-age">'+L.desc+'</div></div>';
  }).join('');
  /* 六层引擎卡 */
  var eg = $('engine-grid');
  eg.innerHTML = READING_ENGINES.map(function(en){
    var on = state.engine === en.key;
    return '<div class="engine-card" style="background:'+en.grad+';'+(on?'outline:4px solid #FFC94D;':'')+'" onclick="toggleEngine(\''+en.key+'\')">' +
      '<span class="ec-lv">'+en.key+'</span>' +
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
function getEngineByKey(key){
  for(var i=0;i<READING_ENGINES.length;i++) if(READING_ENGINES[i].key === key) return READING_ENGINES[i];
  return null;
}
function toggleEngine(key){
  state.engine = (state.engine === key) ? null : key;
  renderReading();
  var en = getEngineByKey(state.engine);
  if(en) showToast('🧗 已选择「'+en.key+' · '+en.name+'」，点下面文章开始训练！');
  else showToast('🌈 已切换为全部引擎，点文章默认「读文答题」');
}
function setReadingLevel(key){ state.readLevel = key; renderReading(); }
function setTheme(key){ state.theme = key; renderReading(); }

function renderArticleList(){
  var arts = getReadingArticles(state.readLevel, state.theme);
  var en = getEngineByKey(state.engine);
  $('article-count').textContent = arts.length + ' 篇 · ' + (en ? '引擎 '+en.key+' '+en.name : '全部引擎');
  var list = $('reading-list');
  if(arts.length === 0){
    list.innerHTML = '<div class="card" style="padding:20px;text-align:center;color:var(--ink-l);font-size:13px">这个级别暂时没有这个主题的文章，换个主题看看～</div>';
    return;
  }
  var thumbBg = ['#FFD166','#7FD6FF','#C9A2FF','#7DE8A8','#FF9E5E','#FF9EC7'];
  list.innerHTML = arts.map(function(a){
    var ti = 0;
    for(var tj=1; tj<THEMES.length; tj++){ if(THEMES[tj].key===a.theme){ ti = tj-1; break; } }
    return '<div class="card reading-item" onclick="openArticle(\''+a.id+'\')">' +
      '<div class="ri-thumb" style="background:'+thumbBg[ti % thumbBg.length]+'">'+THEME_EMOJI[a.theme]+'</div>' +
      '<div class="ri-body">' +
        '<div class="ri-title">'+a.title+'</div>' +
        '<div class="ri-meta"><span class="ri-badge" style="background:'+getAbility('reading').grad+'">'+a.level+' 级</span>' +
        '<span class="ri-badge" style="background:#7FD6FF">'+THEME_NAME[a.theme]+'</span>' +
        (en ? '<span class="ri-badge" style="background:#FF9EC7">'+en.name+'</span>' : '') +
        a.questions.length+' 道题 · '+a.text.split('').length+' 字</div></div>' +
      '<span class="ri-go">▶</span></div>';
  }).join('');
}
function openArticle(id){
  var en = getEngineByKey(state.engine);
  /* 六层引擎：文章以该层玩法打开（L1~L6 均可玩） */
  startGame(en ? en.game : 'story_quiz', { articleId: id, engineKey: en ? en.key : 'L2' });
}
/* 阅读中心 hero “随机读一篇” → 读文答题 */
window.startRandomReading = function(){ startGame('story_quiz'); };

/* ============================================================
 * 冒险任务系统
 * ============================================================ */
function openMissions(){
  var list = $('mission-list');
  list.innerHTML = MISSIONS.map(function(m){
    var done = missionProgress(m);
    var closed = m.done;
    var inProgress = (MState.current && MState.current.id === m.id) || (!m.done && done>0);
    return '<div class="mission-card'+(inProgress?' resume':'')+(closed?' closed':'')+'" onclick="missionIntro(\''+m.id+'\')">' +
      '<div class="mc-top"><span class="mc-ico">'+m.icon+'</span>' +
      '<span class="mc-name">'+m.title+'</span>' +
      (closed?'<span class="mc-badge">✅ 已完成</span>':(inProgress?'<span class="mc-badge">⏳ 继续冒险</span>':'<span class="mc-badge">🔓 可挑战</span>')) +
      '</div>' +
      '<div class="mc-desc">'+m.story.split('\n')[0]+'…</div>' +
      '<div class="mc-steps">' + m.steps.map(function(s,i){
        return '<i class="'+(i<done?'done':'')+'">'+(i<done?'✓':s.icon)+'</i>';
      }).join('') + ' <i style="width:auto;padding:0 7px;border-radius:10px">'+done+'/'+m.steps.length+'</i></div>' +
      '</div>';
  }).join('') +
  '<div style="font-size:10px;color:var(--ink-l);text-align:center;padding:4px 0 8px;line-height:1.7">每个任务都是一段真实串联剧情：一关接一关玩，中途可暂停<br>全部通关后打开宝箱，获得星星、金币与收藏奖励 ✨</div>';
  $('ov-mlist').classList.add('show');
}

function missionIntro(id){
  var m = getMissionById(id);
  var done = missionProgress(m);
  var resume = (MState.current && MState.current.id === m.id) || done>0;
  var html =
    '<span class="mi-ico">'+m.icon+'</span>' +
    '<h3>'+m.title+'</h3>' +
    '<div class="mi-story">'+m.story+'</div>' +
    '<div class="mi-steps">' + m.steps.map(function(s,i){
      return '<div class="mi-step"><span class="ms-idx">'+(i<done?'✓':(i+1))+'</span>' +
        '<span class="ms-ico">'+s.icon+'</span><span class="ms-name">'+s.name+'</span>' +
        '<span style="font-size:10px;color:var(--ink-l)">'+s.desc+'</span></div>';
    }).join('') + '</div>' +
    '<div style="display:flex;gap:10px">' +
      '<button class="big-btn btn-white" style="flex:1;font-size:14px;padding:11px 6px" onclick="closeOverlay(\'ov-mintro\');openMissions()">↩ 返回</button>' +
      '<button class="big-btn btn-orange" style="flex:2;font-size:15px;padding:11px 6px" onclick="startMission(\''+m.id+'\')">'+(resume?'⏳ 继续冒险':'🎮 开始冒险')+'</button>' +
    '</div>';
  $('mintro-card').innerHTML = html;
  $('ov-mlist').classList.remove('show');
  $('ov-mintro').classList.add('show');
}

function startMission(id){
  var m = getMissionById(id);
  closeOverlay('ov-mintro');
  closeOverlay('ov-mlist');
  var step = 0;
  if(MState.current && MState.current.id === m.id && MState.current.step < m.steps.length){
    step = MState.current.step;   // 断点续玩
  } else if(missionProgress(m) > 0 && missionProgress(m) < m.steps.length){
    step = missionProgress(m);
  }
  MState.current = { id: m.id, step: step };
  MState.next = null;
  MState.results = [];
  var s = m.steps[step];
  speak('冒险开始！第一站：' + s.name);
  startGame(s.gid, { missionId: m.id });
}

/* 游戏引擎在结算时回调（games.js finishGame 中调用）：
 * 返回 true 表示处在任务中，可继续下一关或通关 */
function onMissionGameFinished(stepStars){
  if(!MState.current) return false;
  var m = getMissionById(MState.current.id);
  var idx = MState.current.step;
  MState.results = MState.results || [];
  MState.results.push({ gid: m.steps[idx].gid, name: m.steps[idx].name, stars: stepStars });
  if(idx + 1 < m.steps.length){
    MState.next = { id: m.id, idx: idx + 1 };
  } else {
    MState.next = null;
  }
  return true;
}
function missionStepLabel(){
  if(!MState.current) return '';
  var m = getMissionById(MState.current.id);
  var idx = Math.min(MState.current.step, m.steps.length - 1);
  return '⚔️ ' + m.title + ' · 第 ' + (idx+1) + '/' + m.steps.length + ' 关 · ' + m.steps[idx].name;
}
function missionNextGameId(){
  if(!MState.next) return null;
  var m = getMissionById(MState.next.id);
  return m.steps[MState.next.idx].gid;
}
/* 结果弹层主按钮：任务中 → 下一关 / 通关 → 开宝箱 / 普通 → 回首页 */
function onResultMain(){
  $('ov-result').classList.remove('show');
  if(MState.current && MState.next){
    var m = getMissionById(MState.next.id);
    MState.current.step = MState.next.idx;
    MState.next = null;
    startGame(m.steps[MState.current.step].gid, { missionId: m.id });
  } else if(MState.current && !MState.next){
    showTreasure(getMissionById(MState.current.id));
  } else {
    nav('home');
  }
}
function showTreasure(m){
  var done = m.steps.length;
  missionRecords[m.id] = { doneSteps: done, total: done };
  m.done = true;
  $('tc-sub').textContent = m.title + ' 完成！';
  $('tc-rewards').innerHTML = m.rewards.map(function(r){
    return '<div class="tc-reward"><span class="tr-ico">'+r.icon+'</span><span class="tr-name">'+r.name+'</span><span class="tr-num">+'+r.n+'</span></div>';
  }).join('');
  var starTotal = 0;
  m.rewards.forEach(function(r){ if(r.icon === '⭐') starTotal += r.n; });
  $('tc-stars').textContent = starTotal;
  /* 星星入账动画 */
  var sc = $('star-count');
  var from = parseInt(sc.textContent) || 120;
  var step = 0;
  var tm = setInterval(function(){
    step++;
    sc.textContent = from + Math.round(starTotal * Math.min(step/22,1));
    if(step>=22) clearInterval(tm);
  }, 28);
  showToast('🎉 冒险完成！+'+starTotal+' ⭐');
  MState.current = null; MState.next = null; MState.results = null;
  renderHome();
  closeOverlay('ov-mintro');
  $('ov-treasure').classList.add('show');
  launchConfetti && launchConfetti();
}
function closeTreasure(){
  $('ov-treasure').classList.remove('show');
  renderHome();
  nav('home');
  showToast('🏅 恭喜解锁新冒险徽章！');
}
function closeOverlay(id){
  /* 兼容两种传参：closeOverlay('mlist') 或 closeOverlay('ov-mlist') */
  var el = $(id.indexOf('ov-') === 0 ? id : 'ov-' + id);
  if(el) el.classList.remove('show');
}

/* ============================================================
 * 家长 PIN + 家长中心
 * ============================================================ */
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
  renderRadar();
  renderReadProfile();
  showToast('👨‍👩‍👧 欢迎来到家长中心');
}
function exitParent(){ nav('home'); }

/* ---- 能力雷达（8 维 SVG 八边形） ---- */
function renderRadar(){
  var box = $('radar-box');
  var W = 260, H = 178, cx = W/2, cy = H/2 - 2, R = 58;
  var keys = ABILITIES.map(function(a){ return a.key; });
  var vals = ABILITIES.map(function(a){ return Math.max(4, a.score); });
  var pt = function(i, r){
    var ang = -Math.PI/2 + i * (2*Math.PI/8);
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  };
  var poly = function(r){
    var ps = [];
    for(var i=0;i<8;i++) ps.push(pt(i,r).map(Math.round).join(','));
    return ps.join(' ');
  };
  var axis = '';
  for(var i=0;i<8;i++){
    var e = pt(i, R);
    axis += '<line x1="'+cx+'" y1="'+cy+'" x2="'+e[0].toFixed(1)+'" y2="'+e[1].toFixed(1)+'" stroke="#D9E4EF" stroke-width="1.4"/>';
  }
  var valPts = vals.map(function(v,i){
    var e = pt(i, Math.max(6, R * v/100));
    return e[0].toFixed(1)+','+e[1].toFixed(1);
  }).join(' ');
  var labs = ABILITIES.map(function(a,i){
    var e = pt(i, R + 14);
    return '<text x="'+e[0].toFixed(1)+'" y="'+(e[1]+3.5).toFixed(1)+'" font-size="11" text-anchor="middle" fill="#4A6A8A" font-family="inherit">'+a.name.slice(0,2)+'</text>';
  }).join('');
  box.innerHTML =
    '<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="'+poly(R*0.25)+'" fill="#EDF3F9" stroke="none"/>' +
      '<polygon points="'+poly(R*0.5)+'" fill="#EDF3F9" stroke="none"/>' +
      '<polygon points="'+poly(R*0.75)+'" fill="#EDF3F9" stroke="none"/>' +
      '<polygon points="'+poly(R)+'" fill="#F6FAFD" stroke="#C9D8E8" stroke-width="1.5"/>' +
      axis +
      '<polygon points="'+valPts+'" fill="rgba(74,144,217,.22)" stroke="#4A90D9" stroke-width="2.4" stroke-linejoin="round"/>' +
      vals.map(function(v,i){
        var e = pt(i, Math.max(6, R * v/100));
        return '<circle cx="'+e[0].toFixed(1)+'" cy="'+e[1].toFixed(1)+'" r="3.2" fill="#4A90D9"/>';
      }).join('') + labs +
    '</svg>';
  /* 底部能力条 */
  $('p-ability-lines').innerHTML = ABILITIES.map(function(a){
    var arrow = a.trendCls==='trend-up' ? '▲' : (a.trendCls==='trend-down' ? '▼' : '→');
    return '<div class="ability-line">' +
      '<span class="al-emoji">'+a.icon+'</span>' +
      '<span class="al-name">'+a.name+'</span>' +
      '<span class="al-bar"><i style="width:'+a.score+'%;background:'+a.grad+'"></i></span>' +
      '<span class="al-num">'+a.score+'</span>' +
      '<span class="al-trend '+(a.trendCls==='trend-up'?'trend-up':(a.trendCls==='trend-down'?'trend-down':'trend-stable'))+'">'+arrow+'</span></div>';
  }).join('');
}

/* ---- 阅读多维画像（8 子维度） ---- */
function renderReadProfile(){
  var dims = [
    { name:'听故事理解',  v:82 },{ name:'词语理解', v:70 },
    { name:'句子理解',    v:64 },{ name:'看图理解', v:78 },
    { name:'情节排序',    v:60 },{ name:'寻找线索·因果', v:55 },
    { name:'人物心理',    v:48 },{ name:'隐藏信息推理', v:45 }
  ];
  $('read-panel').innerHTML = dims.map(function(d){
    var full = Math.round(d.v/20);
    var stars = '';
    for(var i=0;i<5;i++) stars += i<full ? '★' : '<span style="color:#D9E4EF">★</span>';
    return '<div class="read-line"><span class="rl-emoji">📖</span>' +
      '<span class="rl-name">'+d.name+'</span>' +
      '<span class="rl-stars">'+stars+'</span>' +
      '<span class="rl-num">'+d.v+'</span></div>';
  }).join('');
}

/* ============================================================
 * 初始化
 * ============================================================ */
function init(){
  state.readLevel = getReadingLevel();
  renderHome();
  renderLearn();
  /* 弹层点背景关闭（任务列表/任务介绍/宝箱） */
  ['mlist','mintro','treasure'].forEach(function(suf){
    var ov = $('ov-'+suf);
    if(!ov) return;
    ov.addEventListener('click', function(ev){
      if(ev.target === ov){ ov.classList.remove('show'); }
    });
  });
}
init();
