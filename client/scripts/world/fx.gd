class_name Fx
extends Node2D
## Hiệu ứng hình ảnh: số sát thương, vùng báo hiệu, nổ, trận pháp, đạn/chém (hình ảnh thuần — kết quả do server tính).

const PATH_COLOR := {"kiem": Color("#c0e0ff"), "dao": Color("#ff9060"), "quyen": Color("#ffd060"), "the": Color("#d0a060"), "phap": Color("#80ff80"), "loi": Color("#b090ff"), "hoa": Color("#ff5030"), "bang": Color("#60e0ff"), "doc": Color("#80d040"), "phu": Color("#f0e070"), "tran": Color("#40c0a0"), "ngu_thu": Color("#e09050"), "co_ban": Color("#ffffff")}
var items: Array = []   # {type, pos, r, t, dur, color, vel, text, crit}
var font: Font

func _ready() -> void:
	font = load("res://assets/fonts/BeVietnamPro-SemiBold.ttf")
	z_index = 50

func color_for(skill_id: String) -> Color:
	var s = GameData.skills.get(skill_id)
	if s == null:
		return Color.WHITE
	if skill_id.begins_with("m_"):
		if "fire" in skill_id or "meteor" in skill_id: return PATH_COLOR.hoa
		if "ice" in skill_id or "freeze" in skill_id: return PATH_COLOR.bang
		if "thunder" in skill_id or "lightning" in skill_id: return PATH_COLOR.loi
		if "spit" in skill_id: return PATH_COLOR.doc
		if "void" in skill_id: return Color("#c060ff")
		return Color("#ff6060")
	return PATH_COLOR.get(s.path, Color.WHITE)

func number(pos: Vector2, v: int, crit: bool, kind := "dmg") -> void:
	var col = Color(1, 0.95, 0.8)
	if kind == "heal": col = Color(0.4, 1, 0.5)
	elif kind == "dot": col = Color(0.9, 0.6, 1)
	elif kind == "self": col = Color(1, 0.35, 0.3)
	if crit: col = Color(1, 0.75, 0.2)
	items.append({"type": "num", "pos": pos + Vector2(randf_range(-10, 10), 0), "t": 0.0, "dur": 0.9, "color": col, "text": ("+" if kind == "heal" else "") + GameData.fmt(v) + ("!" if crit else ""), "crit": crit})

func telegraph(pos: Vector2, r: float, dur: float, col := Color(1, 0.2, 0.2)) -> void:
	items.append({"type": "tele", "pos": pos, "r": r, "t": 0.0, "dur": dur, "color": col})

func boom(pos: Vector2, r: float, col: Color) -> void:
	items.append({"type": "boom", "pos": pos, "r": r, "t": 0.0, "dur": 0.35, "color": col})

func zone(pos: Vector2, r: float, dur: float, col: Color) -> void:
	items.append({"type": "zone", "pos": pos, "r": r, "t": 0.0, "dur": dur, "color": col})

func text(pos: Vector2, s: String, col := Color.WHITE, dur := 1.6) -> void:
	items.append({"type": "num", "pos": pos, "t": 0.0, "dur": dur, "color": col, "text": s, "crit": true})

## Hiệu ứng thi triển kỹ năng theo hình dạng trong dữ liệu (đồng bộ với server)
func skill(caster_pos: Vector2, facing: int, skill_id: String) -> void:
	var s = GameData.skills.get(skill_id)
	if s == null:
		return
	var col = color_for(skill_id)
	var sh: Dictionary = s.shape
	var center = caster_pos + Vector2(0, -30)
	match sh.type:
		"melee":
			items.append({"type": "slash", "pos": center + Vector2(facing * sh.range * 0.5, 0), "r": float(sh.range) * 0.6, "t": 0.0, "dur": 0.18, "color": col, "f": facing})
		"projectile":
			var n = int(sh.get("count", 1))
			for i in n:
				var ang = 0.0
				if n > 1:
					ang = -float(sh.get("spread", 0.5)) / 2 + float(sh.get("spread", 0.5)) * (float(i) / (n - 1))
				var vel = Vector2(cos(ang) * facing, sin(ang)) * float(sh.speed)
				items.append({"type": "proj", "pos": center + Vector2(facing * 20, 0), "r": float(sh.radius), "t": 0.0, "dur": float(sh.range) / float(sh.speed), "color": col, "vel": vel})
		"aoe":
			if float(sh.get("delay", 0)) <= 0:
				boom(center + Vector2(facing * float(sh.offset), 0), float(sh.radius), col)
		"self", "summon":
			items.append({"type": "aura", "pos": caster_pos, "r": 40.0, "t": 0.0, "dur": 0.6, "color": col})
		"dash":
			items.append({"type": "dash", "pos": caster_pos, "r": float(sh.distance), "t": 0.0, "dur": 0.3, "color": col, "f": facing})

