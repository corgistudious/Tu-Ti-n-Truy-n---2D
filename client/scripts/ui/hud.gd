extends Control
## HUD: HP/MP, tu vi, hotbar, minimap, theo dõi nhiệm vụ, chat, thông báo; điều khiển cảm ứng cho Android.

var game
var panels
var hp_bar: ProgressBar
var mp_bar: ProgressBar
var hp_lbl: Label
var mp_lbl: Label
var tuvi_bar: ProgressBar
var tuvi_lbl: Label
var name_lbl: Label
var status_lbl: Label
var map_lbl: Label
var minimap: Control
var tracker: VBoxContainer
var chat_log: RichTextLabel
var chat_input: LineEdit
var chat_channel = "map"
var chat_ch_btn: Button
var toasts: VBoxContainer
var banner_lbl: Label
var overlay: Label
var hint_lbl: Label
var hotbar_box: HBoxContainer
var hot_buttons: Array = []
var progress_bar: ProgressBar
var progress_t = 0.0
var progress_dur = 0.0
var death_panel: Control
var joy_x = 0.0
var mobile = false
var joy: Control
var joy_touch = -1
var joy_center = Vector2.ZERO
var event_lbl: Label
var wallet = {"gold": 0, "spirit_stones": 0}
var tuvi = 0.0
var tuvi_req = 1.0
var quest_cache: Array = []
var _hint_acc = 0.0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	mobile = OS.has_feature("android") or OS.has_feature("mobile") or DisplayServer.is_touchscreen_available()
	_build_top_left()
	_build_top_right()
	_build_tracker()
	_build_chat()
	_build_hotbar()
	_build_center()
	if mobile:
		_build_touch()
	panels = preload("res://scripts/panels/panels.gd").new()
	panels.hud = self
	panels.set_anchors_preset(Control.PRESET_FULL_RECT)
	panels.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(panels)
	get_viewport().size_changed.connect(_layout)
	_layout()

func _anchor(c: Control, preset: int, offset: Vector2) -> void:
	c.set_anchors_preset(preset)
	c.position = offset

func _build_top_left() -> void:
	var p = PanelContainer.new()
	p.position = Vector2(10, 10)
	p.custom_minimum_size = Vector2(300, 0)
	add_child(p)
	var v = UI.vbox(3)
	p.add_child(v)
	name_lbl = UI.lbl("", 15, UI.GOLD)
	v.add_child(name_lbl)
	var hr = UI.hbox(); hp_bar = UI.bar(Color("#d84040"), 230, 16); hr.add_child(hp_bar); hp_lbl = UI.lbl("", 12); hr.add_child(hp_lbl); v.add_child(hr)
	var mr = UI.hbox(); mp_bar = UI.bar(Color("#4080e0"), 230, 12); mr.add_child(mp_bar); mp_lbl = UI.lbl("", 12); mr.add_child(mp_lbl); v.add_child(mr)
	status_lbl = UI.lbl("", 12, Color("#c0ffc0"))
	v.add_child(status_lbl)

func _build_top_right() -> void:
	var p = PanelContainer.new()
	p.name = "TopRight"
	add_child(p)
	var v = UI.vbox(4)
	p.add_child(v)
	map_lbl = UI.lbl("", 14, UI.GOLD)
	v.add_child(map_lbl)
	minimap = Control.new()
	minimap.custom_minimum_size = Vector2(240, 60)
	minimap.draw.connect(_draw_minimap)
	v.add_child(minimap)
	event_lbl = UI.lbl("", 12, Color("#ffb060"), true)
	v.add_child(event_lbl)
	var grid = GridContainer.new()
	grid.columns = 5
	for entry in [["Túi", "inventory"], ["Nhân vật", "character"], ["Kỹ năng", "skills"], ["Nhiệm vụ", "quests"], ["Tu luyện", "cultivation"], ["Bản đồ", "map"], ["Xã hội", "social"], ["Tông môn", "guild"], ["Linh thú", "pets"], ["Động phủ", "housing"], ["Chế tạo", "crafting"], ["Thư", "mail"], ["Xếp hạng", "ranking"], ["Phó bản", "dungeon"], ["Cài đặt", "settings"]]:
		var key: String = entry[1]
		var b = UI.btn(entry[0], func(): panels.open(key))
		b.add_theme_font_size_override("font_size", 12)
		grid.add_child(b)
	v.add_child(grid)

