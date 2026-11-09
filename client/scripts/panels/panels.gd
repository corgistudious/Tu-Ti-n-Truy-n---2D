extends Control
## Tất cả cửa sổ chức năng. Mọi nút đều gọi RPC thật tới server — không có nút giả.

var hud
var windows = {}
var bag: Array = []
var equip: Array = []
var wallet = {"gold": 0, "spirit_stones": 0}
var party = null
var house_state = {}
var _ctx_npc = ""

# ======================= KHUNG =======================
func show_window(root: Control, name: String) -> void:
	close_named(name)
	var c = CenterContainer.new()
	c.set_anchors_preset(Control.PRESET_FULL_RECT)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(c)
	c.add_child(root)
	windows[name] = c
	root.tree_exited.connect(func():
		if windows.get(name) == c:
			windows.erase(name)
		if is_instance_valid(c):
			c.queue_free())
	Sfx.play("ui_open", 0.4)

func close_named(name: String) -> void:
	if windows.has(name) and is_instance_valid(windows[name]):
		windows[name].queue_free()
	windows.erase(name)

func close_all() -> void:
	for k in windows.keys():
		close_named(k)

func is_open(name: String) -> bool:
	return windows.has(name) and is_instance_valid(windows[name])

func toggle(name: String) -> void:
	if is_open(name): close_named(name)
	else: open(name)

func refresh_if_open(name: String) -> void:
	if is_open(name): open(name)

func open(name: String) -> void:
	match name:
		"inventory": _inventory()
		"character": _character()
		"skills": _skills()
		"quests": _quests()
		"cultivation": _cultivation()
		"map": _map()
		"social": _social()
		"guild": _guild()
		"pets": _pets()
		"housing": _housing()
		"crafting": _crafting()
		"mail": _mail()
		"ranking": _ranking("realm")
		"dungeon": _dungeon()
		"settings": _settings()

func confirm(text: String, cb: Callable) -> void:
	var w = UI.window("Xác nhận", 420, 150)
	w.body.add_child(UI.lbl(text, 16, UI.PAPER, true))
	var h = UI.hbox()
	h.add_child(UI.btn("Đồng ý", func(): cb.call(true); w.root.queue_free()))
	h.add_child(UI.btn("Từ chối", func(): cb.call(false); w.root.queue_free()))
	w.body.add_child(h)
	show_window(w.root, "confirm_%d" % Time.get_ticks_msec())

func _rpc(m: String, p := {}, ok_msg := "") -> Dictionary:
	var r = await Net.rpc_call(m, p)
	if not r.ok:
		hud.toast(str(r.e), "warn")
	elif ok_msg != "":
		hud.toast(ok_msg, "good")
	return r

func _ask_number(title: String, default_v: int, cb: Callable) -> void:
	var w = UI.window(title, 360, 140)
	var e = UI.edit("Số lượng")
	e.text = str(default_v)
	w.body.add_child(e)
	w.body.add_child(UI.btn("Xác nhận", func(): cb.call(int(e.text)); w.root.queue_free()))
	show_window(w.root, "ask")

func _ask_text(title: String, placeholder: String, cb: Callable) -> void:
	var w = UI.window(title, 380, 140)
	var e = UI.edit(placeholder)
	w.body.add_child(e)
	w.body.add_child(UI.btn("Xác nhận", func(): cb.call(e.text.strip_edges()); w.root.queue_free()))
	show_window(w.root, "ask")

# ======================= TÚI ĐỒ =======================
func refresh_inventory() -> void:
	var r = await Net.rpc_call("inv.list")
	if r.ok:
		on_inventory({"bag": r.d.bag, "equip": r.d.equip, "wallet": r.d.wallet})

func on_inventory(m: Dictionary) -> void:
	bag = m.bag
	equip = m.equip
	wallet = m.wallet
	hud.wallet = wallet
	refresh_if_open("inventory")

func on_wallet() -> void:
	wallet.gold = hud.wallet.gold

func _inventory() -> void:
	var w = UI.window("Túi Đồ & Trang Bị", 780, 520)
	var h = UI.hbox(12)
	w.body.add_child(h)
	var left = UI.vbox(4)
	left.custom_minimum_size.x = 230
	h.add_child(left)
	left.add_child(UI.lbl("Trang bị", 16, UI.GOLD))
	var eg = GridContainer.new(); eg.columns = 3
	for i in GameData.SLOTS.size():
		var slot: String = GameData.SLOTS[i]
		var it = _equipped(i)
		var cell = UI.vbox(1)
		var s = UI.item_slot(it.t if it else "", 1, ("+%d" % int(it.e)) if it and int(it.e) > 0 else "", 52)
		if it:
			s.tooltip_text = UI.item_tooltip(it.t, it)
			s.gui_input.connect(func(ev): if ev is InputEventMouseButton and ev.pressed: _item_menu(it, true))
		cell.add_child(s)
		cell.add_child(UI.lbl(GameData.SLOT_NAMES[slot], 11, UI.DIM))
		eg.add_child(cell)
	left.add_child(eg)
	left.add_child(UI.lbl("Vàng: %s" % GameData.fmt(wallet.gold), 15, Color("#ffd860")))
	left.add_child(UI.lbl("Linh thạch: %s" % GameData.fmt(wallet.spirit_stones), 15, Color("#80e0ff")))
	var right = UI.vbox(4)
	right.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	h.add_child(right)
	var top = UI.hbox()
	top.add_child(UI.lbl("Túi (%d/60)" % bag.size(), 16, UI.GOLD))
	var search = UI.edit("Tìm kiếm...")
	search.custom_minimum_size.x = 180
	top.add_child(search)
	top.add_child(UI.btn("Sắp xếp", func(): await _rpc("inv.sort")))
	right.add_child(top)
	var filt = UI.hbox(3)
	var grid = GridContainer.new(); grid.columns = 10
	var fill = func(filter: String, term: String):
		UI.clear(grid)
		for it in bag:
			var d = GameData.items.get(it.t, {})
			if filter != "" and not (d.get("type", "") in filter.split(",")):
				continue
			if term != "" and not (term.to_lower() in str(d.get("name", "")).to_lower()):
				continue
			var s = UI.item_slot(it.t, int(it.q), ("+%d" % int(it.e)) if int(it.e) > 0 else "", 48)
			s.tooltip_text = UI.item_tooltip(it.t, it)
			if it.l:
				s.modulate = Color(1, 0.9, 0.7)
			s.gui_input.connect(func(ev): if ev is InputEventMouseButton and ev.pressed: _item_menu(it, false))
			grid.add_child(s)
	for f in [["Tất cả", ""], ["Trang bị", "weapon,armor,helmet,boots,ring,amulet,artifact,fashion,mount"], ["Đan dược", "pill"], ["Nguyên liệu", "herb,ore,material,gem,seed"], ["Khác", "manual,talisman,quest,tool,furniture,pet_egg,pet_gear,event"]]:
		var ff: String = f[1]
		filt.add_child(UI.btn(f[0], func(): fill.call(ff, search.text)))
	right.add_child(filt)
	search.text_changed.connect(func(t): fill.call("", t))
	var sc = UI.scroll(360)
	sc.add_child(grid)
	right.add_child(sc)
	fill.call("", "")
	show_window(w.root, "inventory")

func _equipped(slot_idx: int):
	for e in equip:
		if int(e.s) == slot_idx:
			return e
	return null

