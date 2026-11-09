extends Node2D
## Thế giới game: dựng bản đồ từ lưới server gửi, dự đoán chuyển động người chơi, đồng bộ thực thể, hiệu ứng.

const TILE := 32.0
const SEND_HZ := 15.0

var main
var hud
var map_root = Node2D.new()
var tilemap = TileMapLayer.new()
var ent_root = Node2D.new()
var fx = Fx.new()
var cam = Camera2D.new()
var parallax: ParallaxBackground
var canvas_mod = CanvasModulate.new()
var weather: CPUParticles2D

var rows: Array = []
var map_def = {}
var map_id = ""
var map_key = ""
var instance_kind = null
var ents = {}
var drops = {}
var npc_nodes = {}
var markers: Array = []
var me: EntityView
var body = {"x": 0.0, "y": 0.0, "vx": 0.0, "vy": 0.0, "w": 26.0, "h": 58.0, "on_ground": false}
var facing = 1
var self_state = {}
var stats = {}
var hp = 1.0
var mhp = 1.0
var mp = 0.0
var mmp = 1.0
var my_status: Array = []
var seq = 0
var send_acc = 0.0
var cds = {}
var dodge_until = 0
var dodge_cd = 0
var drop_through_until = 0
var anim_override = ""
var anim_until = 0
var dead = false
var meditating = false
var channeling = false
var kb = Vector2.ZERO
var ready_world = false
var pickup_acc = 0.0
var started_at = 0
var autotest_done = false

func start(char_id: int) -> void:
	started_at = Time.get_ticks_msec()
	add_child(canvas_mod)
	add_child(map_root)
	map_root.add_child(tilemap)
	add_child(ent_root)
	add_child(fx)
	cam.position_smoothing_enabled = true
	cam.position_smoothing_speed = 8.0
	hud = preload("res://scripts/ui/hud.gd").new()
	hud.game = self
	var layer = CanvasLayer.new()
	layer.layer = 5
	add_child(layer)
	hud.theme = UI.theme()
	hud.set_anchors_preset(Control.PRESET_FULL_RECT)
	layer.add_child(hud)
	Net.message.connect(_on_msg)
	Net.game_disconnected.connect(_on_disconnect)
	Net.connect_game(char_id)
	hud.set_overlay("Đang vào thế giới...")

func _exit_tree() -> void:
	if Net.message.is_connected(_on_msg):
		Net.message.disconnect(_on_msg)
	if Net.game_disconnected.is_connected(_on_disconnect):
		Net.game_disconnected.disconnect(_on_disconnect)

func _on_disconnect(code: int, _reason: String) -> void:
	if code == 4001 or code == 4002 or code == 4004:
		return
	hud.set_overlay("Mất kết nối — đang kết nối lại...")