func _build_tracker() -> void:
	tracker = UI.vbox(2)
	tracker.position = Vector2(10, 130)
	tracker.custom_minimum_size = Vector2(300, 0)
	add_child(tracker)

func _build_chat() -> void:
	var p = PanelContainer.new()
	p.name = "Chat"
	var sb = StyleBoxFlat.new(); sb.bg_color = Color(0, 0, 0, 0.35); sb.set_content_margin_all(6); sb.set_corner_radius_all(4)
	p.add_theme_stylebox_override("panel", sb)
	add_child(p)
	var v = UI.vbox(3)
	p.add_child(v)
	chat_log = RichTextLabel.new()
	chat_log.bbcode_enabled = true
	chat_log.scroll_following = true
	chat_log.custom_minimum_size = Vector2(380, 130)
	chat_log.add_theme_font_size_override("normal_font_size", 13)
	chat_log.mouse_filter = Control.MOUSE_FILTER_PASS
	v.add_child(chat_log)
	var h = UI.hbox(4)
	chat_ch_btn = UI.btn("Bản đồ", _cycle_channel, 80)
	h.add_child(chat_ch_btn)
	chat_input = UI.edit("Nhấn Enter để chat (/w Tên để nhắn riêng)")
	chat_input.custom_minimum_size = Vector2(290, 30)
	chat_input.text_submitted.connect(_send_chat)
	h.add_child(chat_input)
	v.add_child(h)

func _cycle_channel() -> void:
	var order = ["map", "world", "party", "guild"]
	var names = {"map": "Bản đồ", "world": "Thế giới", "party": "Tổ đội", "guild": "Tông môn"}
	chat_channel = order[(order.find(chat_channel) + 1) % order.size()]
	chat_ch_btn.text = names[chat_channel]

func _send_chat(text: String) -> void:
	text = text.strip_edges()
	chat_input.text = ""
	chat_input.release_focus()
	if text == "":
		return
	var params = {"ch": chat_channel, "text": text}
	if text.begins_with("/w "):
		var parts = text.substr(3).split(" ", false, 1)
		if parts.size() < 2:
			return
		params = {"ch": "private", "to": parts[0], "text": parts[1]}
	var r = await Net.rpc_call("chat.send", params)
	if not r.ok:
		toast(r.e, "warn")

func _build_hotbar() -> void:
	hotbar_box = UI.hbox(6)
	hotbar_box.name = "Hotbar"
	add_child(hotbar_box)
	var keys = ["J", "K", "L", "U", "I", "O"]
	for i in 6:
		var b = Button.new()
		b.custom_minimum_size = Vector2(56, 56)
		b.focus_mode = Control.FOCUS_NONE
		b.expand_icon = true
		var slot = i
		b.pressed.connect(func(): game.do_attack() if slot == 0 else game.do_skill(slot))
		var k = UI.lbl(keys[i], 11, UI.DIM)
		k.position = Vector2(3, 1)
		b.add_child(k)
		var cd = ColorRect.new()
		cd.color = Color(0, 0, 0, 0.6)
		cd.mouse_filter = Control.MOUSE_FILTER_IGNORE
		cd.size = Vector2(56, 0)
		b.add_child(cd)
		hotbar_box.add_child(b)
		hot_buttons.append({"btn": b, "cd": cd})
	var row = UI.hbox(4)
	row.add_child(UI.btn("Né", func(): game.do_dodge()))
	row.add_child(UI.btn("Đả tọa", func(): game.toggle_meditate()))
	row.add_child(UI.btn("Nhặt", func(): game._auto_pickup(100.0)))
	hotbar_box.add_child(row)

