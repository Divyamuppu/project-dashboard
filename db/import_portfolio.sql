-- a-tom portfolio import — generated from Updated_Portfolio_.xlsx
--
-- Safe to re-run. Each row is keyed on external_ref ('xlsx:<tab>:<row>'),
-- so a second run updates the same project instead of adding a duplicate.
--
-- 123 projects, 126 links.

begin;

-- Sheet1 row 4: Karya
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Karya', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:4')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/12sGnPFEY768wLOsztB1gTpcQp4GwlX_G?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 5: Abhibus
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Abhibus', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:5')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1lSPiq5_A0c4EUUVRLTjKHs86ESXtfys_?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 6: Heritage
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Heritage', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:6')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1MOjzSuiIo4YvIfB0HPiCSldPKeZ6mZ7A?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 7: Gravity Zip
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Gravity Zip', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:7')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1P5XlElqdlihE-71UNnQpWcwHGsCjsBIO?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 8: Human and the Beast
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Human and the Beast', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:8')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/file/d/1oebQInqS4SDbQH4txd4W-1sBUvIKSu71/view', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 9: GoPaisa
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'GoPaisa', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:9')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1-_Z4GNH5TLT69zfWcp1khnjQejU3osbv?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 10: Sattva Lakeridge
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Sattva Lakeridge', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:10')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1pNecG4u4PHq08U8aMPkD1ZB8UhuK_OZL?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 11: Bambinos
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Bambinos', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:11')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1nWeP0V70V-BfU8rySvok5XCYDljutbnN', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 12: Medanta Banno Ki Rasm
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Medanta Banno Ki Rasm', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:12')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/file/d/1uGle9aix-OmIn2J4RF5XVa79Ug9CM_bX/view?usp=drivesdk', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 13: Medanta Ppa aur GPT
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Medanta Ppa aur GPT', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:13')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1MRWZG5MBL_xJ4oEbbnK8bWUwFPb0kl_F', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 14: Paytm Nazarbattu
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Paytm Nazarbattu', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:14')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1FsZjCaq-zUaRabkhmuVDYkPCzjaUXRmP?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 15: WattPower
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'WattPower', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:15')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1cEoO_3RZfxi_exUl48Z967QZr1mURTPs?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 16: Select
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Select', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:16')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1qsVMxGuSwzF4_OC7cXSDSfp2apWRmONz?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 17: Papa aur GPT
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Papa aur GPT', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:17')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1MRWZG5MBL_xJ4oEbbnK8bWUwFPb0kl_F', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 18: Jumpp
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Jumpp', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:18')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1Z6UT1ZlXnY70NUxdnNguulSKqFLUNre_?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 20: Overspeeding
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Overspeeding', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:20')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube', 'https://www.youtube.com/watch?v=D43OvfOXuUA&list=PLlQsAjEjbxOTXGs45FJJYN0GUSLysIm7w&index=1', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 21: Wrongside
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Wrongside', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:21')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube', 'https://www.youtube.com/watch?v=Jn2buhN_q9A&list=PLlQsAjEjbxOTXGs45FJJYN0GUSLysIm7w&index=2', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 22: Helmet
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Helmet', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:22')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube', 'https://www.youtube.com/watch?v=K-bZU9Kae5M&list=PLlQsAjEjbxOTXGs45FJJYN0GUSLysIm7w&index=3', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 23: Zomato - Grooming
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato - Grooming', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:23')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1oyhV7JNzlMv_zGRXvYmKb-5HXOgrG-Sk?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 24: Zomato Care
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato Care', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:24')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1m6Nh37ihrfkkJTvRlBb8e5Sdkvvx1J98?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 25: Zomato Diwali
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato Diwali', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:25')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/12ZMOPcTEm54vAvAN0HRiqwRVixfeBQpQ?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 26: Zomato DPL
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato DPL', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:26')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1bJEyv3drhdoP-e2YRQ2wsi5e9yUl2BQO?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 27: Zomato EV
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato EV', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:27')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1qIiyjBpqFDIlfvtFf-nnLQt6-UsfAiGr?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 28: Zomato Feeding India
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato Feeding India', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:28')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1odu5xdNWIyu9GM8llR09ExBkJnc9bHD-?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 29: Zomato Festive
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato Festive', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:29')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1uSaksXi8Y_Y2A87nWbZCjgpv4PEB3Zv_?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 30: Zomato Imaandar
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato Imaandar', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:30')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/10sfHZ58wbO1KYXj4yZGYBBgpQVk2w_cB?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 31: Zomato ITR
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato ITR', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:31')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1i3GRLdA8KRXtGBaOiAjV-Or6kA84NlCY?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 32: Zomato MV
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato MV', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:32')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1vVDqdKB_ypBRYLb11zi3A-7IYByNg2CT?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 33: Zomato ORS
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato ORS', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:33')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1H_HgNSvD4TQa0Ol6sdnXz-khBLCYqz9j?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 34: Zomato Rain
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato Rain', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:34')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1ZcHzeBwGvJecVLNaTakjSr8S69DfMlJv?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 35: Zomato Road Safety
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato Road Safety', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:35')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube playlist', 'https://www.youtube.com/playlist?list=PLlQsAjEjbxOTXGs45FJJYN0GUSLysIm7w', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 36: Zomato Safety
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato Safety', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:36')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1C7fNpIvShxCSEp1iaqK3ka-alPgMhW8Z?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 37: Women in Fleet
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Women in Fleet', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:37')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1kbat1IYrEelD2T__5Q_FI1IYoaHctk3f?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 38: Women in WareHouse
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Women in WareHouse', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:38')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1LKyitsPEufQmpvrOSDijyFh1r37LQziD?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 39: Zomato Safety 2.0
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato Safety 2.0', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:39')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1gm4lbdo1bCEJX9HOj0LSZVgP7Yp_jKLN?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 40: Zomato SOS
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato SOS', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:40')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/13cE-zkLJyTqAW5RD10rUrK0zrd6TAM1n?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 41: Zomato ASR
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato ASR', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:41')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1XNuD0GOfNikxAVdffV1X9g1YL3q5Yv78?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 42: Zomato Insurance
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Zomato Insurance', 'Zomato', 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:42')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/18aU0BaC1sY_XyO29WfNmk7aEBa1b55X2?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 44: Amazon Prime - Gandi Bimari
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Amazon Prime - Gandi Bimari', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:44')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube', 'https://www.youtube.com/watch?v=7GqPgBIznQQ', 0),
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1UyNcyuZaSVRq75UeH16urGXvpc3_86sg?usp=drive_link', 1)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 47: Hala Mobility
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Hala Mobility', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:47')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
select id from p;