# ======================= BẢN ĐỒ =======================
func _build_map(m: Dictionary) -> void:
	ready_world = false
	for c in map_root.get_children():
		if c != tilemap:
			c.queue_free()
	for e in ents.values():
		e.queue_free()
	ents.clear()
	for d in drops.values():
		d.queue_free()
	drops.clear()
	npc_nodes.clear()
	markers.clear()
	rows = m.grid
	map_id = m.map
	map_key = m.key
	instance_kind = m.get("inst")
	map_def = GameData.maps.get(map_id, {})
	var w: int = rows[0].length()
	var h: int = rows.size()
	var theme: String = map_def.get("theme", "village")
	# tileset dựng lúc chạy từ atlas 8 ô
	var ts = TileSet.new()
	ts.tile_size = Vector2i(32, 32)
	var src = TileSetAtlasSource.new()
	src.texture = Assets.tex("res://assets/tiles/%s.png" % theme)
	src.texture_region_size = Vector2i(32, 32)
	for i in 8:
		src.create_tile(Vector2i(i, 0))
	ts.add_source(src, 0)
	tilemap.tile_set = ts
	tilemap.clear()
	tilemap.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	for y in h:
		var row: String = rows[y]
		for x in w:
			var c = row[x]
			if c == "#":
				var below = rows[y + 1][x] if y + 1 < h else "#"
				var above = rows[y - 1][x] if y > 0 else "."
				if below != "#" and y < h / 2:
					tilemap.set_cell(Vector2i(x, y), 0, Vector2i(7, 0))
				elif above != "#":
					tilemap.set_cell(Vector2i(x, y), 0, Vector2i(0, 0))
				else:
					tilemap.set_cell(Vector2i(x, y), 0, Vector2i(1, 0))
			elif c == "=":
				tilemap.set_cell(Vector2i(x, y), 0, Vector2i(2, 0))
			elif y + 1 < h and rows[y + 1][x] == "#" and x > 1 and x < w - 2:
				var hsh = (x * 73856093) ^ (y * 19349663) ^ map_id.hash()
				if abs(hsh) % 100 < 22:
					tilemap.set_cell(Vector2i(x, y), 0, Vector2i(3 + abs(hsh / 100) % 4, 0))
	# lấp thêm đất bên dưới (chỉ hiển thị) để màn hình cao hơn bản đồ không bị trống
	for y in range(h, h + 12):
		for x in w:
			tilemap.set_cell(Vector2i(x, y), 0, Vector2i(1, 0))
	_build_parallax(theme, w, h)
	# NPC
	for n in map_def.get("npcs", []):
		var npc = GameData.npcs.get(n.npc)
		if npc == null:
			continue
		var ls = LayeredSprite.new()
		ls.set_appearance(npc.appearance)
		ls.position = Vector2(n.x, _ground_y(n.x))
		ls.set_facing(-1 if n.x > w * TILE / 2 else 1)
		var lab = UI.lbl("%s\n%s" % [npc.title, npc.name], 12, Color("#ffe8a0"))
		lab.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lab.position = Vector2(-90, -132)
		lab.size = Vector2(180, 36)
		ls.add_child(lab)
		map_root.add_child(ls)
		ls.set_meta("day_x", float(n.x))
		ls.set_meta("night_x", float(n.get("nightX", n.x)))
		npc_nodes[n.npc] = ls
	for p in map_def.get("portals", []):
		var mk = Marker.new()
		mk.kind = "portal"; mk.id = p.id; mk.data = p
		mk.label_text = "-> " + GameData.maps.get(p.to, {}).get("name", p.to)
		mk.position = Vector2(p.x, _ground_y(p.x))
		map_root.add_child(mk); markers.append(mk)
	for nd in map_def.get("nodes", []):
		var mk2 = Marker.new()
		mk2.kind = "node"; mk2.id = nd.id; mk2.data = nd
		var icon_item = "herb_t1" if nd.kind == "herb" else ("ore_t1" if nd.kind == "ore" else "fish_t1")
		mk2.icon = Assets.item_icon(icon_item)
		mk2.label_text = {"herb": "Linh thảo", "ore": "Mỏ quặng", "fishing": "Điểm câu cá"}.get(nd.kind, "")
		mk2.position = Vector2(nd.x, _ground_y(nd.x))
		if m.get("nodes", {}).has(nd.id):
			mk2.ready_at = Time.get_ticks_msec() + int(m.nodes[nd.id])
		map_root.add_child(mk2); markers.append(mk2)
	for it in map_def.get("interacts", []):
		var mk3 = Marker.new()
		mk3.kind = "interact"; mk3.id = it.id; mk3.data = it; mk3.label_text = it.name
		mk3.position = Vector2(it.x, _ground_y(it.x))
		map_root.add_child(mk3); markers.append(mk3)
	# người chơi
	if me:
		me.queue_free()
	me = EntityView.new()
	me.is_self = true
	self_state = m.self
	me.setup({"i": m.self.id, "k": "p", "x": m.x, "y": m.y, "n": m.self.name, "ap": m.self.appearance, "hp": m.self.hp, "mhp": m.self.stats.maxHp})
	ent_root.add_child(me)
	if cam.get_parent():
		cam.get_parent().remove_child(cam)
	me.add_child(cam)
	cam.limit_left = 0
	cam.limit_top = 0
	cam.limit_right = int(w * TILE)
	cam.limit_bottom = int(max(h * TILE, get_viewport_rect().size.y))
	cam.make_current()
	cam.reset_smoothing()
	body.x = float(m.x); body.y = float(m.y); body.vx = 0.0; body.vy = 0.0
	stats = m.self.stats
	hp = float(m.self.hp); mhp = float(stats.maxHp); mp = float(m.self.mp); mmp = float(stats.maxMp)
	dead = hp <= 0
	meditating = false
	body.w = GameData.physics.playerW
	body.h = GameData.physics.playerH
	_setup_ambience()
	Sfx.play_bgm(map_def.get("bgm", "bgm_village"))
	hud.on_map(m, map_def)
	ready_world = true
	if Config.autotest and not autotest_done:
		autotest_done = true
		_autotest.call_deferred()

