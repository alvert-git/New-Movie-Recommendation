-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 21, 2026 at 02:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `movie_recommend`
--

-- --------------------------------------------------------

--
-- Table structure for table `movies`
--

CREATE TABLE `movies` (
  `id` int(11) NOT NULL,
  `movie_id` bigint(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `tagline` text DEFAULT NULL,
  `overview` text DEFAULT NULL,
  `runtime` int(11) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `budget` bigint(20) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 9.99,
  `poster_url` text DEFAULT NULL,
  `backdrop_url` text DEFAULT NULL,
  `video_url` text DEFAULT NULL,
  `genres` text DEFAULT NULL,
  `cast` text DEFAULT NULL,
  `crew` text DEFAULT NULL,
  `tags` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `movies`
--

INSERT INTO `movies` (`id`, `movie_id`, `title`, `tagline`, `overview`, `runtime`, `release_date`, `budget`, `price`, `poster_url`, `backdrop_url`, `video_url`, `genres`, `cast`, `crew`, `tags`) VALUES
(1, 211672, 'Minions', 'Before Gru, they had a history of bad bosses', 'Minions Stuart, Kevin and Bob are recruited by Scarlet Overkill, a super-villain who, alongside her inventor husband Herb, hatches a plot to take over the world.', 91, '2015-06-17', 74000000, 9.99, '/uploads/posters/211672.jpg', '/uploads/backdrops/211672.jpg', 'https://www.youtube.com/watch?v=lCgtmgiII7M', 'Family, Animation, Adventure, Comedy', 'Sandra Bullock, Jon Hamm, Michael Keaton', 'Kyle Balda', 'minion stuart, kevin and bob are recruit by scarlet overkill, a super-villain who, alongsid her inventor husband herb, hatch a plot to take over the world. famili anim adventur comedi assist aftercreditssting duringcreditssting evilmastermind minion 3d sandrabullock jonhamm michaelkeaton kylebalda'),
(2, 157336, 'Interstellar', 'Mankind was born on Earth. It was never meant to die here.', 'Interstellar chronicles the adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.', 169, '2014-11-05', 165000000, 9.99, '/uploads/posters/157336.jpg', '/uploads/backdrops/157336.jpg', 'https://www.youtube.com/watch?v=lCgtmgiII7M', 'Adventure, Drama, Science Fiction', 'Matthew McConaughey, Jessica Chastain, Anne Hathaway', 'Christopher Nolan', 'interstellar chronicl the adventur of a group of explor who make use of a newli discov wormhol to surpass the limit on human space travel and conquer the vast distanc involv in an interstellar voyage. adventur drama sciencefict savingtheworld artificialintellig fathersonrelationship singlepar nasa expedit wormhol spacetravel famin blackhol dystopia raceagainsttim quantummechan spaceship space rescu familyrelationship farmhous robot astronaut scientist fatherdaughterrelationship singlefath farmer spacest imax astrophys zerograv courag timeparadox rel matthewmcconaughey jessicachastain annehathaway christophernolan'),
(3, 293660, 'Deadpool', 'Witness the beginning of a happy ending', 'Deadpool tells the origin story of former Special Forces operative turned mercenary Wade Wilson, who after being subjected to a rogue experiment that leaves him with accelerated healing powers, adopts the alter ego Deadpool. Armed with his new abilities and a dark, twisted sense of humor, Deadpool hunts down the man who nearly destroyed his life.', 108, '2016-02-09', 58000000, 9.99, '/uploads/posters/293660.jpg', '/uploads/backdrops/293660.jpg', 'https://www.youtube.com/watch?v=lCgtmgiII7M', 'Action, Adventure, Comedy', 'Ryan Reynolds, Morena Baccarin, Ed Skrein', 'Tim Miller', 'deadpool tell the origin stori of former special forc oper turn mercenari wade wilson, who after be subject to a rogu experi that leav him with acceler heal powers, adopt the alter ego deadpool. arm with hi new abil and a dark, twist sens of humor, deadpool hunt down the man who nearli destroy hi life. action adventur comedi antihero mercenari marvelcom superhero basedoncomicbook breakingthefourthwal aftercreditssting duringcreditssting selfheal ryanreynold morenabaccarin edskrein timmil'),
(4, 118340, 'Guardians of the Galaxy', 'All heroes start somewhere.', 'Light years from Earth, 26 years after being abducted, Peter Quill finds himself the prime target of a manhunt after discovering an orb wanted by Ronan the Accuser.', 121, '2014-07-30', 170000000, 9.99, '/uploads/posters/118340.jpg', '/uploads/backdrops/118340.jpg', 'https://www.youtube.com/watch?v=lCgtmgiII7M', 'Action, Science Fiction, Adventure', 'Chris Pratt, Zoe Saldana, Dave Bautista', 'James Gunn', 'light year from earth, 26 year after be abducted, peter quill find himself the prime target of a manhunt after discov an orb want by ronan the accuser. action sciencefict adventur marvelcom spaceship space outerspac orphan adventur aftercreditssting duringcreditssting marvelcinematicunivers chrispratt zoesaldana davebautista jamesgunn'),
(995, 1493, 'Miss Congeniality', 'Never Mess With An Agent In A Dress.', 'When the local FBI office receives a letter from a terrorist known only as \'The Citizen\', it\'s quickly determined that he\'s planning his next act at the Miss America beauty pageant. Because tough-as-nails Gracie Hart is the only female Agent at the office, she\'s chosen to go undercover as the contestant from New Jersey.', 111, '2000-12-14', 45000000, 9.99, '/uploads/posters/1493.jpg', '/uploads/backdrops/1493.jpg', 'https://www.youtube.com/watch?v=lCgtmgiII7M', 'Comedy, Crime, Action', 'Sandra Bullock, Benjamin Bratt, Michael Caine', 'Donald Petrie', 'when the local fbi offic receiv a letter from a terrorist known onli as \'the citizen\', it\' quickli determin that he\' plan hi next act at the miss america beauti pageant. becaus tough-as-nail graci hart is the onli femal agent at the office, she\' chosen to go undercov as the contest from new jersey. comedi crime action undercoverag beautycontest terror sandrabullock benjaminbratt michaelcain donaldpetri'),
(996, 8643, 'The Exorcism of Emily Rose', 'What happened to Emily?', 'When a younger girl called Emily Rose (Carpenter) dies, everyone puts blame on the exorcism which was performed on her by Father Moore (Wilkinson) prior to her death. The priest is arrested on suspicion of murder. The trail begins with lawyer Erin Bruner (Linney) representing Moore, but it is not going to be easy, as no one wants to believe what Father Moore says is true.', 122, '2005-09-09', 19000000, 9.99, '/uploads/posters/8643.jpg', '/uploads/backdrops/8643.jpg', 'https://www.youtube.com/watch?v=lCgtmgiII7M', 'Crime, Drama, Horror, Thriller', 'Laura Linney, Tom Wilkinson, Campbell Scott', 'Scott Derrickson', 'when a younger girl call emili rose (carpenter) dies, everyon put blame on the exorc which wa perform on her by father moor (wilkinson) prior to her death. the priest is arrest on suspicion of murder. the trail begin with lawyer erin bruner (linney) repres moore, but it is not go to be easy, as no one want to believ what father moor say is true. crime drama horror thriller epilepsi possess teenagegirl spirit umbrella cross prosecutor catholic negligenthomicid archdioces agnost malnutrit burn psychoticepilepticdisord lauralinney tomwilkinson campbellscott scottderrickson'),
(997, 9362, 'Tremors', 'The monster movie that breaks new ground.', 'Hick handymen Val McKee and Earl Bassett can barely eke out a living in the Nevada hamlet of Perfection, so they decide to leave town -- despite an admonition from a shapely seismology coed who\'s picking up odd readings on her equipment. Before long, Val and Earl discover what\'s responsible for those readings: 30-foot-long carnivorous worms with a proclivity for sucking their prey underground.', 96, '1990-01-19', 11000000, 9.99, '/uploads/posters/9362.jpg', '/uploads/backdrops/9362.jpg', 'https://www.youtube.com/watch?v=lCgtmgiII7M', 'Action, Horror', 'Kevin Bacon, Fred Ward, Finn Carter', 'Ron Underwood', 'hick handymen val mckee and earl bassett can bare eke out a live in the nevada hamlet of perfection, so they decid to leav town -- despit an admonit from a shape seismolog co who\' pick up odd read on her equipment. befor long, val and earl discov what\' respons for those readings: 30-foot-long carnivor worm with a procliv for suck their prey underground. action horror nevada smalltown tractor strand cultfavorit tentacl rural graboid seismologist binocular maneatenbymonst giantworm kevinbacon fredward finncart ronunderwood'),
(998, 4257, 'Scary Movie 4', 'Bury the grudge. Burn the village.  See the saw.', 'Cindy finds out the house she lives in is haunted by a little boy and goes on a quest to find out who killed him and why. Also, Alien \"Tr-iPods\" are invading the world and she has to uncover the secret in order to stop them.', 83, '2006-04-13', 45000000, 9.99, '/uploads/posters/4257.jpg', '/uploads/backdrops/4257.jpg', 'https://www.youtube.com/watch?v=lCgtmgiII7M', 'Comedy', 'Anna Faris, Regina Hall, Craig Bierko', 'David Zucker', 'cindi find out the hous she live in is haunt by a littl boy and goe on a quest to find out who kill him and why. also, alien \"tr-ipods\" are invad the world and she ha to uncov the secret in order to stop them. comedi hauntedhous alienlife-form riesen-ipod annafari reginahal craigbierko davidzuck'),
(999, 557831846, 'Eklo II', 'The last man uncovers the undead truth, redefining survival in Nepal\'s first sci-fi zombie epic.', 'In 2090, the last human survivor lives in Nepal\'s mountains. When two astronauts return to Earth, they meet this sole survivor and unravel the mystery of zombies roaming the land, after humanity fled a virus outbreak in 2030.', 169, '2026-03-17', 350000, 10.00, '/uploads/posters/1774681511173-EKLO I.jpg', '/uploads/backdrops/1774681511206-EKLO I.jpg', NULL, 'Sci-Fi', 'Jamie Bacon,Olly Bassi,Pradeep Khadka', 'Pradeep Shahi', 'in 2090 the last human survivor lives in nepals mountains when two astronauts return to earth they meet this sole survivor and unravel the mystery of zombies roaming the land after humanity fled a virus outbreak in 2030 scifi jamie baconolly bassipradeep khadka pradeep shahi');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `movie_id` bigint(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('esewa','khalti') NOT NULL,
  `status` enum('PENDING','COMPLETED','FAILED') NOT NULL DEFAULT 'PENDING',
  `transaction_uuid` varchar(255) DEFAULT NULL,
  `khalti_pidx` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `user_id`, `movie_id`, `amount`, `payment_method`, `status`, `transaction_uuid`, `khalti_pidx`, `created_at`) VALUES
(21, 1, 211672, 9.99, 'esewa', 'PENDING', '211672-1772419816353', NULL, '2026-03-02 02:50:16'),
(22, 1, 211672, 9.99, 'esewa', 'COMPLETED', '211672-1772419898891', NULL, '2026-03-02 02:51:38'),
(31, 4, 293660, 9.99, 'esewa', 'COMPLETED', '293660-1776693676426', NULL, '2026-04-20 14:01:16');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `movie_id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `review_text` text DEFAULT NULL,
  `sentiment` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `movie_id`, `user_id`, `rating`, `review_text`, `sentiment`, `created_at`) VALUES
(5, 211672, 1, 5, 'nice movie', NULL, '2026-02-18 13:41:05'),
(7, 157336, 1, 4, 'asdasdas', NULL, '2026-02-18 15:54:06'),
(18, 1930, 4, 4, 'great movie loved it', 'pos', '2026-04-20 14:13:43');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `auth_provider` enum('local','google') NOT NULL DEFAULT 'local',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `profile_pic` text DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `google_id`, `auth_provider`, `created_at`, `profile_pic`, `role`) VALUES
(1, 'albert@gmail.com', '$2b$10$abt6NUwzA0mILjPHa2zlteB7706EYbeO52D3Ww5xYmLXN34JLaMjy', NULL, 'local', '2026-01-21 07:15:47', NULL, 'user'),
(3, 'admin@gmail.com', '$2b$10$gsdoPj/5cg8kPJzO23JKW.nXnQ/977Ma9P04S9KFnl9QsryPTtvb6', NULL, 'local', '2026-03-28 06:49:51', NULL, 'admin'),
(4, 'albertbelbase018@gmail.com', NULL, '115254832856476494596', 'google', '2026-04-20 13:51:14', 'https://lh3.googleusercontent.com/a/ACg8ocI4MBkrjHoji89ITY7dIVJcFZUnUlUW5sFELKvz3DpVyQHLAg=s96-c', 'user');

-- --------------------------------------------------------

--
-- Table structure for table `user_interactions`
--

CREATE TABLE `user_interactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `movie_id` bigint(20) NOT NULL,
  `interaction_type` enum('VIEW','CLICK','WATCHLIST','PURCHASE') NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_interactions`
--

INSERT INTO `user_interactions` (`id`, `user_id`, `movie_id`, `interaction_type`, `timestamp`) VALUES
(7, 4, 157336, 'VIEW', '2026-04-20 14:01:02'),
(8, 4, 157336, 'VIEW', '2026-04-20 14:01:02'),
(9, 4, 293660, 'VIEW', '2026-04-20 14:01:13'),
(10, 4, 293660, 'VIEW', '2026-04-20 14:01:13'),
(11, 4, 293660, 'VIEW', '2026-04-20 14:02:30'),
(12, 4, 293660, 'VIEW', '2026-04-20 14:02:30'),
(13, 4, 118340, 'VIEW', '2026-04-20 14:03:22'),
(14, 4, 118340, 'VIEW', '2026-04-20 14:03:22'),
(15, 4, 293660, 'VIEW', '2026-04-20 14:03:48'),
(16, 4, 293660, 'VIEW', '2026-04-20 14:03:48'),
(17, 4, 1930, 'VIEW', '2026-04-20 14:13:27'),
(18, 4, 1930, 'VIEW', '2026-04-20 14:13:27');

-- --------------------------------------------------------

--
-- Table structure for table `watchlist`
--

CREATE TABLE `watchlist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `movie_id` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `watchlist`
--

INSERT INTO `watchlist` (`id`, `user_id`, `movie_id`, `created_at`) VALUES
(5, 4, 118340, '2026-04-20 14:03:23');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `movies`
--
ALTER TABLE `movies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `movie_id` (`movie_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_uuid` (`transaction_uuid`),
  ADD UNIQUE KEY `khalti_pidx` (`khalti_pidx`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `movie_id` (`movie_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_movie` (`user_id`,`movie_id`),
  ADD KEY `movie_id` (`movie_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `google_id` (`google_id`);

--
-- Indexes for table `user_interactions`
--
ALTER TABLE `user_interactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `movie_id` (`movie_id`);

--
-- Indexes for table `watchlist`
--
ALTER TABLE `watchlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_movie_watchlist` (`user_id`,`movie_id`),
  ADD KEY `fk_watchlist_movie` (`movie_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `movies`
--
ALTER TABLE `movies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1000;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_interactions`
--
ALTER TABLE `user_interactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `watchlist`
--
ALTER TABLE `watchlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_interactions`
--
ALTER TABLE `user_interactions`
  ADD CONSTRAINT `user_interactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_interactions_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`) ON DELETE CASCADE;

--
-- Constraints for table `watchlist`
--
ALTER TABLE `watchlist`
  ADD CONSTRAINT `fk_watchlist_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_watchlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