func _item_menu(it: Dictionary, equipped: bool) -> void:
	var d = GameData.items.get(it.t, {})
	var w = UI.window(d.get("name", it.t), 420, 300)
	w.title.add_theme_color_override("font_color", GameData.rarity_color(int(d.get("rarity", 0))))
	w.body.add_child(UI.lbl(UI.item_tooltip(it.t, it), 13, UI.PAPER, true))
	var g = GridContainer.new(); g.columns = 3
	var act = func(label: String, fn: Callable): g.add_child(UI.btn(label, func(): w.root.queue_free(); fn.call()))
	if equipped:
		act.call("Tháo", func(): await _rpc("inv.unequip", {"slot": d.slot}))
	else:
		if d.has("slot"): act.call("Trang bị", func(): await _rpc("inv.equip", {"id": it.id}))
		if d.has("use"):
			var kind: String = d.use.kind
			if kind == "capture":
				act.call("Thu phục mục tiêu", func():
					var t = hud.game._nearest_monster(260)
					if t == null: hud.toast("Không có mục tiêu gần", "warn"); return
					await _rpc("inv.use", {"id": it.id, "target": t.id}))
			elif kind == "pet_food":
				act.call("Cho linh thú ăn", func(): _pets())
			else:
				act.call("Sử dụng", func(): await _rpc("inv.use", {"id": it.id}))
		act.call("Bán NPC", func(): await _rpc("shop.sell", {"id": it.id}, "Đã bán"))
		act.call("Bán ở chợ", func(): _market_list_dialog(it))
		act.call("Gửi kho", func(): await _rpc("inv.toStorage", {"id": it.id}, "Đã gửi kho"))
		act.call("Hủy", func(): confirm("Hủy %s?" % d.get("name", ""), func(ok): if ok: await _rpc("inv.destroy", {"id": it.id})))
	act.call("Mở khóa" if it.l else "Khóa", func(): await _rpc("inv.lock", {"id": it.id}))
	if d.has("slot") and not (d.slot in ["fashion", "mount"]):
		act.call("Cường hóa", func(): _enhance(it))
	w.body.add_child(g)
	show_window(w.root, "item")

# ======================= NHÂN VẬT =======================
func _character() -> void:
	var r = await _rpc("char.info")
	if not r.ok: return
	var s: Dictionary = r.d
	var w = UI.window("Nhân Vật", 620, 480)
	var h = UI.hbox(16)
	w.body.add_child(h)
	var pv = Control.new(); pv.custom_minimum_size = Vector2(180, 300)
	var ls = LayeredSprite.new(); ls.set_appearance(s.appearance); ls.scale = Vector2(3, 3); ls.position = Vector2(90, 290); pv.add_child(ls)
	h.add_child(pv)
	var v = UI.vbox(3)
	h.add_child(v)
	v.add_child(UI.lbl(s.name, 22, UI.GOLD))
	v.add_child(UI.lbl("%s — Lực chiến %s" % [s.realmName, GameData.fmt(s.power)], 15))
	var st: Dictionary = s.stats
	for k in ["maxHp", "maxMp", "atk", "matk", "def", "mdef", "crit", "critDmg", "pen", "res", "moveSpeed"]:
		v.add_child(UI.lbl("%s: %s" % [UI.stat_name(k), UI.fmt_stat(k, st[k])], 14))
	v.add_child(UI.lbl("Tông môn: %s   Điểm đấu trường: %d   Điểm PK: %d" % [s.guild.name if s.guild else "—", int(s.arenaRating), int(s.pk)], 13, UI.DIM))
	var pv_row = UI.hbox()
	pv_row.add_child(UI.lbl("Chế độ PK:", 14))
	for m in [["Hòa bình", "peace"], ["Tông môn", "guild"], ["Toàn bộ", "all"]]:
		var mode: String = m[1]
		pv_row.add_child(UI.btn(m[0] + (" ✓" if s.pvpMode == mode else ""), func(): await _rpc("pvp.mode", {"mode": mode}, "Đã đổi chế độ"); _character()))
	v.add_child(pv_row)
	var tr = UI.hbox()
	tr.add_child(UI.lbl("Danh hiệu:", 14))
	for t in s.titles:
		var tt: String = t
		tr.add_child(UI.btn(tt + (" ✓" if s.title == tt else ""), func(): await _rpc("title.set", {"title": tt}, "Đã đổi danh hiệu")))
	v.add_child(tr)
	show_window(w.root, "character")

# ======================= KỸ NĂNG =======================
func _skills() -> void:
	var r = await _rpc("skill.list")
	if not r.ok: return
	var learned: Dictionary = r.d.learned
	var hotbar: Array = r.d.hotbar.duplicate()
	while hotbar.size() < 6: hotbar.append("")
	var w = UI.window("Công Pháp & Kỹ Năng", 760, 520)
	w.body.add_child(UI.lbl("Học công pháp bằng Bí Tịch (mua ở Võ Sư / Giáo Đầu / Truyền Công Trưởng Lão...). Nhấn số 1-5 để gán vào thanh kỹ năng.", 13, UI.DIM, true))
	var hb_row = UI.hbox()
	hb_row.add_child(UI.lbl("Thanh kỹ năng:", 14))
	for i in range(1, 6):
		var sid: String = hotbar[i]
		hb_row.add_child(UI.lbl("%d:%s" % [i, GameData.skills.get(sid, {}).get("name", "—")], 13, UI.GOLD))
	w.body.add_child(hb_row)
	var sc = UI.scroll(380)
	var list = UI.vbox(4)
	sc.add_child(list)
	w.body.add_child(sc)
	for sid in learned:
		if sid == "basic_attack": continue
		var sk = GameData.skills[sid]
		var row = UI.hbox(6)
		var ic = TextureRect.new(); ic.texture = Assets.skill_icon(sid); ic.custom_minimum_size = Vector2(40, 40); ic.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		row.add_child(ic)
		var info = UI.lbl("%s (cấp %d) — %s\n%s  |  Hồi %ss, tốn %d chân khí" % [sk.name, int(learned[sid]), GameData.PATH_NAMES.get(sk.path, sk.path), sk.desc, str(sk.cooldown), int(sk.cost)], 12, UI.PAPER, true)
		row.add_child(info)
		var sid2: String = sid
		row.add_child(UI.btn("Nâng cấp", func(): await _rpc("skill.learnUpgrade", {"id": sid2}, "Đã nâng cấp"); _skills()))
		for i in range(1, 6):
			var slot = i
			row.add_child(UI.btn(str(i), func():
				hotbar[slot] = sid2
				var rr = await _rpc("skill.hotbar", {"hotbar": hotbar}, "Đã gán")
				if rr.ok: hud.game.self_state.hotbar = rr.d.hotbar; hud._refresh_hotbar(); _skills()))
		list.add_child(row)
	if learned.size() <= 1:
		list.add_child(UI.lbl("Chưa lĩnh ngộ công pháp nào. Hãy mua Bí Tịch Nhập Môn ở Võ Sư Trần Cương (Tân Thủ Thôn).", 14, UI.GOLD, true))
	show_window(w.root, "skills")

# ======================= NHIỆM VỤ =======================
func _quests() -> void:
	var r = await _rpc("quest.list")
	if not r.ok: return
	var w = UI.window("Nhiệm Vụ", 700, 500)
	var sc = UI.scroll(420)
	var v = UI.vbox(6)
	sc.add_child(v)
	w.body.add_child(sc)
	v.add_child(UI.lbl("Đang làm", 18, UI.GOLD))
	for q in r.d.active:
		v.add_child(UI.lbl("%s%s" % ["[Chương %d] " % int(q.chapter) if q.chapter else "", q.name], 15, UI.PAPER))
		v.add_child(UI.lbl("  " + str(q.progressText), 12, UI.DIM, true))
		for o in q.objectives:
			v.add_child(UI.lbl("   • %s (%d/%d)%s" % [o.desc, int(o.v), int(o.max), (" — " + GameData.maps.get(o.map, {}).get("name", "")) if o.get("map") else ""], 13, UI.GREEN if int(o.v) >= int(o.max) else UI.PAPER))
		v.add_child(UI.lbl("   Trả nhiệm vụ: %s" % q.turnInName, 12, Color("#80d0ff")))
		if q.kind != "main":
			var qid: String = q.id
			v.add_child(UI.btn("Hủy nhiệm vụ", func(): await _rpc("quest.abandon", {"id": qid}); _quests(); hud.refresh_quests()))
	v.add_child(UI.lbl("Có thể nhận", 18, UI.GOLD))
	for a in r.d.available:
		v.add_child(UI.lbl("  %s — gặp %s tại %s" % [a.name, a.giverName, a.get("map", "?")], 13))
	v.add_child(UI.lbl("Đã hoàn thành: %d nhiệm vụ" % r.d.done.size(), 13, UI.DIM))
	show_window(w.root, "quests")