func _build_center() -> void:
	toasts = UI.vbox(2)
	toasts.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(toasts)
	banner_lbl = UI.lbl("", 26, Color("#ffcf60"))
	banner_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(banner_lbl)
	hint_lbl = UI.lbl("", 14, Color("#ffffff"))
	hint_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(hint_lbl)
	progress_bar = UI.bar(Color("#e0c060"), 260, 12)
	progress_bar.visible = false
	add_child(progress_bar)
	tuvi_bar = UI.bar(Color("#a070ff"), 600, 10)
	add_child(tuvi_bar)
	tuvi_lbl = UI.lbl("", 12, Color("#e0d0ff"))
	add_child(tuvi_lbl)
	overlay = UI.lbl("", 22, UI.GOLD)
	overlay.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	overlay.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	add_child(overlay)

func _layout() -> void:
	var s = get_viewport_rect().size
	var tr: Control = get_node("TopRight")
	tr.position = Vector2(s.x - tr.size.x - 10, 10)
	var chat: Control = get_node("Chat")
	chat.position = Vector2(10 + (230 if mobile else 0), s.y - chat.size.y - 26)
	if mobile:
		chat.position = Vector2(s.x / 2 - chat.size.x / 2, 8)
		chat.scale = Vector2(0.8, 0.8)
	hotbar_box.position = Vector2(s.x - hotbar_box.size.x - 12, s.y - hotbar_box.size.y - 26)
	toasts.position = Vector2(s.x / 2 - 220, s.y * 0.22)
	toasts.size = Vector2(440, 0)
	banner_lbl.position = Vector2(0, s.y * 0.14)
	banner_lbl.size = Vector2(s.x, 40)
	hint_lbl.position = Vector2(0, s.y * 0.62)
	hint_lbl.size = Vector2(s.x, 24)
	progress_bar.position = Vector2(s.x / 2 - 130, s.y * 0.68)
	tuvi_bar.position = Vector2(s.x / 2 - 300, s.y - 16)
	tuvi_lbl.position = Vector2(s.x / 2 - 300, s.y - 34)
	overlay.position = Vector2.ZERO
	overlay.size = s
	if joy:
		joy.position = Vector2(30, s.y - 230)

# ---------------- cảm ứng ----------------
func _build_touch() -> void:
	joy = Control.new()
	joy.custom_minimum_size = Vector2(200, 200)
	joy.size = Vector2(200, 200)
	joy.draw.connect(func():
		joy.draw_circle(Vector2(100, 100), 90, Color(1, 1, 1, 0.12))
		joy.draw_arc(Vector2(100, 100), 90, 0, TAU, 32, Color(1, 1, 1, 0.4), 2)
		joy.draw_circle(Vector2(100 + joy_x * 60, 100), 34, Color(1, 1, 1, 0.35)))
	joy.gui_input.connect(_joy_input)
	add_child(joy)
	var acts = UI.vbox(8)
	acts.name = "TouchActs"
	for a in [["Nhảy", func(): game.do_jump()], ["Tương tác", func(): game.do_interact()]]:
		var b = UI.btn(a[0], a[1], 110)
		b.custom_minimum_size.y = 56
		acts.add_child(b)
	acts.position = Vector2(get_viewport_rect().size.x - 130, get_viewport_rect().size.y - 260)
	add_child(acts)

func _joy_input(ev: InputEvent) -> void:
	if ev is InputEventScreenTouch:
		if ev.pressed:
			joy_touch = ev.index
			joy_x = clampf((ev.position.x - 100) / 60.0, -1, 1)
		elif ev.index == joy_touch:
			joy_touch = -1
			joy_x = 0.0
		joy.queue_redraw()
	elif ev is InputEventScreenDrag and ev.index == joy_touch:
		joy_x = clampf((ev.position.x - 100) / 60.0, -1, 1)
		joy.queue_redraw()

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("chat") and not chat_input.has_focus():
		chat_input.grab_focus()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("close"):
		if chat_input.has_focus():
			chat_input.release_focus()
		else:
			panels.close_all()
	elif not typing():
		for pair in [["inventory", "inventory"], ["character", "character"], ["map", "map"], ["quests", "quests"], ["skills", "skills"]]:
			if event.is_action_pressed(pair[0]):
				panels.toggle(pair[1])

