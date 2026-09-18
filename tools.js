const TOOL_DATA = [
  {id:'systeme-io',name:'Systeme.io',category:'business',categoryLabel:'Business & Funnels',type:'freemium',featured:true,popular:true,description:'Funnels, websites, email campaigns, and online products from one platform.',features:['Funnels & landing pages','Email marketing','Online products'],affiliateUrl:''},
  {id:'getresponse',name:'GetResponse',category:'marketing',categoryLabel:'Marketing & Email',type:'freemium',featured:true,popular:true,description:'Email marketing, automation, landing pages, and audience-growth tools.',features:['Email automation','Landing pages','Webinars'],affiliateUrl:''},
  {id:'semrush',name:'Semrush',category:'seo',categoryLabel:'SEO & Traffic',type:'paid',featured:true,popular:true,description:'SEO, content, competitor research, and marketing intelligence.',features:['Keyword research','Competitor analysis','Site audits'],affiliateUrl:''},
  {id:'jasper',name:'Jasper AI',category:'ai',categoryLabel:'AI Tools',type:'paid',featured:true,popular:true,description:'AI-assisted marketing content, campaigns, copy, and social content.',features:['Marketing copy','Campaign workflows','Content templates'],affiliateUrl:''},
  {id:'wix',name:'Wix',category:'business',categoryLabel:'Business & Funnels',type:'freemium',featured:true,popular:true,description:'Visual website building, ecommerce, and online business tools.',features:['Website builder','Ecommerce','Responsive sites'],affiliateUrl:''},
  {id:'canva',name:'Canva',category:'content',categoryLabel:'Content & Video',type:'freemium',featured:false,popular:true,description:'Design graphics, presentations, video, documents, and branded content.',features:['Graphic design','Video creation','Brand kits'],affiliateUrl:''},
  {id:'zapier',name:'Zapier',category:'automation',categoryLabel:'Automation',type:'freemium',featured:false,popular:true,description:'Connect apps and automate repetitive workflows across your business.',features:['Workflow automation','App integrations','AI workflows'],affiliateUrl:''},
  {id:'hubspot',name:'HubSpot',category:'marketing',categoryLabel:'Marketing & Email',type:'freemium',featured:false,popular:true,description:'CRM, marketing, sales, and customer-service tools for growing teams.',features:['CRM','Marketing tools','Sales automation'],affiliateUrl:''},
  {id:'notion',name:'Notion',category:'business',categoryLabel:'Business & Funnels',type:'freemium',featured:false,popular:true,description:'Projects, documents, tasks, and team knowledge in one flexible workspace.',features:['Project management','Team workspace','AI productivity'],affiliateUrl:''},
  {id:'tubebuddy',name:'TubeBuddy',category:'creator',categoryLabel:'Creator Tools',type:'freemium',featured:false,popular:false,description:'YouTube growth tools for research, optimization, and channel workflows.',features:['Keyword research','Optimization','Channel growth'],affiliateUrl:''},
  {id:'clickup',name:'ClickUp',category:'business',categoryLabel:'Business & Funnels',type:'freemium',featured:false,popular:true,description:'Project, task, documentation, and team workflow management.',features:['Project management','Team collaboration','AI productivity'],affiliateUrl:''},
  {id:'descript',name:'Descript',category:'content',categoryLabel:'Content & Video',type:'freemium',featured:false,popular:false,description:'Text-based video and audio editing with creator-focused AI features.',features:['Text-based editing','Screen recording','AI media tools'],affiliateUrl:''}
];

const categoryMeta = {
  business:{name:'Business & Funnels',icon:'↗',description:'Launch pages, websites, funnels, productivity, and operating systems.'},
  ai:{name:'AI Tools',icon:'✦',description:'AI tools for content, marketing, productivity, and creative work.'},
  marketing:{name:'Marketing & Email',icon:'✉',description:'Email, CRM, campaigns, customer journeys, and conversion workflows.'},
  seo:{name:'SEO & Traffic',icon:'⌕',description:'Search research, content discovery, site audits, and traffic intelligence.'},
  automation:{name:'Automation',icon:'⚙',description:'Connect apps, automate repeatable work, and streamline workflows.'},
  content:{name:'Content & Video',icon:'▶',description:'Design, video, audio, and content-production tools for digital teams.'},
  creator:{name:'Creator Tools',icon:'◎',description:'Tools built around publishing, channel growth, and creator workflows.'}
};

function logoClass(id){ return `${id}-logo`; }
function toolCard(tool){
  return `<article class="tool-card" data-id="${tool.id}">
    <div class="tool-card-top"><span class="tool-category-badge">${tool.categoryLabel}</span><div class="tool-logo ${logoClass(tool.id)}">${tool.name.charAt(0)}</div></div>
    <div class="tool-card-body"><h3>${tool.name}</h3><p>${tool.description}</p><ul class="tool-feature-list">${tool.features.map(f=>`<li><span>✓</span>${f}</li>`).join('')}</ul></div>
    <div class="tool-card-footer"><a class="btn btn-primary btn-small" href="tool.html?id=${encodeURIComponent(tool.id)}">View Tool <span>→</span></a></div>
  </article>`;
}

function renderFeatured(){
  const target=document.getElementById('featuredTools'); if(!target)return;
  target.innerHTML=TOOL_DATA.filter(t=>t.featured).slice(0,5).map(toolCard).join('');
}

function renderAllTools(list=TOOL_DATA){
  const target=document.getElementById('toolsGrid'); if(!target)return;
  target.innerHTML=list.map(toolCard).join('');
  document.getElementById('resultsCount').textContent=list.length;
}

window.toolVault = {toolCard, renderAllTools, categoryMeta};
renderFeatured();
