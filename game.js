
const c=document.getElementById('game'),ctx=c.getContext('2d');
const title=document.getElementById('title'), gameover=document.getElementById('gameover'), win=document.getElementById('win');
const storyScreen=document.getElementById('storyScreen'), storyImage=document.getElementById('storyImage'), storySkip=document.getElementById('storySkip'), storyTimerEl=document.getElementById('storyTimer'), introSkip=document.getElementById('introSkip');
const levelEl=document.getElementById('level'), mushEl=document.getElementById('mush'), bossHud=document.getElementById('bossHud'), bossFill=document.getElementById('bossFill');
const msg=document.getElementById('msg'), attackBtn=document.getElementById('attack'), effectsEl=document.getElementById('effects');
const pauseBtn=document.getElementById('pauseBtn'), pauseScreen=document.getElementById('pauseScreen'), resumeBtn=document.getElementById('resumeBtn'), pauseMenuBtn=document.getElementById('pauseMenuBtn');
const continueBtn=document.getElementById('continueBtn'), continueScreen=document.getElementById('continueScreen'), continueCount=document.getElementById('continueCount'), continuesLeftEl=document.getElementById('continuesLeft'), controls=document.getElementById('controls'), settings=document.getElementById('settings'), creators=document.getElementById('creators'), mainButtons=document.getElementById('mainButtons');
let bossIgnoreTrees=false;
let W=0,H=0,dpr=1,state='title',level=1,last=0,keys={},touch={x:0,y:0},mushrooms=[],hallucMushrooms=[],bottles=[],trees=[],branches=[],decorTrees=[],decorBranches=[],grassDecor=[],birds=[],bridges=[],river=null,guard=null,boar=null,boss=null,kingShots=[],toast=0,paused=false,continuesLeft=3,deathCountdown=9,deathTimer=null,difficulty='normal',enemyMultiplier=1,introT=0,introDone=false,storyT=0,storyTimer=null,storyKind=0,endingPage=1,storyAudioTimer=null,storyAudioStep=0,secretMode=0,secretMushrooms=[],secretPillars=[],secretAliens=[],secretShots=[],secretLaserShots=[],secretT=0,ufoDisabled=false,abductT=0,ufoX=0,ufoY=0,secretFinishing=false,belzCovers=[],secretCovers=[],spaceRun=null,belzMushrooms=[],belzShots=[],belzAmmo=0;
const saveKey='toldi_v20_progress';
// Debug-only switches. They are active only for runs launched manually from Debug -> Wybór poziomu.
let debugManualRun=false, debugDisableEnemyProjectiles=false, debugDisableBoar=false;
// V95: token próby UFO 3 — unieważnia stare timery/callbacki po śmierci i kontynuacji.
let spaceEscapeRunId=0, spaceEscapeDeath=false;
// Debug / level registry. Dodanie nowego poziomu do tej tablicy automatycznie dodaje go do debugowania.
const LEVEL_REGISTRY=[
 {id:1,name:'Poziom 1'},
 {id:2,name:'Poziom 2'},
 {id:3,name:'Poziom 3'},
 {id:4,name:'Poziom 4'},
 {id:5,name:'Poziom 5'}
];
const LEVEL_MUSHROOM_COUNTS=[7,10,13,16,20];

// Exact Tołdi face taken from the game's cover; 3-frame idle/blink animation.
const toldiFace=new Image();
toldiFace.decoding='async';
toldiFace.src='toldi-face-v48-3frames.png';
let toldiFaceReady=false;
toldiFace.onload=()=>{toldiFaceReady=true};
// V150: wysokiej jakości animowane sprite'y Tołdiego; oryginalne 3 klatki twarzy pozostają źródłem twarzy w atlasach.
let toldiFacing='right',toldiMoveX=0,toldiMoveY=0,toldiAction='',toldiActionTimer=0;
const toldiAnimDefs={
 walkRight:{file:'toldi-walk-right.png?v=155',frames:8,fps:9},
 walkLeft:{file:'toldi-walk-left.png?v=155',frames:8,fps:9},
 idle:{file:'toldi-idle.png?v=155',frames:4,fps:2.8},
 collect:{file:'toldi-collect.png?v=155',frames:6,fps:8},
 drink:{file:'toldi-drink.png?v=155',frames:6,fps:6},
 hurt:{file:'toldi-hurt.png?v=155',frames:4,fps:10},
 death:{file:'toldi-death.png?v=155',frames:5,fps:5},
 jump:{file:'toldi-jump.png?v=155',frames:4,fps:8}
};
const toldiAnimSheets={};
for(const [key,def] of Object.entries(toldiAnimDefs)){
 const img=new Image();img.decoding='async';img.src=def.file;
 toldiAnimSheets[key]={img,frames:def.frames,fps:def.fps};
}

// V48: jedyny model auta używany w intro — nowy pixelowy Ford Mondeo Tołdiego, 7 klatek bocznych.
const mondeoSprite=new Image();
mondeoSprite.decoding='async';
mondeoSprite.src='mondeo-v48-7frames.png?v=155';
let mondeoSpriteReady=false;
mondeoSprite.onload=()=>{mondeoSpriteReady=true};
// V48: ten sam model po zatrzymaniu, ale bez kierowcy w środku.
const belzebubSprite=new Image();
belzebubSprite.src='belzebub-sprite-v47.png?v=155';
let belzebubSpriteReady=false;
belzebubSprite.onload=()=>{belzebubSpriteReady=true};
// V72: wieloklatkowy sprite Strażnika Lasu.
const guardIdleSprite=new Image(); guardIdleSprite.src='guard-idle-4.png';
const guardWalkRightSprite=new Image(); guardWalkRightSprite.src='guard-walk-right-4.png';
const guardWalkLeftSprite=new Image(); guardWalkLeftSprite.src='guard-walk-left-4.png';
const guardAlertSprite=new Image(); guardAlertSprite.src='guard-alert-3.png';
// V73: wieloklatkowy sprite Dzika Leśnego.
// V79: dzik korzysta z osobnych, dokładnie wyrównanych klatek PNG.
// Dzięki temu przeglądarka nigdy nie pobiera fragmentu sąsiedniej klatki.
const boarRun1Sprite=new Image(); boarRun1Sprite.src='boar-run-1.png?v=155';
const boarRun2Sprite=new Image(); boarRun2Sprite.src='boar-run-2.png?v=155';
const boarRun3Sprite=new Image(); boarRun3Sprite.src='boar-run-3.png?v=155';

// V125: premiumowy sprite Króla Prawdziwków.
const kingPrawdziwkowSprite=new Image();
kingPrawdziwkowSprite.decoding='async';
kingPrawdziwkowSprite.src='king-prawdziwkow-premium-solid.png?v=155';
let kingPrawdziwkowReady=false;
kingPrawdziwkowSprite.onload=()=>{kingPrawdziwkowReady=true};

// V118: nowy statek Tołdiego używany WYŁĄCZNIE podczas UFO 3 / ucieczki.
const toldiSpaceShipSprite=new Image();
toldiSpaceShipSprite.decoding='async';
toldiSpaceShipSprite.src='toldi-space-ship.png?v=155';
let toldiSpaceShipReady=false;
toldiSpaceShipSprite.onload=()=>{toldiSpaceShipReady=true};

const mondeoStaticSprite=new Image();
mondeoStaticSprite.decoding='async';
mondeoStaticSprite.src='mondeo-intro-driver-v149.png?v=155';
let mondeoStaticReady=false;
mondeoStaticSprite.onload=()=>{mondeoStaticReady=true};
const mondeoStaticEmptySprite=new Image();
mondeoStaticEmptySprite.decoding='async';
mondeoStaticEmptySprite.src='mondeo-intro-empty-v149.png?v=155';
let mondeoStaticEmptyReady=false;
mondeoStaticEmptySprite.onload=()=>{mondeoStaticEmptyReady=true};
const mondeoEmptySprite=new Image();
mondeoEmptySprite.decoding='async';
mondeoEmptySprite.src='mondeo-v48-7frames-empty.png?v=155';
let mondeoEmptyReady=false;
mondeoEmptySprite.onload=()=>{mondeoEmptyReady=true};

function resize(){dpr=Math.min(devicePixelRatio||1,2); W=c.clientWidth;H=c.clientHeight;c.width=W*dpr;c.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',resize); addEventListener('orientationchange',()=>setTimeout(resize,100)); resize();


// Mobile browsers may block autoplay. The first user gesture unlocks the 8-bit menu music.
const unlockMenuAudio=()=>{if(state==='title'&&!menuAudioTimer)startMenuMusic()};
['pointerdown','touchstart','click'].forEach(ev=>addEventListener(ev,unlockMenuAudio,{passive:true}));

document.getElementById('start').onclick=()=>startGame();
storySkip.onclick=()=>finishStory();
introSkip.onclick=()=>skipIntro();
document.getElementById('retry').onclick=()=>startGame();
document.getElementById('again').onclick=()=>startGame();
// Prevent Android/Chrome text-selection and long-press context menus while playing.
document.addEventListener('contextmenu', e => e.preventDefault(), {passive:false});
document.addEventListener('selectstart', e => e.preventDefault(), {passive:false});
document.addEventListener('dragstart', e => e.preventDefault(), {passive:false});
addEventListener('keydown',e=>{keys[e.key]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key===' '&&state==='play'&&level===5)attack()});
addEventListener('keyup',e=>keys[e.key]=false);

// V68: precyzyjny joystick dotykowy z 32 kierunkami (11.25°).
const joystick=document.getElementById('joystick'), joystickKnob=document.getElementById('joystickKnob');
let joystickPointer=null;
const JOY_R=87, KNOB_R=36, DEAD=12;
function setJoystickFromPoint(clientX,clientY){
 const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
 let dx=clientX-cx,dy=clientY-cy,dist=Math.hypot(dx,dy);
 if(dist<DEAD){touch.x=0;touch.y=0;joystickKnob.style.transform='translate(0,0)';return}
 const clamped=Math.min(dist,JOY_R);
 const angle=Math.atan2(dy,dx);
 // Kwantyzacja do 32 równych kierunków (11.25°).
 const sector=Math.round(angle/(Math.PI/16));
 const q=sector*(Math.PI/16);
 touch.x=Math.cos(q);touch.y=Math.sin(q);
 const kx=Math.cos(angle)*Math.min(clamped,JOY_R-KNOB_R),ky=Math.sin(angle)*Math.min(clamped,JOY_R-KNOB_R);
 joystickKnob.style.transform=`translate(${kx}px,${ky}px)`;
}
function resetJoystick(){joystickPointer=null;touch.x=0;touch.y=0;joystickKnob.style.transform='translate(0,0)'}
joystick.addEventListener('pointerdown',e=>{e.preventDefault();joystickPointer=e.pointerId;try{joystick.setPointerCapture(e.pointerId)}catch(_){}setJoystickFromPoint(e.clientX,e.clientY)},{passive:false});
joystick.addEventListener('pointermove',e=>{if(e.pointerId!==joystickPointer)return;e.preventDefault();setJoystickFromPoint(e.clientX,e.clientY)},{passive:false});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>joystick.addEventListener(ev,e=>{if(ev!=='lostpointercapture')e.preventDefault();resetJoystick()},{passive:false}));
addEventListener('blur',()=>{keys={};resetJoystick()});
attackBtn.addEventListener('pointerdown',e=>{e.preventDefault();attack()});

const P={x:70,y:0,r:13,speed:150,bag:0,bottles:0,inv:0,boost:0,hallu:0};

// V160: ukryj sterowanie gry we wszystkich podmenu; wracamy wyłącznie przyciskiem WRÓĆ.
function hideGameplayControlsForMenu(){
 controls.style.display='none'; pauseBtn.style.display='none'; attackBtn.style.display='none';
 const introSkipBtn=document.getElementById('introSkip'); if(introSkipBtn) introSkipBtn.style.display='none';
 resetJoystick();
}
function showTitleMenuButtons(){
 hideGameplayControlsForMenu();
 mainButtons.style.display='flex';
}
document.getElementById('settingsBtn').onclick=()=>{hideGameplayControlsForMenu();settings.style.display='flex';creators.style.display='none';mainButtons.style.display='none'};
document.getElementById('creatorsBtn').onclick=()=>{hideGameplayControlsForMenu();creators.style.display='flex';settings.style.display='none';mainButtons.style.display='none'};
document.getElementById('settingsBack').onclick=()=>{settings.style.display='none';showTitleMenuButtons()};
document.getElementById('creatorsBack').onclick=()=>{creators.style.display='none';showTitleMenuButtons()};
const debugMushroomBtn=document.getElementById('debugMushroomBtn'),debugScreen=document.getElementById('debugScreen'),debugLevelScreen=document.getElementById('debugLevelScreen'),debugLevels=document.getElementById('debugLevels'),debugBack=document.getElementById('debugBack'),debugLevelBack=document.getElementById('debugLevelBack');
const debugScenesScreen=document.getElementById('debugScenesScreen'),debugScenes=document.getElementById('debugScenes'),debugScenesBack=document.getElementById('debugScenesBack'),debugSceneViewer=document.getElementById('debugSceneViewer'),debugSceneImage=document.getElementById('debugSceneImage'),debugSceneTitle=document.getElementById('debugSceneTitle'),debugSceneClose=document.getElementById('debugSceneClose');
const debugProjectileToggle=document.getElementById('debugProjectileToggle'),debugBoarToggle=document.getElementById('debugBoarToggle'),debugInfiniteContinuesToggle=document.getElementById('debugInfiniteContinuesToggle');
let debugInfiniteContinues=false;
function updateContinuesDisplay(){if(continuesLeftEl)continuesLeftEl.textContent=debugInfiniteContinues?'Kontynuacje: ∞':`Kontynuacje: ${continuesLeft}`;}
const DEBUG_SCENES=[
 {title:'1. UFO — porwanie Tołdiego',image:'ufo-abduction-comic.png',note:'Sekretna scenka po porwaniu UFO na poziomie 3.'},
 {title:'2. Poziom 3 — scenka w lesie',image:'story-comic.png',note:'Scenka po ukończeniu poziomu 3.'},
 {title:'3. Poziom 4 — Cergowska i Król Prawdziwków',image:'story-comic2.png',note:'Scenka pomiędzy poziomem 4 a poziomem 5.'},
 {title:'4. Finał — część 1',image:'ending-comic-1.png',note:'Pierwsza część zakończenia gry.'},
 {title:'5. Finał — część 2',image:'ending-comic-2.png',note:'Druga część zakończenia gry.'},
 {title:'6. Finał — część 3',image:'ending-comic-3.png',note:'Trzecia i ostatnia część zakończenia.'},
 {title:'7. Prawdziwe zakończenie — Belzebub',image:'belzebub-true-ending-comic.png',note:'Komiks po pokonaniu Belzebuba; podgląd finału.'}
];
function closeDebugScreens(){if(debugScreen)debugScreen.style.display='none';if(debugLevelScreen)debugLevelScreen.style.display='none';if(debugScenesScreen)debugScenesScreen.style.display='none';if(debugSceneViewer)debugSceneViewer.style.display='none'}
function openDebug(){closeDebugScreens();creators.style.display='none';debugScreen.style.display='flex'}
function openDebugLevels(){closeDebugScreens();debugLevelScreen.style.display='flex';renderDebugLevels()}
function openDebugScenes(){closeDebugScreens();debugScenesScreen.style.display='flex';renderDebugScenes();if(debugScenes){debugScenes.scrollTop=0}}
function renderDebugScenes(){if(!debugScenes)return;debugScenes.innerHTML='';DEBUG_SCENES.forEach(scene=>{const card=document.createElement('button');card.className='debugSceneCard';card.innerHTML=`<img src="${scene.image}" alt="${scene.title}"><span class="debugSceneText"><b>${scene.title}</b><small>${scene.note}</small></span>`;card.onclick=()=>openDebugScene(scene);debugScenes.appendChild(card)})}
function openDebugScene(scene){if(!debugSceneViewer)return;debugSceneTitle.textContent=scene.title;debugSceneImage.src=scene.image;debugSceneImage.alt=scene.title;debugSceneViewer.style.display='flex'}
function closeDebugScene(){if(debugSceneViewer)debugSceneViewer.style.display='none'}
function renderDebugLevels(){
 debugLevels.innerHTML='';
 LEVEL_REGISTRY.forEach(item=>{const b=document.createElement('button');b.className='debugOption';b.textContent=`${item.name}`;b.onclick=()=>debugStartLevel(item.id);debugLevels.appendChild(b)});
 const u1=document.createElement('button');u1.className='debugOption secret';u1.textContent='🛸 Poziom UFO 1';u1.onclick=()=>debugStartSecret(1);debugLevels.appendChild(u1);
 const u2=document.createElement('button');u2.className='debugOption secret';u2.textContent='🛸 Poziom UFO 2';u2.onclick=()=>debugStartSecret(2);debugLevels.appendChild(u2);
 const u3=document.createElement('button');u3.className='debugOption secret';u3.textContent='🚀 UFO 3 — UCIECZKA + STATEK MATKA';u3.onclick=()=>debugStartSecret(3);debugLevels.appendChild(u3);
 const king=document.createElement('button');king.className='debugOption danger';king.textContent='🍄 WALKA Z KRÓLEM PRAWDZIWKÓW NATYCHMIAST';king.onclick=()=>debugStartKing();debugLevels.appendChild(king);
 const bz=document.createElement('button');bz.className='debugOption danger';bz.textContent='🔥 WALKA Z BELZEBUBEM NATYCHMIAST';bz.onclick=()=>debugStartBelz();debugLevels.appendChild(bz);
 if(debugProjectileToggle)debugProjectileToggle.checked=debugDisableEnemyProjectiles;
 if(debugBoarToggle)debugBoarToggle.checked=debugDisableBoar;
 if(debugInfiniteContinuesToggle)debugInfiniteContinuesToggle.checked=debugInfiniteContinues;
 updateContinuesDisplay();
}
function prepareDebugRun(){hideScreens();mainButtons.style.display='none';settings.style.display='none';creators.style.display='none';closeDebugScreens();if(storyTimer){clearInterval(storyTimer);storyTimer=null}storyScreen.style.display='none';if(introSkip)introSkip.style.display='none';paused=false;stopMenuMusic();stopStoryMusic();stopEngine();secretMode=0;secretMushrooms=[];secretPillars=[];secretAliens=[];secretShots=[];secretLaserShots=[];secretCovers=[];ufoDisabled=true;abductT=0;P.bag=0;P.bottles=0;P.inv=0;P.boost=0;P.hallu=0;state='play';controls.style.display='grid';pauseBtn.style.display='block';continueScreen.style.display='none';pauseScreen.style.display='none';startEngine()}
function debugStartLevel(n){debugManualRun=true;prepareDebugRun();level=n;setupLevel();ufoDisabled=n!==3;attackBtn.style.display='none';startMusic();showMsg(`DEBUG: ${LEVEL_REGISTRY[n-1]?.name||`Poziom ${n}`}`,1200)}
function debugStartSecret(n){
 debugManualRun=true;prepareDebugRun();
 // Start z debuggera ma zawsze zaczynać czystą próbę, bez stanu poprzedniego UFO 3.
 spaceRun=null;spaceEscapeRunId++;spaceEscapeDeath=false;last=performance.now();
 continuesLeft=difficulty==='easy'?9:difficulty==='normal'?5:3;
 updateContinuesDisplay();
 setupSecretLevel(n);updateUI();last=performance.now();
}
function debugStartKing(){
 debugManualRun=true;prepareDebugRun();level=5;setupLevel();
 mushrooms.forEach(m=>m.taken=true);
 // Debug boss fight must match the normal boss encounter: remove other enemies.
 guard=null;boar=null;belzebub=null;infernoBattle=false;boss=null;fireballs=[];kingShots=[];belzCovers=[];
 attackBtn.style.display='none';
 updateUI();
 // Trigger the game's normal King spawn path immediately.
 const bx=W*.80, by=Math.max(105,H*.19);
 boss={x:bx,y:by,r:25,hp:100,max:100,t:0,shootT:2.5,aiAngle:0,stuck:0};
 startBattleMusic('king');
 bossHud.style.display='block';
 const lab=bossHud.querySelector('div');if(lab)lab.textContent='🍄 KRÓL PRAWDZIWKÓW';
 showMsg('🍄 WALKA Z KRÓLEM PRAWDZIWKÓW!',1600);
}
function debugStartBelz(){debugManualRun=true;prepareDebugRun();level=5;setupLevel();mushrooms.forEach(m=>m.taken=true);startBelzebub();updateUI()}
if(debugProjectileToggle)debugProjectileToggle.addEventListener('change',()=>{debugDisableEnemyProjectiles=!!debugProjectileToggle.checked});
if(debugBoarToggle)debugBoarToggle.addEventListener('change',()=>{debugDisableBoar=!!debugBoarToggle.checked});
if(debugInfiniteContinuesToggle)debugInfiniteContinuesToggle.addEventListener('change',()=>{debugInfiniteContinues=!!debugInfiniteContinuesToggle.checked;updateContinuesDisplay();});
if(debugMushroomBtn)debugMushroomBtn.onclick=openDebug;
if(document.getElementById('debugLevelBtn'))document.getElementById('debugLevelBtn').onclick=openDebugLevels;
if(document.getElementById('debugScenesBtn'))document.getElementById('debugScenesBtn').onclick=openDebugScenes;
if(debugLevelBack)debugLevelBack.onclick=()=>{debugLevelScreen.style.display='none';debugScreen.style.display='flex'};
if(debugScenesBack)debugScenesBack.onclick=()=>{debugScenesScreen.style.display='none';debugScreen.style.display='flex'};
if(debugSceneClose)debugSceneClose.onclick=closeDebugScene;
if(debugSceneViewer)debugSceneViewer.addEventListener('click',e=>{if(e.target===debugSceneViewer)closeDebugScene()});
if(debugBack)debugBack.onclick=()=>{debugScreen.style.display='none';creators.style.display='flex'};

