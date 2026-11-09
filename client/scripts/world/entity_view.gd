class_name EntityView
extends Node2D
## Thực thể đồng bộ từ server: nội suy vị trí, thanh máu, tên, trạng thái.

var id = ""
var kind = ""
var sprite: Node2D
var target = Vector2.ZERO
var hp = 1.0
var mhp = 1.0
var ename = ""
var label: Label
var status: Array = []
var rank = 0
var dead = false
var is_self = false
var extra = ""   # realm / sprite / item
var flash = 0.0
var data = {}

const STATUS_TINT := {"burn": Color(1, 0.6, 0.4), "freeze": Color(0.6, 0.85, 1), "poison": Color(0.6, 1, 0.5), "stun": Color(1, 1, 0.6), "shield": Color(1, 0.95, 0.7), "tam_ma": Color(0.8, 0.5, 0.9)}

func setup(e: Dictionary) -> void:
	id = e.i
	kind = e.k
	ename = str(e.get("n", ""))
	position = Vector2(e.x, e.y)
	target = position
	match kind:
		"p", "e":
			var ls = LayeredSprite.new()
			var ap = e.get("ap")
			if kind == "e":
				ap = GameData.npcs.get(e.get("s", ""), {}).get("appearance", {})
			ls.set_appearance(ap if ap is Dictionary else {})
			sprite = ls
		"m":
			rank = int(e.get("r", 0))
			var mid = str(e.get("lv", ""))
			var def = GameData.monsters.get(mid, {})
			if e.get("s", "") in ["bandit", "shadow_self"]:
				var ls2 = LayeredSprite.new()
				ls2.set_appearance({"gender": "male", "hair": 0, "hairColor": "#2a2a2a", "face": 3, "eyes": 0, "skin": "#c58c5c", "outfit": 3, "outfitColor": "#4a3a3a", "weapon": "wpn_saber_1"} if e.s == "bandit" else {"gender": "male", "hair": 3, "hairColor": "#4a0a2a", "face": 3, "eyes": 2, "skin": "#6a5a7a", "outfit": 2, "outfitColor": "#2a0a2a", "weapon": "wpn_sword_4"})
				if rank >= 3:
					ls2.scale = Vector2(1.6, 1.6)
				sprite = ls2
			else:
				var ms = MonsterSprite.new()
				ms.setup(str(e.get("s", "slime")), mid, float(def.get("w", 40)), float(def.get("h", 44)), rank)
				sprite = ms
		"pet":
			var ps = MonsterSprite.new()
			ps.setup(str(e.get("s", "fox")), str(e.get("s", "fox")) + "_pet", 34, 34, 0)
			sprite = ps
	if sprite:
		add_child(sprite)
	label = Label.new()
	label.add_theme_font_size_override("font_size", 12)
	label.add_theme_color_override("font_outline_color", Color.BLACK)
	label.add_theme_constant_override("outline_size", 3)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.size = Vector2(200, 18)
	add_child(label)
	_update_label(e)
	apply(e)

func _update_label(e: Dictionary) -> void:
	var col = Color.WHITE
	var txt = ename
	if kind == "m":
		col = [Color(1, 1, 1), Color(1, 0.85, 0.4), Color(0.4, 1, 1), Color(1, 0.4, 0.4), Color(1, 0.3, 0.9), Color(1, 0.4, 0.4), Color(1, 0.6, 0.2), Color(1, 0.5, 0.5)][clampi(rank, 0, 7)]
	elif kind == "p":
		col = Color(0.6, 0.9, 1) if not is_self else Color(1, 0.95, 0.6)
		var ap = e.get("ap", {})
		if ap is Dictionary and ap.get("title") != null:
			txt = "[%s]\n%s" % [ap.title, ename]
		if e.get("g") != null:
			txt += " [%s]" % e.g
	elif kind == "pet" or kind == "e":
		col = Color(0.7, 1, 0.7)
	label.text = txt
	label.add_theme_color_override("font_color", col)
	var top = 100.0
	if sprite is MonsterSprite:
		top = (sprite as MonsterSprite).spr.scale.y * (sprite as MonsterSprite).size * 0.9 + 12
	label.position = Vector2(-100, -top - (14 if "\n" in txt else 0))

func apply(e: Dictionary) -> void:
	if e.has("x"):
		target = Vector2(e.x, e.y)
	if e.has("hp"): hp = float(e.hp)
	if e.has("mhp"): mhp = max(1.0, float(e.mhp))
	if e.has("n") and str(e.n) != ename:
		ename = str(e.n); _update_label(e)
	if e.has("ap") and kind == "p" and sprite is LayeredSprite:
		(sprite as LayeredSprite).set_appearance(e.ap); _update_label(e)
	status = e.get("st", [])
	if e.has("f") and sprite:
		sprite.call("set_facing", int(e.f))
	if e.has("a") and sprite:
		var a = str(e.a)
		if kind == "m" and a == "run": a = "move"
		sprite.call("play", a)
		dead = a == "death"
	queue_redraw()

func _process(delta: float) -> void:
	if not is_self:
		var d = target - position
		if d.length() > 400:
			position = target
		else:
			position += d * min(1.0, delta * 12.0)
	if flash > 0:
		flash -= delta
	var tint = Color.WHITE
	for s in status:
		if STATUS_TINT.has(s):
			tint = tint * STATUS_TINT[s]
	if flash > 0:
		tint = Color(2, 2, 2)
	if sprite:
		sprite.modulate = tint

func _draw() -> void:
	if kind in ["m", "pet", "e"] or (kind == "p" and not is_self):
		if hp < mhp or kind == "m":
			var w = 40.0 if rank < 3 else 80.0
			var y = label.position.y + 16
			draw_rect(Rect2(-w / 2, y, w, 4), Color(0, 0, 0, 0.7))
			draw_rect(Rect2(-w / 2, y, w * clampf(hp / mhp, 0, 1), 4), Color(0.9, 0.2, 0.2) if kind == "m" else Color(0.3, 0.9, 0.3))
