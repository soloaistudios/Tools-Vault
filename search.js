(() => {
  const form=document.getElementById('globalSearchForm');
  if(form){form.addEventListener('submit',e=>{e.preventDefault();const value=(document.getElementById('globalSearchInput')?.value||'').trim();if(value)location.href=`tools.html?search=${encodeURIComponent(value)}`;});}
})();