document.querySelectorAll('.difficulty').forEach(btn=>{
 btn.onclick=()=>{
  difficulty=btn.dataset.diff;
  enemyMultiplier=difficulty==='easy'?.60:difficulty==='hard'?1.30:difficulty==='ultra'?1.70:1;
  document.querySelectorAll('.difficulty').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  try{localStorage.setItem('toldiDifficulty',difficulty)}catch(e){}
 };
});
try{
 const saved=localStorage.getItem('toldiDifficulty');
 if(saved&&['easy','normal','hard','ultra'].includes(saved)){
  difficulty=saved;enemyMultiplier=difficulty==='easy'?.60:difficulty==='hard'?1.30:difficulty==='ultra'?1.70:1;
  const b=document.querySelector(`[data-diff="${saved}"]`);if(b)b.classList.add('selected');
 }else document.querySelector('[data-diff="normal"]').classList.add('selected');
}catch(e){document.querySelector('[data-diff="normal"]').classList.add('selected')}

function hideScreens(){title.style.display='none';gameover.style.display='none';win.style.display='none'}
function bindAction(el,fn){
 el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fn()},{passive:false});
 el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation()});
}
bindAction(pauseBtn,()=>setPaused(true));
bindAction(resumeBtn,()=>setPaused(false));
bindAction(pauseMenuBtn,goToMainMenu);
bindAction(continueBtn,continueGame);

let audioCtx=null,audioTimer=null,audioStep=0,activeMusicKey='',menuAudioTimer=null,menuAudioStep=0,engineTimer=null,engineStep=0;
const menuMusic={name:'Disco Flet 8-bit',tempo:210,bass:[110,110,147,165,110,147,123,98],flute:[659,784,880,784,659,587,659,784,988,880,784,659,587,659,784,880]};
// Wszystkie utwory poniżej są autorskimi aranżacjami motywu menu: ta sama harmonia/motyw, ale inne instrumentarium, tempo i rytm.
const musicTracks=[
 {name:'Sielanka — Chillout 16-bit',tempo:235,bass:[110,110,147,165,110,147,123,98],lead:[659,784,880,784,659,587,659,784],pad:[330,392,440,392],drum:0},
 {name:'Leśna przygoda — 16-bit',tempo:185,bass:[110,110,147,165,110,147,123,98],lead:[659,784,988,880,784,659,587,659],pad:[330,392,440,494],drum:1},
 {name:'Głębia lasu — 16-bit+',tempo:160,bass:[82,110,98,123,110,147,123,98],lead:[523,659,784,880,784,659,587,659],pad:[262,330,392,440],drum:1},
 {name:'Cergowska — Advanced 16-bit',tempo:145,bass:[73,98,110,123,98,110,147,123],lead:[440,523,659,784,659,587,523,494],pad:[220,262,330,392],drum:2},
 {name:'Koszmar grzybiorza — 16-bit',tempo:130,bass:[55,73,82,98,73,82,110,98],lead:[330,392,494,587,494,440,392,330],pad:[165,196,247,294],drum:2}
];
const secretTracks={
 1:{name:'UFO 1 — Kosmiczny synth',tempo:175,bass:[82,98,123,110,82,110,147,123],lead:[330,392,523,494,392,330,370,440],pad:[165,196,247,220]},
 2:{name:'UFO 2 — Gwiezdny FM',tempo:150,bass:[73,98,110,123,73,110,147,123],lead:[294,370,440,523,440,370,330,392],pad:[147,185,220,262]},
 3:{name:'UFO 3 — Kosmiczna eskalacja',tempo:148,bass:[55,55,82,73,55,98,82,73],lead:[220,262,330,392,330,294,262,349],pad:[110,138,165,196]}
};
const battleTracks={
 king:{name:'Król Prawdziwków — Demoniczny chór',tempo:155,bass:[55,55,65,73,55,82,73,98],lead:[220,277,330,370,330,277,247,196],pad:[110,138,165,185]},
 belz:{name:'Belzebub — Piekielny chór',tempo:125,bass:[41,41,49,55,41,62,55,49],lead:[165,196,247,294,247,220,196,147],pad:[82,98,123,110]}
};
function ensureAudio(){
 if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)();
 if(audioCtx.state==='suspended')audioCtx.resume();
}
function playTone(freq,dur,gain,type='square'){
 if(!audioCtx)return;
 const n=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();
 o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(gain,n+.008);g.gain.exponentialRampToValueAtTime(.0001,n+dur);o.connect(g).connect(audioCtx.destination);o.start(n);o.stop(n+dur+.01);
}
function vibrate(ms=28){
 try{if(navigator.vibrate)navigator.vibrate(ms)}catch(e){}
}
function playLaserSfx(){
 try{ensureAudio();if(!audioCtx)return;const n=audioCtx.currentTime;
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sawtooth';
  o.frequency.setValueAtTime(1250,n);o.frequency.exponentialRampToValueAtTime(180,n+.19);
  g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(.075,n+.008);g.gain.exponentialRampToValueAtTime(.0001,n+.21);
  o.connect(g).connect(audioCtx.destination);o.start(n);o.stop(n+.22);
  const click=audioCtx.createOscillator(),cg=audioCtx.createGain();click.type='square';click.frequency.value=95;cg.gain.setValueAtTime(.035,n);cg.gain.exponentialRampToValueAtTime(.0001,n+.055);click.connect(cg).connect(audioCtx.destination);click.start(n);click.stop(n+.06);
 }catch(e){}
}
function playPickupSfx(kind){
 try{
  ensureAudio();
  if(!audioCtx)return;
  if(kind==='mushroom'){
   playTone(784,.07,.035,'triangle');
   setTimeout(()=>playTone(1047,.09,.028,'sine'),45);
  }else if(kind==='halluc'){
   playTone(260,.055,.030,'sawtooth');
   setTimeout(()=>playTone(520,.075,.024,'square'),35);
   setTimeout(()=>playTone(780,.09,.018,'sine'),70);
  }else if(kind==='bottle'){
   playTone(330,.06,.026,'triangle');
   setTimeout(()=>playTone(247,.09,.024,'sine'),55);
   setTimeout(()=>playTone(392,.13,.022,'square'),105);
  }
 }catch(e){}
 vibrate(28);
}
function playMusicTick(tr,step,mode='normal'){
 const n=audioCtx.currentTime, b=tr.bass[step%tr.bass.length], l=tr.lead[step%tr.lead.length], p=tr.pad[step%tr.pad.length];
 if(mode==='chill'){
  playTone(b,.42,.026,'triangle');
  playTone(l,.34,.020,'sine');
  if(step%4===0)playTone(p,.80,.010,'triangle');
 }else if(mode==='ufo'){
  playTone(b,.24,.040,'sawtooth');
  playTone(l,.16,.022,'square');
  playTone(l*2,.07,.009,'sine');
  if(step%2===0)playTone(p,.30,.012,'triangle');
 }else if(mode==='ufo3'){
  // Epicka, rytmiczna elektronika: pulsujący bas, szeroki akord i spokojniejszy lead.
  playTone(b,.32,.050,'sawtooth');
  if(step%2===0)playTone(b*2,.11,.018,'square');
  playTone(l,.25,.022,'triangle');
  if(step%2===0)playTone(p,.48,.018,'sawtooth');
  if(step%4===0){playTone(l*1.5,.20,.010,'sine');playTone(48,.075,.022,'square');}
 }else if(mode==='demon'){
  playTone(b,.30,.050,'sawtooth');
  playTone(l,.20,.022,'square');
  playTone(p,.55,.014,'triangle');
  // warstwa „chóru”: równoległe, niskie głosy bez próbek wokalnych
  if(step%2===0){playTone(p*2,.34,.010,'sine');playTone(p*3,.26,.007,'triangle');}
 }else{
  playTone(b,.20,.045,'square');
  if(step%2===0)playTone(l,.14,.020,'square');
  if(step%4===0)playTone(p,.32,.010,'triangle');
  if(tr.drum&&step%2===0)playTone(70+tr.drum*18,.055,.012,'square');
 }
}
function startMenuMusic(){
 try{ensureAudio(); if(menuAudioTimer)return; menuAudioStep=0;
  const tick=()=>{if(state!=='title'){stopMenuMusic();return} const n=menuMusic.flute[menuAudioStep%menuMusic.flute.length];playTone(menuMusic.bass[Math.floor(menuAudioStep/2)%menuMusic.bass.length],.22,.035,'square');playTone(n,.16,.022,'square'); if(menuAudioStep%4===0)playTone(n/2,.28,.012,'triangle');menuAudioStep++};
  tick();menuAudioTimer=setInterval(tick,menuMusic.tempo);
 }catch(e){}
}
function stopMenuMusic(){if(menuAudioTimer){clearInterval(menuAudioTimer);menuAudioTimer=null}}
function startStoryMusic(){
 try{ensureAudio();stopMusic();stopMenuMusic();if(storyAudioTimer)return;storyAudioStep=0;
  const notes=[196,233,262,311,262,233,175,196,220,262,294,262,220,196,147,175];
  const tick=()=>{if(!audioCtx||state!=='story'){if(state!=='story')stopStoryMusic();return}
   const n=notes[storyAudioStep%notes.length];playTone(n,.30,.018,'triangle');
   if(storyAudioStep%2===0)playTone(n*2,.20,.009,'sine');
   if(storyAudioStep%8===0)playTone(n/2,.42,.012,'square');storyAudioStep++;
  }; tick();storyAudioTimer=setInterval(tick,360);
 }catch(e){}
}
function stopStoryMusic(){if(storyAudioTimer){clearInterval(storyAudioTimer);storyAudioTimer=null}}
function startEngine(){
 try{ensureAudio();if(engineTimer)return;engineStep=0;
  const tick=()=>{if(!audioCtx||state!=='intro'){if(state!=='intro')stopEngine();return} const n=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='square';o.frequency.value=72+(engineStep%4)*7;g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(.028,n+.01);g.gain.exponentialRampToValueAtTime(.0001,n+.13);o.connect(g).connect(audioCtx.destination);o.start(n);o.stop(n+.14);engineStep++;if(engineStep%8===0)playTone(48,.18,.018,'triangle')};
  tick();engineTimer=setInterval(tick,135);
 }catch(e){}
}
function stopEngine(){if(engineTimer){clearInterval(engineTimer);engineTimer=null}}
function startMusic(){
 try{
  ensureAudio();stopMenuMusic();
  const trackIndex=Math.max(0,Math.min(musicTracks.length-1,level-1));
  const key='level:'+trackIndex;
  if(audioTimer&&activeMusicKey===key)return;
  stopMusic();activeMusicKey=key;audioStep=0;
  const tr=musicTracks[trackIndex]||musicTracks[0];
  const tick=()=>{if(!audioCtx||state!=='play'){if(state!=='play')stopMusic();return}playMusicTick(tr,audioStep,'normal');audioStep++};
  tick();audioTimer=setInterval(tick,tr.tempo);
 }catch(e){}
}
function startBattleMusic(kind){
 try{
  ensureAudio();stopMenuMusic();
  const key='battle:'+kind;if(audioTimer&&activeMusicKey===key)return;
  stopMusic();activeMusicKey=key;audioStep=0;const tr=battleTracks[kind]||battleTracks.king;
  const tick=()=>{if(!audioCtx||state!=='play'){if(state!=='play')stopMusic();return}playMusicTick(tr,audioStep,'demon');audioStep++};
  tick();audioTimer=setInterval(tick,tr.tempo);
 }catch(e){}
}
function stopMusic(){if(audioTimer){clearInterval(audioTimer);audioTimer=null}activeMusicKey=''}
function startSecretMusic(){
 try{ensureAudio();const key='secret:'+secretMode;if(audioTimer&&activeMusicKey===key)return;stopMusic();activeMusicKey=key;audioStep=0;const tr=secretTracks[secretMode]||secretTracks[1];
  const mode=secretMode===3?'ufo3':'ufo';
  const tick=()=>{if(!audioCtx||state!=='secret'){if(state!=='secret')stopMusic();return}playMusicTick(tr,audioStep,mode);audioStep++};
  tick();audioTimer=setInterval(tick,tr.tempo);
 }catch(e){}
}
function closeAudio(){stopMusic();stopMenuMusic();stopEngine();if(audioCtx){audioCtx.close();audioCtx=null}}
function closeAudio(){stopMusic();stopMenuMusic();stopEngine();if(audioCtx){audioCtx.close();audioCtx=null}}


function setPaused(v){
 if(state!=='play'&&state!=='secret')return;
 paused=!!v;
 pauseScreen.style.display=v?'flex':'none';
 pauseBtn.style.display=v?'none':'block';
 controls.style.display=v?'none':'grid';
 if(audioCtx){try{v?audioCtx.suspend():audioCtx.resume()}catch(e){}}
}
function goToMainMenu(){
 if(deathTimer){clearInterval(deathTimer);deathTimer=null}
 paused=false;state='title';secretMode=0;spaceRun=null;secretShots=[];secretLaserShots=[];secretAliens=[];secretPillars=[];secretMushrooms=[];ufoDisabled=false;stopMusic();stopStoryMusic();stopEngine();
 pauseScreen.style.display='none';continueScreen.style.display='none';gameover.style.display='none';win.style.display='none';
 title.style.display='flex';mainButtons.style.display='flex';controls.style.display='none';pauseBtn.style.display='none';
 startMenuMusic();
}
function beginDeathSequence(){
 if(state==='death'||state==='over'||state==='win'||state==='title')return;
 if(!debugInfiniteContinues&&continuesLeft<=0){finishGameByDeaths();return}
 // Zapamiętaj, że śmierć nastąpiła w UFO 3. Stara arena nie może później
 // wykonać żadnego zaległego callbacka po wznowieniu gry.
 spaceEscapeDeath=(state==='secret'&&secretMode===3);
 if(spaceEscapeDeath && spaceRun) spaceRun.finished=true;
 state='death';paused=false;pauseBtn.style.display='none';controls.style.display='none';stopMusic();stopEngine();
 continueScreen.style.display='flex';deathCountdown=9;continueCount.textContent='9';updateContinuesDisplay();
 if(deathTimer)clearInterval(deathTimer);
 deathTimer=setInterval(()=>{
   deathCountdown--;continueCount.textContent=String(Math.max(0,deathCountdown));
   if(deathCountdown<=0){
     clearInterval(deathTimer);deathTimer=null;continueScreen.style.display='none';state='over';gameover.style.display='flex';
     document.getElementById('overText').textContent='Tołdi został złapany!';
     setTimeout(()=>{if(state==='over')goToMainMenu()},2200);
   }
 },1000);
}
function finishGameByDeaths(){
 if(deathTimer){clearInterval(deathTimer);deathTimer=null}
 continuesLeft=0;
 continuesLeftEl.textContent='Kontynuacje: 0';
 continueScreen.style.display='none';pauseScreen.style.display='none';controls.style.display='none';pauseBtn.style.display='none';state='over';stopMusic();stopEngine();
 document.getElementById('overText').textContent='Koniec Gry - byłeś za słaby!  Życia: 0';
 gameover.querySelector('h1').textContent='KONIEC GRY';gameover.style.display='flex';
 setTimeout(()=>{if(state==='over')goToMainMenu()},2200);
}
function continueGame(){
 if(state!=='death'||(!debugInfiniteContinues&&continuesLeft<=0))return;
 if(deathTimer){clearInterval(deathTimer);deathTimer=null}
 if(!debugInfiniteContinues){continuesLeft--;updateContinuesDisplay();}
 if(!debugInfiniteContinues&&continuesLeft===0){finishGameByDeaths();return}
 continueScreen.style.display='none';pauseScreen.style.display='none';gameover.style.display='none';paused=false;

 // UFO 3 ma osobny, pełny reset próby. Jest używany zarówno w normalnej
 // sekwencji sekretu, jak i po uruchomieniu UFO 3 z menu debugowania.
 if(spaceEscapeDeath || secretMode===3){
   spaceEscapeDeath=false;
   restartSpaceEscapeAttempt();
   updateUI();
   last=performance.now();
   showMsg(`KONTYNUACJA! Ucieczka od początku. Pozostało: ${continuesLeft}`,1400);
   return;
 }

 P.x=secretMode?W*.5:55;P.y=secretMode?H-55:H-65;P.inv=5;P.boost=0;P.hallu=0;
 // V164: bez animacji leżenia — po odrodzeniu Tołdi zawsze wraca do stojącej pozycji.
 toldiAction='';toldiActionTimer=0;toldiMoveX=0;toldiMoveY=0;
 if(secretMode){secretShots=[];for(const a of secretAliens){a.x=a.x<W*.5?W*.16:W*.84;a.y=H*.22;a.shoot=1;a.stuck=0;a.stun=0}}
 if(guard){guard.x=Math.max(80,W*.82);guard.y=80;guard.t=0;guard.animT=0;guard.dir='left';guard.moving=false}
 if(boar){boar.x=Math.max(80,W*.18);boar.y=Math.max(100,H*.55);boar.t=0}
 if(boss){boss.x=W*.5;boss.y=Math.max(70,H*.18);boss.t=0}
 stopEngine();state=secretMode?'secret':'play';last=performance.now();controls.style.display='grid';pauseBtn.style.display='block';if(secretMode)startSecretMusic();else startMusic();showMsg(`KONTYNUACJA! Pozostało: ${continuesLeft}`,1200);
}

function startStory(kind){
  if(storyTimer){clearInterval(storyTimer);storyTimer=null}
  storyKind=kind;state='story';storyT=15;paused=false;stopStoryMusic();stopMusic();stopEngine();
  controls.style.display='none';pauseBtn.style.display='none';
  if(introSkip)introSkip.style.display='none';
  storyImage.src=kind===2?'story-comic2.png':'story-comic.png';
  storyImage.alt=kind===2?'Przerywnik fabularny Tołdiego — Cergowska i Król Prawdziwków':'Przerywnik fabularny Tołdiego i dzika';
  storyScreen.style.display='flex';storyTimerEl.textContent='15';
  storyTimer=setInterval(()=>{
    storyT--;storyTimerEl.textContent=String(Math.max(0,storyT));
    if(storyT<=0)finishStory();
  },1000);
}
function startStoryAfterLevel3(){startStory(1)}
function startUFOStory(){
  if(storyTimer){clearInterval(storyTimer);storyTimer=null}
  storyKind=4;state='story';storyT=15;paused=false;stopStoryMusic();stopMusic();stopEngine();
  controls.style.display='none';pauseBtn.style.display='none';
  if(introSkip)introSkip.style.display='none';
  storyImage.src='ufo-abduction-comic.png';
  storyImage.alt='Przerywnik fabularny — Tołdi porwany przez UFO';
  storyScreen.style.display='flex';storyTimerEl.textContent='15';startStoryMusic();
  storyTimer=setInterval(()=>{
    storyT--;storyTimerEl.textContent=String(Math.max(0,storyT));
    if(storyT<=0)finishStory();
  },1000);
}
function finishStory(){
 if(state!=='story')return;
 if(storyTimer){clearInterval(storyTimer);storyTimer=null}
 if(storyKind===5){storyScreen.style.display='none';storyT=0;stopStoryMusic();saveProgress(true);goToMainMenu();return;}
 if(storyKind===4){storyScreen.style.display='none';storyT=0;stopStoryMusic();setupSecretLevel(1);return;}
 if(storyKind===3){
  if(endingPage<3){endingPage++;storyT=15;storyTimerEl.textContent='15';storyImage.src=`ending-comic-${endingPage}.png`;storyTimer=setInterval(()=>{storyT--;storyTimerEl.textContent=String(Math.max(0,storyT));if(storyT<=0)finishStory()},1000);return;}
  storyScreen.style.display='none';storyT=0;stopStoryMusic();saveProgress(true);goToMainMenu();return;
 }
 const nextLevel=storyKind===2?5:4;storyScreen.style.display='none';storyT=0;level=nextLevel;setupLevel();state='play';controls.style.display='grid';pauseBtn.style.display='block';startMusic();showMsg(`POZIOM ${level}`,900);
}
function startBelzebubEndingComic(){
 if(storyTimer){clearInterval(storyTimer);storyTimer=null}
 storyKind=5;storyT=30;paused=false;state='story';stopMusic();stopEngine();stopStoryMusic();
 controls.style.display='none';pauseBtn.style.display='none';if(introSkip)introSkip.style.display='none';
 storyImage.src='belzebub-true-ending-comic.png?v=168';storyImage.alt='Prawdziwe zakończenie — komiks po pokonaniu Belzebuba';
 storyScreen.style.display='flex';storyTimerEl.textContent='30';startStoryMusic();
 storyTimer=setInterval(()=>{storyT--;storyTimerEl.textContent=String(Math.max(0,storyT));if(storyT<=0)finishStory()},1000);
}
function startEndingStory(){
  if(storyTimer){clearInterval(storyTimer);storyTimer=null}
  endingPage=1;storyKind=3;state='story';storyT=15;paused=false;stopMusic();stopEngine();
  controls.style.display='none';pauseBtn.style.display='none';
  storyImage.src='ending-comic-1.png';storyImage.alt='Finałowa scena fabularna Tołdiego — część 1';
  storyScreen.style.display='flex';storyTimerEl.textContent='15';startStoryMusic();
  storyTimer=setInterval(()=>{storyT--;storyTimerEl.textContent=String(Math.max(0,storyT));if(storyT<=0)finishStory()},1000);
}