# ======================= TU LUYỆN / ĐỘT PHÁ =======================
func _cultivation() -> void:
	var r = await _rpc("cult.info")
	if not r.ok: return
	var c: Dictionary = r.d
	var w = UI.window("Tu Luyện & Đột Phá", 620, 480)
	w.body.add_child(UI.lbl(c.name, 22, UI.GOLD))
	w.body.add_child(UI.lbl(c.description, 13, UI.DIM, true))
	var bar = UI.bar(Color("#a070ff"), 560, 16); bar.max_value = max(1.0, float(c.req)); bar.value = float(c.tuVi)
	w.body.add_child(bar)
	w.body.add_child(UI.lbl("Tu vi: %s / %s — tầng %d/9" % [GameData.fmt(c.tuVi), GameData.fmt(c.req), int(c.layer)], 14))
	w.body.add_child(UI.lbl("Cảnh giới kế tiếp: %s" % c.next, 16, Color("#ffd080")))
	w.body.add_child(UI.lbl("Nguyên liệu đột phá:", 14, UI.GOLD))
	for m in c.materials:
		w.body.add_child(UI.lbl("  %s: %d/%d" % [GameData.item_name(m.item), int(m.have), int(m.qty)], 13, UI.GREEN if int(m.have) >= int(m.qty) else UI.RED))
	w.body.add_child(UI.lbl("  Vàng: %s" % GameData.fmt(c.gold), 13))
	if c.quest:
		w.body.add_child(UI.lbl("  Nhiệm vụ: %s %s" % [c.quest.name, "v" if c.quest.done else "x"], 13, UI.GREEN if c.quest.done else UI.RED))
	var trial_names = {"none": "Không", "tam_ma": "Tâm Ma (đánh bại tâm ma của chính mình)", "thien_kiep": "Thiên Kiếp (né các đạo lôi có báo hiệu)", "both": "Tâm Ma + Thiên Kiếp"}
	w.body.add_child(UI.lbl("Thử thách: %s" % trial_names.get(c.trial, c.trial), 13))
	w.body.add_child(UI.lbl("Tỉ lệ thành công: %d%%%s  |  Hộ Mạch Đan: %d" % [int(float(c.rate) * 100), " (+25% nếu vượt thử thách)" if float(c.trialBonus) > 0 else "", int(c.assistPills)], 13))
	w.body.add_child(UI.lbl("Thất bại: mất 15% tu vi tầng hiện tại (không tụt cảnh giới), lần sau +5% tỉ lệ.", 12, UI.DIM, true))
	var h = UI.hbox()
	h.add_child(UI.btn("Đả tọa (R)", func(): hud.game.toggle_meditate(); w.root.queue_free()))
	h.add_child(UI.btn("ĐỘT PHÁ", func(): w.root.queue_free(); var rr = await _rpc("cult.breakthrough", {"assist": false}); if rr.ok and rr.d.trial == "none": hud.toast("Đột phá " + ("thành công!" if rr.d.success else "thất bại"), "good" if rr.d.success else "warn")))
	if int(c.assistPills) > 0:
		h.add_child(UI.btn("Đột phá + Hộ Mạch Đan", func(): w.root.queue_free(); await _rpc("cult.breakthrough", {"assist": true})))
	w.body.add_child(h)
	show_window(w.root, "cultivation")

# ======================= BẢN ĐỒ THẾ GIỚI =======================
func _map() -> void:
	var r = await _rpc("world.info")
	if not r.ok: return
	var w := UI.window("Bản Đồ Vạn Giới — đã khám phá %d/%d" % [int(r.d.discovered), int(r.d.total)], 900, 560)
	var sc := UI.scroll(470)
	var v := UI.vbox(4)
	sc.add_child(v)
	w.body.add_child(sc)
	for t in r.d.tiers:
		v.add_child(UI.lbl("%s — %s%s" % [t.name, t.desc, "" if t.accessible else "  [cần %s]" % GameData.realm_name(int(t.minRealm))], 16, UI.GOLD if t.accessible else UI.DIM, true))
		var grid := GridContainer.new()
		grid.columns = 4
		for m in r.d.maps:
			if m.tier != t.id: continue
			var here: bool = m.id == r.d.current
			var col := Color("#ffe080") if here else (UI.PAPER if m.discovered else UI.DIM)
			var tag := ("PK " if m.pvp == "open" else "") + ("An toàn " if m.safe else "") + ("Ẩn " if m.hidden else "")
			var l := UI.lbl("%s%s\n  %s · nguy hiểm %d/10 %s" % ["> " if here else "", m.name, GameData.realm_name(int(m.reqRealm)), int(m.danger), tag], 12, col)
			l.custom_minimum_size.x = 210
			grid.add_child(l)
		v.add_child(grid)
	show_window(w.root, "map")

# ======================= NPC =======================
func npc_dialog(npc_id: String) -> void:
	var r = await _rpc("npc.talk", {"npc": npc_id})
	if not r.ok: return
	_ctx_npc = npc_id
	var d: Dictionary = r.d
	var w = UI.window("%s — %s" % [d.npc.name, d.npc.title], 640, 460)
	w.body.add_child(UI.lbl(d.npc.greeting, 15, UI.PAPER, true))
	var sc = UI.scroll(300)
	var v = UI.vbox(6)
	sc.add_child(v)
	w.body.add_child(sc)
	for q in d.progress:
		var qid: String = q.id
		v.add_child(UI.lbl("【%s】 %s" % [q.name, q.text], 14, Color("#80d0ff"), true))
		v.add_child(UI.btn("Trả nhiệm vụ: " + q.name, func():
			var rr = await _rpc("quest.turnIn", {"id": qid})
			if rr.ok:
				Sfx.play("levelup")
				var lines = "\n".join(q.complete.map(func(l): return "%s: %s" % [GameData.npcs.get(l.speaker, {}).get("name", l.speaker), l.text]))
				hud.toast("Hoàn thành: " + q.name, "good")
				_dialog_lines("Hoàn thành nhiệm vụ", lines)
				hud.refresh_quests()
				w.root.queue_free()))
	for q in d.offer:
		var qid2: String = q.id
		var text = "\n".join(q.dialogue.map(func(l): return ("%s: " % GameData.npcs.get(l.speaker, {}).get("name", l.speaker) if l.speaker != npc_id else "") + l.text))
		v.add_child(UI.lbl("【Nhiệm vụ】 %s" % q.name, 15, UI.GOLD))
		v.add_child(UI.lbl(text, 13, UI.PAPER, true))
		v.add_child(UI.lbl("Mục tiêu: " + ", ".join(q.objectives) + "\nThưởng: %s tu vi, %s vàng%s" % [GameData.fmt(q.rewards.tuvi), GameData.fmt(q.rewards.gold), (", " + ", ".join(q.rewards.get("items", []).map(func(i): return "%s x%d" % [GameData.item_name(i.item), int(i.qty)]))) if q.rewards.has("items") else ""], 12, UI.DIM, true))
		v.add_child(UI.btn("Nhận nhiệm vụ", func(): var rr = await _rpc("quest.accept", {"id": qid2}, "Đã nhận: " + q.name); if rr.ok: hud.refresh_quests(); w.root.queue_free()))
	var svc = UI.hbox()
	if d.npc.shop:
		var sid: String = d.npc.shop
		svc.add_child(UI.btn("Cửa hàng", func(): _shop(npc_id, sid)))
	for s in d.npc.services:
		match s:
			"storage": svc.add_child(UI.btn("Kho đồ", func(): _storage()))
			"enhance": svc.add_child(UI.btn("Rèn / Cường hóa", func(): _enhance_pick()))
			"craft": svc.add_child(UI.btn("Chế tạo", func(): _crafting()))
			"market": svc.add_child(UI.btn("Chợ", func(): _market()))
			"auction": svc.add_child(UI.btn("Đấu giá", func(): _auction()))
			"guild": svc.add_child(UI.btn("Tông môn", func(): _guild()))
			"arena": svc.add_child(UI.btn("Đấu trường", func(): await _rpc("arena.queue", {}, "Đã xếp hàng đấu trường")))
			"housing": svc.add_child(UI.btn("Động phủ", func(): _housing()))
			"teleport": svc.add_child(UI.btn("Dịch chuyển", func(): _teleport(npc_id, d.npc.teleports)))
			"mail": svc.add_child(UI.btn("Thư", func(): _mail()))
			"pets": svc.add_child(UI.btn("Linh thú", func(): _pets()))
			"breakthrough": svc.add_child(UI.btn("Đột phá", func(): _cultivation()))
	if svc.get_child_count() > 0:
		w.body.add_child(svc)
	show_window(w.root, "npc")

