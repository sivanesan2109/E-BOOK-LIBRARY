
-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  category text NOT NULL,
  url text NOT NULL,
  img_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_books table
CREATE TABLE IF NOT EXISTS user_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  book_id uuid REFERENCES books NOT NULL,
  read boolean DEFAULT false,
  highlights jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

-- Create policies for books table
CREATE POLICY "Anyone can read books"
  ON books
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_books table
CREATE POLICY "Users can read their own book data"
  ON user_books
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own book data"
  ON user_books
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own book data"
  ON user_books
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert books
INSERT INTO books (title, author, category, url, img_url)
VALUES 
  ('The Ring', 'Bradley', 'Action & Adventure', '/action/the-ring-pearce-obooko.pdf', '/action/the-ring-pearce-obooko.png'),
  ('The last of the mohicans', ' James Fenimore Cooper', 'Action & Adventure', '/action/the-last-of-the-mohicans-obooko.pdf', '/action/the-last-of-the-mohicans-obooko.png'),
  ('The Invisible Drone', 'Mike Dixon', 'Action & Adventure', '/action/The-Invisible-Drone-obooko.pdf', '/action/The-Invisible-Drone-obooko.png'),
 ('House of refuge', ' Michael A. DiBaggio', 'Action & Adventure', '/action/house-of-refuge-obooko.pdf','/action/house-of-refuge-obooko.png'),
  ('Journey to centre of the earth', 'Jules Verne', 'Action & Adventure', '/action/journey-to-centre-of-the-earth-obooko.pdf', '/action/journey-to-centre-of-the-earth-obooko.png'),
  ('Smart business plan', 'Master Steve', 'Business management & Finance', '/business/smart-business-plan-obooko.pdf', '/business/smart-business-plan-obooko.png'),
  ('Shares That Grow', 'Kevin Arthur OBrien', 'Business management & Finance', '/business/shares-that-grow-obooko.pdf', '/business/shares-that-grow-obooko.png'),
  ('Motivatecreate McGuinness', 'Sandra Renshaw', 'Business management & Finance', '/business/motivatecreate-McGuinness.pdf','/business/motivatecreate-McGuinness.png'),
  ('Creativetime McGuinness', 'Mark McGuinness', 'Business management & Finance', '/business/creativetime-McGuinness.pdf','/business/creativetime-McGuinness.png'),
  ('Blockchain and crypto currency', 'Makoto Yano', 'Business management & Finance', '/business/blockchain-and-crypto-currency-obooko.pdf','/business/blockchain-and-crypto-currency-obooko.png'),
  ('Traveller Wedding', 'Graham jones', 'Classic Fiction', '/fiction/TRAVELLER_WEDDING-obooko-gen0037.pdf','/fiction/TRAVELLER_WEDDING-obooko-gen0037.png'),
  ('Three wishes', ' Bradley Pearce', 'Classic Fiction', '/fiction/three-wishes-obooko.pdf','/fiction/three-wishes-obooko.png'),
  ('Shepherd Creed', 'Paul Hawkins', 'Classic Fiction', '/fiction/Shepherd-Creed-obooko-gen0185.pdf','/fiction/Shepherd-Creed-obooko-gen0185.png'),
  ('Please', 'Peter Darbyshire', 'Classic Fiction', '/fiction/please-obooko.pdf','/fiction/please-obooko.png'),
  ('Man in the moon', 'Bradley Pearce', 'Classic Fiction', '/fiction/man-in-the-moon-obooko.pdf','/fiction/man-in-the-moon-obooko.png'),
  ('The man who was thursday', 'G. K. Chesterton', 'Crime thriller & Mystery', '/crime/the-man-who-was-thursday-obooko.pdf','/crime/the-man-who-was-thursday-obooko.png'),
  ('Suicide Trail', 'J Bennington', 'Crime thriller & Mystery', '/crime/suicide-trail-obooko.pdf','/crime/suicide-trail-obooko.png'),
  ('Officer down byrnes', 'Peter C Byrnes', 'Crime thriller & Mystery', '/crime/officer-down-byrnes-obooko.pdf','/crime/officer-down-byrnes-obooko.png'),
  ('Murder and pasta hank johnson', 'Hank Johnson', 'Crime thriller & Mystery', '/crime/murder-and-pasta-hank-johnson-obooko.pdf','/crime/murder-and-pasta-hank-johnson-obooko.png'),
  ('Drown', 'Kassan jahmal kassim', 'Crime thriller & Mystery', '/crime/drown-obooko.pdf','/crime/drown-obooko.png'),
  ('Shadows fall tempestria 3', 'Gary Stringer', 'Fantasy Fiction', '/fantasy/shadows-fall-tempestria-3-obooko.pdf','/fantasy/shadows-fall-tempestria-3-obooko.png'),
  ('Marina', 'Ann Sepino', 'Fantasy Fiction', '/fantasy/marina-obooko.pdf','/fantasy/marina-obooko.png'),
  ('Gathering storm tempestria 2', 'Gary Stringer', 'Fantasy Fiction', '/fantasy/gathering-storm-tempestria-2-obooko.pdf','/fantasy/gathering-storm-tempestria-2-obooko.png'),
  ('Darkburn', 'Tayin Machrie', 'Fantasy Fiction', '/fantasy/darkburn-book-3-the-gates-of-kelvha-obooko.pdf','/fantasy/darkburn-book-3-the-gates-of-kelvha-obooko.png'),
  ('The jade bear', 'J. Bennington', 'Fantasy Fiction', '/fantasy/the-jade-bear-obooko.pdf','/fantasy/the-jade-bear-obooko.png'),
  ('Kukulkan', 'Nicholas May', 'Horror & Supernatural', '/horror/Kukulkan-obooko-hor0073.pdf','/horror/Kukulkan-obooko-hor0073.png'),
  ('Bottled nightmares vol-1', 'David Dwan', 'Horror & Supernatural', '/horror/bottled-nightmares-vol-1-dwan-obooko.pdf','/horror/bottled-nightmares-vol-1-dwan-obooko.png'),
  ('Blood That Bonds', 'Christopher Buecheler', 'Horror & Supernatural', '/horror/BloodThatBonds-obooko-hor0010.pdf','/horror/BloodThatBonds-obooko-hor0010.png'),
  ('Birgit fights back', 'J Bennington', 'Horror & Supernatural', '/horror/birgit-fights-back-obooko.pdf','/horror/birgit-fights-back-obooko.png'),
  ('Author of pain minor mayhem', 'David Dwan', 'Horror & Supernatural', '/horror/author-of-pain-minor-mayhem-obooko.pdf','/horror/author-of-pain-minor-mayhem-obooko.png'),
  ('The twin peanuts', 'Kevin Rogers', 'Poetry & Poems', '/poems/the-twin-peanuts-obooko.pdf','/poems/the-twin-peanuts-obooko.png'),
  ('Peace light', 'ODE CLEMENT IGONI', 'Poetry & Poems', '/poems/peace-light-ode-clement-igoni-obooko.pdf','/poems/peace-light-ode-clement-igoni-obooko.png'),
  ('Love sonnets', 'ODE CLEMENT IGONI', 'Poetry & Poems', '/poems/love-sonnets-obooko.pdf','/poems/love-sonnets-obooko.png'),
  ('Diary of lamentations', 'Justice Korobe', 'Poetry & Poems', '/poems/diary-of-lamentations-obooko.pdf','/poems/diary-of-lamentations-obooko.png'),
  ('Boris the singing elephant', 'Kevin & Keith Rogers', 'Poetry & Poems', '/poems/boris-the-singing-elephant-faith-poems-songs-obooko.pdf','/poems/boris-the-singing-elephant-faith-poems-songs-obooko.png'),
  ('Sleeping prince', 'Stephanie Van Orman', 'Science Fiction', '/science/sleeping-prince-van-orman-obooko.pdf','/science/sleeping-prince-van-orman-obooko.png'),
  ('Alienese', 'Oliver Davis Pike', 'Science Fiction', '/science/alienese-obooko.pdf','/science/alienese-obooko.png');
  
  