func _ground_y(x: float) -> float:
	var tx = clampi(int(x / TILE), 0, rows[0].length() - 1)
	for y in rows.size():
		if rows[y][tx] == "#" and (y == 0 or rows[y - 1][tx] != "#") and y > rows.size() / 3:
			return y * TILE
	return (rows.size() - 4) * TILE

func _build_parallax(theme: String, w: int, h: int) -> void:
	if parallax:
		parallax.queue_free()
	parallax = ParallaxBackground.new()
	add_child(parallax)
	var scales = [Vector2(0.02, 0.0), Vector2(0.15, 0.05), Vector2(0.4, 0.1)]
	for l in 3:
		var pl = ParallaxLayer.new()
		pl.motion_scale = scales[l]
		pl.motion_mirroring = Vector2(1280, 0)
		var s = Sprite2D.new()
		s.texture = Assets.tex("res://assets/parallax/%s_%d.png" % [theme, l])
		s.centered = false
		s.scale = Vector2(2, 2)
		s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		s.position = Vector2(0, h * TILE - 720 - (40 if l == 2 else 0))
		pl.add_child(s)
		parallax.add_child(pl)

func _setup_ambience() -> void:
	if weather:
		weather.queue_free()
		weather = null
	var wt: String = map_def.get("weather", "clear")
	if wt != "clear":
		weather = CPUParticles2D.new()
		weather.amount = 120
		weather.lifetime = 3.0
		weather.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
		weather.emission_rect_extents = Vector2(800, 10)
		weather.position = Vector2(0, -420)
		weather.direction = Vector2(0, 1)
		weather.spread = 10
		weather.gravity = Vector2(0, 60)
		match wt:
			"rain", "storm":
				weather.color = Color(0.7, 0.8, 1, 0.6); weather.initial_velocity_min = 500; weather.initial_velocity_max = 700; weather.scale_amount_min = 1.5; weather.amount = 220 if wt == "storm" else 150
			"snow":
				weather.color = Color(1, 1, 1, 0.9); weather.initial_velocity_min = 40; weather.initial_velocity_max = 80; weather.scale_amount_min = 2; weather.scale_amount_max = 3
			"petals":
				weather.color = Color(1, 0.7, 0.85, 0.9); weather.initial_velocity_min = 30; weather.initial_velocity_max = 60; weather.scale_amount_min = 2; weather.scale_amount_max = 3; weather.amount = 50
			"ash":
				weather.color = Color(0.6, 0.55, 0.55, 0.7); weather.initial_velocity_min = 20; weather.initial_velocity_max = 50; weather.scale_amount_min = 1.5; weather.amount = 80
			"mist":
				weather.color = Color(1, 1, 1, 0.08); weather.initial_velocity_min = 10; weather.initial_velocity_max = 20; weather.scale_amount_min = 40; weather.scale_amount_max = 70; weather.amount = 30; weather.lifetime = 6.0
		cam.add_child(weather)
	_update_daynight()

func _update_daynight() -> void:
	if not map_def.get("dayNight", false):
		canvas_mod.color = Color(0.85, 0.85, 1.0) if map_def.get("weather", "") in ["storm", "ash"] else Color.WHITE
		return
	# chu kỳ ngày đêm 24 phút thực
	var t = fmod(Time.get_unix_time_from_system() / 60.0, 24.0) / 24.0
	var day = 0.5 + 0.5 * cos((t - 0.5) * TAU)
	canvas_mod.color = Color(0.55, 0.55, 0.8).lerp(Color.WHITE, clampf(day * 1.4, 0.0, 1.0))

# ======================= MẠNG =======================
func _on_msg(m: Dictionary) -> void:
	match m.get("t", ""):
		"map":
			hud.set_overlay("")
			_build_map(m)
		"snap":
			if ready_world:
				_on_snap(m)
		"corr":
			body.x = float(m.x); body.y = float(m.y); body.vy = 0.0; body.vx = 0.0
			if me: me.position = Vector2(body.x, body.y)
		"ev":
			_on_event(m)
		"chat":
			hud.chat_add(m)
		"kick":
			hud.set_overlay("Bị ngắt kết nối: %s" % m.reason)
			await get_tree().create_timer(2.5).timeout
			Net.disconnect_game()
			main.show_login()
		"authErr":
			hud.set_overlay(str(m.e))

