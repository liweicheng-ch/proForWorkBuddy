/* ============================================================
 * 奇妙脑力岛 · 原型数据文件 (js/data.js)
 * 对照 PRD：20 个核心小游戏（专注5/记忆5/逻辑5/阅读5）
 * 阅读理解题库：Level A~D 分级 + 6 大主题 + 每篇 2~4 题
 * ============================================================ */

/* ---------- 4 大能力 ---------- */
var ABILITIES = [
  { key:'attention', name:'专注力', place:'专注森林', icon:'🎯', cls:'att',
    score:76, lv:'Lv.3 · 稳定阶段', trend:'▲ 上升中', trendCls:'trend-up',
    desc:'练眼力，集中注意力，找得快又准', gameCount:5 },
  { key:'memory', name:'记忆力', place:'记忆山', icon:'🧠', cls:'mem',
    score:68, lv:'Lv.3 · 稳定阶段', trend:'▲ 上升中', trendCls:'trend-up',
    desc:'记住看到听到的东西，越记越牢', gameCount:5 },
  { key:'logic', name:'逻辑思维', place:'思维城', icon:'🧩', cls:'log',
    score:72, lv:'Lv.3 · 稳定阶段', trend:'→ 保持平稳', trendCls:'trend-stable',
    desc:'想一想、排一排、找规律，动脑筋', gameCount:5 },
  { key:'reading', name:'阅读理解', place:'故事森林', icon:'📖', cls:'rea',
    score:59, lv:'Lv.2 · 基础阶段', trend:'▲ 上升中', trendCls:'trend-up',
    desc:'读故事、听故事、答问题，理解世界', gameCount:5 }
];

/* ---------- 20 个游戏（PRD §28~§47） ---------- */
var GAME_LIST = {
  /* ===== 专注力 ===== */
  find_target:{ id:'find_target', name:'找一找', icon:'🔍', ability:'attention',
    diff:'难度 1-10 · 物体从 3 个加到 12 个', desc:'屏幕出现好多东西，找到指定的那一个！', cls:'att' },
  find_diff:{ id:'find_diff', name:'找不同', icon:'🕵️', ability:'attention',
    diff:'难度 1-10 · 干扰越来越多', desc:'这些图案里藏着一个不一样的，快把它找出来！', cls:'att' },
  visual_track:{ id:'visual_track', name:'视觉追踪', icon:'👀', ability:'attention',
    diff:'难度 1-10 · 移动越来越快', desc:'小星星在杯子里跳来跳去，记住它最后躲在哪！', cls:'att' },
  eliminate_interf:{ id:'eliminate_interf', name:'消除干扰', icon:'🧹', ability:'attention',
    diff:'难度 1-10 · 干扰物越来越多', desc:'只点出指令说的那类东西，别的都不算！', cls:'att' },
  auditory_att:{ id:'auditory_att', name:'听觉注意', icon:'👂', ability:'attention',
    diff:'难度 1-10 · 声音越来越像', desc:'仔细听！听到哪个小动物的声音，就点它！', cls:'att' },

  /* ===== 记忆力 ===== */
  card_flip:{ id:'card_flip', name:'翻牌记忆', icon:'🃏', ability:'memory',
    diff:'难度 1-10 · 牌从 6 张加到 12 张', desc:'记住牌的位置，把一样的图案配对翻出来！', cls:'mem' },
  seq_memory:{ id:'seq_memory', name:'顺序记忆', icon:'🔢', ability:'memory',
    diff:'难度 1-10 · 序列越来越长', desc:'看仔细！它们按顺序出现，然后考考你第几个是什么。', cls:'mem' },
  pic_memory:{ id:'pic_memory', name:'图片记忆', icon:'🖼️', ability:'memory',
    diff:'难度 1-10 · 图案越来越多', desc:'先看一会，然后告诉我刚才哪个出现过！', cls:'mem' },
  pos_memory:{ id:'pos_memory', name:'位置记忆', icon:'🗺️', ability:'memory',
    diff:'难度 1-10 · 格子越来越多', desc:'记住每样东西放在哪，然后帮它们找到家！', cls:'mem' },
  story_memory:{ id:'story_memory', name:'故事记忆', icon:'🎬', ability:'memory',
    diff:'难度 1-10 · 故事越来越长', desc:'听一个小故事，然后回答故事里的小问题！', cls:'mem' },

  /* ===== 逻辑 ===== */
  categorize:{ id:'categorize', name:'分类', icon:'🗂️', ability:'logic',
    diff:'难度 1-10 · 类别越来越细', desc:'把同一类的东西都点出来，放进正确的篮子里！', cls:'log' },
  order_by:{ id:'order_by', name:'排序', icon:'📏', ability:'logic',
    diff:'难度 1-10 · 项目越来越多', desc:'从小到大，按顺序把它们一个个排好！', cls:'log' },
  pattern:{ id:'pattern', name:'找规律', icon:'🔤', ability:'logic',
    diff:'难度 1-10 · 规律越来越复杂', desc:'看一看看一看，下一个会是什么呢？', cls:'log' },
  shape_reason:{ id:'shape_reason', name:'图形推理', icon:'🔷', ability:'logic',
    diff:'难度 1-10 · 图形越来越复杂', desc:'图形在按规律跳舞，猜猜下一个是谁！', cls:'log' },
  conditional:{ id:'conditional', name:'条件推理', icon:'⚖️', ability:'logic',
    diff:'难度 1-10 · 条件越来越多', desc:'比一比、想一想，谁最高？谁最快？', cls:'log' },

  /* ===== 阅读（V2.2 五个阅读引擎） ===== */
  story_quiz:{ id:'story_quiz', name:'读文答题', icon:'📖', ability:'reading',
    diff:'PRD V2.2 · 读文章后回答选择题', desc:'先读完小文章，再回答问题，答对得星星！', cls:'rea' },
  story_listen:{ id:'story_listen', name:'听故事', icon:'🔊', ability:'reading',
    diff:'PRD V2.2 · TTS 朗读后答题', desc:'竖起小耳朵听故事，听完回答小问题！', cls:'rea' },
  story_sequence:{ id:'story_sequence', name:'故事排序', icon:'🔢', ability:'reading',
    diff:'PRD V2.2 · 按正确顺序排列句子', desc:'句子被打乱了，按故事顺序把它们排好！', cls:'rea' },
  story_character:{ id:'story_character', name:'人物判断', icon:'👤', ability:'reading',
    diff:'PRD V2.2 · 判断谁做了什么', desc:'读故事，然后找出谁做了什么！', cls:'rea' },
  story_cause:{ id:'story_cause', name:'因果推理', icon:'🔗', ability:'reading',
    diff:'PRD V2.2 · 分析故事因果关系', desc:'想一想，为什么会这样？把原因找出来！', cls:'rea' }
};