func typing() -> bool:
	var f = get_viewport().gui_get_focus_owner()
	return f is LineEdit or f is TextEdit

# ---------------- cập nhật ----------------
func on_map(m: Dictionary, def: Dictionary) -> void:
	var s: Dictionary = m.self
	name_lbl.text = "%s — %s" % [s.name, s.realmName]
	tuvi = float(s.tuVi); tuvi_req = max(1.0, float(s.tuViReq))
	var tags = []
	if def.get("safe", false): tags.append("An toàn")
	if def.get("pvp", "none") == "open": tags.append("PK tự do")
	map_lbl.text = "%s (kênh %d)%s" % [def.get("name", m.map), int(m.ch), ("  [" + ", ".join(tags) + "]") if tags.size() else ""]
	var evs: Array = m.get("events", [])
	event_lbl.text = "\n".join(evs.map(func(e): return "Sự kiện: " + e.name)) if evs.size() else ""
	_refresh_hotbar()
	update_bars()
	refresh_quests()
	panels.refresh_inventory()
	minimap.queue_redraw()
	banner(def.get("name", ""))

func _refresh_hotbar() -> void:
	var hb: Array = game.self_state.get("hotbar", [])
	for i in 6:
		var b: Button = hot_buttons[i].btn
		var sid = str(hb[i]) if i < hb.size() else ""
		b.icon = Assets.skill_icon(sid) if sid != "" else null
		b.tooltip_text = GameData.skills.get(sid, {}).get("name", "") + "\n" + GameData.skills.get(sid, {}).get("desc", "") if sid != "" else "Trống — gán trong bảng Kỹ năng"

func update_bars() -> void:
	hp_bar.max_value = game.mhp; hp_bar.value = game.hp
	mp_bar.max_value = game.mmp; mp_bar.value = game.mp
	hp_lbl.text = "%s/%s" % [GameData.fmt(game.hp), GameData.fmt(game.mhp)]
	mp_lbl.text = "%s/%s" % [GameData.fmt(game.mp), GameData.fmt(game.mmp)]
	var names = {"burn": "Thiêu đốt", "freeze": "Đóng băng", "poison": "Trúng độc", "stun": "Choáng", "slow": "Chậm", "shield": "Khiên", "regen": "Hồi phục", "mark_thunder": "Lôi ấn", "armor_break": "Phá giáp", "atk_up": "Tăng công", "def_up": "Tăng thủ", "speed_up": "Tăng tốc", "tam_ma": "Tâm ma"}
	status_lbl.text = " ".join(game.my_status.map(func(x): return names.get(x, x)))
	tuvi_bar.max_value = tuvi_req; tuvi_bar.value = tuvi
	tuvi_lbl.text = "Tu vi %s / %s (%.1f%%)" % [GameData.fmt(tuvi), GameData.fmt(tuvi_req), 100.0 * tuvi / tuvi_req]

func _process(delta: float) -> void:
	if game == null or not game.ready_world:
		return
	var now = Time.get_ticks_msec()
	var hb: Array = game.self_state.get("hotbar", [])
	for i in range(1, 6):
		var sid = str(hb[i]) if i < hb.size() else ""
		var cd: ColorRect = hot_buttons[i].cd
		if sid != "" and game.cds.has(sid) and now < int(game.cds[sid]):
			var total: float = float(GameData.skills[sid].cooldown) * 1000.0
			cd.size = Vector2(56, 56 * (float(game.cds[sid]) - now) / total)
		else:
			cd.size = Vector2(56, 0)
	if progress_bar.visible:
		progress_t += delta
		progress_bar.value = progress_t / progress_dur * 100.0
		if progress_t >= progress_dur:
			progress_bar.visible = false
			game.channeling = false
	_hint_acc += delta
	if _hint_acc > 0.25:
		_hint_acc = 0.0
		_layout()
		hint_lbl.text = game.nearby_hint()
		minimap.queue_redraw()