func _on_snap(m: Dictionary) -> void:
	for e in m.e:
		var id: String = e.i
		if e.k == "d":
			if not drops.has(id):
				var mk = Marker.new()
				mk.kind = "drop"; mk.id = id
				mk.data = {"item": e.s, "qty": int(e.get("n", "1")), "rarity": GameData.items.get(e.s, {}).get("rarity", 0)}
				mk.icon = Assets.item_icon(e.s)
				mk.position = Vector2(e.x, e.y)
				ent_root.add_child(mk)
				drops[id] = mk
			continue
		if ents.has(id):
			ents[id].apply(e)
		elif e.has("n"):
			var v = EntityView.new()
			v.setup(e)
			ent_root.add_child(v)
			ents[id] = v
	for g in m.gone:
		if ents.has(g):
			ents[g].queue_free(); ents.erase(g)
		elif drops.has(g):
			drops[g].queue_free(); drops.erase(g)
	if m.get("me") != null:
		var s: Dictionary = m.me
		hp = float(s.hp); mhp = float(s.mhp); mp = float(s.mp); mmp = float(s.mmp); my_status = s.st
		me.hp = hp; me.mhp = mhp; me.status = my_status
		hud.update_bars()

func _view(id: String) -> Node2D:
	if me and id == me.id:
		return me
	return ents.get(id)

func _on_event(m: Dictionary) -> void:
	var k: String = m.get("k", "")
	match k:
		"dmg":
			var v = _view(m.i)
			if v:
				var is_me: bool = v == me
				fx.number(v.position + Vector2(0, -70), int(m.v), int(m.c) == 1, "self" if is_me else ("dot" if int(m.get("d", 0)) == 1 else "dmg"))
				v.flash = 0.08
				if v is EntityView:
					v.hp = float(m.get("hp", v.hp)); v.queue_redraw()
				Sfx.play("crit" if int(m.c) == 1 else ("hit" if is_me else "monster_hit"), 0.6)
				if is_me:
					hp = float(m.get("hp", hp)); hud.update_bars()
		"heal":
			var v2 = _view(m.i)
			if v2 and int(m.v) > 0:
				fx.number(v2.position + Vector2(0, -70), int(m.v), false, "heal")
		"fx":
			var v3 = _view(m.i)
			var pos = v3.position if v3 else Vector2(m.x, m.y)
			fx.skill(pos, int(m.f), m.s)
			var sk = GameData.skills.get(m.s, {})
			Sfx.play({"loi": "thunder", "hoa": "fire", "bang": "ice", "doc": "poison", "phap": "magic", "phu": "magic", "tran": "magic"}.get(sk.get("path", ""), "slash"), 0.5)
			if v3 and v3 != me and v3.sprite:
				v3.sprite.call("play", sk.get("anim", "attack"))
		"tele":
			fx.telegraph(Vector2(m.x, m.y), float(m.r), float(m.d) / 1000.0, fx.color_for(m.get("s", "")).lerp(Color(1, 0.2, 0.2), 0.5))
		"boom":
			fx.boom(Vector2(m.x, m.y), float(m.r), fx.color_for(m.get("s", "")))
			Sfx.play("thunder" if "lightning" in str(m.get("s", "")) else "magic", 0.6)
		"zone":
			fx.zone(Vector2(m.x, m.y), float(m.r), float(m.d) / 1000.0, fx.color_for(m.get("s", "")))
		"wind":
			var vw = _view(m.i)
			if vw and vw.sprite:
				vw.sprite.call("play", "attack")
		"die":
			var vd = _view(m.i)
			if vd and vd != me:
				vd.dead = true
				if vd.sprite: vd.sprite.call("play", "death")
				if vd.kind == "m": Sfx.play("monster_die", 0.6)
		"st":
			var vs = _view(m.i)
			if vs and vs is EntityView: vs.status = m.st
			if vs == me: my_status = m.st; hud.update_bars()
		"pick":
			if drops.has(m.i):
				drops[m.i].queue_free(); drops.erase(m.i)
			if me and m.by == me.id: Sfx.play("pickup")
		"node":
			for mk in markers:
				if mk.kind == "node" and mk.id == m.id:
					mk.ready_at = Time.get_ticks_msec() + int(m.d)
		"kb":
			kb = Vector2(float(m.vx), 0)
			body.vy = float(m.vy)
		"med":
			meditating = bool(m.on)
		"chan":
			channeling = true
			hud.progress(float(m.d) / 1000.0, "Đang khai thác..." if m.kind == "gather" else "Đang vận công...")
		"chanx":
			channeling = false
			hud.progress_cancel()
		"dead":
			dead = true
			hud.death_dialog(str(m.get("by", "")))
		"revive":
			if me and m.i == me.id:
				dead = false
				hud.close_death()
		"say":
			hud.banner(str(m.text))
			Sfx.play("boss_roar", 0.7)
		"lvl":
			var vl = _view(m.i)
			if vl:
				fx.text(vl.position + Vector2(0, -110), "TINH TIẾN: " + str(m.lv), Color(1, 0.9, 0.4))
			if vl == me: Sfx.play("levelup")
		"breakthrough":
			Sfx.play("breakthrough" if m.ok else "hit")
			if m.ok and me:
				fx.text(me.position + Vector2(0, -130), "ĐỘT PHÁ — " + str(m.name), Color(1, 0.85, 0.3), 3.0)
			hud.on_event(m)
		"trial":
			if m.stage == "thien_kiep": Sfx.play("tribulation")
			hud.on_event(m)
		"self":
			stats = m.d.stats
			if me and m.d.has("appearance"):
				(me.sprite as LayeredSprite).set_appearance(m.d.appearance)
			hud.on_event(m)
		"skills":
			self_state.skills = m.skills
			self_state.hotbar = m.hotbar
			hud.on_event(m)
		_:
			hud.on_event(m)