func _dialog_lines(title: String, text: String) -> void:
	var w = UI.window(title, 520, 220)
	w.body.add_child(UI.lbl(text, 14, UI.PAPER, true))
	show_window(w.root, "dialog_lines")

func _teleport_go(npc_id: String, mid: String, force: bool) -> void:
	var r = await _rpc("teleport.npc", {"npc": npc_id, "map": mid, "force": force})
	if r.ok and r.d.has("warn"):
		confirm(str(r.d.warn), func(ok): if ok: _teleport_go(npc_id, mid, true))

func _teleport(npc_id: String, dests: Array) -> void:
	var w = UI.window("Dịch Chuyển", 420, 360)
	for m in dests:
		var mid: String = m
		var md = GameData.maps.get(mid, {})
		w.body.add_child(UI.btn("%s (khuyến nghị %s, nguy hiểm %d/10)" % [md.get("name", mid), GameData.realm_name(int(md.get("reqRealm", 0))), int(md.get("danger", 1))], func(): w.root.queue_free(); close_named("npc"); _teleport_go(npc_id, mid, false)))
	show_window(w.root, "teleport")

# ======================= CỬA HÀNG / KHO =======================
func _shop(npc_id: String, shop_id: String) -> void:
	var shop = GameData.shops.get(shop_id)
	if shop == null: return
	var w = UI.window(shop.name, 640, 480)
	w.body.add_child(UI.lbl("Vàng: %s   Linh thạch: %s   (Bán đồ: mở túi -> Bán NPC)" % [GameData.fmt(wallet.gold), GameData.fmt(wallet.spirit_stones)], 13, UI.DIM))
	var sc = UI.scroll(380)
	var g = GridContainer.new(); g.columns = 2
	sc.add_child(g)
	w.body.add_child(sc)
	for e in shop.items:
		var row = UI.hbox()
		row.add_child(UI.item_slot(e.item, 1, "", 40))
		row.add_child(UI.lbl("%s\n%s %s" % [GameData.item_name(e.item), GameData.fmt(e.price), "vàng" if e.currency == "gold" else "linh thạch"], 12))
		var item: String = e.item
		row.add_child(UI.btn("Mua", func(): _ask_number("Số lượng mua", 1, func(n): await _rpc("shop.buy", {"npc": npc_id, "item": item, "qty": n}, "Đã mua"))))
		g.add_child(row)
	show_window(w.root, "shop")

func _storage() -> void:
	var r = await _rpc("inv.list", {"storage": true})
	if not r.ok: return
	var w = UI.window("Kho Đồ", 640, 460)
	w.body.add_child(UI.lbl("Nhấn vật phẩm để rút về túi. Gửi kho: mở Túi -> Gửi kho.", 13, UI.DIM))
	var g = GridContainer.new(); g.columns = 10
	for it in r.d.storage:
		var s = UI.item_slot(it.t, int(it.q), "", 48)
		var iid: String = it.id
		s.gui_input.connect(func(ev): if ev is InputEventMouseButton and ev.pressed: await _rpc("inv.fromStorage", {"id": iid}); w.root.queue_free(); _storage())
		g.add_child(s)
	var sc = UI.scroll(360); sc.add_child(g); w.body.add_child(sc)
	show_window(w.root, "storage")

# ======================= CƯỜNG HÓA =======================
func _enhance_pick() -> void:
	var w = UI.window("Chọn trang bị để rèn", 560, 400)
	var g = GridContainer.new(); g.columns = 9
	for it in bag + equip:
		var d = GameData.items.get(it.t, {})
		if not d.has("slot") or d.slot in ["fashion", "mount"]: continue
		var s = UI.item_slot(it.t, 1, ("+%d" % int(it.e)) if int(it.e) > 0 else "", 48)
		var item: Dictionary = it
		s.gui_input.connect(func(ev): if ev is InputEventMouseButton and ev.pressed: w.root.queue_free(); _enhance(item))
		g.add_child(s)
	w.body.add_child(g)
	show_window(w.root, "enhance_pick")

func _enhance(it: Dictionary) -> void:
	var d = GameData.items.get(it.t, {})
	var w = UI.window("Rèn: " + d.get("name", ""), 560, 420)
	w.body.add_child(UI.lbl(UI.item_tooltip(it.t, it), 13, UI.PAPER, true))
	w.body.add_child(UI.lbl("Cần đứng gần NPC rèn/luyện khí. Cường hóa tốn Cường Hóa Thạch + vàng (từ +7 thất bại tụt 1 cấp, không vỡ đồ).", 12, UI.DIM, true))
	var g = GridContainer.new(); g.columns = 3
	var id: String = it.id
	g.add_child(UI.btn("Cường hóa", func(): var r = await _rpc("equip.enhance", {"id": id}); w.root.queue_free(); if r.ok: _reopen_item(id)))
	g.add_child(UI.btn("Tinh luyện", func(): await _rpc("equip.refine", {"id": id}, "Tinh luyện thành công"); w.root.queue_free(); _reopen_item(id)))
	g.add_child(UI.btn("Mở lỗ khảm", func(): await _rpc("equip.socket", {"id": id}, "Đã mở lỗ"); w.root.queue_free(); _reopen_item(id)))
	g.add_child(UI.btn("Khảm ngọc", func():
		var gems = bag.filter(func(b): return GameData.items.get(b.t, {}).get("type", "") == "gem")
		if gems.is_empty(): hud.toast("Không có ngọc trong túi", "warn"); return
		await _rpc("equip.gem", {"id": id, "gem": gems[0].t}, "Đã khảm " + GameData.item_name(gems[0].t)); w.root.queue_free(); _reopen_item(id)))
	g.add_child(UI.btn("Tẩy luyện", func(): await _rpc("equip.reroll", {"id": id}, "Đã tẩy luyện thuộc tính"); w.root.queue_free(); _reopen_item(id)))
	g.add_child(UI.btn("Sửa toàn bộ", func(): var r = await _rpc("equip.repair"); if r.ok: hud.toast("Đã sửa (%s vàng)" % GameData.fmt(r.d.cost), "good")))
	w.body.add_child(g)
	show_window(w.root, "enhance")

func _reopen_item(id: String) -> void:
	await get_tree().create_timer(0.3).timeout
	for it in bag + equip:
		if it.id == id:
			_enhance(it); return

# ======================= CHỢ / ĐẤU GIÁ =======================
func _market_list_dialog(it: Dictionary) -> void:
	var w = UI.window("Đăng bán: " + GameData.item_name(it.t), 420, 240)
	var q = UI.edit("Số lượng"); q.text = str(it.q)
	var p = UI.edit("Giá bán")
	var cur = OptionButton.new(); cur.add_item("Vàng"); cur.add_item("Linh thạch")
	w.body.add_child(q); w.body.add_child(p); w.body.add_child(cur)
	w.body.add_child(UI.lbl("Phí đăng 1% (vàng), phí giao dịch 5% khi bán. Cần đứng gần Quản Sự Chợ.", 12, UI.DIM, true))
	var h = UI.hbox()
	h.add_child(UI.btn("Đăng chợ", func(): await _rpc("market.list", {"id": it.id, "qty": int(q.text), "price": int(p.text), "currency": "gold" if cur.selected == 0 else "spirit_stones"}, "Đã đăng bán"); w.root.queue_free()))
	h.add_child(UI.btn("Đấu giá 12h", func(): await _rpc("auction.create", {"id": it.id, "qty": int(q.text), "start": int(p.text), "hours": 12, "currency": "gold" if cur.selected == 0 else "spirit_stones"}, "Đã mở phiên đấu giá"); w.root.queue_free()))
	w.body.add_child(h)
	show_window(w.root, "market_list")

