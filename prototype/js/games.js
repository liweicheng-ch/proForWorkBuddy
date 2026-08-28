/* ============================================================
 * 奇妙脑力岛 · 20 个游戏引擎 (js/games.js)
 * 对照 PRD §22~§47：统一生命周期 IDLE→INTRO→DEMO→PLAYING→
 * SUCCESS/FAILURE→REWARD→FINISH，动态难度，TTS 指令，暂停
 * ============================================================ */

/* ---------- 全局游戏状态 ---------- */
var G = {
  id:null, name:'', icon:'', ability:'',
  rounds:3, round:0, totalStars:0, locked:false,
  opts:{},      // 游戏自定义选项（如 articleId）
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

/* ---------- 启动游戏 ---------- */
function startGame(id, opts){
  var cfg = GAME_LIST[id];
  if(!cfg) return;
  G.id = id; G.name = cfg.name; G.icon = cfg.icon; G.ability = cfg.ability;
  G.rounds = 3; G.round = 0; G.totalStars = 0; G.locked = false;
  G.opts = opts || {}; G.s = {};
  /* 阅读类游戏：轮数 = 文章篇数（1 篇 1 轮），从题库取文章 */
  if(['story_quiz','story_listen','story_sequence','story_character','story_cause'].indexOf(id) >= 0){
    G.rounds = 3;
  }
  $('game-title').innerHTML = cfg.icon + ' ' + cfg.name + ' <span style="font-size:13px;color:var(--ink-l)" id="game-round"></span>';
  $('game-stars').textContent = '0';
  $('game-diff-tag').textContent = cfg.diff;
  /* 暂停按钮：story_listen 展示阶段隐藏（PRD V2.2） */
  qs('.pause-btn').style.display = '';
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
 * 专注力 · 1 找一找（PRD GAME-001）
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

/* ============================================================
 * 专注力 · 2 找不同（PRD GAME-002）
 * ============================================================ */
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

/* ============================================================
 * 专注力 · 3 视觉追踪（PRD GAME-003）
 * ============================================================ */
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
      /* 移动结束，进入选择 */
      speak('好了！小星星现在在哪里？');
      TRACK_STATE.playing = false;
      return;
    }
    TRACK_STATE.cur++;
    var other;
    do { other = randInt(3); } while(other === TRACK_STATE.ball);
    var old = TRACK_STATE.ball;
    /* 交换动画：两个杯子 wiggle，球跳过去 */
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

/* ============================================================
 * 专注力 · 4 消除干扰（PRD GAME-004）
 * ============================================================ */
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

/* ============================================================
 * 专注力 · 5 听觉注意（PRD GAME-005）
 * ============================================================ */
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
 * 记忆力 · 6 翻牌记忆（PRD GAME-006）
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

/* ============================================================
 * 记忆力 · 7 顺序记忆（PRD GAME-007）
 * ============================================================ */
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
  /* 逐个点亮 */
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

/* ============================================================
 * 记忆力 · 8 图片记忆（PRD GAME-008）
 * ============================================================ */
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
    /* 隐藏，出题：4 个选项中 1 个是刚才的 */
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

/* ============================================================
 * 记忆力 · 9 位置记忆（PRD GAME-009）
 * ============================================================ */
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

/* ============================================================
 * 记忆力 · 10 故事记忆（PRD GAME-010）
 * ============================================================ */
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
 * 逻辑 · 11 分类（PRD GAME-011）
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

/* ============================================================
 * 逻辑 · 12 排序（PRD GAME-012）
 * ============================================================ */
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

/* ============================================================
 * 逻辑 · 13 找规律（PRD GAME-013）
 * ============================================================ */
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

/* ============================================================
 * 逻辑 · 14 图形推理（PRD GAME-014）
 * ============================================================ */
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

/* ============================================================
 * 逻辑 · 15 条件推理（PRD GAME-015）
 * ============================================================ */
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
 * 阅读 · 16~20 五个阅读引擎（PRD V2.2）
 * 统一流程：取文章 → 故事展示 → 答题
 * ============================================================ */
function getArticleForRound(){
  var level = (typeof state !== 'undefined' && state.readLevel) ? state.readLevel : 'B';
  /* 从文章列表点进来：第一轮优先读那篇 */
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

/* ---- 16 读文答题 story_quiz ---- */
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

/* ---- 17 听故事 story_listen（自动朗读） ---- */
function setup_story_listen(){
  var art = getArticleForRound();
  G.s.art = art;
  setInst('🔊', '竖起小耳朵，听故事！');
  /* PRD V2.2：storyListen 进入时自动 TTS 朗读全文，暂停按钮在展示阶段隐藏 */
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

/* ---- 18 故事排序 story_sequence（按正确顺序排列句子） ---- */
function splitSentences(art){
  var text = art.text.replace(/\n/g,'。');
  var parts = text.split('。').filter(function(s){ return s.trim().length > 0; });
  return parts.slice(0,4).map(function(s){ return s + '。'; });
}
function setup_story_sequence(){
  var art = getArticleForRound();
  G.s.seqArt = art;
  var sents = splitSentences(art);
  if(sents.length < 3){ sents = ['小猫去河边钓鱼。','河水清清的。','小猫钓到一条大鱼。']; }
  G.s.sents = sents;
  G.s.sentStep = 0;
  setInst('🔢', '按故事顺序，先点第一句！');
  var grid = $('game-stage');
  grid.innerHTML = '<div class="story-view" style="margin:0 0 10px"><span class="sv-badge aico-log">'+art.level+' 级 · 故事排序</span><div class="sv-title">📖 ' + art.title + '</div></div>' +
  '<div class="order-options">' + shuffle(sents).map(function(s,i){
    return '<div class="order-opt" id="st-'+i+'" onclick="onSeqSent(this,'+i+')"><span class="oo-emoji">📄</span><span style="flex:1;font-size:14px">'+s+'</span><span class="oo-idx">?</span></div>';
  }).join('') + '</div>';
  setTimeout(function(){ speak('把句子按故事顺序排好！先点第一句！'); }, 500);
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

/* ---- 19 人物判断 story_character（PRD GAME-019） ---- */
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

/* ---- 20 因果推理 story_cause（PRD GAME-020） ---- */
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
 * 结束 / 结果弹层 / 彩纸
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
  /* 任务进度 */
  var tb = $('task-bar'), tn = $('task-num');
  if(tb && tn){
    var cur = parseInt(tb.style.width) || 50;
    if(cur < 100){ tb.style.width = Math.min(100, cur+25) + '%'; tn.textContent = '完成 3 / 4 个任务'; }
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
  qs('.pause-btn').style.display = '';
  nav('home');
}
/* ===== 暂停 ===== */
function openPause(){
  speechSynthesis.cancel();
  $('ov-pause').classList.add('show');
}
function resumeGame(){
  $('ov-pause').classList.remove('show');
  speak('继续加油！');
}
