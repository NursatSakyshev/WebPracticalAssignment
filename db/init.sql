CREATE TABLE IF NOT EXISTS criminals (
  id                 SERIAL PRIMARY KEY,
  name               VARCHAR(120),
  nickname           VARCHAR(120)     NOT NULL,
  reward             INTEGER          NOT NULL CHECK (reward >= 0),
  last_latitude      DOUBLE PRECISION CHECK (last_latitude BETWEEN -90 AND 90),
  last_longitude     DOUBLE PRECISION CHECK (last_longitude BETWEEN -180 AND 180),
  last_location_note TEXT,
  difficulty         INTEGER          NOT NULL CHECK (difficulty BETWEEN 1 AND 10),
  armed              BOOLEAN          NOT NULL DEFAULT false,
  has_crew           BOOLEAN          NOT NULL DEFAULT false,
  escape_master      BOOLEAN          NOT NULL DEFAULT false,
  CHECK ((last_latitude IS NULL) = (last_longitude IS NULL))
);

CREATE TABLE IF NOT EXISTS hunt_logs (
  id          SERIAL PRIMARY KEY,
  criminal_id INTEGER     NOT NULL REFERENCES criminals (id) ON DELETE CASCADE,
  success     BOOLEAN     NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hunt_logs_criminal_id_idx ON hunt_logs (criminal_id);

INSERT INTO criminals
  (name, nickname, reward, last_latitude, last_longitude, last_location_note, difficulty, armed, has_crew, escape_master)
VALUES
  ('Viktor Kane',  'Red Viper',         15000, -4.59,  137.44, NULL,                                                      8,  true,  true,  false),
  (NULL,           'Ghost of Ganymede', 50000, NULL,   NULL,   'Last seen boarding a cargo freighter near Ganymede station', 10, true,  false, true),
  ('Mara Volkova', 'Silver Fox',         7500, 40.71,  -74.01, NULL,                                                      5,  false, true,  true),
  ('Jonas Reed',   'Rust Bucket',        3000, NULL,   NULL,   'Hides in the scrapyards of the asteroid belt',            3,  false, false, false),
  (NULL,           'The Collector',     25000, 18.65, -133.80, 'Moves between Mars orbital docks',                       9,  true,  true,  false),
  ('Lina Hart',    'Twin Comets',        9800, NULL,   NULL,   'Seen at a casino on Io',                                  6,  true,  true,  true);

INSERT INTO hunt_logs (criminal_id, success, notes, created_at) VALUES
  (1, false, 'Target escaped through an asteroid field.',                 now() - interval '30 days'),
  (1, false, 'Ambushed by his crew at the Mars docks.',                    now() - interval '21 days'),
  (2, false, 'Lost the signal after he jumped through a gate.',            now() - interval '19 days'),
  (2, false, 'Found an empty ship, he was gone again.',                    now() - interval '15 days'),
  (3, false, 'She talked her way out at the checkpoint.',                  now() - interval '14 days'),
  (3, true,  'Captured in a hotel in New York, handed to the police.',     now() - interval '12 days'),
  (4, true,  'Easy catch, found him sleeping in a scrapyard.',             now() - interval '10 days'),
  (5, false, 'Too many guards around the dock, retreated.',                now() - interval '8 days'),
  (5, false, 'Followed the wrong ship for two days.',                      now() - interval '6 days'),
  (6, false, 'Both twins split up, could only follow one.',                now() - interval '4 days'),
  (6, false, 'Lost them in the casino crowd.',                             now() - interval '2 days'),
  (1, true,  'Finally cornered him on Mars, bounty collected.',            now() - interval '1 day');
