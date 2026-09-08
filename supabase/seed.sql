-- Sample portfolio data for local development.

insert into projects (id, category, name, client, status, description) values
  ('11111111-0000-0000-0000-000000000001','social','Diwali Reels Series','Zomato','live','Six-part vertical reel series for the festive push.'),
  ('11111111-0000-0000-0000-000000000002','social','Recipe Shorts','Swiggy Instamart','draft','Weekly recipe shorts for Instagram.'),
  ('11111111-0000-0000-0000-000000000003','campaigns','Monsoon Launch','boAt','live','Full campaign film plus cutdowns.'),
  ('11111111-0000-0000-0000-000000000004','campaigns','Summer Sale Push','Myntra','live','Performance campaign across YouTube and Meta.'),
  ('11111111-0000-0000-0000-000000000005','corporate','Annual Report Film','Infosys','live','Corporate film for the FY26 annual report.'),
  ('11111111-0000-0000-0000-000000000006','corporate','Founder Story','Zerodha','draft','Long-form founder interview film.'),
  ('11111111-0000-0000-0000-000000000007','events','TEDxHyderabad 2026','TEDx','live','Full event coverage and speaker reels.'),
  ('11111111-0000-0000-0000-000000000008','events','Product Launch Night','OnePlus','live','Launch event film and same-day edit.'),
  ('11111111-0000-0000-0000-000000000009','bts','Monsoon Shoot BTS','boAt','live','Behind the scenes from the three-day shoot.'),
  ('11111111-0000-0000-0000-00000000000a','bts','Studio Day BTS','Internal','draft','A day in the a-tom studio.');

insert into project_links (project_id, type, label, url, sort_order) values
  -- Diwali Reels: multiple videos + multiple portfolio links
  ('11111111-0000-0000-0000-000000000001','video','Reel 1 — Final cut','https://youtube.com/watch?v=demo-diwali-1',0),
  ('11111111-0000-0000-0000-000000000001','video','Reel 2 — Final cut','https://youtube.com/watch?v=demo-diwali-2',1),
  ('11111111-0000-0000-0000-000000000001','video','Reel 3 — Final cut','https://youtube.com/watch?v=demo-diwali-3',2),
  ('11111111-0000-0000-0000-000000000001','portfolio','Behance case study','https://behance.net/atom/zomato-diwali',0),
  ('11111111-0000-0000-0000-000000000001','portfolio','Site work page','https://a-tom.studio/work/zomato-diwali',1),

  ('11111111-0000-0000-0000-000000000002','video','Recipe short — pilot','https://youtube.com/watch?v=demo-recipe-1',0),

  ('11111111-0000-0000-0000-000000000003','video','Hero film (60s)','https://vimeo.com/demo-boat-hero',0),
  ('11111111-0000-0000-0000-000000000003','video','Cutdown (15s)','https://vimeo.com/demo-boat-15',1),
  ('11111111-0000-0000-0000-000000000003','video','Cutdown (6s bumper)','https://vimeo.com/demo-boat-6',2),
  ('11111111-0000-0000-0000-000000000003','portfolio','Campaign deck','https://drive.google.com/atom/boat-monsoon',0),

  ('11111111-0000-0000-0000-000000000004','video','Main film','https://vimeo.com/demo-myntra',0),
  ('11111111-0000-0000-0000-000000000004','portfolio','Results one-pager','https://a-tom.studio/work/myntra-summer',0),

  ('11111111-0000-0000-0000-000000000005','video','Annual report film','https://vimeo.com/demo-infosys',0),
  ('11111111-0000-0000-0000-000000000005','portfolio','Portfolio page','https://a-tom.studio/work/infosys',0),

  ('11111111-0000-0000-0000-000000000007','video','Event highlights','https://youtube.com/watch?v=demo-tedx',0),
  ('11111111-0000-0000-0000-000000000007','video','Speaker reel — Session 1','https://youtube.com/watch?v=demo-tedx-s1',1),
  ('11111111-0000-0000-0000-000000000007','portfolio','Event gallery','https://a-tom.studio/work/tedx-2026',0),

  ('11111111-0000-0000-0000-000000000008','video','Launch film','https://youtube.com/watch?v=demo-oneplus',0),

  ('11111111-0000-0000-0000-000000000009','video','BTS cut','https://youtube.com/watch?v=demo-bts-boat',0),
  ('11111111-0000-0000-0000-000000000009','portfolio','Photo set','https://a-tom.studio/bts/boat',0),

  ('11111111-0000-0000-0000-00000000000a','video','Studio day BTS','https://youtube.com/watch?v=demo-bts-studio',0);

insert into activity_log (project_id, action_type, description) values
  ('11111111-0000-0000-0000-000000000001','project_created','Diwali Reels Series added to Social'),
  ('11111111-0000-0000-0000-000000000003','link_added','3 video links added to Monsoon Launch'),
  ('11111111-0000-0000-0000-000000000007','status_changed','TEDxHyderabad 2026 marked live');