function startGame(){
  debugManualRun=false;
  hideScreens();
  mainButtons.style.display='none';
  settings.style.display='none'; creators.style.display='none';
  stopMenuMusic();
  if(storyTimer){clearInterval(storyTimer);storyTimer=null}
  storyScreen.style.display='none';
  startEngine();
  level=1; infernoBattle=false; belzebub=null; fireballs=[]; secretCovers=[]; secretMode=0;secretMushrooms=[];secretPillars=[];secretAliens=[];secretShots=[];ufoDisabled=false;abductT=0; P.bag=0; P.bottles=0; P.inv=0; P.boost=0; continuesLeft=difficulty==='easy'?9:difficulty==='normal'?5:3; paused=false; pauseBtn.style.display='none'; pauseScreen.style.display='none'; continueScreen.style.display='none'; state='intro'; introT=0; introDone=false; toldiMoveX=0;toldiMoveY=0;toldiAction='';toldiActionTimer=0; if(introSkip)introSkip.style.display='block';
  setupLevel(); saveProgress();
}
function setupLevel(){
 P.x=55;P.y=H-65;P.speed=150+level*5;P.inv=0;P.boost=0;P.hallu=0;
 const baseCounts=LEVEL_MUSHROOM_COUNTS;
 const counts=difficulty==='ultra'?baseCounts.map(n=>n+5):baseCounts; secretMode=0;secretMushrooms=[];secretPillars=[];secretAliens=[];secretShots=[];secretLaserShots=[];secretCovers=[]; mushrooms=[];hallucMushrooms=[];bottles=[];trees=[];branches=[];decorTrees=[];decorBranches=[];grassDecor=[];birds=[];bridges=[];boss=null;belzebub=null;fireballs=[];kingShots=[];infernoBattle=false;guard=null;boar=null;
 const riverY=H*(.35+.035*level);
 const amp=H*(.055+.012*level);
 const phase=level*1.2;
 river={y:riverY,amp,phase,thick:Math.max(82,H*.12)};

 // Three wide bridges. Their approach corridors are kept free of obstacles.
 for(let i=0;i<3;i++){
   const x=W*(.18+i*.32);
   bridges.push({x,w:Math.max(70,W*.16),y:riverEdgeY(x)});
 }

 // Obstacles are generated randomly, but with spacing and guaranteed clear routes.
 // Start zone + bridge corridors stay clear so no level can spawn Tołdi inside a blockage.
 const obstacleOK=(x,y,r)=>{
   if(x<r+12||x>W-r-12||y<r+105||y>H-r-175)return false; // keep HUD and touch controls clear
   if(Math.hypot(x-P.x,y-P.y)<105+r)return false; // always clear around spawn
   if(inWater(x,y))return false; // never put obstacles in water
   for(const b of bridges){
     const approach=Math.abs(x-b.x)<b.w*.72;
     if(approach && Math.abs(y-b.y)<125)return false; // bridge + approach lane
   }
   for(const t of trees)if(Math.hypot(x-t.x,y-t.y)<r+t.r+28)return false;
   for(const b of branches)if(Math.hypot(x-b.x,y-b.y)<r+35)return false;
   return true;
 };

 let tries=0;
 while(trees.length<12+level*2 && tries++<5000){
   const r=15+Math.random()*10,x=25+Math.random()*(W-50),y=45+Math.random()*(H-105);
   if(obstacleOK(x,y,r))trees.push({x,y,r,type:['pine','spruce','oak','birch','fir'][Math.floor(Math.random()*5)]});
 }
 tries=0;
 while(branches.length<6+Math.floor(level/2) && tries++<5000){
   const x=25+Math.random()*(W-50),y=55+Math.random()*(H-115);
   if(obstacleOK(x,y,25)){ const w=34+Math.random()*46; branches.push({x,y,w,a:Math.random()*6.28,shape:Math.floor(Math.random()*4),twist:(Math.random()-.5)*.5}); }
 }

 // Purely decorative forest floor layer. It has ZERO collision/gameplay effect.
 let grassSeed=(level*92821+17)>>>0;
 const grassRand=()=>{grassSeed=(grassSeed*1664525+1013904223)>>>0;return grassSeed/4294967296};
 grassDecor=[];
 // Main field + extra edge density: the very top and bottom are deliberately filled too.
 const grassCount=Math.min(2200,Math.floor(W*H/760)); let grassTries=0;
 while(grassDecor.length<grassCount && grassTries++<grassCount*12){
   const x=5+grassRand()*(W-10), y=5+grassRand()*(H-10);
   if(inWater(x,y)||onBridge(x,y)||Math.hypot(x-P.x,y-P.y)<38) continue;
   let near=false;
   for(const t of trees) if(Math.hypot(x-t.x,y-t.y)<t.r+7){near=true;break}
   if(near) continue;
   for(const b of branches) if(Math.hypot(x-b.x,y-b.y)<15){near=true;break}
   if(near) continue;
   grassDecor.push({x,y,h:4+Math.floor(grassRand()*8),w:2+Math.floor(grassRand()*4),a:(grassRand()-.5)*.6,kind:grassRand()<.78?'tuft':'sprig',flip:grassRand()<.5});
 }
 // Extra edge vegetation: small trees and fallen branches are visual only and never enter blocked().
 decorTrees=[]; decorBranches=[];
 const decorTypes=['pine','spruce','oak','birch','fir'];
 const addDecorTree=(x,y,r)=>{
   if(x<r+4||x>W-r-4||y<r+4||y>H-r-4||inWater(x,y)||onBridge(x,y))return false;
   if(Math.hypot(x-P.x,y-P.y)<65)return false;
   for(const t of trees)if(Math.hypot(x-t.x,y-t.y)<r+t.r*.55+8)return false;
   for(const t of decorTrees)if(Math.hypot(x-t.x,y-t.y)<r+t.r*.6+10)return false;
   decorTrees.push({x,y,r,type:decorTypes[Math.floor(grassRand()*decorTypes.length)]}); return true;
 };
 // Dense top and bottom forest rims, plus a few side clumps.
 let edgeTries=0;
 while(decorTrees.length<Math.min(34,18+level*3) && edgeTries++<2500){
   const band=grassRand();
   let x,y;
   if(band<.46){x=18+grassRand()*(W-36);y=16+grassRand()*82;}
   else if(band<.92){x=18+grassRand()*(W-36);y=Math.max(18,H-100+grassRand()*78);}
   else {x=14+grassRand()<.5?14:W-14;y=130+grassRand()*Math.max(30,H-330);}
   addDecorTree(x,y,10+grassRand()*11);
 }
 let branchTries=0;
 while(decorBranches.length<Math.min(24,12+level*2) && branchTries++<1800){
   const top=grassRand()<.5;
   const x=18+grassRand()*(W-36), y=top?(18+grassRand()*92):(H-105+grassRand()*82);
   if(inWater(x,y)||onBridge(x,y))continue;
   decorBranches.push({x,y,w:22+grassRand()*38,a:grassRand()*6.28,edge:true});
 }

 // Kosmetyczne ptaki — nie mają kolizji ani wpływu na rozgrywkę.
 birds=[];
 const birdCount=Math.max(5,Math.min(9,5+Math.floor(level/2)));
 for(let i=0;i<birdCount;i++){
   birds.push({
     x:W*(.05+Math.random()*.9), y:H*(.08+Math.random()*.25),
     vx:(18+Math.random()*28)*(Math.random()<.5?-1:1),
     phase:Math.random()*Math.PI*2, size:2.5+Math.random()*1.8,
     flap:Math.random()*Math.PI*2
   });
 }

 // Mushrooms are never placed on bridges, in water, in an obstacle, or in the spawn zone.
 const mushroomOK=(x,y)=>{
   // Keep every collectible inside the real playable/visible field.
   // The top HUD and bottom touch controls are treated as hard no-spawn zones.
   const pad=14;
   if(blocked(x,y,10))return false;
   if(y<112 || y>H-205) return false;
   if(x<pad+10 || x>W-pad-10) return false;
   if(onBridge(x,y))return false;
   if(Math.hypot(x-P.x,y-P.y)<75)return false;
   // Never hide mushrooms under the joystick or the ATAK button.
   const joyR=102, joyX=W*.5, joyY=H-87;
   if(Math.hypot(x-joyX,y-joyY)<joyR+10)return false;
   const atkW=78, atkH=78, atkX=W-14-atkW/2, atkY=H-38-atkH/2;
   if(x>atkX-atkW/2-12 && x<atkX+atkW/2+12 && y>atkY-atkH/2-12 && y<atkY+atkH/2+12)return false;
   for(const m of mushrooms)if(Math.hypot(x-m.x,y-m.y)<48)return false;
   // Include BOTH gameplay obstacles and purely decorative vegetation.
   for(const t of trees)if(Math.hypot(x-t.x,y-t.y)<t.r+24)return false;
   for(const b of branches)if(Math.hypot(x-b.x,y-b.y)<42)return false;
   for(const t of decorTrees)if(Math.hypot(x-t.x,y-t.y)<t.r+18)return false;
   for(const b of decorBranches)if(Math.hypot(x-b.x,y-b.y)<38)return false;
   return true;
 };
 tries=0;
 while(mushrooms.length<counts[level-1]&&tries++<10000){
   const x=25+Math.random()*(W-50),y=35+Math.random()*(H-70);
   if(mushroomOK(x,y))mushrooms.push({x,y,taken:false});
 }

 // V43: 1 colorful hallucination mushroom on levels 1–4, 2 on level 5.
 // It is a separate collectible and does not count toward the normal mushroom objective.
 const hallucCount=difficulty==='ultra'?(level===5?4:(level===4?3:2)):(level===5?2:1);
 tries=0;
 while(hallucMushrooms.length<hallucCount&&tries++<10000){
   const x=25+Math.random()*(W-50),y=35+Math.random()*(H-70);
   if(mushroomOK(x,y) && !hallucMushrooms.some(h=>Math.hypot(x-h.x,y-h.y)<70)){
     hallucMushrooms.push({x,y,taken:false,phase:Math.random()*6.28});
   }
 }

 // 1–3 bottles per level. They obey the same safe placement rules as mushrooms.
 const bottleCount=Math.min(3,1+Math.floor((level-1)/2));
 const bottleOK=(x,y)=>{
   if(!mushroomOK(x,y))return false;
   for(const f of bottles)if(Math.hypot(x-f.x,y-f.y)<75)return false;
   return true;
 };
 tries=0;
 while(bottles.length<bottleCount&&tries++<10000){
   const x=30+Math.random()*(W-60),y=40+Math.random()*(H-80);
   if(bottleOK(x,y))bottles.push({x,y,taken:false});
 }

 belzCovers=[];
 secretCovers=[];
 ufoDisabled = level!==3;
 // Strażnik jest obecny na każdym normalnym poziomie 1–5.
 // Dzik pojawia się od poziomu 4. Obaj znikają dopiero przy starcie walki z Belzebubem.
 guard={x:W*.78,y:80,r:14,t:0,animT:0,dir:'left',moving:false};
 boar=(level>=4 && !(debugManualRun&&debugDisableBoar))?{x:W*.2,y:85,r:24,t:Math.PI,animT:0,moving:false,dir:'right',charging:false,avoidAngle:0,avoidSide:1,avoidT:0}:null;
 updateUI();
 bossHud.style.display='none';attackBtn.style.display='none';
 showMsg(`POZIOM ${level}`,900);
}
function riverCenter(x){return river.y+Math.sin(x*.018+river.phase)*river.amp}
function riverEdgeY(x){return riverCenter(x)}
function onBridge(x,y){return bridges.some(b=>Math.abs(x-b.x)<b.w/2 && Math.abs(y-b.y)<river.thick*.72)}
function inWater(x,y){return Math.abs(y-riverCenter(x))<river.thick/2}
function blocked(x,y,r=10){
 if(x<r||x>W-r||y<r||y>H-r)return true;
 if(secretMode){
   for(const p of secretPillars)if(Math.hypot(x-p.x,y-p.y)<r+p.r*.72)return true;
   for(const o of secretCovers)if(Math.hypot(x-o.x,y-o.y)<r+o.r)return true;
   return false;
 }
 if(inWater(x,y)&&!onBridge(x,y))return true;
 if(infernoBattle)for(const o of belzCovers)if(Math.hypot(x-o.x,y-o.y)<r+o.r)return true;
 if(!bossIgnoreTrees) for(const t of trees)if(Math.hypot(x-t.x,y-t.y)<r+t.r*.65)return true;
 return false;
}
function moveEnt(e,dx,dy){
 // V52: bezpieczny ruch przy rzece. Zamiast próbować przeskakiwać przez wodę
 // wybieramy osobno składową X/Y, dzięki czemu postać może płynnie ślizgać się
 // wzdłuż brzegu i nie zostaje zablokowana w narożniku kolizji.
 if(!Number.isFinite(e.x)||!Number.isFinite(e.y)){
   e.x=Math.max(e.r||10,Math.min(W-(e.r||10),55));
   e.y=Math.max(e.r||10,Math.min(H-(e.r||10),H-65));
 }
 const maxX=Math.max(e.r||10,W-(e.r||10)),maxY=Math.max(e.r||10,H-(e.r||10));
 const nx=e.x+dx, ny=e.y+dy;
 // Najpierw pełny ruch. Jeżeli blokada (szczególnie brzeg rzeki), próbujemy
 // osobno X i Y — to daje naturalne przesuwanie się po brzegu.
 if(!blocked(nx,ny,e.r)){
   e.x=Math.max(e.r,Math.min(maxX,nx)); e.y=Math.max(e.r,Math.min(maxY,ny));
 }else{
   if(Math.abs(dx)>0.001 && !blocked(e.x+dx,e.y,e.r)) e.x=Math.max(e.r,Math.min(maxX,e.x+dx));
   if(Math.abs(dy)>0.001 && !blocked(e.x,e.y+dy,e.r)) e.y=Math.max(e.r,Math.min(maxY,e.y+dy));
 }
 // Awaryjne zabezpieczenie: nigdy nie pozwól, aby encja znalazła się w wodzie
 // poza mostem. Przesuń ją na najbliższy brzeg zamiast zerować jej pozycję.
 if(!secretMode && inWater(e.x,e.y) && !onBridge(e.x,e.y)){
   const yc=riverCenter(e.x), half=river.thick/2+e.r+2;
   const up=yc-half, down=yc+half;
   const target=Math.abs(e.y-up)<=Math.abs(e.y-down)?up:down;
   if(!blocked(e.x,target,e.r)) e.y=Math.max(e.r,Math.min(maxY,target));
   else if(!blocked(e.x,up,e.r)) e.y=Math.max(e.r,Math.min(maxY,up));
   else if(!blocked(e.x,down,e.r)) e.y=Math.max(e.r,Math.min(maxY,down));
 }
 // Twardy bezpiecznik pozycji — zapobiega ewentualnemu „teleportowi” do (0,0).
 if(!Number.isFinite(e.x)||!Number.isFinite(e.y)){
   e.x=Math.max(e.r,Math.min(maxX,55));
   e.y=Math.max(e.r,Math.min(maxY,H-65));
 }
}
function nearestPathTarget(e){
 // Guard and boar use distinct lanes/routes, both obey water/bridge collision.
 const lane = e===guard ? .22 : .70;
 const targetX=W*lane;
 const targetY=H*.18+((e.t*70)%Math.max(80,H*.45));
 return {x:targetX,y:targetY};
}
function chase(e,range){
 const d=Math.hypot(P.x-e.x,P.y-e.y);
 if(d<range){return [Math.sign(P.x-e.x),Math.sign(P.y-e.y)]}
 const t=nearestPathTarget(e); return [Math.sign(t.x-e.x),Math.sign(t.y-e.y)]
}
// V53: inteligentne omijanie przeszkód dla przeciwników.
// Zamiast zatrzymywać się na drzewie, przeciwnik wybiera najlepszy z 16 kierunków
// i płynnie zmienia tor ruchu. Nadal każda pozycja przechodzi przez blocked(),
// więc drzewa, brzeg rzeki i inne przeszkody pozostają nieprzekraczalne.
function bossBlocked(x,y,r=10){
 // Król ignoruje drzewa, gałęzie i pozostałe przeszkody. Tylko woda go zatrzymuje.
 // Przy moście cały pas mostu jest przejezdny, również dla środka dużego hitboxa.
 if(x<r||x>W-r||y<r||y>H-r)return true;
 if(secretMode||!river||!inWater(x,y))return false;
 const bridgePass=bridges.some(b=>Math.abs(x-b.x)<b.w/2+r && Math.abs(y-riverCenter(x))<river.thick/2+r*1.5);
 return !bridgePass;
}
function moveBossSmooth(e,targetX,targetY,speed,dt){
 const total=Math.max(0,speed*dt);if(total<=0)return;
 let remaining=total;
 let angle=Number.isFinite(e.aiAngle)?e.aiAngle:Math.atan2(targetY-e.y,targetX-e.x);
 while(remaining>0.01){
   const step=Math.min(remaining,6);
   const base=Math.atan2(targetY-e.y,targetX-e.x);
   const candidates=[];
   for(let k=0;k<32;k++){
     const off=k===0?0:Math.ceil(k/2)*(k%2?1:-1)*(Math.PI*2/32);
     candidates.push(base+off);
   }
   candidates.push(angle,angle+Math.PI/2,angle-Math.PI/2,angle+Math.PI);
   let best=null,bestScore=-Infinity;
   const d0=Math.hypot(targetX-e.x,targetY-e.y)||1;
   for(const a of candidates){
     const ca=Math.cos(a),sa=Math.sin(a),nx=e.x+ca*step,ny=e.y+sa*step;
     if(bossBlocked(nx,ny,e.r))continue;
     const d1=Math.hypot(targetX-nx,targetY-ny);
     const turn=Math.abs(Math.atan2(Math.sin(a-angle),Math.cos(a-angle)));
     let score=(d0-d1)*14-turn*.55;
     let clear=0;
     for(const mul of [2,4,6,8]){
       if(!bossBlocked(e.x+ca*step*mul,e.y+sa*step*mul,e.r))clear++;
       else score-=7/mul;
     }
     score+=clear*3;
     if(score>bestScore){bestScore=score;best={a,nx,ny}}
   }
   if(!best)break;
   angle=best.a;e.x=best.nx;e.y=best.ny;remaining-=step;
 }
 e.aiAngle=angle;
}
function moveEnemy(e,targetX,targetY,speed,dt){
 // V124: wspólne, odporne na zakleszczenia omijanie przeszkód.
 // Przeciwnik wybiera kierunek na podstawie celu + wolnej przestrzeni,
 // a po wykryciu utknięcia przechodzi w tryb „obchodzenia” przeszkody.
 const total=Math.max(0,speed*dt); if(total<=0)return;
 if(!Number.isFinite(e.x)||!Number.isFinite(e.y)){
   e.x=Math.max(e.r,Math.min(W-e.r,W*.5)); e.y=Math.max(e.r,Math.min(H-e.r,H*.5));
 }
 e._lastX=Number.isFinite(e._lastX)?e._lastX:e.x;
 e._lastY=Number.isFinite(e._lastY)?e._lastY:e.y;
 e._stuckT=Math.max(0,(e._stuckT||0)-dt);
 e._avoidT=Math.max(0,(e._avoidT||0)-dt);
 let remaining=total;
 while(remaining>0.01){
   const step=Math.min(remaining,6);
   const base=Math.atan2(targetY-e.y,targetX-e.x);
   const current=Number.isFinite(e.aiAngle)?e.aiAngle:base;
   const candidates=[];
   // Gęsta siatka kierunków. Kierunek poprzedni jest preferowany,
   // dzięki czemu przeciwnik nie szarpie się lewo/prawo przy krawędzi.
   for(let k=0;k<40;k++){
     const off=(k===0)?0:Math.ceil(k/2)*(k%2?1:-1)*(Math.PI*2/40);
     candidates.push(base+off);
   }
   candidates.push(current,current+Math.PI/2,current-Math.PI/2,current+Math.PI);

   let best=null,bestScore=-Infinity;
   const dist0=Math.hypot(targetX-e.x,targetY-e.y)||1;
   for(const a of candidates){
     const ca=Math.cos(a),sa=Math.sin(a);
     const nx=e.x+ca*step,ny=e.y+sa*step;
     if(blocked(nx,ny,e.r))continue;
     const d1=Math.hypot(targetX-nx,targetY-ny);
     let score=(dist0-d1)*12;
     const turn=Math.abs(Math.atan2(Math.sin(a-current),Math.cos(a-current)));
     score-=turn*.72;
     if(e._avoidT>0 && turn>Math.PI*.58)score-=18;
     // Patrz kilka kroków naprzód. Odrzucamy kierunki kończące się
     // w ślepym zaułku, nawet jeśli pierwszy krok jest wolny.
     let clear=0;
     for(const mul of [2,3.5,5,7,9]){
       const qx=e.x+ca*step*mul,qy=e.y+sa*step*mul;
       if(!blocked(qx,qy,e.r))clear++; else score-=13/mul;
     }
     score+=clear*2.8;
     // Delikatne odsuwanie od przeszkód po bokach zapobiega przyklejaniu.
     const leftBlocked=blocked(e.x+ca*e.r*.3-sa*e.r*1.25,e.y+sa*e.r*.3+ca*e.r*1.25,e.r);
     const rightBlocked=blocked(e.x+ca*e.r*.3+sa*e.r*1.25,e.y+sa*e.r*.3-ca*e.r*1.25,e.r);
     if(leftBlocked&&rightBlocked)score-=16;
     if(e._avoidSide && ((e._avoidSide>0&&!rightBlocked)||(e._avoidSide<0&&!leftBlocked)))score+=7;
     if(score>bestScore){bestScore=score;best={a,nx,ny}}
   }

   if(best){
     e.aiAngle=best.a;
     e.x=best.nx;e.y=best.ny;
     if(Math.hypot(e.x-e._lastX,e.y-e._lastY)<.15)e._stuckT+=step/Math.max(speed,1);
     else e._stuckT=0;
     if(e._stuckT>.18){e._avoidT=.85;e._avoidSide=e._avoidSide||1;}
   }else{
     e._stuckT+=step/Math.max(speed,1);e._avoidT=.85;
     // Pełny wybór kierunku ratunkowego, preferujący wolną przestrzeń.
     let escape=null,escapeScore=-Infinity;
     for(let k=0;k<48;k++){
       const a=k*(Math.PI*2/48),ca=Math.cos(a),sa=Math.sin(a);
       const dist=Math.min(step*1.5,7),nx=e.x+ca*dist,ny=e.y+sa*dist;
       if(blocked(nx,ny,e.r))continue;
       let sc=0;
       for(const mul of [2,4,6,8])if(!blocked(e.x+ca*dist*mul,e.y+sa*dist*mul,e.r))sc+=3;
       sc-=Math.hypot(targetX-nx,targetY-ny)*.02;
       if(sc>escapeScore){escapeScore=sc;escape={a,nx,ny}}
     }
     if(escape){e.aiAngle=escape.a;e.x=escape.nx;e.y=escape.ny;}
   }
   e._lastX=e.x;e._lastY=e.y;
   remaining-=step;
 }
 // Jeżeli przez chwilę prawie nie ruszył, wymuś nowy kierunek w następnym kroku.
 if(e._stuckT>.55){e._avoidT=.95;e._avoidSide=(e._avoidSide||1)*-1;e.aiAngle+=e._avoidSide*Math.PI/2;e._stuckT=0;}
}

