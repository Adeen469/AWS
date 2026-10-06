create table if not exists public.trips (
    id text primary key,
    traveler_id text not null,
    coordinator_id text,
    title varchar(200) not null,
    destination_summary varchar(500) not null default '',
    start_date timestamptz not null,
    end_date timestamptz not null,
    status varchar(32) not null default 'PLANNING',
    currency varchar(3) not null default 'USD',
    budget_amount numeric(12, 2),
    version integer not null default 1 check (version > 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (end_date > start_date),
    check (currency ~ '^[A-Z]{3}$')
);

create table if not exists public.trip_preferences (
    trip_id text primary key references public.trips(id) on delete cascade,
    pace varchar(40),
    budget_tier varchar(40),
    accommodation_type varchar(80),
    transportation_style varchar(80),
    interests jsonb not null default '[]'::jsonb,
    travel_style varchar(80),
    notes text not null default '',
    party_size integer not null default 1 check (party_size between 1 and 30)
);

create table if not exists public.itinerary_items (
    id text primary key,
    trip_id text not null references public.trips(id) on delete cascade,
    item_type varchar(32) not null,
    title varchar(200) not null,
    start_time timestamptz not null,
    end_time timestamptz not null,
    timezone varchar(64) not null default 'UTC',
    location_text varchar(300) not null default '',
    latitude double precision,
    longitude double precision,
    estimated_cost numeric(12, 2) not null default 0 check (estimated_cost >= 0),
    currency varchar(3) not null default 'USD',
    booked_status varchar(32) not null default 'PLANNED',
    status varchar(32) not null default 'ACTIVE',
    flexibility varchar(24) not null default 'FLEXIBLE',
    required_buffer_minutes integer not null default 0 check (required_buffer_minutes >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (end_time > start_time),
    check (currency ~ '^[A-Z]{3}$')
);

create table if not exists public.itinerary_dependencies (
    id text primary key,
    trip_id text not null references public.trips(id) on delete cascade,
    upstream_item_id text not null references public.itinerary_items(id) on delete cascade,
    downstream_item_id text not null references public.itinerary_items(id) on delete cascade,
    dependency_type varchar(32) not null default 'SEQUENTIAL',
    min_required_buffer_minutes integer not null default 0 check (min_required_buffer_minutes >= 0),
    unique (upstream_item_id, downstream_item_id),
    check (upstream_item_id <> downstream_item_id)
);

create table if not exists public.bookings (
    id text primary key,
    trip_id text not null references public.trips(id) on delete cascade,
    itinerary_item_id text not null references public.itinerary_items(id) on delete cascade,
    status varchar(32) not null default 'PENDING',
    confirmed_price numeric(12, 2) not null check (confirmed_price >= 0),
    currency varchar(3) not null,
    refund_amount numeric(12, 2) not null default 0 check (refund_amount >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.disruptions (
    id text primary key,
    trip_id text not null references public.trips(id) on delete cascade,
    affected_item_id text not null references public.itinerary_items(id) on delete cascade,
    disruption_type varchar(40) not null,
    severity varchar(24) not null,
    details text not null default '',
    delay_minutes integer not null default 0 check (delay_minutes >= 0),
    occurred_at timestamptz not null default now(),
    status varchar(24) not null default 'OPEN'
);

create table if not exists public.recovery_options (
    id text primary key,
    trip_id text not null references public.trips(id) on delete cascade,
    disruption_id text not null references public.disruptions(id) on delete cascade,
    title varchar(200) not null,
    description text not null,
    additional_cost numeric(12, 2) not null default 0,
    score numeric(5, 2) not null default 0,
    status varchar(24) not null default 'FEASIBLE',
    action_type varchar(32) not null,
    action_item_id text not null,
    actions jsonb not null default '[]'::jsonb,
    new_start_time timestamptz,
    trip_version integer not null,
    created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
    id text primary key,
    actor_user_id text not null,
    trip_id text,
    entity_type varchar(64) not null,
    entity_id text not null,
    event_type varchar(64) not null,
    payload text not null default '{}',
    created_at timestamptz not null default now()
);

create table if not exists public.notifications (
    id text primary key,
    trip_id text not null references public.trips(id) on delete cascade,
    recipient_user_id text not null,
    event_type varchar(64) not null,
    message varchar(500) not null,
    read_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists ix_trips_traveler_id on public.trips(traveler_id);
create index if not exists ix_trips_coordinator_id on public.trips(coordinator_id);
create index if not exists ix_itinerary_items_trip_start on public.itinerary_items(trip_id, start_time);
create index if not exists ix_bookings_trip_id on public.bookings(trip_id);
create index if not exists ix_disruptions_trip_id on public.disruptions(trip_id);
create index if not exists ix_recovery_options_trip_id on public.recovery_options(trip_id);
create index if not exists ix_audit_events_trip_created on public.audit_events(trip_id, created_at);
create index if not exists ix_notifications_recipient_created
    on public.notifications(recipient_user_id, created_at);

alter table public.trips enable row level security;
alter table public.trip_preferences enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.itinerary_dependencies enable row level security;
alter table public.bookings enable row level security;
alter table public.disruptions enable row level security;
alter table public.recovery_options enable row level security;
alter table public.audit_events enable row level security;
alter table public.notifications enable row level security;

create policy trips_read_authorized on public.trips
    for select to authenticated
    using (
        traveler_id = auth.uid()::text
        or coordinator_id = auth.uid()::text
        or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );
create policy trips_insert_owner on public.trips
    for insert to authenticated
    with check (traveler_id = auth.uid()::text);
create policy trips_update_owner_or_operator on public.trips
    for update to authenticated
    using (
        traveler_id = auth.uid()::text
        or coordinator_id = auth.uid()::text
        or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
    with check (
        traveler_id = auth.uid()::text
        or coordinator_id = auth.uid()::text
        or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

create policy preferences_trip_access on public.trip_preferences
    for all to authenticated
    using (exists (
        select 1 from public.trips t where t.id = trip_id
        and (t.traveler_id = auth.uid()::text or t.coordinator_id = auth.uid()::text
             or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    ))
    with check (exists (
        select 1 from public.trips t where t.id = trip_id
        and (t.traveler_id = auth.uid()::text or t.coordinator_id = auth.uid()::text
             or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    ));

create policy itinerary_trip_access on public.itinerary_items
    for all to authenticated
    using (exists (
        select 1 from public.trips t where t.id = trip_id
        and (t.traveler_id = auth.uid()::text or t.coordinator_id = auth.uid()::text
             or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    ))
    with check (exists (
        select 1 from public.trips t where t.id = trip_id
        and (t.traveler_id = auth.uid()::text or t.coordinator_id = auth.uid()::text
             or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    ));

create policy dependencies_trip_access on public.itinerary_dependencies
    for all to authenticated
    using (exists (
        select 1 from public.trips t where t.id = trip_id
        and (t.traveler_id = auth.uid()::text or t.coordinator_id = auth.uid()::text
             or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    ))
    with check (exists (
        select 1 from public.trips t where t.id = trip_id
        and (t.traveler_id = auth.uid()::text or t.coordinator_id = auth.uid()::text
             or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    ));

create policy bookings_trip_access on public.bookings
    for all to authenticated
    using (exists (
        select 1 from public.trips t where t.id = trip_id
        and (t.traveler_id = auth.uid()::text or t.coordinator_id = auth.uid()::text
             or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    ))
    with check (exists (
        select 1 from public.trips t where t.id = trip_id
        and (t.traveler_id = auth.uid()::text or t.coordinator_id = auth.uid()::text
             or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    ));

create policy disruptions_trip_access on public.disruptions
    for all to authenticated
    using (exists (
        select 1 from public.trips t where t.id = trip_id
        and (t.traveler_id = auth.uid()::text or t.coordinator_id = auth.uid()::text
             or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    ))
    with check (exists (
        select 1 from public.trips t where t.id = trip_id
        and (t.traveler_id = auth.uid()::text or t.coordinator_id = auth.uid()::text
             or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    ));

create policy recovery_trip_access on public.recovery_options
    for all to authenticated
    using (exists (
        select 1 from public.trips t where t.id = trip_id
        and (t.traveler_id = auth.uid()::text or t.coordinator_id = auth.uid()::text
             or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    ))
    with check (exists (
        select 1 from public.trips t where t.id = trip_id
        and (t.traveler_id = auth.uid()::text or t.coordinator_id = auth.uid()::text
             or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    ));

create policy audit_trip_read on public.audit_events
    for select to authenticated
    using (
        actor_user_id = auth.uid()::text
        or exists (
            select 1 from public.trips t where t.id = audit_events.trip_id
            and (t.traveler_id = auth.uid()::text or t.coordinator_id = auth.uid()::text
                 or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
        )
    );
create policy audit_actor_insert on public.audit_events
    for insert to authenticated
    with check (actor_user_id = auth.uid()::text);

create policy notifications_recipient_access on public.notifications
    for all to authenticated
    using (recipient_user_id = auth.uid()::text)
    with check (recipient_user_id = auth.uid()::text);
