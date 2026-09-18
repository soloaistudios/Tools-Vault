(() => {
  if(!document.getElementById('toolsGrid')) return;
  let activeList=[...TOOL_DATA];
  let visibleCount=6;
  const state={search:'',category:'all',types:[],featured:false,popular:false,sort:'featured'};
  const els={grid:document.getElementById('toolsGrid'),count:document.getElementById('resultsCount'),empty:document.getElementById('toolsEmptyState'),load:document.getElementById('loadMoreTools')};
  const apply=()=>{
    let list=TOOL_DATA.filter(t=>{
      const hay=`${t.name} ${t.description} ${t.categoryLabel}`.toLowerCase();
      if(state.search && !hay.includes(state.search.toLowerCase())) return false;
      if(state.category!=='all' && t.category!==state.category) return false;
      if(state.types.length && !state.types.includes(t.type)) return false;
      if(state.featured && !t.featured) return false;
      if(state.popular && !t.popular) return false;
      return true;
    });
    if(state.sort==='name-asc')list.sort((a,b)=>a.name.localeCompare(b.name));
    if(state.sort==='name-desc')list.sort((a,b)=>b.name.localeCompare(a.name));
    if(state.sort==='featured')list.sort((a,b)=>Number(b.featured)-Number(a.featured)||a.name.localeCompare(b.name));
    activeList=list; els.count.textContent=list.length; els.empty.hidden=list.length>0;
    els.grid.innerHTML=list.slice(0,visibleCount).map(toolVault.toolCard).join('');
    els.load.hidden=list.length<=visibleCount;
    els.load.disabled=false;
    els.load.removeAttribute('aria-disabled');
    els.load.innerHTML='Load More Tools <span>↓</span>';
  };
  const params=new URLSearchParams(location.search);
  state.search=params.get('search')||'';
  state.category=params.get('category')||'all';
  const search=document.getElementById('toolSearch');
  if(search)search.value=state.search;
  const radio=[...document.querySelectorAll('input[name="category"]')].find(r=>r.value===state.category);
  if(radio)radio.checked=true;
  search?.addEventListener('input',()=>{state.search=search.value;visibleCount=6;apply();});
  document.getElementById('clearSearch')?.addEventListener('click',()=>{state.search='';search.value='';apply();search.focus();});
  document.querySelectorAll('input[name="category"]').forEach(r=>r.addEventListener('change',()=>{state.category=r.value;visibleCount=6;apply();}));
  document.querySelectorAll('input[name="type"]').forEach(c=>c.addEventListener('change',()=>{state.types=[...document.querySelectorAll('input[name="type"]:checked')].map(x=>x.value);visibleCount=6;apply();}));
  document.getElementById('featuredOnly')?.addEventListener('change',e=>{state.featured=e.target.checked;visibleCount=6;apply();});
  document.getElementById('popularOnly')?.addEventListener('change',e=>{state.popular=e.target.checked;visibleCount=6;apply();});
  document.getElementById('sortTools')?.addEventListener('change',e=>{state.sort=e.target.value;apply();});
  const reset=()=>{state.search='';state.category='all';state.types=[];state.featured=false;state.popular=false;state.sort='featured';visibleCount=6;if(search)search.value='';document.querySelector('input[name="category"][value="all"]').checked=true;document.querySelectorAll('input[name="type"]').forEach(x=>x.checked=false);if(document.getElementById('featuredOnly'))document.getElementById('featuredOnly').checked=false;if(document.getElementById('popularOnly'))document.getElementById('popularOnly').checked=false;document.getElementById('sortTools').value='featured';apply();};
  document.getElementById('resetFilters')?.addEventListener('click',reset);document.getElementById('emptyResetButton')?.addEventListener('click',reset);
  const loadAll=()=>{
    visibleCount=activeList.length;
    apply();
    if(els.load){
      els.load.textContent='All Tools Loaded';
      els.load.disabled=true;
      els.load.setAttribute('aria-disabled','true');
    }
  };
  window.toolVaultLoadMore=loadAll;
  els.load?.addEventListener('click',loadAll);
  const sidebar=document.getElementById('toolsSidebar'), overlay=document.getElementById('sidebarOverlay');
  const toggle=v=>{sidebar?.classList.toggle('open',v);overlay?.classList.toggle('open',v);};
  document.getElementById('filterMobileToggle')?.addEventListener('click',()=>toggle(true));document.getElementById('sidebarClose')?.addEventListener('click',()=>toggle(false));overlay?.addEventListener('click',()=>toggle(false));
  apply();
})();