// V124: dzik korzysta z tego samego stabilnego systemu, ale zachowuje
// wcześniejszą „lepkość” kierunku, dzięki której nie oscyluje przy przeszkodach.
function moveBoarStable(targetX,targetY,speed,dt){
 if(!boar)return;
 const e=boar,total=Math.max(0,speed*dt);if(total<=0)return;
 e._boarLock=Math.max(0,(e._boarLock||0)-dt);
 let remaining=total;
 while(remaining>0.01){
   const step=Math.min(remaining,5.5),base=Math.atan2(targetY-e.y,targetX-e.x);
   const cur=Number.isFinite(e.avoidAngle)?e.avoidAngle:base;
   const front=blocked(e.x+Math.cos(cur)*step*2.8,e.y+Math.sin(cur)*step*2.8,e.r);
   if(!front && e._boarLock<=0){
     const diff=Math.atan2(Math.sin(base-cur),Math.cos(base-cur));
     e.avoidAngle=cur+Math.max(-.12,Math.min(.12,diff));
   }else if(front && e._boarLock<=0){
     let best=null,bestScore=-Infinity;
     const preferred=e.avoidSide||1;
     for(const side of [preferred,-preferred]){
       for(const off of [Math.PI*.50,Math.PI*.625,Math.PI*.75]){
         const a=base+side*off,ca=Math.cos(a),sa=Math.sin(a),nx=e.x+ca*step,ny=e.y+sa*step;
         if(blocked(nx,ny,e.r))continue;
         let clear=0;for(const mul of [2,3.5,5,7])if(!blocked(e.x+ca*step*mul,e.y+sa*step*mul,e.r))clear++;
         let sc=clear*40-Math.hypot(targetX-nx,targetY-ny)*.08+(side===preferred?22:0);
         if(sc>bestScore)bestScore=sc,best={a,nx,ny,side};
       }
     }
     if(best){e.avoidAngle=best.a;e.avoidSide=best.side;e._boarLock=.62;}
   }
   let a=Number.isFinite(e.avoidAngle)?e.avoidAngle:base;
   let nx=e.x+Math.cos(a)*step,ny=e.y+Math.sin(a)*step;
   if(blocked(nx,ny,e.r)){
     e._boarLock=0;e.avoidSide=(e.avoidSide||1)*-1;
     const alt=base+e.avoidSide*Math.PI/2,ax=e.x+Math.cos(alt)*step,ay=e.y+Math.sin(alt)*step;
     if(!blocked(ax,ay,e.r)){e.avoidAngle=alt;nx=ax;ny=ay;e._boarLock=.62;}
     else {remaining-=step;continue;}
   }
   e.x=nx;e.y=ny;remaining-=step;
 }
}

// Belzebub ma osobne AI: nie może „przykleić się” do skały ani drzewa.
function moveBoarStable(targetX,targetY,speed,dt){
 if(!boar)return;
 const e=boar;
 const total=Math.max(0,speed*dt); if(total<=0)return;
 if(!Number.isFinite(e.avoidAngle)) e.avoidAngle=Math.atan2(targetY-e.y,targetX-e.x);
 e.avoidT=Math.max(0,(e.avoidT||0)-dt);
 let remaining=total;
 while(remaining>0.01){
   const step=Math.min(remaining,5);
   const base=Math.atan2(targetY-e.y,targetX-e.x);
   const current=Number.isFinite(e.avoidAngle)?e.avoidAngle:base;
   const frontBlocked=blocked(e.x+Math.cos(base)*step*2.2,e.y+Math.sin(base)*step*2.2,e.r);
   if(!frontBlocked && e.avoidT<=0){
     // Wracaj spokojnie do celu; nie obracaj się przy najmniejszej różnicy.
     const diff=Math.atan2(Math.sin(base-current),Math.cos(base-current));
     e.avoidAngle=current+Math.max(-0.18,Math.min(0.18,diff));
   }else if(frontBlocked && e.avoidT<=0){
     // Wybierz raz stronę obejścia i trzymaj ją przez chwilę.
     let best=null,bestScore=-Infinity;
     const sideBias=e.avoidSide||1;
     for(const side of [1,-1]){
       for(const radius of [Math.PI/2,Math.PI*.625,Math.PI*.75]){
         const a=base+side*radius;
         const ca=Math.cos(a),sa=Math.sin(a);
         const nx=e.x+ca*step,ny=e.y+sa*step;
         if(blocked(nx,ny,e.r))continue;
         let clear=0;
         for(const mul of [2,3.5,5,7]){
           if(!blocked(e.x+ca*step*mul,e.y+sa*step*mul,e.r))clear++;
         }
         const d=Math.hypot(targetX-nx,targetY-ny);
         let score=-d+clear*55-(side===sideBias?0:10);
         // Preferuj bok zgodny z poprzednim obejściem, żeby nie oscylować.
         if(side===sideBias)score+=35;
         if(score>bestScore){bestScore=score;best={a,nx,ny,side}}
       }
     }
     if(best){
       e.avoidAngle=best.a;e.avoidSide=best.side;e.avoidT=.72;
     }
   }
   const a=Number.isFinite(e.avoidAngle)?e.avoidAngle:base;
   const ca=Math.cos(a),sa=Math.sin(a);
   let nx=e.x+ca*step,ny=e.y+sa*step;
   if(blocked(nx,ny,e.r)){
     // Jeśli wybrany bok jednak jest zamknięty, dopiero wtedy zmień stronę.
     e.avoidT=0;
     const alt=base+(e.avoidSide>=0?1:-1)*Math.PI/2;
     const ax=e.x+Math.cos(alt)*step,ay=e.y+Math.sin(alt)*step;
     if(!blocked(ax,ay,e.r)){e.avoidAngle=alt;e.avoidSide=e.avoidSide>=0?-1:1;nx=ax;ny=ay;e.avoidT=.72}
     else {remaining-=step;continue}
   }
   e.x=nx;e.y=ny;
   remaining-=step;
 }
}

function belzCanOccupy(x,y,r){
 // Belzebub lata nad wszystkimi elementami mapy, także nad rzeką.
 // Ograniczeniem są wyłącznie granice obszaru gry.
 return x>=r && x<=W-r && y>=r && y<=H-r;
}
function moveBelzebub(dt,speed){
 if(!belzebub)return;
 const bz=belzebub;
 // Belzebub stale ściga Tołdiego na całej planszy — bez celów ograniczonych do górnej części ekranu.
 const tx=Math.max(bz.r,Math.min(W-bz.r,P.x));
 const ty=Math.max(bz.r,Math.min(H-bz.r,P.y));
 const dx=tx-bz.x,dy=ty-bz.y;
 const len=Math.hypot(dx,dy);
 if(len<1)return;
 const step=Math.min(len,Math.max(0,speed*dt));
 const parts=Math.max(1,Math.ceil(step/5));
 for(let i=0;i<parts;i++){
  const nx=bz.x+(dx/len)*(step/parts);
  const ny=bz.y+(dy/len)*(step/parts);
  // Brak kolizji z drzewami, skałami, osłonami i wodą.
  if(belzCanOccupy(nx,ny,bz.r+2)){bz.x=nx;bz.y=ny;}
  else break;
 }
}

function startAbduction(){
 if(secretMode||ufoDisabled||state!=='play'||level!==3)return;
 state='abduct';abductT=0;touch.x=0;touch.y=0;stopMusic();showMsg('🛸 TOŁDI JEST TRANSPORTOWANY!',1200);
}
function setupSecretLevel(n){
 secretMode=n;secretT=0;secretFinishing=false;secretMushrooms=[];secretPillars=[];secretAliens=[];secretShots=[];secretLaserShots=[];secretCovers=[];
 P.x=W*.5;P.y=H-55;P.inv=1.5;P.boost=0;P.hallu=0;
 if(n===3){setupSpaceEscape();return;}
 let seed=(0x9e3779b9+n*7919)>>>0;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const ok=(x,y,r=12)=>{if(x<r+12||x>W-r-12||y<r+100||y>H-r-145)return false;for(const p of secretPillars)if(Math.hypot(x-p.x,y-p.y)<r+p.r+24)return false;return true};
 let tries=0;while(secretPillars.length<8+n*2&&tries++<5000){const r=15+rnd()*9,x=25+rnd()*(W-50),y=45+rnd()*(H-190);if(ok(x,y,r))secretPillars.push({x,y,r,rot:rnd()*6.28,phase:rnd()*6.28});}
 // Osłony podobne do areny Belzebuba: prawdziwe przeszkody, które zatrzymują pociski.
 const coverSpots=[
   [W*.22,H*.30,30],[W*.55,H*.25,31],
   [W*.34,H*.62,31],[W*.76,H*.64,30]
 ];
 for(const [x,y,r] of coverSpots){if(!blocked(x,y,r+4))secretCovers.push({x,y,r});}
 tries=0;while(secretMushrooms.length<(n===1?12:16)&&tries++<10000){const x=28+rnd()*(W-56),y=115+rnd()*(H-175);if(blocked(x,y,10)||secretMushrooms.some(m=>Math.hypot(x-m.x,y-m.y)<48))continue;secretMushrooms.push({x,y,taken:false,phase:rnd()*6.28});}
 const alienCount=(difficulty==='easy'||difficulty==='normal')?1:2;
 secretAliens=[{x:W*.16,y:H*.22,r:15,t:0,shoot:1.0,aiAngle:0,stuck:0,stun:0,phase:rnd()*6.28}];
 if(alienCount===2)secretAliens.push({x:W*.84,y:H*.30,r:15,t:Math.PI,shoot:1.7,aiAngle:Math.PI,stuck:0,stun:0,phase:rnd()*6.28});
 state='secret';pauseBtn.style.display='block';controls.style.display='grid';bossHud.style.display='none';attackBtn.style.display='none';startSecretMusic();showMsg(`🛸 SEKRETNY POZIOM ${n} — KOSMICZNE GRZYBY!`,1800);
}
function restartSpaceEscapeAttempt(){
  // Unieważnij wszystkie stare timeouty związane z poprzednią próbą.
  spaceEscapeRunId++;
  const runId=spaceEscapeRunId;
  spaceRun={runId,phase:'waves',wave:1,remaining:3,spawned:0,spawnT:.35,enemyShootT:2.5,score:0,stars:[],laser:[],enemyShots:[],enemies:[],boss:null,finished:false,flash:0,waveTransitioning:false};
  for(let i=0;i<105;i++) spaceRun.stars.push({x:Math.random()*W,y:Math.random()*H,z:.25+Math.random()*.95,len:8+Math.random()*24});
  // Stan Tołdiego i UI ustawiamy dopiero po utworzeniu kompletnej areny.
  P.x=W*.5;P.y=H*.78;P.r=15;P.inv=2.5;P.boost=0;P.hallu=0;
  secretMode=3;secretShots=[];secretLaserShots=[];secretAliens=[];secretPillars=[];secretMushrooms=[];secretCovers=[];
  state='secret';paused=false;last=performance.now();pauseScreen.style.display='none';continueScreen.style.display='none';gameover.style.display='none';
  pauseBtn.style.display='block';controls.style.display='grid';bossHud.style.display='none';attackBtn.style.display='block';attackBtn.textContent='ATAK';
  stopMusic();startSecretMusic();
  return runId;
}
function setupSpaceEscape(){
  restartSpaceEscapeAttempt();
  showMsg('🚀 UCIECZKA TOŁDIEGO — WRACAMY NA ZIEMIĘ!',1800);
}
function finishSpaceEscape(){
  if(!spaceRun||spaceRun.finished||spaceEscapeDeath)return;
  const completedRunId=spaceRun.runId;spaceRun.finished=true;spaceEscapeRunId++;
  stopMusic();secretMode=0;ufoDisabled=true;spaceRun=null;secretShots=[];secretLaserShots=[];secretAliens=[];secretMushrooms=[];secretPillars=[];secretCovers=[];
  P.x=55;P.y=H-65;P.inv=2;state='play';paused=false;last=performance.now();pauseScreen.style.display='none';continueScreen.style.display='none';
  pauseBtn.style.display='block';controls.style.display='grid';attackBtn.style.display='none';attackBtn.textContent='ATAK';
  updateUI();startMusic();showMsg(debugManualRun?'🛠️ TEST UFO 3 ZAKOŃCZONY — POWRÓT DO POZIOMU 3':'🌍 TOŁDI WRÓCIŁ NA ZIEMIĘ! Poziom 3 trwa dalej.',1800);
}
function finishSecretLevel(){
 if(secretFinishing){secretFinishing=false;}
 if(secretMode===2){secretMode=3;secretShots=[];secretAliens=[];setupSecretLevel(3);return;}
 if(secretMode===3){finishSpaceEscape();return;}
 secretMode++;secretShots=[];secretAliens=[];
 if(secretMode<=2){setupSecretLevel(secretMode);return;}
 secretMode=0;ufoDisabled=true;secretMushrooms=[];secretPillars=[];secretShots=[];secretLaserShots=[];secretAliens=[];secretCovers=[];P.x=55;P.y=H-65;P.inv=2;state='play';pauseBtn.style.display='block';controls.style.display='grid';attackBtn.style.display='none';attackBtn.textContent='ATAK';updateUI();startMusic();showMsg('🛸 MISJA SEKRETNA UKOŃCZONA! Wracamy do lasu.',1800);
}
function updateAbduction(dt){
 abductT+=dt;if(abductT>=1.8){startUFOStory();return}
}
function updateSpaceEscape(dt){
  if(!spaceRun)return;
  P.inv=Math.max(0,P.inv-dt);spaceRun.flash=Math.max(0,spaceRun.flash-dt);
  for(const st of spaceRun.stars){st.y+=dt*(180+st.z*620);if(st.y>H+30){st.y=-20;st.x=Math.random()*W;st.z=.25+Math.random()*.95;st.len=8+Math.random()*24;}}
  let dx=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0)+touch.x,dy=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0)+touch.y;
  const len=Math.hypot(dx,dy);if(len){dx/=len;dy/=len;const sp=255;P.x=Math.max(24,Math.min(W-24,P.x+dx*sp*dt));P.y=Math.max(58,Math.min(H-55,P.y+dy*sp*dt));}
  if(spaceRun.phase==='waves'){
    spaceRun.spawnT-=dt;
    if(spaceRun.remaining>0&&spaceRun.spawnT<=0){
      const i=spaceRun.spawned;const x=35+Math.random()*(W-70);
      spaceRun.enemies.push({x:x,y:-35-Math.random()*55,r:15,hp:1,t:Math.random()*6.28,speed:82+spaceRun.wave*14+Math.random()*28,side:(i%2?1:-1),phase:Math.random()*6.28});
      spaceRun.spawned++;spaceRun.remaining--;spaceRun.spawnT=.22+Math.random()*.34;
    }
    for(const e of spaceRun.enemies){e.t+=dt;e.y+=e.speed*dt;e.x+=Math.sin(e.t*2+e.phase)*35*dt*e.side;
      // UFO, które doleci do dołu, wraca od góry — nie zalicza się jako zniszczone.
      if(e.y>H+e.r){e.y=-e.r-10;e.x=35+Math.random()*Math.max(1,W-70);}
    }
    // Tylko jeden mały statek strzela naraz; po każdym strzale globalna przerwa wynosi 6 s.
    spaceRun.enemyShootT-=dt;
    if(spaceRun.enemyShootT<=0&&spaceRun.enemies.length){
      const shooter=spaceRun.enemies[Math.floor(Math.random()*spaceRun.enemies.length)];
      const a=Math.atan2(P.y-shooter.y,P.x-shooter.x),v=155;
      spaceRun.enemyShots.push({x:shooter.x,y:shooter.y+12,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:6,life:6});
      spaceRun.enemyShootT=6;
    }
    // Zmiana fali jest jednorazowa i następuje dopiero po wystrzeleniu
    // wszystkich statków z bieżącej fali oraz zniszczeniu każdego z nich.
    if(spaceRun.remaining===0&&spaceRun.enemies.length===0&&!spaceRun.waveTransitioning){
      spaceRun.waveTransitioning=true;
      if(spaceRun.wave<3){
        spaceRun.wave++;spaceRun.remaining=spaceRun.wave===2?6:8;spaceRun.spawned=0;spaceRun.spawnT=.7;
        showMsg(`🚀 FALA ${spaceRun.wave}/3`,1100);
        spaceRun.waveTransitioning=false;
      }else{
        spaceRun.phase='boss';spaceRun.boss={x:W/2,y:-H*.36,w:W*1.10,h:H*.62,hp:320,max:320,shootT:.8,t:0,cockpitR:Math.min(58,W*.13),nextGun:1};
        showMsg('👽 STATEK MATKA NADLATA!',1800);
      }
    }
  } else if(spaceRun.phase==='boss'){
    const b=spaceRun.boss;b.t+=dt;if(b.y<H*.22)b.y=Math.min(H*.22,b.y+125*dt);b.x=W/2;b.shootT-=dt;
    if(b.shootT<=0){
      b.shootT=1.05;
      // V120: statek matka strzela tylko jednym pociskiem z jednego działa.
      // Działa pracują naprzemiennie: lewe -> prawe -> lewe -> prawe.
      b.nextGun=(b.nextGun===1)?-1:1;
      const side=b.nextGun;
      const cx=b.x+side*(W*.31),cy=b.y+b.h*.38;
      const a=Math.atan2(P.y-cy,P.x-cx);
      const shotSpeed=145*.70;
      spaceRun.enemyShots.push({x:cx,y:cy,vx:Math.cos(a)*shotSpeed,vy:Math.sin(a)*shotSpeed,r:7,life:5});
    }
  }
  for(let i=spaceRun.laser.length-1;i>=0;i--){const l=spaceRun.laser[i];l.x+=l.vx*dt;l.y+=l.vy*dt;l.life-=dt;if(l.life<=0||l.y<-40||l.y>H+40){spaceRun.laser.splice(i,1);continue}let hit=false;
    if(spaceRun.phase==='waves')for(let j=spaceRun.enemies.length-1;j>=0;j--){const e=spaceRun.enemies[j];if(Math.hypot(l.x-e.x,l.y-e.y)<e.r+8){spaceRun.enemies.splice(j,1);spaceRun.score++;hit=true;break}}
    if(spaceRun.phase==='boss'&&spaceRun.boss){const b=spaceRun.boss,cx=b.x,cy=b.y+b.h*.39;if(Math.hypot(l.x-cx,l.y-cy)<b.cockpitR){b.hp=Math.max(0,b.hp-8);spaceRun.flash=.12;hit=true;}}
    if(hit)spaceRun.laser.splice(i,1);
  }
  for(let i=spaceRun.enemyShots.length-1;i>=0;i--){const f=spaceRun.enemyShots[i];f.x+=f.vx*dt;f.y+=f.vy*dt;f.life-=dt;if(f.life<=0||f.x<-30||f.x>W+30||f.y<-30||f.y>H+30){spaceRun.enemyShots.splice(i,1);continue}if(Math.hypot(P.x-f.x,P.y-f.y)<P.r+f.r&&P.inv<=0){spaceRun.enemyShots.splice(i,1);beginDeathSequence();return}}
  for(let i=spaceRun.enemies.length-1;i>=0;i--){const e=spaceRun.enemies[i];if(Math.hypot(P.x-e.x,P.y-e.y)<P.r+e.r&&P.inv<=0){spaceRun.enemies.splice(i,1);beginDeathSequence();return}}
  if(spaceRun.phase==='boss'&&spaceRun.boss&&spaceRun.boss.hp<=0){
  const runId=spaceRun.runId;showMsg('💥 STATEK MATKA ZNISZCZONY!',1200);spaceRun.phase='done';
  setTimeout(()=>{if(state==='secret'&&secretMode===3&&spaceRun&&spaceRun.runId===runId&&!spaceRun.finished)finishSpaceEscape()},1250);
}
  updateUI();
}
function updateSecret(dt){
 if(secretMode===3){updateSpaceEscape(dt);return}

 P.inv=Math.max(0,P.inv-dt);P.boost=Math.max(0,P.boost-dt);P.hallu=Math.max(0,P.hallu-dt);
 let dx=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0)+touch.x,dy=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0)+touch.y;const len=Math.hypot(dx,dy);if(len){dx/=len;dy/=len;moveEnt(P,dx*P.speed*dt,dy*P.speed*dt)}
 for(const m of secretMushrooms)if(!m.taken&&Math.hypot(P.x-m.x,P.y-m.y)<25){m.taken=true;showMsg('🍄‍🟣 KOSMICZNY GRZYB!',450)}
 const slow=P.hallu>0?.20:1;
 for(const a of secretAliens){a.t+=dt;if(a.stun>0){a.stun=Math.max(0,a.stun-dt)}else{const target=nearestSecretTarget(a);moveEnemy(a,target.x,target.y,(58+secretMode*7)*enemyMultiplier*slow,dt);}a.shoot-=dt;if(a.shoot<=0&&!a.stun){a.shoot=1.15+Math.random()*.65;if(!(debugManualRun&&debugDisableEnemyProjectiles)){const ang=Math.atan2(P.y-a.y,P.x-a.x);const shotSpeed=170*.60;secretShots.push({x:a.x,y:a.y,vx:Math.cos(ang)*shotSpeed,vy:Math.sin(ang)*shotSpeed,r:6,life:4});}}}
 for(let i=secretLaserShots.length-1;i>=0;i--){
   const l=secretLaserShots[i];l.life-=dt;l.x+=l.vx*dt;l.y+=l.vy*dt;
   if(l.life<=0||l.x<-30||l.x>W+30||l.y<-30||l.y>H+30){secretLaserShots.splice(i,1);continue}
   let hit=false;
   for(const a of secretAliens){if(a.stun<=0&&Math.hypot(l.x-a.x,l.y-a.y)<a.r+8){a.stun=8;hit=true;showMsg('⚡ KOSMITA OBEZWŁADNIONY! 8s',650);break}}
   if(hit)secretLaserShots.splice(i,1);
 }
 for(let i=secretShots.length-1;i>=0;i--){const f=secretShots[i];const nx=f.x+f.vx*dt,ny=f.y+f.vy*dt;f.life-=dt;
   if(f.life<=0||nx<-20||nx>W+20||ny<-20||ny>H+20){secretShots.splice(i,1);continue}
   if(secretCovers.some(o=>Math.hypot(nx-o.x,ny-o.y)<o.r+f.r)){secretShots.splice(i,1);continue}
   f.x=nx;f.y=ny;
   if(Math.hypot(P.x-f.x,P.y-f.y)<P.r+f.r&&P.inv<=0){secretShots.splice(i,1);beginDeathSequence();return}}
 for(const a of secretAliens)if(Math.hypot(P.x-a.x,P.y-a.y)<26&&P.inv<=0){beginDeathSequence();return}
 if(secretMushrooms.every(m=>m.taken)&&!secretFinishing){secretFinishing=true;showMsg(secretMode===1?'🛸 PIERWSZY SEKRET UKOŃCZONY!':'🛸 DRUGI SEKRET UKOŃCZONY!',1000);setTimeout(()=>{if(state==='secret')finishSecretLevel()},850)}
 updateUI();
}
function nearestSecretTarget(a){
 const side=a.x<W*.5?.28:.72;const y=H*.25+((a.t*55)%Math.max(100,H*.42));
 return Math.hypot(P.x-a.x,P.y-a.y)<240?P:{x:W*side,y};
}
function skipIntro(){
 if(state!=='intro')return;
 introT=8.6;
 introDone=true;
 stopEngine();
 if(introSkip)introSkip.style.display='none';
 state='play';
 controls.style.display='grid';
 pauseBtn.style.display='block';
 startMusic();
 showMsg(`POZIOM ${level}`,900);
}

