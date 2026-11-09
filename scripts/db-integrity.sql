-- Kiểm tra toàn vẹn dữ liệu (chạy sau khôi phục / định kỳ). Mỗi truy vấn phải trả về 0.
\echo '1. Ví tiền âm'
SELECT count(*) FROM character_currencies WHERE gold < 0 OR spirit_stones < 0;
\echo '2. Số dư lệch với sổ cái (bản ghi cuối cùng mỗi nhân vật/tiền tệ)'
SELECT count(*) FROM (
  SELECT DISTINCT ON (l.character_id, l.currency) l.character_id, l.currency, l.balance_after
  FROM currency_ledger l ORDER BY l.character_id, l.currency, l.id DESC) last
JOIN character_currencies w ON w.character_id = last.character_id
WHERE (last.currency = 'gold' AND w.gold <> last.balance_after) OR (last.currency = 'spirit_stones' AND w.spirit_stones <> last.balance_after);
\echo '3. Vật phẩm trong túi/kho/trang bị không có chủ'
SELECT count(*) FROM item_instances WHERE container IN ('bag','storage','equip') AND owner_id IS NULL;
\echo '4. Trùng ô túi đồ'
SELECT count(*) FROM (SELECT owner_id, container, slot FROM item_instances WHERE container IN ('bag','storage') GROUP BY 1,2,3 HAVING count(*) > 1) d;
\echo '5. Tin rao chợ đang bán nhưng vật phẩm không ở container market'
SELECT count(*) FROM market_listings l JOIN item_instances i ON i.id = l.item_id WHERE l.status = 'active' AND i.container <> 'market';
\echo '6. Vật phẩm ký gửi (escrow) bị treo'
SELECT count(*) FROM item_instances WHERE container = 'escrow';