# ======================= ĐIỀU KHIỂN NGƯỜI CHƠI =======================
func _now() -> int:
	return Time.get_ticks_msec()

func _physics_process(delta: float) -> void:
	if not ready_world or me == null:
		return
	var P: Dictionary = GameData.physics
	var dir = 0.0
	if not hud.typing():
		dir = Input.get_axis("move_left", "move_right")
	dir = clampf(dir + hud.joy_x, -1.0, 1.0)
	var disabled = "stun" in my_status or "freeze" in my_status
	if dead or disabled or channeling:
		dir = 0.0
	if meditating and abs(dir) > 0.1:
		meditating = false
		Net.rpc_call("cult.meditate", {"on": false})
	var speed: float = float(P.runSpeed) * float(stats.get("moveSpeed", 1.0))
	if _now() < dodge_until:
		body.vx = facing * float(P.dodgeSpeed)
	else:
		body.vx = dir * speed + kb.x
	kb.x = move_toward(kb.x, 0.0, 900 * delta)
	if dir != 0.0:
		facing = 1 if dir > 0 else -1
	var drop = _now() < drop_through_until
	TilePhysics.move_body(rows, body, delta, float(P.gravity), float(P.maxFall), drop)
	if body.y > rows.size() * TILE + 64:
		body.y = _ground_y(body.x); body.vy = 0
	me.position = Vector2(round(body.x), round(body.y))
	me.target = me.position
	var anim = "idle"
	if dead:
		anim = "death"
	elif _now() < anim_until:
		anim = anim_override
	elif meditating:
		anim = "meditate"
	elif channeling:
		anim = "cast"
	elif not body.on_ground:
		anim = "jump" if body.vy < 0 else "fall"
	elif abs(body.vx) > 5:
		anim = "run"
	var ls: LayeredSprite = me.sprite
	ls.play(anim)
	ls.set_facing(facing)
	send_acc += delta
	if send_acc >= 1.0 / SEND_HZ:
		send_acc = 0.0
		seq += 1
		Net.send({"t": "input", "seq": seq, "x": snappedf(body.x, 0.01), "y": snappedf(body.y, 0.01), "vx": snappedf(body.vx, 0.1), "vy": snappedf(body.vy, 0.1), "f": facing, "g": body.on_ground, "a": anim if anim in ["idle", "run", "jump", "fall"] else "idle"})
	pickup_acc += delta
	if pickup_acc > 0.4:
		pickup_acc = 0.0
		_auto_pickup(40.0)
	if Engine.get_physics_frames() % 600 == 0:
		_update_daynight()
	if Engine.get_physics_frames() % 120 == 0:
		# lịch trình NPC: một số NPC về quán trọ ban đêm (đồng bộ công thức với server)
		var hour := int(fmod(Time.get_unix_time_from_system() / 60.0, 24.0))
		var night := hour >= 20 or hour < 5
		for n in npc_nodes.values():
			var tx: float = n.get_meta("night_x") if night else n.get_meta("day_x")
			if abs(n.position.x - tx) > 1:
				n.position.x = move_toward(n.position.x, tx, 4.0)