func _draw_minimap() -> void:
	if game == null or game.rows.is_empty():
		return
	var rows: Array = game.rows
	var w: int = rows[0].length()
	var h: int = rows.size()
	var sx: float = 240.0 / w
	var sy: float = 60.0 / h
	minimap.draw_rect(Rect2(0, 0, 240, 60), Color(0, 0, 0, 0.5))
	for x in range(0, w, 2):
		for y in range(h / 3, h):
			if rows[y][x] == "#":
				minimap.draw_rect(Rect2(x * sx, y * sy, sx * 2, 60 - y * sy), Color(0.4, 0.6, 0.4, 0.8))
				break
	for p in game.map_def.get("portals", []):
		minimap.draw_circle(Vector2(p.x / 32.0 * sx, 30), 3, Color(0.5, 0.8, 1))
	for n in game.npc_nodes.values():
		minimap.draw_circle(Vector2(n.position.x / 32.0 * sx, n.position.y / 32.0 * sy), 2, Color(1, 0.9, 0.3))
	for e in game.ents.values():
		var col = Color(1, 0.3, 0.3) if e.kind == "m" else Color(0.4, 0.8, 1)
		if e.kind == "m" and e.rank >= 3: col = Color(1, 0, 1)
		minimap.draw_rect(Rect2(e.position.x / 32.0 * sx - 1, e.position.y / 32.0 * sy - 1, 2, 2), col)
	if game.me:
		minimap.draw_circle(Vector2(game.me.position.x / 32.0 * sx, game.me.position.y / 32.0 * sy), 3, Color.WHITE)

func chat_add(m: Dictionary) -> void:
	var col = {"world": "#ffcf60", "map": "#ffffff", "party": "#80c0ff", "guild": "#80ff90", "private": "#ff90e0", "system": "#ff8060"}.get(m.ch, "#ffffff")
	var ch = {"world": "Thế giới", "map": "Bản đồ", "party": "Tổ đội", "guild": "Tông môn", "private": "Riêng", "system": "Hệ thống"}.get(m.ch, m.ch)
	var who: String = str(m.get("from", ""))
	if m.ch == "private" and m.has("to"):
		who = "%s -> %s" % [who, m.to]
	chat_log.append_text("[color=%s][%s] %s: %s[/color]\n" % [col, ch, who.replace("[", "("), str(m.text).replace("[", "(")])

func toast(text: String, kind := "info") -> void:
	var col = {"info": UI.PAPER, "warn": UI.RED, "good": UI.GREEN}.get(kind, UI.PAPER)
	var l = UI.lbl(text, 16, col, true)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toasts.add_child(l)
	while toasts.get_child_count() > 5:
		toasts.get_child(0).free()
	get_tree().create_timer(3.5).timeout.connect(func(): if is_instance_valid(l): l.queue_free())

func banner(text: String) -> void:
	banner_lbl.text = text
	banner_lbl.modulate.a = 1.0
	var tw = create_tween()
	tw.tween_interval(2.0)
	tw.tween_property(banner_lbl, "modulate:a", 0.0, 1.0)

func set_overlay(text: String) -> void:
	overlay.text = text
	overlay.visible = text != ""

func progress(sec: float, text: String) -> void:
	progress_dur = max(0.1, sec); progress_t = 0.0
	progress_bar.visible = true
	toast(text)

func progress_cancel() -> void:
	progress_bar.visible = false

func death_dialog(by: String) -> void:
	close_death()
	var w = UI.window("Tử vong", 380, 160)
	death_panel = w.root
	w.body.add_child(UI.lbl("Bạn đã bị %s đánh bại." % (by if by != "" else "kẻ địch"), 16, UI.PAPER, true))
	var h = UI.hbox()
	h.add_child(UI.btn("Hồi sinh tại thành", func(): _respawn("city")))
	h.add_child(UI.btn("Hồi sinh tại chỗ an toàn", func(): _respawn("here")))
	w.body.add_child(h)
	panels.show_window(w.root, "death")

func _respawn(where: String) -> void:
	var r = await Net.rpc_call("respawn", {"where": where})
	if r.ok:
		game.dead = false
		close_death()
	else:
		toast(r.e, "warn")

func close_death() -> void:
	if death_panel and is_instance_valid(death_panel):
		death_panel.queue_free()
	death_panel = null