func _market() -> void:
	var w = UI.window("Chợ Người Chơi", 760, 500)
	var top = UI.hbox()
	var term = UI.edit("Tìm vật phẩm")
	top.add_child(term)
	var list = UI.vbox(3)
	var search = func():
		UI.clear(list)
		var r = await _rpc("market.search", {"q": term.text})
		if not r.ok: return
		for l in r.d:
			var row = UI.hbox()
			row.add_child(UI.item_slot(l.template_id, int(l.quantity), "", 38))
			row.add_child(UI.lbl("%s x%d%s — %s %s (người bán %s)" % [GameData.item_name(l.template_id), int(l.quantity), (" +%d" % int(l.enhance)) if int(l.enhance) > 0 else "", GameData.fmt(l.price), "vàng" if l.currency == "gold" else "LT", l.seller], 13))
			var lid = int(l.id)
			row.add_child(UI.btn("Mua", func(): await _rpc("market.buy", {"listing": lid}, "Mua thành công")))
			list.add_child(row)
	top.add_child(UI.btn("Tìm", search))
	top.add_child(UI.btn("Hàng của tôi", func():
		UI.clear(list)
		var r = await _rpc("market.mine")
		if not r.ok: return
		for l in r.d:
			var row = UI.hbox()
			row.add_child(UI.lbl("%s x%d — %s [%s]" % [GameData.item_name(l.template_id), int(l.quantity), GameData.fmt(l.price), l.status], 13))
			if l.status == "active":
				var lid = int(l.id)
				row.add_child(UI.btn("Hủy bán", func(): await _rpc("market.cancel", {"listing": lid}, "Đã hủy")))
			list.add_child(row)))
	w.body.add_child(top)
	var sc = UI.scroll(380); sc.add_child(list); w.body.add_child(sc)
	search.call()
	show_window(w.root, "market")

func _auction() -> void:
	var w = UI.window("Đấu Giá", 760, 500)
	var list = UI.vbox(3)
	var load_list = func(mine: bool):
		UI.clear(list)
		var r = await _rpc("auction.mine" if mine else "auction.search", {})
		if not r.ok: return
		for a in r.d:
			var row = UI.hbox()
			row.add_child(UI.item_slot(a.template_id, int(a.quantity), "", 38))
			var cur = GameData.fmt(a.current_bid) if a.current_bid != null else "chưa có"
			row.add_child(UI.lbl("%s x%d — khởi điểm %s, hiện tại %s%s — kết thúc %s" % [GameData.item_name(a.template_id), int(a.quantity), GameData.fmt(a.start_price), cur, (", mua ngay " + GameData.fmt(a.buyout)) if a.buyout != null else "", str(a.ends_at).substr(11, 5)], 12, UI.PAPER, true))
			var aid = int(a.id)
			if not mine:
				row.add_child(UI.btn("Đặt giá", func(): _ask_number("Giá đặt", int(float(a.current_bid if a.current_bid != null else a.start_price) * 1.05) + 1, func(n): await _rpc("auction.bid", {"auction": aid, "amount": n}, "Đã đặt giá"))))
			list.add_child(row)
	var top = UI.hbox()
	top.add_child(UI.btn("Tất cả phiên", func(): load_list.call(false)))
	top.add_child(UI.btn("Phiên của tôi", func(): load_list.call(true)))
	w.body.add_child(top)
	var sc = UI.scroll(380); sc.add_child(list); w.body.add_child(sc)
	load_list.call(false)
	show_window(w.root, "auction")

# ======================= GIAO DỊCH =======================
func trade_window(d: Dictionary) -> void:
	var w = UI.window("Giao dịch với %s" % d.with, 680, 440)
	var h = UI.hbox(20)
	w.body.add_child(h)
	for side in [["Bạn đưa", d.mine, d.myLock, d.myConfirm], ["Đối phương đưa", d.theirs, d.theirLock, d.theirConfirm]]:
		var v = UI.vbox(3)
		v.custom_minimum_size.x = 300
		v.add_child(UI.lbl("%s %s%s" % [side[0], "[khóa]" if side[2] else "", " v" if side[3] else ""], 16, UI.GOLD))
		var offer: Dictionary = side[1]
		for it in offer.items:
			var inst = bag.filter(func(b): return b.id == it.id)
			v.add_child(UI.lbl("  %s x%d" % [GameData.item_name(inst[0].t) if inst.size() else "(vật phẩm)", int(it.qty)], 13))
		v.add_child(UI.lbl("  Vàng: %s  Linh thạch: %s" % [GameData.fmt(offer.gold), GameData.fmt(offer.stones)], 13))
		h.add_child(v)
	var row = UI.hbox()
	row.add_child(UI.btn("Thêm vật phẩm", func():
		var pw = UI.window("Chọn vật phẩm", 560, 380)
		var g = GridContainer.new(); g.columns = 9
		for it in bag:
			var s = UI.item_slot(it.t, int(it.q), "", 48)
			var item: Dictionary = it
			s.gui_input.connect(func(ev):
				if ev is InputEventMouseButton and ev.pressed:
					pw.root.queue_free()
					var items: Array = d.mine.items.duplicate()
					items.append({"id": item.id, "qty": int(item.q)})
					await _rpc("trade.offer", {"items": items, "gold": int(d.mine.gold), "stones": int(d.mine.stones)}))
			g.add_child(s)
		pw.body.add_child(g)
		show_window(pw.root, "trade_pick")))
	row.add_child(UI.btn("Đặt vàng", func(): _ask_number("Vàng", int(d.mine.gold), func(n): await _rpc("trade.offer", {"items": d.mine.items, "gold": n, "stones": int(d.mine.stones)}))))
	row.add_child(UI.btn("Khóa", func(): await _rpc("trade.lock")))
	row.add_child(UI.btn("Xác nhận", func(): await _rpc("trade.confirm")))
	row.add_child(UI.btn("Hủy", func(): await _rpc("trade.cancel")))
	w.body.add_child(row)
	w.body.add_child(UI.lbl("Cả hai bên phải Khóa rồi Xác nhận. Phí giao dịch 2% tiền tệ. Vật phẩm khóa linh hồn không thể giao dịch.", 12, UI.DIM, true))
	show_window(w.root, "trade")

# ======================= XÃ HỘI =======================
func _social() -> void:
	var w = UI.window("Bạn Bè & Tổ Đội", 640, 480)
	var top = UI.hbox()
	var name_e = UI.edit("Tên người chơi")
	top.add_child(name_e)
	for a in [["Kết bạn", "friend.add"], ["Mời tổ đội", "party.invite"], ["Giao dịch", "trade.request"], ["Tỉ thí", "duel.request"], ["Chặn", "friend.block"]]:
		var m: String = a[1]
		top.add_child(UI.btn(a[0], func(): await _rpc(m, {"name": name_e.text.strip_edges()}, "Đã gửi")))
	w.body.add_child(top)
	var rep = UI.hbox()
	rep.add_child(UI.btn("Báo cáo người chơi", func(): await _rpc("report.player", {"name": name_e.text.strip_edges(), "reason": "abuse", "details": "Báo cáo từ client"}, "Đã gửi báo cáo")))
	rep.add_child(UI.btn("Xem trang bị", func():
		var r = await _rpc("char.info", {"name": name_e.text.strip_edges()})
		if r.ok: _dialog_lines(r.d.name, "%s\nTông môn: %s\n%s" % [r.d.realm, str(r.d.guild), "\n".join(r.d.equipment.map(func(e): return "%s +%d" % [GameData.item_name(e.t), int(e.enhance)]))])))
	w.body.add_child(rep)
	if party:
		w.body.add_child(UI.lbl("Tổ đội", 16, UI.GOLD))
		for m in party.members:
			var row = UI.hbox()
			row.add_child(UI.lbl("%s%s — %s — %s HP %s/%s" % ["*" if int(m.id) == int(party.leader) else "", m.name, m.realm, m.map, GameData.fmt(m.hp), GameData.fmt(m.mhp)], 13, UI.PAPER if m.online else UI.DIM))
			var mid = int(m.id)
			row.add_child(UI.btn("Mời ra", func(): await _rpc("party.kick", {"id": mid})))
			w.body.add_child(row)
		w.body.add_child(UI.btn("Rời tổ đội", func(): await _rpc("party.leave"); party = null; w.root.queue_free()))
	w.body.add_child(UI.lbl("Bạn bè", 16, UI.GOLD))
	var r = await _rpc("friend.list")
	if r.ok:
		for f in r.d.friends:
			var row = UI.hbox()
			row.add_child(UI.lbl("%s %s (%s) [%s]" % ["+" if f.online else "-", f.name, GameData.realm_name(int(f.realm_idx)), f.status], 13, UI.GREEN if f.online else UI.DIM))
			var fid = int(f.friend_id)
			row.add_child(UI.btn("Xóa", func(): await _rpc("friend.remove", {"id": fid}); w.root.queue_free(); _social()))
			w.body.add_child(row)
		for p in r.d.pending:
			var pid = int(p.character_id)
			var row2 = UI.hbox()
			row2.add_child(UI.lbl("Lời mời từ %s" % p.name, 13))
			row2.add_child(UI.btn("Đồng ý", func(): await _rpc("friend.respond", {"from": pid, "accept": true}); w.root.queue_free(); _social()))
			w.body.add_child(row2)
	show_window(w.root, "social")

