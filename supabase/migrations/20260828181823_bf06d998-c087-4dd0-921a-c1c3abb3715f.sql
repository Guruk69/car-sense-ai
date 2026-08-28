
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- vehicles
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  registration_number TEXT,
  current_mileage INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles_own" ON public.vehicles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- damage_reports
CREATE TABLE public.damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  image_path TEXT,
  analysis_status TEXT NOT NULL DEFAULT 'completed',
  source TEXT NOT NULL DEFAULT 'mock',
  min_cost INTEGER,
  max_cost INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.damage_reports TO authenticated;
GRANT ALL ON public.damage_reports TO service_role;
ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_own" ON public.damage_reports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER reports_updated_at BEFORE UPDATE ON public.damage_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- damage_detections
CREATE TABLE public.damage_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.damage_reports(id) ON DELETE CASCADE,
  damage_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  affected_part TEXT NOT NULL,
  bbox_x NUMERIC NOT NULL,
  bbox_y NUMERIC NOT NULL,
  bbox_width NUMERIC NOT NULL,
  bbox_height NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.damage_detections TO authenticated;
GRANT ALL ON public.damage_detections TO service_role;
ALTER TABLE public.damage_detections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "detections_own" ON public.damage_detections FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.damage_reports r WHERE r.id = report_id AND r.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.damage_reports r WHERE r.id = report_id AND r.user_id = auth.uid()));

-- repair_costs
CREATE TABLE public.repair_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_part TEXT NOT NULL,
  damage_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  service_type TEXT NOT NULL,
  min_cost INTEGER NOT NULL,
  max_cost INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.repair_costs TO authenticated;
GRANT ALL ON public.repair_costs TO service_role;
ALTER TABLE public.repair_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "repair_costs_read" ON public.repair_costs FOR SELECT TO authenticated USING (true);

-- mechanics
CREATE TABLE public.mechanics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  rating NUMERIC,
  phone TEXT,
  services TEXT[] NOT NULL DEFAULT '{}',
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mechanics TO authenticated;
GRANT ALL ON public.mechanics TO service_role;
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mechanics_read" ON public.mechanics FOR SELECT TO authenticated USING (true);

-- parking_locations
CREATE TABLE public.parking_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  name TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parking_locations TO authenticated;
GRANT ALL ON public.parking_locations TO service_role;
ALTER TABLE public.parking_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parking_own" ON public.parking_locations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- service_reminders
CREATE TABLE public.service_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  due_date DATE,
  due_mileage INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_reminders TO authenticated;
GRANT ALL ON public.service_reminders TO service_role;
ALTER TABLE public.service_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reminders_own" ON public.service_reminders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER reminders_updated_at BEFORE UPDATE ON public.service_reminders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- vehicle_tips
CREATE TABLE public.vehicle_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicle_tips TO authenticated;
GRANT ALL ON public.vehicle_tips TO service_role;
ALTER TABLE public.vehicle_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tips_read" ON public.vehicle_tips FOR SELECT TO authenticated USING (true);

-- repair_guides
CREATE TABLE public.repair_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  damage_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.repair_guides TO authenticated;
GRANT ALL ON public.repair_guides TO service_role;
ALTER TABLE public.repair_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guides_read" ON public.repair_guides FOR SELECT TO authenticated USING (true);

-- emergency_events
CREATE TABLE public.emergency_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.emergency_events TO authenticated;
GRANT ALL ON public.emergency_events TO service_role;
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sos_own" ON public.emergency_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- reference data
INSERT INTO public.repair_costs (vehicle_part, damage_type, severity, service_type, min_cost, max_cost) VALUES
('front_door','dent','minor','showroom',4500,7000),('front_door','dent','minor','local_mechanic',2000,3500),
('front_door','dent','moderate','showroom',10000,16000),('front_door','dent','moderate','local_mechanic',5000,9000),
('front_door','dent','severe','showroom',22000,34000),('front_door','dent','severe','local_mechanic',12000,18000),
('front_door','scratch','minor','showroom',3000,5000),('front_door','scratch','minor','local_mechanic',1200,2200),
('front_door','scratch','moderate','showroom',6500,9500),('front_door','scratch','moderate','local_mechanic',3000,5000),
('front_door','scratch','severe','showroom',12000,18000),('front_door','scratch','severe','local_mechanic',6000,9500),
('rear_bumper','scratch','minor','showroom',3200,5200),('rear_bumper','scratch','minor','local_mechanic',1500,2600),
('rear_bumper','scratch','moderate','showroom',7000,11000),('rear_bumper','scratch','moderate','local_mechanic',3500,6000),
('rear_bumper','scratch','severe','showroom',13000,19000),('rear_bumper','scratch','severe','local_mechanic',7000,11000),
('rear_bumper','dent','moderate','showroom',9000,14000),('rear_bumper','dent','moderate','local_mechanic',4500,8000),
('rear_bumper','crack','moderate','showroom',11000,17000),('rear_bumper','crack','moderate','local_mechanic',5500,9000),
('rear_bumper','broken_part','severe','showroom',24000,38000),('rear_bumper','broken_part','severe','local_mechanic',13000,20000),
('front_bumper','scratch','minor','showroom',3500,5500),('front_bumper','scratch','minor','local_mechanic',1600,2800),
('front_bumper','dent','moderate','showroom',9500,15000),('front_bumper','dent','moderate','local_mechanic',4800,8500),
('front_bumper','crack','severe','showroom',18000,27000),('front_bumper','crack','severe','local_mechanic',9000,14000),
('front_bumper','broken_part','severe','showroom',26000,40000),('front_bumper','broken_part','severe','local_mechanic',14000,22000),
('bonnet','dent','moderate','showroom',11000,17000),('bonnet','dent','moderate','local_mechanic',5500,9500),
('bonnet','scratch','minor','showroom',3800,6000),('bonnet','scratch','minor','local_mechanic',1800,3000),
('headlight','crack','moderate','showroom',8000,13000),('headlight','crack','moderate','local_mechanic',4000,7000),
('headlight','broken_part','severe','showroom',15000,26000),('headlight','broken_part','severe','local_mechanic',8000,14000),
('tail_light','broken_part','severe','showroom',9000,15000),('tail_light','broken_part','severe','local_mechanic',5000,8500),
('windshield','crack','minor','showroom',3500,6000),('windshield','crack','minor','local_mechanic',1800,3200),
('windshield','crack','severe','showroom',16000,26000),('windshield','crack','severe','local_mechanic',9000,15000),
('side_mirror','broken_part','moderate','showroom',6000,10000),('side_mirror','broken_part','moderate','local_mechanic',2800,5000),
('fender','dent','moderate','showroom',8500,13500),('fender','dent','moderate','local_mechanic',4200,7500),
('rear_door','dent','moderate','showroom',10000,15500),('rear_door','dent','moderate','local_mechanic',5000,8800),
('rear_door','scratch','minor','showroom',3000,5000),('rear_door','scratch','minor','local_mechanic',1300,2400);

