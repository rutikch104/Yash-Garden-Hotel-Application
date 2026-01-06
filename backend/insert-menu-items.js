import pool from './db.js';

// Menu items data
const menuItems = [
  // 🥤 COLD DRINKS
  { item_id: 'CD001', item_name: 'Thums Up', half_price: 25.00, full_price: 25.00 },
  { item_id: 'CD002', item_name: 'Water Bottle', half_price: 20.00, full_price: 20.00 },
  { item_id: 'CD003', item_name: 'Sprite', half_price: 25.00, full_price: 25.00 },
  { item_id: 'CD004', item_name: 'Soda', half_price: 25.00, full_price: 25.00 },

  // 🥗 PAPAD (पापड)
  { item_id: 'PAP001', item_name: 'Nagali Masala Papad (नाचणी मसाला पापड)', half_price: 30.00, full_price: 30.00 },
  { item_id: 'PAP002', item_name: 'Ulid Masala Papad (उडीद मसाला पापड)', half_price: 30.00, full_price: 30.00 },
  { item_id: 'PAP003', item_name: 'Nagali Fry Papad (नाचणी फ्राय पापड)', half_price: 20.00, full_price: 20.00 },
  { item_id: 'PAP004', item_name: 'Ulid Fry Papad (उडीद फ्राय पापड)', half_price: 20.00, full_price: 20.00 },
  { item_id: 'PAP005', item_name: 'Nagali Roast Papad (नाचणी रोस्ट पापड)', half_price: 15.00, full_price: 15.00 },
  { item_id: 'PAP006', item_name: 'Ulid Roast Papad (उडीद रोस्ट पापड)', half_price: 15.00, full_price: 15.00 },
  { item_id: 'PAP007', item_name: 'Jodhpuri Papad (जोधपुरी पापड)', half_price: 90.00, full_price: 90.00 },
  { item_id: 'PAP008', item_name: 'Sindhi Papad (सिंधी पापड)', half_price: 90.00, full_price: 90.00 },
  { item_id: 'PAP009', item_name: 'Singapuri Papad (सिंगापुरी पापड)', half_price: 90.00, full_price: 90.00 },

  // 🍜 CHINESE
  { item_id: 'CHN001', item_name: 'Soyabean Chilli', half_price: 140.00, full_price: 140.00 },
  { item_id: 'CHN002', item_name: 'Paneer Chilli', half_price: 200.00, full_price: 200.00 },
  { item_id: 'CHN003', item_name: 'Chicken Chilli (5 Pcs)', half_price: 250.00, full_price: 250.00 },
  { item_id: 'CHN004', item_name: 'Mushroom Chilli', half_price: 260.00, full_price: 260.00 },
  { item_id: 'CHN005', item_name: 'Paneer 65', half_price: 220.00, full_price: 220.00 },
  { item_id: 'CHN006', item_name: 'Chicken 65 (6 Pcs)', half_price: 320.00, full_price: 320.00 },
  { item_id: 'CHN007', item_name: 'Mushroom 65', half_price: 260.00, full_price: 260.00 },
  { item_id: 'CHN008', item_name: 'Soyabean Tikka/Roast', half_price: 130.00, full_price: 130.00 },
  { item_id: 'CHN009', item_name: 'Soyabean Kentucky', half_price: 160.00, full_price: 160.00 },
  { item_id: 'CHN010', item_name: 'Chicken Fried Rice', half_price: 290.00, full_price: 290.00 },
  { item_id: 'CHN011', item_name: 'Chicken Schezwan Rice', half_price: 300.00, full_price: 300.00 },
  { item_id: 'CHN012', item_name: 'Chicken Triple Rice', half_price: 330.00, full_price: 330.00 },

  // 🍽 SOUPS (सूप)
  { item_id: 'SUP001', item_name: 'Chicken Soup (चिकन सूप)', half_price: 80.00, full_price: 120.00 },
  { item_id: 'SUP002', item_name: 'Mutton Soup (मटण सूप)', half_price: 90.00, full_price: 130.00 },
  { item_id: 'SUP003', item_name: 'Fish Soup with Pcs (मासळी सूप)', half_price: 160.00, full_price: 320.00 },
  { item_id: 'SUP004', item_name: 'Chicken Soup with Pieces (पीस असलेले चिकन सूप)', half_price: 150.00, full_price: 300.00 },
  { item_id: 'SUP005', item_name: 'Mutton Soup with Pieces (पीस असलेले मटण सूप)', half_price: 160.00, full_price: 300.00 },
  { item_id: 'SUP006', item_name: 'Crab Soup with One Pc (केकडा सूप)', half_price: 180.00, full_price: 180.00 },
  { item_id: 'SUP007', item_name: 'Tomato Soup (टोमॅटो सूप)', half_price: 100.00, full_price: 100.00 },
  { item_id: 'SUP008', item_name: 'Ginger Soup (आले सूप)', half_price: 90.00, full_price: 90.00 },

  // 🐟 SEA FOOD (सीफूड)
  { item_id: 'SF001', item_name: 'Prawns Masala', half_price: 0.00, full_price: 0.00 },
  { item_id: 'SF002', item_name: 'Prawns Curry', half_price: 0.00, full_price: 0.00 },
  { item_id: 'SF003', item_name: 'Surmai Fry', half_price: 0.00, full_price: 0.00 },
  { item_id: 'SF004', item_name: 'Pomfret Tawa', half_price: 0.00, full_price: 0.00 },
  { item_id: 'SF005', item_name: 'Bombil Fry', half_price: 0.00, full_price: 0.00 },
  { item_id: 'SF006', item_name: 'Crab Curry', half_price: 0.00, full_price: 0.00 },

  // 🥤 ROTI / CHAPATI (पोळी / भाकरी)
  { item_id: 'ROT001', item_name: 'Chapati (पोळी)', half_price: 10.00, full_price: 10.00 },
  { item_id: 'ROT002', item_name: 'Bhakri (भाकरी)', half_price: 15.00, full_price: 15.00 },
  { item_id: 'ROT003', item_name: 'Butter Chapati', half_price: 15.00, full_price: 15.00 },
  { item_id: 'ROT004', item_name: 'Tandoori Roti', half_price: 0.00, full_price: 0.00 },

  // 🍚 RICE (भात / राईस)
  { item_id: 'RIC001', item_name: 'Plain Rice (साधा भात)', half_price: 70.00, full_price: 140.00 },
  { item_id: 'RIC002', item_name: 'Jeera Rice (जिरा राईस)', half_price: 70.00, full_price: 140.00 },
  { item_id: 'RIC003', item_name: 'Schezwan Rice (शेजवान राईस)', half_price: 0.00, full_price: 230.00 },
  { item_id: 'RIC004', item_name: 'Fried Rice (फ्रायड राईस)', half_price: 0.00, full_price: 250.00 },
  { item_id: 'RIC005', item_name: 'Garlic Rice (लसूण राईस)', half_price: 90.00, full_price: 160.00 },
  { item_id: 'RIC006', item_name: 'Combine Rice (कॉम्बिन राईस)', half_price: 0.00, full_price: 0.00 },
  { item_id: 'RIC007', item_name: 'Mushroom Rice (मशरूम राईस)', half_price: 100.00, full_price: 200.00 },
  { item_id: 'RIC008', item_name: 'Chicken Combine Rice (चिकन कॉम्बिन राईस)', half_price: 0.00, full_price: 0.00 },
  { item_id: 'RIC009', item_name: 'Chicken Ginger Rice (चिकन जिंजर राईस)', half_price: 0.00, full_price: 0.00 },

  // ⭐ VEG STARTER (शाकाहारी स्टार्टर)
  { item_id: 'VST001', item_name: 'Paneer Pakoda (पनीर पकोडा)', half_price: 170.00, full_price: 170.00 },
  { item_id: 'VST002', item_name: 'Kanda Pakoda (कांदा भजी)', half_price: 150.00, full_price: 150.00 },
  { item_id: 'VST003', item_name: 'Bendi Roast (भेंडी रोस्ट)', half_price: 140.00, full_price: 140.00 },
  { item_id: 'VST004', item_name: 'Chana Roast (मटकी चणा रोस्ट)', half_price: 120.00, full_price: 120.00 },
  { item_id: 'VST005', item_name: 'Chana Garli', half_price: 140.00, full_price: 140.00 },
  { item_id: 'VST006', item_name: 'Matki Fry (मटकी फ्राय)', half_price: 100.00, full_price: 100.00 },
  { item_id: 'VST007', item_name: 'Finger Chips (फिंगर चिप्स)', half_price: 140.00, full_price: 140.00 },
  { item_id: 'VST008', item_name: 'Soyabean Roast (सोयाबीन रोस्ट)', half_price: 100.00, full_price: 100.00 },
  { item_id: 'VST009', item_name: 'Lasoon Fry (लसूण फ्राय)', half_price: 90.00, full_price: 90.00 },
  { item_id: 'VST010', item_name: 'Lasoon Plate', half_price: 50.00, full_price: 50.00 },

  // ⭐ VEG MAIN COURSE - Paneer Sabji Types
  { item_id: 'VMC001', item_name: 'Paneer Masala', half_price: 170.00, full_price: 170.00 },
  { item_id: 'VMC002', item_name: 'Paneer Kolhapuri', half_price: 220.00, full_price: 220.00 },
  { item_id: 'VMC003', item_name: 'Paneer Singapuri', half_price: 230.00, full_price: 230.00 },
  { item_id: 'VMC004', item_name: 'Paneer Rajwadi', half_price: 270.00, full_price: 270.00 },
  { item_id: 'VMC005', item_name: 'Paneer Kofta', half_price: 250.00, full_price: 250.00 },
  { item_id: 'VMC006', item_name: 'Paneer Tufani', half_price: 240.00, full_price: 240.00 },
  { item_id: 'VMC007', item_name: 'Paneer Khichdi', half_price: 220.00, full_price: 220.00 },
  { item_id: 'VMC008', item_name: 'Paneer Lajawab', half_price: 230.00, full_price: 230.00 },
  { item_id: 'VMC009', item_name: 'Paneer Tikka Masala', half_price: 250.00, full_price: 250.00 },
  { item_id: 'VMC010', item_name: 'Paneer Butter Masala', half_price: 260.00, full_price: 260.00 },
  { item_id: 'VMC011', item_name: 'Paneer Furji', half_price: 140.00, full_price: 140.00 },
  { item_id: 'VMC012', item_name: 'Paneer Dil Khoosh Kofta', half_price: 270.00, full_price: 270.00 },
  { item_id: 'VMC013', item_name: 'Lacha Paneer', half_price: 230.00, full_price: 230.00 },
  { item_id: 'VMC014', item_name: 'Veg Egg Curry', half_price: 250.00, full_price: 250.00 },

  // ⭐ VEG MAIN COURSE - Kaju (Cashew) Sabji Types
  { item_id: 'VMC015', item_name: 'Kaju Masala', half_price: 170.00, full_price: 170.00 },
  { item_id: 'VMC016', item_name: 'Kaju Curry Sweet', half_price: 190.00, full_price: 190.00 },
  { item_id: 'VMC017', item_name: 'Kaju Paneer', half_price: 190.00, full_price: 190.00 },
  { item_id: 'VMC018', item_name: 'Kaju Singapuri', half_price: 200.00, full_price: 200.00 },

  // ⭐ VEG MAIN COURSE - Vegetable Sabji
  { item_id: 'VMC019', item_name: 'Mix Veg', half_price: 170.00, full_price: 170.00 },
  { item_id: 'VMC020', item_name: 'Gobi Masala', half_price: 150.00, full_price: 150.00 },
  { item_id: 'VMC021', item_name: 'Bhendi Masala', half_price: 130.00, full_price: 130.00 },
  { item_id: 'VMC022', item_name: 'Chana Masala', half_price: 140.00, full_price: 140.00 },
  { item_id: 'VMC023', item_name: 'Matar Masala', half_price: 140.00, full_price: 140.00 },
  { item_id: 'VMC024', item_name: 'Soyabean Masala', half_price: 140.00, full_price: 140.00 },
  { item_id: 'VMC025', item_name: 'Aloo Gobi Masala', half_price: 160.00, full_price: 160.00 },

  // ⭐ VEG MAIN COURSE - Dal / Khichdi
  { item_id: 'VMC026', item_name: 'Dal Fry', half_price: 120.00, full_price: 120.00 },
  { item_id: 'VMC027', item_name: 'Dal Tadka', half_price: 120.00, full_price: 120.00 },
  { item_id: 'VMC028', item_name: 'Dal Makhani', half_price: 170.00, full_price: 170.00 },
  { item_id: 'VMC029', item_name: 'Ulid Dal', half_price: 140.00, full_price: 140.00 },
  { item_id: 'VMC030', item_name: 'Dal Khichdi', half_price: 150.00, full_price: 150.00 },
  { item_id: 'VMC031', item_name: 'Tadka Khichdi', half_price: 190.00, full_price: 190.00 },
  { item_id: 'VMC032', item_name: 'Masala Khichdi', half_price: 190.00, full_price: 190.00 },
  { item_id: 'VMC033', item_name: 'Butter Khichdi', half_price: 190.00, full_price: 190.00 },
  { item_id: 'VMC034', item_name: 'Kaju Khichdi', half_price: 220.00, full_price: 220.00 },

  // 🍗 NON-VEG STARTER (नॉनव्हेज स्टार्टर)
  { item_id: 'NST001', item_name: 'Chicken Roast/Tikka', half_price: 150.00, full_price: 300.00 },
  { item_id: 'NST002', item_name: 'Chicken Latpat', half_price: 150.00, full_price: 300.00 },
  { item_id: 'NST003', item_name: 'Chicken Sukka', half_price: 160.00, full_price: 320.00 },
  { item_id: 'NST004', item_name: 'Chicken Galli', half_price: 0.00, full_price: 330.00 },
  { item_id: 'NST005', item_name: 'Chicken Tandoori', half_price: 0.00, full_price: 300.00 },
  { item_id: 'NST006', item_name: 'Mutton Roast', half_price: 170.00, full_price: 340.00 },
  { item_id: 'NST007', item_name: 'Mutton Latpat', half_price: 160.00, full_price: 320.00 },
  { item_id: 'NST008', item_name: 'Mutton Sukka', half_price: 170.00, full_price: 340.00 },
  { item_id: 'NST009', item_name: 'Mutton Garli', half_price: 0.00, full_price: 350.00 },
  { item_id: 'NST010', item_name: 'Fish Roast', half_price: 150.00, full_price: 300.00 },
  { item_id: 'NST011', item_name: 'Fish Roast (Coating)', half_price: 160.00, full_price: 320.00 },
  { item_id: 'NST012', item_name: 'Fish Latpat', half_price: 150.00, full_price: 300.00 },
  { item_id: 'NST013', item_name: 'Fish Garli', half_price: 0.00, full_price: 320.00 },
  { item_id: 'NST014', item_name: 'Fish Tawa', half_price: 0.00, full_price: 320.00 },
  { item_id: 'NST015', item_name: 'Fish Sukka', half_price: 0.00, full_price: 300.00 },
  { item_id: 'NST016', item_name: 'Fish Rava Fry', half_price: 0.00, full_price: 320.00 },
  { item_id: 'NST017', item_name: 'Bombil Roast', half_price: 0.00, full_price: 130.00 },
  { item_id: 'NST018', item_name: 'Bombil Latpat', half_price: 0.00, full_price: 150.00 },
  { item_id: 'NST019', item_name: 'Bombil Thecha', half_price: 0.00, full_price: 180.00 },
  { item_id: 'NST020', item_name: 'Bombil Sukka', half_price: 0.00, full_price: 150.00 },
  { item_id: 'NST021', item_name: 'Fish Thecha', half_price: 0.00, full_price: 330.00 },
  { item_id: 'NST022', item_name: 'Prawns Roast', half_price: 0.00, full_price: 300.00 },
  { item_id: 'NST023', item_name: 'Prawns Latpat', half_price: 0.00, full_price: 300.00 },
  { item_id: 'NST024', item_name: 'Prawns Tawa', half_price: 0.00, full_price: 300.00 },
  { item_id: 'NST025', item_name: 'Prawns Thecha', half_price: 0.00, full_price: 320.00 },
  { item_id: 'NST026', item_name: 'Prawns Garli', half_price: 0.00, full_price: 320.00 },
  { item_id: 'NST027', item_name: 'Poplet Roast (Single Fish)', half_price: 0.00, full_price: 280.00 },
  { item_id: 'NST028', item_name: 'Poplet Tawa', half_price: 0.00, full_price: 300.00 },
  { item_id: 'NST029', item_name: 'Fangda Roast (Single Fish)', half_price: 0.00, full_price: 150.00 },
  { item_id: 'NST030', item_name: 'Majali Roast', half_price: 0.00, full_price: 180.00 },
  { item_id: 'NST031', item_name: 'Khekda Roast', half_price: 0.00, full_price: 180.00 },
  { item_id: 'NST032', item_name: 'Khekda Latpat', half_price: 0.00, full_price: 200.00 },
  { item_id: 'NST033', item_name: 'Omelette', half_price: 0.00, full_price: 70.00 },
  { item_id: 'NST034', item_name: 'Foorji/Farji (Egg)', half_price: 0.00, full_price: 70.00 },

  // 🍛 CHICKEN MAIN COURSE (चिकन)
  { item_id: 'CMC001', item_name: 'Butter Chicken', half_price: 0.00, full_price: 300.00 },
  { item_id: 'CMC002', item_name: 'Chicken Handi', half_price: 500.00, full_price: 900.00 },
  { item_id: 'CMC003', item_name: 'Chicken Masala/Curry', half_price: 150.00, full_price: 300.00 },
  { item_id: 'CMC004', item_name: 'Chicken Kadai', half_price: 160.00, full_price: 320.00 },
  { item_id: 'CMC005', item_name: 'Chicken Kolhapuri', half_price: 160.00, full_price: 320.00 },

  // 🍖 MUTTON MAIN COURSE (मटण)
  { item_id: 'MMC001', item_name: 'Mutton Masala', half_price: 170.00, full_price: 320.00 },
  { item_id: 'MMC002', item_name: 'Mutton Handi', half_price: 600.00, full_price: 1100.00 },
  { item_id: 'MMC003', item_name: 'Mutton Fry', half_price: 160.00, full_price: 320.00 },
  { item_id: 'MMC004', item_name: 'Mutton Balti', half_price: 180.00, full_price: 350.00 },

  // 🐐 WEIGHT-BASED COOKING CHARGES
  // Mutton Cooking Charges (मटन निवाई)
  { item_id: 'WBC001', item_name: 'Mutton Cooking Charges - 500g (मटन निवाई - अर्धा किलो)', half_price: 250.00, full_price: 250.00 },
  { item_id: 'WBC002', item_name: 'Mutton Cooking Charges - 1 KG (मटन निवाई - 1 किलो)', half_price: 400.00, full_price: 400.00 },

  // 🐓 Country Chicken Cooking Charges (गावठण निवाई)
  { item_id: 'WBC003', item_name: 'Country Chicken Cooking Charges - 500g (गावठण निवाई - अर्धा किलो)', half_price: 250.00, full_price: 250.00 },
  { item_id: 'WBC004', item_name: 'Country Chicken Cooking Charges - 1 KG (गावठण निवाई - 1 किलो)', half_price: 400.00, full_price: 400.00 },

  // 🍗 Broiler Chicken Cooking Charges (बॉइलर निवाई)
  { item_id: 'WBC005', item_name: 'Broiler Chicken Cooking Charges - 500g (बॉइलर निवाई - अर्धा किलो)', half_price: 200.00, full_price: 200.00 },
  { item_id: 'WBC006', item_name: 'Broiler Chicken Cooking Charges - 1 KG (बॉइलर निवाई - 1 किलो)', half_price: 350.00, full_price: 350.00 },

  // 🐟 Fish Cooking Charges (मासळी निवाई)
  { item_id: 'WBC007', item_name: 'Fish Cooking Charges - 500g (मासळी निवाई - अर्धा किलो)', half_price: 200.00, full_price: 200.00 },
  { item_id: 'WBC008', item_name: 'Fish Cooking Charges - 1 KG (मासळी निवाई - 1 किलो)', half_price: 350.00, full_price: 350.00 },
];

