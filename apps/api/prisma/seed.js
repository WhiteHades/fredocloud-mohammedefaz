const bcrypt = require("bcryptjs");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env"), quiet: true });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@notfredohub.test";
const DEMO_PASS = process.env.DEMO_PASSWORD || "demo12345";

const FIRST = ["Amir","Becca","Carlos","Dana","Ehsan","Fatima","Greg","Hana","Ivan","Jasmine","Kei","Lena","Mateo","Nia","Omar","Priya","Quinn","Ravi","Sofia","Thomas","Umar","Val","Wei","Ximena","Yuki","Zara"];
const LAST  = ["Chen","Okonkwo","Schmidt","Miyamoto","Kowalski","Gupta","Andersson","Park","Rodriguez","Al-Farsi","Nakamura","Okafor","Johansson","Santos","Dubois","Tanaka","Adebayo","Larsson","Kumar","Mueller","Wong"];
const DEPTS = ["Engineering","Design","Product","Marketing","Operations","DevRel","Infra","QA","Data","Security","Support","Finance","Legal","Sales","People"];
const GVERBS=["Ship","Launch","Build","Migrate","Refactor","Design","Implement","Scale","Optimise","Automate","Integrate","Deploy","Audit","Consolidate","Standardise","Rollout","Deliver","Prototype","Benchmark","Harden","Decouple","Accelerate","Simplify","Unify","Instrument"];
const GNOUNS=["dashboard analytics","onboarding flow","API v3 endpoints","CI/CD pipeline","notification system","search infrastructure","permission model","audit logging","real-time presence","workspace switcher","SSO integration","rate limiting","dark mode","accessibility audit","database sharding","component library","mobile responsiveness","email pipeline","webhook dispatcher","error tracking","caching layer","load testing suite","admin panel","billing integration","design system","plugin architecture","offline support","i18n framework","release dashboard","feature flags","segmentation engine","data export","chat integration","calendar sync","reporting module","analytics engine","onboarding wizard","rate limiter","multi-region deploy","content moderation"];
const GSTATUS=["NOT_STARTED","IN_PROGRESS","IN_PROGRESS","IN_PROGRESS","AT_RISK","COMPLETED","COMPLETED","ARCHIVED"];
const MILES=["Research and discovery","Technical spec draft","Architecture review","Design wireframes","Stakeholder alignment","Proof of concept","Core implementation","Unit test coverage","Integration test suite","Code review pass","Performance benchmarking","Security audit","Accessibility review","Documentation draft","Beta release","User acceptance testing","Bug bash","Production deploy","Post-launch monitoring","Retrospective"];
const UPDATES=["Completed the initial research spike. Findings documented.","Architecture review passed with 3 minor action items.","Core implementation merged. Unit tests are green.","Integration test suite covers 85% of critical paths now.","Performance benchmarks look good — p99 under 250ms.","Security audit flagged two medium items. Both addressed.","Accessibility review clean. WCAG 2.2 AA compliant.","Documentation draft ready for peer review.","Beta release shipped to staging. Gathering early feedback.","UAT passed. Ready for production deployment.","Bug bash closed 23 issues. 2 cosmetic ones remain.","Production deployment verified across all regions.","Post-launch monitoring stable for 72+ hours.","Retrospective completed. Action items logged.","First milestone achieved ahead of schedule.","Blocked on external dependency — see ENG-442.","Scope changed after stakeholder feedback. Updated timeline.","Pair programming session resolved the deadlock.","Migration tested on staging with zero data loss.","Design tokens updated to match new OKLCH palette.","Load test: system handles 5k concurrent users.","Code freeze in effect until RC is approved.","Hotfix deployed. Rca in progress.","Feature flag toggled on for 10% of users."];
const ATITLES=["Weekly release notes","Deploy window notice","All-hands summary","New hire announcement","Policy update","Holiday schedule","Office closure","Tooling migration","Security advisory","Product launch recap","Quarterly review","Customer win","Conference recap","Engineering blog post","Incident postmortem","Team offsite planning","Benefits enrollment","Training session invite","Hackathon announcement","Demo day invite","Promotion announcement","Org chart update","Budget kickoff","OKR review session","Culture survey","Town hall recording","Lunch and learn","Mentorship programme","Wellness week","Code of conduct refresh"];
const ABODIES=["<p>This week we shipped <strong>7 features</strong> and closed <strong>14 bugs</strong>. Highlights:</p><ul><li>Realtime presence now shows typing indicators</li><li>Analytics dashboard added goal completion chart</li><li>Audit timeline supports date range filtering</li></ul>","<p>The next <strong>scheduled maintenance window</strong> is Saturday 02:00–04:00 UTC. Database upgrades and security patches will be applied.</p>","<p>Our <strong>Q3 all-hands</strong> covered product roadmap updates, engineering velocity metrics, and a preview of the new mobile experience.</p>","<p>Welcome <strong>three new team members</strong> joining this month across Engineering, Design, and Product. Say hello in <em>#introductions</em>!</p>","<p>Effective Monday, we are updating the <strong>remote work policy</strong> for more flexibility around core collaboration hours.</p>","<p>We crossed <strong>10,000 active workspaces</strong> on notFredoHub. This milestone belongs to every team that contributed.</p>","<p>The <strong>annual hackathon</strong> is November 8-10. Project submissions open now. Form teams in <em>#hackathon</em>.</p>"];
const COMMENTS=["Great update! Thanks for keeping everyone in the loop.","This is exciting. Can we get more timeline details?","I have concerns about security implications. Let us discuss.","Well done team! This is exactly the momentum we need.","Tested on Safari? I see a rendering issue on iOS.","The design looks clean. Minor spacing suggestion.","Excellent write-up. The action items are clear and actionable.","We should create a follow-up item for monitoring.","Love the new direction. Feedback is overwhelmingly positive.","Can infra team weigh in on the scaling concern?","Reviewed the PR and left a few comments. Looks solid.","This unblocks parallel work streams. Thanks for pushing.","Should we schedule a sync to align on the rollout?","Performance numbers are impressive. What profiling tool?","Minor UI glitch when switching dark/light mode.","Documentation is now live. Check the dev portal.","Great candidate for the next engineering blog post.","Can we get a demo in the next team meeting?","Tested end-to-end and everything passes. Ship it!","Add this to the onboarding guide for new team members."];
const AIVERBS=["Review","Update","Fix","Write","Design","Implement","Test","Deploy","Document","Audit","Optimise","Refactor","Integrate","Configure","Migrate","Investigate","Resolve","Prepare","Build","Set up","Clean up","Finalise","Draft","Coordinate"];
const AINOUNS=["the PR","integration tests","documentation","onboarding flow","error handling","database migration","monitoring dashboard","accessibility","performance benchmarks","email template","landing page","API endpoint","auth flow","dark mode support","analytics query","seed script","WebSocket handler","rate limiting","deployment pipeline","notification system","search index","caching layer","permission check","export feature"];
const PRIOR=["LOW","LOW","MEDIUM","MEDIUM","MEDIUM","HIGH","HIGH","CRITICAL"];
const ASTAT=["TODO","TODO","TODO","IN_PROGRESS","IN_PROGRESS","IN_PROGRESS","BLOCKED","DONE","DONE","DONE"];
const EMOJIS=["🔥","👏","✅","📌","🚀","💯","🎉","❤️","👍","👀","🙌","💡","🎯","⚡","✨","🔧","📊","🎨","👋","🏆"];

