/* ============================================================
 * 奇妙脑力岛 · 游戏引擎 (js/games.js) —— V3 融合版
 * 统一生命周期 + 动态难度 + TTS 指令 + 暂停
 * 旧 20 经典引擎保留 + 12 精品新引擎 + 冒险任务联动
 * ============================================================ */

/* ---------- 全局游戏状态 ---------- */
var G = {
  id:null, name:'', icon:'', ability:'',
  rounds:3, round:0, totalStars:0, locked:false,
  opts:{},      // 游戏自定义选项（articleId / missionId / engineKey）
  s:{}          // 每个游戏的自定义状态
};

/* ---------- 工具 ---------- */
function $(id){ return document.getElementById(id); }
function qs(sel){ return document.querySelector(sel); }
function shuffle(arr){
  var a = arr.slice();
  for(var i=a.length-1;i>0;i--){
    var j = Math.floor(Math.random()*(i+1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function randInt(n){ return Math.floor(Math.random()*n); }
function pick(arr){ return arr[randInt(arr.length)]; }

function showFeedback(e){
  var fb = $('game-fb');
  fb.textContent = e;
  fb.classList.remove('show');
  void fb.offsetWidth;
  fb.classList.add('show');
}
function setInst(emoji, text){
  $('gi-emoji').textContent = emoji;
  $('gi-text').textContent = text;
}
function speakGameInst(){ speak($('gi-text').textContent); }

function renderProgress(){
  var p = $('game-progress');
  p.innerHTML = '';
  for(var i=1;i<=G.rounds;i++){
    var d = document.createElement('span');
    d.className = 'gp-dot' + (i < G.round ? ' done' : '');
    d.id = 'gp-'+i;
    p.appendChild(d);
  }
}

/* 正确 / 错误反馈（单次作答型） */
function handleAnswer(correct, el, cb){
  if(G.locked) return;
  G.locked = true;
  if(correct){
    if(el){ el.classList.add('correct'); }
    G.totalStars += 3;
    $('game-stars').textContent = G.totalStars;
    showFeedback('🎉');
    speak(pick(['太棒啦！','好厉害！','你真棒！']));
    setTimeout(cb || nextRoundOrFinish, 900);
  } else {
    if(el){ el.classList.add('wrong'); }
    showFeedback('💭');
    speak('没关系，我们再试一次！');
    setTimeout(function(){ if(el) el.classList.remove('wrong'); G.locked = false; }, 500);
  }
}

function nextRoundOrFinish(){
  if(G.round < G.rounds){ setupRound(); }
  else { finishGame(); }
}

/* ============================================================
 * 启动游戏
 * ============================================================ */
function startGame(id, opts){
  var cfg = GAME_LIST[id];
  if(!cfg) return;
  G.id = id; G.name = cfg.name; G.icon = cfg.icon; G.ability = cfg.ability;
  G.rounds = 3; G.round = 0; G.totalStars = 0; G.locked = false;
  G.opts = opts || {}; G.s = {};
  $('game-title').innerHTML = cfg.icon + ' ' + cfg.name + ' <span style="font-size:13px;color:var(--ink-l)" id="game-round"></span>';
  $('game-stars').textContent = '0';
  $('game-diff-tag').textContent = cfg.diff;
  /* 暂停按钮：story_listen 展示阶段隐藏 */
  qs('.pause-btn').style.display = '';
  /* 冒险任务提示 */
  var mh = $('mission-hint');
  if(G.opts.missionId && typeof missionStepLabel === 'function'){
    mh.style.display = '';
    mh.textContent = missionStepLabel();
  } else {
    mh.style.display = 'none';
  }
  showPage('game');
  $('bottom-nav').classList.add('hidden');
  renderProgress();
  setupRound();
}

function setupRound(){
  G.round++;
  G.locked = false;
  $('game-round').textContent = '第 ' + G.round + ' / ' + G.rounds + ' 关';
  renderProgress();
  var fn = 'setup_' + G.id;
  if(typeof window[fn] === 'function'){ window[fn](); }
}

/* ============================================================
 * 经典 · 专注力
 * ============================================================ */
var ANIMAL_NAME = {'🐱':'小猫','🐶':'小狗','🐦':'小鸟','🐮':'小牛','🐑':'小羊','🦆':'小鸭','🦁':'狮子','🐯':'老虎','🐘':'大象','🐸':'青蛙','🐵':'小猴','🐰':'小兔','🦊':'小狐狸','🐨':'考拉','🐷':'小猪','🐢':'小乌龟'};
var ANIMALS = Object.keys(ANIMAL_NAME);
function setup_find_target(){
  var target = pick(ANIMALS);
  G.s.target = target;
  var count = [6,9,12][Math.min(G.round-1,2)];
  var pool = shuffle(ANIMALS).slice(0,count);
  if(pool.indexOf(target) === -1) pool[randInt(pool.length)] = target;
  pool = shuffle(pool);
  setInst(target, '找到' + ANIMAL_NAME[target] + '！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="grid-tiles gc-4">' + pool.map(function(e,i){
    return '<div class="tile" style="animation-delay:'+(i*0.05)+'s" onclick="onFindTarget(this,\''+e+'\')">'+e+'</div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak('找到' + ANIMAL_NAME[target] + '！'); }, 500);
}
function onFindTarget(el, e){
  if(G.locked) return;
  if(e === G.s.target){ handleAnswer(true, el); }
  else { handleAnswer(false, el); }
}

var DIFF_PAIRS = [['🍎','🍏'],['🐱','🐈'],['🐶','🐕'],['🌕','🌙'],['⚽','🏀'],['🚗','🚕'],['🐰','🐇'],['🍓','🍒'],['☀️','🌤️'],['🦋','🐞'],['🌻','🌷'],['🍩','🍪']];
function setup_find_diff(){
  var pair = pick(DIFF_PAIRS);
  var n = [6,8,9][Math.min(G.round-1,2)];
  var diffIdx = randInt(n);
  var cells = [];
  for(var i=0;i<n;i++) cells.push(i===diffIdx ? pair[1] : pair[0]);
  cells = shuffle(cells);
  setInst('🕵️', '找出不一样的那个！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="grid-tiles gc-4">' + cells.map(function(e,i){
    return '<div class="tile mid" style="animation-delay:'+(i*0.04)+'s" onclick="onFindDiff(this,\''+e+'\',\''+pair[1]+'\')">'+e+'</div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak('找出不一样的那个！'); }, 500);
}
function onFindDiff(el, e, diff){
  if(G.locked) return;
  handleAnswer(e === diff, el);
}

var TRACK_STATE = null;
function setup_visual_track(){
  TRACK_STATE = { ball:0, moves: 1 + G.round, cur:0, playing:false };
  setInst('👀', '看仔细！小星星在哪一个杯子里？');
  renderTrack();
  setTimeout(function(){
    speak('看仔细！小星星要开始跳了！');
    setTimeout(runTrackMoves, 800);
  }, 400);
}
function renderTrack(){
  var area = $('game-stage');
  var html = '<div class="track-area">';
  for(var i=0;i<3;i++){
    var has = (TRACK_STATE.ball === i);
    html += '<div class="track-cup'+(has?' has-ball':'')+'" id="cup-'+i+'" onclick="onPickCup('+i+')">'+
      (has?'<span class="t-ball">⭐</span>':'')+'<span style="font-size:20px;position:relative;top:-14px">🥤</span></div>';
  }
  html += '</div>';
  area.innerHTML = html;
}
function runTrackMoves(){
  if(TRACK_STATE.playing) return;
  TRACK_STATE.playing = true;
  var move = function(){
    if(TRACK_STATE.cur >= TRACK_STATE.moves){
      speak('好了！小星星现在在哪里？');
      TRACK_STATE.playing = false;
      return;
    }
    TRACK_STATE.cur++;
    var other;
    do { other = randInt(3); } while(other === TRACK_STATE.ball);
    var old = TRACK_STATE.ball;
    var c1 = $('cup-'+old), c2 = $('cup-'+other);
    c1.classList.add('reveal'); c2.classList.add('reveal');
    setTimeout(function(){
      c1.classList.remove('has-ball');
      c1.querySelector('.t-ball').remove();
      var ball = document.createElement('span');
      ball.className = 't-ball';
      ball.textContent = '⭐';
      c2.appendChild(ball);
      c2.classList.add('has-ball');
      setTimeout(function(){ c1.classList.remove('reveal'); c2.classList.remove('reveal'); }, 350);
    }, 350);
    TRACK_STATE.ball = other;
    setTimeout(move, 850);
  };
  move();
}
function onPickCup(idx){
  if(TRACK_STATE.playing || G.locked) return;
  var el = $('cup-'+idx);
  var ok = (idx === TRACK_STATE.ball);
  if(ok){ el.classList.add('has-ball'); }
  handleAnswer(ok, el, function(){ setTimeout(nextRoundOrFinish, 200); });
}

var CATEGORIES = [
  { name:'水果', items:['🍎','🍌','🍓','🍇'], decoy:['🚗','⚽','📚','✏️'] },
  { name:'动物', items:['🐱','🐶','🐰','🐮'], decoy:['🍎','🚗','🏠','🌳'] },
  { name:'交通工具', items:['🚗','🚌','🚂','✈️'], decoy:['🍎','🐱','📚','⚽'] },
  { name:'蔬菜', items:['🥕','🍅','🥦','🌽'], decoy:['🚗','🐱','📚','🎈'] }
];
function setup_eliminate_interf(){
  var cat = CATEGORIES[(G.round-1) % CATEGORIES.length];
  G.s.cat = cat;
  G.s.found = 0;
  var cells = shuffle(cat.items.concat(cat.decoy));
  setInst(cat.items[0], '只点「' + cat.name + '」！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="grid-tiles gc-4">' + cells.map(function(e,i){
    var isItem = cat.items.indexOf(e) >= 0;
    return '<div class="tile mid" style="animation-delay:'+(i*0.04)+'s" onclick="onEliminate(this,\''+e+'\','+isItem+')">'+e+'</div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak('只点「' + cat.name + '」！'); }, 500);
}
function onEliminate(el, e, isItem){
  if(G.locked) return;
  if(isItem && el.classList.contains('dim')) return;
  if(isItem){
    el.classList.add('dim');
    G.s.found++;
    showFeedback('✅');
    if(G.s.found >= 4){
      G.locked = true;
      G.totalStars += 4;
      $('game-stars').textContent = G.totalStars;
      speak('太棒啦！都找对了！');
      setTimeout(nextRoundOrFinish, 900);
    }
  } else {
    if(el.classList.contains('wrong')) return;
    el.classList.add('wrong');
    setTimeout(function(){ el.classList.remove('wrong'); }, 500);
    showFeedback('💭');
    speak('这个不是'+G.s.cat.name+'哦，再找找！');
  }
}

var SOUND_ANIMALS = [
  { e:'🐱', n:'小猫', s:'喵~ 喵~ 喵~' },
  { e:'🐶', n:'小狗', s:'汪汪汪！汪汪汪！' },
  { e:'🐮', n:'小牛', s:'哞—— 哞——' },
  { e:'🐑', n:'小羊', s:'咩~ 咩~ 咩~' },
  { e:'🦆', n:'小鸭', s:'嘎嘎嘎！嘎嘎嘎！' },
  { e:'🐦', n:'小鸟', s:'叽叽喳喳！叽叽喳喳！' },
  { e:'🦁', n:'狮子', s:'嗷呜——！' },
  { e:'🐸', n:'青蛙', s:'呱呱呱！呱呱呱！' }
];
function setup_auditory_att(){
  var pool = shuffle(SOUND_ANIMALS).slice(0,4);
  var target = pool[randInt(4)];
  G.s.soundTarget = target;
  setInst('👂', '仔细听！这是谁的声音？');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="grid-tiles gc-4" style="grid-template-columns:repeat(2,1fr)">' + pool.map(function(a,i){
    return '<div class="tile" style="animation-delay:'+(i*0.05)+'s" onclick="onSoundPick(this,\''+a.e+'\')">'+a.e+'<span class="t-label">'+a.n+'</span></div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak('听一听，这是谁的声音？' + G.s.soundTarget.s + ' 猜猜我是谁？'); }, 600);
}
function onSoundPick(el, e){
  if(G.locked) return;
  handleAnswer(e === G.s.soundTarget.e, el);
}

/* ============================================================
 * 经典 · 记忆力
 * ============================================================ */
var FLIP_EMOJIS = ['🐱','🐶','🐰','🦊','🐼','🐸','🐨','🐵','🐷','🦄'];
function setup_card_flip(){
  var pairs = [3,4,5][Math.min(G.round-1,2)];
  var chosen = shuffle(FLIP_EMOJIS).slice(0,pairs);
  var deck = shuffle(chosen.concat(chosen));
  G.s.flip = { pairs:pairs, matched:0, first:null, busy:false };
  setInst('🃏', '翻开卡片，找到一样的配对！');
  var grid = $('game-stage');
  var cols = pairs >= 5 ? 'gc-4' : (pairs===4 ? 'gc-4' : 'gc-3');
  grid.innerHTML = '<div class="grid-tiles '+cols+'">' + deck.map(function(e,i){
    return '<div class="flip-card" id="fc-'+i+'" onclick="onFlipCard(this,'+i+',\''+e+'\')">'+
      '<div class="fc-inner"><div class="fc-face fc-back">❓</div><div class="fc-face fc-front">'+e+'</div></div></div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak('翻开卡片，找到一样的配对！'); }, 500);
}
function onFlipCard(el, idx, e){
  var st = G.s.flip;
  if(st.busy || el.classList.contains('flipped') || el.classList.contains('matched')) return;
  el.classList.add('flipped');
  if(st.first === null){
    st.first = { el:el, e:e };
  } else {
    st.busy = true;
    var f = st.first;
    st.first = null;
    if(f.e === e){
      setTimeout(function(){
        el.classList.add('matched'); f.el.classList.add('matched');
        st.matched++; st.busy = false;
        showFeedback('🎉');
        if(st.matched >= st.pairs){
          G.locked = true;
          G.totalStars += st.pairs * 2;
          $('game-stars').textContent = G.totalStars;
          speak('全部配对成功！');
          setTimeout(nextRoundOrFinish, 900);
        }
      }, 350);
    } else {
      setTimeout(function(){
        el.classList.remove('flipped'); f.el.classList.remove('flipped');
        st.busy = false;
        showFeedback('💭');
        speak('不一样哦，再试一次！');
      }, 800);
    }
  }
}

var SEQ_POOL = [['🐶','🍎','🚗'],['⭐','🌙','🌈'],['🚗','⚽','🎈'],['🐱','🐟','🍰'],['🔵','🔺','🔴']];
function setup_seq_memory(){
  var seq = SEQ_POOL[(G.round-1) % SEQ_POOL.length].concat([pick(['🐰','🍓','🚌','🎁','🐻'])]);
  var len = [3,4,5][Math.min(G.round-1,2)];
  seq = seq.slice(0,len);
  G.s.seq = seq;
  G.s.qIdx = randInt(len);
  setInst('🔢', '记住它们出现的顺序！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="seq-track" id="seq-track">' + seq.map(function(e){
    return '<div class="seq-box">'+e+'</div>';
  }).join('') + '</div><div class="quiz-options" id="seq-opts" style="display:none"></div>';
  var boxes = grid.querySelectorAll('.seq-box');
  seq.forEach(function(e,i){
    setTimeout(function(){
      boxes[i].classList.add('lit');
      speak(seq[i].length > 2 ? (['第一个','第二个','第三个','第四个','第五个'][i]+'，'+seq[i]) : seq[i]);
    }, 500 + i*900);
  });
  setTimeout(function(){
    boxes.forEach(function(b){ b.classList.add('hide'); b.textContent = '❓'; });
    speak('第'+(['一','二','三','四','五'][G.s.qIdx])+'个是什么？');
    renderSeqOptions();
  }, 500 + seq.length*900 + 400);
}
function renderSeqOptions(){
  var optsBox = $('seq-opts');
  optsBox.style.display = '';
  var correct = G.s.seq[G.s.qIdx];
  var all = ['🍎','🚗','⚽','🎈','🐱','⭐','🌙','🌈','🐟','🍰','🚌','🎁','🌻','🐶','🍓','🔺'];
  var decoys = shuffle(all.filter(function(e){ return e !== correct; })).slice(0,3);
  var opts = shuffle([correct].concat(decoys));
  optsBox.innerHTML = opts.map(function(e){
    return '<div class="q-opt" onclick="onSeqPick(this,\''+e+'\')"><span class="qo-emoji">'+e+'</span></div>';
  }).join('');
}
function onSeqPick(el, e){
  if(G.locked) return;
  handleAnswer(e === G.s.seq[G.s.qIdx], el);
}

var PIC_POOL = ['🐱','🍎','🚗','⭐','🌙','🌈','🐟','🎈','🍰','🚌','🎁','🌻','🐶','⚽'];
function setup_pic_memory(){
  var n = [3,4,5][Math.min(G.round-1,2)];
  var shown = shuffle(PIC_POOL).slice(0,n);
  var target = shown[randInt(n)];
  G.s.picTarget = target;
  setInst('🖼️', '看仔细！记住这些图案！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="grid-tiles gc-4">' + shown.map(function(e,i){
    return '<div class="tile mid" style="animation-delay:'+(i*0.06)+'s">'+e+'</div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak('记住这些图案，等会要考考你！'); }, 500);
  setTimeout(function(){
    var decoys = shuffle(PIC_POOL.filter(function(e){ return e !== target; })).slice(0,3);
    var opts = shuffle([target].concat(decoys));
    setInst('❓', '刚才哪个图案出现过？');
    grid.innerHTML = '<div class="grid-tiles gc-4" style="grid-template-columns:repeat(2,1fr)">' + opts.map(function(e){
      return '<div class="tile mid" onclick="onPicPick(this,\''+e+'\')">'+e+'</div>';
    }).join('') + '</div>';
    setTimeout(function(){ speak('刚才哪个图案出现过？'); }, 400);
  }, 2600 + n*500);
}
function onPicPick(el, e){
  if(G.locked) return;
  handleAnswer(e === G.s.picTarget, el);
}

var POS_ITEMS = ['🐱','🍎','⭐','🚗','🐰'];
function setup_pos_memory(){
  var n = [1,2,3][Math.min(G.round-1,2)];
  var items = POS_ITEMS.slice(0,n);
  var targetIdx = randInt(n);
  G.s.posItems = items;
  G.s.posTarget = items[targetIdx];
  var cells = new Array(9).fill('');
  var used = [];
  while(used.length < n){
    var p = randInt(9);
    if(used.indexOf(p) === -1) used.push(p);
  }
  used.forEach(function(p,i){ cells[p] = items[i]; });
  G.s.posCells = cells.slice();
  setInst('🗺️', '记住每样东西放在哪里！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="grid-tiles gc-3">' + cells.map(function(e){
    return '<div class="tile mid">' + (e || '') + '</div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak('记住每样东西放在哪里！'); }, 500);
  setTimeout(function(){
    setInst('❓', G.s.posTarget + ' 刚才在哪里？');
    grid.innerHTML = '<div class="grid-tiles gc-3">' + cells.map(function(e,i){
      return '<div class="tile mid" onclick="onPosPick(this,'+i+')">' + (e ? '<span style="opacity:.25">'+e+'</span>' : '') + '</div>';
    }).join('') + '</div>';
    setTimeout(function(){ speak(G.s.posTarget + ' 刚才在哪里？点一点！'); }, 400);
  }, 2500 + n*400);
}
function onPosPick(el, idx){
  if(G.locked) return;
  var correct = (G.s.posCells[idx] === G.s.posTarget);
  if(correct){ el.textContent = G.s.posTarget; }
  handleAnswer(correct, el);
}

function setup_story_memory(){
  var articles = getReadingArticles('A', null);
  var art = articles[(G.round-1) % articles.length];
  G.s.memArticle = art;
  setInst('🎬', '仔细听故事，等会要回答问题！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="story-view"><span class="sv-badge aico-rea">Level A · 故事记忆</span>' +
    '<div class="sv-title">📖 ' + art.title + '</div>' +
    '<div class="sv-text">' + art.text + '</div>' +
    '<div class="sv-audio"><button class="big-btn btn-sky" style="font-size:15px;padding:10px 18px" onclick="speak(\'' + art.text.replace(/\n/g,'，') + '\')">🔊 再听一遍</button></div>' +
    '<button class="big-btn btn-orange sv-btn" onclick="renderMemQuiz()">🎯 开始答题</button></div>';
  setTimeout(function(){ speak(art.title + '。' + art.text.replace(/\n/g,'，')); }, 500);
}
function renderMemQuiz(){
  var art = G.s.memArticle;
  var q = art.questions[randInt(art.questions.length)];
  G.s.memQ = q;
  var grid = $('game-stage');
  grid.innerHTML = '<div class="quiz-options">' + q.opts.map(function(o){
    return '<div class="q-opt" onclick="onMemPick(this,\''+o+'\')"><span class="qo-emoji">🔸</span>'+o+'</div>';
  }).join('') + '</div>';
  setInst('❓', q.q);
  setTimeout(function(){ speak(q.q); }, 400);
}
function onMemPick(el, o){
  if(G.locked) return;
  handleAnswer(o === G.s.memQ.a, el);
}

/* ============================================================
 * 经典 · 逻辑力
 * ============================================================ */
function setup_categorize(){
  var cat = CATEGORIES[(G.round-1) % CATEGORIES.length];
  G.s.cat = cat;
  G.s.found = 0;
  var cells = shuffle(cat.items.concat(cat.decoy));
  setInst('🗂️', '把「' + cat.name + '」都放进篮子！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="grid-tiles gc-4">' + cells.map(function(e,i){
    var isItem = cat.items.indexOf(e) >= 0;
    return '<div class="tile mid" style="animation-delay:'+(i*0.04)+'s" onclick="onCategorize(this,\''+e+'\','+isItem+')">'+e+'</div>';
  }).join('') + '</div>' +
  '<div class="task-card card" style="margin-top:12px;padding:10px 14px"><div class="t-ico" style="font-size:26px;padding:6px">🧺</div><div class="t-body"><div class="t-title" style="font-size:14px">篮子</div><div class="t-num" id="basket-count">已放入 0 / 4 个</div></div></div>';
  setTimeout(function(){ speak('把「' + cat.name + '」都放进篮子！'); }, 500);
}
function onCategorize(el, e, isItem){
  if(G.locked) return;
  if(isItem && el.classList.contains('dim')) return;
  if(isItem){
    el.classList.add('dim');
    G.s.found++;
    $('basket-count').textContent = '已放入 ' + G.s.found + ' / 4 个';
    showFeedback('✅');
    if(G.s.found >= 4){
      G.locked = true;
      G.totalStars += 4;
      $('game-stars').textContent = G.totalStars;
      speak('太棒啦！全都放对了！');
      setTimeout(nextRoundOrFinish, 900);
    }
  } else {
    if(el.classList.contains('wrong')) return;
    el.classList.add('wrong');
    setTimeout(function(){ el.classList.remove('wrong'); }, 500);
    showFeedback('💭');
    speak('这个不是'+G.s.cat.name+'哦！');
  }
}

var ORDER_POOL = [
  { e:'🐜', n:'蚂蚁', s:1 },{ e:'🐭', n:'小老鼠', s:2 },{ e:'🐰', n:'小兔', s:3 },
  { e:'🐕', n:'小狗', s:4 },{ e:'🐘', n:'大象', s:5 },{ e:'🐳', n:'鲸鱼', s:6 }
];
function setup_order_by(){
  var n = [3,4,5][Math.min(G.round-1,2)];
  var items = shuffle(ORDER_POOL).slice(0,n);
  G.s.order = items; G.s.orderStep = 0;
  setInst('📏', '从小到大，把它们一个个排好！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="order-options">' + shuffle(items).map(function(it){
    return '<div class="order-opt" id="ord-'+it.e+'" onclick="onOrderPick(this,\''+it.e+'\')"><span class="oo-emoji">'+it.e+'</span><span>'+it.n+'</span><span class="oo-idx">?</span></div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak('从小到大排好！先点最小的！'); }, 500);
}
function onOrderPick(el, e){
  if(G.locked) return;
  var it = null;
  G.s.order.forEach(function(o){ if(o.e === e) it = o; });
  if(!it) return;
  if(el.classList.contains('done')) return;
  var expected = G.s.order[G.s.orderStep];
  if(it.s === expected.s){
    el.classList.add('done');
    el.querySelector('.oo-idx').textContent = (G.s.orderStep+1);
    G.s.orderStep++;
    if(G.s.orderStep >= G.s.order.length){
      G.locked = true;
      G.totalStars += G.s.order.length * 2;
      $('game-stars').textContent = G.totalStars;
      showFeedback('🎉');
      speak('排好队啦，真棒！');
      setTimeout(nextRoundOrFinish, 900);
    }
  } else {
    if(el.classList.contains('wrong')) return;
    el.classList.add('wrong');
    setTimeout(function(){ el.classList.remove('wrong'); }, 500);
    showFeedback('💭');
    speak('再想想，最小的还没排哦！');
  }
}

var PATTERNS = [
  { seq:['🔴','🔵','🔴','🔵'], ans:'🔴', opts:['🔴','🔵','🟢','🟡'] },
  { seq:['🍎','🍌','🍎','🍌'], ans:'🍎', opts:['🍎','🍌','🍇','🍊'] },
  { seq:['▲','▲','●','▲','▲'], ans:'●', opts:['▲','●','■','★'] },
  { seq:['🟩','🟨','🟥','🟩','🟨'], ans:'🟥', opts:['🟥','🟩','🟨','🟦'] },
  { seq:['1','2','3','1','2'], ans:'3', opts:['3','1','2','4'] },
  { seq:['🌙','⭐','🌙','⭐'], ans:'🌙', opts:['🌙','⭐','☀️','🌈'] }
];
function setup_pattern(){
  var p = PATTERNS[(G.round-1) % PATTERNS.length];
  G.s.pattern = p;
  setInst('🔤', '看一看，下一个是什么？');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="seq-track">' + p.seq.map(function(e){
    return '<div class="seq-box">'+e+'</div>';
  }).join('') + '<div class="seq-box" style="background:#FFF3D6;border-color:#FFD166">❓</div></div>' +
  '<div class="quiz-options">' + p.opts.map(function(o){
    return '<div class="q-opt" onclick="onPatternPick(this,\''+o+'\')"><span class="qo-emoji">'+o+'</span></div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak('看一看规律，下一个是什么？'); }, 500);
}
function onPatternPick(el, o){
  if(G.locked) return;
  handleAnswer(o === G.s.pattern.ans, el);
}

var SHAPE_PATTERNS = [
  { seq:['🔺','🔵','🔺','🔵'], ans:'🔺', opts:['🔺','🔵','🔶','🔷'] },
  { seq:['⬛','⬜','⬛','⬜'], ans:'⬛', opts:['⬛','⬜','🟫','🟪'] },
  { seq:['⭐','⭐','🌙','⭐','⭐'], ans:'🌙', opts:['🌙','⭐','☁️','✨'] },
  { seq:['🟣','🟣','🟢','🟣','🟣'], ans:'🟢', opts:['🟢','🟣','🔵','🔴'] },
  { seq:['🔷','🔷','🔶','🔷','🔷'], ans:'🔶', opts:['🔶','🔷','🔺','🔴'] },
  { seq:['🟥','🟦','🟥','🟦'], ans:'🟥', opts:['🟥','🟦','🟨','🟩'] }
];
function setup_shape_reason(){
  var p = SHAPE_PATTERNS[(G.round-1) % SHAPE_PATTERNS.length];
  G.s.pattern = p;
  setInst('🔷', '图形在按规律跳舞，下一个是谁？');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="seq-track">' + p.seq.map(function(e){
    return '<div class="seq-box">'+e+'</div>';
  }).join('') + '<div class="seq-box" style="background:#FFF3D6;border-color:#FFD166">❓</div></div>' +
  '<div class="quiz-options">' + p.opts.map(function(o){
    return '<div class="q-opt" onclick="onPatternPick(this,\''+o+'\')"><span class="qo-emoji">'+o+'</span></div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak('图形在跳舞，下一个是谁？'); }, 500);
}

var CONDITIONAL_QUIZ = [
  { text:'小兔比小猫高，小猫比小狗高。', q:'谁最高？', a:'小兔', e:'🐰', opts:[{e:'🐰',t:'小兔'},{e:'🐱',t:'小猫'},{e:'🐶',t:'小狗'}] },
  { text:'长颈鹿比大象高，大象比河马高。', q:'谁最高？', a:'长颈鹿', e:'🦒', opts:[{e:'🦒',t:'长颈鹿'},{e:'🐘',t:'大象'},{e:'🦛',t:'河马'}] },
  { text:'小猴跑得比小鸭快，小鸭跑得比乌龟快。', q:'谁跑得最快？', a:'小猴', e:'🐵', opts:[{e:'🐵',t:'小猴'},{e:'🦆',t:'小鸭'},{e:'🐢',t:'乌龟'}] },
  { text:'苹果比橘子重，橘子比葡萄重。', q:'谁最重？', a:'苹果', e:'🍎', opts:[{e:'🍎',t:'苹果'},{e:'🍊',t:'橘子'},{e:'🍇',t:'葡萄'}] },
  { text:'小熊排在前面，小兔排在小熊后面，小猫排在小兔后面。', q:'谁在最前面？', a:'小熊', e:'🐻', opts:[{e:'🐻',t:'小熊'},{e:'🐰',t:'小兔'},{e:'🐱',t:'小猫'}] }
];
function setup_conditional(){
  var q = CONDITIONAL_QUIZ[(G.round-1) % CONDITIONAL_QUIZ.length];
  G.s.condQ = q;
  setInst('⚖️', '比一比，想一想！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="story-view" style="margin:0"><div class="sv-text" style="font-size:17px">' + q.text + '</div></div>' +
  '<div class="quiz-options">' + q.opts.map(function(o){
    return '<div class="q-opt" onclick="onCondPick(this,\''+o.t+'\')"><span class="qo-emoji">'+o.e+'</span>'+o.t+'</div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak(q.text + ' ' + q.q); }, 500);
}
function onCondPick(el, t){
  if(G.locked) return;
  handleAnswer(t === G.s.condQ.a, el);
}

/* ============================================================
 * 经典 · 阅读引擎（读文/听/排序/人物/因果）
 * ============================================================ */
function getArticleForRound(){
  var level = (typeof state !== 'undefined' && state.readLevel) ? state.readLevel : 'B';
  if(G.opts.articleId && G.round === 1){
    var pre = getArticleById(G.opts.articleId);
    if(pre.level === level){
      G.s.used = [pre.id];
      return pre;
    }
  }
  var arts = getReadingArticles(level, null);
  var used = G.s.used || [];
  var fresh = arts.filter(function(a){ return used.indexOf(a.id) === -1; });
  var pool = fresh.length ? fresh : arts;
  var art = pool[(G.round-1) % pool.length];
  G.s.used = (G.s.used || []).concat([art.id]);
  return art;
}

function setup_story_quiz(){
  var art = getArticleForRound();
  G.s.art = art;
  setInst('📖', '先读一读，再回答问题！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="story-view"><span class="sv-badge aico-rea">'+art.level+' 级 · 读文答题</span>' +
    '<div class="sv-title">📖 ' + art.title + '</div>' +
    '<div class="sv-text">' + art.text + '</div>' +
    '<button class="big-btn btn-orange sv-btn" onclick="renderQuizForArticle()">🎯 开始答题</button></div>';
  setTimeout(function(){ speak('请读一读《'+art.title+'》'); }, 500);
}
function renderQuizForArticle(){
  var art = G.s.art;
  var q = art.questions[Math.min((G.round-1) % art.questions.length, art.questions.length-1)];
  G.s.artQ = q;
  setInst('❓', q.q);
  var grid = $('game-stage');
  grid.innerHTML = '<div class="quiz-options">' + q.opts.map(function(o){
    return '<div class="q-opt" onclick="onArtPick(this,\''+o.replace(/'/g,'')+'\')"><span class="qo-emoji">🔸</span>'+o+'</div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak(q.q); }, 400);
}
function onArtPick(el, o){
  if(G.locked) return;
  handleAnswer(o === G.s.artQ.a, el);
}

function setup_story_listen(){
  var art = getArticleForRound();
  G.s.art = art;
  setInst('🔊', '竖起小耳朵，听故事！');
  qs('.pause-btn').style.display = 'none';
  var grid = $('game-stage');
  grid.innerHTML = '<div class="story-view"><span class="sv-badge aico-mem">'+art.level+' 级 · 听故事</span>' +
    '<div class="sv-title">🔊 ' + art.title + '</div>' +
    '<div class="sv-text">' + art.text + '</div>' +
    '<div class="sv-audio"><button class="big-btn btn-sky" style="font-size:15px;padding:10px 18px" onclick="speak(\'' + art.text.replace(/\n/g,'，') + '\')">🔊 再听一遍</button></div>' +
    '<button class="big-btn btn-orange sv-btn" onclick="renderListenQuiz()">🎯 听完啦，开始答题</button></div>';
  setTimeout(function(){
    speak(art.title + '。' + art.text.replace(/\n/g,'，'));
  }, 500);
}
function renderListenQuiz(){
  qs('.pause-btn').style.display = '';
  renderQuizForArticle();
}

function splitSentences(art){
  var text = art.text.replace(/\n/g,'。');
  var parts = text.split('。').filter(function(s){ return s.trim().length > 0; });
  return parts.slice(0,4).map(function(s){ return s + '。'; });
}
/* 通用排序玩法（经典 story_sequence / 精品 reading_sequence 共用） */
function renderSentenceOrder(art, badgeTxt, emoji, voice){
  var sents = splitSentences(art);
  if(sents.length < 3){ sents = ['小猫去河边钓鱼。','河水清清的。','小猫钓到一条大鱼。']; }
  G.s.sents = sents;
  G.s.sentStep = 0;
  setInst(emoji, voice || '按故事顺序，先点第一句！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="story-view" style="margin:0 0 10px"><span class="sv-badge aico-log">'+art.level+' 级 · '+badgeTxt+'</span><div class="sv-title">📖 ' + art.title + '</div></div>' +
  '<div class="order-options">' + shuffle(sents).map(function(s,i){
    return '<div class="order-opt" id="st-'+i+'" onclick="onSeqSent(this,'+i+')"><span class="oo-emoji">📄</span><span style="flex:1;font-size:14px">'+s+'</span><span class="oo-idx">?</span></div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak(voice || '把句子按故事顺序排好！先点第一句！'); }, 500);
}
function setup_story_sequence(){
  renderSentenceOrder(getArticleForRound(), '故事排序', '🔢');
}
function onSeqSent(el, i){
  if(G.locked) return;
  if(el.classList.contains('done')) return;
  var sent = G.s.sents[G.s.sentStep];
  if(el.textContent.indexOf(sent) >= 0 || el.textContent === sent){
    el.classList.add('done');
    el.querySelector('.oo-idx').textContent = (G.s.sentStep+1);
    G.s.sentStep++;
    if(G.s.sentStep >= G.s.sents.length){
      G.locked = true;
      G.totalStars += G.s.sents.length * 2;
      $('game-stars').textContent = G.totalStars;
      showFeedback('🎉');
      speak('故事排好啦，真棒！');
      setTimeout(nextRoundOrFinish, 900);
    } else {
      speak('对！下一句呢？');
    }
  } else {
    if(el.classList.contains('wrong')) return;
    el.classList.add('wrong');
    setTimeout(function(){ el.classList.remove('wrong'); }, 500);
    showFeedback('💭');
    speak('再想想，这一句应该在哪里？');
  }
}

var CHARACTER_QUIZ = [
  { text:'小猫去河边钓鱼，钓到一条大鱼。', q:'谁钓到了大鱼？', a:'小猫', opts:['小猫','小狗','小兔'] },
  { text:'小兔自己穿衣服，妈妈夸她真能干。', q:'谁自己穿衣服？', a:'小兔', opts:['小兔','妈妈','小熊'] },
  { text:'小熊拿着红色气球来到公园。', q:'谁拿着气球？', a:'小熊', opts:['小熊','小猫','小鸭'] },
  { text:'小鹿不小心把积木推倒了。', q:'谁把积木推倒了？', a:'小鹿', opts:['小鹿','小羊','小猫'] },
  { text:'鸭妈妈教小鸭学游泳。', q:'谁教小鸭游泳？', a:'鸭妈妈', opts:['鸭妈妈','小兔','小鸭'] },
  { text:'大象值日时擦黑板、摆桌子、扫地。', q:'谁在值日？', a:'大象', opts:['大象','小猫','小猴'] },
  { text:'小蜜蜂跳圆圈舞，告诉同伴花蜜在哪里。', q:'谁在跳舞？', a:'小蜜蜂', opts:['小蜜蜂','蝴蝶','蚂蚁'] }
];
function setup_story_character(){
  var q = CHARACTER_QUIZ[(G.round-1) % CHARACTER_QUIZ.length];
  G.s.charQ = q;
  setInst('👤', '读一读，谁做了什么？');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="story-view" style="margin:0 0 10px"><span class="sv-badge aico-rea">人物判断</span><div class="sv-text" style="font-size:17px">' + q.text + '</div></div>' +
  '<div class="quiz-options">' + q.opts.map(function(o){
    return '<div class="q-opt" onclick="onCharPick(this,\''+o+'\')"><span class="qo-emoji">👤</span>'+o+'</div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak(q.text + ' ' + q.q); }, 500);
}
function onCharPick(el, o){
  if(G.locked) return;
  handleAnswer(o === G.s.charQ.a, el);
}

var CAUSE_QUIZ = [
  { text:'小熊没有带雨伞就出门，后来下雨了。', q:'小熊为什么被雨淋湿？', a:'因为他没带雨伞', opts:['因为他没带雨伞','因为雨太大了','因为他跑得慢'] },
  { text:'小鸭试了试，发现游泳一点也不难。', q:'小鸭为什么不怕游泳了？', a:'因为它试了试发现不难', opts:['因为它试了试发现不难','因为水很浅','因为别人教的'] },
  { text:'小羊主动说了对不起，两个人又一起搭城堡。', q:'他们为什么又一起玩了？', a:'因为小羊道歉了', opts:['因为小羊道歉了','因为积木多','因为没人玩'] },
  { text:'小蜜蜂跳圆圈舞，同伴们很快找到了花。', q:'同伴们为什么能找到花？', a:'因为小蜜蜂跳了圆圈舞', opts:['因为小蜜蜂跳了圆圈舞','因为花很大','因为风吹的'] },
  { text:'小熊用镜子的反光发信号，终于得救了。', q:'小熊为什么能得救？', a:'因为他用镜子发信号', opts:['因为他用镜子发信号','因为他很会游泳','因为船自己来了'] },
  { text:'小狐狸用手挡住光，墙上出现了小鸟的影子。', q:'为什么墙上会有影子？', a:'因为光被手挡住了', opts:['因为光被手挡住了','因为墙上画的','因为天黑了'] }
];
function setup_story_cause(){
  var q = CAUSE_QUIZ[(G.round-1) % CAUSE_QUIZ.length];
  G.s.causeQ = q;
  setInst('🔗', '想一想，为什么会这样？');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="story-view" style="margin:0 0 10px"><span class="sv-badge aico-log">因果推理</span><div class="sv-text" style="font-size:17px">' + q.text + '</div></div>' +
  '<div class="quiz-options">' + q.opts.map(function(o){
    return '<div class="q-opt" onclick="onCausePick(this,\''+o.replace(/'/g,'')+'\')"><span class="qo-emoji">🔗</span>'+o+'</div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak(q.text + ' ' + q.q); }, 500);
}
function onCausePick(el, o){
  if(G.locked) return;
  handleAnswer(o === G.s.causeQ.a, el);
}

/* ============================================================
 * 精品 · 注意力雷达（找出会动的小兔子）
 * ============================================================ */
var RADAR_DECOY = ['🍎','⭐','🌙','⚽','🎈','🍓','🚗','🌈','🚀','🐟','🍪','🔔'];
function setup_attention_radar(){
  var total = [9,12,16][Math.min(G.round-1,2)];
  var moving = [3,4,5][Math.min(G.round-1,2)];
  var idxs = [];
  while(idxs.length < moving){ var p = randInt(total); if(idxs.indexOf(p)===-1) idxs.push(p); }
  var cells = [];
  for(var i=0;i<total;i++){
    cells.push(idxs.indexOf(i) >= 0
      ? { e:'🐰', mv:true }
      : { e: RADAR_DECOY[i % RADAR_DECOY.length], mv:false });
  }
  cells = shuffle(cells);
  G.s.radar = { total:moving, found:0 };
  setInst('📡', '找出所有会动的🐰小兔子！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="grid-tiles gc-4">' + cells.map(function(c,i){
    if(c.mv){
      var mvT = (2.2 + (i % 4) * 0.7) + 's';
      return '<div class="tile mv" style="--mvT:'+mvT+';animation-delay:'+(i*0.04)+'s" onclick="onRadarPick(this,true)">'+c.e+'</div>';
    }
    return '<div class="tile still" style="animation-delay:'+(i*0.04)+'s" onclick="onRadarPick(this,false)">'+c.e+'</div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak('找出所有会动的小兔子！只有动着的才算哦！'); }, 500);
}
function onRadarPick(el, isMoving){
  if(G.locked) return;
  if(el.classList.contains('dim')) return;
  if(isMoving){
    el.classList.add('dim');
    G.s.radar.found++;
    showFeedback('✅');
    if(G.s.radar.found >= G.s.radar.total){
      G.locked = true;
      G.totalStars += G.s.radar.total * 2;
      $('game-stars').textContent = G.totalStars;
      speak('雷达扫描完成，小兔子都找到啦！');
      setTimeout(nextRoundOrFinish, 900);
    }
  } else {
    if(el.classList.contains('wrong')) return;
    el.classList.add('wrong');
    setTimeout(function(){ el.classList.remove('wrong'); }, 500);
    showFeedback('💭');
    speak('它不会动哦，要找动着的🐰！');
  }
}

/* ============================================================
 * 精品 · 禁止点击（绿点红不点）
 * ============================================================ */
var INH_STIM = ['✅','⛔'];
function resetInhibitionRound(){
  var st = G.s.inh;
  var len = [6,8,9][Math.min(G.round-1,2)];
  var list = [];
  var prevStop = 0;
  for(var i=0;i<len;i++){
    var stop = false;
    if(prevStop >= 2){ stop = false; }
    else { stop = Math.random() < 0.38; }
    if(stop) prevStop++; else prevStop = 0;
    list.push(stop ? '⛔' : '✅');
  }
  st.list = list; st.i = -1; st.okHit = 0; st.okMiss = 0; st.stopAvoid = 0; st.stopHit = 0;
  setInst('🚦', '看到绿色✅就点它！看到红色⛔千万别点！');
  speak('记住啦：绿色点它，红色不能点！');
  renderInhibitionHud(st);
  scheduleNextInhibition();
}
function scheduleNextInhibition(){
  var st = G.s.inh;
  st.i++;
  if(st.i >= st.list.length){ endInhibitionRound(); return; }
  renderInhibitionStim(st.list[st.i]);
  st.window = setInhibitionTimer(st);
}
function setInhibitionTimer(st){
  var span = [1500,1150,950][Math.min(G.round-1,2)];
  var t0 = Date.now();
  var bar = $('inh-timer');
  var tick = function(){
    if(!st || !st.running) return;
    var left = Math.max(0, 1 - (Date.now()-t0)/span);
    if(bar) bar.style.width = (left*100) + '%';
    if(left <= 0){
      clearInterval(st._iv);
      var cur = st.list[st.i];
      if(cur === '✅'){ st.okMiss++; }
      else { st.stopAvoid++; speak('没点，真棒！'); }
      showFeedback(cur==='✅' ? '😅' : '👍');
      setTimeout(scheduleNextInhibition, 420);
    }
  };
  clearInterval(st._iv);
  st._iv = setInterval(tick, 60);
  tick();
}
function renderInhibitionStim(type){
  var zone = $('game-stage');
  zone.innerHTML = '<div class="stim-zone">' +
    '<div class="stim '+(type==='✅'?'ok':'stop')+'" id="inh-stim" onclick="onInhibitionTap(this,\''+type+'\')">'+
      (type==='✅'?'👆':'✋')+
    '</div>' +
    '<div class="stim-timer"><i id="inh-timer" style="width:100%"></i></div>' +
    '<div id="inh-hud" style="display:flex;gap:10px;align-items:center"></div></div>';
  var msg = type==='✅' ? '点它！' : '不能点！';
  speak(type==='✅' ? pick(['快点点它！','拍一下绿色！']) : pick(['不能点！停手！','红色不能碰哦！']));
  G.s.inh.running = true;
  setTimeout(function(){
    if(type==='✅' && G.s.inh && G.s.inh.running && !G.s.inh.answered){
      G.s.inh.answered = true;
    }
  }, 150);
}
function onInhibitionTap(el, type){
  var st = G.s.inh;
  if(!st || !st.running) return;
  if(st.answered) return;
  st.answered = true;
  clearInterval(st._iv);
  if(type === '✅'){
    st.okHit++;
    el.classList.add('correct');
    showFeedback('🎉');
    speak('真快！');
    G.totalStars += 2;
    $('game-stars').textContent = G.totalStars;
  } else {
    st.stopHit++;
    el.classList.add('wrong');
    showFeedback('💥');
    speak('哎呀，红色不能点！');
  }
  renderInhibitionHud(st);
  setTimeout(scheduleNextInhibition, 650);
}
function renderInhibitionHud(st){
  var hud = $('inh-hud');
  if(!hud) return;
  hud.innerHTML =
    '<span style="font-size:11px;background:#D9FBE3;color:#14532d;border-radius:999px;padding:3px 9px">✅ 点中 '+st.okHit+'</span>' +
    '<span style="font-size:11px;background:#FFE3E8;color:#7A2035;border-radius:999px;padding:3px 9px">⛔ 忍住 '+st.stopAvoid+'</span>';
}
function endInhibitionRound(){
  var st = G.s.inh;
  st.running = false;
  clearInterval(st._iv);
  var bonus = st.stopAvoid * 2 + st.okHit;
  G.totalStars += st.stopAvoid * 2;
  $('game-stars').textContent = G.totalStars;
  G.locked = true;
  speak('这一轮完成！红灯你都忍住啦，太厉害了！');
  showFeedback('🎉');
  setTimeout(nextRoundOrFinish, 1000);
}
function setup_attention_inhibition(){
  G.s.inh = { running:false, answered:false, _iv:null };
  resetInhibitionRound();
}

/* ============================================================
 * 精品 · 记忆闪卡（找出现过两次的图案）
 * ============================================================ */
function setup_memory_flashcard(){
  var pairs = [2,3,3][Math.min(G.round-1,2)];
  var pool = shuffle(PIC_POOL).slice(0, pairs + 1);
  var repeated = pool[0];           // 这个会出现 2 次
  var singles = pool.slice(1, pairs + 1);  // pairs-1 个出现 1 次
  var deck = shuffle([repeated, repeated].concat(singles));
  G.s.flash = { repeated: repeated, count: pairs };
  setInst('🖼️', '看仔细！记住每张卡片！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="grid-tiles '+(pairs>=4?'gc-4':'gc-3')+'">' + deck.map(function(e,i){
    return '<div class="tile flash-show" style="animation-delay:'+(i*0.05)+'s">'+e+'</div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak('记住这些卡片，等会要考考你！'); }, 400);
  var showT = 1500 + pairs * 700;
  setTimeout(function(){
    var decoys = shuffle(PIC_POOL.filter(function(e){ return e !== repeated; })).slice(0,3);
    var opts = shuffle([repeated].concat(decoys));
    setInst('❓', '哪个图案出现了 2 次？');
    grid.innerHTML = '<div class="grid-tiles gc-4" style="grid-template-columns:repeat(2,1fr)">' + opts.map(function(e){
      return '<div class="tile mid" onclick="onFlashCardPick(this,\''+e+'\')">'+e+'</div>';
    }).join('') + '</div>';
    setTimeout(function(){ speak('哪个图案出现了 2 次？点一点！'); }, 400);
  }, showT + 500);
}
function onFlashCardPick(el, e){
  if(G.locked) return;
  handleAnswer(e === G.s.flash.repeated, el);
}

/* ============================================================
 * 精品 · 记忆路线（看路线→重复走一遍）
 * ============================================================ */
var PATH_GRID_SIZES = [3,4,4];
function renderPathStage(){
  var st = G.s.path;
  var area = $('game-stage');
  var cols = st.cols;
  var html = '<div class="path-grid" style="grid-template-columns:repeat('+cols+',52px)">';
  for(var i=0;i<st.cells.length;i++){
    html += '<div class="pnode" id="pn-'+i+'" onclick="onPathNode('+i+')"></div>';
  }
  html += '</div><div class="mz-hud" style="margin:12px auto 0;justify-content:center" id="path-hud"></div>';
  area.innerHTML = html;
}
function setup_memory_path(){
  var cols = PATH_GRID_SIZES[Math.min(G.round-1,2)];
  var size = cols * cols;
  var path = [randInt(size)];
  var len = [4,5,6][Math.min(G.round-1,2)];
  while(path.length < len){
    var cur = path[path.length-1];
    var r = Math.floor(cur/cols), c = cur%cols;
    var nbs = [];
    if(r>0) nbs.push(cur-cols); if(r<cols-1) nbs.push(cur+cols);
    if(c>0) nbs.push(cur-1); if(c<cols-1) nbs.push(cur+1);
    var next = pick(nbs);
    if(path.length >= 2 && next === path[path.length-2]) next = pick(nbs); /* 避免原地打转 */
    path.push(next);
  }
  G.s.path = { cols:cols, cells:new Array(size).fill(''), path:path, cur:0, locked:true };
  setInst('🗺️', '看仔细！小兔走的路线！');
  renderPathStage();
  var area = $('game-stage');
  var pn = area.querySelectorAll('.pnode');
  path.forEach(function(idx, i){
    setTimeout(function(){
      pn[idx].classList.add('lit');
      pn[idx].textContent = '🐰';
      speak('第'+(i+1)+'步');
    }, 500 + i*750);
  });
  setTimeout(function(){
    pn.forEach(function(el, i){
      if(G.s.path.path.indexOf(i) === -1){ el.style.visibility = 'hidden'; }
    });
    setInst('🧠', '按刚才的顺序再走一遍！从第 1 步开始！');
    speak('轮到你了！从第一步开始点！');
    G.s.path.locked = false;
    $('path-hud').textContent = '第 1 / ' + len + ' 步';
  }, 500 + len*750 + 450);
}
function onPathNode(idx){
  var st = G.s.path;
  if(!st || st.locked) return;
  if(st.cur >= st.path.length) return;
  var el = $('pn-'+idx);
  var expect = st.path[st.cur];
  if(idx === expect){
    el.classList.add('done');
    el.classList.remove('lit');
    el.textContent = '✓';
    st.cur++;
    if(st.cur >= st.path.length){
      st.locked = true;
      var pts = st.path.length * 2;
      G.totalStars += pts;
      $('game-stars').textContent = G.totalStars;
      showFeedback('🎉');
      speak('路线记得真牢！');
      setTimeout(nextRoundOrFinish, 900);
    } else {
      $('path-hud').textContent = '第 ' + (st.cur+1) + ' / ' + st.path.length + ' 步';
      speak('对！下一步呢？');
    }
  } else {
    if(el.classList.contains('wrong')) return;
    el.classList.add('wrong');
    setTimeout(function(){ el.classList.remove('wrong'); }, 450);
    showFeedback('💭');
    speak('再想想，这一步是哪里？');
  }
}

/* ============================================================
 * 精品 · 小小侦探（场景里找线索）
 * ============================================================ */
var SCENES = [
  { name:'森林', pad:'🌳', find:'🍄', decoys:['🌳','🌲','🐿️','🦔','🌼','🦋','🐦','🍁','🌿','🌸','🐜','🪵','🌰','🐞'] },
  { name:'房间', pad:'🏠', find:'🧸', decoys:['🛏️','🪑','📚','🖼️','🧦','⚽','🚂','🎨','🪀','🕯️','🍎','🪁','📖','🧸','🎈'] },
  { name:'海边', pad:'🏖️', find:'🐚', decoys:['🌊','⛱️','🦀','🐠','🐬','🌴','🕶️','🧢','⚓','🪸','🐡','🦞','🏐','🐙'] },
  { name:'幼儿园', pad:'🏫', find:'🎨', decoys:['📚','🖍️','🧩','🚌','🪀','🎈','🧸','📐','🪁','🎵','🥁','⚽','🌷','🎒'] },
  { name:'太空', pad:'🚀', find:'⭐', decoys:['🪐','🌍','🌙','☄️','👨‍🚀','🛸','🔭','✨','🌠','🪐','🧑‍🚀','💫','🔴','🌑'] }
];
function setup_detective_scene(){
  var scene = SCENES[(G.round-1) % SCENES.length];
  var need = [3,4,5][Math.min(G.round-1,2)];
  var cells = [];
  for(var i=0;i<need;i++) cells.push(scene.find);
  var dc = shuffle(scene.decoys.filter(function(e){ return e !== scene.find; }));
  while(cells.length < 16){ cells.push(dc[(cells.length*3+i) % dc.length]); }
  cells = shuffle(cells);
  G.s.det = { find: scene.find, need: need, found: 0, scene: scene };
  setInst('🕵️', '在「'+scene.name+'」里找出 '+need+' 个 '+scene.find+'！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="scene-pad"><div style="text-align:center;font-size:13px;color:#5C7A5C;margin-bottom:5px">' + scene.pad + ' ' + scene.name + '场景 · 线索：' + scene.find + ' × ' + need + '</div>' +
    '<div class="scene-grid">' + cells.map(function(e,i){
      return '<div class="scene-cell" onclick="onSceneCell(this,\''+e+'\')">'+e+'</div>';
    }).join('') + '</div></div>';
  setTimeout(function(){ speak('在'+scene.name+'场景里，找出 '+need+' 个 '+scene.find+'！'); }, 500);
}
function onSceneCell(el, e){
  if(G.locked) return;
  if(el.classList.contains('dim')) return;
  if(e === G.s.det.find){
    el.classList.add('dim');
    G.s.det.found++;
    showFeedback('✅');
    if(G.s.det.found >= G.s.det.need){
      G.locked = true;
      G.totalStars += G.s.det.need * 2;
      $('game-stars').textContent = G.totalStars;
      speak('线索都找到啦，小侦探真厉害！');
      setTimeout(nextRoundOrFinish, 900);
    } else {
      speak('找到啦！还有 ' + (G.s.det.need - G.s.det.found) + ' 个！');
    }
  } else {
    if(el.classList.contains('wrong')) return;
    el.classList.add('wrong');
    setTimeout(function(){ el.classList.remove('wrong'); }, 450);
    showFeedback('💭');
    speak('这个不是线索哦，再找找！');
  }
}

/* ============================================================
 * 精品 · 神奇排序（不同维度）
 * ============================================================ */
var SORT_SETS = [
  { title:'从小到大（个子）', items:[{e:'🐜',n:'蚂蚁',s:1},{e:'🐭',n:'小老鼠',s:2},{e:'🐰',n:'小兔',s:3},{e:'🐕',n:'小狗',s:4},{e:'🐘',n:'大象',s:5},{e:'🐳',n:'鲸鱼',s:6}] },
  { title:'从轻到重', items:[{e:'🎈',n:'气球',s:1},{e:'🍎',n:'苹果',s:2},{e:'📚',n:'书包',s:3},{e:'🧸',n:'大熊',s:4},{e:'🛢️',n:'油桶',s:5}] },
  { title:'从慢到快', items:[{e:'🐢',n:'乌龟',s:1},{e:'🐟',n:'小鱼',s:2},{e:'🐰',n:'小兔',s:3},{e:'🐎',n:'小马',s:4},{e:'✈️',n:'飞机',s:5}] },
  { title:'数量从少到多', items:[{e:'⭐',n:'1颗星',s:1},{e:'⭐⭐',n:'2颗星',s:2},{e:'⭐⭐⭐',n:'3颗星',s:3},{e:'⭐⭐⭐⭐',n:'4颗星',s:4}] },
  { title:'早上到晚上', items:[{e:'🌅',n:'早上',s:1},{e:'☀️',n:'中午',s:2},{e:'🌇',n:'傍晚',s:3},{e:'🌙',n:'晚上',s:4}] },
  { title:'先到后（故事顺序）', items:[{e:'🌱',n:'种下种子',s:1},{e:'🌿',n:'长出小苗',s:2},{e:'🌷',n:'开出花',s:3},{e:'🍎',n:'结出果',s:4}] }
];
function setup_logic_sorting(){
  var set = SORT_SETS[(G.round-1) % SORT_SETS.length];
  var n = Math.min(set.items.length, [3,4,5][Math.min(G.round-1,2)]);
  var items = set.items.slice(0,n);
  G.s.order = items; G.s.orderStep = 0;
  setInst('📏', set.title + '，先点第一个！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="story-view" style="margin:0 0 10px;padding:11px 14px"><div class="sv-text" style="font-size:14px;text-align:center">' + set.title + '</div></div>' +
  '<div class="order-options">' + shuffle(items).map(function(it){
    return '<div class="order-opt" id="ord-'+it.e+'-'+it.s+'" onclick="onSortPick(this,\''+it.e+'\','+it.s+')"><span class="oo-emoji">'+it.e+'</span><span style="flex:1;font-size:13px">'+it.n+'</span><span class="oo-idx">?</span></div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak(set.title + '，先点排第一的那个！'); }, 500);
}
function onSortPick(el, e, s){
  if(G.locked) return;
  if(el.classList.contains('done')) return;
  var expected = G.s.order[G.s.orderStep];
  if(s === expected.s){
    el.classList.add('done');
    el.querySelector('.oo-idx').textContent = (G.s.orderStep+1);
    G.s.orderStep++;
    if(G.s.orderStep >= G.s.order.length){
      G.locked = true;
      G.totalStars += G.s.order.length * 2;
      $('game-stars').textContent = G.totalStars;
      showFeedback('🎉');
      speak('排队成功！真聪明！');
      setTimeout(nextRoundOrFinish, 900);
    } else {
      speak('对！下一个呢？');
    }
  } else {
    if(el.classList.contains('wrong')) return;
    el.classList.add('wrong');
    setTimeout(function(){ el.classList.remove('wrong'); }, 450);
    showFeedback('💭');
    speak('再想想，排第一的还没点哦！');
  }
}

/* ============================================================
 * 精品 · 找规律（逻辑力进阶版）
 * ============================================================ */
var LOGIC_PATTERNS = [
  { seq:['🐰','🐰','🐱','🐰','🐰'], ans:'🐱', pos:2, opts:['🐱','🐶','🐰','🐹'], hint:'每 3 个里藏着 1 个不同的' },
  { seq:['⭐','⭐⭐','⭐⭐⭐'], ans:'⭐⭐⭐⭐', pos:-1, opts:['⭐⭐⭐⭐','⭐⭐','⭐⭐⭐⭐⭐','⭐'], hint:'星星越来越多' },
  { seq:['↑','→','↓','↑','→'], ans:'↓', pos:-1, opts:['↓','↑','←','→'], hint:'箭头在转圈' },
  { seq:['🌕','🌙','🌕','🌙'], ans:'🌕', pos:-1, opts:['🌕','🌙','☀️','⭐'], hint:'圆月和弯月轮流' },
  { seq:['🐟','🐟','🐠','🐟','🐟'], ans:'🐠', pos:2, opts:['🐠','🐟','🐡','🦈'], hint:'两条小鱼后面跟着一条彩鱼' },
  { seq:['1','2','3','?','5'], ans:'4', pos:3, opts:['4','6','7','2'], hint:'数字 1 到 5 排队，少了一个' },
  { seq:['🍎','🍌','🍇','🍎','🍌'], ans:'🍇', pos:-1, opts:['🍇','🍎','🍌','🍊'], hint:'三种水果轮流出现' },
  { seq:['▲','▲','▲','●','●','▲','▲','▲'], ans:'●', pos:-1, opts:['●','▲','■','★'], hint:'三个三角两个圆，又开始了' },
  { seq:['⬜','🟨','⬜','🟨','⬜'], ans:'🟨', pos:-1, opts:['🟨','⬜','🟩','🟦'], hint:'白黄轮流站' }
];
function setup_logic_pattern(){
  var p = LOGIC_PATTERNS[(G.round-1) % LOGIC_PATTERNS.length];
  G.s.lpattern = p;
  var shown = p.seq.slice();
  var qPos = (p.pos === -1) ? shown.length : p.pos;  /* 要填的位置(0起)，-1=最后 */
  var display = shown.slice();
  if(qPos === shown.length){ display.push('❓'); }
  else { display[qPos] = '❓'; }
  setInst('🔤', '找一找规律，? 处是什么？');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="seq-track" style="flex-wrap:wrap">' + display.map(function(e){
    return '<div class="seq-box">'+e+'</div>';
  }).join('') + '</div>' +
  '<div class="quiz-options">' + shuffle(p.opts).map(function(o){
    return '<div class="q-opt" onclick="onLogicPatternPick(this,\''+o+'\')"><span class="qo-emoji">'+o+'</span></div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak('找规律！' + p.hint + '，问号里是什么？'); }, 500);
}
function onLogicPatternPick(el, o){
  if(G.locked) return;
  handleAnswer(o === G.s.lpattern.ans, el);
}

/* ============================================================
 * 精品 · 空间旋转（2x2 图形旋转）
 * ============================================================ */
function rotMask2x2(mask, turns){
  /* mask = [a,b,c,d] 对应 [[a,b],[c,d]]；顺时针 90° */
  var m = mask.slice();
  for(var t=0;t<turns;t++){
    m = [m[2], m[0], m[3], m[1]];
  }
  return m;
}
function figHTML(mask, big){
  var html = '<div class="rot-fig">';
  for(var i=0;i<4;i++){
    html += '<div class="rf-cell'+(mask[i] ? ' f' : '')+'"></div>';
  }
  html += '</div>';
  return html;
}
function setup_spatial_rotation(){
  var base = [1,1,1,0];           /* ┌┐└ 形 L */
  var turns = [1,2,3][Math.min(G.round-1,2)];
  var target = rotMask2x2(base, turns);
  /* 干扰项：其他旋转结果 + 镜像 */
  var wrong = [];
  var cands = [];
  for(var i=1;i<=3;i++){ var mm = rotMask2x2(base,i).join(''); if(cands.indexOf(mm)===-1) cands.push(mm); }
  var mirror = rotMask2x2([0,1,1,1],1).join(''); /* 不重复时作镜像感干扰 */
  var targetS = target.join('');
  var wrongS = cands.filter(function(c){ return c !== targetS; }).slice(0,2);
  while(wrongS.length < 2){ wrongS.push(mirror); }
  var opts = shuffle([targetS].concat(wrongS));
  var angle = turns * 90;
  G.s.rot = targetS;
  setInst('🌀', '图形顺时针转 ' + angle + '° 后是哪个？');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="rot-area">' +
    '<div class="rot-qfig"><span style="font-size:15px;color:#7A5A2A">原图</span>' + figHTML(base, true) +
      '<span class="rq-arrow">⟳</span><b style="color:#FB8500">'+angle+'°</b></div>' +
    '<div class="rot-opts">' + opts.map(function(m, i){
      return '<div class="rot-opt" onclick="onRotPick(this,\''+m+'\')">' + figHTML(m.split('').map(Number), false) + '</div>';
    }).join('') + '</div></div>';
  setTimeout(function(){ speak('图形转 '+angle+' 度以后会变成什么样？点一点！'); }, 500);
}
function onRotPick(el, m){
  if(G.locked) return;
  handleAnswer(m === G.s.rot, el);
}

/* ============================================================
 * 精品 · 迷宫探险（递归回溯生成迷宫）
 * ============================================================ */
function genMaze(rows, cols){
  /* 奇数尺寸，四周墙，内部递归回溯 */
  var grid = [];
  for(var r=0;r<rows;r++){
    var row = [];
    for(var c=0;c<cols;c++) row.push('#');
    grid.push(row);
  }
  var visit = function(r,c){
    grid[r][c] = '.';
    var dirs = shuffle([[0,2],[0,-2],[2,0],[-2,0]]);
    dirs.forEach(function(d){
      var nr = r + d[0], nc = c + d[1];
      if(nr>0 && nr<rows-1 && nc>0 && nc<cols-1 && grid[nr][nc] === '#'){
        grid[r + d[0]/2][c + d[1]/2] = '.';
        visit(nr, nc);
      }
    });
  };
  visit(1,1);
  grid[1][1] = 'R';
  grid[rows-2][cols-2] = 'G';
  return grid;
}
function setup_maze_adventure(){
  var size = [5,7,9][Math.min(G.round-1,2)];
  var grid = genMaze(size, size);
  G.s.maze = { size:size, grid:grid, r:1, c:1, steps:0 };
  setInst('🐰', '帮小兔子走到 ⭐ 出口！');
  var gridBox = $('game-stage');
  gridBox.innerHTML = '<div class="maze-wrap"><div class="maze-grid" style="grid-template-columns:repeat('+size+',44px)" id="mz-grid"></div>' +
    '<div class="mz-hud"><span>🐰 小兔</span><span>🎯 出口 <b>⭐</b></span><span>👣 走了 <b id="mz-steps">0</b> 步</span></div></div>';
  renderMaze();
  setTimeout(function(){ speak('点小兔旁边的路，一格一格走到星星那里！'); }, 500);
}
function renderMaze(){
  var st = G.s.maze;
  var g = $('mz-grid');
  if(!g) return;
  g.innerHTML = '';
  for(var r=0;r<st.size;r++){
    for(var c=0;c<st.size;c++){
      var cell = document.createElement('div');
      var ch = st.grid[r][c];
      cell.className = 'mz-cell';
      if(ch === '#') cell.classList.add('wall');
      else if(ch === 'R'){ cell.classList.add('rabbit'); cell.textContent = '🐰'; }
      else if(ch === 'G'){ cell.classList.add('goal'); cell.textContent = '⭐'; }
      cell.dataset.r = r; cell.dataset.c = c;
      cell.onclick = (function(rr, cc){ return function(){ onMazeClick(rr, cc); }; })(r, c);
      g.appendChild(cell);
    }
  }
}
function onMazeClick(r, c){
  var st = G.s.maze;
  if(G.locked) return;
  var dr = Math.abs(r - st.r), dc = Math.abs(c - st.c);
  if(st.grid[r][c] === '#' || dr + dc !== 1) return;
  if(st.grid[r][c] === 'G'){
    st.grid[st.r][st.c] = '.';
    st.grid[r][c] = 'R';
    st.r = r; st.c = c; st.steps++;
    renderMaze();
    G.locked = true;
    G.totalStars += 5 + Math.max(0, 3 - Math.floor(st.steps/8));
    $('game-stars').textContent = G.totalStars;
    showFeedback('🎉');
    speak('走出迷宫啦！小兔找到星星了！');
    setTimeout(nextRoundOrFinish, 1100);
    return;
  }
  if(st.grid[r][c] === '.'){
    st.grid[st.r][st.c] = '.';
    st.grid[r][c] = 'R';
    st.r = r; st.c = c; st.steps++;
    renderMaze();
    $('mz-steps').textContent = st.steps;
  }
}

/* ============================================================
 * 精品 · 故事推理（L4 寻找线索 / L6 隐藏信息）
 * ============================================================ */
var INFERENCE_QUIZ = [
  { text:'天空越来越暗，乌云密布，小熊出门前带上了雨伞。', q:'小熊为什么带雨伞？', a:'因为快要下雨了', opts:['因为快要下雨了','因为它喜欢拿伞','因为太阳太晒'] },
  { text:'小明放学回家，看到妈妈正在厨房准备晚饭。', q:'现在大概是什么时间？', a:'傍晚', opts:['傍晚','早上','半夜'] },
  { text:'小兔早上推开窗，看到地上湿漉漉的，树叶上还有水珠。', q:'昨晚可能发生了什么？', a:'下过雨了', opts:['下过雨了','刮大风了','下雪了'] },
  { text:'小狗把骨头埋进土里，用爪子按了按，还看了看四周没人。', q:'小狗为什么看看四周？', a:'怕别人发现骨头', opts:['怕别人发现骨头','它在找朋友','它在看风景'] },
  { text:'小鱼在水面上吐泡泡，不停地跳来跳去，蜻蜓飞得很低。', q:'可能马上要发生什么？', a:'要下雨了', opts:['要下雨了','天要黑了','要起风了'] },
  { text:'小猴发现杯子里冒热气，用手碰了一下就缩了回来。', q:'杯子里可能是什么？', a:'很烫的水', opts:['很烫的水','冰可乐','白开水'] },
  { text:'小熊穿着雨衣出门，回来时雨衣却干干净净、没有一滴水。', q:'小熊可能去了哪里？', a:'没有下雨的地方', opts:['没有下雨的地方','雨里','水池边'] },
  { text:'天黑了，小猫还站在门口，时不时往远处看。', q:'小猫可能在等谁？', a:'等主人回家', opts:['等主人回家','等天亮','在睡觉'] },
  { text:'雪地里有一串脚印，一直通向小兔家门口，却没有出去的脚印。', q:'小兔最可能怎么了？', a:'在家没出门', opts:['在家没出门','出去玩了','去旅行了'] }
];
function setup_reading_inference(){
  var bank = INFERENCE_QUIZ;
  var idx = ((G.round-1) * 3) % bank.length;
  var q = bank[idx];
  G.s.inferQ = q;
  setInst('🔎', '想一想，答案藏在话里面！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="story-view" style="margin:0 0 10px"><span class="sv-badge aico-log">故事推理 · 找线索</span><div class="sv-text" style="font-size:16px">' + q.text + '</div></div>' +
  '<div class="quiz-options">' + shuffle(q.opts).map(function(o){
    return '<div class="q-opt" onclick="onInferPick(this,\''+o.replace(/'/g,'')+'\')"><span class="qo-emoji">💡</span>'+o+'</div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak(q.text + ' ' + q.q); }, 500);
}
function onInferPick(el, o){
  if(G.locked) return;
  handleAnswer(o === G.s.inferQ.a, el);
}

/* ============================================================
 * 精品 · 人物心理推理（两阶段：猜心情 → 选证据）
 * ============================================================ */
var TOM_SCENES = [
  { text:'小兔子低着头，一句话也不说，眼泪在眼眶里打转。',
    q1:'小兔子可能是什么心情？', a1:'难过', opts1:['难过','开心','生气'],
    q2:'哪句话能证明它难过？', a2:'低着头不说话，眼泪在打转', evid:'低着头不说话，眼泪在打转', evidDecoys:['它在唱歌','它在吃胡萝卜'] },
  { text:'小熊紧紧抱着礼物盒，嘴巴咧得大大的，还哼着歌。',
    q1:'小熊可能是什么心情？', a1:'开心', opts1:['难过','开心','害怕'],
    q2:'哪句话能证明它开心？', a2:'嘴巴咧得大大的，还哼着歌', evid:'嘴巴咧得大大的，还哼着歌', evidDecoys:['它皱着眉头','它一言不发'] },
  { text:'小狐狸躲在大树后面，探出半个脑袋，一动也不敢动。',
    q1:'小狐狸可能是什么心情？', a1:'害怕', opts1:['勇敢','害怕','高兴'],
    q2:'哪句话能证明它害怕？', a2:'躲在大树后面不敢动', evid:'躲在大树后面不敢动', evidDecoys:['它大方地走出来','它大声打招呼'] },
  { text:'小鸭收到礼物却叹了口气，把礼物轻轻放在一边，坐在角落里发呆。',
    q1:'小鸭可能是什么心情？', a1:'不太开心', opts1:['不太开心','非常兴奋','很生气'],
    q2:'哪句话能证明它不开心？', a2:'叹了口气，坐在角落发呆', evid:'叹了口气，坐在角落发呆', evidDecoys:['它跳了起来','它哈哈笑'] },
  { text:'小猪站在门口，一直跺脚，眉头皱得紧紧的。',
    q1:'小猪可能是什么心情？', a1:'着急', opts1:['着急','悠闲','兴奋'],
    q2:'哪句话能证明它着急？', a2:'一直跺脚，眉头皱得紧紧的', evid:'一直跺脚，眉头皱得紧紧的', evidDecoys:['它躺下来睡觉','它慢慢散步'] }
];
function renderTomStage(){
  var st = G.s.tom;
  var grid = $('game-stage');
  if(st.stage === 1){
    grid.innerHTML = '<div class="story-view" style="margin:0 0 10px"><span class="sv-badge" style="background:linear-gradient(160deg,#FF9EC7,#FF5C8A)">人物心理推理 · 第 1 问</span><div class="sv-text" style="font-size:16px">' + st.sc.text + '</div></div>' +
    '<div class="quiz-options">' + shuffle(st.sc.opts1).map(function(o){
      return '<div class="q-opt" onclick="onTomPick1(this,\''+o+'\')"><span class="qo-emoji">💭</span>'+o+'</div>';
    }).join('') + '</div>';
  } else {
    grid.innerHTML = '<div class="story-view" style="margin:0 0 10px"><span class="sv-badge" style="background:linear-gradient(160deg,#FF9EC7,#FF5C8A)">人物心理推理 · 第 2 问（找证据）</span><div class="sv-text" style="font-size:15px">'+st.sc.text+'</div>' +
    '<div style="margin-top:9px;background:#FFF9EC;border-radius:12px;padding:8px 11px;font-size:13px;color:#8A5A00">它的心情是：<b>'+st.feeling+'</b><br>从哪句话能看出它这个心情？</div></div>' +
    '<div class="quiz-options">' + shuffle([st.sc.evid].concat(st.sc.evidDecoys)).map(function(o){
      return '<div class="q-opt" onclick="onTomPick2(this,\''+o.replace(/'/g,'')+'\')"><span class="qo-emoji">📌</span>'+o+'</div>';
    }).join('') + '</div>';
  }
}
function setup_reading_theory_of_mind(){
  var sc = TOM_SCENES[(G.round-1) % TOM_SCENES.length];
  G.s.tom = { sc: sc, stage: 1, feeling: '' };
  setInst('💭', '看表情听语气，猜猜它心里想什么？');
  setTimeout(function(){ speak(sc.text); }, 500);
  renderTomStage();
}
function onTomPick1(el, o){
  var st = G.s.tom;
  if(G.locked) return;
  if(o === st.sc.a1){
    st.feeling = o;
    st.stage = 2;
    G.totalStars += 2;
    $('game-stars').textContent = G.totalStars;
    showFeedback('✅');
    speak('猜对了！再找找哪句话能证明？');
    setTimeout(renderTomStage, 650);
  } else {
    if(el.classList.contains('wrong')) return;
    el.classList.add('wrong');
    setTimeout(function(){ el.classList.remove('wrong'); }, 450);
    showFeedback('💭');
    speak('再想想，它的表情是什么心情？');
  }
}
function onTomPick2(el, o){
  var st = G.s.tom;
  if(G.locked) return;
  handleAnswer(o === st.sc.a2, el);
}

/* ============================================================
 * 结束 / 结果弹层 / 冒险联动
 * ============================================================ */
function finishGame(){
  var extra = 0;
  if(G.round >= G.rounds) extra = 5;
  var total = G.totalStars + extra + 10;
  $('result-stars-num').textContent = '+'+total;
  var sl = $('result-stars').children;
  var litCount = G.totalStars >= 12 ? 3 : (G.totalStars >= 6 ? 2 : 1);
  for(var i=0;i<3;i++){ sl[i].className = i < litCount ? 'lit' : 'dim'; }
  $('result-title').textContent = '完成啦！';
  $('result-badge').textContent = '🏅 「' + G.name + '」小达人';
  /* 星星数量动画 */
  var sc = $('star-count');
  var from = parseInt(sc.textContent) || 120, to = from + total;
  var step = 0;
  var tm = setInterval(function(){
    step++;
    sc.textContent = Math.round(from + (to-from)*Math.min(step/20,1));
    if(step>=20) clearInterval(tm);
  }, 30);
  /* 每日任务进度 */
  var tb = $('task-bar'), tn = $('task-num');
  if(tb && tn){
    var cur = parseInt(tb.style.width) || 0;
    if(cur < 100){ tb.style.width = Math.min(100, cur+25) + '%'; tn.textContent = '完成 ' + Math.min(4, Math.round((cur+25)/25)) + ' / 4 个任务'; }
  }
  /* 冒险任务联动：登记完成进度并切换主按钮文案 */
  var inMission = false;
  if(typeof onMissionGameFinished === 'function'){
    inMission = onMissionGameFinished(total);
  }
  var mainBtn = $('result-main-btn');
  if(inMission && typeof missionNextGameId === 'function' && missionNextGameId()){
    mainBtn.textContent = '▶️ 下一关';
    mainBtn.className = 'big-btn btn-orange';
  } else if(inMission){
    mainBtn.textContent = '🎁 打开宝箱';
    mainBtn.className = 'big-btn btn-grape';
  } else {
    mainBtn.textContent = '🏝️ 回首页';
    mainBtn.className = 'big-btn btn-pink';
  }
  launchConfetti();
  $('ov-result').classList.add('show');
}
function launchConfetti(){
  var emojis = ['⭐','✨','🎉','🌟','💫','🎊'];
  for(var i=0;i<26;i++){
    (function(){
      var c = document.createElement('span');
      c.className = 'confetti';
      c.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      c.style.left = (8 + Math.random()*84)+'%';
      c.style.top = '8%';
      c.style.animationDuration = (1.4 + Math.random()*1.6)+'s';
      c.style.animationDelay = (Math.random()*0.5)+'s';
      document.body.appendChild(c);
      setTimeout(function(){ c.remove(); }, 3600);
    })();
  }
}
function restartGame(){
  $('ov-result').classList.remove('show');
  startGame(G.id, G.opts);
}
function closeResult(){
  $('ov-result').classList.remove('show');
  nav('home');
}
function exitGame(){
  $('ov-pause').classList.remove('show');
  var mh = $('mission-hint');
  if(mh) mh.style.display = 'none';
  qs('.pause-btn').style.display = '';
  nav('home');
}
/* ===== 暂停 ===== */
function openPause(){
  if('speechSynthesis' in window) speechSynthesis.cancel();
  $('ov-pause').classList.add('show');
}
function resumeGame(){
  $('ov-pause').classList.remove('show');
  speak('继续加油！');
}