# ======================= TÔNG MÔN =======================
func _guild() -> void:
	var w = UI.window("Tông Môn", 760, 520)
	var g = hud.game.self_state.get("guild")
	if g == null:
		w.body.add_child(UI.lbl("Bạn chưa gia nhập tông môn. Lập tông môn tốn 50.000 vàng (cần ở gần Tông Môn Sứ, cảnh giới Nội Kình).", 14, UI.PAPER, true))
		var e = UI.edit("Tên tông môn")
		w.body.add_child(e)
		w.body.add_child(UI.btn("Lập tông môn", func(): var r = await _rpc("guild.create", {"name": e.text.strip_edges()}, "Đã lập tông môn!"); if r.ok: w.root.queue_free()))
		var lr = await _rpc("guild.list")
		if lr.ok:
			w.body.add_child(UI.lbl("Các tông môn:", 15, UI.GOLD))
			for x in lr.d:
				w.body.add_child(UI.lbl("  %s (cấp %d, %d thành viên, tông chủ %s)" % [x.name, int(x.level), int(x.members), x.leader], 13))
		show_window(w.root, "guild")
		return
	var r = await _rpc("guild.info")
	if not r.ok: return
	var info: Dictionary = r.d
	w.body.add_child(UI.lbl("%s — cấp %d (%s/%s kinh nghiệm) — quỹ %s vàng — %d/%d người" % [info.guild.name, int(info.guild.level), GameData.fmt(info.guild.exp), GameData.fmt(info.guild.expNext), GameData.fmt(info.guild.gold), info.members.size(), int(info.guild.maxMembers)], 15, UI.GOLD, true))
	w.body.add_child(UI.lbl("Thông báo: " + str(info.guild.notice), 13, UI.PAPER, true))
	var tabs = TabContainer.new()
	tabs.size_flags_vertical = Control.SIZE_EXPAND_FILL
	w.body.add_child(tabs)
	var mem = UI.vbox(2); mem.name = "Thành viên"
	for m in info.members:
		var row = UI.hbox()
		row.add_child(UI.lbl("%s %s — %s — cống hiến %s" % ["+" if m.online else "-", m.name, {"leader": "Tông chủ", "vice": "Phó tông chủ", "elder": "Trưởng lão", "member": "Đệ tử"}.get(m.rank, m.rank), GameData.fmt(m.contribution)], 13))
		var cid = int(m.character_id)
		for rk in [["Trưởng lão", "elder"], ["Phó", "vice"], ["Đệ tử", "member"]]:
			var rr: String = rk[1]
			row.add_child(UI.btn(rk[0], func(): await _rpc("guild.setRank", {"id": cid, "rank": rr}, "Đã đổi chức vụ")))
		row.add_child(UI.btn("Mời ra", func(): await _rpc("guild.kick", {"id": cid})))
		mem.add_child(row)
	var msc = UI.scroll(220); msc.name = "Thành viên"; mem.name = "list"; msc.add_child(mem); tabs.add_child(msc)
	var act = UI.vbox(4); act.name = "Hoạt động"
	var ne = UI.edit("Tên người chơi / tông môn")
	act.add_child(ne)
	var ar = UI.hbox()
	ar.add_child(UI.btn("Mời", func(): await _rpc("guild.invite", {"name": ne.text.strip_edges()}, "Đã mời")))
	ar.add_child(UI.btn("Tuyên chiến", func(): await _rpc("guild.war", {"guild": ne.text.strip_edges()})))
	ar.add_child(UI.btn("Đổi thông báo", func(): await _rpc("guild.notice", {"text": ne.text}, "Đã đổi")))
	ar.add_child(UI.btn("Quyên 10.000 vàng", func(): await _rpc("guild.donate", {"gold": 10000}, "Cảm tạ cống hiến!")))
	act.add_child(ar)
	var br = UI.hbox()
	br.add_child(UI.btn("Khai mở Boss tông môn", func(): await _rpc("guild.boss", {"action": "start"})))
	br.add_child(UI.btn("Vào Boss tông môn", func(): await _rpc("guild.boss", {"action": "enter"})))
	br.add_child(UI.btn("Rời tông môn", func(): confirm("Rời tông môn?", func(ok): if ok: await _rpc("guild.leave"); w.root.queue_free())))
	act.add_child(br)
	for war in info.wars:
		act.add_child(UI.lbl("Chiến tranh: còn %d phút" % int(float(war.endsIn) / 60000), 13, UI.RED))
	tabs.add_child(act)
	var bank = UI.vbox(3); bank.name = "Kho tông môn"
	var bg = GridContainer.new(); bg.columns = 10
	for it in info.items:
		var s = UI.item_slot(it.template_id, int(it.quantity), "", 44)
		var iid: String = it.id
		s.gui_input.connect(func(ev): if ev is InputEventMouseButton and ev.pressed: await _rpc("guild.withdraw", {"id": iid}, "Đã rút"))
		bg.add_child(s)
	bank.add_child(bg)
	bank.add_child(UI.lbl("Gửi vào kho: chọn vật phẩm trong túi dưới đây.", 12, UI.DIM))
	var mg = GridContainer.new(); mg.columns = 10
	for it in bag:
		var s2 = UI.item_slot(it.t, int(it.q), "", 40)
		var iid2: String = it.id
		s2.gui_input.connect(func(ev): if ev is InputEventMouseButton and ev.pressed: await _rpc("guild.deposit", {"id": iid2}, "Đã gửi"))
		mg.add_child(s2)
	bank.add_child(mg)
	tabs.add_child(bank)
	var logs = UI.vbox(1); logs.name = "Nhật ký"
	for l in info.logs:
		logs.add_child(UI.lbl("%s %s %s" % [str(l.created_at).substr(5, 11), str(l.name), l.action], 12, UI.DIM))
	tabs.add_child(logs)
	show_window(w.root, "guild")

# ======================= LINH THÚ =======================
func _pets() -> void:
	var r = await _rpc("pet.list")
	if not r.ok: return
	var w = UI.window("Linh Thú", 700, 480)
	w.body.add_child(UI.lbl("Thu phục: đánh quái có thể thu phục xuống dưới 30% sinh lực rồi dùng Thu Hồn Phù (Túi -> Thu phục mục tiêu).", 12, UI.DIM, true))
	if r.d.is_empty():
		w.body.add_child(UI.lbl("Chưa có linh thú.", 14))
	var sc = UI.scroll(360); var v := UI.vbox(6); sc.add_child(v); w.body.add_child(sc)
	for p in r.d:
		var pid = int(p.id)
		v.add_child(UI.lbl("%s — %s cấp %d — phẩm chất %d%s  (KN %s/%s)" % [p.name, GameData.pets.get(p.template_id, {}).get("name", p.template_id), int(p.level), int(p.quality), " [Đang triệu hồi]" if p.summoned else "", GameData.fmt(p.exp), GameData.fmt(p.next)], 14, UI.GOLD))
		v.add_child(UI.lbl("  HP %s  Công %s  Pháp %s  Thủ %s" % [GameData.fmt(p.stats.maxHp), GameData.fmt(p.stats.atk), GameData.fmt(p.stats.matk), GameData.fmt(p.stats.def)], 12))
		var row = UI.hbox()
		row.add_child(UI.btn("Thu hồi" if p.summoned else "Triệu hồi", func(): await _rpc("pet.dismiss" if p.summoned else "pet.summon", {"id": pid}); w.root.queue_free(); _pets()))
		for food in ["pet_food_1", "pet_food_2", "pet_food_3"]:
			var f: String = food
			if bag.any(func(b): return b.t == f):
				row.add_child(UI.btn("Cho ăn " + GameData.item_name(f), func(): await _rpc("pet.feed", {"id": pid, "food": f}, "Đã cho ăn"); w.root.queue_free(); _pets()))
		if p.canEvolve:
			row.add_child(UI.btn("Tiến hóa", func(): await _rpc("pet.evolve", {"id": pid}); w.root.queue_free(); _pets()))
		row.add_child(UI.btn("Đổi tên", func(): _ask_text("Tên mới", "Tên linh thú", func(t): await _rpc("pet.rename", {"id": pid, "name": t}))))
		var gear = bag.filter(func(b): return GameData.items.get(b.t, {}).get("type", "") == "pet_gear")
		if gear.size():
			row.add_child(UI.btn("Đeo " + GameData.item_name(gear[0].t), func(): await _rpc("pet.equip", {"pet": pid, "item": gear[0].id}, "Đã trang bị")))
		row.add_child(UI.btn("Phóng sinh", func(): confirm("Phóng sinh %s?" % p.name, func(ok): if ok: await _rpc("pet.release", {"id": pid}); w.root.queue_free())))
		v.add_child(row)
	show_window(w.root, "pets")