var GAME_IDS = Object.keys(GAME_LIST);

/* 能力 -> 游戏 id 列表 */
var GAMES_BY_ABILITY = {
  attention:['find_target','find_diff','visual_track','eliminate_interf','auditory_att'],
  memory:['card_flip','seq_memory','pic_memory','pos_memory','story_memory'],
  logic:['categorize','order_by','pattern','shape_reason','conditional'],
  reading:['story_quiz','story_listen','story_sequence','story_character','story_cause']
};

/* ---------- 阅读级别（PRD §47.5） ---------- */
var LEVELS = [
  { key:'A', age:3,  name:'Level A', desc:'3岁 · 短句为主 · 2题' },
  { key:'B', age:4,  name:'Level B', desc:'4岁 · 扩展段落 · 3题' },
  { key:'C', age:5,  name:'Level C', desc:'5岁 · 科普推理 · 3题' },
  { key:'D', age:6,  name:'Level D', desc:'6岁 · 深度科普 · 3-4题' }
];

/* ---------- 6 大主题（PRD §47.5.2） ---------- */
var THEMES = [
  { key:'all',      name:'全部', icon:'🌈' },
  { key:'animal',   name:'动物', icon:'🐾' },
  { key:'nature',   name:'自然', icon:'🌿' },
  { key:'science',  name:'科学', icon:'🔬' },
  { key:'adventure',name:'冒险', icon:'🗺️' },
  { key:'daily',    name:'日常', icon:'🏠' },
  { key:'emotion',  name:'情绪', icon:'💗' }
];
var THEME_NAME = { animal:'动物', nature:'自然', science:'科学', adventure:'冒险', daily:'日常', emotion:'情绪' };
var THEME_EMOJI = { animal:'🐾', nature:'🌿', science:'🔬', adventure:'🗺️', daily:'🏠', emotion:'💗' };

