const BLOG_DATA=[
 {tag:'BUSINESS',title:'How to choose an online-business platform',text:'A simple framework for comparing websites, funnels, email, payments, and automation without buying more software than you need.'},
 {tag:'AI',title:'What to look for in an AI business tool',text:'Compare the workflow, integrations, output quality, limits, and actual time saved before choosing a subscription.'},
 {tag:'SEO',title:'When an SEO platform is worth paying for',text:'Understand when keyword research, competitor data, content workflows, and audits become useful enough to justify a paid tool.'},
 {tag:'MARKETING',title:'Email marketing tools: the features that matter',text:'A practical look at automation, segmentation, landing pages, analytics, and deliverability when comparing platforms.'},
 {tag:'CREATORS',title:'A practical creator-tool stack',text:'How design, editing, research, planning, and publishing tools can fit together without turning your workflow into a mess.'},
 {tag:'AUTOMATION',title:'Where business automation actually helps',text:'Start with repetitive workflows that are predictable, measurable, and easy to test before automating everything.'}
];
const grid=document.getElementById('blogGrid');
if(grid)grid.innerHTML=BLOG_DATA.map((p,i)=>`<article class="blog-card"><span class="blog-tag">${p.tag}</span><h3>${p.title}</h3><p>${p.text}</p><a href="tools.html">Explore relevant tools →</a></article>`).join('');