async function insertMenuItems() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const item of menuItems) {
      try {
        const result = await client.query(
          `INSERT INTO items (item_id, item_name, half_price, full_price)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (item_id) DO UPDATE SET
             item_name = EXCLUDED.item_name,
             half_price = EXCLUDED.half_price,
             full_price = EXCLUDED.full_price
           RETURNING *`,
          [item.item_id, item.item_name, item.half_price, item.full_price]
        );

        if (result.rows[0]) {
          // Check if it was an insert or update
          const existing = await client.query(
            'SELECT created_at FROM items WHERE item_id = $1',
            [item.item_id]
          );
          
          // Simple heuristic: if created_at is very recent, it's likely an insert
          const now = new Date();
          const created = new Date(existing.rows[0].created_at);
          const diff = now - created;
          
          if (diff < 1000) { // Less than 1 second old
            inserted++;
          } else {
            updated++;
          }
        }
      } catch (error) {
        console.error(`Error inserting ${item.item_id}:`, error.message);
        errors++;
      }
    }

    await client.query('COMMIT');
    
    console.log('\n✅ Menu items insertion completed!');
    console.log(`📊 Statistics:`);
    console.log(`   - Inserted: ${inserted} items`);
    console.log(`   - Updated: ${updated} items`);
    console.log(`   - Errors: ${errors} items`);
    console.log(`\n⚠️  Note: Items with price 0.00 need to be updated manually with actual prices.`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error inserting menu items:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the script
insertMenuItems()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

