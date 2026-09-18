function renderHomeCategories(){
  const target=document.getElementById('homeCategories'); if(!target)return;
  target.innerHTML=Object.entries(categoryMeta).map(([key,meta])=>`<a class="category-card" href="categories.html?category=${key}"><span class="category-icon">${meta.icon}</span><span class="category-content"><strong>${meta.name}</strong><small>${TOOL_DATA.filter(t=>t.category===key).length} curated tools</small></span><span class="category-arrow">→</span></a>`).join('');
}
function renderCategoryDirectory(){
  const target=document.getElementById('categoryDirectory'); if(!target)return;
  const params=new URLSearchParams(location.search); const selected=params.get('category');
  target.innerHTML=Object.entries(categoryMeta).map(([key,meta])=>{
    const active=selected===key?' style="outline:1px solid rgba(113,140,255,.45);"':'';
    return `<a class="category-card" href="tools.html?category=${key}"${active}><span class="category-icon">${meta.icon}</span><span class="category-content"><strong>${meta.name}</strong><small>${TOOL_DATA.filter(t=>t.category===key).length} tools</small><p>${meta.description}</p></span><span class="category-arrow">→</span></a>`;
  }).join('');
}
renderHomeCategories();
renderCategoryDirectory();