INSERT INTO public.mechanics (name, address, latitude, longitude, rating, phone, services, is_open) VALUES
('Sharma Auto Works','12 Nehru Road, Andheri East, Mumbai 400069',19.1136,72.8697,4.6,'+919820123456','{body_repair,dent_repair,paint,general_service}',true),
('Balaji Motor Garage','Plot 8, MIDC Road, Pune 411019',18.6298,73.7997,4.3,'+919822334455','{dent_repair,general_service,emergency}',true),
('Khanna Car Care','24 Lajpat Nagar Market, New Delhi 110024',28.5677,77.2432,4.7,'+919811223344','{body_repair,paint,general_service}',false),
('SriRam Denting & Painting','56 100 Feet Road, Indiranagar, Bengaluru 560038',12.9719,77.6412,4.4,'+919845567788','{dent_repair,paint,body_repair}',true),
('Iqbal Auto Point','9 Charminar Road, Hyderabad 500002',17.3616,78.4747,4.1,'+919000112233','{general_service,emergency,dent_repair}',true),
('Deshmukh Body Shop','Sector 21, Vashi, Navi Mumbai 400703',19.0771,72.9986,4.5,'+919833445566','{body_repair,paint}',true),
('Chennai Wheel Clinic','18 Anna Salai, Chennai 600002',13.0604,80.2496,4.2,'+919840099887','{general_service,dent_repair,emergency}',false),
('Gill Motors Workshop','Ferozepur Road, Ludhiana 141001',30.8843,75.8460,4.0,'+919876543210','{body_repair,general_service}',true);

INSERT INTO public.vehicle_tips (title, content, category) VALUES
('Check tyre pressure before long trips','Under-inflated tyres wear unevenly and increase braking distance. Check pressure when tyres are cold, including the spare.','tyres'),
('Do not ignore dashboard warning lights','A steady warning light usually means "get it checked soon"; a blinking or red light means stop safely and inspect.','safety'),
('Inspect brakes if braking feels unusual','Squealing, a spongy pedal or a longer stop needs professional inspection before your next long drive.','brakes'),
('Wash off bird droppings and tree sap quickly','Left on paint for days they etch the clear coat and turn a wash-off mark into a paint job.','exterior'),
('Top up coolant only when the engine is cold','Opening a hot radiator cap is dangerous. Wait until the engine has cooled fully.','engine'),
('Photograph new damage the day it happens','Dated photos of dents and scratches make insurance and workshop conversations much easier.','maintenance');

INSERT INTO public.repair_guides (damage_type, severity, title, content, video_url) VALUES
('scratch','minor','Surface scratch — usually cosmetic','Wash the area and dry it. If your fingernail does not catch in the scratch, it is likely in the clear coat and a light polish or touch-up pen is enough. Avoid abrasive household cleaners.',NULL),
('scratch','moderate','Scratch through the paint','The scratch reaches primer or metal, so it can rust. Keep the area clean and dry and get a panel touch-up or spot painting done within a few weeks.',NULL),
('scratch','severe','Deep scratch across panels','Multiple panels or bare metal are exposed. Professional inspection and repainting are recommended.',NULL),
('dent','minor','Small dent without paint damage','If the paint is intact, paintless dent removal at a workshop is usually quick and inexpensive. Do not push the dent out from behind yourself — it can crease the panel.',NULL),
('dent','moderate','Dent with stretched paint','The panel needs pulling and refinishing. Check that doors, bonnet or boot still open and close cleanly.',NULL),
('dent','severe','Large or structural dent','Professional inspection recommended. Deep dents near pillars, wheel arches or the chassis can affect crash safety.',NULL),
('crack','minor','Small crack or chip','Have chips in glass sealed early — heat and vibration spread them. On plastic panels a small crack can be bonded.',NULL),
('crack','moderate','Spreading crack','Avoid pressure washing the area and get it repaired before it spreads further.',NULL),
('crack','severe','Crack affecting visibility or structure','Professional inspection recommended. Cracks in the driver''s line of sight usually require full glass replacement.',NULL),
('broken_part','minor','Loose or partially detached part','Secure the part so it cannot fall off in traffic and get it refitted.',NULL),
('broken_part','moderate','Broken component','The part likely needs replacement rather than repair. Ask your workshop for OEM versus aftermarket pricing.',NULL),
('broken_part','severe','Broken lighting or safety part','Professional inspection recommended. Driving with broken lights or a detached bumper is unsafe and can attract a fine.',NULL);
