-- Topic Progress Table
create table topic_progress (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  topic_id uuid references public.topics(id) on delete cascade not null,
  completed boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, topic_id)
);

alter table topic_progress enable row level security;

create policy "Students can view and manage their own progress."
  on topic_progress for all
  using ( auth.uid() = student_id );

create policy "Teachers can view progress of students enrolled in their subjects."
  on topic_progress for select
  using (
    auth.uid() in (
      select teacher_id from subjects 
      inner join topics on topics.subject_id = subjects.id
      where topics.id = topic_progress.topic_id
    )
  );
