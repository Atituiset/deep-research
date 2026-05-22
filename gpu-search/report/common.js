window.__lang=localStorage.getItem('hf-lang')||'zh';
window.__theme=localStorage.getItem('hf-theme')||'dark';

function setLang(l){
window.__lang=l;localStorage.setItem('hf-lang',l);
document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('on',b.dataset.lang===l));
applyI18N();
if(typeof window.__renderCharts === 'function'){
  window.__renderCharts();
}
}


function buildToggles(){
const container=document.querySelector('.nav-toggles');
if(!container)return;

const langBtn=document.createElement('button');
langBtn.className='lang-btn'+(window.__lang==='zh'?' on':'');
langBtn.dataset.lang='zh';langBtn.textContent='中';
langBtn.addEventListener('click',()=>setLang('zh'));
const langBtn2=document.createElement('button');
langBtn2.className='lang-btn'+(window.__lang==='en'?' on':'');
langBtn2.dataset.lang='en';langBtn2.textContent='EN';
langBtn2.addEventListener('click',()=>setLang('en'));

const sep=document.createElement('span');sep.className='sep';

const themeBtn=document.createElement('button');
themeBtn.className='theme-btn';
themeBtn.textContent=window.__theme==='dark'?'☀':'🌙';
themeBtn.title=window.__theme==='dark'?'Switch to light mode':'Switch to dark mode';
themeBtn.addEventListener('click',()=>{
if(window.__theme==='dark')setTheme('light');else setTheme('dark');
});

container.appendChild(langBtn);
container.appendChild(langBtn2);
container.appendChild(sep);
container.appendChild(themeBtn);
}

function setTheme(t){
window.__theme=t;localStorage.setItem('hf-theme',t);
document.documentElement.classList.toggle('light',t==='light');
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.textContent=t==='dark'?'☀':'🌙';
  btn.title=t==='dark'?'Switch to light mode':'Switch to dark mode';
});
if(typeof window.__renderCharts === 'function'){
  window.__renderCharts();
}
}

function applyI18N(){
document.querySelectorAll('[data-i18n]').forEach(el=>{
const key=el.getAttribute('data-i18n');
const text=T(key);
if(text && text !== key)el.innerHTML=text;
});
}

document.addEventListener('DOMContentLoaded',()=>{
setTheme(window.__theme);
buildToggles();
applyI18N();
});

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if(typeof window.__renderCharts === 'function'){
      window.__renderCharts();
    }
  }, 200);
});