func _process(delta: float) -> void:
	var i = items.size() - 1
	while i >= 0:
		var it: Dictionary = items[i]
		it.t += delta
		if it.type == "num":
			it.pos += Vector2(0, -40 * delta)
		elif it.type == "proj":
			it.pos += it.vel * delta
		if it.t >= it.dur:
			items.remove_at(i)
		i -= 1
	queue_redraw()

func _draw() -> void:
	for it in items:
		var k: float = it.t / it.dur
		var c: Color = it.color
		match it.type:
			"num":
				var sz = 22 if it.crit else 16
				var col = Color(c.r, c.g, c.b, 1.0 - max(0.0, k - 0.6) * 2.5)
				draw_string_outline(font, it.pos + Vector2(-30, 0), it.text, HORIZONTAL_ALIGNMENT_CENTER, 60, sz, 4, Color(0, 0, 0, col.a))
				draw_string(font, it.pos + Vector2(-30, 0), it.text, HORIZONTAL_ALIGNMENT_CENTER, 60, sz, col)
			"tele":
				draw_circle(it.pos, it.r, Color(c.r, c.g, c.b, 0.12 + 0.15 * k))
				draw_arc(it.pos, it.r, 0, TAU, 40, Color(c.r, c.g, c.b, 0.8), 2)
				draw_circle(it.pos, it.r * k, Color(c.r, c.g, c.b, 0.25))
			"boom":
				draw_circle(it.pos, it.r * (0.6 + 0.4 * k), Color(c.r, c.g, c.b, 0.55 * (1 - k)))
				draw_arc(it.pos, it.r * (0.7 + 0.5 * k), 0, TAU, 32, Color(1, 1, 1, 0.8 * (1 - k)), 3)
			"zone":
				var pulse = 0.15 + 0.08 * sin(it.t * 8)
				draw_circle(it.pos, it.r, Color(c.r, c.g, c.b, pulse))
				draw_arc(it.pos, it.r, it.t * 2, it.t * 2 + TAU * 0.8, 32, Color(c.r, c.g, c.b, 0.7), 2)
			"slash":
				var f: int = it.f
				var a0 = -1.2 if f > 0 else PI - 1.2
				draw_arc(it.pos - Vector2(f * it.r * 0.3, 0), it.r, a0 + k * 0.6, a0 + 2.0 + k * 0.6, 16, Color(c.r, c.g, c.b, 0.9 * (1 - k)), 5)
			"proj":
				draw_circle(it.pos, max(4.0, it.r * 0.6), Color(c.r, c.g, c.b, 0.9))
				draw_circle(it.pos - it.vel.normalized() * 10, max(3.0, it.r * 0.4), Color(c.r, c.g, c.b, 0.4))
			"aura":
				draw_arc(it.pos + Vector2(0, -30), it.r * (0.5 + k), 0, TAU, 24, Color(c.r, c.g, c.b, 1 - k), 3)
			"dash":
				var f2: int = it.f
				for j in 4:
					draw_line(it.pos + Vector2(-f2 * j * 18, -20 - j * 6), it.pos + Vector2(-f2 * (j * 18 + 30), -20 - j * 6), Color(c.r, c.g, c.b, 0.6 * (1 - k)), 3)