func refresh_quests() -> void:
	var r = await Net.rpc_call("quest.list")
	if not r.ok:
		return
	quest_cache = r.d.active
	UI.clear(tracker)
	var shown = 0
	for q in quest_cache:
		if shown >= 4:
			break
		shown += 1
		tracker.add_child(UI.lbl(("[Chính] " if q.kind == "main" else "") + q.name, 14, UI.GOLD))
		for o in q.objectives:
			var done: bool = int(o.v) >= int(o.max)
			tracker.add_child(UI.lbl("  %s %s (%d/%d)" % ["v" if done else "•", o.desc, int(o.v), int(o.max)], 12, UI.GREEN if done else UI.PAPER))
		if q.objectives.all(func(o): return int(o.v) >= int(o.max)):
			tracker.add_child(UI.lbl("  -> Trả cho %s" % q.turnInName, 12, Color("#80d0ff")))
	if shown == 0 and r.d.available.size() > 0:
		var a = r.d.available[0]
		tracker.add_child(UI.lbl("Gợi ý: %s — gặp %s (%s)" % [a.name, a.giverName, a.get("map", "?")], 13, Color("#80d0ff"), true))

# ---------------- sự kiện từ server ----------------
func on_event(m: Dictionary) -> void:
	match m.k:
		"msg": toast(str(m.text), str(m.get("kind", "info")))
		"inv": panels.on_inventory(m)
		"cur":
			wallet.gold = m.gold
			if int(m.get("add", 0)) > 0: Sfx.play("coin", 0.3)
			panels.on_wallet()
		"tuvi":
			tuvi = float(m.v); tuvi_req = max(1.0, float(m.req)); update_bars()
		"self":
			var d: Dictionary = m.d
			name_lbl.text = "%s — %s" % [game.self_state.name, d.realmName]
			tuvi = float(d.tuVi); tuvi_req = max(1.0, float(d.tuViReq)); update_bars()
			game.self_state.merge(d, true)
		"quest", "questAccepted": refresh_quests()
		"skills": _refresh_hotbar(); panels.refresh_if_open("skills")
		"party": panels.party = m.d; panels.refresh_if_open("social")
		"partyReq": panels.confirm("%s mời bạn vào tổ đội" % m.from, func(ok): Net.rpc_call("party.respond", {"from": m.fromId, "accept": ok}))
		"friendReq": panels.confirm("%s muốn kết bạn" % m.from, func(ok): Net.rpc_call("friend.respond", {"from": m.fromId, "accept": ok}))
		"guildReq": panels.confirm("%s mời bạn gia nhập tông môn %s" % [m.from, m.guild], func(ok): Net.rpc_call("guild.respond", {"accept": ok}))
		"duelReq": panels.confirm("%s mời bạn tỉ thí" % m.from, func(ok): Net.rpc_call("duel.respond", {"from": m.fromId, "accept": ok}))
		"tradeReq": panels.confirm("%s muốn giao dịch" % m.from, func(ok): Net.rpc_call("trade.respond", {"from": m.fromId, "accept": ok}))
		"trade": panels.trade_window(m.d)
		"tradeEnd": panels.close_named("trade"); toast(str(m.reason))
		"duel": banner("Tỉ thí: %s vs %s" % [m.a, m.b])
		"guild": game.self_state.guild = m.d; panels.refresh_if_open("guild")
		"mail": toast("Bạn có thư mới: %s" % m.subject, "good")
		"friend": toast("%s %s" % [m.name, "đã trực tuyến" if m.online else "đã ngoại tuyến"])
		"arena": banner("Đấu trường: đối thủ %s — bắt đầu sau 3 giây" % m.vs)
		"arenaEnd": banner("THẮNG!" if m.win else ("HÒA" if m.draw else "THUA")); toast("Điểm đấu trường: %d" % int(m.rating))
		"dungeonEnd": banner("Phó bản hoàn thành!" if m.ok else "Phó bản thất bại: %s" % str(m.get("reason", "")))
		"trial": banner(str(m.text))
		"breakthrough": panels.refresh_if_open("cultivation")
		"combo": pass
		"house": panels.house_state = m.d