func _unhandled_input(event: InputEvent) -> void:
	if not ready_world or hud.typing():
		return
	if event.is_action_pressed("jump"): do_jump()
	elif event.is_action_pressed("attack"): do_attack()
	elif event.is_action_pressed("dodge"): do_dodge()
	elif event.is_action_pressed("interact"): do_interact()
	elif event.is_action_pressed("pickup"): _auto_pickup(100.0)
	elif event.is_action_pressed("cultivate"): toggle_meditate()
	else:
		for i in range(1, 6):
			if event.is_action_pressed("skill_%d" % i):
				do_skill(i)

func do_jump() -> void:
	if dead or channeling:
		return
	if Input.is_action_pressed("down") and body.on_ground:
		drop_through_until = _now() + 250
		return
	if body.on_ground:
		body.vy = -float(GameData.physics.jumpVelocity)
		Sfx.play("jump", 0.4)

func do_attack() -> void:
	if dead:
		return
	Net.send({"t": "atk", "seq": seq})
	anim_override = "attack"; anim_until = _now() + 280
	if meditating: meditating = false

func do_skill(slot: int) -> void:
	var hb: Array = self_state.get("hotbar", [])
	if slot >= hb.size() or str(hb[slot]) == "" or dead:
		return
	var sid: String = hb[slot]
	if _now() < int(cds.get(sid, 0)):
		return
	var sk = GameData.skills.get(sid)
	if sk == null:
		return
	cds[sid] = _now() + int(float(sk.cooldown) * 1000)
	var target = _nearest_monster(600)
	var msg = {"t": "skill", "seq": seq, "s": sid}
	if target:
		msg["tx"] = target.position.x
	Net.send(msg)
	anim_override = sk.anim; anim_until = _now() + 350
	meditating = false

func do_dodge() -> void:
	if dead or _now() < dodge_cd:
		return
	dodge_until = _now() + int(float(GameData.physics.dodgeTime) * 1000)
	dodge_cd = _now() + 1200
	Net.send({"t": "dodge", "seq": seq})

func toggle_meditate() -> void:
	var r = await Net.rpc_call("cult.meditate", {"on": not meditating})
	if r.ok:
		meditating = r.d.on
	else:
		hud.toast(r.e, "warn")

func _nearest_monster(rng: float) -> EntityView:
	var best: EntityView = null
	var bd = rng
	for e in ents.values():
		if e.kind == "m" and not e.dead:
			var d: float = abs(e.position.x - me.position.x)
			if d < bd:
				bd = d; best = e
	return best

func do_interact() -> void:
	if dead:
		return
	var px = me.position.x
	var best_npc = ""
	var bd = 130.0
	for npc_id in npc_nodes:
		var d: float = abs(npc_nodes[npc_id].position.x - px)
		if d < bd:
			bd = d; best_npc = npc_id
	if best_npc != "":
		hud.panels.npc_dialog(best_npc)
		return
	for mk in markers:
		if abs(mk.position.x - px) > 80:
			continue
		match mk.kind:
			"portal":
				use_portal(mk.id, false)
				return
			"interact":
				var r2 = await Net.rpc_call("interact.use", {"id": mk.id})
				hud.toast(r2.d.text if r2.ok else r2.e, "info" if r2.ok else "warn")
				if r2.ok and r2.d.has("rewards"): hud.refresh_quests()
				return
			"node":
				var r3 = await Net.rpc_call("gather.start", {"node": mk.id})
				if not r3.ok: hud.toast(r3.e, "warn")
				return
	hud.toast("Không có gì để tương tác gần đây", "info")

