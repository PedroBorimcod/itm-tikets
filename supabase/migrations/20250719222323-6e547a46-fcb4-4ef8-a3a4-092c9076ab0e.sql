-- Create reviews table for event reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent multiple reviews per user per event
ALTER TABLE public.reviews ADD CONSTRAINT unique_user_event_review UNIQUE (event_id, user_id);

-- Create coupons table for discount codes
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_purchase_amount NUMERIC DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create event interests table for users to mark events as interesting
CREATE TABLE public.event_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate interests
ALTER TABLE public.event_interests ADD CONSTRAINT unique_user_event_interest UNIQUE (event_id, user_id);

-- Create event_analytics table for tracking analytics
CREATE TABLE public.event_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('view', 'interest', 'purchase', 'share')),
  metric_value INTEGER DEFAULT 1,
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Coupons policies  
CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (active = true AND valid_until > now());

CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (auth.email() = 'pepedr13@gmail.com');

-- Event interests policies
CREATE POLICY "Anyone can view event interests count" ON public.event_interests
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own interests" ON public.event_interests
  FOR ALL USING (auth.uid() = user_id);

-- Event analytics policies
CREATE POLICY "Anyone can insert analytics" ON public.event_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all analytics" ON public.event_analytics
  FOR SELECT USING (auth.email() = 'pepedr13@gmail.com');

-- Create indexes for better performance
CREATE INDEX idx_reviews_event_id ON public.reviews(event_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active_valid ON public.coupons(active, valid_until);
CREATE INDEX idx_event_interests_event_id ON public.event_interests(event_id);
CREATE INDEX idx_event_analytics_event_id ON public.event_analytics(event_id);
CREATE INDEX idx_event_analytics_metric_type ON public.event_analytics(metric_type);

-- Create triggers for updated_at columns
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();