# ======================= ĐỘNG PHỦ =======================
func _housing() -> void:
	var r = await _rpc("house.info")
	if not r.ok: return
	var w = UI.window("Động Phủ / Tiên Phủ", 720, 500)
	if not r.d.owned:
		w.body.add_child(UI.lbl("Bạn chưa có động phủ. Mua tại Địa Chủ (Thanh Vân Thành) với 5.000 vàng.", 14, UI.PAPER, true))
		w.body.add_child(UI.btn("Mua động phủ", func(): await _rpc("house.claim", {}, "Đã sở hữu động phủ!"); w.root.queue_free(); _housing()))
		show_window(w.root, "housing")
		return
	var h: Dictionary = r.d.house
	w.body.add_child(UI.lbl("%s — %s (cấp %d) — quyền vào: %s" % [h.name, r.d.levelInfo.name, int(h.level), h.access], 15, UI.GOLD))
	var row = UI.hbox()
	row.add_child(UI.btn("Vào động phủ", func(): w.root.queue_free(); await _rpc("house.enter")))
	row.add_child(UI.btn("Rời động phủ", func(): w.root.queue_free(); await _rpc("house.leave")))
	if r.d.nextLevel:
		row.add_child(UI.btn("Nâng lên %s (%s vàng, %s LT)" % [r.d.nextLevel.name, GameData.fmt(r.d.nextLevel.cost.gold), GameData.fmt(r.d.nextLevel.cost.spirit_stones)], func(): await _rpc("house.upgrade", {}, "Đã nâng cấp"); w.root.queue_free(); _housing()))
	w.body.add_child(row)
	var acc = UI.hbox()
	acc.add_child(UI.lbl("Quyền vào:", 13))
	for a in [["Riêng tư", "private"], ["Bạn bè", "friends"], ["Tông môn", "guild"], ["Công khai", "public"]]:
		var av: String = a[1]
		acc.add_child(UI.btn(a[0], func(): await _rpc("house.access", {"access": av}, "Đã đổi")))
	var visit = UI.edit("Thăm động phủ của...")
	acc.add_child(visit)
	acc.add_child(UI.btn("Thăm", func(): w.root.queue_free(); await _rpc("house.enter", {"owner": visit.text.strip_edges()})))
	w.body.add_child(acc)
	w.body.add_child(UI.lbl("Công trình", 15, UI.GOLD))
	for bid in r.d.buildings:
		var b = r.d.buildings[bid]
		var lvl = int(h.buildings.get(bid, 0))
		var brow = UI.hbox()
		brow.add_child(UI.lbl("%s cấp %d/%d — %s" % [b.name, lvl, int(b.maxLevel), b.desc], 12, UI.PAPER, true))
		var b2: String = bid
		if lvl < int(b.maxLevel):
			var cost = b.costs[lvl]
			brow.add_child(UI.btn("Xây (%s vàng)" % GameData.fmt(cost.gold), func(): await _rpc("house.build", {"building": b2}, "Đã xây"); w.root.queue_free(); _housing()))
		w.body.add_child(brow)
	w.body.add_child(UI.lbl("Linh điền (%d ô) — trồng/thu hoạch khi ở trong động phủ" % int(r.d.plotCount), 15, UI.GOLD))
	var pg = UI.hbox()
	for i in int(r.d.plotCount):
		var plot = i
		var p = null
		for x in r.d.plots:
			if int(x.plot_idx) == i: p = x
		if p:
			pg.add_child(UI.btn("Ô %d: %s — Thu hoạch" % [i + 1, GameData.item_name(p.seed_item)], func(): await _rpc("house.harvest", {"plot": plot}); w.root.queue_free(); _housing()))
		else:
			pg.add_child(UI.btn("Ô %d: Gieo hạt" % [i + 1], func():
				var seeds = bag.filter(func(b): return GameData.items.get(b.t, {}).get("type", "") == "seed")
				if seeds.is_empty(): hud.toast("Không có hạt giống", "warn"); return
				await _rpc("house.plant", {"plot": plot, "seed": seeds[0].t}, "Đã gieo " + GameData.item_name(seeds[0].t)); w.root.queue_free(); _housing()))
	w.body.add_child(pg)
	var furn = bag.filter(func(b): return GameData.items.get(b.t, {}).get("type", "") == "furniture")
	if furn.size():
		w.body.add_child(UI.btn("Đặt nội thất: " + GameData.item_name(furn[0].t), func(): await _rpc("house.place", {"id": furn[0].id, "x": int(hud.game.body.x)}, "Đã đặt"); w.root.queue_free(); _housing()))
	for i in h.decorations.size():
		var idx = i
		w.body.add_child(UI.btn("Thu nội thất: " + GameData.item_name(h.decorations[i].item), func(): await _rpc("house.remove", {"index": idx}); w.root.queue_free(); _housing()))
	show_window(w.root, "housing")

# ======================= CHẾ TẠO =======================
func _crafting() -> void:
	var r = await _rpc("craft.list")
	if not r.ok: return
	var w = UI.window("Nghề Nghiệp & Chế Tạo", 780, 520)
	var prof_row = UI.hbox()
	for p in GameData.PROF_NAMES:
		var pl = r.d.professions.get(p, {"level": 0})
		prof_row.add_child(UI.lbl("%s %d" % [GameData.PROF_NAMES[p], int(pl.level)], 12, UI.GOLD))
	w.body.add_child(prof_row)
	if r.d.jobs.size():
		w.body.add_child(UI.lbl("Đang chế tạo:", 14, UI.GOLD))
		for j in r.d.jobs:
			var jid = int(j.id)
			var row = UI.hbox()
			row.add_child(UI.lbl("%s — xong lúc %s" % [GameData.recipes.get(j.recipe_id, {}).get("name", j.recipe_id), str(j.finishes_at).substr(11, 8)], 13))
			row.add_child(UI.btn("Nhận", func(): await _rpc("craft.claim", {"job": jid}); w.root.queue_free(); _crafting()))
			w.body.add_child(row)
	var tabs = TabContainer.new()
	tabs.size_flags_vertical = Control.SIZE_EXPAND_FILL
	w.body.add_child(tabs)
	for prof in ["alchemy", "forging", "tailoring", "talisman", "formation"]:
		var sc = UI.scroll(300); sc.name = GameData.PROF_NAMES[prof]
		var v = UI.vbox(3); sc.add_child(v)
		var lvl = int(r.d.professions.get(prof, {"level": 0}).level)
		for rc in GameData.recipes.values():
			if rc.profession != prof or int(rc.level) > lvl + 10: continue
			var row = UI.hbox()
			row.add_child(UI.item_slot(rc.output.item, int(rc.output.qty), "", 36))
			var inputs = ", ".join(rc.inputs.map(func(i): return "%s x%d" % [GameData.item_name(i.item), int(i.qty)]))
			row.add_child(UI.lbl("%s (cấp %d, %ds, %d%%)\n%s" % [rc.name, int(rc.level), int(rc.seconds), int(float(rc.successRate) * 100), inputs], 12, UI.PAPER if int(rc.level) <= lvl else UI.DIM, true))
			var rid: String = rc.id
			row.add_child(UI.btn("Chế tạo", func(): var rr = await _rpc("craft.start", {"recipe": rid}); if rr.ok: hud.toast("Bắt đầu chế tạo (%ds)" % int(rr.d.seconds), "good"); w.root.queue_free(); _crafting()))
			v.add_child(row)
		tabs.add_child(sc)
	w.body.add_child(UI.lbl("Chế tạo ở gần NPC có dịch vụ chế tạo hoặc trong động phủ (Đan Phòng giảm thời gian). Khai khoáng/hái thuốc/câu cá: đứng gần điểm tài nguyên và nhấn E.", 12, UI.DIM, true))
	show_window(w.root, "crafting")