/* ---------- 阅读理解题库（原型含 16 篇示例，覆盖 A~D 与 6 主题） ----------
 * 完整版 100 篇由 js/reading_content.js 提供（每级 25 篇 × 4 级）
 */
var READING_CONTENT = [
  /* ===== Level A（3岁） ===== */
  { id:'A01', level:'A', theme:'animal', title:'小猫钓鱼',
    text:'小猫去河边钓鱼。\n河水清清的，小鱼游来游去。\n小猫钓到一条大鱼，开心地笑了。',
    questions:[
      { q:'小猫去哪里钓鱼？', a:'河边', opts:['河边','山顶','花园'] },
      { q:'小猫钓到什么？', a:'大鱼', opts:['大鱼','青蛙','皮球'] }
    ]},
  { id:'A02', level:'A', theme:'nature', title:'太阳出来了',
    text:'早上，太阳出来了。\n小公鸡喔喔叫，把小动物们都叫醒了。\n大家一起说：早上好！',
    questions:[
      { q:'谁把小动物叫醒了？', a:'小公鸡', opts:['小公鸡','小狗','小猫'] },
      { q:'故事发生在什么时候？', a:'早上', opts:['早上','晚上','半夜'] }
    ]},
  { id:'A03', level:'A', theme:'daily', title:'自己穿衣服',
    text:'早上起床，小兔自己穿衣服。\n先穿小袜子，再穿小外套。\n妈妈夸小兔真能干！',
    questions:[
      { q:'小兔先穿什么？', a:'小袜子', opts:['小袜子','小外套','小帽子'] },
      { q:'妈妈为什么夸小兔？', a:'小兔自己穿衣服', opts:['小兔自己穿衣服','小兔会唱歌','小兔跑得快'] }
    ]},
  { id:'A04', level:'A', theme:'emotion', title:'小兔的生日',
    text:'今天是小兔的生日。\n小动物们都来庆祝，一起唱生日歌。\n小兔收到好多礼物，心里甜甜的。',
    questions:[
      { q:'今天是谁的生日？', a:'小兔', opts:['小兔','小熊','小猫'] },
      { q:'小兔收到礼物，心里怎么样？', a:'甜甜的', opts:['甜甜的','难过','生气'] }
    ]},

  /* ===== Level B（4岁） ===== */
  { id:'B01', level:'B', theme:'animal', title:'小鸭学游泳',
    text:'小鸭跟着鸭妈妈来到池塘边。\n小鸭有点害怕，不敢下水。\n鸭妈妈说：别怕，慢慢来。\n小鸭试了试，发现游泳一点也不难，开心地游来游去。',
    questions:[
      { q:'小鸭一开始敢下水吗？', a:'不敢', opts:['不敢','很敢','不知道'] },
      { q:'小鸭最后学会游泳了吗？', a:'学会了', opts:['学会了','没有','还在学'] },
      { q:'谁鼓励了小鸭？', a:'鸭妈妈', opts:['鸭妈妈','小兔','小猫'] }
    ]},
  { id:'B02', level:'B', theme:'nature', title:'春天来了',
    text:'春天来了。\n小草从泥土里探出头来，桃花开了，柳树发芽了。\n燕子从南方飞回来了，在屋檐下搭新窝。\n到处都是一片生机勃勃的样子。',
    questions:[
      { q:'春天里，小草做了什么？', a:'从泥土里探出头', opts:['从泥土里探出头','睡觉','飞走了'] },
      { q:'谁从南方飞回来了？', a:'燕子', opts:['燕子','麻雀','大雁'] },
      { q:'故事里的春天是什么样？', a:'生机勃勃', opts:['生机勃勃','冷冰冰','光秃秃'] }
    ]},
  { id:'B03', level:'B', theme:'science', title:'彩虹的秘密',
    text:'雨过天晴，天空中出现了一道彩虹。\n彩虹有红、橙、黄、绿、青、蓝、紫七种颜色。\n彩虹其实不是桥，是太阳光照在小水珠上变的魔法。',
    questions:[
      { q:'彩虹出现在什么时候？', a:'雨过天晴后', opts:['雨过天晴后','下大雨时','天黑以后'] },
      { q:'彩虹有几种颜色？', a:'七种', opts:['七种','三种','十种'] },
      { q:'彩虹是怎么来的？', a:'太阳光照在小水珠上', opts:['太阳光照在小水珠上','月亮画的','云朵堆的'] }
    ]},
  { id:'B04', level:'B', theme:'adventure', title:'坐公交车',
    text:'今天妈妈带小猴坐公交车去动物园。\n上车要投币，小猴排在队伍后面。\n车子开呀开，窗外的风景真好看。\n到站了，小猴牵着妈妈的手下了车。',
    questions:[
      { q:'小猴和谁一起坐公交车？', a:'妈妈', opts:['妈妈','爸爸','老师'] },
      { q:'他们要去哪里？', a:'动物园', opts:['动物园','公园','超市'] },
      { q:'小猴上车前做了什么？', a:'排队', opts:['排队','插队','乱跑'] }
    ]},

  /* ===== Level C（5岁） ===== */
  { id:'C01', level:'C', theme:'animal', title:'蜜蜂的舞蹈',
    text:'小蜜蜂找到花蜜后，会跳一种特别的舞。\n跳圆圈舞，意思是花就在附近。\n跳八字舞，意思是花比较远，还指明了方向。\n蜜蜂就是用跳舞来告诉同伴花蜜在哪里。',
    questions:[
      { q:'蜜蜂用什么方式告诉同伴花蜜的位置？', a:'跳舞', opts:['跳舞','唱歌','写信'] },
      { q:'圆圈舞表示什么？', a:'花就在附近', opts:['花就在附近','花很远','没有花'] },
      { q:'蜜蜂找到花蜜后，同伴们会怎样？', a:'跟着舞找到花', opts:['跟着舞找到花','一起睡觉','到处乱飞'] }
    ]},
  { id:'C02', level:'C', theme:'science', title:'影子游戏',
    text:'小狐狸发现，太阳在前面，影子就在后面。\n太阳在左边，影子就在右边。\n把东西挡住光，就会出现影子。\n小狐狸用手做出小鸟的形状，墙上就出现了一只小鸟的影子。',
    questions:[
      { q:'影子是怎么来的？', a:'光被东西挡住了', opts:['光被东西挡住了','天上掉下来的','画上去的'] },
      { q:'太阳在前面，影子在哪里？', a:'后面', opts:['后面','前面','旁边'] },
      { q:'小狐狸用手做了什么？', a:'小鸟的影子', opts:['小鸟的影子','大树的影子','太阳'] }
    ]},
  { id:'C03', level:'C', theme:'daily', title:'班级值日',
    text:'今天轮到大象值日。\n放学后，大象先擦黑板，再摆桌子，最后扫地。\n虽然有点累，但看到教室干干净净的，大象很高兴。\n第二天，老师表扬了大象，说它很负责任。',
    questions:[
      { q:'大象值日时先做什么？', a:'擦黑板', opts:['擦黑板','扫地','摆桌子'] },
      { q:'大象做值日觉得怎么样？', a:'有点累但很高兴', opts:['有点累但很高兴','特别生气','不想做'] },
      { q:'老师为什么表扬大象？', a:'大象很负责任', opts:['大象很负责任','大象个子高','大象跑得快'] }
    ]},
  { id:'C04', level:'C', theme:'emotion', title:'和朋友吵架',
    text:'小羊和小鹿一起玩积木。\n小鹿不小心把积木推倒了，小羊很生气，两人吵了起来。\n后来小羊想想，小鹿也不是故意的，就主动说：对不起。\n两个人又一起搭了一座更大的城堡。',
    questions:[
      { q:'积木是谁推倒的？', a:'小鹿不小心推的', opts:['小鹿不小心推的','小羊推的','风吹的'] },
      { q:'小羊生气后做了什么？', a:'主动说对不起', opts:['主动说对不起','继续吵架','不理小鹿'] },
      { q:'这个故事告诉我们什么？', a:'朋友要互相原谅', opts:['朋友要互相原谅','生气很有用','不能玩积木'] }
    ]},

  /* ===== Level D（6岁） ===== */
  { id:'D01', level:'D', theme:'animal', title:'海豚的智慧',
    text:'海豚是海洋里最聪明的动物之一。\n它们会用不同的叫声交流，还会互相帮助。\n海豚睡觉时，只让一半大脑休息，另一半保持清醒，防止溺水。\n海豚还能听懂简单的指令，帮助人类完成一些海洋任务。',
    questions:[
      { q:'海豚用什么方式交流？', a:'不同的叫声', opts:['不同的叫声','写字','打手势'] },
      { q:'海豚睡觉时和别的动物有什么不同？', a:'只让一半大脑休息', opts:['只让一半大脑休息','完全不睡觉','站着睡'] },
      { q:'海豚帮助人类做什么？', a:'完成海洋任务', opts:['完成海洋任务','看家','种地'] },
      { q:'短文告诉我们海豚是一种什么样的动物？', a:'聪明又会帮助同伴', opts:['聪明又会帮助同伴','凶猛可怕','行动缓慢'] }
    ]},
  { id:'D02', level:'D', theme:'nature', title:'极光的形成',
    text:'在地球南北极的高空，有时能看到美丽的极光。\n极光是太阳发出的带电粒子到达地球，被地球磁场引导到两极，和大气中的气体碰撞产生的光芒。\n极光的颜色不一样：和氧气碰撞发绿光和红光，和氮气碰撞发紫光和蓝光。',
    questions:[
      { q:'极光一般出现在地球的哪里？', a:'南北极的高空', opts:['南北极的高空','赤道','城市上空'] },
      { q:'极光是怎样形成的？', a:'太阳带电粒子和大气碰撞', opts:['太阳带电粒子和大气碰撞','月亮照的','云彩拼的'] },
      { q:'极光和什么碰撞会发出绿光？', a:'氧气', opts:['氧气','氮气','氢气'] }
    ]},
  { id:'D03', level:'D', theme:'adventure', title:'海上求生',
    text:'小熊坐船出海玩，突然遇到大风暴，船翻了。\n小熊抓住一块木板，保持冷静。\n它先用衣服收集淡水，又把湿木头堆在一起等太阳晒干。\n第二天，小熊用镜子的反光向远处的船发信号，终于得救了。',
    questions:[
      { q:'船翻以后，小熊先做了什么？', a:'抓住木板保持冷静', opts:['抓住木板保持冷静','大哭大叫','跳进海里游泳'] },
      { q:'小熊怎么收集淡水？', a:'用衣服收集', opts:['用衣服收集','用杯子接','喝海水'] },
      { q:'小熊用什么发求救信号？', a:'镜子的反光', opts:['镜子的反光','火光','旗子'] },
      { q:'小熊最后为什么能得救？', a:'冷静地想出办法', opts:['冷静地想出办法','运气好','别人来救'] }
    ]},
  { id:'D04', level:'D', theme:'science', title:'火山为什么会喷发',
    text:'地球里面很热，岩石熔化成岩浆。\n岩浆在地底越积越多，压力越来越大。\n当压力大到地面撑不住时，岩浆就会从火山口喷出来，这就是火山喷发。\n火山喷发很危险，但它也会带来肥沃的土壤，让植物长得更好。',
    questions:[
      { q:'火山喷发前，地底发生了什么？', a:'岩浆压力越来越大', opts:['岩浆压力越来越大','地底变冷','地面开花'] },
      { q:'岩浆是从哪里喷出来的？', a:'火山口', opts:['火山口','大海','天空'] },
      { q:'火山喷发有什么好处？', a:'带来肥沃的土壤', opts:['带来肥沃的土壤','带来冰雪','让天变蓝'] },
      { q:'地底的岩石为什么会变成岩浆？', a:'地球内部太热', opts:['地球内部太热','被水泡的','被风吹的'] }
    ]}
];

/* 阅读引擎配置（PRD V2.2） */
var READING_ENGINES = [
  { id:'story_quiz',     name:'读文答题', icon:'📖', cls:'en-quiz',  desc:'读文章后回答问题' },
  { id:'story_listen',   name:'听故事',   icon:'🔊', cls:'en-listen',desc:'听朗读后回答问题' },
  { id:'story_sequence', name:'故事排序', icon:'🔢', cls:'en-seq',   desc:'把句子按顺序排好' },
  { id:'story_character',name:'人物判断', icon:'👤', cls:'en-char',  desc:'找出谁做了什么' },
  { id:'story_cause',    name:'因果推理', icon:'🔗', cls:'en-cause', desc:'想一想为什么会这样' }
];

/* 按级别+主题取文章 */
function getReadingArticles(level, theme){
  return READING_CONTENT.filter(function(a){
    if(level && a.level !== level) return false;
    if(theme && theme !== 'all' && a.theme !== theme) return false;
    return true;
  });
}
function getArticleById(id){
  for(var i=0;i<READING_CONTENT.length;i++){
    if(READING_CONTENT[i].id === id) return READING_CONTENT[i];
  }
  return READING_CONTENT[0];
}
