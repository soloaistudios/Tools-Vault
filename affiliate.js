(() => {
  document.addEventListener('click', event => {
    const link=event.target.closest('.affiliate-link');
    if(!link)return;
    const url=link.dataset.affiliateUrl||'';
    if(!url){
      event.preventDefault();
      const old=link.innerHTML;
      link.textContent='Affiliate link not configured yet';
      setTimeout(()=>{link.innerHTML=old;},1800);
      return;
    }
    try{link.target='_blank';link.rel='sponsored nofollow noopener';}catch{}
  });
})();