## Cổng dịch chuyển: server trả cảnh báo nếu khu vực vượt cảnh giới khuyến nghị — người chơi xác nhận mới vào
func use_portal(id: String, force: bool) -> void:
	var r = await Net.rpc_call("portal.use", {"id": id, "force": force})
	if not r.ok:
		hud.toast(r.e, "warn")
	elif r.d.has("warn"):
		hud.panels.confirm(str(r.d.warn), func(ok): if ok: use_portal(id, true))

func _auto_pickup(rng: float) -> void:
	if me == null:
		return
	for id in drops.keys():
		var d: Marker = drops[id]
		if abs(d.position.x - me.position.x) < rng and abs(d.position.y - me.position.y) < 120 and not d.data.get("trying", false):
			d.data["trying"] = true
			var r = await Net.rpc_call("inv.pickup", {"id": id})
			if r.ok:
				hud.toast("Nhặt được %s x%d" % [GameData.item_name(r.d.item), int(r.d.qty)], "good")
			elif is_instance_valid(d):
				d.data["trying"] = false

func nearby_hint() -> String:
	if me == null:
		return ""
	var px = me.position.x
	for npc_id in npc_nodes:
		if abs(npc_nodes[npc_id].position.x - px) < 130:
			return "[E] Nói chuyện: " + GameData.npcs[npc_id].name
	for mk in markers:
		if abs(mk.position.x - px) < 80:
			return "[E] " + {"portal": "Dịch chuyển", "interact": "Điều tra", "node": "Khai thác"}.get(mk.kind, "") + (": " + mk.label_text if mk.label_text != "" else "")
	return ""

# ======================= TỰ KIỂM THỬ =======================
## Kịch bản tự động (--autotest): đi bộ, đánh, nói chuyện NPC, nhận nhiệm vụ, mở túi, rồi thoát với mã 0.
func _autotest() -> void:
	var log = func(s): print("[AUTOTEST] ", s)
	log.call("vào bản đồ %s tại (%d,%d)" % [map_id, int(body.x), int(body.y)])
	await get_tree().create_timer(1.0).timeout
	var tx: float = 0.0
	for n in map_def.npcs:
		if n.npc == "npc_father":
			tx = n.x
	var t0 = _now()
	while abs(body.x - tx) > 40 and _now() - t0 < 15000:
		Input.action_press("move_right" if tx > body.x else "move_left")
		await get_tree().physics_frame
	Input.action_release("move_right"); Input.action_release("move_left")
	log.call("đã đi tới NPC, x=%d" % int(body.x))
	var r = await Net.rpc_call("npc.talk", {"npc": "npc_father"})
	log.call("npc.talk ok=%s offers=%s" % [str(r.ok), str(r.d.offer.size() if r.ok else 0)])
	var r2 = await Net.rpc_call("quest.accept", {"id": "mq_1_01"})
	log.call("quest.accept ok=%s" % str(r2.ok))
	do_attack()
	await get_tree().create_timer(0.5).timeout
	do_jump()
	await get_tree().create_timer(0.8).timeout
	hud.panels.open("inventory")
	await get_tree().create_timer(1.0).timeout
	var inv = await Net.rpc_call("inv.list")
	log.call("inv.list ok=%s bag=%d" % [str(inv.ok), inv.d.bag.size() if inv.ok else -1])
	var ql = await Net.rpc_call("quest.list")
	log.call("quest.list active=%d" % (ql.d.active.size() if ql.ok else -1))
	# mở các bảng phiên 2 để bắt lỗi runtime GDScript
	for pn in ["ranking", "power", "map"]:
		hud.panels.open(pn)
		await get_tree().create_timer(0.8).timeout
	hud.panels._ranking("achievements")
	await get_tree().create_timer(0.8).timeout
	var st = await Net.rpc_call("rank.strongest")
	log.call("rank.strongest ok=%s top=%d" % [str(st.ok), st.d.top.size() if st.ok else -1])
	hud.panels.close_all()
	var passed: bool = r.ok and r2.ok and inv.ok and ql.ok and st.ok and ents.size() >= 0
	log.call("FPS=%d entities=%d drops=%d" % [Engine.get_frames_per_second(), ents.size(), drops.size()])
	log.call("KẾT QUẢ: %s" % ("PASS" if passed else "FAIL"))
	if not OS.has_feature("web"):
		await get_tree().create_timer(0.5).timeout
		get_tree().quit(0 if passed else 1)