# ======================= THƯ =======================
func _mail() -> void:
	var r = await _rpc("mail.list")
	if not r.ok: return
	var w = UI.window("Hộp Thư", 640, 460)
	if r.d.is_empty(): w.body.add_child(UI.lbl("Không có thư.", 14))
	var sc = UI.scroll(380); var v := UI.vbox(6); sc.add_child(v); w.body.add_child(sc)
	for m in r.d:
		var mid = int(m.id)
		v.add_child(UI.lbl("[%s] %s — %s" % [m.from_name, m.subject, str(m.created_at).substr(0, 10)], 14, UI.GOLD))
		v.add_child(UI.lbl(m.body, 12, UI.PAPER, true))
		var att = []
		if float(m.gold) > 0: att.append("%s vàng" % GameData.fmt(m.gold))
		if float(m.spirit_stones) > 0: att.append("%s linh thạch" % GameData.fmt(m.spirit_stones))
		for it in m.items: att.append("%s x%d" % [GameData.item_name(it.t), int(it.q)])
		var row = UI.hbox()
		if att.size() and m.claimed_at == null:
			row.add_child(UI.lbl("Đính kèm: " + ", ".join(att), 12, Color("#ffd860")))
			row.add_child(UI.btn("Nhận", func(): await _rpc("mail.claim", {"id": mid}, "Đã nhận"); w.root.queue_free(); _mail()))
		row.add_child(UI.btn("Xóa", func(): await _rpc("mail.delete", {"id": mid}); w.root.queue_free(); _mail()))
		v.add_child(row)
	show_window(w.root, "mail")

# ======================= XẾP HẠNG =======================
func _ranking(kind: String) -> void:
	var r = await _rpc("rank.get", {"kind": kind})
	if not r.ok: return
	var w = UI.window("Bảng Xếp Hạng", 600, 480)
	var tabs = UI.hbox()
	for k in [["Cảnh giới", "realm"], ["Lực chiến", "power"], ["Tài phú", "wealth"], ["Đấu trường", "arena"], ["Tông môn", "guild"], ["PK", "pk"]]:
		var kk: String = k[1]
		tabs.add_child(UI.btn(k[0], func(): w.root.queue_free(); _ranking(kk)))
	w.body.add_child(tabs)
	var sc = UI.scroll(380); var v := UI.vbox(2); sc.add_child(v); w.body.add_child(sc)
	var i = 0
	for row in r.d.rows:
		i += 1
		var txt = ""
		match kind:
			"realm": txt = "%s — %s tầng %d" % [row.name, GameData.realm_name(int(row.realm_idx)), int(row.layer)]
			"power": txt = "%s — %s" % [row.name, GameData.fmt(row.combat_power)]
			"wealth": txt = "%s — %s vàng, %s LT" % [row.name, GameData.fmt(row.gold), GameData.fmt(row.spirit_stones)]
			"arena": txt = "%s — %d điểm" % [row.name, int(row.arena_rating)]
			"guild": txt = "%s — cấp %d (%d người)" % [row.name, int(row.level), int(row.members)]
			"pk": txt = "%s — %d điểm PK" % [row.name, int(row.pk_points)]
		v.add_child(UI.lbl("%d. %s" % [i, txt], 14, UI.GOLD if i <= 3 else UI.PAPER))
	show_window(w.root, "ranking")

# ======================= PHÓ BẢN =======================
func _dungeon() -> void:
	var w = UI.window("Phó Bản & Đấu Trường", 620, 440)
	w.body.add_child(UI.lbl("Đội trưởng mở phó bản; thành viên tổ đội ở cùng bản đồ được đưa vào cùng nhau.", 12, UI.DIM, true))
	for d in GameData.dungeons.values():
		var did: String = d.id
		var row = UI.hbox()
		row.add_child(UI.lbl("%s — yêu cầu %s, %d-%d người, %d lượt/ngày" % [d.name, GameData.realm_name(int(d.reqRealm)), int(d.minPlayers), int(d.maxPlayers), int(d.dailyLimit)], 13, UI.PAPER, true))
		row.add_child(UI.btn("Vào", func(): w.root.queue_free(); await _rpc("dungeon.enter", {"id": did})))
		w.body.add_child(row)
	var row2 = UI.hbox()
	row2.add_child(UI.btn("Rời phó bản / khu vực", func(): w.root.queue_free(); await _rpc("dungeon.leave")))
	row2.add_child(UI.btn("Rời hàng đấu trường", func(): await _rpc("arena.leave", {}, "Đã rời hàng")))
	w.body.add_child(row2)
	show_window(w.root, "dungeon")

# ======================= CÀI ĐẶT =======================
func _settings() -> void:
	var w = UI.window("Cài Đặt", 620, 520)
	var vol = UI.hbox()
	vol.add_child(UI.lbl("Nhạc", 14))
	var ms = HSlider.new(); ms.custom_minimum_size.x = 160; ms.max_value = 1.0; ms.step = 0.05; ms.value = Config.music_volume
	ms.value_changed.connect(func(v): Config.music_volume = v; Sfx.refresh_volume(); Config.save())
	vol.add_child(ms)
	vol.add_child(UI.lbl("Hiệu ứng", 14))
	var ss = HSlider.new(); ss.custom_minimum_size.x = 160; ss.max_value = 1.0; ss.step = 0.05; ss.value = Config.sfx_volume
	ss.value_changed.connect(func(v): Config.sfx_volume = v; Config.save())
	vol.add_child(ss)
	w.body.add_child(vol)
	w.body.add_child(UI.lbl("Phím tắt (nhấn nút rồi bấm phím mới):", 14, UI.GOLD))
	var sc = UI.scroll(300)
	var g = GridContainer.new(); g.columns = 4
	sc.add_child(g)
	for action in Config.ACTION_NAMES:
		g.add_child(UI.lbl(Config.ACTION_NAMES[action], 13))
		var a: String = action
		var b = Button.new()
		b.text = ", ".join(Config.keybinds.get(action, []))
		b.focus_mode = Control.FOCUS_NONE
		b.pressed.connect(func():
			b.text = "..."
			var ev = await _wait_key()
			var key_name = OS.get_keycode_string(ev)
			Config.set_key(a, key_name)
			b.text = key_name
			Net.rpc_call("settings.keybinds", {"keybinds": Config.keybinds}))
		g.add_child(b)
	w.body.add_child(sc)
	var row = UI.hbox()
	row.add_child(UI.btn("Khôi phục mặc định", func(): Config.keybinds = Config.DEFAULT_KEYS.duplicate(true); Config.apply_keybinds(); Config.save(); w.root.queue_free(); _settings()))
	row.add_child(UI.btn("Đổi nhân vật", func(): Net.disconnect_game(); hud.game.main.show_char_select()))
	row.add_child(UI.btn("Đăng xuất", func(): Net.disconnect_game(); await Net.http("POST", "/api/auth/logout", {}); hud.game.main.show_login()))
	w.body.add_child(row)
	w.body.add_child(UI.lbl("Ping: %d ms — Dữ liệu v%s" % [Net.ping_ms, GameData.version], 12, UI.DIM))
	show_window(w.root, "settings")

signal _key_captured(code: int)
var _capturing = false
func _wait_key() -> int:
	_capturing = true
	var code: int = await _key_captured
	return code

func _input(event: InputEvent) -> void:
	if _capturing and event is InputEventKey and event.pressed:
		_capturing = false
		get_viewport().set_input_as_handled()
		_key_captured.emit(event.physical_keycode)
