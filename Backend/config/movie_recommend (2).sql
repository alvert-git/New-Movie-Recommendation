-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 28, 2026 at 07:30 AM
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
(20, 2, 211672, 9.99, 'esewa', 'COMPLETED', '211672-1772274220493', NULL, '2026-02-28 10:23:40'),
(21, 1, 211672, 9.99, 'esewa', 'PENDING', '211672-1772419816353', NULL, '2026-03-02 02:50:16'),
(22, 1, 211672, 9.99, 'esewa', 'COMPLETED', '211672-1772419898891', NULL, '2026-03-02 02:51:38'),
(23, 2, 157336, 9.99, 'esewa', 'COMPLETED', '157336-1772716273443', NULL, '2026-03-05 13:11:13'),
(24, 2, 209112, 9.99, 'khalti', 'COMPLETED', NULL, 'aNBkmFgYsZzRJhwW9AChiU', '2026-03-05 13:35:08'),
(25, 2, 118340, 9.99, 'esewa', 'PENDING', '118340-1772717934067', NULL, '2026-03-05 13:38:54'),
(26, 2, 118340, 9.99, 'khalti', 'PENDING', NULL, 'KXzJbdxex9G5BE3B3RJmB8', '2026-03-05 13:46:06'),
(27, 2, 118340, 9.99, 'khalti', 'COMPLETED', NULL, 'NamZwmVnGCLCkFAUGjDzgV', '2026-03-05 13:46:24'),
(28, 2, 76341, 9.99, 'esewa', 'COMPLETED', '76341-1772718416320', NULL, '2026-03-05 13:46:56'),
(29, 2, 293660, 9.99, 'esewa', 'PENDING', '293660-1774678832603', NULL, '2026-03-28 06:20:32'),
(30, 2, 293660, 9.99, 'esewa', 'PENDING', '293660-1774678841336', NULL, '2026-03-28 06:20:41');

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
(12, 293660, 2, 4, 'Nice movie i loved it', 'neutral', '2026-03-05 16:09:11'),
(14, 211672, 2, 4, 'this movie was fantastic loved it', 'pos', '2026-03-05 16:16:58'),
(15, 76341, 2, 4, 'loved the movie was nice', 'pos', '2026-03-05 16:25:08');

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
  `profile_pic` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `google_id`, `auth_provider`, `created_at`, `profile_pic`) VALUES
(1, 'albert@gmail.com', '$2b$10$abt6NUwzA0mILjPHa2zlteB7706EYbeO52D3Ww5xYmLXN34JLaMjy', NULL, 'local', '2026-01-21 07:15:47', NULL),
(2, 'albertbelbase018@gmail.com', NULL, '115254832856476494596', 'google', '2026-01-21 07:18:07', 'https://lh3.googleusercontent.com/a/ACg8ocI4MBkrjHoji89ITY7dIVJcFZUnUlUW5sFELKvz3DpVyQHLAg=s96-c');

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
(2, 2, 157336, '2026-02-28 06:44:57'),
(3, 2, 293660, '2026-02-28 06:47:56');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=999;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `watchlist`
--
ALTER TABLE `watchlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
-- Constraints for table `watchlist`
--
ALTER TABLE `watchlist`
  ADD CONSTRAINT `fk_watchlist_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_watchlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