-- Sheet1 row 48: Garuda X CSK
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Garuda X CSK', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:48')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1XQR2aXHmYl50FGWDqLMWSaVYjpM3IevV?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 49: Nikon Z8
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Nikon Z8', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:49')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube', 'https://www.youtube.com/watch?v=zg2RQo-pCmM', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 50: Nikon Zf
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Nikon Zf', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:50')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube', 'https://www.youtube.com/watch?v=DkT3lRfchoI', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 51: Mc Dowells
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Mc Dowells', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:51')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1Q8rfBSg0nHds7oO_kGVn9Tn7BpKmdkaO?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 52: Asuka
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Asuka', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:52')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/18HkuOPmsIScfvb1jFXeZHUm-9bG2pQy4?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 53: Blinkit ITR
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Blinkit ITR', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:53')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1aWW5ZALy6XTZBdPv3mSrRsBQi9QCtgA6?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 54: Lemon Chillii
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Lemon Chillii', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:54')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/12ifPB8UREpWSRhTfdtz9zT-VavhB2dHy?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 55: FinOne
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'FinOne', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:55')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1xfSHLTLljM5dw_hXsa2-ZrMPIKrcE5iA?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 57: Blue Carpet Night
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'Blue Carpet Night', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:57')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube', 'https://www.youtube.com/watch?v=eoaP5zfHjC4', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 58: Straive
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'Straive', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:58')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1UEryrj7-zSbyX_Iea2u-8YK8bZZg5qWj?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 59: T-Bridge
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'T-Bridge', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:59')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/file/d/1D47yzNfNAHUvoCkTO83II0qJcf0VR9ug/view?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 60: T-Innovation
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'T-Innovation', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:60')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1Y7YLPBydqKbpHyP-lrK352kXItaVm-O9?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 61: US Ambassador Visit
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'US Ambassador Visit', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:61')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1aF0Vmb_79TJ5F5710UAYkjizZObaV9kI?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 62: Media Mint
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'Media Mint', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:62')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1_0_ddQcq71e_csCbDEVcE70hB3zxY6GO', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 63: Microsoft
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'Microsoft', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:63')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube', 'https://www.youtube.com/watch?v=0AZ2hzPERso', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 64: IP Verse
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'IP Verse', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:64')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/file/d/1ah6XGfJhEJFj0aIZcid_lEV0DP5H-vuo/view?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 65: Bud-e
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'Bud-e', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:65')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/file/d/1Ht3DdAEyNay9D0pn6kwFI-pDMbveUMOp/view?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 66: AIC Corporate Video
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'AIC Corporate Video', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:66')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1C0g9C1K2HxGS3JWHhP5ZJu0xydcYMcGq?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 67: Founder talks
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'Founder talks', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:67')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1-2oT6UxctnJ4xflpGc4uHa86cLovUzRV', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 68: T-Hub CI Film
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'T-Hub CI Film', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:68')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1SnDYFq7eHAWWvTyDZBy92KMtSlyLLrFP?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 69: Zen Technologies
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'Zen Technologies', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:69')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/file/d/1Ksy2D0inZMOx816OZ5uNMPO-SZv6Mmco/view?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 70: Nxtwave
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'Nxtwave', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:70')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1FSq_f06YHF5k8hiCeawYpCoFdQIAhs-o?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 71: IIMR
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'IIMR', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:71')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1wOF6-92FfQsjQs1midB15DrbnHu9yARq?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 72: Apollo AI Assist
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('corporate'::project_category, 'Apollo AI Assist', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:72')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1xL_r7Dnq5wB2JDGNA0rH8wJPJq-8B9VG?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 74: ITC Aashirvaad
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'ITC Aashirvaad', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:74')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/11Yg4iWqMoVcavxWmz47jG7eMK84Q_TjE?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 75: Booster Water
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Booster Water', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:75')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube', 'https://www.youtube.com/watch?v=Ak16ObY62YE', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 76: Banter
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Banter', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:76')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1A0NHOWNH6ISLkDu0ASfTmYnlRLPmUTPd?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 77: Licious
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Licious', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:77')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube', 'https://www.youtube.com/watch?v=zEVwHnKaO64', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 78: Heritage ghee
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Heritage ghee', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:78')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/15eNuNWKqPh5VVI1vr96bQbNnIQqHlKro?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 80: Dhaaga
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Dhaaga', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:80')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/file/d/1tX34MQ-47opErlmAOwfeKNEJi1W-hr_V/view?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 81: Mirratti
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Mirratti', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:81')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube', 'https://www.youtube.com/shorts/Wd_fZleLNBQ', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 82: PMJ Jewels
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'PMJ Jewels', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:82')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/12WiA-M6lZv6av3jefbk9poxWzO6peWeO?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 83: Spykar
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Spykar', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:83')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1xAmh_iUaPAd3iwRoF6_BmBevj6pu1qJR?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 84: BC Jewellery
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'BC Jewellery', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:84')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube', 'https://www.youtube.com/watch?v=uln3fC5gVjA', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 86: Halfabawa
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Halfabawa', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:86')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/19HrcHed5jvdIc51QAB23qpAY1qWEGi3L?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 88: Mana Yatri
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Mana Yatri', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:88')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1wdOsRgk6xGI9IZu1Kfx4S-qaBg8WUPZo?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 89: Human and the Beast
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Human and the Beast', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:89')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/10XUDSEzMpMU71UqhZBdd6Wb8yCay4NvN?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 90: Hala Mobility
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Hala Mobility', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:90')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/10-nByeNXG-NKEVwvNJJPS53B9Jyludix', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 91: ITC Sunrise
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'ITC Sunrise', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:91')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1Y8TMY0kzWMEEWGBKw5-CkMNRO1VEfQqO?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 92: Dabbahwala
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Dabbahwala', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:92')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1IB27oX31dMJTFJvJfOwOXkhRqNp3FyXj', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 93: Sonic Lamb
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Sonic Lamb', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:93')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1ONOujmkQZzCZgT_NVvYUhgDQtV9jenc0?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 94: Paytm
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Paytm', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:94')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1M87_u3uIzeDDixV25dtbOzi5onOc1H_s?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 96: T-Innovation
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('events'::project_category, 'T-Innovation', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:96')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/file/d/10o9KatshCNlIkPDtxK1Sv-3iDhh_CjKn/view?usp=sharing', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 97: Blue Carpet Night
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('events'::project_category, 'Blue Carpet Night', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:97')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube', 'https://www.youtube.com/watch?v=eoaP5zfHjC4', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 98: Sattva - Hyderabad Literary Fest
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('events'::project_category, 'Sattva - Hyderabad Literary Fest', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:98')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube', 'https://www.youtube.com/watch?v=nTl3cjZl1wI', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 99: Zomato Feeding India
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('events'::project_category, 'Zomato Feeding India', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:99')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1odu5xdNWIyu9GM8llR09ExBkJnc9bHD-?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 100: EV Bazaar
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('events'::project_category, 'EV Bazaar', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:100')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/file/d/1g7arVl7w3Llyqm6ypopGVD0ACl7HAYPL/view?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 101: Zomato Pride
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('events'::project_category, 'Zomato Pride', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:101')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
select id from p;

-- Sheet1 row 102: T-Works Maker Faire
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('events'::project_category, 'T-Works Maker Faire', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:102')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1JCam63qhsP6yLmuic33cp2FHZK9SO26G?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 103: Zomato Sustainability
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('events'::project_category, 'Zomato Sustainability', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:103')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1inv4IxC9MNR_yvLQttzEfbIpCR-ch5Cz?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 104: Zomato Halloween
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('events'::project_category, 'Zomato Halloween', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:104')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/110S8vx8EU-BA4lYsr0vs9Lz6lubQ3PLQ?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 105: Zomato Packathon
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('events'::project_category, 'Zomato Packathon', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:105')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/file/d/1RK19M1uVk8Ju0N36gNCbqa_lFHQTHIsB/view?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet1 row 106: Zomato EV Bazaar New
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('events'::project_category, 'Zomato EV Bazaar New', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet1:106')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1OBGAbqrLylw9Jy4AkCD5gPIels9vtYJ_?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 4: Karya
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('bts'::project_category, 'Karya', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:4')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/drive/u/0/folders/1dMtGxOLPunAVP-UMTcI3AfoMVX4JU7zT', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 5: Abhibus Day 1
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('bts'::project_category, 'Abhibus Day 1', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:5')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/drive/u/0/folders/1sn4n9pe5DH5MoQP5ujw9GhzFeki_wjdI', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 6: Abhibus Day 2
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('bts'::project_category, 'Abhibus Day 2', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:6')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/drive/u/0/folders/1sn4n9pe5DH5MoQP5ujw9GhzFeki_wjdI', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 7: Heritage - Alpenvie Vibes
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('bts'::project_category, 'Heritage - Alpenvie Vibes', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:7')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/drive/u/0/folders/1HkMxdG4EIPNKWEDju_HrgqPI0l1tCYGT', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 8: Heritage Ghee
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('bts'::project_category, 'Heritage Ghee', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:8')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1HkMxdG4EIPNKWEDju_HrgqPI0l1tCYGT', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 9: Human and The beast
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('bts'::project_category, 'Human and The beast', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:9')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1QEmfuPXMOh34AjsDuT8mwX5CvIdCZou8', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 10: GoPaisa
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('bts'::project_category, 'GoPaisa', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:10')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/drive/u/0/folders/1e9DVGpXDlQdKEeg053vb_vSlivakjG_I', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 11: Zomato Diwali
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('bts'::project_category, 'Zomato Diwali', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:11')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/drive/u/0/folders/1i8bStpqu-IgA-4TCGQugeTIP-mhdO5fs', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 12: Amazon Prime - Gandi Bimari
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('bts'::project_category, 'Amazon Prime - Gandi Bimari', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:12')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/drive/u/0/folders/1D5awUBoyvyWRBhXlcRA5NpFAWwS_6NrF', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 13: Aashirvaad Documentary
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('bts'::project_category, 'Aashirvaad Documentary', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:13')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/drive/u/0/folders/1gOIjN9EHsGgm5fGFaDV_TcpiIvp4MknM', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 14: Hala Mobility
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('bts'::project_category, 'Hala Mobility', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:14')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/drive/u/0/folders/1GOO-rjZJJXoh7fCGc_aj-_k1btn6dvO3', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 15: PMJ BTS
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('bts'::project_category, 'PMJ BTS', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:15')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1sD1e19rk7vTlCySRsUUmx-l-tI65ppjt', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 19: LIT Schools
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'LIT Schools', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:19')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1GI1MZvYvJkFNO4Cb5ZtrHSVTnpjQ_l72', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 20: Khelnet Podcast
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Khelnet Podcast', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:20')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1b2F3G9Quz1ukIiJ9WpDz7lz-sYGxw-wa', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 21: Zomato Compilation
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Zomato Compilation', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:21')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1KaITh1jDK8H1RxQO7cOOje6NFWLKC0F2?usp=drive_link', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 22: Aashirvaad BTS
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Aashirvaad BTS', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:22')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1gOIjN9EHsGgm5fGFaDV_TcpiIvp4MknM', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 23: MadAdWoman Marketing
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'MadAdWoman Marketing', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:23')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1Ap437v5l8VwWLiteoVrHIvTlebQ-992V', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 24: PMJ BTS
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'PMJ BTS', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:24')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1sD1e19rk7vTlCySRsUUmx-l-tI65ppjt', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 25: Apoorvs Reels
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Apoorvs Reels', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:25')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1svTF932qk3rnwfjssLoCbDCMrha9q7p1', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 26: Srestha's Reels
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Srestha''s Reels', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:26')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1GHtmt9m8JonoBpRQXu3qiOA1Ljg2L_V6', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 27: Social Media reels
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Social Media reels', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:27')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/drive/u/0/folders/1PmAcj1qmaiVNCRnpdL3mF-9xbka2rGIC', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 28: Edited Team Photos
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Edited Team Photos', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:28')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
select id from p;

-- Sheet3 row 29: Cultural Reels
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Cultural Reels', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:29')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1dcNTjjC38wb-45zvcTIFVFY-BGYZHHn0', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 30: Pritam Reels
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Pritam Reels', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:30')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1jYARFXOX18wDVqPlYTHRIOrPbK1QhmxB', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet3 row 31: Akhil Reels
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('social'::project_category, 'Akhil Reels', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet3:31')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive folder', 'https://drive.google.com/drive/folders/1xOLC7r7nh-FGxacFOUVutgTSeCK9NPXf', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet2 row 2: shaadi.co,m
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'shaadi.co,m', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet2:2')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/file/d/1rjQme1oUoTzmWyDjP96g1nlBd-fGfPbx/view?usp=drive_link', 0),
  ('video', 'Drive file', 'https://drive.google.com/file/d/1JLX-7FTP81gixNtouvkWS66ePJsLgIYX/view?usp=drive_link', 1),
  ('video', 'Drive file', 'https://drive.google.com/file/d/1b--MYr0zH7t2PEgYZPAudYw0MSLMRpkV/view?usp=sharing', 2)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet2 row 7: Bambinos
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Bambinos', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet2:7')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'YouTube playlist', 'https://www.youtube.com/playlist?list=PLlQsAjEjbxOTSBvK6CEfJw42A8O1Vc_U4', 0)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet2 row 10: Dista
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Dista', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet2:10')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/file/d/1c8bqaWYun7T6hiE_S7JOc0550K7x2Ydi/view?usp=drive_link', 0),
  ('video', 'Drive file', 'https://drive.google.com/file/d/1Vkl0nqFcU53f56oXZDvK9SZtIe5v_-4f/view?usp=drive_link', 1)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet2 row 15: 24 Organic Mantra
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, '24 Organic Mantra', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet2:15')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Drive file', 'https://drive.google.com/file/d/1SGjWvLTtPH5p926rmDCNx-9VGSZgTGaX/view?usp=drive_link', 0),
  ('video', 'Drive file', 'https://drive.google.com/file/d/1iDnnCDSBW0Z2hG4m1wGDn7PDS6NHtuoo/view?usp=drive_link', 1)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

-- Sheet2 row 19: Dabbahwala
with p as (
  insert into projects (category, name, client, status, project_date, source, external_ref)
  values ('campaigns'::project_category, 'Dabbahwala', null, 'live'::project_status, null, 'import'::row_source, 'xlsx:Sheet2:19')
  on conflict (external_ref) where external_ref is not null do update set
    category = excluded.category, name = excluded.name,
    client = excluded.client, project_date = excluded.project_date,
    updated_at = now()
  returning id
)
insert into project_links (project_id, type, label, url, sort_order, source)
select p.id, v.type::link_type, v.label, v.url, v.ord, 'import'::row_source
from p, (values
  ('video', 'Instagram', 'https://www.instagram.com/p/DIXEJFczzFG/', 0),
  ('video', 'Instagram', 'https://www.instagram.com/p/DJA1ESAthBF/', 1)
) as v(type, label, url, ord)
where not exists (
  select 1 from project_links l where l.project_id = p.id and l.url = v.url
);

commit;