function p(arr){return arr[Math.floor(Math.random()*arr.length)]}
function pN(arr,n){const s=[...arr];for(let i=s.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[s[i],s[j]]=[s[j],s[i]]}return s.slice(0,n)}
function r(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function dAgo(d){const dt=new Date();dt.setDate(dt.getDate()-d);return dt}
function dNow(d){const dt=new Date();dt.setDate(dt.getDate()+d);return dt}

async function main(){
  // force reseed when RESEED=true
  if (process.env.RESEED === "true") {
    console.log("Force reseed: truncating all tables...");
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Notification","AuditEvent","AnnouncementAttachment","AnnouncementReaction","AnnouncementComment","Announcement","GoalUpdate","Milestone","Goal","ActionItem","Invitation","MembershipPermission","Membership","Workspace","Session","User" CASCADE');
    console.log("Truncated.\n");
  }

  console.log("Seeding massive notFredoHub demo data...\n");
  const hash=await bcrypt.hash(DEMO_PASS,10);

  const users=[];
  for(let i=0;i<25;i++){
    const first=FIRST[i%FIRST.length],last=LAST[i%LAST.length];
    const email=`${first.toLowerCase()}${i}@notfredohub.test`;
    const u=await prisma.user.upsert({where:{email},update:{displayName:`${first} ${last}`,passwordHash:hash},create:{email,displayName:`${first} ${last}`,passwordHash:hash}});
    users.push({id:u.id,email,displayName:u.displayName});
  }
  const demo=await prisma.user.upsert({where:{email:DEMO_EMAIL},update:{displayName:"Demo Admin",passwordHash:hash},create:{email:DEMO_EMAIL,displayName:"Demo Admin",passwordHash:hash}});
  console.log(`${users.length+1} users created.\n`);

  const wsDefs=[
    {name:"Engineering Hub",desc:"Core product engineering — backend, frontend, infrastructure, developer experience.",color:"#3b82f6"},
    {name:"Design Studio",desc:"Product design, UX research, brand identity, and design systems.",color:"#8b5cf6"},
    {name:"Product & Strategy",desc:"Roadmap planning, competitive analysis, feature prioritisation, and cross-team coordination.",color:"#f59e0b"},
    {name:"Developer Relations",desc:"Community, documentation, tutorials, open source, and developer advocacy.",color:"#10b981"},
    {name:"Operations & Platform",desc:"Infrastructure reliability, SRE, CI/CD, security, and internal tooling.",color:"#ef4444"},
    {name:"Growth & Marketing",desc:"Acquisition, engagement, content marketing, SEO, and lifecycle emails.",color:"#ec4899"},
    {name:"Customer Success",desc:"Onboarding, support ticketing, account management, and churn reduction.",color:"#06b6d4"},
  ];

  for(const wd of wsDefs){
    let ws=await prisma.workspace.findFirst({where:{name:wd.name}});
    if(ws){console.log(`  Skipping "${wd.name}" (exists).`);continue}
    const creator=p(users);
    ws=await prisma.workspace.create({data:{name:wd.name,description:wd.desc,accentColor:wd.color,createdById:creator.id,memberships:{create:pN(users,r(8,20)).map(u=>({userId:u.id,role:p(["ADMIN","ADMIN","MEMBER","MEMBER","MEMBER"])}))}},include:{memberships:{include:{user:true}}}});
    const mem=ws.memberships;
    console.log(`  Workspace "${ws.name}" — ${mem.length} members`);

    const gc=r(50,80);
    for(let i=0;i<gc;i++){
      const g=await prisma.goal.create({data:{workspaceId:ws.id,ownerMembershipId:p(mem).id,title:`${p(GVERBS)} ${p(GNOUNS)}`,description:`${p(GVERBS)} ${p(GNOUNS)} across all ${p(DEPTS)} surfaces. Includes design review, implementation, testing, documentation, and stakeholder sign-off.`,status:p(GSTATUS),dueDate:Math.random()>0.3?dNow(r(5,90)):dAgo(r(5,60))}});
      for(let j=0;j<r(2,6);j++)await prisma.milestone.create({data:{goalId:g.id,title:p(MILES),progressPercentage:r(0,100),sortOrder:j}});
      for(let j=0;j<r(0,5);j++)await prisma.goalUpdate.create({data:{goalId:g.id,authorMembershipId:p(mem).id,content:p(UPDATES),createdAt:dAgo(r(1,60))}});
    }
    console.log(`    ${gc} goals`);

    const ac=r(30,50);
    for(let i=0;i<ac;i++){
      const an=await prisma.announcement.create({data:{workspaceId:ws.id,authorMembershipId:p(mem.filter(m=>m.role==="ADMIN")).id,title:`${p(ATITLES)} (#${r(1,999)})`,content:p(ABODIES),pinned:Math.random()<0.12,createdAt:dAgo(r(1,90))}});
      for(const reactor of pN(mem,r(1,Math.min(mem.length,8))))await prisma.announcementReaction.create({data:{announcementId:an.id,membershipId:reactor.id,emoji:p(EMOJIS)}}).catch(()=>{});
      for(let j=0;j<r(0,6);j++)await prisma.announcementComment.create({data:{announcementId:an.id,authorMembershipId:p(mem).id,content:p(COMMENTS),createdAt:dAgo(r(1,80))}});
    }
    console.log(`    ${ac} announcements`);

    const ai=r(60,100);
    for(let i=0;i<ai;i++)await prisma.actionItem.create({data:{workspaceId:ws.id,assigneeMembershipId:p(mem).id,title:`${p(AIVERBS)} ${p(AINOUNS)} ${p(DEPTS)}`,status:p(ASTAT),priority:p(PRIOR),dueDate:Math.random()>0.35?dNow(r(1,60)):dAgo(r(1,30))}});
    console.log(`    ${ai} action items`);

    await prisma.notification.createMany({data:pN(mem,Math.min(3,mem.length)).map(m=>({workspaceId:ws.id,userId:m.userId,type:p(["MENTION","INVITATION"]),title:p(["You were mentioned in a comment","New workspace invitation","Goal status updated","Announcement published","Action item assigned to you","Milestone completed"]),body:p(COMMENTS),createdAt:dAgo(r(1,10)),link:"/dashboard"}))});

    console.log("");
  }

  // standalone notifications for all users
  const allWs = await prisma.workspace.findMany();
  for(const u of users){
    for(let i=0;i<r(2,8);i++){
      await prisma.notification.create({data:{userId:u.id,workspaceId:p(allWs).id,type:p(["MENTION","INVITATION"]),title:p(["You were mentioned in a comment","New workspace invitation","Goal status updated","Announcement published","Action item assigned to you","Milestone completed"]),body:p(COMMENTS),createdAt:dAgo(r(1,14)),link:"/dashboard"}});
    }
  }
  console.log("Notifications created.\nSeed complete.\n");
  await prisma.$disconnect();
}
main().catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