function update(dt){
 if(state==='story')return;
 if(state==='abduct'){updateAbduction(dt);return}
 // Samonaprawa UFO 3: jeżeli po śmierci/zmianie stanu arena nie istnieje,
 // odtwórz ją zanim updateSecret spróbuje z niej skorzystać.
 if(state==='secret'&&secretMode===3&&!spaceRun){restartSpaceEscapeAttempt();return}
 if(state==='secret'){if(!paused)updateSecret(dt);return}
 if(state==='intro'){
  introT+=dt;
  // Po wjechaniu auto zatrzymuje się. Silnik pracuje tylko podczas dojazdu.
  if(introT>=3.15) stopEngine();
  if(introT>=8.6){skipIntro()}
  return;
 }
 if(state!=='play')return;
 if(toldiActionTimer>0){toldiActionTimer=Math.max(0,toldiActionTimer-dt);if(toldiActionTimer===0)toldiAction='';}
 // Ptaki lecą cały czas w tle. Są czysto dekoracyjne.
 for(const b of birds){
   b.x+=b.vx*dt; b.phase+=dt*2.4; b.flap+=dt*8;
   b.y+=Math.sin(b.phase)*2.2*dt;
   if(b.vx>0 && b.x>W+24){b.x=-24;b.y=H*(.08+Math.random()*.25)}
   if(b.vx<0 && b.x<-24){b.x=W+24;b.y=H*(.08+Math.random()*.25)}
 }
 // V52: po zmianie orientacji ekranu trzymaj Tołdiego w bezpiecznych granicach.
 P.x=Number.isFinite(P.x)?Math.max(P.r,Math.min(W-P.r,P.x)):55;
 P.y=Number.isFinite(P.y)?Math.max(P.r,Math.min(H-P.r,P.y)):H-65;
 P.inv=Math.max(0,P.inv-dt);
 let dx=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0)+touch.x;
 let dy=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0)+touch.y;
 const len=Math.hypot(dx,dy);if(len){dx/=len;dy/=len;toldiMoveX=dx;toldiMoveY=dy;if(Math.abs(dx)>.18)toldiFacing=dx<0?'left':'right';const sp=P.speed*(P.boost>0?2:1);moveEnt(P,dx*sp*dt,dy*sp*dt)}else{toldiMoveX=0;toldiMoveY=0;}
 P.boost=Math.max(0,P.boost-dt);
 P.hallu=Math.max(0,P.hallu-dt);
 // Level 3 secret branch: UFO appears only here and can be deliberately avoided.
 if(level===3&&!ufoDisabled&&!secretMode){
   secretT+=dt;
   if(secretT>=10)secretT-=10;
   const beamActive=secretT>=6.5;
   const ut=performance.now()/2200;
   ufoX=W*(.5+.39*Math.sin(ut));
   ufoY=H*(.18+.34*(.5+.5*Math.sin(ut*.73+1.2)));
   // Węższy promień: porwanie jest opcjonalne i wymaga wejścia blisko osi wiązki.
   if(beamActive&&Math.abs(P.x-ufoX)<26&&P.y>ufoY+12&&P.y<H*.94){startAbduction();return}
 }
 if(belzebub){for(const m of belzMushrooms)if(!m.taken&&Math.hypot(P.x-m.x,P.y-m.y)<29){m.taken=true;belzAmmo=5;playPickupSfx('mushroom');showMsg('☠️ BOROWIK SZATAŃSKI! Czerwona aura — 5 strzałów!',1500);}}
 for(const m of mushrooms)if(!m.taken&&Math.hypot(P.x-m.x,P.y-m.y)<25){m.taken=true;P.bag++;toldiAction='collect';toldiActionTimer=.85;playPickupSfx('mushroom');showMsg('🍄 Do torby!',500)}
 for(const h of hallucMushrooms)if(!h.taken&&Math.hypot(P.x-h.x,P.y-h.y)<25){
   h.taken=true;P.hallu=10;playPickupSfx('halluc');showMsg(P.boost>0?'🌈🍾 HALUCYNACJA + FLASZKA!  TOŁDI ×2 / PRZECIWNICY ×20%':'🌈 SUPER HALUCYNACJA!  PRZECIWNICY ×20%  10s',1500);
 }
 for(const f of bottles)if(!f.taken&&Math.hypot(P.x-f.x,P.y-f.y)<28){
   f.taken=true;P.bottles++;P.boost=6;toldiAction='drink';toldiActionTimer=1.1;playPickupSfx('bottle');showMsg(P.hallu>0?'🍾🌈 FLASZKA + HALUCYNACJA!  TOŁDI ×2 / PRZECIWNICY ×20%':'🍾 To jest pyszne!  SZYBKOŚĆ ×2',1200);
 }
 const enemySlow=P.hallu>0?.20:1;
 if(guard){
   guard.t+=dt;
   const gd=Math.hypot(P.x-guard.x,P.y-guard.y);
   const gt=gd<170?P:nearestPathTarget(guard);
   const gx=guard.x,gy=guard.y;
   moveEnemy(guard,gt.x,gt.y,65*enemyMultiplier*enemySlow,dt);
   const md=Math.hypot(guard.x-gx,guard.y-gy);
   guard.moving=md>0.02;
   if(md>0.02)guard.dir=(guard.x-gx)>=0?'right':'left';
   guard.animT=(guard.animT||0)+(guard.moving?dt:dt*.25);
 }
 if(boar){
   boar.t+=dt;
   const bd=Math.hypot(P.x-boar.x,P.y-boar.y);
   const bt=bd<145?P:nearestPathTarget(boar);
   const bx0=boar.x,by0=boar.y;
   moveBoarStable(bt.x,bt.y,78*enemyMultiplier*enemySlow,dt);
   const bmd=Math.hypot(boar.x-bx0,boar.y-by0);
   boar.moving=bmd>0.02; boar.charging=bd<300;
   if(bmd>0.02){
     const dx=boar.x-bx0;
     boar.dir=Math.abs(dx)>0.08?(dx>=0?'right':'left'):boar.dir;
   }
   boar.animT=boar.moving ? (boar.animT+dt) : 0;
 }
 if(level===5&&mushrooms.every(m=>m.taken)&&!belzebub){
   if(!boss){let bx=W*.80,by=Math.max(105,H*.19);const spots=[[0,0],[-45,0],[45,0],[0,45],[-45,45],[45,45],[-80,25],[80,25]];for(const [sx,sy] of spots){const tx=Math.max(30,Math.min(W-30,bx+sx)),ty=Math.max(30,Math.min(H-30,by+sy));if(!blocked(tx,ty,25)){bx=tx;by=ty;break}}guard=null;boar=null;kingShots=[];boss={x:bx,y:by,r:25,hp:100,max:100,t:0,shootT:5,aiAngle:0,stuck:0};startBattleMusic('king')}

 }
 if(boss){
   boss.t+=dt;
   // Król ściga Tołdiego po całej arenie. Omija drzewa, gałęzie i dekoracje;
   // jedyną przeszkodą pozostaje woda (może przejść po mostach).
   moveBossSmooth(boss,P.x,P.y,72*enemyMultiplier*enemySlow,dt);
   boss.shootT-=dt;
   if(boss.shootT<=0){
     boss.shootT=5;
     if(!(debugManualRun&&debugDisableEnemyProjectiles)){
       const a=Math.atan2(P.y-boss.y,P.x-boss.x), speed=118;
       // Mała salwa: tylko dwa grzybowe pociski z berła.
       for(const off of [-.10,.10]){const aa=a+off;kingShots.push({x:boss.x+Math.cos(aa)*26,y:boss.y+Math.sin(aa)*26,vx:Math.cos(aa)*speed,vy:Math.sin(aa)*speed,r:7,life:5});}
     }
   }
   for(let i=kingShots.length-1;i>=0;i--){const f=kingShots[i];f.x+=f.vx*dt;f.y+=f.vy*dt;f.life-=dt;
     if(f.life<=0||f.x<-20||f.x>W+20||f.y<-20||f.y>H+20){kingShots.splice(i,1);continue;}
     if(Math.hypot(P.x-f.x,P.y-f.y)<P.r+f.r&&P.inv<=0){kingShots.splice(i,1);beginDeathSequence();document.getElementById('overText').textContent='Grzyb z berła Króla trafił Tołdiego!';break;}
   }
   if(Math.hypot(P.x-boss.x,P.y-boss.y)<34&&P.inv<=0){beginDeathSequence();document.getElementById('overText').textContent='Król Prawdziwków dopadł Tołdiego!';return}
 }
 if(boss&&boss.hp<=0){
   if(difficulty==='hard'||difficulty==='ultra'){startBelzebub();}
   else {startEndingStory();return}
 }
 if(belzebub){
   belzebub.t+=dt;
   const dx=P.x-belzebub.x,dy=P.y-belzebub.y,d=Math.hypot(dx,dy)||1;
   moveBelzebub(dt,52*enemyMultiplier*enemySlow);
   for(let i=belzShots.length-1;i>=0;i--){const q=belzShots[i];q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;if(q.life<=0||q.x<-20||q.x>W+20||q.y<-20||q.y>H+20){belzShots.splice(i,1);continue;}if(Math.hypot(q.x-belzebub.x,q.y-belzebub.y)<belzebub.r+q.r){belzebub.hp=Math.max(0,belzebub.hp-30);belzShots.splice(i,1);showMsg('💥 BOROWIK TRAFIŁ BELZEBUBA! −30 HP',550);}}
   belzebub.shootT-=dt;
   if(belzebub.shootT<=0){
     belzebub.shootT=1.13;
     if(!(debugManualRun&&debugDisableEnemyProjectiles)){
       const a=Math.atan2(P.y-belzebub.y,P.x-belzebub.x), spread=.18;
       // Pociski startują minimalnie przed Belzebubem, żeby nie zostały skasowane przez osłonę, w której stoi.
       for(const off of [-spread,0,spread]){
         const aa=a+off, sx=belzebub.x+Math.cos(aa)*(belzebub.r+5), sy=belzebub.y+Math.sin(aa)*(belzebub.r+5);
         fireballs.push({x:sx,y:sy,vx:Math.cos(aa)*111,vy:Math.sin(aa)*111,r:8,life:6});
       }
     }
   }
   for(let i=fireballs.length-1;i>=0;i--){
     const f=fireballs[i];f.x+=f.vx*dt;f.y+=f.vy*dt;f.life-=dt;
     if(f.life<=0||f.x<-30||f.x>W+30||f.y<-30||f.y>H+30){fireballs.splice(i,1);continue}
     if(belzCovers.some(o=>Math.hypot(f.x-o.x,f.y-o.y)<o.r+f.r)){fireballs.splice(i,1);continue}
     if(Math.hypot(P.x-f.x,P.y-f.y)<P.r+f.r&&P.inv<=0){fireballs.splice(i,1);beginDeathSequence();document.getElementById('overText').textContent='Belzebub spalił Tołdiego!';break}
   }
 }
 for(const e of [guard,boar])if(e&&Math.hypot(P.x-e.x,P.y-e.y)<27&&P.inv<=0){beginDeathSequence();document.getElementById('overText').textContent='Strażnik lub dzik dopadł Tołdiego.'}
 if(belzebub&&belzebub.hp<=0){belzebub=null;fireballs=[];belzShots=[];belzMushrooms=[];belzAmmo=0;belzCovers=[];infernoBattle=false;bossHud.style.display='none';attackBtn.style.display='none';saveProgress(true);startBelzebubEndingComic()}
 if(mushrooms.every(m=>m.taken)&&level<5){
   if(level===3){startStoryAfterLevel3();return}
   if(level===4){startStory(2);return}
   level++;setupLevel()
 }
 updateUI();
}
function startBelzebub(){
 if(belzebub)return;
 boss=null;guard=null;boar=null;fireballs=[];kingShots=[];belzShots=[];belzAmmo=0;belzMushrooms=[];mushrooms=[];hallucMushrooms=[];infernoBattle=true;
  // V160: arena Belzebuba ma być czytelniejsza i łatwiejsza do przemierzania.
  // Usuwamy losowo połowę drzew kolizyjnych oraz połowę drzew dekoracyjnych,
  // tylko na początku walki; pozostałe elementy mapy i mechanika zostają bez zmian.
  const keepHalf = arr => {
    for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
    arr.splice(Math.ceil(arr.length/2));
  };
  keepHalf(trees);
  keepHalf(decorTrees);
 // Osłony są prawdziwymi przeszkodami: Tołdi może za nimi stanąć, a pociski Belzebuba zatrzymują się na ich krawędzi.
 belzCovers=[
   {x:W*.20,y:H*.28,r:31},
   {x:W*.48,y:H*.22,r:28},
   {x:W*.78,y:H*.30,r:33},
   {x:W*.30,y:H*.58,r:34},
   {x:W*.62,y:H*.56,r:30},
   {x:W*.82,y:H*.72,r:32}
 ];
 // Sześć specjalnych Borowików Szatańskich, rozsianych po arenie i poza osłonami.
 const spots=[[.12,.20],[.36,.16],[.65,.18],[.87,.43],[.22,.70],[.68,.78],[.45,.48],[.10,.48],[.86,.78],[.40,.86]];
 for(const [fx,fy] of spots){if(belzMushrooms.length>=6)break;const x=Math.max(28,Math.min(W-28,W*fx)),y=Math.max(45,Math.min(H-40,H*fy));if(belzCovers.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+38))continue;if(belzMushrooms.some(m=>Math.hypot(x-m.x,y-m.y)<75))continue;belzMushrooms.push({x,y,taken:false,phase:Math.random()*6.28});}
 while(belzMushrooms.length<6){const x=30+Math.random()*Math.max(1,W-60),y=40+Math.random()*Math.max(1,H-80);if(!belzCovers.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+30)&&!belzMushrooms.some(m=>Math.hypot(x-m.x,y-m.y)<55))belzMushrooms.push({x,y,taken:false,phase:Math.random()*6.28});}
 let bx=W*.72,by=H*.18,found=false;
  for(let tries=0;tries<120;tries++){
   const tx=W*(.12+.76*Math.random()),ty=H*(.06+.30*Math.random());
   if(belzCanOccupy(tx,ty,36)){bx=tx;by=ty;found=true;break}
  }
  if(!found){bx=Math.max(40,Math.min(W-40,W*.72));by=Math.max(40,Math.min(H*.28,H*.18))}
  belzebub={x:bx,y:by,r:34,hp:500,max:500,t:0,shootT:1.13,aiAngle:0,stuck:0,wayT:0,wayX:W*.5,wayY:H*.18};
 bossHud.style.display='block';attackBtn.style.display='block';
 const lab=bossHud.querySelector('div');if(lab)lab.textContent='🔥 BELZEBUB — WŁADCA PIEKŁA';
 showMsg('BELZEBUB — WŁADCA PIEKŁA!  500 HP',1800);
 startMusic();
}
function attack(){
 if(state==='secret'&&secretMode===3&&spaceRun&&spaceRun.phase!=='done'){playLaserSfx();spaceRun.laser.push({x:P.x,y:P.y-22,vx:0,vy:-520,life:1.35});showMsg(spaceRun.phase==='boss'?'🔴 LASER → KOKPIT!':'🔵 LASER!',250);return}
 if(state==='secret'){
   let dx=touch.x,dy=touch.y;
   if(Math.hypot(dx,dy)<0.1){
     const kx=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0), ky=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0);
     dx=kx;dy=ky;
   }
   if(Math.hypot(dx,dy)<0.1){
     let best=secretAliens[0],bd=Infinity;for(const a of secretAliens){const d=Math.hypot(a.x-P.x,a.y-P.y);if(d<bd){bd=d;best=a}}
     if(best){dx=best.x-P.x;dy=best.y-P.y;}else{dx=1;dy=0}
   }
   const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;
   secretLaserShots.push({x:P.x+dx*15,y:P.y+dy*15,vx:dx*330,vy:dy*330,life:1.4});
   showMsg('🔫 LASER!',250);return;
 }
 if(state!=='play'||level!==5)return;
 if(belzebub){
   if(belzAmmo<=0){showMsg('🍄 Znajdź Borowika Szatańskiego!',650);return;}
   const dx=belzebub.x-P.x,dy=belzebub.y-P.y,len=Math.hypot(dx,dy)||1;
   belzShots.push({x:P.x,y:P.y-8,vx:dx/len*390,vy:dy/len*390,r:9,life:2.2});
   belzAmmo--;if(belzAmmo===0)showMsg('🔴 Aura wygasła! Szukaj kolejnego Borowika.',1100);else showMsg(`🍄 Ognisty grzyb! Pozostało strzałów: ${belzAmmo}`,450);return;
 }
 const target=belzebub||boss;
 if(!target)return;
 if(Math.hypot(P.x-target.x,P.y-target.y)<115){target.hp=Math.max(0,target.hp-20);showMsg(belzebub?'💥 BELZEBUB TRAFIONY!':'💥 TRAFIENIE!',400)}
 else showMsg(belzebub?'Podejdź bliżej Belzebuba!':'Podejdź bliżej Króla!',500);
}
function updateUI(){
 if(secretMode){
   if(secretMode===3&&spaceRun){const label=spaceRun.phase==='boss'?'👽 STATEK MATKA':'🚀 UCIECZKA Z UFO';levelEl.textContent=`🛸 SEKRET 3/3 • ${label}`;mushEl.textContent=spaceRun.phase==='boss'?`❤️ KOKPIT ${Math.max(0,Math.ceil(spaceRun.boss.hp))}/${spaceRun.boss.max}`:`🚀 FALA ${spaceRun.wave}/3 • UFO: ${spaceRun.enemies.length}`;effectsEl.textContent='';effectsEl.style.display='none';if(spaceRun.phase==='boss'&&spaceRun.boss){bossHud.style.display='block';bossHud.querySelector('div').textContent='👽 STATEK MATKA — KOKPIT';bossFill.style.width=(spaceRun.boss.hp/spaceRun.boss.max*100)+'%';}else bossHud.style.display='none';attackBtn.style.display='block';attackBtn.textContent='ATAK';return}
   levelEl.textContent=`🛸 SEKRET ${secretMode}/2 • KOSMICZNE UFO • ${difficulty==='ultra'?'ULTRA':'NORMAL'}`;
   mushEl.textContent=`🟣 ${secretMushrooms.filter(m=>m.taken).length}/${secretMushrooms.length}`;
   effectsEl.textContent='';effectsEl.style.display='none';
   bossHud.style.display='none';attackBtn.style.display='block';attackBtn.textContent='ATAK';return
 }
 const diffName=difficulty==='easy'?'Łatwy':difficulty==='hard'?'Trudny':difficulty==='ultra'?'Ultra Trudny':'Normalny';
 levelEl.textContent=`Poziom ${level}/${LEVEL_REGISTRY.length} • 🎵 ${(musicTracks[level-1]||musicTracks[0]).name} • ${diffName}`;
 mushEl.textContent=`🍄 ${mushrooms.filter(m=>m.taken).length}/${mushrooms.length}   🍾 ${P.bottles}`;
 const fx=[];
 if(P.hallu>0)fx.push(`🍄 GRZYB: ${Math.ceil(P.hallu)}s`);
 if(P.boost>0)fx.push(`🍾 FLASZKA: ${Math.ceil(P.boost)}s`);
 effectsEl.textContent=fx.join('   ');
 effectsEl.style.display=fx.length?'block':'none';
 if(boss){bossHud.style.display='block';bossHud.querySelector('div').textContent='👑 KRÓL PRAWDZIWKÓW';bossFill.style.width=(boss.hp/boss.max*100)+'%';attackBtn.style.display='block'}
 if(belzebub){bossHud.style.display='block';bossHud.querySelector('div').textContent='🔥 BELZEBUB — WŁADCA PIEKŁA';bossFill.style.width=(belzebub.hp/belzebub.max*100)+'%';attackBtn.style.display='block';attackBtn.textContent=belzAmmo>0?`🍄 STRZAŁ (${belzAmmo})`:'ATAK';if(belzAmmo>0)fx.push(`🔴 AURA SZATAŃSKA: ${belzAmmo}/5`)}
}
function showMsg(t,ms){msg.textContent=t;msg.style.display='block';toast=ms}
function saveProgress(win=false){try{localStorage.setItem(saveKey,JSON.stringify({level,win}))}catch(e){}}

