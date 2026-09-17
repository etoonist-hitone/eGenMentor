-- Subjects Table
create table subjects (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  invite_code text unique default substr(md5(random()::text), 1, 6),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table subjects enable row level security;

create policy "Teachers can manage their own subjects."
  on subjects for all
  using ( auth.uid() = teacher_id );

create policy "Anyone can view subjects (for enrollments)."
  on subjects for select
  using ( true );


-- Topics Table
create table topics (
  id uuid default gen_random_uuid() primary key,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  title text not null,
  description text,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table topics enable row level security;

create policy "Teachers can manage topics of their subjects."
  on topics for all
  using ( 
    auth.uid() in (
      select teacher_id from subjects where id = subject_id
    )
  );

create policy "Enrolled students can view topics."
  on topics for select
  using (
    auth.uid() in (
      select student_id from enrollments where subject_id = topics.subject_id
    )
  );


-- Enrollments Table
create table enrollments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, subject_id)
);

alter table enrollments enable row level security;

create policy "Students can view and manage their own enrollments."
  on enrollments for all
  using ( auth.uid() = student_id );

create policy "Teachers can view enrollments for their subjects."
  on enrollments for select
  using (
    auth.uid() in (
      select teacher_id from subjects where id = subject_id
    )
  );
