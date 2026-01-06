-- Insert Menu Items for Yash Garden Restaurant
-- This script inserts all menu items from the bilingual menu

-- Note: For items with only one price, both half_price and full_price are set to the same value
-- For items with "₹-" (no price listed), we'll use 0.00 - you should update these manually

BEGIN;

-- 🥤 COLD DRINKS
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('CD001', 'Thums Up', 25.00, 25.00),
('CD002', 'Water Bottle', 20.00, 20.00),
('CD003', 'Sprite', 25.00, 25.00),
('CD004', 'Soda', 25.00, 25.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- 🥗 PAPAD (पापड)
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('PAP001', 'Nagali Masala Papad (नाचणी मसाला पापड)', 30.00, 30.00),
('PAP002', 'Ulid Masala Papad (उडीद मसाला पापड)', 30.00, 30.00),
('PAP003', 'Nagali Fry Papad (नाचणी फ्राय पापड)', 20.00, 20.00),
('PAP004', 'Ulid Fry Papad (उडीद फ्राय पापड)', 20.00, 20.00),
('PAP005', 'Nagali Roast Papad (नाचणी रोस्ट पापड)', 15.00, 15.00),
('PAP006', 'Ulid Roast Papad (उडीद रोस्ट पापड)', 15.00, 15.00),
('PAP007', 'Jodhpuri Papad (जोधपुरी पापड)', 90.00, 90.00),
('PAP008', 'Sindhi Papad (सिंधी पापड)', 90.00, 90.00),
('PAP009', 'Singapuri Papad (सिंगापुरी पापड)', 90.00, 90.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- 🍜 CHINESE
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('CHN001', 'Soyabean Chilli', 140.00, 140.00),
('CHN002', 'Paneer Chilli', 200.00, 200.00),
('CHN003', 'Chicken Chilli (5 Pcs)', 250.00, 250.00),
('CHN004', 'Mushroom Chilli', 260.00, 260.00),
('CHN005', 'Paneer 65', 220.00, 220.00),
('CHN006', 'Chicken 65 (6 Pcs)', 320.00, 320.00),
('CHN007', 'Mushroom 65', 260.00, 260.00),
('CHN008', 'Soyabean Tikka/Roast', 130.00, 130.00),
('CHN009', 'Soyabean Kentucky', 160.00, 160.00),
('CHN010', 'Chicken Fried Rice', 290.00, 290.00),
('CHN011', 'Chicken Schezwan Rice', 300.00, 300.00),
('CHN012', 'Chicken Triple Rice', 330.00, 330.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- 🍽 SOUPS (सूप)
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('SUP001', 'Chicken Soup (चिकन सूप)', 80.00, 120.00),
('SUP002', 'Mutton Soup (मटण सूप)', 90.00, 130.00),
('SUP003', 'Fish Soup with Pcs (मासळी सूप)', 160.00, 320.00),
('SUP004', 'Chicken Soup with Pieces (पीस असलेले चिकन सूप)', 150.00, 300.00),
('SUP005', 'Mutton Soup with Pieces (पीस असलेले मटण सूप)', 160.00, 300.00),
('SUP006', 'Crab Soup with One Pc (केकडा सूप)', 180.00, 180.00),
('SUP007', 'Tomato Soup (टोमॅटो सूप)', 100.00, 100.00),
('SUP008', 'Ginger Soup (आले सूप)', 90.00, 90.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- 🐟 SEA FOOD (सीफूड)
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('SF001', 'Prawns Masala', 0.00, 0.00),
('SF002', 'Prawns Curry', 0.00, 0.00),
('SF003', 'Surmai Fry', 0.00, 0.00),
('SF004', 'Pomfret Tawa', 0.00, 0.00),
('SF005', 'Bombil Fry', 0.00, 0.00),
('SF006', 'Crab Curry', 0.00, 0.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- 🥤 ROTI / CHAPATI (पोळी / भाकरी)
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('ROT001', 'Chapati (पोळी)', 10.00, 10.00),
('ROT002', 'Bhakri (भाकरी)', 15.00, 15.00),
('ROT003', 'Butter Chapati', 15.00, 15.00),
('ROT004', 'Tandoori Roti', 0.00, 0.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- 🍚 RICE (भात / राईस)
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('RIC001', 'Plain Rice (साधा भात)', 70.00, 140.00),
('RIC002', 'Jeera Rice (जिरा राईस)', 70.00, 140.00),
('RIC003', 'Schezwan Rice (शेजवान राईस)', 0.00, 230.00),
('RIC004', 'Fried Rice (फ्रायड राईस)', 0.00, 250.00),
('RIC005', 'Garlic Rice (लसूण राईस)', 90.00, 160.00),
('RIC006', 'Combine Rice (कॉम्बिन राईस)', 0.00, 0.00),
('RIC007', 'Mushroom Rice (मशरूम राईस)', 100.00, 200.00),
('RIC008', 'Chicken Combine Rice (चिकन कॉम्बिन राईस)', 0.00, 0.00),
('RIC009', 'Chicken Ginger Rice (चिकन जिंजर राईस)', 0.00, 0.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- ⭐ VEG STARTER (शाकाहारी स्टार्टर)
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('VST001', 'Paneer Pakoda (पनीर पकोडा)', 170.00, 170.00),
('VST002', 'Kanda Pakoda (कांदा भजी)', 150.00, 150.00),
('VST003', 'Bendi Roast (भेंडी रोस्ट)', 140.00, 140.00),
('VST004', 'Chana Roast (मटकी चणा रोस्ट)', 120.00, 120.00),
('VST005', 'Chana Garli', 140.00, 140.00),
('VST006', 'Matki Fry (मटकी फ्राय)', 100.00, 100.00),
('VST007', 'Finger Chips (फिंगर चिप्स)', 140.00, 140.00),
('VST008', 'Soyabean Roast (सोयाबीन रोस्ट)', 100.00, 100.00),
('VST009', 'Lasoon Fry (लसूण फ्राय)', 90.00, 90.00),
('VST010', 'Lasoon Plate', 50.00, 50.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- ⭐ VEG MAIN COURSE - Paneer Sabji Types
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('VMC001', 'Paneer Masala', 170.00, 170.00),
('VMC002', 'Paneer Kolhapuri', 220.00, 220.00),
('VMC003', 'Paneer Singapuri', 230.00, 230.00),
('VMC004', 'Paneer Rajwadi', 270.00, 270.00),
('VMC005', 'Paneer Kofta', 250.00, 250.00),
('VMC006', 'Paneer Tufani', 240.00, 240.00),
('VMC007', 'Paneer Khichdi', 220.00, 220.00),
('VMC008', 'Paneer Lajawab', 230.00, 230.00),
('VMC009', 'Paneer Tikka Masala', 250.00, 250.00),
('VMC010', 'Paneer Butter Masala', 260.00, 260.00),
('VMC011', 'Paneer Furji', 140.00, 140.00),
('VMC012', 'Paneer Dil Khoosh Kofta', 270.00, 270.00),
('VMC013', 'Lacha Paneer', 230.00, 230.00),
('VMC014', 'Veg Egg Curry', 250.00, 250.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- ⭐ VEG MAIN COURSE - Kaju (Cashew) Sabji Types
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('VMC015', 'Kaju Masala', 170.00, 170.00),
('VMC016', 'Kaju Curry Sweet', 190.00, 190.00),
('VMC017', 'Kaju Paneer', 190.00, 190.00),
('VMC018', 'Kaju Singapuri', 200.00, 200.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- ⭐ VEG MAIN COURSE - Vegetable Sabji
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('VMC019', 'Mix Veg', 170.00, 170.00),
('VMC020', 'Gobi Masala', 150.00, 150.00),
('VMC021', 'Bhendi Masala', 130.00, 130.00),
('VMC022', 'Chana Masala', 140.00, 140.00),
('VMC023', 'Matar Masala', 140.00, 140.00),
('VMC024', 'Soyabean Masala', 140.00, 140.00),
('VMC025', 'Aloo Gobi Masala', 160.00, 160.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- ⭐ VEG MAIN COURSE - Dal / Khichdi
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('VMC026', 'Dal Fry', 120.00, 120.00),
('VMC027', 'Dal Tadka', 120.00, 120.00),
('VMC028', 'Dal Makhani', 170.00, 170.00),
('VMC029', 'Ulid Dal', 140.00, 140.00),
('VMC030', 'Dal Khichdi', 150.00, 150.00),
('VMC031', 'Tadka Khichdi', 190.00, 190.00),
('VMC032', 'Masala Khichdi', 190.00, 190.00),
('VMC033', 'Butter Khichdi', 190.00, 190.00),
('VMC034', 'Kaju Khichdi', 220.00, 220.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- 🍗 NON-VEG STARTER (नॉनव्हेज स्टार्टर)
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('NST001', 'Chicken Roast/Tikka', 150.00, 300.00),
('NST002', 'Chicken Latpat', 150.00, 300.00),
('NST003', 'Chicken Sukka', 160.00, 320.00),
('NST004', 'Chicken Galli', 0.00, 330.00),
('NST005', 'Chicken Tandoori', 0.00, 300.00),
('NST006', 'Mutton Roast', 170.00, 340.00),
('NST007', 'Mutton Latpat', 160.00, 320.00),
('NST008', 'Mutton Sukka', 170.00, 340.00),
('NST009', 'Mutton Garli', 0.00, 350.00),
('NST010', 'Fish Roast', 150.00, 300.00),
('NST011', 'Fish Roast (Coating)', 160.00, 320.00),
('NST012', 'Fish Latpat', 150.00, 300.00),
('NST013', 'Fish Garli', 0.00, 320.00),
('NST014', 'Fish Tawa', 0.00, 320.00),
('NST015', 'Fish Sukka', 0.00, 300.00),
('NST016', 'Fish Rava Fry', 0.00, 320.00),
('NST017', 'Bombil Roast', 0.00, 130.00),
('NST018', 'Bombil Latpat', 0.00, 150.00),
('NST019', 'Bombil Thecha', 0.00, 180.00),
('NST020', 'Bombil Sukka', 0.00, 150.00),
('NST021', 'Fish Thecha', 0.00, 330.00),
('NST022', 'Prawns Roast', 0.00, 300.00),
('NST023', 'Prawns Latpat', 0.00, 300.00),
('NST024', 'Prawns Tawa', 0.00, 300.00),
('NST025', 'Prawns Thecha', 0.00, 320.00),
('NST026', 'Prawns Garli', 0.00, 320.00),
('NST027', 'Poplet Roast (Single Fish)', 0.00, 280.00),
('NST028', 'Poplet Tawa', 0.00, 300.00),
('NST029', 'Fangda Roast (Single Fish)', 0.00, 150.00),
('NST030', 'Majali Roast', 0.00, 180.00),
('NST031', 'Khekda Roast', 0.00, 180.00),
('NST032', 'Khekda Latpat', 0.00, 200.00),
('NST033', 'Omelette', 0.00, 70.00),
('NST034', 'Foorji/Farji (Egg)', 0.00, 70.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- 🍛 CHICKEN MAIN COURSE (चिकन)
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('CMC001', 'Butter Chicken', 0.00, 300.00),
('CMC002', 'Chicken Handi', 500.00, 900.00),
('CMC003', 'Chicken Masala/Curry', 150.00, 300.00),
('CMC004', 'Chicken Kadai', 160.00, 320.00),
('CMC005', 'Chicken Kolhapuri', 160.00, 320.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- 🍖 MUTTON MAIN COURSE (मटण)
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('MMC001', 'Mutton Masala', 170.00, 320.00),
('MMC002', 'Mutton Handi', 600.00, 1100.00),
('MMC003', 'Mutton Fry', 160.00, 320.00),
('MMC004', 'Mutton Balti', 180.00, 350.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- 🐐 WEIGHT-BASED COOKING CHARGES
-- Mutton Cooking Charges (मटन निवाई)
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('WBC001', 'Mutton Cooking Charges - 500g (मटन निवाई - अर्धा किलो)', 250.00, 250.00),
('WBC002', 'Mutton Cooking Charges - 1 KG (मटन निवाई - 1 किलो)', 400.00, 400.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- 🐓 Country Chicken Cooking Charges (गावठण निवाई)
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('WBC003', 'Country Chicken Cooking Charges - 500g (गावठण निवाई - अर्धा किलो)', 250.00, 250.00),
('WBC004', 'Country Chicken Cooking Charges - 1 KG (गावठण निवाई - 1 किलो)', 400.00, 400.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- 🍗 Broiler Chicken Cooking Charges (बॉइलर निवाई)
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('WBC005', 'Broiler Chicken Cooking Charges - 500g (बॉइलर निवाई - अर्धा किलो)', 200.00, 200.00),
('WBC006', 'Broiler Chicken Cooking Charges - 1 KG (बॉइलर निवाई - 1 किलो)', 350.00, 350.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

-- 🐟 Fish Cooking Charges (मासळी निवाई)
INSERT INTO items (item_id, item_name, half_price, full_price) VALUES
('WBC007', 'Fish Cooking Charges - 500g (मासळी निवाई - अर्धा किलो)', 200.00, 200.00),
('WBC008', 'Fish Cooking Charges - 1 KG (मासळी निवाई - 1 किलो)', 350.00, 350.00)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  half_price = EXCLUDED.half_price,
  full_price = EXCLUDED.full_price;

COMMIT;

-- Note: Items with price 0.00 need to be updated manually with actual prices
-- You can update them using:
-- UPDATE items SET half_price = <price>, full_price = <price> WHERE item_id = '<item_id>';