function drawIntro(){
 // V148: side-on forest entrance. The road runs horizontally across the screen.
 const now=performance.now()/1000;
 const roadY=H*.70;
 const carW=Math.min(480,Math.max(280,W*.55));
 const carH=carW*(mondeoStaticSprite.naturalHeight||294)/(mondeoStaticSprite.naturalWidth||750);

 // Sky with a warm morning gradient.
 const sky=ctx.createLinearGradient(0,0,0,H*.56);
 sky.addColorStop(0,'#7dc8ef');sky.addColorStop(.62,'#c4e9f7');sky.addColorStop(1,'#e6edc1');
 ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

 // Soft distant hills and several layers of deep forest.
 ctx.fillStyle='#a5c987';ctx.beginPath();ctx.moveTo(0,H*.40);
 for(let x=0;x<=W+30;x+=30)ctx.lineTo(x,H*(.30+.035*Math.sin(x*.012)+.02*Math.sin(x*.031)));
 ctx.lineTo(W,H*.70);ctx.lineTo(0,H*.70);ctx.closePath();ctx.fill();
 ctx.fillStyle='#548b55';ctx.fillRect(0,H*.38,W,H*.30);
 for(let i=0;i<Math.ceil(W/24)+2;i++){
   const x=i*24-10, y=H*(.36+.025*Math.sin(i*1.7));
   const h=H*(.14+(i%5)*.018), w=13+(i%3)*4;
   ctx.fillStyle=['#285b3b','#326b42','#39784a','#244f36'][i%4];
   ctx.beginPath();ctx.moveTo(x,y-h);ctx.lineTo(x-w,y+8);ctx.lineTo(x-w*.48,y+3);ctx.lineTo(x,y+15);
   ctx.lineTo(x+w*.52,y+3);ctx.lineTo(x+w,y+8);ctx.closePath();ctx.fill();
   ctx.fillStyle='#60462c';ctx.fillRect(x-2,y+8,4,H*.13);
 }

 // Sunlit clearing behind the roadside.
 ctx.fillStyle='#79a95a';ctx.fillRect(0,H*.48,W,H*.22);
 for(let i=0;i<30;i++){
   const x=(i*73)%Math.max(1,W), y=H*(.49+(i%6)*.027), r=12+(i%4)*5;
   ctx.fillStyle=['#397546','#4d884b','#2d693d'][i%3];
   ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.arc(x-r*.55,y+r*.35,r*.7,0,Math.PI*2);ctx.arc(x+r*.55,y+r*.32,r*.68,0,Math.PI*2);ctx.fill();
 }

 // Birds crossing the sky; they are drawn procedurally, not baked into the background.
 for(let i=0;i<7;i++){
   const span=W+90;
   const x=((now*(17+i*3)+i*W*.19+45)%span)-45;
   const y=H*(.095+(i%4)*.042)+Math.sin(now*1.6+i)*5;
   const flap=Math.sin(now*7+i)*4.5, s=3.5+(i%3)*1.1;
   ctx.strokeStyle='#263b35';ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();
   ctx.moveTo(x-s*2,y+flap*.15);ctx.quadraticCurveTo(x-s,y-flap-s,x,y);
   ctx.quadraticCurveTo(x+s,y-flap-s,x+s*2,y+flap*.15);ctx.stroke();
 }

 // Horizontal road: shoulder strips, asphalt, subtle grain and broken centre markings.
 ctx.fillStyle='#6d8d48';ctx.fillRect(0,H*.605,W,H*.205);
 ctx.fillStyle='#c4b17a';ctx.fillRect(0,H*.625,W,H*.17);
 ctx.fillStyle='#8d8d80';ctx.fillRect(0,H*.642,W,H*.135);
 ctx.fillStyle='#515b5a';ctx.fillRect(0,H*.655,W,H*.105);
 ctx.fillStyle='#b9b5a1';ctx.fillRect(0,H*.648,W,H*.009);
 ctx.fillStyle='#d8c982';
 for(let x=-40;x<W+60;x+=Math.max(55,W*.16))ctx.fillRect(x,H*.703,Math.max(24,W*.065),Math.max(3,H*.008));
 // Roadside grass tufts and little stones.
 for(let i=0;i<Math.ceil(W/9);i++){
   const x=i*9+(i%3)*2;
   ctx.strokeStyle=['#285d31','#4d843c','#8eb65a'][i%3];ctx.lineWidth=1.5;
   ctx.beginPath();ctx.moveTo(x,H*.625);ctx.lineTo(x-3,H*.605-(i%4)*2);ctx.moveTo(x,H*.626);ctx.lineTo(x+4,H*.611-(i%3)*2);ctx.stroke();
   if(i%5===0){ctx.fillStyle='#b4a98a';ctx.fillRect(x,H*.635,3,2)}
 }

 // Foreground framing trees: layered needles, trunks and branches, kept clear of the road itself.
 const drawPine=(x,baseY,scale,dark)=>{
   const trunkW=Math.max(4,scale*.12);
   ctx.fillStyle='#5b3e29';ctx.fillRect(x-trunkW/2,baseY-scale*.2,trunkW,scale*.45);
   ctx.fillStyle='#3d2b20';ctx.fillRect(x-trunkW*.15,baseY-scale*.2,trunkW*.3,scale*.45);
   for(let k=0;k<4;k++){
     const yy=baseY-scale*(.22+k*.18), ww=scale*(.48-k*.075);
     ctx.fillStyle=dark?(k%2?'#17482e':'#205637'):(k%2?'#27663a':'#327747');
     ctx.beginPath();ctx.moveTo(x,yy-scale*.46);ctx.lineTo(x-ww,yy+scale*.12);ctx.lineTo(x-ww*.48,yy+scale*.05);
     ctx.lineTo(x,yy+scale*.22);ctx.lineTo(x+ww*.48,yy+scale*.05);ctx.lineTo(x+ww,yy+scale*.12);ctx.closePath();ctx.fill();
     ctx.strokeStyle=dark?'#386e40':'#57914c';ctx.lineWidth=Math.max(1,scale*.025);
     ctx.beginPath();ctx.moveTo(x,yy-scale*.25);ctx.lineTo(x-ww*.55,yy+scale*.03);ctx.moveTo(x,yy-scale*.12);ctx.lineTo(x+ww*.55,yy+scale*.08);ctx.stroke();
   }
 };
 for(let i=0;i<Math.ceil(W/65)+2;i++){
   const x=i*65-24, base=H*(.605+(i%3)*.006), scale=H*(.18+(i%4)*.025);
   drawPine(x,base,scale,i%2===0);
 }
 // Near bushes at the bottom corners to add depth without covering the car.
 for(let side=0;side<2;side++){
   const x=side===0?0:W, dir=side===0?1:-1;
   for(let i=0;i<7;i++){
     const bx=x+dir*(i*17), by=H*(.81+(i%3)*.025), r=12+(i%4)*4;
     ctx.fillStyle=['#245632','#347342','#4a8745'][i%3];
     ctx.beginPath();ctx.arc(bx,by,r,0,Math.PI*2);ctx.arc(bx+dir*r*.55,by-r*.25,r*.72,0,Math.PI*2);ctx.fill();
   }
 }

 // A small roadside sign to establish the Barwinek setting.
 ctx.save();
 const signX=W*.82, signY=H*.50;
 ctx.fillStyle='#60452b';ctx.fillRect(signX-3,signY+28,6,H*.12);
 ctx.fillStyle='#087a3b';ctx.fillRect(signX-57,signY-2,114,30);
 ctx.strokeStyle='#e9f4dc';ctx.lineWidth=2;ctx.strokeRect(signX-57,signY-2,114,30);
 ctx.fillStyle='#fff';ctx.font=`900 ${Math.max(10,Math.min(16,W*.035))}px Arial,sans-serif`;
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('BARWINEK',signX,signY+13);ctx.restore();

 // Mondeo drives left-to-right along the road and stops near the centre.
 const carP=Math.min(introT/3.15,1);
 const cx=-carW*.62+(W*.40+carW*.62)*carP;
 const carX=cx-carW*.5, carY=roadY-carH*.52;

 // Very heavy, animated exhaust smoke: separate canvas particles, never part of the sprite.
 // It trails to the left and rises as the old Mondeo struggles into the forest.
 const smokeAge=Math.min(introT,3.15);
 for(let i=34;i>=0;i--){
   const drift=i*(carW*.018);
   const rise=i*(carH*.055);
   const wobble=Math.sin(now*2.7+i*1.71)*carH*.075;
   const puffX=cx-carW*.43-drift-smokeAge*8;
   const puffY=roadY-carH*.12-rise+wobble;
   const radius=carH*(.10+i*.009);
   const alpha=Math.max(.08,.48-i*.010);
   ctx.fillStyle=`rgba(34,39,38,${alpha*.50})`;
   ctx.beginPath();ctx.arc(puffX,puffY,radius*1.35,0,Math.PI*2);ctx.fill();
   ctx.fillStyle=`rgba(75,78,74,${alpha*.60})`;
   ctx.beginPath();ctx.arc(puffX-radius*.22,puffY-radius*.18,radius*.82,0,Math.PI*2);ctx.fill();
   ctx.fillStyle=`rgba(116,119,111,${alpha*.35})`;
   ctx.beginPath();ctx.arc(puffX+radius*.30,puffY-radius*.32,radius*.55,0,Math.PI*2);ctx.fill();
 }
 // Small dark exhaust bursts directly at the tail make the heavy smoke source obvious.
 for(let i=0;i<4;i++){
   const x=carX+carW*.08-i*5, y=roadY-carH*.10+Math.sin(now*8+i)*3;
   ctx.fillStyle=`rgba(30,32,31,${.58-i*.09})`;
   ctx.beginPath();ctx.arc(x,y,5+i*2,0,Math.PI*2);ctx.fill();
 }

 // Use only the two dedicated side-view sprites: driver during arrival, empty car after he exits.
 if(mondeoStaticReady){
   const parked=introT>=3.15;
   ctx.save();ctx.imageSmoothingEnabled=false;
   const carSprite=parked&&mondeoStaticEmptyReady?mondeoStaticEmptySprite:mondeoStaticSprite;
   ctx.drawImage(carSprite,0,0,carSprite.naturalWidth||750,carSprite.naturalHeight||294,carX,carY,carW,carH);
   ctx.restore();
 }else if(mondeoSpriteReady){
   const fw=245,fh=80;
   ctx.save();ctx.imageSmoothingEnabled=false;
   ctx.drawImage(mondeoSprite,6*fw,0,fw,fh,carX,carY,carW,carH);
   ctx.restore();
 }

 // Tołdi steps out after the car stops, says his line, then walks off to the right.
 if(introT>3.15){
   let tx;
   if(introT<4.15)tx=carX+carW+28+Math.min(introT-3.15,1)*5;
   else if(introT<6.65)tx=carX+carW+33;
   else tx=carX+carW+33+Math.min((introT-6.65)/2.65,1)*(W+90-(carX+carW+33));
   toldiMoveX=introT>5.65?1:0;toldiMoveY=0;drawToldi(tx,roadY-28);
   if(introT>=3.75&&introT<6.75){
     const bx=Math.min(W-165,Math.max(155,tx+38)), by=H*.39;
     ctx.save();
     ctx.shadowColor='rgba(0,0,0,.42)';ctx.shadowBlur=10;ctx.shadowOffsetY=4;
     const bubbleGrad=ctx.createLinearGradient(0,by-43,0,by+35);
     bubbleGrad.addColorStop(0,'#fff9d9');bubbleGrad.addColorStop(1,'#f4dca0');
     ctx.fillStyle=bubbleGrad;ctx.strokeStyle='#3c2818';ctx.lineWidth=3;
     ctx.beginPath();ctx.roundRect(bx-165,by-47,330,86,15);ctx.fill();ctx.stroke();
     ctx.shadowColor='transparent';ctx.lineWidth=2;ctx.strokeStyle='#c18b3e';
     ctx.beginPath();ctx.roundRect(bx-159,by-41,318,74,11);ctx.stroke();
     ctx.fillStyle='#fff9d9';ctx.strokeStyle='#3c2818';ctx.lineWidth=2;
     ctx.beginPath();ctx.moveTo(bx-17,by+37);ctx.lineTo(bx-3,by+59);ctx.lineTo(bx+13,by+37);ctx.closePath();ctx.fill();ctx.stroke();
     ctx.fillStyle='#271b12';ctx.font='900 14px Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
     ctx.fillText('Nikt nie zna MOJEGO miejsca.',bx,by-19);
     ctx.fillStyle='#5a351b';ctx.font='800 13px Arial,sans-serif';
     ctx.fillText('Zbiorę sam WSZYSTKIE grzyby w lesie!',bx,by+9);ctx.restore();
   }
 }
 ctx.fillStyle='#fff';ctx.font=`bold ${Math.max(12,Math.min(18,W*.045))}px system-ui`;
 ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText('FORD MONDEO 1993 • BRRRAAAAT!',W/2,H*.94);
}
function drawUFO(){
 const x=ufoX||W*.5,y=ufoY||H*.10;ctx.save();ctx.translate(x,y);ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='#171b2d';ctx.beginPath();ctx.ellipse(0,0,48,14,0,0,6.28);ctx.fill();ctx.fillStyle='#6f7cff';ctx.beginPath();ctx.ellipse(0,-7,25,13,0,0,6.28);ctx.fill();ctx.fillStyle='#b7f6ff';ctx.beginPath();ctx.ellipse(0,-10,15,8,0,0,6.28);ctx.fill();ctx.fillStyle='#48e7ff';for(let i=-3;i<=3;i+=2)ctx.fillRect(i*12,7,7,4);ctx.restore();
}
function drawBeam(){const x=ufoX||W*.5,y=ufoY||H*.10;const pulse=.12+.04*Math.sin(performance.now()/90);ctx.save();ctx.globalAlpha=.7;ctx.fillStyle=`rgba(76,232,255,${pulse})`;ctx.beginPath();ctx.moveTo(x-12,y+10);ctx.lineTo(x-34,H*.94);ctx.lineTo(x+34,H*.94);ctx.lineTo(x+12,y+10);ctx.closePath();ctx.fill();ctx.strokeStyle='#7ff7ff';ctx.lineWidth=2;ctx.stroke();ctx.restore()}
function drawAbduction(){
 ctx.fillStyle='#10202b';ctx.fillRect(0,0,W,H);drawSecretBackdrop();drawUFO();drawBeam();const x=ufoX||W*.5,y=(ufoY||H*.30)+(H*.30-abductT*H*.30);ctx.save();ctx.globalAlpha=Math.max(.25,1-abductT*.25);drawToldi(x,y);ctx.restore();ctx.fillStyle='#d9fbff';ctx.font='900 18px system-ui';ctx.textAlign='center';ctx.fillText('🛸 PORWANIE DO UFO...',W/2,H*.93);
}
function drawSecretBackdrop(){
 ctx.fillStyle='#101b38';ctx.fillRect(0,0,W,H);
 for(let i=0;i<55;i++){const x=(i*83)%W,y=40+((i*137)%Math.max(80,H-100));ctx.fillStyle=i%3?'#334f88':'#6a78c8';ctx.fillRect(x,y,2+(i%2),2);}
 // electronic energy channels, purely visual
 ctx.strokeStyle='#1e8f9c';ctx.lineWidth=7;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(0,H*(.18+i*.21));ctx.bezierCurveTo(W*.3,H*(.10+i*.24),W*.7,H*(.30+i*.17),W,H*(.22+i*.18));ctx.stroke();}
}
function drawSecretPillar(p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.imageSmoothingEnabled=false;const pulse=.7+.25*Math.sin(performance.now()/160+p.phase);ctx.fillStyle='#11162a';ctx.fillRect(-12,-27,24,54);ctx.fillStyle='#293d65';ctx.fillRect(-8,-22,16,44);ctx.fillStyle='#42e8ff';ctx.fillRect(-5,-18,10,4);ctx.fillRect(-5,-2,10,4);ctx.fillRect(-5,14,10,4);ctx.fillStyle=`rgba(170,90,255,${pulse})`;ctx.fillRect(-18,-32,36,5);ctx.fillRect(-18,27,36,5);ctx.strokeStyle='#62f4ff';ctx.lineWidth=2;ctx.strokeRect(-12,-27,24,54);ctx.restore()}
function drawAlien(a){ctx.save();ctx.translate(a.x,a.y);const bob=Math.sin(performance.now()/170+a.phase)*2;ctx.translate(0,bob);ctx.fillStyle='#6de6a8';ctx.beginPath();ctx.ellipse(0,0,15,18,0,0,6.28);ctx.fill();ctx.fillStyle='#0c1830';ctx.beginPath();ctx.ellipse(0,-5,12,9,0,0,6.28);ctx.fill();ctx.fillStyle='#74f5ff';ctx.fillRect(-7,-7,5,4);ctx.fillRect(2,-7,5,4);ctx.strokeStyle='#6de6a8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-10,8);ctx.lineTo(-20,18);ctx.moveTo(10,8);ctx.lineTo(20,18);ctx.stroke();ctx.fillStyle='#a0ffdb';ctx.fillRect(-4,18,3,9);ctx.fillRect(2,18,3,9);ctx.restore()}
function drawSecretCover(o){ctx.save();ctx.translate(o.x,o.y);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#17233b';ctx.fillRect(-o.r,-o.r*.72,o.r*2,o.r*1.44);ctx.fillStyle='#31486f';ctx.fillRect(-o.r+5,-o.r*.72+5,o.r*2-10,o.r*1.44-10);ctx.fillStyle='#42e8ff';ctx.fillRect(-o.r+5,-2,6,4);ctx.fillRect(o.r-11,-2,6,4);ctx.strokeStyle='#8d5cff';ctx.lineWidth=3;ctx.strokeRect(-o.r,-o.r*.72,o.r*2,o.r*1.44);ctx.restore()}
function drawSpaceShip(x,y,turned=false){
 ctx.save();ctx.translate(x,y);ctx.imageSmoothingEnabled=false;
 // V118: zastępujemy dotychczasowy mały model dokładnie nowym sprite'em Tołdiego.
 // Statek pozostaje pionowo ustawiony również w fazie walki ze statkiem-matką.
 if(toldiSpaceShipReady){
   const maxW=Math.min(W*.22,95);
   const ratio=toldiSpaceShipSprite.naturalHeight/Math.max(1,toldiSpaceShipSprite.naturalWidth);
   const dw=maxW,dh=dw*ratio;
   ctx.shadowColor='rgba(70,220,255,.55)';ctx.shadowBlur=16;
   ctx.drawImage(toldiSpaceShipSprite,-dw/2,-dh*.48,dw,dh);
 }else{
   ctx.shadowColor='#4df6ff';ctx.shadowBlur=18;ctx.fillStyle='#263b59';ctx.beginPath();ctx.moveTo(0,-23);ctx.lineTo(17,13);ctx.lineTo(9,20);ctx.lineTo(0,13);ctx.lineTo(-9,20);ctx.lineTo(-17,13);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#62eaff';ctx.fillRect(-5,-8,10,15);ctx.fillStyle='#b9ffff';ctx.fillRect(-3,-12,6,7);ctx.fillStyle='#9b48ff';ctx.fillRect(-14,13,7,4);ctx.fillRect(7,13,7,4);ctx.fillStyle='#ff9f3d';ctx.fillRect(-5,18,10,6);
 }
 ctx.restore();
}
function drawEnemyUFO(e){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.sin(e.t*2)*.08);ctx.shadowColor='#ff4bd8';ctx.shadowBlur=12;ctx.fillStyle='#a83bc4';ctx.beginPath();ctx.ellipse(0,5,24,8,0,0,6.28);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#58e6ff';ctx.beginPath();ctx.ellipse(0,-2,13,10,0,Math.PI,6.28);ctx.fill();ctx.fillStyle='#ffec66';for(let i=-1;i<=1;i++)ctx.fillRect(i*9-2,7,4,3);ctx.restore();}
function drawMotherShip(b){ctx.save();ctx.translate(b.x,b.y);ctx.shadowColor='#8b48ff';ctx.shadowBlur=22;ctx.fillStyle='#172238';ctx.beginPath();ctx.moveTo(-b.w*.50,b.h*.30);ctx.lineTo(-b.w*.43,-b.h*.30);ctx.quadraticCurveTo(-b.w*.25,-b.h*.48,0,-b.h*.52);ctx.quadraticCurveTo(b.w*.25,-b.h*.48,b.w*.43,-b.h*.30);ctx.lineTo(b.w*.50,b.h*.30);ctx.lineTo(b.w*.28,b.h*.48);ctx.lineTo(-b.w*.28,b.h*.48);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#384c70';ctx.fillRect(-b.w*.47,b.h*.25,b.w*.94,12);ctx.fillStyle='#8f4dff';ctx.fillRect(-b.w*.46,b.h*.34,b.w*.92,8);for(const side of [-1,1])for(const yy of [0,1]){const x=side*b.w*.31,y=b.h*.38+yy*16;ctx.fillStyle='#111827';ctx.fillRect(x-13,y-10,26,20);ctx.fillStyle='#ff426b';ctx.beginPath();ctx.arc(x,y,7,0,6.28);ctx.fill()}const cy=b.h*.39;ctx.fillStyle='#08111f';ctx.beginPath();ctx.ellipse(0,cy,b.cockpitR*1.15,b.cockpitR*.72,0,0,6.28);ctx.fill();ctx.strokeStyle='#63f7ff';ctx.lineWidth=4;ctx.stroke();for(const ox of [-22,0,22]){ctx.fillStyle='#64e5a8';ctx.beginPath();ctx.ellipse(ox,cy+2,11,15,0,0,6.28);ctx.fill();ctx.fillStyle='#07111d';ctx.beginPath();ctx.ellipse(ox,cy-2,8,6,0,0,6.28);ctx.fill()}ctx.fillStyle='#ffe85b';ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.fillText('KOKPIT',0,cy+b.cockpitR*.95);ctx.restore();}
function drawSpaceEscape(){
 // Renderowanie jest odporne na chwilowy brak obiektu areny.
 ctx.fillStyle='#020713';ctx.fillRect(0,0,W,H);
 if(!spaceRun){
   ctx.fillStyle='#8deaff';ctx.font='900 18px system-ui';ctx.textAlign='center';ctx.fillText('🚀 ODBUDOWYWANIE STATKU...',W/2,H*.5);return;
 }
 for(const st of spaceRun.stars){ctx.strokeStyle=`rgba(190,235,255,${.35+.55*st.z})`;ctx.lineWidth=1+st.z*2;ctx.beginPath();ctx.moveTo(st.x,st.y-st.len*st.z);ctx.lineTo(st.x,st.y);ctx.stroke()}
 if(spaceRun.phase==='waves')for(const e of spaceRun.enemies)drawEnemyUFO(e);
 if(spaceRun.phase==='boss'&&spaceRun.boss)drawMotherShip(spaceRun.boss);
 for(const f of spaceRun.enemyShots){ctx.save();ctx.shadowColor='#ff3c75';ctx.shadowBlur=12;ctx.fillStyle='#ff557a';ctx.beginPath();ctx.arc(f.x,f.y,7,0,6.28);ctx.fill();ctx.restore()}
 for(const l of spaceRun.laser){ctx.save();ctx.strokeStyle='#67f7ff';ctx.shadowColor='#cfffff';ctx.shadowBlur=18;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(l.x,l.y+20);ctx.lineTo(l.x,l.y-26);ctx.stroke();ctx.restore()}
 if(spaceRun.phase==='boss'&&spaceRun.boss){ctx.fillStyle='#fff';ctx.font='900 14px system-ui';ctx.textAlign='center';ctx.fillText('🎯 TRAF W KOKPIT',W/2,H*.57)}
 drawSpaceShip(P.x,P.y,spaceRun.phase==='boss');
}
function drawSecret(){
 drawSecretBackdrop();for(const p of secretPillars)drawSecretPillar(p);for(const o of secretCovers)drawSecretCover(o);for(const m of secretMushrooms)if(!m.taken){ctx.save();ctx.translate(m.x,m.y);const b=Math.sin(performance.now()/180+m.phase)*2;ctx.translate(0,b);ctx.fillStyle='#eaf5ff';ctx.fillRect(-4,3,8,12);ctx.fillStyle='#b34cff';ctx.beginPath();ctx.arc(-5,2,7,Math.PI,0);ctx.arc(5,2,7,Math.PI,0);ctx.fill();ctx.fillStyle='#43e8ff';ctx.fillRect(-9,-2,18,4);ctx.fillStyle='#ffe65a';ctx.fillRect(-5,-7,10,3);ctx.restore()}
 for(const f of secretShots){ctx.fillStyle='#ff3bd4';ctx.shadowColor='#64f7ff';ctx.shadowBlur=9;ctx.beginPath();ctx.arc(f.x,f.y,6,0,6.28);ctx.fill();ctx.shadowBlur=0}for(const l of secretLaserShots){ctx.strokeStyle='#7ff7ff';ctx.shadowColor='#d9ffff';ctx.shadowBlur=12;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(l.x-l.vx*.025,l.y-l.vy*.025);ctx.lineTo(l.x+l.vx*.035,l.y+l.vy*.035);ctx.stroke();ctx.shadowBlur=0}for(const a of secretAliens){drawAlien(a);if(a.stun>0){ctx.strokeStyle='#ffe65a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(a.x,a.y,24+Math.sin(performance.now()/100)*3,0,6.28);ctx.stroke();ctx.fillStyle='#ffe65a';ctx.font='900 11px system-ui';ctx.textAlign='center';ctx.fillText(Math.ceil(a.stun)+'s',a.x,a.y-28)}}drawToldi(P.x,P.y);
 // Laserowy pistolet Tołdiego — czysto graficzny, kieruje się w stronę aktualnego celowania.
 {let dx=touch.x,dy=touch.y;if(Math.hypot(dx,dy)<.1){dx=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0);dy=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0);}if(Math.hypot(dx,dy)<.1){dx=1;dy=0}const a=Math.atan2(dy,dx);ctx.save();ctx.translate(P.x,P.y-6);ctx.rotate(a);ctx.fillStyle='#18253b';ctx.fillRect(7,-4,18,7);ctx.fillStyle='#59f6ff';ctx.fillRect(22,-3,7,4);ctx.fillStyle='#334d73';ctx.fillRect(8,3,7,9);ctx.restore();}
 if(secretMode&&secretT>8.5){ctx.fillStyle='#c9fbff';ctx.font='900 14px system-ui';ctx.textAlign='center';ctx.fillText('🛸 SYGNAŁ UFO — KOSMICZNY SEKRET',W/2,86)}
}
function draw(){
 ctx.clearRect(0,0,W,H);
 // IMPORTANT: the title screen is drawn before a level exists.
 // Never access river/level objects while state is still "title".
 if(state==='title'){
   ctx.fillStyle='#111';ctx.fillRect(0,0,W,H);return;
 }
 if(state==='intro'){drawIntro();return}
 if(state==='abduct'){drawAbduction();return}
 if(state==='secret'){if(secretMode===3){drawSpaceEscape();return}drawSecret();return}
 // UFO 3: podczas ekranu kontynuacji nadal pokazuj zamrożoną arenę ucieczki,
 // zamiast wracać do zielonego tła normalnego poziomu. Po kliknięciu
 // KONTYNUUJ arena zostanie zbudowana od nowa przez continueGame().
 if(state==='death'&&secretMode===3){drawSpaceEscape();return}
 // UFO 2: zachowaj kosmiczną arenę podczas ekranu kontynuacji; Tołdi nie używa sprite'a leżenia.
 if(state==='death'&&(secretMode===1||secretMode===2)){drawSecret();return}
 if(state==='story')return
 // V113 HD: warstwa światła i głębi pod istniejącą grafiką. Mechanika mapy pozostaje bez zmian.
 const groundGrad=ctx.createLinearGradient(0,0,0,H);
 if(infernoBattle){groundGrad.addColorStop(0,'#321014');groundGrad.addColorStop(.48,'#260b0e');groundGrad.addColorStop(1,'#170609')}
 else {groundGrad.addColorStop(0,'#6fa85a');groundGrad.addColorStop(.42,'#548f49');groundGrad.addColorStop(1,'#376f3c')}
 ctx.fillStyle=groundGrad;ctx.fillRect(0,0,W,H);
 drawGroundHD();
 // V114: miękka głębia światła nad terenem, bez wpływu na kolizje.
 const light=ctx.createRadialGradient(W*.42,H*.30,Math.min(W,H)*.05,W*.42,H*.30,Math.max(W,H)*.78);
 light.addColorStop(0,infernoBattle?'rgba(255,110,70,.06)':'rgba(245,255,205,.10)');
 light.addColorStop(.55,'rgba(255,255,255,0)');
 light.addColorStop(1,'rgba(0,0,0,.12)');
 ctx.fillStyle=light;ctx.fillRect(0,0,W,H);
 // Detailed pixel grass. Decorative only: it never participates in collisions.
 for(const g of grassDecor){
   ctx.save();ctx.translate(g.x,g.y);ctx.rotate(g.a);ctx.imageSmoothingEnabled=false;
   const dark=infernoBattle?'#3a1712':'#286b2d', mid=infernoBattle?'#71301f':'#3f8739', light=infernoBattle?'#9b4728':'#75a94a';
   ctx.lineWidth=1.5;ctx.lineCap='square';ctx.strokeStyle=dark;ctx.beginPath();ctx.moveTo(0,1);ctx.lineTo(-g.w*.7,-g.h*.45);ctx.moveTo(0,1);ctx.lineTo(g.w*.65,-g.h*.75);ctx.stroke();
   ctx.strokeStyle=mid;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-1,1);ctx.lineTo(-g.w*.85,-g.h*.18);ctx.moveTo(1,1);ctx.lineTo(g.w*.78,-g.h*.35);ctx.stroke();
   ctx.strokeStyle=mid;ctx.beginPath();ctx.moveTo(0,1);ctx.lineTo(-g.w*.15,-g.h);ctx.moveTo(0,1);ctx.lineTo(g.w*.9,-g.h*.55);ctx.stroke();
   ctx.strokeStyle=light;ctx.beginPath();ctx.moveTo(0,1);ctx.lineTo((g.flip?-1:1)*g.w*.45,-g.h*.3);ctx.stroke();
   if(g.kind==='sprig'){ctx.fillStyle=light;ctx.fillRect(-1,-g.h-2,2,2)}
   ctx.restore();
 }
 // Małe ptaki w oddali — osobna warstwa atmosferyczna, bez kolizji.
 for(const b of birds)drawBird(b);
 // Edge forest decorations are painted before the river, so water naturally covers anything crossing it.
 for(const t of decorTrees)drawTree(t);
 for(const b of decorBranches)drawBranch(b);
 // Level 3 UFO is drawn at the very end of the world layer so it is always
 // visually above the river, bridges, trees and other map objects.
 // The beam follows the same top-layer rule while active.
 // V113 HD: rzeka z głębią, brzegiem, połyskiem i cieniem. Geometria pozostaje identyczna.
 drawRiverHD();
 // V113 HD: drewniane mosty z deskami, szczelinami i cieniem.
 for(const b of bridges)drawBridgeHD(b);
 for(const b of trees)drawTree(b);
 for(const b of branches)drawBranch(b);
 for(const m of mushrooms)if(!m.taken)drawMush(m.x,m.y);
 for(const h of hallucMushrooms)if(!h.taken)drawHallucMush(h.x,h.y,h.phase);
 for(const f of bottles)if(!f.taken)drawBottle(f.x,f.y);
 // V156: mgła nad wszystkimi obiektami świata, ale pod postaciami i HUD.
  // V157: mgła całkowicie wyłączona.
 // V43 hallucination filter: world only. Characters and DOM HUD are drawn above/over it.
 if(infernoBattle){
   const pulse=.16+.04*Math.sin(performance.now()/220);ctx.fillStyle=`rgba(150,0,8,${pulse})`;ctx.fillRect(0,0,W,H);
 }
 if(P.hallu>0){
   const pulse=.055+.025*Math.sin(performance.now()/120);
   ctx.fillStyle=`rgba(70,150,255,${pulse})`;ctx.fillRect(0,0,W,H);
 }
 if(infernoBattle){for(const o of belzCovers)drawBelzCover(o);for(const m of belzMushrooms)if(!m.taken)drawSatanicMushroom(m);}
 if(level===5&&!infernoBattle)drawKingCave();
 if(guard)drawGuard(guard.x,guard.y);
 if(boar)drawBoar(boar.x,boar.y);
 if(boss){drawBoss(boss.x,boss.y);for(const f of kingShots)drawKingShot(f);}
 if(belzebub){drawBelzebub(belzebub.x,belzebub.y);for(const f of fireballs)drawFireball(f.x,f.y);for(const q of belzShots)drawSatanicShot(q)}
 if(belzebub&&belzAmmo>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,25,35,.88)';ctx.lineWidth=5;ctx.shadowColor='#ff1728';ctx.shadowBlur=22;ctx.beginPath();ctx.ellipse(P.x,P.y,25+Math.sin(performance.now()/90)*3,34+Math.cos(performance.now()/110)*3,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(255,0,25,.13)';ctx.fill();ctx.restore();}
 drawToldi(P.x,P.y);
 // UFO top layer: never let terrain/water/trees visually cover the ship.
 if(level===3&&!ufoDisabled&&!secretMode){
   if(secretT>=6.5)drawBeam();
   drawUFO();
 }
}


function drawGroundHD(){
 // Delikatne plamy światła i mchu, deterministyczne dzięki istniejącym dekoracjom.
 ctx.save();
 for(let i=0;i<grassDecor.length;i+=7){const g=grassDecor[i];const r=10+(i%5)*5;ctx.globalAlpha=infernoBattle?.07:.075;ctx.fillStyle=infernoBattle?'#d24a2f':'#b8d66b';ctx.beginPath();ctx.ellipse(g.x,g.y,r,r*.45,g.a,0,6.28);ctx.fill()}
 ctx.globalAlpha=1;
 const vign=ctx.createRadialGradient(W*.5,H*.45,Math.min(W,H)*.18,W*.5,H*.48,Math.max(W,H)*.78);vign.addColorStop(0,'rgba(255,255,255,0)');vign.addColorStop(.72,'rgba(0,0,0,.025)');vign.addColorStop(1,'rgba(0,0,0,.20)');ctx.fillStyle=vign;ctx.fillRect(0,0,W,H);ctx.restore();
}
function drawRiverHD(){
 ctx.save();ctx.beginPath();for(let x=0;x<=W;x+=6){let y=riverCenter(x)-river.thick/2;if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}for(let x=W;x>=0;x-=6){let y=riverCenter(x)+river.thick/2;ctx.lineTo(x,y)}ctx.closePath();
 const rg=ctx.createLinearGradient(0,0,W,H);rg.addColorStop(0,'#70cde5');rg.addColorStop(.32,'#3d9fc4');rg.addColorStop(.68,'#247aa5');rg.addColorStop(1,'#164f7d');ctx.fillStyle=rg;ctx.fill();
 ctx.strokeStyle='#b7f7ffb0';ctx.lineWidth=3;ctx.stroke();
 // V114: żywa powierzchnia wody — subtelne, animowane refleksy.
 const t=performance.now()/650;
 for(let x=8;x<W;x+=28){const y=riverCenter(x);const yy=y+Math.sin(t+x*.08)*9-(x%4)*6;const len=8+(x%7)*2;ctx.strokeStyle=(x%3===0)?'#e8ffff88':'#ffffff45';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+len,yy+Math.sin(t+x)*1.5);ctx.stroke();}
   ctx.globalAlpha=.18;ctx.fillStyle='#dffcff';for(let x=0;x<W;x+=52){const y=riverCenter(x)-river.thick*.28;ctx.fillRect(x+((x*7)%13),y,5,2)}ctx.globalAlpha=1;
  // V157: małe ryby w rzece — co kilka sekund jedna wyskakuje nad wodę.
  const seconds=performance.now()/1000;
  const fish=[{x:W*.24,phase:0.8,scale:.82},{x:W*.69,phase:4.1,scale:1.0},{x:W*.86,phase:7.0,scale:.7}];
  for(let i=0;i<fish.length;i++){
    const f=fish[i], cycle=((seconds+f.phase)%9.5), jumping=cycle<.78;
    const baseY=riverCenter(f.x)+Math.sin(seconds*.8+i*2)*river.thick*.12;
    const lift=jumping?Math.sin((cycle/.78)*Math.PI)*Math.min(38,H*.045):0;
    const fx=f.x+Math.sin(seconds*.35+i*2.1)*W*.018, fy=baseY-lift;
    ctx.save();ctx.translate(fx,fy);ctx.scale(f.scale,f.scale);
    if(jumping){
      // splash rings where the fish leaves and re-enters the water
      ctx.globalAlpha=.5*(1-cycle/.78);ctx.strokeStyle='#e4ffff';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(0,river.thick*.16,8+cycle*8,2.5,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
      ctx.fillStyle='#397d78';ctx.beginPath();ctx.ellipse(0,0,9,4.2,-.25,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#78b8a0';ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(-13,-4);ctx.lineTo(-12,3);ctx.closePath();ctx.fill();
      ctx.fillStyle='#d8b96e';ctx.beginPath();ctx.moveTo(1,-2);ctx.lineTo(4,-6);ctx.lineTo(6,-1);ctx.closePath();ctx.fill();
      ctx.fillStyle='#f5f3d9';ctx.fillRect(4,-1,2,2);ctx.fillStyle='#172d35';ctx.fillRect(5,-1,1,1);
      ctx.strokeStyle='#dffaff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-3,3);ctx.lineTo(-5,6);ctx.moveTo(0,3);ctx.lineTo(0,7);ctx.stroke();
    }else{
      // dark, fleeting fish silhouettes just below the water surface
      ctx.globalAlpha=.22;ctx.fillStyle='#153f51';ctx.beginPath();ctx.ellipse(0,0,7,2.6,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(-10,-3);ctx.lineTo(-9,3);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    }
    ctx.restore();
  }
  ctx.restore();
 }
function drawBridgeHD(b){
 ctx.save();ctx.translate(b.x,b.y);ctx.fillStyle='#0005';ctx.fillRect(-b.w/2+3,-river.thick*.38+5,b.w,river.thick*.82);
 const wood=ctx.createLinearGradient(0,-river.thick*.45,0,river.thick*.45);wood.addColorStop(0,'#9b6338');wood.addColorStop(.5,'#704522');wood.addColorStop(1,'#4e2d19');ctx.fillStyle=wood;ctx.fillRect(-b.w/2,-river.thick*.45,b.w,river.thick*.9);
 for(let x=-b.w/2+3;x<b.w/2;x+=15){ctx.fillStyle='#c58a50';ctx.fillRect(x,-river.thick*.41,11,river.thick*.82);ctx.fillStyle='#4a2a18';ctx.fillRect(x+10,-river.thick*.41,2,river.thick*.82)}
 ctx.strokeStyle='#e0aa69';ctx.lineWidth=2;ctx.strokeRect(-b.w/2,-river.thick*.45,b.w,river.thick*.9);ctx.restore();
}
function drawBird(b){
 ctx.save();ctx.translate(b.x,b.y);ctx.imageSmoothingEnabled=false;
 const flap=Math.sin(b.flap)*b.size*.75;
 ctx.strokeStyle='rgba(30,35,30,.78)';ctx.lineWidth=Math.max(1,Math.round(b.size*.55));ctx.lineCap='square';
 ctx.beginPath();ctx.moveTo(-b.size*1.8,0);ctx.lineTo(-b.size*.55,-flap);ctx.lineTo(0,1);ctx.lineTo(b.size*.55,-flap);ctx.lineTo(b.size*1.8,0);ctx.stroke();
 ctx.fillStyle='rgba(20,25,22,.82)';ctx.fillRect(-1,0,3,2);
 ctx.restore();
}
function drawTree(t){
  const s=t.r/22; ctx.save();ctx.translate(t.x,t.y);ctx.imageSmoothingEnabled=false;
  if(infernoBattle){
    ctx.fillStyle='#13080a';ctx.fillRect(-18*s,10*s,36*s,30*s);
    ctx.fillStyle='#4b0c12';
    for(const [x,y,r] of [[-12,-12,15],[7,-13,17],[-2,-24,16],[-20,1,13],[16,1,14],[0,5,18]]){ctx.beginPath();ctx.arc(x*s,y*s,r*s,0,6.28);ctx.fill()}
    ctx.fillStyle='#8f1620';
    for(const [x,y,r] of [[-12,-16,10],[5,-19,11],[-18,-1,9],[10,-1,10],[0,-7,12],[0,7,10]]){ctx.beginPath();ctx.arc(x*s,y*s,r*s,0,6.28);ctx.fill()}
    ctx.fillStyle='#bf2630';ctx.fillRect(-8*s,-28*s,6*s,4*s);ctx.fillRect(8*s,-13*s,5*s,4*s);
    ctx.restore();return;
  }
  const trunkW=Math.max(6,Math.round(9*s)), trunkH=Math.max(25,Math.round(34*s));
  // Miękki cień jest ustawiany zależnie od typu rośliny.
  // Iglaki mają pień kończący się niżej, więc ich cień schodzi bliżej podstawy.
  // Krzewy/korony liściaste mają cień podniesiony do zwartej podstawy,
  // żeby nie wyglądał jak oderwany od rośliny.
  ctx.fillStyle='rgba(20,35,22,.38)';
  const isConifer=(t.type==='pine'||t.type==='spruce'||t.type==='fir');
  const isBush=(t.type==='oak');
  const shadowY=isConifer?Math.max(31,Math.round(35*s)):(isBush?Math.max(17,Math.round(20*s)):Math.max(27,Math.round(31*s)));
  const shadowRx=isBush?Math.max(14,Math.round(21*s)):Math.max(14,Math.round(23*s));
  const shadowRy=isBush?Math.max(3,Math.round(4*s)):Math.max(3,Math.round(5*s));
  ctx.beginPath();ctx.ellipse(0,shadowY,shadowRx,shadowRy,0,0,6.28);ctx.fill();
  if(t.type==='oak'){
    // broadleaf canopy: layered chunky pixel clusters
    ctx.fillStyle='#183d25';
    const blobs=[[-12,-12,15],[7,-13,17],[-2,-24,16],[-20,1,13],[16,1,14],[0,5,18]];
    for(const [x,y,r] of blobs){ctx.beginPath();ctx.arc(x*s,y*s,r*s,0,6.28);ctx.fill()}
    ctx.fillStyle='#2d6330';
    const hi=[[-12,-16,10],[5,-19,11],[-18,-1,9],[10,-1,10],[0,-7,12],[0,7,10]];
    for(const [x,y,r] of hi){ctx.beginPath();ctx.arc(x*s,y*s,r*s,0,6.28);ctx.fill()}
    ctx.fillStyle='#4b8238';ctx.fillRect(-11*s,-24*s,6*s,4*s);ctx.fillRect(8*s,-13*s,5*s,4*s);ctx.fillRect(-20*s,1*s,5*s,3*s);
  }else if(t.type==='birch'){
    // birch trunk with black pixel markings
    ctx.fillStyle='#d8d5b9';ctx.fillRect(-trunkW/2, -2*s, trunkW, trunkH);
    ctx.fillStyle='#6f7461';ctx.fillRect(-trunkW/2, 7*s, trunkW, 3*s);ctx.fillRect(trunkW/4, 17*s, trunkW/2, 3*s);
    ctx.fillStyle='#25251f';ctx.fillRect(-trunkW/2-1,5*s,Math.max(3,4*s),3*s);ctx.fillRect(trunkW/3,12*s,Math.max(3,5*s),3*s);ctx.fillRect(-trunkW/2,25*s,Math.max(3,5*s),3*s);
    ctx.fillStyle='#173f28';
    for(const [x,y,w,h] of [[-15,-13,22,13],[8,-15,24,14],[-3,-27,20,13],[-19,1,17,11],[14,1,17,11]])ctx.fillRect(x*s,y*s,w*s,h*s);
    ctx.fillStyle='#2d6934';
    for(const [x,y,w,h] of [[-11,-17,13,7],[9,-18,15,7],[-4,-29,12,6],[-18,0,10,6],[14,0,10,6]])ctx.fillRect(x*s,y*s,w*s,h*s);
  }else{
    // conifers: layered triangular boughs, alternating spruce/fir silhouettes
    const tall=t.type==='fir'?34:31;
    ctx.fillStyle=t.type==='spruce'?'#123b2a':'#16442b';
    ctx.fillRect(-trunkW/2,6*s,trunkW,trunkH);
    const layers=t.type==='spruce'?5:4;
    for(let i=0;i<layers;i++){
      const yy=(-25+i*10)*s, half=(8+i*5)*(t.type==='spruce'?1.05:1);
      ctx.fillStyle=i%2?'#205b32':'#17492b';
      ctx.beginPath();ctx.moveTo(0,(yy-9*s));ctx.lineTo(-half*s,(yy+11*s));ctx.lineTo(half*s,(yy+11*s));ctx.closePath();ctx.fill();
      ctx.fillStyle='#34743a';ctx.fillRect(-half*.55*s,(yy+2*s),half*.75*s,2.5*s);
    }
    ctx.fillStyle='#6b472c';ctx.fillRect(-Math.max(3,trunkW*.25),7*s,Math.max(5,trunkW*.5),trunkH);
  }
  // pixel bark highlights / needles at base
  ctx.fillStyle='#315d36';ctx.fillRect(-4*s,Math.round(26*s),8*s,3*s);
  ctx.restore();
}
function drawBranch(b){
 ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.a);ctx.imageSmoothingEnabled=false;
 const w=b.w||48, sh=b.shape||0, twist=b.twist||0;
 // Naturalna, nieregularna gałąź: pień główny + odnogi o różnych długościach.
 const bark=ctx.createLinearGradient(-w*.5,-2,w*.5,2);
 bark.addColorStop(0,'#2f1b12');bark.addColorStop(.35,'#68452d');bark.addColorStop(.62,'#8a603a');bark.addColorStop(1,'#3b2115');
 ctx.strokeStyle=bark;ctx.lineCap='round';ctx.lineJoin='round';
 const mainY=Math.sin(twist)*3;
 ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-w*.50,mainY+3);ctx.quadraticCurveTo(-w*.18,-3,w*.12,mainY);ctx.quadraticCurveTo(w*.34,4,w*.50,-1);ctx.stroke();
 ctx.lineWidth=3.5;ctx.beginPath();
 if(sh===0||sh===2){ctx.moveTo(-w*.10,mainY);ctx.quadraticCurveTo(-w*.02,-10,w*.16,-17);ctx.moveTo(w*.24,2,w*.34,-10);}
 else if(sh===1){ctx.moveTo(-w*.27,0);ctx.quadraticCurveTo(-w*.20,-13,-w*.04,-18);ctx.moveTo(w*.05,1);ctx.quadraticCurveTo(w*.18,11,w*.31,15);}
 else {ctx.moveTo(-w*.02,0);ctx.quadraticCurveTo(w*.02,10,w*.18,16);ctx.moveTo(-w*.32,0);ctx.quadraticCurveTo(-w*.38,-9,-w*.27,-15);}
 ctx.stroke();
 // Jaśniejsze fragmenty kory zamiast jednej prostej kreski.
 ctx.strokeStyle='rgba(194,145,91,.62)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-w*.39,1);ctx.lineTo(-w*.16,-1);ctx.moveTo(w*.05,-1);ctx.lineTo(w*.28,2);ctx.moveTo(-w*.02,-2);ctx.lineTo(w*.10,-12);ctx.stroke();
 ctx.fillStyle='#2b1810';ctx.fillRect(-w*.48,1,5,4);ctx.fillRect(w*.43,-3,5,4);
 ctx.restore();}

function drawHallucMush(x,y,phase=0){
 ctx.save();ctx.translate(x,y);ctx.imageSmoothingEnabled=false;
 const bob=Math.sin(performance.now()/180+phase)*2;ctx.translate(0,bob);
 // Neon rainbow cap, deliberately more colorful than ordinary mushrooms.
 ctx.fillStyle='#42e8ff';ctx.fillRect(-11,-1,22,5);
 ctx.fillStyle='#8a5cff';ctx.beginPath();ctx.arc(-5,-2,7,Math.PI,0);ctx.arc(5,-2,7,Math.PI,0);ctx.fill();
 ctx.fillStyle='#ff4bd8';ctx.fillRect(-10,-5,20,4);
 ctx.fillStyle='#ffe44d';ctx.fillRect(-7,-9,14,4);
 ctx.fillStyle='#ff6b35';ctx.fillRect(-4,-12,8,4);
 ctx.fillStyle='#f5f0dc';ctx.fillRect(-4,4,8,11);
 ctx.fillStyle='#55ff8a';ctx.fillRect(-6,8,4,3);ctx.fillRect(2,5,4,3);
 ctx.restore();
}
function drawMush(x,y){ctx.save();ctx.translate(x,y);
 ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(0,10,9,3,0,0,6.28);ctx.fill();
 const sg=ctx.createLinearGradient(0,0,0,12);sg.addColorStop(0,'#fff8e8');sg.addColorStop(1,'#c9b995');ctx.fillStyle=sg;ctx.fillRect(-3,0,6,11);
 const cg=ctx.createRadialGradient(-3,-3,1,0,0,10);cg.addColorStop(0,'#d95a48');cg.addColorStop(.7,'#9e3c32');cg.addColorStop(1,'#6f2925');ctx.fillStyle=cg;ctx.beginPath();ctx.arc(0,0,10,Math.PI,0);ctx.fill();
 ctx.fillStyle='#fff9';ctx.beginPath();ctx.arc(-3,-3,2,0,6.28);ctx.arc(3,-5,2,0,6.28);ctx.fill();ctx.restore()}
function drawBottle(x,y){ctx.save();ctx.translate(x,y);
 ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(0,11,8,3,0,0,6.28);ctx.fill();
 const bg=ctx.createLinearGradient(-7,0,7,0);bg.addColorStop(0,'#214d2d');bg.addColorStop(.5,'#68a85c');bg.addColorStop(1,'#254f2c');ctx.fillStyle=bg;ctx.fillRect(-6,-10,12,20);
 ctx.fillStyle='#d7b75a';ctx.fillRect(-4,-15,8,6);ctx.fillStyle='#f6eac8';ctx.fillRect(-5,-3,10,8);
 ctx.fillStyle='#315d38';ctx.font='bold 5px Arial';ctx.textAlign='center';ctx.fillText('ŻUBR',0,3);ctx.strokeStyle='#d7b75a88';ctx.strokeRect(-6,-10,12,20);ctx.restore()}
function drawToldiLegacy(x,y){
 ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,31,25,6,0,0,6.28);ctx.fill();ctx.restore();
 const w=Math.sin(performance.now()/110)*3;ctx.save();ctx.translate(x,y);
 ctx.fillStyle='#222';ctx.fillRect(-9,12,7,17+w);ctx.fillRect(2,12,7,17-w);ctx.fillRect(-11,28+w,10,5);ctx.fillRect(2,28-w,11,5);
 ctx.fillStyle='#5b4b35';ctx.fillRect(-11,-9,22,23);ctx.fillStyle='#263d45';ctx.fillRect(-15,-7,5,20);ctx.fillRect(10,-7,5,20);
 ctx.strokeStyle='#d79f78';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-9,-4);ctx.lineTo(-19,6+w);ctx.moveTo(9,-4);ctx.lineTo(19,6-w);ctx.stroke();
 // Face is a clean transparent cutout from the exact cover artwork.
 if(toldiFaceReady){
   ctx.imageSmoothingEnabled=false;
   const frame=Math.floor(performance.now()/650)%3;
   ctx.drawImage(toldiFace,frame*96,0,96,100,-22,-46,44,46);
 }else{
   ctx.fillStyle='#dca67d';ctx.fillRect(-10,-28,20,20);
   ctx.fillStyle='#18120f';ctx.fillRect(-6,-22,3,3);ctx.fillRect(4,-22,3,3);ctx.fillRect(-3,-15,7,2);
 }
 ctx.fillStyle='#f4f0dc';ctx.fillRect(13,4,22,21);ctx.strokeStyle='#c22';ctx.lineWidth=2;ctx.strokeRect(13,4,22,21);ctx.save();ctx.beginPath();ctx.rect(14,5,20,19);ctx.clip();ctx.fillStyle='#d22';ctx.font='bold 3px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('BIEDRONKA',24,15,19);ctx.restore();
 // subtelny kontur światła poprawiający czytelność postaci na tle lasu
 ctx.globalAlpha=.20;ctx.strokeStyle='#fff4b0';ctx.lineWidth=2;ctx.strokeRect(-23,-47,46,48);ctx.globalAlpha=1;
 ctx.restore();
}
function drawToldi(x,y){
 let anim='idle';
 // V164: animacja leżenia/śmierci wyłączona całkowicie; Tołdi nigdy nie pozostaje na ziemi.
 if(toldiActionTimer>0&&toldiAction&&toldiAction!=='death'&&toldiAnimSheets[toldiAction]) anim=toldiAction;
 else if(Math.abs(toldiMoveX)>.18) anim=toldiMoveX<0?'walkLeft':'walkRight';
 else if(Math.abs(toldiMoveY)>.18) anim='jump';
 const entry=toldiAnimSheets[anim];
 if(!entry||!entry.img.complete||!entry.img.naturalWidth){drawToldiLegacy(x,y);return;}
 const frame=Math.floor((performance.now()/1000)*entry.fps)%entry.frames;
 ctx.save();ctx.translate(x,y);
 ctx.fillStyle='rgba(0,0,0,.30)';ctx.beginPath();ctx.ellipse(0,31,25,6,0,0,Math.PI*2);ctx.fill();
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(entry.img,frame*128,0,128,200,-31,-65,62,98);
 ctx.restore();
}
function drawGuard(x,y){
 ctx.save();ctx.translate(x,y);ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='rgba(0,0,0,.30)';ctx.beginPath();ctx.ellipse(0,8,25,5,0,0,6.28);ctx.fill();
 const g=guard;
 const close=g?Math.hypot(P.x-g.x,P.y-g.y)<170:false;
 const moving=g?g.moving:false;
 let img=guardIdleSprite,frames=4;
 if(close&&guardAlertSprite.complete&&guardAlertSprite.naturalWidth){img=guardAlertSprite;frames=3}
 else if(moving){
   if(g&&g.dir==='right'&&guardWalkRightSprite.complete&&guardWalkRightSprite.naturalWidth)img=guardWalkRightSprite;
   else if(g&&g.dir==='left'&&guardWalkLeftSprite.complete&&guardWalkLeftSprite.naturalWidth)img=guardWalkLeftSprite;
 }
 if(!img.complete||!img.naturalWidth){
   // Asset fallback: keep the enemy visible even if a browser has a stale cache.
   ctx.fillStyle='#314b2b';ctx.fillRect(-14,-35,28,36);
   ctx.fillStyle='#d79f78';ctx.fillRect(-9,-52,18,17);
   ctx.fillStyle='#172018';ctx.fillRect(-12,-55,24,6);
   ctx.fillStyle='#5b4b35';ctx.fillRect(-16,2,10,25);ctx.fillRect(6,2,10,25);
   ctx.restore();return
}
 const frameW=130,frameH=210;
 const frame=Math.floor(((g&&g.animT)||0)*7)%frames;
 const h=Math.min(96,Math.max(78,H*.105)),w=h*(frameW/frameH);
 ctx.drawImage(img,frame*frameW,0,frameW,frameH,-w*.5,-h*.84,w,h);
 ctx.restore();
}
function drawBoar(x,y){
 ctx.save();ctx.translate(x,y);ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='rgba(0,0,0,.30)';ctx.beginPath();ctx.ellipse(0,-2,42,8,0,0,6.28);ctx.fill();
 const b=boar;
 const moving=!!(b&&b.moving);
 const frames=[boarRun1Sprite,boarRun2Sprite,boarRun3Sprite];
 // Three completely separate PNG sprites. We never crop a sprite sheet here.
 const idx=moving ? Math.floor(((b&&b.animT)||0)*8)%3 : 0;
 const img=frames[idx];
 const w=Math.min(108,Math.max(92,W*.235)),h=w*(108/126);
 const left=b&&b.dir==='left';
 if(img.complete&&img.naturalWidth){
   ctx.save();ctx.scale(left?-1:1,1);
   ctx.drawImage(img,-w*.5,-h*.88,w,h);
   ctx.restore();
 }
 ctx.restore();
}

function drawKingCave(){
 ctx.save();
 const cx=W*.80, cy=Math.max(72,H*.13), s=Math.min(1.15,Math.max(.82,W/360));
 // Decorative only: the cave has no collision and never affects gameplay.
 ctx.translate(cx,cy);ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='#241515';ctx.beginPath();ctx.moveTo(-58,26);ctx.lineTo(-50,-8);ctx.quadraticCurveTo(-42,-42,0,-52);ctx.quadraticCurveTo(42,-42,50,-8);ctx.lineTo(58,26);ctx.closePath();ctx.fill();
 ctx.fillStyle='#4b2a22';ctx.beginPath();ctx.moveTo(-48,23);ctx.lineTo(-41,-7);ctx.quadraticCurveTo(-32,-32,0,-40);ctx.quadraticCurveTo(32,-32,41,-7);ctx.lineTo(48,23);ctx.closePath();ctx.fill();
 ctx.fillStyle='#090708';ctx.beginPath();ctx.moveTo(-29,25);ctx.lineTo(-25,0);ctx.quadraticCurveTo(-20,-25,0,-28);ctx.quadraticCurveTo(20,-25,25,0);ctx.lineTo(29,25);ctx.closePath();ctx.fill();
 ctx.fillStyle='#7f452c';ctx.fillRect(-58,23,116,7);
 ctx.fillStyle='#c27a3e';ctx.fillRect(-48,19,10,4);ctx.fillRect(35,19,10,4);
 ctx.fillStyle='#d9a14a';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.fillText('JASKINIA KRÓLA',0,-58);
 ctx.restore();
}
function drawKingShot(f){
 ctx.save();ctx.translate(f.x,f.y);ctx.rotate(Math.atan2(f.vy,f.vx));
 // Mały grzybowy pocisk, spójny z pixel-artową grafiką gry.
 ctx.fillStyle='#6f3824';ctx.fillRect(-7,1,14,5);ctx.fillStyle='#ead8b0';ctx.fillRect(-4,0,8,5);
 ctx.fillStyle='#c63d3d';ctx.beginPath();ctx.ellipse(0,-2,8,5,0,Math.PI,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fff0d8';ctx.fillRect(-4,-5,2,2);ctx.fillRect(2,-6,2,2);
 ctx.restore();
}

function drawBoss(x,y){
 ctx.save();ctx.translate(x,y);ctx.imageSmoothingEnabled=false;
 // Cień pozostaje pod podstawą sprite'a, a nie pod jego środkiem.
 ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(0,11,43,7,0,0,6.28);ctx.fill();
 if(kingPrawdziwkowReady){
   const ar=kingPrawdziwkowSprite.naturalWidth/kingPrawdziwkowSprite.naturalHeight;
   const h=Math.min(190,Math.max(150,H*.24));
   const w=h*ar;
   // Sprite jest w pełni kryjący (PNG ma tylko 0/255 alpha). Rysujemy go na jednej
   // warstwie, bez półprzezroczystości, a cień kontaktowy pozostaje wyłącznie pod nim.
   ctx.globalAlpha=1;
   ctx.drawImage(kingPrawdziwkowSprite,-w*.5,-h*.93,w,h);
 }else{
   // Awaryjny prosty renderer do czasu załadowania PNG.
   ctx.fillStyle='#8a4930';ctx.beginPath();ctx.arc(0,2,26,0,6.28);ctx.fill();
   ctx.fillStyle='#e4b52f';ctx.beginPath();ctx.moveTo(-17,-18);ctx.lineTo(-14,-36);ctx.lineTo(-5,-25);ctx.lineTo(0,-40);ctx.lineTo(7,-25);ctx.lineTo(16,-36);ctx.lineTo(18,-18);ctx.fill();
 }
 ctx.restore();
}
function drawBelzCover(o){
 ctx.save();ctx.translate(o.x,o.y);ctx.imageSmoothingEnabled=false;
 // Ciężka kamienna osłona w piekielnym lesie — blokuje Tołdiego i pociski.
 ctx.fillStyle='#170c0d';ctx.beginPath();ctx.moveTo(-o.r*.85,o.r*.55);ctx.lineTo(-o.r*.68,-o.r*.48);ctx.lineTo(-o.r*.20,-o.r*.82);ctx.lineTo(o.r*.55,-o.r*.70);ctx.lineTo(o.r*.88,-o.r*.18);ctx.lineTo(o.r*.72,o.r*.58);ctx.lineTo(.05*o.r,o.r*.86);ctx.closePath();ctx.fill();
 ctx.fillStyle='#4a2720';ctx.beginPath();ctx.moveTo(-o.r*.72,o.r*.42);ctx.lineTo(-o.r*.56,-o.r*.38);ctx.lineTo(-o.r*.12,-o.r*.66);ctx.lineTo(o.r*.48,-o.r*.54);ctx.lineTo(o.r*.68,-o.r*.10);ctx.lineTo(o.r*.56,o.r*.44);ctx.lineTo(0,o.r*.68);ctx.closePath();ctx.fill();
 ctx.fillStyle='#8b432b';ctx.fillRect(-o.r*.45,-o.r*.28,o.r*.18,3);ctx.fillRect(o.r*.05,o.r*.05,o.r*.25,3);ctx.fillRect(-o.r*.18,o.r*.42,o.r*.30,3);
 ctx.strokeStyle='#b55231';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-o.r*.42,-o.r*.48);ctx.lineTo(-o.r*.10,-o.r*.18);ctx.lineTo(-o.r*.28,o.r*.28);ctx.moveTo(o.r*.25,-o.r*.48);ctx.lineTo(o.r*.08,-o.r*.05);ctx.lineTo(o.r*.38,o.r*.28);ctx.stroke();
 ctx.restore();
}
function drawBelzebub(x,y){
 ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(0,34,42,9,0,0,6.28);ctx.fill();ctx.imageSmoothingEnabled=false;
 const bob=Math.sin(performance.now()/180)*3;ctx.translate(0,bob);
 if(belzebubSpriteReady){
   const ar=belzebubSprite.width/belzebubSprite.height;const h=Math.min(180,H*.34);const w=h*ar;
   ctx.drawImage(belzebubSprite,-w/2,-h*.86,w,h);
 }else{
   ctx.fillStyle='#8f1d22';ctx.beginPath();ctx.arc(0,-30,32,0,6.28);ctx.fill();
   ctx.fillStyle='#4a070b';ctx.beginPath();ctx.moveTo(-20,-52);ctx.lineTo(-45,-78);ctx.lineTo(-30,-35);ctx.moveTo(20,-52);ctx.lineTo(45,-78);ctx.lineTo(30,-35);ctx.fill();
   ctx.fillStyle='#ff3b30';ctx.fillRect(-13,-36,7,5);ctx.fillRect(6,-36,7,5);
 }
 ctx.restore();
}
function drawSatanicMushroom(m){ctx.save();ctx.translate(m.x,m.y);const p=Math.sin(performance.now()/180+m.phase);ctx.shadowColor='#ff1025';ctx.shadowBlur=12;ctx.fillStyle='#d8c8b4';ctx.fillRect(-5,0,10,15);ctx.fillStyle='#4c0711';ctx.beginPath();ctx.ellipse(0,-2,17,11,0,Math.PI,Math.PI*2);ctx.lineTo(17,-2);ctx.quadraticCurveTo(0,8,-17,-2);ctx.fill();ctx.fillStyle='#ff2638';ctx.beginPath();ctx.ellipse(0,-4,17,11+p*1.5,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#f7e8d8';for(const [x,y] of [[-8,-8],[0,-11],[8,-7],[3,-4],[-4,-3]])ctx.fillRect(x,y,3,3);ctx.strokeStyle='#ff8a8a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-3,20,14,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
function drawSatanicShot(q){ctx.save();ctx.translate(q.x,q.y);ctx.rotate(Math.atan2(q.vy,q.vx));ctx.shadowColor='#ff1428';ctx.shadowBlur=15;ctx.fillStyle='#ff283b';ctx.beginPath();ctx.ellipse(0,0,12,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff0e6';ctx.fillRect(-3,-3,5,2);ctx.restore();}
function drawFireball(x,y){
 ctx.save();ctx.translate(x,y);ctx.shadowColor='#ff3b00';ctx.shadowBlur=12;
 ctx.fillStyle='#ff3b18';ctx.beginPath();ctx.arc(0,0,8,0,6.28);ctx.fill();
 ctx.fillStyle='#ffd34d';ctx.beginPath();ctx.arc(-2,-2,4,0,6.28);ctx.fill();
 ctx.restore();
}

function drawTitleCar(){
 const x=W*.5,y=H*.27;
 ctx.save();ctx.translate(x,y);ctx.fillStyle='#252a2c';ctx.fillRect(-75,-25,150,50);ctx.fillStyle='#4f6672';ctx.fillRect(-48,-39,96,25);ctx.fillStyle='#9fc3d1';ctx.fillRect(-38,-34,32,18);ctx.fillRect(7,-34,32,18);
 ctx.fillStyle='#111';ctx.beginPath();ctx.arc(-48,25,15,0,6.28);ctx.arc(48,25,15,0,6.28);ctx.fill();
 ctx.fillStyle='#aaa';ctx.beginPath();ctx.arc(-48,25,6,0,6.28);ctx.arc(48,25,6,0,6.28);ctx.fill();
 // smoke
 for(let i=0;i<5;i++){ctx.fillStyle=`rgba(220,220,220,${.35-i*.05})`;ctx.beginPath();ctx.arc(-88-i*10,15-i*14,10+i*2,0,6.28);ctx.fill()}ctx.restore();
}

function loop(t){const dt=Math.min((t-last)/1000||0,.033);last=t;if(toast>0){toast-=dt*1000;if(toast<=0)msg.style.display='none'}update(dt);draw();requestAnimationFrame(loop)}
gameover.style.display='none'; win.style.display='none'; title.style.display='flex';
startMenuMusic();
// Próba uruchomienia muzyki natychmiast po załadowaniu oraz po wznowieniu strony.
// Jeśli przeglądarka zablokuje autoplay, istniejące mechanizmy pointerdown/touchstart/click odblokują ją przy pierwszej interakcji.
window.addEventListener('load',()=>{if(state==='title')startMenuMusic();},{once:true});
window.addEventListener('pageshow',()=>{if(state==='title')startMenuMusic();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state==='title'&&!menuAudioTimer)startMenuMusic();});
requestAnimationFrame(loop);
